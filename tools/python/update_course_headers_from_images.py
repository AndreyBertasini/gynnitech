from __future__ import annotations

import argparse
import json
import re
import shutil
from pathlib import Path


HEADER_IMAGE_RE = re.compile(r"^headerImage:\s*'(?P<path>/course-headers/[^']+)'", re.MULTILINE)
SOURCE_IMAGE_RE = re.compile(r"^(?P<index>\d{3})_.+_fix\.png$", re.IGNORECASE)


def collect_header_targets(repo_root: Path) -> list[dict[str, str]]:
    lessons_root = repo_root / "src" / "content" / "corso"
    targets: list[dict[str, str]] = []

    for lesson_path in sorted(lessons_root.rglob("*.mdx")):
        relative_lesson = lesson_path.relative_to(repo_root).as_posix()
        text = lesson_path.read_text(encoding="utf-8", errors="ignore")
        match = HEADER_IMAGE_RE.search(text)
        if not match:
            continue

        public_path = match.group("path")
        targets.append(
            {
                "lesson": relative_lesson,
                "headerImage": public_path,
                "targetFile": str(Path("public") / public_path.lstrip("/")),
            }
        )

    return targets


def collect_source_images(repo_root: Path) -> list[Path]:
    images_root = repo_root / "images"
    numbered_images = []

    for image_path in images_root.glob("*.png"):
        match = SOURCE_IMAGE_RE.match(image_path.name)
        if not match:
            continue
        numbered_images.append((int(match.group("index")), image_path.name.lower(), image_path))

    numbered_images.sort(key=lambda item: (item[0], item[1]))
    return [item[2] for item in numbered_images]


def apply_images(
    repo_root: Path,
    manifest_path: Path,
    dry_run: bool = False,
) -> dict[str, int | str]:
    targets = collect_header_targets(repo_root)
    sources = collect_source_images(repo_root)

    if len(sources) < len(targets):
        raise RuntimeError(
            f"Not enough source images in {repo_root / 'images'}: found {len(sources)}, need {len(targets)}."
        )

    manifest_entries = []
    for index, target in enumerate(targets):
        source = sources[index]
        destination = repo_root / target["targetFile"]

        manifest_entries.append(
            {
                "lesson": target["lesson"],
                "headerImage": target["headerImage"],
                "sourceImage": source.relative_to(repo_root).as_posix(),
            }
        )

        if dry_run:
            continue

        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, destination)

    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(
        json.dumps(manifest_entries, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    return {
        "updatedHeaders": len(targets),
        "sourceImagesUsed": len(targets),
        "manifest": manifest_path.relative_to(repo_root).as_posix(),
        "dryRun": dry_run,
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Update course header images using numbered PNG assets from the images directory."
    )
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=Path(__file__).resolve().parents[2],
        help="Repository root path.",
    )
    parser.add_argument(
        "--manifest",
        type=Path,
        default=Path("output/course-header-image-manifest.json"),
        help="Relative path for the generated manifest.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Build the manifest without copying files.",
    )
    args = parser.parse_args()

    repo_root = args.repo_root.resolve()
    manifest_path = args.manifest if args.manifest.is_absolute() else repo_root / args.manifest
    result = apply_images(repo_root=repo_root, manifest_path=manifest_path, dry_run=args.dry_run)
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
