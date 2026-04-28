from __future__ import annotations

import csv
import re
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import List

REQUIRED_FIELDS = [
    "title",
    "description",
    "module",
    "order",
    "category",
    "difficulty",
    "duration",
    "prerequisites",
    "learningObjectives",
]

THEORETICAL_SIGNALS = {
    "strategia",
    "comunicazione",
    "ricerca",
    "ricerca qualitativa",
    "ricerca quantitativa",
    "fondamenti",
    "metriche",
    "metodologia",
    "brand",
    "management",
}

CONCEPTUAL_FOLDERS = {
    "panoramica",
    "data-collection",
    "metriche-fondamenti",
    "gestione-data-driven",
    "analisi-prodotto",
    "analisi-marketing",
    "dashboard-visualizzazione",
    "marketing-data-science",
    "direzioni-analitica",
    "filosofia-analisi-dati",
}

SUMMARY_PATTERNS = [
    r"(?im)^##\s+conclus",
    r"(?im)^##\s+riepil",
    r"(?im)^##\s+summary",
    r"(?im)^##\s+recap",
]


@dataclass
class LessonAudit:
    module_slug: str
    lesson_slug: str
    path: str
    category: str
    words: int
    missing_fields: List[str]
    disallowed_fences: int
    has_summary: bool
    recommendation_priority: str
    migliorare: str
    eliminare: str
    riscrivere: str
    aggiungere: str
    rationale: str


def split_frontmatter(text: str) -> tuple[str, str]:
    if not text.startswith("---"):
        return "", text
    parts = text.split("---", 2)
    if len(parts) < 3:
        return "", text
    return parts[1], parts[2]


def field_present(frontmatter: str, field: str) -> bool:
    if field in {"prerequisites", "learningObjectives"}:
        return bool(re.search(rf"(?m)^{re.escape(field)}:\s*(?:\[\]|$)", frontmatter) or re.search(rf"(?m)^{re.escape(field)}:\s*\n(?:\s*-\s*.+\n?)+", frontmatter))
    return bool(re.search(rf"(?m)^{re.escape(field)}:\s*(.+)$", frontmatter))


def extract_field(frontmatter: str, field: str) -> str:
    m = re.search(rf"(?m)^{re.escape(field)}:\s*(.+)$", frontmatter)
    if not m:
        return ""
    v = m.group(1).strip()
    if len(v) >= 2 and v[0] == v[-1] and v[0] in {"'", '"'}:
        return v[1:-1].strip()
    return v


def count_words(body: str) -> int:
    cleaned = re.sub(r"<[^>]+>", " ", body)
    cleaned = re.sub(r"[`*_>#|\[\](){}]", " ", cleaned)
    return len([token for token in re.split(r"\s+", cleaned) if token])


def count_disallowed_fenced_blocks(body: str) -> int:
    matches = re.findall(r"```([^\n`]*)\n[\s\S]*?```", body)
    return sum(1 for language in matches if language.strip().lower() != "mermaid")


def is_theoretical_lesson(module_slug: str, category: str) -> bool:
    if module_slug not in CONCEPTUAL_FOLDERS:
        return False
    normalized = category.strip().lower()
    return any(signal in normalized for signal in THEORETICAL_SIGNALS)


def has_summary(body: str) -> bool:
    return any(re.search(pattern, body) for pattern in SUMMARY_PATTERNS)


def audit_lessons(repo_root: Path) -> list[LessonAudit]:
    course_root = repo_root / "src" / "content" / "corso"
    lessons = sorted(path for path in course_root.rglob("*.mdx") if path.parent != course_root)
    audits: list[LessonAudit] = []

    for path in lessons:
        raw = path.read_text(encoding="utf8")
        frontmatter, body = split_frontmatter(raw)

        missing_fields = [field for field in REQUIRED_FIELDS if not field_present(frontmatter, field)]
        fences = count_disallowed_fenced_blocks(body)
        words = count_words(body)
        summary = has_summary(body)
        category = extract_field(frontmatter, "category") or "[missing]"
        is_cheatsheet = "cheat" in path.stem.lower() or "cheat" in category.lower()

        improve: list[str] = []
        remove: list[str] = []
        rewrite: list[str] = []
        add: list[str] = []
        rationale: list[str] = []

        if missing_fields:
            add.append("metadati mancanti")
            rationale.append(f"metadati mancanti: {', '.join(missing_fields)}")

        if fences > 0 and is_theoretical_lesson(path.parent.name, category):
            remove.append("blocchi fenced non mermaid")
            rewrite.append("blocchi tecnici/pseudocodice in forma descrittiva")
            rationale.append(f"{fences} blocchi fenced non consentiti in ottica teorica")

        if words > 4500:
            rewrite.append("sezioni lunghe in versione piu' densa o split in deep-dive")
            rationale.append(f"lunghezza elevata ({words} parole)")

        short_lesson_flag = words < 1200 and not is_cheatsheet
        if short_lesson_flag:
            add.append("esempi applicati o criteri decisionali")
            rationale.append(f"lezione sotto soglia editoriale ({words} parole)")

        if not summary:
            add.append("sezione conclusioni/riepilogo")
            rationale.append("manca una sezione di chiusura esplicita")

        if not (improve or remove or rewrite or add):
            improve.append("micro-editing di leggibilita' (opzionale)")
            rationale.append("nessuna anomalia strutturale rilevata")

        if missing_fields or (fences > 0 and is_theoretical_lesson(path.parent.name, category)) or words > 4500:
            priority = "Alta"
        elif short_lesson_flag or not summary:
            priority = "Media"
        else:
            priority = "Bassa"

        audits.append(
            LessonAudit(
                module_slug=path.parent.name,
                lesson_slug=path.stem,
                path=str(path.relative_to(repo_root)),
                category=category,
                words=words,
                missing_fields=missing_fields,
                disallowed_fences=fences,
                has_summary=summary,
                recommendation_priority=priority,
                migliorare="; ".join(improve) if improve else "-",
                eliminare="; ".join(remove) if remove else "-",
                riscrivere="; ".join(rewrite) if rewrite else "-",
                aggiungere="; ".join(add) if add else "-",
                rationale="; ".join(rationale),
            )
        )

    return audits


def write_csv(path: Path, audits: list[LessonAudit]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf8", newline="") as f:
        w = csv.writer(f)
        w.writerow([
            "module_slug",
            "lesson_slug",
            "path",
            "category",
            "words",
            "missing_fields",
            "disallowed_fences",
            "has_summary",
            "priority",
            "migliorare",
            "eliminare",
            "riscrivere",
            "aggiungere",
            "rationale",
        ])
        for a in audits:
            w.writerow([
                a.module_slug,
                a.lesson_slug,
                a.path,
                a.category,
                a.words,
                "|".join(a.missing_fields) if a.missing_fields else "",
                a.disallowed_fences,
                "yes" if a.has_summary else "no",
                a.recommendation_priority,
                a.migliorare,
                a.eliminare,
                a.riscrivere,
                a.aggiungere,
                a.rationale,
            ])


def write_markdown(path: Path, audits: list[LessonAudit]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    total = len(audits)
    priority_counts = Counter(a.recommendation_priority for a in audits)
    by_module = defaultdict(list)
    for a in audits:
        by_module[a.module_slug].append(a)

    module_pressure = sorted(
        ((mod, sum(1 for a in items if a.recommendation_priority in {"Alta", "Media"}), len(items)) for mod, items in by_module.items()),
        key=lambda x: (x[1], x[2]),
        reverse=True,
    )

    lines = [
        "# Audit editoriale per lezione (chiusura operativa)",
        "",
        "Data: 2026-04-28",
        "",
        f"Totale lezioni analizzate: **{total}**.",
        "",
        "## Priorita' complessive",
        "",
        f"- Alta: **{priority_counts.get('Alta', 0)}**",
        f"- Media: **{priority_counts.get('Media', 0)}**",
        f"- Bassa: **{priority_counts.get('Bassa', 0)}**",
        "",
        "## Moduli con maggior carico editoriale (Alta+Media)",
        "",
    ]

    for mod, hm, all_count in module_pressure[:10]:
        lines.append(f"- `{mod}`: **{hm}/{all_count}** lezioni con intervento consigliato")

    lines += [
        "",
        "## Output dettagliato",
        "",
        "Il dettaglio per **ogni lezione** (migliorare/eliminare/riscrivere/aggiungere) e' nel CSV:",
        "",
        "- `reports/editorial-audit-per-lezione-2026-04-28.csv`",
    ]

    path.write_text("\n".join(lines) + "\n", encoding="utf8")


def main() -> int:
    repo_root = Path(__file__).resolve().parents[1]
    audits = audit_lessons(repo_root)
    write_csv(repo_root / "reports" / "editorial-audit-per-lezione-2026-04-28.csv", audits)
    write_markdown(repo_root / "src" / "content" / "corso" / "audit-editoriale-lezioni-2026-04-28.md", audits)
    print(f"Generated audit for {len(audits)} lessons.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
