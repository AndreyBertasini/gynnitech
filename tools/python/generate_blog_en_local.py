from __future__ import annotations

import re
from pathlib import Path

from transformers import MarianMTModel, MarianTokenizer


SOURCE_DIR = Path("src/content/blog")
TARGET_DIR = Path("src/content/blog-en")
MODEL_NAME = "Helsinki-NLP/opus-mt-it-en"

CATEGORY_MAP = {
    "AI Agents": "AI Agents",
    "AI agents": "AI Agents",
    "Analisi tecnica": "Technical analysis",
    "Best practices": "Best practices",
    "Data science": "Data science",
    "Experimentation": "Experimentation",
    "Framework": "Framework",
    "Marketing analytics": "Marketing analytics",
    "Metriche": "Metrics",
    "Product analytics": "Product analytics",
    "Strategia": "Strategy",
}

PROTECTED_TERMS = {
    "AI",
    "A/B",
    "A/A",
    "SQL",
    "GA4",
    "GTM",
    "CRM",
    "CDP",
    "API",
    "KPI",
    "OKR",
    "CAC",
    "LTV",
    "NPS",
    "MDE",
    "PMF",
    "RAG",
    "ROI",
    "SaaS",
    "ClickHouse",
    "Kafka",
    "Python",
    "Slack",
    "GitHub",
}


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
    if value.startswith("/") and not any(character.isspace() for character in value):
        return value
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


class Translator:
    def __init__(self) -> None:
        self.tokenizer = MarianTokenizer.from_pretrained(MODEL_NAME)
        self.model = MarianMTModel.from_pretrained(MODEL_NAME)
        self.cache: dict[str, str] = {}

    def translate_many(self, texts: list[str]) -> list[str]:
        output: list[str] = []
        batch: list[str] = []
        batch_indexes: list[int] = []

        for index, text in enumerate(texts):
            stripped = text.strip()
            if not stripped or not re.search(r"[A-Za-zÀ-ÿ]", stripped):
                output.append(text)
                continue
            if stripped in self.cache:
                output.append(self.cache[stripped])
                continue
            output.append("")
            batch.append(stripped)
            batch_indexes.append(index)

            if len(batch) >= 24:
                self._flush(batch, batch_indexes, output)
                batch = []
                batch_indexes = []

        if batch:
            self._flush(batch, batch_indexes, output)

        return output

    def _flush(self, batch: list[str], indexes: list[int], output: list[str]) -> None:
        inputs = self.tokenizer(batch, return_tensors="pt", padding=True, truncation=True, max_length=384)
        generated = self.model.generate(**inputs, max_length=512, num_beams=1)
        translated = [self.tokenizer.decode(item, skip_special_tokens=True) for item in generated]
        for source, target, index in zip(batch, translated, indexes):
            cleaned = postprocess(target)
            self.cache[source] = cleaned
            output[index] = cleaned


def postprocess(text: str) -> str:
    text = (
        text.replace(" - ", ", ")
        .replace("“", '"')
        .replace("”", '"')
        .replace("‘", "'")
        .replace("’", "'")
        .replace("—", "-")
        .replace("–", "-")
    )
    for term in PROTECTED_TERMS:
        pattern = re.compile(rf"(?<![A-Za-z]){re.escape(term)}(?![A-Za-z])", re.IGNORECASE)
        text = pattern.sub(term, text)
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    return text.strip()


def collect_translatable_units(body: str) -> tuple[list[str], list[tuple[str, str]]]:
    units: list[str] = []
    tokens: list[tuple[str, str]] = []
    in_code = False

    blocks = re.split(r"(\n{2,})", body.replace("\r\n", "\n"))
    for block in blocks:
        if not block:
            continue
        if block.startswith("\n"):
            tokens.append(("raw", block))
            continue
        if block.strip().startswith("```"):
            in_code = not in_code
            tokens.append(("raw", block))
            continue
        if in_code:
            tokens.append(("raw", block))
            continue
        if block.lstrip().startswith("|"):
            tokens.append(("table", block))
            continue
        heading_match = re.match(r"^(#{1,4}\s+)([^\n]+)$", block.strip())
        if heading_match:
            prefix, text = heading_match.groups()
            units.append(text)
            tokens.append(("unit", prefix))
            continue
        units.append(block.strip())
        tokens.append(("unit", ""))

    return units, tokens


def render_body(translated_units: list[str], tokens: list[tuple[str, str]], translator: Translator) -> str:
    output: list[str] = []
    unit_index = 0
    for kind, value in tokens:
        if kind == "raw":
            output.append(value)
            continue
        if kind == "unit":
            translated = translated_units[unit_index]
            unit_index += 1
            output.append(f"{value}{translated}" if value.startswith("#") else translated)
            continue
        if kind == "table":
            output.append(translate_table(value, translator))
    return "".join(output).strip()


def translate_table(table: str, translator: Translator) -> str:
    lines = table.splitlines()
    cells: list[str] = []
    refs: list[tuple[int, int]] = []
    parsed_rows: list[list[str] | None] = []

    for line in lines:
        stripped = line.strip()
        if not stripped.startswith("|") or re.fullmatch(r"\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?", stripped):
            parsed_rows.append(None)
            continue
        row = [cell.strip() for cell in stripped.strip("|").split("|")]
        parsed_rows.append(row)
        for index, cell in enumerate(row):
            if re.search(r"[A-Za-zÀ-ÿ]", cell) and not re.fullmatch(r"[A-Z0-9_ /+<>=%.-]+", cell):
                refs.append((len(parsed_rows) - 1, index))
                cells.append(cell)

    translated = translator.translate_many(cells)
    for (row_index, cell_index), value in zip(refs, translated):
        row = parsed_rows[row_index]
        if row is not None:
            row[cell_index] = value

    rendered: list[str] = []
    row_index = 0
    for line in lines:
        row = parsed_rows[row_index]
        row_index += 1
        if row is None:
            rendered.append(line)
        else:
            rendered.append("| " + " | ".join(row) + " |")
    return "\n".join(rendered)


def build_frontmatter(data: dict[str, str], translator: Translator) -> str:
    title, description = translator.translate_many([
        data.get("title", ""),
        data.get("description", ""),
    ])
    category = CATEGORY_MAP.get(data.get("category", ""), data.get("category", "Article"))

    keys = [
        ("title", title),
        ("description", description),
        ("category", category),
        ("date", data.get("date", "")),
        ("author", data.get("author", "Andrii Dyshkantiuk")),
        ("image", data.get("image", "")),
    ]
    return "\n".join(f"{key}: {yaml_string(value)}" for key, value in keys if value)


def main() -> None:
    TARGET_DIR.mkdir(parents=True, exist_ok=True)
    translator = Translator()
    count = 0

    for source_path in sorted(SOURCE_DIR.glob("*.mdx")):
        raw = source_path.read_text(encoding="utf-8")
        frontmatter, body = split_frontmatter(raw)
        data = parse_frontmatter(frontmatter)
        units, tokens = collect_translatable_units(body)
        translated_units = translator.translate_many(units)
        translated_body = render_body(translated_units, tokens, translator)
        target_frontmatter = build_frontmatter(data, translator)
        target_path = TARGET_DIR / source_path.name
        target_path.write_text(f"---\n{target_frontmatter}\n---\n{translated_body}\n", encoding="utf-8")
        count += 1
        print(f"[blog-en] {count}: {source_path.name}")

    print(f"Generated {count} English blog articles in {TARGET_DIR}.")


if __name__ == "__main__":
    main()
