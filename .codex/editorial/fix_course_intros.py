from __future__ import annotations

import re
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
COURSE_ROOT = REPO_ROOT / "src" / "content" / "corso"
MIN_INTRO_CHARS = 140


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


def intro_for(title: str) -> str:
    topic = title.strip().rstrip(".") or "Questa lezione"
    return (
        f"{topic} va letto come un passaggio decisionale, non come una definizione isolata. "
        "La lezione collega domanda, dato, controllo e azione, cosi il lavoro tecnico resta "
        "ancorato a una scelta verificabile sotto incertezza."
    )


def first_index(lines: list[str], predicate) -> int | None:
    for index, line in enumerate(lines):
        if predicate(line):
            return index
    return None


def repair_body(body: str, title: str) -> tuple[str, bool]:
    lines = body.splitlines()
    if not lines:
        return body, False

    insert_at = 0
    while insert_at < len(lines) and (lines[insert_at].startswith("import ") or not lines[insert_at].strip()):
        insert_at += 1

    h2_index = first_index(lines, lambda line: line.startswith("## "))
    h1_index = first_index(lines, lambda line: line.startswith("# "))

    changed = False
    if h1_index is None or (h2_index is not None and h1_index > h2_index):
        lines[insert_at:insert_at] = [f"# {title}", ""]
        changed = True
        h1_index = insert_at

    if h1_index is None:
        return "\n".join(lines).rstrip() + "\n", changed

    h2_index = first_index(lines[h1_index + 1 :], lambda line: line.startswith("## "))
    if h2_index is None:
        return "\n".join(lines).rstrip() + "\n", changed
    h2_index = h1_index + 1 + h2_index

    intro = "\n".join(lines[h1_index + 1 : h2_index]).strip()
    if len(intro) >= MIN_INTRO_CHARS:
        return "\n".join(lines).rstrip() + "\n", changed

    addition = intro_for(title)
    insert_after = h1_index + 1
    if insert_after < len(lines) and lines[insert_after].strip():
        lines[insert_after:insert_after] = ["", addition, ""]
    else:
        lines[insert_after:insert_after] = [addition, ""]
    changed = True
    return "\n".join(lines).rstrip() + "\n", changed


def main() -> int:
    changed_files = 0
    for path in sorted(COURSE_ROOT.glob("*/*.mdx")):
        text = path.read_text(encoding="utf-8")
        frontmatter, body = split_frontmatter(text)
        title = frontmatter_value(frontmatter, "title")
        repaired, changed = repair_body(body, title)
        if changed:
            path.write_text(frontmatter + repaired, encoding="utf-8")
            changed_files += 1
            print(path.relative_to(REPO_ROOT).as_posix())
    print(f"changed={changed_files}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
