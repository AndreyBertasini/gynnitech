from __future__ import annotations

import re
import subprocess
from pathlib import Path

from humanize_blog_local import humanize_text, humanize_title, split_frontmatter, upsert


BLOG_DIR = Path("src/content/blog")

FIXES = [
    ("decisione serio", "decisione delicata"),
    ("decisione seria", "decisione delicata"),
    ("È di base scegliere", "Serve scegliere"),
    ("è di base scegliere", "serve scegliere"),
    ("L'avanguardia tecnologica", "La parte più avanzata"),
    ("l'avanguardia tecnologica", "la parte più avanzata"),
    ("## Il punto\nLa velocità", "## Il punto\n\nLa velocità"),
    ("## Il punto\nLa disciplina", "## Il punto\n\nLa disciplina"),
]


def original_frontmatter(file_path: Path) -> str:
    relative = file_path.as_posix()
    result = subprocess.run(
        ["git", "show", f"HEAD:{relative}"],
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    frontmatter, _body = split_frontmatter(result.stdout)
    return frontmatter


def parse_title_description(frontmatter: str) -> tuple[str, str]:
    title = ""
    description = ""
    for line in frontmatter.splitlines():
        match = re.match(r"^(title|description):\s*(.*)\s*$", line)
        if not match:
            continue
        value = match.group(2).strip()
        if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
            value = value[1:-1]
        if match.group(1) == "title":
            title = value
        else:
            description = value
    return title, description


def main() -> None:
    changed = 0
    for file_path in sorted(BLOG_DIR.glob("*.mdx")):
        raw = file_path.read_text(encoding="utf-8")
        frontmatter, body = split_frontmatter(raw)
        original_title, original_description = parse_title_description(original_frontmatter(file_path))
        next_frontmatter = upsert(frontmatter, "title", humanize_title(original_title))
        next_frontmatter = upsert(next_frontmatter, "description", humanize_text(original_description))

        next_body = body
        for source, target in FIXES:
            next_body = next_body.replace(source, target)
        next_body = re.sub(r"^(#{2,3})\s+(.+)$", lambda m: f"{m.group(1)} {m.group(2).replace('Efficacia', 'efficacia').replace('Uso', 'uso')}", next_body, flags=re.MULTILINE)

        next_raw = f"---\n{next_frontmatter}\n---\n{next_body.strip()}\n"
        if next_raw != raw:
            file_path.write_text(next_raw, encoding="utf-8")
            changed += 1
    print(f"Fixed {changed} blog articles.")


if __name__ == "__main__":
    main()
