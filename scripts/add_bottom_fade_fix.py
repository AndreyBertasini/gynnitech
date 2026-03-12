#!/usr/bin/env python3
"""
Add a bottom fade overlay to images.

Fade rules:
- color: #050505
- opacity: 100% at the bottom edge
- transparency: fades to 0% moving upward
- coverage: bottom 15% of the image height

Output naming:
- each generated file is saved with `_fix` appended before the extension
  Example: `hero.png` -> `hero_fix.png`

The script does not delete or overwrite originals unless `--overwrite` is used
for already-generated `_fix` files.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError as exc:
    raise SystemExit("Pillow is required. Install it with: pip install Pillow") from exc


SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".avif"}


def parse_args() -> argparse.Namespace:
    script_dir = Path(__file__).resolve().parent
    repo_root = script_dir.parent

    parser = argparse.ArgumentParser(
        description="Add a bottom fade overlay and save each result with `_fix` in the filename.",
    )
    parser.add_argument(
        "--input-dir",
        type=Path,
        default=repo_root / "images",
        help="Directory containing source images. Default: <repo>/images",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=None,
        help="Directory for processed images. Default: same as --input-dir",
    )
    parser.add_argument(
        "--suffix",
        default="fix",
        help="Suffix appended to processed filenames. Default: fix",
    )
    parser.add_argument(
        "--color",
        default="#050505",
        help="Fade color in hex. Default: #050505",
    )
    parser.add_argument(
        "--coverage",
        type=float,
        default=0.15,
        help="Bottom coverage ratio for the fade. Default: 0.15 (15%%)",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Overwrite existing generated files with the same suffixed name.",
    )
    return parser.parse_args()


def parse_hex_color(value: str) -> tuple[int, int, int]:
    color = value.strip().lstrip("#")
    if len(color) != 6:
        raise ValueError(f"Invalid hex color: {value}")
    return tuple(int(color[index : index + 2], 16) for index in (0, 2, 4))


def collect_images(input_dir: Path, suffix: str) -> list[Path]:
    if not input_dir.exists():
        raise FileNotFoundError(f"Input directory not found: {input_dir}")

    images = []
    suffix_marker = f"_{suffix.lower()}"
    for path in sorted(input_dir.iterdir(), key=lambda current: current.name.lower()):
        if not path.is_file():
            continue
        if path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue
        if path.stem.lower().endswith(suffix_marker):
            continue
        images.append(path)
    return images


def build_output_path(source_path: Path, output_dir: Path, suffix: str) -> Path:
    return output_dir / f"{source_path.stem}_{suffix}{source_path.suffix.lower()}"


def create_bottom_fade_overlay(
    width: int,
    height: int,
    color: tuple[int, int, int],
    coverage: float,
) -> Image.Image:
    fade_height = max(1, int(round(height * coverage)))
    start_y = height - fade_height
    red, green, blue = color

    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))

    gradient = Image.new("L", (1, fade_height))
    gradient.putdata(
        [
            int(round(255 * (index / max(1, fade_height - 1))))
            for index in range(fade_height)
        ]
    )
    alpha_band = gradient.resize((width, fade_height))

    color_band = Image.new("RGBA", (width, fade_height), (red, green, blue, 255))
    color_band.putalpha(alpha_band)
    overlay.paste(color_band, (0, start_y), color_band)

    return overlay


def save_result_image(result: Image.Image, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    extension = destination.suffix.lower()

    if extension in {".jpg", ".jpeg"}:
        result.convert("RGB").save(destination, quality=95, optimize=True)
        return

    if extension == ".webp":
        result.save(destination, quality=95, method=6)
        return

    result.save(destination)


def process_image(
    source_path: Path,
    destination_path: Path,
    color_hex: str,
    coverage: float,
) -> None:
    color = parse_hex_color(color_hex)

    with Image.open(source_path) as source_image:
        base = source_image.convert("RGBA")
        width, height = base.size
        overlay = create_bottom_fade_overlay(width, height, color, coverage)
        result = Image.alpha_composite(base, overlay)
        save_result_image(result, destination_path)


def main() -> int:
    args = parse_args()
    input_dir = args.input_dir.resolve()
    output_dir = (args.output_dir or args.input_dir).resolve()

    if not 0 < args.coverage <= 1:
        raise ValueError("--coverage must be greater than 0 and less than or equal to 1.")

    images = collect_images(input_dir, args.suffix)
    if not images:
        print("No source images found to process.")
        return 0

    processed = 0
    skipped = 0

    for image_path in images:
        destination_path = build_output_path(image_path, output_dir, args.suffix)
        if destination_path.exists() and not args.overwrite:
            print(f"SKIP {destination_path.name} already exists")
            skipped += 1
            continue

        process_image(
            source_path=image_path,
            destination_path=destination_path,
            color_hex=args.color,
            coverage=args.coverage,
        )
        print(f"SAVED {destination_path.name}")
        processed += 1

    print("")
    print(f"Processed: {processed}")
    print(f"Skipped: {skipped}")
    print(f"Output dir: {output_dir}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
