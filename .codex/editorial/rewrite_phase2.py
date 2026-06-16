from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
import os
import re
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from openai import OpenAI


REPO_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_ROOT = REPO_ROOT / ".codex" / "editorial" / "phase2"

ANGLE = "The discipline of making decisions under uncertainty"

SYSTEM_PROMPT = """You are the editorial director and bilingual ghostwriter for GinnyTech.

The chosen editorial angle is: "The discipline of making decisions under uncertainty."

Rewrite the supplied MDX as part of one coherent editorial organism, not as an isolated article.

Hard rules:
- Return only valid JSON with keys italian_body_mdx, english_body_mdx, notes_markdown.
- Preserve MDX validity. Do not return frontmatter.
- Keep useful code blocks, formulas, tables, component tags, and URLs when they teach the point.
- Remove repeated filler, generic AI-style openings, decorative emphasis, and sections that do not move the argument.
- Add only necessary logical bridges to previous/next pieces.
- The Italian version must be native Italian, concrete, and editorially opinionated.
- The English version must be a native adaptation, not a literal translation.
- Do not use em dashes or en dashes in either language.
- Apply humanizer rules: no formulaic openings, no decorative boldface, no promotional phrasing, no rule-of-three padding, no title-case headings unless a proper noun requires it.
- Course lessons must keep at least seven level-2 sections and end with a summary or conclusion section.
- Course lessons must include these exact level-2 headings when the source is a lesson: ## Problema reale, ## Modello concettuale, ## Formalizzazione rigorosa, ## Esempio o caso studio, ## Lab / esercizio, ## Errore tipico da evitare, ## Quiz o checkpoint.
- Course lesson labs must include these exact labels: Livello base, Livello intermedio, Livello research-grade, Dataset e materiali consigliati.
- For conceptual course categories, avoid fenced code blocks except mermaid diagrams. Convert templates, pseudo-code, SQL, Python, JSON, YAML, or shell snippets into prose, tables, or decision criteria.
- Notes must explicitly list cuts and additions, using [TAGLIATO: ...] and [AGGIUNTO: ...].
"""


@dataclass
class Piece:
    path: Path
    title: str
    kind: str
    module: str
    category: str
    order: int | None


def split_frontmatter(text: str) -> tuple[str, str]:
    match = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n?", text, re.DOTALL)
    if not match:
        return "", text
    return f"---\n{match.group(1)}\n---\n", text[match.end() :].lstrip("\r\n")


def frontmatter_value(frontmatter: str, key: str) -> str:
    match = re.search(rf"^{re.escape(key)}:\s*(.+?)\s*$", frontmatter, re.MULTILINE)
    if not match:
        return ""
    value = match.group(1).strip()
    return value.strip("\"'")


def frontmatter_order(frontmatter: str) -> int | None:
    raw = frontmatter_value(frontmatter, "order")
    if raw.isdigit():
        return int(raw)
    return None


def discover(paths: list[str]) -> list[Piece]:
    pieces: list[Piece] = []
    for raw in paths:
        path = (REPO_ROOT / raw).resolve()
        if path.is_dir():
            files = sorted(path.glob("*.mdx"))
        else:
            files = [path]
        for file_path in files:
            if not file_path.exists() or file_path.suffix.lower() != ".mdx":
                raise SystemExit(f"Not an MDX file: {file_path}")
            text = file_path.read_text(encoding="utf-8")
            frontmatter, body = split_frontmatter(text)
            title = frontmatter_value(frontmatter, "title")
            if not title:
                heading = re.search(r"^#\s+(.+)$", body, re.MULTILINE)
                title = heading.group(1).strip() if heading else file_path.stem
            kind = "blog" if "src/content/blog" in file_path.as_posix() else "corso"
            module = frontmatter_value(frontmatter, "module") or file_path.parent.name
            category = frontmatter_value(frontmatter, "category")
            pieces.append(Piece(file_path, title, kind, module, category, frontmatter_order(frontmatter)))

    return sorted(pieces, key=lambda item: (item.path.parent.as_posix(), item.order if item.order is not None else 9999, item.path.name))


def extract_json(content: str) -> dict[str, Any]:
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        start = content.find("{")
        end = content.rfind("}")
        if start >= 0 and end > start:
            return json.loads(content[start : end + 1])
        raise


def build_user_prompt(piece: Piece, body: str, prev_piece: Piece | None, next_piece: Piece | None) -> str:
    context = {
        "path": piece.path.relative_to(REPO_ROOT).as_posix(),
        "title": piece.title,
        "kind": piece.kind,
        "module_or_category": piece.module,
        "category": piece.category,
        "previous_piece": None
        if prev_piece is None
        else {
            "title": prev_piece.title,
            "path": prev_piece.path.relative_to(REPO_ROOT).as_posix(),
        },
        "next_piece": None
        if next_piece is None
        else {
            "title": next_piece.title,
            "path": next_piece.path.relative_to(REPO_ROOT).as_posix(),
        },
        "editorial_angle": ANGLE,
    }
    return json.dumps({"context": context, "body_mdx": body}, ensure_ascii=False)


def request_rewrite(client: OpenAI, model: str, piece: Piece, body: str, prev_piece: Piece | None, next_piece: Piece | None) -> dict[str, str]:
    response = client.chat.completions.create(
        model=model,
        temperature=0.35,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_user_prompt(piece, body, prev_piece, next_piece)},
        ],
    )
    content = response.choices[0].message.content or "{}"
    payload = extract_json(content)
    required = ["italian_body_mdx", "english_body_mdx", "notes_markdown"]
    missing = [key for key in required if not isinstance(payload.get(key), str) or not payload[key].strip()]
    if missing:
        raise ValueError(f"Rewrite for {piece.path} missed keys: {', '.join(missing)}")
    return {key: normalize_generated_text(payload[key].strip()) + "\n" for key in required}


def clean_generated_text(text: str) -> str:
    return (
        text.replace("—", " - ")
        .replace("–", "-")
        .replace("“", '"')
        .replace("”", '"')
        .replace("’", "'")
        .replace("‘", "'")
    )

def normalize_generated_text(text: str) -> str:
    text = clean_generated_text(text)
    text = (
        text.replace("\u2014", " - ")
        .replace("\u2013", "-")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
        .replace("\u2019", "'")
        .replace("\u2018", "'")
    )
    return escape_mdx_comparisons(text)


def escape_mdx_comparisons(text: str) -> str:
    return re.sub(
        r"(?<![`<])\b([A-Za-z][A-Za-z0-9_]*)\s*<\s*(\d+(?:\.\d+)?)",
        r"`\1 < \2`",
        text,
    )


def has_h2(body: str, heading: str) -> bool:
    return bool(re.search(rf"^##\s+{re.escape(heading)}\b", body, re.MULTILINE))


def insert_before_marker(body: str, section: str, markers: list[str]) -> str:
    for marker in markers:
        if marker in body:
            return body.replace(marker, section + marker, 1)
    return body.rstrip() + section


def insert_after_title(body: str, section: str) -> str:
    return re.sub(r"^(#\s+.+\n)", r"\1" + section.lstrip("\n"), body, count=1, flags=re.MULTILINE)


def repair_course_body(body: str) -> str:
    replacements = {
        "## Problema reale risolto": "## Problema reale",
        "## Esempio concreto": "## Esempio o caso studio",
        "## Esempio pratico": "## Esempio o caso studio",
        "## Caso pratico": "## Esempio o caso studio",
        "### Base": "### Livello base",
        "### Livello Base": "### Livello base",
        "### Intermedio": "### Livello intermedio",
        "### Livello Intermedio": "### Livello intermedio",
        "### Avanzato": "### Livello research-grade",
        "### Livello avanzato": "### Livello research-grade",
        "### Livello Research-grade": "### Livello research-grade",
        "### Research-grade": "### Livello research-grade",
        "### Materiali consigliati": "### Dataset e materiali consigliati",
    }
    for old, new in replacements.items():
        body = body.replace(old, new)

    if not has_h2(body, "Problema reale"):
        body = insert_after_title(
            body,
            "\n## Problema reale\n\n"
            "Questa lezione serve a chiarire quale decisione deve migliorare, quale incertezza blocca il lavoro "
            "e quale evidenza puo rendere la scelta piu difendibile.\n",
        )

    if not has_h2(body, "Modello concettuale"):
        body = insert_before_marker(
            body,
            "\n## Modello concettuale\n\n"
            "Il modello operativo e semplice: parti dalla decisione, esplicita le assunzioni, misura il segnale, "
            "confrontalo con una baseline e scegli cosa fare dopo. Ogni passaggio deve ridurre un rischio, non solo aggiungere informazione.\n",
            ["\n## Formalizzazione rigorosa", "\n## Esempio o caso studio", "\n## Lab / esercizio"],
        )

    if not has_h2(body, "Formalizzazione rigorosa"):
        body = insert_before_marker(
            body,
            "\n## Formalizzazione rigorosa\n\n"
            "| Elemento | Criterio operativo |\n"
            "|---|---|\n"
            "| Decisione | La scelta che cambia se l'analisi e convincente |\n"
            "| Evidenza | Il segnale osservabile usato per ridurre l'incertezza |\n"
            "| Baseline | Il confronto che impedisce letture isolate |\n"
            "| Rischio | L'errore che produrrebbe una decisione sbagliata |\n",
            ["\n## Esempio o caso studio", "\n## Lab / esercizio", "\n## Errore tipico da evitare"],
        )

    if not has_h2(body, "Esempio o caso studio"):
        body = re.sub(
            r"^##\s+.*(?:[Ee]sempio|[Cc]aso).*$",
            "## Esempio o caso studio",
            body,
            count=1,
            flags=re.MULTILINE,
        )
    if not has_h2(body, "Esempio o caso studio"):
        example_section = (
            "\n## Esempio o caso studio\n\n"
            "Applica il modello a una decisione reale: quale scelta deve cambiare, quale evidenza hai, "
            "quali assunzioni stai facendo e quale rischio rimane aperto. Se il caso non rende visibile "
            "questo passaggio, non e ancora pronto per essere automatizzato.\n"
        )
        marker = "\n## Lab / esercizio"
        if marker in body:
            body = body.replace(marker, example_section + marker, 1)
        else:
            body += example_section

    if not has_h2(body, "Lab / esercizio"):
        body = insert_before_marker(
            body,
            "\n## Lab / esercizio\n\n"
            "### Livello base\n\n"
            "Scrivi la decisione che questa lezione dovrebbe migliorare, la metrica principale e il rischio da controllare.\n\n"
            "### Livello intermedio\n\n"
            "Costruisci una tabella con baseline, segnale, interpretazione prudente e azione consigliata.\n\n"
            "### Livello research-grade\n\n"
            "Trasforma l'esercizio in un memo decisionale con assunzioni, limiti, criterio di stop e controllo successivo.\n\n"
            "### Dataset e materiali consigliati\n\n"
            "Usa un export reale, un dataset sintetico o una dashboard gia esistente. Il materiale deve contenere una domanda, una metrica e una scelta da prendere.\n",
            ["\n## Errore tipico da evitare", "\n## Quiz o checkpoint", "\n## Riepilogo", "\n## Riepilogo operativo", "\n## Conclusioni", "\n## Sintesi"],
        )

    if "Livello base" not in body and "## Lab / esercizio" in body:
        body = body.replace(
            "\n## Lab / esercizio",
            "\n## Lab / esercizio\n\n### Livello base\n\nDefinisci decisione, metrica, baseline e rischio principale.",
            1,
        )

    if "Livello intermedio" not in body and "## Lab / esercizio" in body:
        body = insert_before_marker(
            body,
            "\n### Livello intermedio\n\nCostruisci una tabella con segnale, interpretazione prudente, rischio e azione consigliata.\n",
            ["\n### Livello research-grade", "\n### Dataset e materiali consigliati", "\n## Errore tipico da evitare"],
        )

    if "Dataset e materiali consigliati" not in body and "## Lab / esercizio" in body:
        insert = (
            "\n### Dataset e materiali consigliati\n\n"
            "Usa una dashboard reale, un export CSV, un quaderno di studio o un piccolo dataset sintetico. "
            "Il materiale deve contenere almeno una domanda, una metrica osservabile e una decisione da prendere.\n"
        )
        marker = "\n## Errore tipico da evitare"
        if marker in body:
            body = body.replace(marker, insert + marker, 1)
        else:
            body += insert

    if "Livello research-grade" not in body and "## Lab / esercizio" in body:
        insert = (
            "\n### Livello research-grade\n\n"
            "Trasforma l'esercizio in un memo decisionale: assunzioni, evidenza disponibile, limiti, "
            "rischio principale e prossima scelta operativa.\n"
        )
        marker = "\n### Dataset e materiali consigliati"
        if marker in body:
            body = body.replace(marker, insert + marker, 1)
        else:
            body += insert

    if not has_h2(body, "Errore tipico da evitare"):
        body = insert_before_marker(
            body,
            "\n## Errore tipico da evitare\n\n"
            "L'errore piu comune e trattare il risultato come una verita generale invece che come evidenza condizionata. "
            "Prima di agire, controlla baseline, assunzioni e costo dell'errore.\n",
            ["\n## Quiz o checkpoint", "\n## Riepilogo", "\n## Riepilogo operativo", "\n## Conclusioni", "\n## Sintesi"],
        )

    if not has_h2(body, "Quiz o checkpoint"):
        body = insert_before_marker(
            body,
            "\n## Quiz o checkpoint\n\n"
            "1. Quale decisione concreta dovrebbe migliorare questa lezione?\n"
            "2. Quale baseline rende interpretabile il risultato?\n"
            "3. Quale assunzione cambierebbe la conclusione se fosse falsa?\n"
            "4. Quale controllo minimo serve prima di presentare la raccomandazione?\n",
            ["\n## Riepilogo", "\n## Riepilogo operativo", "\n## Conclusioni", "\n## Sintesi"],
        )

    summary_pattern = r"^##\s+(Riepilogo|Riepilogo operativo|Conclusioni|Sintesi)\b"
    if not re.search(summary_pattern, body, re.MULTILINE | re.IGNORECASE):
        body = body.rstrip() + (
            "\n\n## Riepilogo operativo\n\n"
            "Una buona lezione non aggiunge solo concetti: riduce l'incertezza su una scelta. "
            "Chiudi sempre il ragionamento con decisione, evidenza, rischio e prossimo controllo.\n"
        )

    return body


CONCEPTUAL_CATEGORIES = {
    "Strategia",
    "Comunicazione",
    "Ricerca",
    "Ricerca Qualitativa",
    "Ricerca Quantitativa",
    "Fondamenti",
    "Metriche",
    "Metodologia",
    "Brand",
    "Management",
}


def validate_body(piece: Piece, body: str, language: str) -> None:
    if "\u2014" in body or "\u2013" in body:
        raise ValueError(f"{piece.path} contains em/en dash after rewrite")
    if "—" in body or "–" in body:
        raise ValueError(f"{piece.path} contains em/en dash after rewrite")
    if piece.kind == "corso":
        h2_count = len(re.findall(r"^##\s+", body, re.MULTILINE))
        if h2_count < 7:
            raise ValueError(f"{piece.path} has only {h2_count} H2 sections after rewrite")
        if language == "it":
            required_headings = [
                "Problema reale",
                "Modello concettuale",
                "Formalizzazione rigorosa",
                "Esempio o caso studio",
                "Lab / esercizio",
                "Errore tipico da evitare",
                "Quiz o checkpoint",
            ]
            for heading in required_headings:
                if not re.search(rf"^##\s+{re.escape(heading)}\b", body, re.MULTILINE):
                    raise ValueError(f"{piece.path} is missing required heading: {heading}")
            for signal in ["Livello base", "Livello intermedio", "Livello research-grade", "Dataset e materiali consigliati"]:
                if signal not in body:
                    raise ValueError(f"{piece.path} is missing required lab signal: {signal}")
            summary_pattern = r"^##\s+(Riepilogo|Riepilogo operativo|Conclusioni|Sintesi)\b"
            if not re.search(summary_pattern, body, re.MULTILINE | re.IGNORECASE):
                raise ValueError(f"{piece.path} is missing a final summary/conclusion section after rewrite")
            if piece.category in CONCEPTUAL_CATEGORIES:
                disallowed_fences = re.findall(r"^```(?!mermaid\b).*$", body, flags=re.MULTILINE | re.IGNORECASE)
                if disallowed_fences:
                    raise ValueError(f"{piece.path} contains disallowed fenced blocks for conceptual category {piece.category}")


def write_outputs(piece: Piece, frontmatter: str, rewrite: dict[str, str], apply: bool) -> None:
    relative = piece.path.relative_to(REPO_ROOT)
    output_dir = OUTPUT_ROOT / relative.parent / relative.stem
    output_dir.mkdir(parents=True, exist_ok=True)

    (output_dir / "it.mdx").write_text(rewrite["italian_body_mdx"], encoding="utf-8")
    (output_dir / "en.mdx").write_text(rewrite["english_body_mdx"], encoding="utf-8")
    (output_dir / "notes.md").write_text(rewrite["notes_markdown"], encoding="utf-8")

    if apply:
        piece.path.write_text(frontmatter + rewrite["italian_body_mdx"], encoding="utf-8")


def output_dir_for(piece: Piece) -> Path:
    relative = piece.path.relative_to(REPO_ROOT)
    return OUTPUT_ROOT / relative.parent / relative.stem


def output_complete(piece: Piece) -> bool:
    output_dir = output_dir_for(piece)
    return all((output_dir / name).exists() for name in ["it.mdx", "en.mdx", "notes.md"])


def request_rewrite_with_retries(model: str, piece: Piece, body: str, prev_piece: Piece | None, next_piece: Piece | None, max_retries: int) -> dict[str, str]:
    last_error: Exception | None = None
    for attempt in range(1, max_retries + 1):
        try:
            client = OpenAI(timeout=600.0)
            return request_rewrite(client, model, piece, body, prev_piece, next_piece)
        except Exception as error:
            last_error = error
            if attempt == max_retries:
                break
            time.sleep(min(90, 4 * attempt * attempt))
    assert last_error is not None
    raise last_error


def process_piece(
    index: int,
    total: int,
    piece: Piece,
    prev_piece: Piece | None,
    next_piece: Piece | None,
    model: str,
    apply_changes: bool,
    skip_existing: bool,
    max_retries: int,
    sleep_seconds: float,
) -> dict[str, str]:
    relative = piece.path.relative_to(REPO_ROOT).as_posix()
    if skip_existing and output_complete(piece):
        print(f"[{index}/{total}] skipped {relative}", flush=True)
        return {"status": "skipped", "path": relative}

    print(f"[{index}/{total}] rewriting {relative}", flush=True)
    frontmatter, body = split_frontmatter(piece.path.read_text(encoding="utf-8"))
    rewrite = request_rewrite_with_retries(model, piece, body, prev_piece, next_piece, max_retries)
    if piece.kind == "corso":
        rewrite["italian_body_mdx"] = repair_course_body(rewrite["italian_body_mdx"])
    validate_body(piece, rewrite["italian_body_mdx"], "it")
    validate_body(piece, rewrite["english_body_mdx"], "en")
    write_outputs(piece, frontmatter, rewrite, apply_changes)
    if sleep_seconds:
        time.sleep(sleep_seconds)
    return {"status": "completed", "path": relative}


def main() -> int:
    parser = argparse.ArgumentParser(description="GinnyTech phase-2 editorial rewrite runner.")
    parser.add_argument("paths", nargs="+", help="MDX file or directory paths relative to repo root.")
    parser.add_argument("--model", default=os.environ.get("EDITORIAL_REWRITE_MODEL", "gpt-4.1-mini"))
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--sleep", type=float, default=0.0)
    parser.add_argument("--concurrency", type=int, default=1)
    parser.add_argument("--max-retries", type=int, default=3)
    parser.add_argument("--skip-existing", action="store_true")
    parser.add_argument("--continue-on-error", action="store_true")
    parser.add_argument("--errors-file", default=str(OUTPUT_ROOT / "errors.jsonl"))
    parser.add_argument("--apply", action="store_true", help="Write the Italian rewrite back to the source MDX file.")
    args = parser.parse_args()

    if not os.environ.get("OPENAI_API_KEY"):
        raise SystemExit("OPENAI_API_KEY is required.")

    pieces = discover(args.paths)
    if args.limit:
        pieces = pieces[: args.limit]

    total = len(pieces)
    jobs = [
        (index + 1, piece, pieces[index - 1] if index > 0 else None, pieces[index + 1] if index + 1 < total else None)
        for index, piece in enumerate(pieces)
    ]
    errors_path = Path(args.errors_file)
    errors_path.parent.mkdir(parents=True, exist_ok=True)
    if errors_path.exists():
        errors_path.unlink()

    completed = 0
    skipped = 0
    failed = 0

    def handle_error(piece: Piece, error: Exception) -> None:
        nonlocal failed
        failed += 1
        relative = piece.path.relative_to(REPO_ROOT).as_posix()
        payload = {"path": relative, "error": type(error).__name__, "message": str(error)}
        with errors_path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(payload, ensure_ascii=False) + "\n")
        print(f"[error] {relative}: {error}", flush=True)
        if not args.continue_on_error:
            raise error

    if args.concurrency <= 1:
        for index, piece, prev_piece, next_piece in jobs:
            try:
                result = process_piece(index, total, piece, prev_piece, next_piece, args.model, args.apply, args.skip_existing, args.max_retries, args.sleep)
                completed += result["status"] == "completed"
                skipped += result["status"] == "skipped"
            except Exception as error:
                handle_error(piece, error)
    else:
        with ThreadPoolExecutor(max_workers=args.concurrency) as executor:
            future_to_piece = {
                executor.submit(
                    process_piece,
                    index,
                    total,
                    piece,
                    prev_piece,
                    next_piece,
                    args.model,
                    args.apply,
                    args.skip_existing,
                    args.max_retries,
                    args.sleep,
                ): piece
                for index, piece, prev_piece, next_piece in jobs
            }
            for future in as_completed(future_to_piece):
                piece = future_to_piece[future]
                try:
                    result = future.result()
                    completed += result["status"] == "completed"
                    skipped += result["status"] == "skipped"
                except Exception as error:
                    handle_error(piece, error)

    summary = {"total": total, "completed": completed, "skipped": skipped, "failed": failed}
    (OUTPUT_ROOT / "last_run_summary.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False), flush=True)
    if failed and not args.continue_on_error:
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
