#!/usr/bin/env python3
"""
Assign header images to course lessons in a deterministic order.

What the script does:
1. Reads lesson files from `src/content/corso/*/*.mdx`.
2. Picks only approved images from `images/` in filename order.
3. Renames each image for SEO with lesson/module/site ownership in the filename.
4. Copies the image to `public/course-headers/`.
5. Updates lesson frontmatter:
   - `headerImage`
   - `headerImageAlt`
   - `description` (SEO-safe description with title, GinnyTech, AD)
6. Deletes the original source image only after the lesson file and destination image
   are both written successfully.

Safety:
- Dry-run by default.
- Use `--apply` to write changes.
- Existing `headerImage` values are skipped unless `--force` is used.
"""

from __future__ import annotations

import argparse
import re
import shutil
import sys
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".avif"}
FRONTMATTER_RE = re.compile(
    r"\A---\n(?P<frontmatter>.*?)(?:\n)---\n?(?P<body>.*)\Z",
    re.DOTALL,
)
TOP_LEVEL_KEY_RE = re.compile(r"^[A-Za-z0-9_-]+:(?:\s|$)")
MODULE_ID_RE = re.compile(r"id:\s*['\"]([^'\"]+)['\"]")


@dataclass
class LessonFile:
    path: Path
    relative_path: str
    module_slug: str
    lesson_slug: str
    title: str
    description: str
    order: int
    header_image: Optional[str]
    content: str


@dataclass
class Assignment:
    lesson: LessonFile
    source_image: Optional[Path]
    destination_image: Optional[Path]
    public_image_path: str
    header_alt: str
    seo_description: str
    updated_content: str


def parse_args() -> argparse.Namespace:
    script_dir = Path(__file__).resolve().parent
    repo_root = script_dir.parent.parent
    parser = argparse.ArgumentParser(
        description="Assign header images to lessons and move them to public/course-headers.",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Write files, copy images, and delete source images. Default is dry-run.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing headerImage/headerImageAlt assignments.",
    )
    parser.add_argument(
        "--seo-only",
        action="store_true",
        help="Update SEO description and headerImageAlt using existing headerImage values only.",
    )
    parser.add_argument(
        "--images-dir",
        type=Path,
        default=repo_root / "images",
        help="Source image directory. Default: <repo>/images",
    )
    parser.add_argument(
        "--required-suffix",
        default="fix",
        help="Only use source images whose stem ends with this suffix. Default: fix",
    )
    parser.add_argument(
        "--lessons-dir",
        type=Path,
        default=repo_root / "src" / "content" / "corso",
        help="Lessons directory. Default: <repo>/src/content/corso",
    )
    parser.add_argument(
        "--public-dir",
        type=Path,
        default=repo_root / "public" / "course-headers",
        help="Destination public image directory. Default: <repo>/public/course-headers",
    )
    parser.add_argument(
        "--report",
        type=Path,
        default=None,
        help="Optional path to write a text report.",
    )
    return parser.parse_args()


def normalize_newlines(text: str) -> str:
    return text.replace("\r\n", "\n").replace("\r", "\n")


def collapse_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_only = normalized.encode("ascii", "ignore").decode("ascii")
    lowered = ascii_only.lower()
    slug = re.sub(r"[^a-z0-9]+", "-", lowered).strip("-")
    return re.sub(r"-{2,}", "-", slug) or "lesson"


def yaml_quote(value: str) -> str:
    return value.replace("'", "''")


def split_frontmatter(content: str) -> tuple[str, str]:
    normalized = normalize_newlines(content)
    match = FRONTMATTER_RE.match(normalized)
    if not match:
        raise ValueError("File does not contain valid YAML frontmatter.")
    return match.group("frontmatter"), match.group("body")


def join_frontmatter(frontmatter: str, body: str) -> str:
    return f"---\n{frontmatter.rstrip()}\n---\n\n{body.lstrip()}"


def find_key_span(lines: list[str], key: str) -> Optional[tuple[int, int]]:
    key_pattern = re.compile(rf"^{re.escape(key)}:(?:\s|$)")
    start = None
    for index, line in enumerate(lines):
        if key_pattern.match(line):
            start = index
            break
    if start is None:
        return None

    end = len(lines)
    for index in range(start + 1, len(lines)):
        line = lines[index]
        if TOP_LEVEL_KEY_RE.match(line) and not line.startswith(" "):
            end = index
            break
    return start, end


def parse_inline_scalar(raw_value: str) -> str:
    value = raw_value.strip()
    if len(value) >= 2 and value[0] == value[-1] == "'":
        return value[1:-1].replace("''", "'")
    if len(value) >= 2 and value[0] == value[-1] == '"':
        return value[1:-1].replace('\\"', '"')
    return value


def extract_key_value(frontmatter: str, key: str) -> Optional[str]:
    lines = frontmatter.splitlines()
    span = find_key_span(lines, key)
    if not span:
        return None

    start, end = span
    first_line = lines[start]
    raw_value = first_line.split(":", 1)[1].strip()

    if raw_value in {">", ">-", "|", "|-", "|+"}:
        block_lines = []
        for line in lines[start + 1 : end]:
            block_lines.append(line[2:] if line.startswith("  ") else line.strip())
        return collapse_whitespace(" ".join(block_lines))

    return parse_inline_scalar(raw_value)


def upsert_key(frontmatter: str, key: str, value: str, after_keys: list[str]) -> str:
    lines = frontmatter.splitlines()
    replacement = [f"{key}: '{yaml_quote(collapse_whitespace(value))}'"]
    span = find_key_span(lines, key)

    if span:
        start, end = span
        lines[start:end] = replacement
        return "\n".join(lines)

    insert_at = len(lines)
    for after_key in after_keys:
        anchor_span = find_key_span(lines, after_key)
        if anchor_span:
            insert_at = anchor_span[1]

    lines[insert_at:insert_at] = replacement
    return "\n".join(lines)


def trim_seo_description(text: str, limit: int = 155) -> str:
    text = collapse_whitespace(text)
    if len(text) <= limit:
        return text
    trimmed = text[: limit - 3].rsplit(" ", 1)[0].strip()
    return (trimmed or text[: limit - 3]).rstrip(" ,.;:") + "..."


def sanitize_existing_description(text: str) -> str:
    cleaned = collapse_whitespace(text)
    branding_patterns = [
        r"\|\s*GinnyTech,\s*creata da AD\b",
        r"\bGinnyTech,\s*creata da AD\b",
        r"\bLezione\s+GinnyTech\s+creata\s+da\s+AD\b",
    ]
    for pattern in branding_patterns:
        cleaned = re.sub(pattern, "", cleaned, flags=re.IGNORECASE)
    return collapse_whitespace(cleaned).rstrip(" |,.;:-")


def build_seo_description(title: str, existing_description: str) -> str:
    suffix = " | GinnyTech, creata da AD"
    existing = sanitize_existing_description(existing_description)
    if not existing:
        existing = title
    if not existing.lower().startswith(title.lower()):
        existing = f"{title}. {existing}"
    max_core_length = max(1, 155 - len(suffix))
    core = trim_seo_description(existing.rstrip(". "), limit=max_core_length)
    return f"{core}{suffix}"


def build_alt_text(title: str) -> str:
    return f"{title} - immagine ufficiale della lezione su GinnyTech, creata da AD"


def build_destination_filename(lesson: LessonFile, source_image: Path) -> str:
    base_name = f"{lesson.module_slug}-{lesson.lesson_slug}-ginnytech-ad"
    safe_name = slugify(base_name)
    return f"{safe_name}{source_image.suffix.lower()}"


def read_module_order(repo_root: Path) -> dict[str, int]:
    module_file = repo_root / "src" / "data" / "course-modules.ts"
    if not module_file.exists():
        return {}

    content = normalize_newlines(module_file.read_text(encoding="utf-8"))
    order: dict[str, int] = {}
    for index, module_id in enumerate(MODULE_ID_RE.findall(content)):
        order[module_id] = index
    return order


def load_lessons(lessons_dir: Path, module_order: dict[str, int]) -> list[LessonFile]:
    lessons: list[LessonFile] = []

    for lesson_path in lessons_dir.rglob("*.mdx"):
        if lesson_path.parent == lessons_dir:
            continue

        content = lesson_path.read_text(encoding="utf-8")
        frontmatter, _body = split_frontmatter(content)
        title = extract_key_value(frontmatter, "title") or lesson_path.stem.replace("-", " ").title()
        description = extract_key_value(frontmatter, "description") or title
        order_value = extract_key_value(frontmatter, "order")
        header_image = extract_key_value(frontmatter, "headerImage")

        try:
            lesson_order = int(order_value) if order_value is not None else 9999
        except ValueError:
            lesson_order = 9999

        relative_path = lesson_path.relative_to(lessons_dir).as_posix()
        module_slug = lesson_path.parent.name
        lesson_slug = lesson_path.stem

        lessons.append(
            LessonFile(
                path=lesson_path,
                relative_path=relative_path,
                module_slug=module_slug,
                lesson_slug=lesson_slug,
                title=collapse_whitespace(title),
                description=collapse_whitespace(description),
                order=lesson_order,
                header_image=header_image,
                content=content,
            )
        )

    lessons.sort(
        key=lambda lesson: (
            module_order.get(lesson.module_slug, 9999),
            lesson.order,
            lesson.relative_path,
        )
    )
    return lessons


def load_images(images_dir: Path, required_suffix: str) -> list[Path]:
    if not images_dir.exists():
        raise FileNotFoundError(f"Images directory not found: {images_dir}")

    normalized_suffix = required_suffix.strip().lower()
    images = [
        path
        for path in images_dir.iterdir()
        if path.is_file()
        and path.suffix.lower() in SUPPORTED_EXTENSIONS
        and (not normalized_suffix or path.stem.lower().endswith(f"_{normalized_suffix}"))
    ]
    images.sort(key=lambda path: path.name.lower())
    return images


def update_lesson_content(
    lesson: LessonFile,
    public_image_path: str,
    header_alt: str,
    seo_description: str,
) -> str:
    frontmatter, body = split_frontmatter(lesson.content)
    updated_frontmatter = frontmatter
    updated_frontmatter = upsert_key(updated_frontmatter, "description", seo_description, ["title"])
    updated_frontmatter = upsert_key(
        updated_frontmatter,
        "headerImage",
        public_image_path,
        ["category", "order", "description"],
    )
    updated_frontmatter = upsert_key(
        updated_frontmatter,
        "headerImageAlt",
        header_alt,
        ["headerImage"],
    )
    return join_frontmatter(updated_frontmatter, body)


def build_assignments(
    lessons: list[LessonFile],
    images: list[Path],
    public_dir: Path,
    force: bool,
) -> list[Assignment]:
    pending_lessons = [lesson for lesson in lessons if force or not lesson.header_image]

    if not pending_lessons:
        return []

    if len(images) < len(pending_lessons):
        raise RuntimeError(
            f"Not enough images. Need {len(pending_lessons)}, found {len(images)}."
        )

    assignments: list[Assignment] = []
    for lesson, source_image in zip(pending_lessons, images):
        destination_name = build_destination_filename(lesson, source_image)
        destination_image = public_dir / destination_name
        public_image_path = f"/course-headers/{destination_name}"
        header_alt = build_alt_text(lesson.title)
        seo_description = build_seo_description(lesson.title, lesson.description)
        updated_content = update_lesson_content(
            lesson=lesson,
            public_image_path=public_image_path,
            header_alt=header_alt,
            seo_description=seo_description,
        )
        assignments.append(
            Assignment(
                lesson=lesson,
                source_image=source_image,
                destination_image=destination_image,
                public_image_path=public_image_path,
                header_alt=header_alt,
                seo_description=seo_description,
                updated_content=updated_content,
            )
        )
    return assignments


def build_seo_only_assignments(lessons: list[LessonFile], force: bool) -> list[Assignment]:
    assignments: list[Assignment] = []
    for lesson in lessons:
        if not lesson.header_image:
            continue
        if not force and "GinnyTech, creata da AD" in lesson.description:
            continue

        header_alt = build_alt_text(lesson.title)
        seo_description = build_seo_description(lesson.title, lesson.description)
        updated_content = update_lesson_content(
            lesson=lesson,
            public_image_path=lesson.header_image,
            header_alt=header_alt,
            seo_description=seo_description,
        )
        assignments.append(
            Assignment(
                lesson=lesson,
                source_image=None,
                destination_image=None,
                public_image_path=lesson.header_image,
                header_alt=header_alt,
                seo_description=seo_description,
                updated_content=updated_content,
            )
        )
    return assignments


def atomic_write_text(path: Path, content: str) -> None:
    temp_path = path.with_suffix(path.suffix + ".tmp")
    temp_path.write_text(normalize_newlines(content), encoding="utf-8", newline="\n")
    temp_path.replace(path)


def apply_assignment(assignment: Assignment) -> None:
    if not assignment.source_image or not assignment.destination_image:
        atomic_write_text(assignment.lesson.path, assignment.updated_content)
        return

    assignment.destination_image.parent.mkdir(parents=True, exist_ok=True)
    copied = False

    try:
        shutil.copy2(assignment.source_image, assignment.destination_image)
        copied = True

        if not assignment.destination_image.exists() or assignment.destination_image.stat().st_size == 0:
            raise RuntimeError(f"Destination image was not written correctly: {assignment.destination_image}")

        atomic_write_text(assignment.lesson.path, assignment.updated_content)
        assignment.source_image.unlink()
    except Exception:
        if copied and assignment.destination_image.exists():
            assignment.destination_image.unlink()
        raise


def format_report(assignments: list[Assignment], apply_mode: bool, leftover_images: list[Path]) -> str:
    mode = "APPLY" if apply_mode else "DRY-RUN"
    lines = [f"Mode: {mode}", f"Assignments: {len(assignments)}", ""]
    for item in assignments:
        lines.extend(
            [
                f"- Lesson: {item.lesson.relative_path}",
                f"  Source image: {item.source_image.name if item.source_image else 'existing headerImage'}",
                f"  Destination: {item.public_image_path}",
                f"  SEO description: {item.seo_description}",
                "",
            ]
        )

    if leftover_images:
        lines.append("Unused images:")
        for image in leftover_images:
            lines.append(f"- {image.name}")

    return "\n".join(lines).rstrip() + "\n"


def write_console(text: str) -> None:
    encoding = getattr(sys.stdout, "encoding", None) or "utf-8"
    if hasattr(sys.stdout, "buffer"):
        sys.stdout.buffer.write(text.encode(encoding, errors="replace"))
        return
    print(text.encode(encoding, errors="replace").decode(encoding), end="")


def main() -> int:
    args = parse_args()
    repo_root = Path(__file__).resolve().parents[2]

    images_dir = args.images_dir.resolve()
    lessons_dir = args.lessons_dir.resolve()
    public_dir = args.public_dir.resolve()

    module_order = read_module_order(repo_root)
    lessons = load_lessons(lessons_dir, module_order)
    if args.seo_only:
        assignments = build_seo_only_assignments(lessons, args.force)
        leftover_images: list[Path] = []
    else:
        images = load_images(images_dir, args.required_suffix)
        assignments = build_assignments(lessons, images, public_dir, args.force)
        leftover_images = images[len(assignments) :]

    if not assignments:
        print("No lessons need header images.")
        return 0

    if args.apply:
        for assignment in assignments:
            apply_assignment(assignment)

    report = format_report(assignments, args.apply, leftover_images)
    write_console(report)

    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(report, encoding="utf-8", newline="\n")

    if not args.apply:
        print("Dry-run only. Re-run with --apply to write changes.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
