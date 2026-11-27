#!/usr/bin/env python3
"""
One-command pipeline for future lesson header images.

Recommended workflow:
1. Put only NEW raw images into `images/inbox/`.
2. Run this script in dry-run mode to preview work.
3. Re-run with `--apply` to:
   - generate `_fix` variants with the bottom fade
   - assign only `_fix` images to lessons without a header image
   - update SEO description and alt text
   - optionally run a production build check
   - delete raw inbox images after successful assignment

Important:
- Use a dedicated inbox directory for new images.
- Do not mix old archive images into the inbox.
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

import add_bottom_fade_fix as fade_script
import assign_lesson_header_images as assign_script


@dataclass
class PipelineSummary:
    raw_images_found: int
    fix_images_existing: int
    fix_images_created: int
    fix_images_skipped: int
    assignments: int
    raw_images_deleted: int
    build_ran: bool
    build_ok: bool
    input_dir: Path
    report_path: Path | None


def parse_args() -> argparse.Namespace:
    script_dir = Path(__file__).resolve().parent
    repo_root = script_dir.parent.parent

    parser = argparse.ArgumentParser(
        description="Prepare, assign, and verify future lesson header images with a single command.",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Write changes. Default is dry-run only.",
    )
    parser.add_argument(
        "--build",
        action="store_true",
        help="Run `npm run build` after assignments.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing lesson header assignments.",
    )
    parser.add_argument(
        "--keep-raw",
        action="store_true",
        help="Keep raw inbox images after successful assignment.",
    )
    parser.add_argument(
        "--overwrite-fix",
        action="store_true",
        help="Regenerate existing `_fix` images in the inbox.",
    )
    parser.add_argument(
        "--input-dir",
        type=Path,
        default=repo_root / "images" / "inbox",
        help="Dedicated inbox for NEW raw images. Default: <repo>/images/inbox",
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
        help="Public destination for lesson headers. Default: <repo>/public/course-headers",
    )
    parser.add_argument(
        "--suffix",
        default="fix",
        help="Suffix for generated images. Default: fix",
    )
    parser.add_argument(
        "--color",
        default="#050505",
        help="Fade color. Default: #050505",
    )
    parser.add_argument(
        "--coverage",
        type=float,
        default=0.15,
        help="Fade coverage ratio from the bottom. Default: 0.15",
    )
    parser.add_argument(
        "--report",
        type=Path,
        default=repo_root / "output" / "process-new-lesson-header-images.log",
        help="Optional text report path.",
    )
    return parser.parse_args()


def dedupe_sorted(paths: list[Path]) -> list[Path]:
    unique: dict[str, Path] = {}
    for path in paths:
        unique[str(path.resolve()).lower()] = path
    return sorted(unique.values(), key=lambda current: current.name.lower())


def build_raw_path_from_fix(fix_path: Path, suffix: str) -> Path | None:
    marker = f"_{suffix.lower()}"
    stem_lower = fix_path.stem.lower()
    if not stem_lower.endswith(marker):
        return None
    raw_stem = fix_path.stem[: -len(marker)]
    return fix_path.with_name(f"{raw_stem}{fix_path.suffix.lower()}")


def describe_pending_lessons(lessons: list[assign_script.LessonFile], force: bool) -> list[assign_script.LessonFile]:
    return [lesson for lesson in lessons if force or not lesson.header_image]


def build_report(
    apply_mode: bool,
    summary: PipelineSummary,
    raw_images: list[Path],
    created_fix_images: list[Path],
    existing_fix_images: list[Path],
    assignments: list[assign_script.Assignment],
) -> str:
    mode = "APPLY" if apply_mode else "DRY-RUN"
    lines = [
        f"Mode: {mode}",
        f"Inbox: {summary.input_dir}",
        f"Raw images found: {summary.raw_images_found}",
        f"Existing fix images: {summary.fix_images_existing}",
        f"Fix images created: {summary.fix_images_created}",
        f"Fix images skipped: {summary.fix_images_skipped}",
        f"Assignments: {summary.assignments}",
        f"Raw images deleted: {summary.raw_images_deleted}",
        f"Build ran: {'yes' if summary.build_ran else 'no'}",
        f"Build status: {'ok' if summary.build_ok else 'not-run'}",
        f"Report path: {summary.report_path if summary.report_path else 'none'}",
        "",
    ]

    if raw_images:
        lines.append("Raw images:")
        for image in raw_images:
            lines.append(f"- {image.name}")
        lines.append("")

    if created_fix_images:
        lines.append("Generated _fix images:")
        for image in created_fix_images:
            lines.append(f"- {image.name}")
        lines.append("")

    if existing_fix_images:
        lines.append("Existing _fix images reused:")
        for image in existing_fix_images:
            lines.append(f"- {image.name}")
        lines.append("")

    if assignments:
        lines.append("Lesson assignments:")
        for item in assignments:
            lines.extend(
                [
                    f"- {item.lesson.relative_path}",
                    f"  Source: {item.source_image.name if item.source_image else 'existing headerImage'}",
                    f"  Public path: {item.public_image_path}",
                ]
            )
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def main() -> int:
    args = parse_args()
    repo_root = Path(__file__).resolve().parents[2]
    input_dir = args.input_dir.resolve()
    lessons_dir = args.lessons_dir.resolve()
    public_dir = args.public_dir.resolve()
    report_path = args.report.resolve() if args.report else None

    if not 0 < args.coverage <= 1:
        raise ValueError("--coverage must be greater than 0 and less than or equal to 1.")

    if not input_dir.exists():
        print(f"Inbox not found: {input_dir}")
        print("Create the folder and place only NEW raw images inside it.")
        return 0

    module_order = assign_script.read_module_order(repo_root)
    lessons = assign_script.load_lessons(lessons_dir, module_order)
    pending_lessons = describe_pending_lessons(lessons, args.force)

    raw_images = fade_script.collect_images(input_dir, args.suffix)
    existing_fix_images = assign_script.load_images(input_dir, args.suffix)
    planned_fix_images: list[Path] = []
    skipped_fix_images: list[Path] = []

    for raw_image in raw_images:
        fix_image = fade_script.build_output_path(raw_image, input_dir, args.suffix)
        planned_fix_images.append(fix_image)
        if fix_image.exists() and not args.overwrite_fix:
            skipped_fix_images.append(fix_image)

    available_fix_images = dedupe_sorted(existing_fix_images + planned_fix_images)

    if not pending_lessons:
        print("No lessons without headerImage were found.")
        return 0

    if not available_fix_images:
        print(f"No `_fix` images are available in {input_dir}.")
        print("Put new raw images in the inbox or pre-generate `_fix` images there.")
        return 1

    if len(available_fix_images) < len(pending_lessons):
        print(
            f"Not enough images for pending lessons. Need {len(pending_lessons)}, found {len(available_fix_images)}."
        )
        return 1

    assignments = assign_script.build_assignments(
        lessons=lessons,
        images=available_fix_images,
        public_dir=public_dir,
        force=args.force,
    )

    created_fix_images: list[Path] = []
    raw_images_deleted = 0
    build_ok = False

    if args.apply:
        for raw_image in raw_images:
            fix_image = fade_script.build_output_path(raw_image, input_dir, args.suffix)
            if fix_image.exists() and not args.overwrite_fix:
                continue
            fade_script.process_image(
                source_path=raw_image,
                destination_path=fix_image,
                color_hex=args.color,
                coverage=args.coverage,
            )
            created_fix_images.append(fix_image)

        fix_images_after_processing = assign_script.load_images(input_dir, args.suffix)
        assignments = assign_script.build_assignments(
            lessons=lessons,
            images=fix_images_after_processing,
            public_dir=public_dir,
            force=args.force,
        )

        for assignment in assignments:
            assign_script.apply_assignment(assignment)

        if args.build:
            build_result = subprocess.run(
                ["npm", "run", "build"],
                cwd=repo_root,
                check=False,
            )
            if build_result.returncode != 0:
                raise SystemExit(build_result.returncode)
            build_ok = True

        if not args.keep_raw:
            raw_paths_to_delete = []
            for assignment in assignments:
                if not assignment.source_image:
                    continue
                raw_path = build_raw_path_from_fix(assignment.source_image, args.suffix)
                if raw_path and raw_path.exists():
                    raw_paths_to_delete.append(raw_path)

            for raw_path in dedupe_sorted(raw_paths_to_delete):
                raw_path.unlink()
                raw_images_deleted += 1

    summary = PipelineSummary(
        raw_images_found=len(raw_images),
        fix_images_existing=len(existing_fix_images),
        fix_images_created=len(created_fix_images),
        fix_images_skipped=len(skipped_fix_images),
        assignments=len(assignments),
        raw_images_deleted=raw_images_deleted,
        build_ran=args.build,
        build_ok=build_ok,
        input_dir=input_dir,
        report_path=report_path,
    )

    report = build_report(
        apply_mode=args.apply,
        summary=summary,
        raw_images=raw_images,
        created_fix_images=created_fix_images,
        existing_fix_images=existing_fix_images,
        assignments=assignments,
    )

    print(report, end="")
    if report_path:
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(report, encoding="utf-8", newline="\n")

    if not args.apply:
        print("Dry-run only. Re-run with --apply to write changes.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
