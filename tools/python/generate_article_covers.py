from __future__ import annotations

import argparse
import html
import re
from pathlib import Path


PALETTES = [
    ("#00f3ff", "#ccff00", "#4f46e5"),
    ("#fb7185", "#22d3ee", "#a3e635"),
    ("#f59e0b", "#38bdf8", "#8b5cf6"),
    ("#34d399", "#60a5fa", "#f472b6"),
    ("#f97316", "#06b6d4", "#84cc16"),
    ("#818cf8", "#2dd4bf", "#facc15"),
]

FRONTMATTER_LINE = re.compile(r"^(?P<key>[A-Za-z0-9_-]+):\s*(?P<value>.+?)\s*$")


def hash_string(value: str) -> int:
    hashed = 0
    for character in value:
        hashed = (hashed * 31 + ord(character)) & 0xFFFFFFFF
    return hashed


def parse_frontmatter(file_path: Path) -> dict[str, str]:
    content = file_path.read_text(encoding="utf-8")
    if not content.startswith("---\n"):
        return {}

    parts = content.split("---\n", 2)
    if len(parts) < 3:
        return {}

    frontmatter = {}
    for raw_line in parts[1].splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue

        match = FRONTMATTER_LINE.match(line)
        if not match:
            continue

        value = match.group("value").strip().strip('"').strip("'")
        frontmatter[match.group("key")] = value

    return frontmatter


def wrap_title(title: str, max_line_length: int = 22, max_lines: int = 3) -> list[str]:
    words = title.strip().split()
    lines: list[str] = []
    current_line = ""

    for word in words:
        next_line = f"{current_line} {word}".strip()
        if len(next_line) <= max_line_length:
            current_line = next_line
            continue

        if current_line:
            lines.append(current_line)
        current_line = word

        if len(lines) == max_lines - 1:
            break

    if current_line and len(lines) < max_lines:
        lines.append(current_line)

    used_word_count = len(" ".join(lines).split())
    if used_word_count < len(words) and lines:
        lines[-1] = lines[-1].rstrip(". ") + "..."

    return lines


def create_svg(title: str, category: str, slug: str) -> str:
    hashed = hash_string(slug)
    accent_a, accent_b, accent_c = PALETTES[hashed % len(PALETTES)]
    secondary_hash = hash_string(f"{slug}:{category}")
    orbit_x = 820 + (secondary_hash % 220)
    orbit_y = 120 + (secondary_hash % 180)
    title_lines = wrap_title(title)

    title_text = "\n".join(
        (
            f'  <text x="88" y="{310 + index * 74}" '
            'font-family="Inter, Arial, sans-serif" font-size="58" '
            f'font-weight="800" fill="#ffffff">{html.escape(line)}</text>'
        )
        for index, line in enumerate(title_lines)
    )

    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#050505"/>
      <stop offset="0.55" stop-color="#0f172a"/>
      <stop offset="1" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="accent" x1="110" y1="80" x2="980" y2="540" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="{accent_a}" stop-opacity="0.95"/>
      <stop offset="0.5" stop-color="{accent_b}" stop-opacity="0.88"/>
      <stop offset="1" stop-color="{accent_c}" stop-opacity="0.9"/>
    </linearGradient>
    <filter id="blur" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="42"/>
    </filter>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)" opacity="0.35"/>

  <circle cx="1030" cy="96" r="162" fill="{accent_a}" fill-opacity="0.18" filter="url(#blur)"/>
  <circle cx="260" cy="610" r="180" fill="{accent_b}" fill-opacity="0.14" filter="url(#blur)"/>
  <circle cx="{orbit_x}" cy="{orbit_y}" r="92" fill="{accent_c}" fill-opacity="0.22"/>

  <rect x="72" y="72" width="1056" height="486" rx="32" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)"/>
  <rect x="88" y="90" width="164" height="36" rx="18" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.12)"/>
  <text x="116" y="113" font-family="Inter, Arial, sans-serif" font-size="15" font-weight="700" letter-spacing="1.3" fill="#e2e8f0">{html.escape(category.upper())}</text>

  <rect x="88" y="162" width="360" height="10" rx="5" fill="url(#accent)"/>
  <rect x="88" y="184" width="118" height="10" rx="5" fill="rgba(255,255,255,0.12)"/>

{title_text}

  <text x="88" y="540" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="600" fill="rgba(255,255,255,0.72)">GinnyTech · Articoli</text>

  <g opacity="0.95">
    <path d="M820 208C880 144 964 136 1025 190C1088 245 1095 332 1042 396C988 461 902 473 839 421C776 368 762 272 820 208Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.14)"/>
    <path d="M868 250L963 211L1000 306L905 344L868 250Z" fill="url(#accent)" fill-opacity="0.88"/>
    <path d="M840 366L1020 366" stroke="rgba(255,255,255,0.16)" stroke-width="10" stroke-linecap="round"/>
    <path d="M840 400L978 400" stroke="rgba(255,255,255,0.1)" stroke-width="10" stroke-linecap="round"/>
    <path d="M840 434L936 434" stroke="rgba(255,255,255,0.08)" stroke-width="10" stroke-linecap="round"/>
  </g>
</svg>
"""


def generate_article_covers(repo_root: Path) -> int:
    blog_dir = repo_root / "src" / "content" / "blog"
    output_dir = repo_root / "public" / "article-covers"
    output_dir.mkdir(parents=True, exist_ok=True)

    count = 0
    for file_path in sorted(blog_dir.glob("*.md*")):
        frontmatter = parse_frontmatter(file_path)
        slug = file_path.stem
        title = frontmatter.get("title", slug)
        category = frontmatter.get("category", "Articolo")
        svg = create_svg(title=title, category=category, slug=slug)
        (output_dir / f"{slug}.svg").write_text(svg, encoding="utf-8")
        count += 1

    return count


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate SVG covers for blog articles.")
    parser.add_argument(
        "--repo-root",
        default=Path(__file__).resolve().parents[2],
        type=Path,
        help="Repository root path.",
    )
    args = parser.parse_args()

    generated = generate_article_covers(args.repo_root.resolve())
    relative_output = Path("public") / "article-covers"
    print(f"Generated {generated} article covers in {relative_output}")


if __name__ == "__main__":
    main()
