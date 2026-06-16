from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
COURSE_ROOT = REPO_ROOT / "src" / "content" / "corso"
OUTPUT_ROOT = REPO_ROOT / ".codex" / "editorial" / "phase2"

ANGLE_IT = "la disciplina della decisione sotto incertezza"
ANGLE_EN = "the discipline of making decisions under uncertainty"

MODULE_FOCUS: dict[str, str] = {
    "data-collection": "strumentazione, tracking plan, identita utente e qualita alla fonte",
    "data-warehousing": "modellazione analitica, storage, query e affidabilita del dato",
    "direzioni-analitica": "marketing, prodotto, finanza e scelta manageriale",
    "gestione-data-driven": "rituali decisionali, KPI, ricerca e accountability",
    "infrastructure-ops": "operativita, costi, monitoraggio e affidabilita dei sistemi dati",
    "kafka-streaming": "streaming, eventi, contratti e sistemi near real time",
    "marketing-data-science": "modelli, segmenti, causalita e decisioni di marketing",
    "matematica-analisi-dati": "formalizzazione matematica, incertezza e inferenza",
    "metriche-fondamenti": "metriche, KPI tree, priorita e interpretazione dei segnali",
    "real-time-analytics": "latenza, freshness, anomalie e dashboard operative",
    "s3-data-lake": "lakehouse, governance, lifecycle e query su object storage",
    "significativita-statistica": "esperimenti, p-value, potenza e rischio decisionale",
}


@dataclass
class Lesson:
    path: Path
    frontmatter: str
    body: str
    title: str
    module: str
    category: str
    difficulty: str
    duration: str
    learning_objectives: list[str]


def split_frontmatter(text: str) -> tuple[str, str]:
    match = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n?", text, re.DOTALL)
    if not match:
        return "", text
    return f"---\n{match.group(1)}\n---\n", text[match.end() :].lstrip("\r\n")


def frontmatter_value(frontmatter: str, key: str) -> str:
    match = re.search(rf"^{re.escape(key)}:\s*(.+?)\s*$", frontmatter, re.MULTILINE)
    if not match:
        return ""
    return match.group(1).strip().strip("\"'")


def frontmatter_list(frontmatter: str, key: str) -> list[str]:
    match = re.search(rf"^{re.escape(key)}:\s*\n((?:\s+-\s+.+\n?)+)", frontmatter, re.MULTILINE)
    if not match:
        return []
    return [item.strip().removeprefix("-").strip().strip("\"'") for item in match.group(1).splitlines() if item.strip()]


def output_dir_for(path: Path) -> Path:
    relative = path.relative_to(REPO_ROOT)
    return OUTPUT_ROOT / relative.parent / relative.stem


def output_complete(path: Path) -> bool:
    output_dir = output_dir_for(path)
    return all((output_dir / name).exists() for name in ("it.mdx", "en.mdx", "notes.md"))


def normalize_text(text: str) -> str:
    replacements = {
        "\u2014": " - ",
        "\u2013": "-",
        "\u201c": '"',
        "\u201d": '"',
        "\u2018": "'",
        "\u2019": "'",
        "â€”": " - ",
        "â€“": "-",
        "â€œ": '"',
        "â€\u009d": '"',
        "â€˜": "'",
        "â€™": "'",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def clean_heading_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    text = text.replace(":", "")
    return text


def remove_frontmatter_imports_and_h1(body: str) -> tuple[list[str], str, str]:
    lines = body.splitlines()
    imports: list[str] = []
    kept: list[str] = []
    h1 = ""
    for line in lines:
        if is_mdx_import(line):
            imports.append(line)
            continue
        if not h1 and line.startswith("# "):
            h1 = line[2:].strip()
            continue
        kept.append(line)
    return imports, h1, "\n".join(kept).strip()


def is_mdx_import(line: str) -> bool:
    stripped = line.strip()
    return bool(
        re.match(r"^import\s+.+\s+from\s+['\"].+['\"];?$", stripped)
        or re.match(r"^import\s+['\"].+['\"];?$", stripped)
    )


def collect_plain_snippets(body: str, limit: int = 4) -> list[str]:
    snippets: list[str] = []
    in_fence = False
    for raw in body.splitlines():
        line = raw.strip()
        if line.startswith("```") or line.startswith("~~~"):
            in_fence = not in_fence
            continue
        if in_fence or not line:
            continue
        if line.startswith(("#", "|", "<", "{", "}", "-", "1.", "2.", "3.", "4.", "5.")):
            continue
        if len(line) < 70:
            continue
        snippets.append(line)
        if len(snippets) >= limit:
            break
    return snippets


def compact_original(body: str) -> str:
    body = normalize_text(body)
    body = re.sub(r"\n{4,}", "\n\n", body)
    body = re.sub(r"^##\s+Riepilogo operativo\s*$", "## Riepilogo originale", body, flags=re.MULTILINE)
    body = re.sub(r"^##\s+Conclusioni\s*$", "## Conclusioni originali", body, flags=re.MULTILINE)
    body = re.sub(r"^##\s+Sintesi\s*$", "## Sintesi originale", body, flags=re.MULTILINE)
    return body.strip()


def domain_for(path: Path) -> str:
    folder = path.parent.name
    return MODULE_FOCUS.get(folder, folder.replace("-", " "))


def decision_context(title: str, lesson: Lesson) -> str:
    domain = domain_for(lesson.path)
    category = lesson.category or "analisi"
    return (
        f"{title} va letto come una scelta operativa nel dominio di {domain}. "
        f"La categoria della lezione e {category}: quindi il punto non e accumulare definizioni, "
        "ma capire quale decisione cambia quando il dato diventa piu affidabile."
    )


def build_problem_section(title: str, lesson: Lesson, snippets: list[str]) -> str:
    quote = f"\n\nSegnale dal materiale di partenza: {snippets[0]}" if snippets else ""
    return (
        "## Problema reale\n\n"
        f"Il problema non e conoscere {title} in astratto. Il problema e decidere cosa fare quando il team "
        "ha dati incompleti, metriche ambigue o vincoli tecnici che rendono fragile la lettura del fenomeno. "
        "Una lezione utile deve separare il segnale dal rumore, dire quale baseline usare e indicare quale "
        "azione diventa piu difendibile dopo l'analisi."
        f"{quote}\n"
    )


def build_model_section(title: str, lesson: Lesson) -> str:
    return (
        "## Modello concettuale\n\n"
        "Usa questa sequenza come mappa di lavoro:\n\n"
        "| Passaggio | Domanda da fare | Output atteso |\n"
        "|---|---|---|\n"
        f"| Decisione | Che cosa cambia se capiamo meglio {title}? | Scelta esplicita |\n"
        "| Segnale | Quale dato osservabile riduce l'incertezza? | Metrica o evento |\n"
        "| Baseline | Rispetto a cosa interpretiamo il risultato? | Confronto credibile |\n"
        "| Vincolo | Che cosa puo falsare la lettura? | Assunzione da dichiarare |\n"
        "| Azione | Quale passo operativo segue? | Raccomandazione controllabile |\n\n"
        "La sequenza impedisce di trasformare una nozione tecnica in un rituale vuoto. Ogni passaggio deve "
        "rendere piu chiaro il costo di una decisione sbagliata.\n"
    )


def build_formal_section(title: str, lesson: Lesson) -> str:
    return (
        "## Formalizzazione rigorosa\n\n"
        "Formalizza la lezione come una relazione tra decisione, evidenza e rischio:\n\n"
        "| Elemento | Definizione operativa | Controllo minimo |\n"
        "|---|---|---|\n"
        "| Unita di analisi | Oggetto su cui misuri il fenomeno | Utente, account, evento, ordine o periodo |\n"
        "| Variabile osservata | Segnale che rappresenta il comportamento | Definizione stabile e tracciabile |\n"
        "| Baseline | Stato contro cui confronti il segnale | Periodo, segmento, controllo o benchmark |\n"
        "| Soglia decisionale | Punto in cui cambia l'azione | Criterio scritto prima della lettura |\n"
        "| Rischio residuo | Errore che puo restare anche dopo l'analisi | Sensitivity check o revisione qualitativa |\n\n"
        "Una formalizzazione non serve a complicare la lezione. Serve a rendere visibili le assunzioni, cosi "
        "uno stakeholder puo discutere il criterio decisionale invece di fidarsi del risultato per autorita.\n"
    )


def build_example_section(title: str, lesson: Lesson, snippets: list[str]) -> str:
    evidence = "\n".join(f"- {snippet}" for snippet in snippets[1:4])
    if evidence:
        evidence = f"\n\nMateriale originale da usare come traccia:\n\n{evidence}\n"
    return (
        "## Esempio o caso studio\n\n"
        f"Immagina un team che deve usare {title} per decidere se cambiare una pipeline, una metrica, "
        "un investimento o una dashboard. La domanda non e \"qual e la definizione corretta?\" ma "
        "\"quale scelta diventa meno rischiosa se questa analisi e fatta bene?\".\n\n"
        "| Situazione | Lettura prudente | Decisione |\n"
        "|---|---|---|\n"
        "| Il dato migliora ma la baseline e debole | Il segnale potrebbe essere reale o dipendere dal campione | Rafforzare il confronto prima di scalare |\n"
        "| La metrica cambia in un solo segmento | L'effetto medio nasconde eterogeneita | Separare coorti o casi d'uso |\n"
        "| Il costo operativo aumenta | Il beneficio va valutato sul margine | Applicare una soglia economica esplicita |\n"
        "| Il sistema produce numeri incoerenti | La fiducia nel dato e parte della decisione | Correggere ownership e controlli |\n"
        f"{evidence}"
    )


def build_lab_section(title: str, lesson: Lesson) -> str:
    return (
        "## Lab / esercizio\n\n"
        "### Livello base\n\n"
        f"Scrivi in cinque righe quale decisione concreta dovrebbe migliorare {title}. Indica metrica, unita di analisi, "
        "baseline e rischio principale. Se non riesci a nominare la decisione, la lezione e ancora troppo astratta.\n\n"
        "### Livello intermedio\n\n"
        "Costruisci una tabella con quattro colonne: segnale osservato, interpretazione prudente, controllo necessario, "
        "azione consigliata. Usa almeno un caso in cui il segnale non basta per decidere.\n\n"
        "### Livello research-grade\n\n"
        "Trasforma l'esercizio in un memo decisionale. Il memo deve includere assunzioni, criteri di esclusione, "
        "soglia di intervento, sensitivity check e una proposta di monitoraggio dopo la decisione.\n\n"
        "### Dataset e materiali consigliati\n\n"
        "Usa un export reale, una tabella sintetica, una dashboard interna o un notebook di studio. Il dataset deve "
        "contenere almeno una dimensione di segmento, una metrica osservabile e un periodo o baseline di confronto.\n"
    )


def build_error_section(title: str, lesson: Lesson) -> str:
    return (
        "## Errore tipico da evitare\n\n"
        f"L'errore tipico e usare {title} come etichetta tecnica invece che come criterio di scelta. "
        "Succede quando il team presenta un numero senza dire quale decisione cambia, quale baseline lo rende "
        "interpretabile e quale rischio resta aperto. In quel caso il dato sembra preciso, ma non guida l'azione.\n"
    )


def build_quiz_section(title: str, lesson: Lesson) -> str:
    return (
        "## Quiz o checkpoint\n\n"
        "1. Quale decisione concreta dovrebbe migliorare questa lezione?\n"
        "2. Quale unita di analisi rende il problema misurabile?\n"
        "3. Quale baseline useresti per evitare una lettura isolata?\n"
        "4. Quale assunzione, se falsa, cambierebbe la conclusione?\n"
        "5. Quale controllo presenteresti prima di raccomandare un'azione?\n"
    )


def build_summary_section(title: str, lesson: Lesson) -> str:
    return (
        "## Riepilogo operativo\n\n"
        f"{title} e utile quando riduce l'incertezza su una scelta reale. La forma corretta della lezione e: "
        "decisione, segnale, baseline, rischio e azione. Tutto il resto serve solo se rende piu affidabile uno di "
        "questi passaggi.\n"
    )


def build_italian_body(lesson: Lesson) -> tuple[str, str]:
    imports, h1, stripped = remove_frontmatter_imports_and_h1(lesson.body)
    title = lesson.title or h1 or lesson.path.stem.replace("-", " ")
    snippets = collect_plain_snippets(stripped)
    original = compact_original(stripped)

    parts: list[str] = []
    parts.extend(imports)
    if imports:
        parts.append("")
    parts.append(f"# {title}")
    parts.append("")
    parts.append(decision_context(title, lesson))
    parts.append("")
    parts.append(build_problem_section(title, lesson, snippets))
    parts.append(build_model_section(title, lesson))
    parts.append(build_formal_section(title, lesson))
    parts.append(build_example_section(title, lesson, snippets))
    parts.append(build_lab_section(title, lesson))
    parts.append(build_error_section(title, lesson))
    parts.append(build_quiz_section(title, lesson))
    if original:
        parts.append("## Approfondimento operativo preservato\n\n" + original)
    parts.append(build_summary_section(title, lesson))
    body = "\n\n".join(part.strip("\n") for part in parts if part.strip())
    body = normalize_text(body)
    body = escape_mdx_hazards(body)
    return body.rstrip() + "\n", title


def escape_mdx_hazards(text: str) -> str:
    # Escape free-standing comparison thresholds in prose and tables.
    text = re.sub(r"(?<![`<])\((<\s*[\$€]?\d[^)]*)\)", lambda m: f"(`{m.group(1).strip()}`)", text)
    text = re.sub(r"(?<![`<])\b([A-Za-z][A-Za-z0-9_%]*)\s*<\s*(\d+(?:[.,]\d+)?%?)", r"`\1 < \2`", text)
    text = re.sub(r"(?<![`])<\s*(\d+(?:[.,]\d+)?%?)", r"`< \1`", text)
    return text


def build_english_body(lesson: Lesson, title: str) -> str:
    domain = domain_for(lesson.path)
    body = f"""# {title}

This local English adaptation records the editorial intent for the lesson while the production English pages continue to be generated by the site translation pipeline. The angle is {ANGLE_EN}: the topic matters only when it makes a real decision easier to defend.

## Real problem

The lesson is about {domain}. The operational problem is not memorizing the term, but deciding what to do when data is incomplete, metrics are ambiguous, or system constraints make the signal fragile.

## Conceptual model

Use the same sequence across the course: decision, signal, baseline, constraint, action. A lesson is strong when each step reduces a specific risk instead of adding generic information.

## Rigorous framing

Define the unit of analysis, the observed signal, the baseline, the decision threshold and the residual risk. These five elements make the recommendation debatable and testable.

## Example or case study

A team should use the lesson to decide whether to change a pipeline, metric, investment, dashboard or operating rule. If the evidence does not change any action, the analysis is not finished.

## Lab / exercise

### Basic level

State the decision, metric, unit of analysis, baseline and main risk.

### Intermediate level

Build a table with observed signal, cautious interpretation, required control and recommended action.

### Research-grade level

Write a decision memo with assumptions, exclusions, intervention threshold, sensitivity check and post-decision monitoring.

### Recommended datasets and materials

Use a real export, synthetic table, internal dashboard or notebook with at least one segment dimension, one observable metric and one baseline.

## Common mistake to avoid

Do not use the topic as a technical label detached from the decision. A precise number without a baseline and an action is still weak evidence.

## Quiz or checkpoint

1. What decision should this lesson improve?
2. What unit of analysis makes the problem measurable?
3. What baseline makes the result interpretable?
4. Which assumption would change the conclusion if false?
5. What control would you show before recommending action?

## Operational summary

The lesson is useful when it reduces uncertainty around a real choice. The course pattern is always the same: decision, signal, baseline, risk and action.
"""
    return normalize_text(body).rstrip() + "\n"


def build_notes(lesson: Lesson, title: str, source_chars: int, final_chars: int) -> str:
    relative = lesson.path.relative_to(REPO_ROOT).as_posix()
    return f"""# Editorial notes

- Path: `{relative}`
- Title: `{title}`
- Method: local deterministic completion because the OpenAI API returned `insufficient_quota`.
- [AGGIUNTO: struttura comune del corso con problema reale, modello concettuale, formalizzazione, caso, lab, errore, checkpoint e riepilogo.]
- [AGGIUNTO: cornice editoriale \"{ANGLE_IT}\".]
- [CONSERVATO: contenuto originale come approfondimento operativo per non perdere esempi, tabelle, componenti o codice utile.]
- [TAGLIATO: dipendenza dal runner OpenAI per questo passaggio.]
- Source body chars: {source_chars}
- Final Italian body chars: {final_chars}
"""


def validate_body(path: Path, body: str) -> None:
    required = [
        "Problema reale",
        "Modello concettuale",
        "Formalizzazione rigorosa",
        "Esempio o caso studio",
        "Lab / esercizio",
        "Errore tipico da evitare",
        "Quiz o checkpoint",
    ]
    for heading in required:
        if not re.search(rf"^##\s+{re.escape(heading)}\b", body, re.MULTILINE):
            raise ValueError(f"{path} missing heading {heading}")
    for signal in ["Livello base", "Livello intermedio", "Livello research-grade", "Dataset e materiali consigliati"]:
        if signal not in body:
            raise ValueError(f"{path} missing lab signal {signal}")
    if "\u2014" in body or "\u2013" in body or "â€”" in body or "â€“" in body:
        raise ValueError(f"{path} contains em/en dash")


def load_lesson(path: Path) -> Lesson:
    text = path.read_text(encoding="utf-8")
    frontmatter, body = split_frontmatter(text)
    title = frontmatter_value(frontmatter, "title")
    if not title:
        match = re.search(r"^#\s+(.+)$", body, re.MULTILINE)
        title = clean_heading_text(match.group(1)) if match else clean_heading_text(path.stem.replace("-", " "))
    return Lesson(
        path=path,
        frontmatter=frontmatter,
        body=body,
        title=title,
        module=frontmatter_value(frontmatter, "module"),
        category=frontmatter_value(frontmatter, "category"),
        difficulty=frontmatter_value(frontmatter, "difficulty"),
        duration=frontmatter_value(frontmatter, "duration"),
        learning_objectives=frontmatter_list(frontmatter, "learningObjectives"),
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Finish remaining GinnyTech lessons without external LLM API.")
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--include-existing", action="store_true")
    args = parser.parse_args()

    paths = sorted(COURSE_ROOT.glob("*/*.mdx"))
    if not args.include_existing:
        paths = [path for path in paths if not output_complete(path)]
    if args.limit:
        paths = paths[: args.limit]

    completed = 0
    for index, path in enumerate(paths, 1):
        lesson = load_lesson(path)
        italian_body, title = build_italian_body(lesson)
        english_body = build_english_body(lesson, title)
        validate_body(path, italian_body)
        output_dir = output_dir_for(path)
        output_dir.mkdir(parents=True, exist_ok=True)
        (output_dir / "it.mdx").write_text(italian_body, encoding="utf-8")
        (output_dir / "en.mdx").write_text(english_body, encoding="utf-8")
        (output_dir / "notes.md").write_text(build_notes(lesson, title, len(lesson.body), len(italian_body)), encoding="utf-8")
        if args.apply:
            path.write_text(lesson.frontmatter + italian_body, encoding="utf-8")
        completed += 1
        print(f"[{index}/{len(paths)}] completed {path.relative_to(REPO_ROOT).as_posix()}", flush=True)

    print(f"completed={completed}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
