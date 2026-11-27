from __future__ import annotations

import re
from pathlib import Path


BLOG_EN_DIR = Path("src/content/blog-en")

CATEGORY_FIXES = {
    "Analisi Tecnica": "Technical analysis",
    "Carriera": "Career",
    "Etica": "Ethics",
    "Innovazione": "Innovation",
    "Metriche": "Metrics",
    "PMI": "SMEs",
    "Strategia": "Strategy",
    "Statistiche": "Statistics",
}

TEXT_FIXES = [
    ("detAIl", "detail"),
    ("DetAIl", "Detail"),
    ("remAIn", "remain"),
    ("RemAIn", "Remain"),
    ("mAIn", "main"),
    ("MAIn", "Main"),
    ("contAIn", "contain"),
    ("ContAIn", "Contain"),
    ("certAIn", "certain"),
    ("CertAIn", "Certain"),
    ("fRAGile", "fragile"),
    ("FRAGile", "Fragile"),
    ("avAIlable", "available"),
    ("trAIn", "train"),
    ("fAIr", "fair"),
    ("p---value", "p-value"),
    ("p- value", "p-value"),
    ("p - value", "p-value"),
    ("peeling", "peeking"),
    ("Peeling", "Peeking"),
    ("Click at a specific date/time", "Runs at a specific date/time"),
    ("Take it when an event occurs", "Runs when an event occurs"),
    ("Average | Email", "Medium | Email"),
    ("Average | High", "Medium | High"),
    ("A/B statistical error test: How to test reliable", "A/B test statistical errors: How to run reliable tests"),
    ("The real cost of the fatigue dashboard", "The real cost of dashboard fatigue"),
    ("Email drop-off cart within 15 minutes", "Abandoned cart email within 15 minutes"),
    ("which object to use for an email", "which subject line to use for an email"),
    ("18 A/B tests on the object", "18 A/B tests on the subject line"),
    ("millions of earned", "millions in additional revenue"),
    ("significant level", "significance level"),
    ("active platforms", "agentic platforms"),
    ("wrong-point exposure events", "wrong exposure events"),
    ("A few data (-<20/group)", "Small samples, fewer than 20 per group"),
    ("(-<1% SMEs)", "(less than 1% of SMEs)"),
]

URL_FIXES = [
    ("/course/agentic-AI-data-flows/", "/course/agentic-ai-data-workflows/"),
    ("/course/metrics-fundaments/", "/course/metriche-fondamenti/"),
    ("/course/mathematic-analysis-data/", "/course/matematica-analisi-dati/"),
    ("/course/mathematics-analysis-data/", "/course/matematica-analisi-dati/"),
    ("/course/analysis-marketing/", "/course/analisi-marketing/"),
    ("/course/significant-statistical/", "/course/significativita-statistica/"),
]


def sentence_case_heading(text: str) -> str:
    keep = {"AI", "A/B", "A/A", "SQL", "GA4", "GTM", "CRM", "CDP", "API", "KPI", "OKR", "CAC", "LTV", "NPS", "MDE", "PMF", "RAG", "ROI", "SaaS"}
    words = re.split(r"(\s+)", text)
    result: list[str] = []
    seen = False
    for word in words:
        if not word.strip():
            result.append(word)
            continue
        bare = word.strip("():,;!?")
        if bare in keep or re.fullmatch(r"[A-Z0-9]{2,}", bare):
            result.append(word)
        elif not seen:
            result.append(word[:1].upper() + word[1:].lower())
            seen = True
        elif word[:1].isupper():
            result.append(word.lower())
        else:
            result.append(word)
    return "".join(result)


def cleanup(raw: str) -> str:
    text = raw
    for source, target in TEXT_FIXES:
        text = text.replace(source, target)
    for source, target in URL_FIXES:
        text = text.replace(source, target)
    for source, target in CATEGORY_FIXES.items():
        text = re.sub(rf'^category: "{re.escape(source)}"$', f'category: "{target}"', text, flags=re.MULTILINE)

    text = text.replace("—", "-").replace("–", "-").replace("“", '"').replace("”", '"').replace("‘", "'").replace("’", "'")
    text = re.sub(r"(?<!&lt;)<", "&lt;", text)
    text = re.sub(r"^(#{2,3})\s+(.+)$", lambda m: f"{m.group(1)} {sentence_case_heading(m.group(2))}", text, flags=re.MULTILINE)
    text = re.sub(r"[ \t]+$", "", text, flags=re.MULTILINE)
    text = re.sub(r"\n{4,}", "\n\n\n", text)
    return text


def main() -> None:
    changed = 0
    for file_path in sorted(BLOG_EN_DIR.glob("*.mdx")):
        raw = file_path.read_text(encoding="utf-8")
        next_raw = cleanup(raw)
        if next_raw != raw:
            file_path.write_text(next_raw, encoding="utf-8")
            changed += 1
    print(f"Cleaned {changed} English blog articles.")


if __name__ == "__main__":
    main()
