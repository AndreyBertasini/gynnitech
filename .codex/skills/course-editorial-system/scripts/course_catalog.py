from __future__ import annotations

import argparse
import re
from pathlib import Path


CANONICAL_MODULES = {
    "panoramica": "Modulo 1: Panoramica e metodo di studio",
    "data-collection": "Modulo 2: Raccolta dati e sistemi di tracking",
    "metriche-fondamenti": "Modulo 3: Metriche, KPI tree e fondamenti analitici",
    "gestione-data-driven": "Modulo 4: Gestione data-driven e processi decisionali",
    "analisi-prodotto": "Modulo 5: Product analytics e diagnosi della crescita",
    "analisi-marketing": "Modulo 6: Marketing analytics e martech",
    "dashboard-visualizzazione": "Modulo 7: Dashboard e visualizzazione dei dati",
    "marketing-data-science": "Modulo 8: Marketing data science e modelli predittivi",
    "data-warehousing": "Modulo 9: Data warehouse e modellazione analitica",
    "s3-data-lake": "Modulo 10: Data lake e lakehouse su S3",
    "kafka-streaming": "Modulo 11: Kafka e streaming di eventi",
    "real-time-analytics": "Modulo 12: Real-time analytics con ClickHouse",
    "infrastructure-ops": "Modulo 13: Infrastruttura dati e operations",
    "advanced-sql": "Modulo 14: SQL avanzato per l'analisi",
    "matematica-analisi-dati": "Modulo 15: Matematica per l'analisi dei dati",
    "analytics-engineering": "Modulo 16: Analytics engineering con dbt",
    "significativita-statistica": "Modulo 17: Significatività statistica e A/B test",
    "direzioni-analitica": "Modulo 18: Direzioni dell'analitica: ruoli e carriera",
    "filosofia-analisi-dati": "Modulo 19: Fondamenti filosofici dell'analisi dei dati",
    "ai-data-workflows": "Modulo 20: AI assistita per il lavoro sui dati",
    "agentic-ai-data-workflows": "Modulo 21: Agentic AI per il lavoro sui dati",
}

THEORETICAL_CATEGORIES = {
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

CONCEPTUAL_FOLDERS = {
    "panoramica",
    "gestione-data-driven",
    "dashboard-visualizzazione",
    "direzioni-analitica",
    "filosofia-analisi-dati",
}

ANALYTICAL_FOLDERS = {
    "metriche-fondamenti",
    "matematica-analisi-dati",
    "significativita-statistica",
    "analisi-prodotto",
    "analisi-marketing",
    "marketing-data-science",
}

TECHNICAL_FOLDERS = {
    "data-collection",
    "advanced-sql",
    "data-warehousing",
    "analytics-engineering",
    "s3-data-lake",
    "kafka-streaming",
    "real-time-analytics",
    "infrastructure-ops",
    "ai-data-workflows",
    "agentic-ai-data-workflows",
}

SUPPORTED_FORMATS = {"articolo", "didattica-v2"}


def clean_scalar(value: str | None) -> str:
    if not value:
        return ""
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
        return value[1:-1].strip()
    return value


def split_frontmatter(text: str) -> tuple[str, str]:
    lines = text.splitlines()
    if not lines or not lines[0].startswith("---"):
        return "", text
    for index in range(1, len(lines)):
        if lines[index].strip() == "---":
            return "\n".join(lines[1:index]), "\n".join(lines[index + 1 :])
    return "", text


def extract_field(frontmatter: str, field: str) -> str:
    match = re.search(rf"(?m)^{re.escape(field)}:\s*(.+)$", frontmatter)
    return clean_scalar(match.group(1)) if match else ""


def is_senza_codice(frontmatter: str) -> bool:
    return extract_field(frontmatter, "senzaCodice").lower() == "true"


def requires_code_cleanliness(folder: str, category: str, senza_codice: bool) -> bool:
    return senza_codice or (folder in CONCEPTUAL_FOLDERS and category in THEORETICAL_CATEGORIES)


def has_order(frontmatter: str) -> bool:
    return bool(re.search(r"(?m)^order:\s*\d+\s*$", frontmatter))


def count_words(body: str) -> int:
    cleaned = re.sub(r"<[^>]+>", " ", body)
    cleaned = re.sub(r"[`*_>#|\[\](){}]", " ", cleaned)
    return len([token for token in re.split(r"\s+", cleaned) if token])


def count_disallowed_fenced_blocks(body: str) -> int:
    matches = re.findall(r"```([^\n`]*)\n[\s\S]*?```", body)
    return sum(1 for language in matches if clean_scalar(language).lower() != "mermaid")


def iter_lesson_files(course_root: Path) -> list[Path]:
    return sorted(path for path in course_root.rglob("*.mdx") if path.parent != course_root)


def iter_all_course_files(course_root: Path) -> list[Path]:
    return sorted(course_root.rglob("*.mdx"))


def audit(repo_root: Path) -> int:
    course_root = repo_root / "src" / "content" / "corso"
    learning_path = course_root / "learning-path.mdx"
    concept_map = course_root / "panoramica" / "mappe-concettuali.mdx"
    lesson_files = iter_lesson_files(course_root)
    core_lesson_count = 0

    module_mismatches: list[str] = []
    missing_metadata: list[str] = []
    long_lessons: list[str] = []
    theory_with_fences: list[str] = []
    invalid_formats: list[str] = []

    for file_path in lesson_files:
        raw = file_path.read_text(encoding="utf8")
        frontmatter, body = split_frontmatter(raw)
        folder = file_path.parent.name
        expected_module = CANONICAL_MODULES.get(folder, "")
        actual_module = extract_field(frontmatter, "module")
        category = extract_field(frontmatter, "category")
        formato = extract_field(frontmatter, "formato")
        senza_codice = is_senza_codice(frontmatter)
        duration = extract_field(frontmatter, "duration")
        difficulty = extract_field(frontmatter, "difficulty")
        if has_order(frontmatter):
            core_lesson_count += 1
        prerequisites_present = re.search(r"(?m)^prerequisites:\s*(?:\[\]|$)", frontmatter) or re.search(
            r"(?m)^prerequisites:\s*\n(?:\s*-\s*.+\n?)*", frontmatter
        )
        objectives_present = re.search(r"(?m)^learningObjectives:\s*\n(?:\s*-\s*.+\n?)+", frontmatter)

        if expected_module and actual_module != expected_module:
            module_mismatches.append(f"{file_path.relative_to(repo_root)} -> {actual_module or '[missing]'} != {expected_module}")

        if formato and formato not in SUPPORTED_FORMATS:
            invalid_formats.append(f"{file_path.relative_to(repo_root)} -> {formato}")

        if not duration or not difficulty or not prerequisites_present or not objectives_present:
            missing = []
            if not duration:
                missing.append("duration")
            if not difficulty:
                missing.append("difficulty")
            if not prerequisites_present:
                missing.append("prerequisites")
            if not objectives_present:
                missing.append("learningObjectives")
            missing_metadata.append(f"{file_path.relative_to(repo_root)} -> {', '.join(missing)}")

        words = count_words(body)
        if words > 4500:
            long_lessons.append(f"{words} words -> {file_path.relative_to(repo_root)}")

        disallowed_fence_count = count_disallowed_fenced_blocks(body)
        if requires_code_cleanliness(folder, category, senza_codice) and disallowed_fence_count > 0:
            theory_with_fences.append(
                f"{disallowed_fence_count} disallowed fenced block(s) -> {file_path.relative_to(repo_root)}"
            )

    expected_module_count = len(CANONICAL_MODULES)
    expected_lesson_count = core_lesson_count
    learning_path_text = learning_path.read_text(encoding="utf8")
    concept_map_text = concept_map.read_text(encoding="utf8")

    overview_issues = []
    if f"{expected_module_count} moduli" not in learning_path_text or f"{expected_lesson_count} lezioni" not in learning_path_text:
        overview_issues.append("learning-path.mdx does not reflect current module/lesson counts")
    if f"{expected_module_count} moduli" not in concept_map_text:
        overview_issues.append("mappe-concettuali.mdx does not reflect the current module count")
    if f"{expected_lesson_count} lezioni" not in concept_map_text:
        overview_issues.append("mappe-concettuali.mdx does not reflect the current lesson count")

    print(f"Core lessons: {expected_lesson_count}")
    print(f"Supplemental resources: {len(lesson_files) - expected_lesson_count}")
    print(f"Canonical modules: {expected_module_count}")

    if module_mismatches:
        print("\nModule mismatches:")
        for item in module_mismatches:
            print(f"- {item}")

    if missing_metadata:
        print("\nMissing metadata:")
        for item in missing_metadata:
            print(f"- {item}")

    if long_lessons:
        print("\nLong lessons (>4500 words, review threshold):")
        for item in long_lessons:
            print(f"- {item}")

    if theory_with_fences:
        print("\nTheoretical or senzaCodice lessons with disallowed fenced blocks:")
        for item in theory_with_fences:
            print(f"- {item}")

    if invalid_formats:
        print("\nUnsupported formato values:")
        for item in invalid_formats:
            print(f"- {item}")

    if overview_issues:
        print("\nOverview issues:")
        for item in overview_issues:
            print(f"- {item}")

    issue_count = sum(
        len(group)
        for group in (module_mismatches, missing_metadata, theory_with_fences, invalid_formats, overview_issues)
    )
    if issue_count == 0:
        print("\nAudit clean.")
    else:
        print(f"\nAudit found {issue_count} issue(s).")

    return 0


def sync_modules(repo_root: Path) -> int:
    course_root = repo_root / "src" / "content" / "corso"
    changed = 0
    for file_path in iter_lesson_files(course_root):
        folder = file_path.parent.name
        expected_module = CANONICAL_MODULES.get(folder)
        if not expected_module:
            continue

        raw = file_path.read_text(encoding="utf8")
        updated = re.sub(
            r"(?m)^module:\s*.+$",
            f'module: "{expected_module}"',
            raw,
            count=1,
        )
        if updated != raw:
            file_path.write_text(updated, encoding="utf8")
            changed += 1

    print(f"Updated module frontmatter in {changed} file(s).")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit and normalize the GinnyTech course catalog.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    audit_parser = subparsers.add_parser("audit", help="Audit the current course catalog")
    audit_parser.add_argument("--repo-root", required=True, help="Repository root path")

    sync_parser = subparsers.add_parser("sync-modules", help="Normalize module frontmatter by folder")
    sync_parser.add_argument("--repo-root", required=True, help="Repository root path")

    args = parser.parse_args()
    repo_root = Path(args.repo_root).resolve()

    if args.command == "audit":
        return audit(repo_root)
    if args.command == "sync-modules":
        return sync_modules(repo_root)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
