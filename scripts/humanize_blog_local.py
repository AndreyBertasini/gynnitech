from __future__ import annotations

import re
from pathlib import Path


BLOG_DIR = Path("src/content/blog")

ACRONYMS = {
    "A/B",
    "A/A",
    "AI",
    "API",
    "B2B",
    "CAC",
    "CDP",
    "CRM",
    "CSAT",
    "GA4",
    "GDPR",
    "GTM",
    "KPI",
    "LTV",
    "MDE",
    "NPS",
    "OKR",
    "OLAP",
    "OLTP",
    "PMF",
    "RAG",
    "ROI",
    "SaaS",
    "SQL",
    "UX",
}

TITLE_SMALL_WORDS = {
    "a",
    "ad",
    "al",
    "alla",
    "alle",
    "con",
    "come",
    "da",
    "dai",
    "dal",
    "dalla",
    "de",
    "dei",
    "del",
    "della",
    "di",
    "e",
    "gli",
    "i",
    "il",
    "in",
    "la",
    "le",
    "lo",
    "non",
    "o",
    "per",
    "su",
    "tra",
    "un",
    "una",
    "vs",
}

REPLACEMENTS = [
    (r"\bdecisione cruciale\b", "decisione delicata"),
    (r"\bDecisione cruciale\b", "Decisione delicata"),
    (r"\bcruciale\b", "importante"),
    (r"\bCruciale\b", "Importante"),
    (r"\bfondamentale scegliere\b", "serve scegliere"),
    (r"\bFondamentale scegliere\b", "Serve scegliere"),
    (r"\bfondamentale\b", "centrale"),
    (r"\bFondamentale\b", "Centrale"),
    (r"\bpotente\b", "utile"),
    (r"\bPotente\b", "Utile"),
    (r"\blampante\b", "chiaro"),
    (r"\bLampante\b", "Chiaro"),
    (r"\bl'avanguardia tecnologica\b", "la parte più avanzata"),
    (r"\bL'avanguardia tecnologica\b", "La parte più avanzata"),
    (r"\bavanguardia tecnologica\b", "parte più avanzata"),
    (r"\bAvanguardia tecnologica\b", "Parte più avanzata"),
    (r"\bpanorama\b", "contesto"),
    (r"\blandscape\b", "contesto"),
    (r"\bè importante notare che\s+", ""),
    (r"\bÈ importante notare che\s+", ""),
    (r"\bvale la pena notare che\s+", ""),
    (r"\bVale la pena notare che\s+", ""),
    (r"\bin conclusione,?\s*", ""),
    (r"\bIn conclusione,?\s*", ""),
    (r"\bsenza precedenti\b", "raro"),
    (r"\btrasforma i dati da un archivio passivo a un sistema attivo di allerta e azione\b", "rende i dati parte del processo operativo"),
    (r"\bIl vero obiettivo è\b", "L'obiettivo è"),
    (r"\bil vero obiettivo è\b", "l'obiettivo è"),
    (r"\bnon è solo\b", "non è soltanto"),
    (r"\bNon è solo\b", "Non è soltanto"),
    (r"\bnon si tratta solo di\b", "non basta"),
    (r"\bNon si tratta solo di\b", "Non basta"),
]


def split_frontmatter(raw: str) -> tuple[str, str]:
    match = re.match(r"\A---\r?\n(?P<fm>[\s\S]*?)\r?\n---\r?\n?(?P<body>[\s\S]*)\Z", raw)
    if not match:
        raise ValueError("missing frontmatter")
    return match.group("fm"), match.group("body")


def parse_frontmatter(frontmatter: str) -> dict[str, str]:
    data: dict[str, str] = {}
    for line in frontmatter.splitlines():
        match = re.match(r"^([A-Za-z0-9_-]+):\s*(.*)\s*$", line)
        if not match:
            continue
        value = match.group(2).strip()
        if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
            value = value[1:-1]
        data[match.group(1)] = value
    return data


def yaml_string(value: str) -> str:
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def upsert(frontmatter: str, key: str, value: str) -> str:
    lines = frontmatter.splitlines()
    next_line = f"{key}: {yaml_string(value)}"
    for index, line in enumerate(lines):
        if re.match(rf"^{re.escape(key)}:\s*", line):
            lines[index] = next_line
            return "\n".join(lines).strip()
    return "\n".join([*lines, next_line]).strip()


def normalize_punctuation(text: str) -> str:
    return (
        text.replace("\r\n", "\n")
        .replace("—", "-")
        .replace("–", "-")
        .replace("“", '"')
        .replace("”", '"')
        .replace("‘", "'")
        .replace("’", "'")
        .replace("…", "...")
        .replace(" ", " ")
    )


def sentence_case_heading(text: str) -> str:
    text = text.strip()
    if not text:
        return text

    words = re.split(r"(\s+)", text)
    result: list[str] = []
    seen_word = False
    for part in words:
        if not part.strip():
            result.append(part)
            continue
        bare = part.strip("():,;!?")
        if bare in ACRONYMS or re.fullmatch(r"[A-Z0-9]{2,}", bare):
            result.append(part)
            seen_word = True
            continue
        if not seen_word:
            result.append(part[:1].upper() + part[1:].lower())
            seen_word = True
            continue
        lower = part.lower()
        if lower in TITLE_SMALL_WORDS or part[:1].isupper():
            result.append(lower)
        else:
            result.append(part)
    return "".join(result)


def humanize_text(text: str) -> str:
    next_text = normalize_punctuation(text)
    for pattern, replacement in REPLACEMENTS:
        next_text = re.sub(pattern, replacement, next_text)

    next_text = re.sub(r"\s+([,.;:!?])", r"\1", next_text)
    next_text = re.sub(r"[ \t]+$", "", next_text, flags=re.MULTILINE)
    next_text = re.sub(r"\n{4,}", "\n\n\n", next_text)
    return next_text.strip()


def humanize_title(title: str) -> str:
    parts = re.split(r"(:\s*)", title)
    output: list[str] = []
    for index, part in enumerate(parts):
        output.append(part if index % 2 else sentence_case_heading(part))
    return "".join(output).strip()


def humanize_body(body: str) -> str:
    body = humanize_text(body)
    body = re.sub(r"^(#{2,3})\s+(.+)$", lambda m: f"{m.group(1)} {sentence_case_heading(m.group(2))}", body, flags=re.MULTILINE)
    body = re.sub(r"^##\s+Conclusione\s*$", "## Il punto", body, flags=re.MULTILINE)
    body = re.sub(r"^##\s+Prossima azione\s*$", "## Cosa fare adesso", body, flags=re.MULTILINE)
    body = re.sub(r"^##\s+Opinione\s*$", "## Lettura pratica", body, flags=re.MULTILINE)
    body = re.sub(r"\n{4,}", "\n\n\n", body)
    return body.strip()


def main() -> None:
    changed = 0
    for file_path in sorted(BLOG_DIR.glob("*.mdx")):
        raw = file_path.read_text(encoding="utf-8")
        frontmatter, body = split_frontmatter(raw)
        data = parse_frontmatter(frontmatter)

        title = humanize_title(data.get("title", file_path.stem.replace("-", " ")))
        description = humanize_text(data.get("description", title))
        next_frontmatter = upsert(frontmatter, "title", title)
        next_frontmatter = upsert(next_frontmatter, "description", description)
        next_body = humanize_body(body)
        next_raw = f"---\n{next_frontmatter}\n---\n{next_body}\n"

        if next_raw != raw:
            file_path.write_text(next_raw, encoding="utf-8")
            changed += 1

    print(f"Humanized {changed} blog articles.")


if __name__ == "__main__":
    main()
