"""
Generate PNG favicons from the cookie SVG using PIL.
Since we can't easily render SVG paths in pure PIL, we'll create the cookie icon
programmatically using the same design: a cookie shape with dot marks, colored #ccff00.
"""

from PIL import Image, ImageDraw
import math
import struct
import zlib


def draw_cookie(draw, cx, cy, radius, color, bg=None):
    """Draw cookie shape approximating the SVG biscuit icon."""
    # Main cookie body - irregular circle
    # Draw a slightly irregular circle for the cookie
    points = []
    num_points = 60
    for i in range(num_points):
        angle = 2 * math.pi * i / num_points
        # Add slight variation to make it look like a cookie
        r_var = radius * (1.0 + 0.03 * math.sin(3 * angle) + 0.02 * math.cos(5 * angle))
        x = cx + r_var * math.cos(angle)
        y = cy + r_var * math.sin(angle)
        points.append((x, y))
    
    draw.polygon(points, fill=color)
    
    # Bite mark - top right
    bite_x = cx + radius * 0.7
    bite_y = cy - radius * 0.7
    bite_r = radius * 0.22
    draw.ellipse(
        [bite_x - bite_r, bite_y - bite_r, bite_x + bite_r, bite_y + bite_r],
        fill=bg or (0, 0, 0, 0)
    )
    
    # Small dots (chocolate chips / marks) on the cookie
    dot_color = (100, 130, 0, 255)  # darker green dots
    dot_positions = [
        (0.2, -0.15),
        (-0.25, 0.1),
        (0.0, 0.3),
        (0.25, 0.25),
        (-0.1, -0.3),
        (0.35, -0.05),
        (-0.35, -0.2),
        (-0.1, 0.45),
        (0.15, -0.45),
    ]
    
    for dx, dy in dot_positions:
        px = cx + dx * radius * 1.3
        py = cy + dy * radius * 1.3
        # Check if dot is on cookie (rough circle check)
        dist = math.sqrt((px - cx) ** 2 + (py - cy) ** 2)
        if dist < radius * 0.85:
            dr = max(1, radius * 0.09)
            draw.ellipse([px - dr, py - dr, px + dr, py + dr], fill=dot_color)


def create_favicon_png(size, output_path):
    """Create a PNG favicon at the given size."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    cx = size / 2
    cy = size / 2
    radius = size * 0.42
    
    # Cookie color: #ccff00
    cookie_color = (204, 255, 0, 255)
    
    if size <= 16:
        # For very small sizes, just draw a simple circle
        draw.ellipse(
            [cx - radius, cy - radius, cx + radius, cy + radius],
            fill=cookie_color
        )
        # Simple bite mark
        bite_x = cx + radius * 0.65
        bite_y = cy - radius * 0.65
        bite_r = radius * 0.25
        draw.ellipse(
            [bite_x - bite_r, bite_y - bite_r, bite_x + bite_r, bite_y + bite_r],
            fill=(0, 0, 0, 0)
        )
    else:
        draw_cookie(draw, cx, cy, radius, cookie_color)
    
    img.save(output_path, "PNG")
    print(f"Saved: {output_path} ({size}x{size})")
    return img


def create_apple_touch_icon(output_path):
    """Create 180x180 apple touch icon with rounded corners on a dark background."""
    size = 180
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Dark rounded background
    bg_radius = 36
    bg_color = (13, 13, 13, 255)
    
    # Draw rounded rectangle background
    draw.rounded_rectangle([0, 0, size, size], radius=bg_radius, fill=bg_color)
    
    # Draw cookie on top
    cx = size / 2
    cy = size / 2
    radius = size * 0.38
    cookie_color = (204, 255, 0, 255)
    draw_cookie(draw, cx, cy, radius, cookie_color, bg=bg_color)
    
    img.save(output_path, "PNG")
    print(f"Saved: {output_path} (180x180 apple touch)")


def create_ico(output_path, sizes=[16, 32, 48]):
    """Create .ico file with multiple sizes."""
    images = []
    for size in sizes:
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        cx = size / 2
        cy = size / 2
        radius = size * 0.42
        cookie_color = (204, 255, 0, 255)
        
        if size <= 16:
            draw.ellipse(
                [cx - radius, cy - radius, cx + radius, cy + radius],
                fill=cookie_color
            )
            bite_x = cx + radius * 0.65
            bite_y = cy - radius * 0.65
            bite_r = radius * 0.25
            draw.ellipse(
                [bite_x - bite_r, bite_y - bite_r, bite_x + bite_r, bite_y + bite_r],
                fill=(0, 0, 0, 0)
            )
        else:
            draw_cookie(draw, cx, cy, radius, cookie_color)
        
        images.append(img)
    
    images[0].save(output_path, format='ICO', sizes=[(s, s) for s in sizes], append_images=images[1:])
    print(f"Saved: {output_path} (ICO with sizes {sizes})")


if __name__ == "__main__":
    import os
    public_dir = os.path.join(os.path.dirname(__file__), '..', 'public')
    
    # Generate favicon PNGs
    create_favicon_png(16, os.path.join(public_dir, 'favicon-16x16.png'))
    create_favicon_png(32, os.path.join(public_dir, 'favicon-32x32.png'))
    
    # Generate apple touch icon
    create_apple_touch_icon(os.path.join(public_dir, 'apple-touch-icon.png'))
    
    # Generate ICO
    create_ico(os.path.join(public_dir, 'favicon.ico'))
    
    print("\nAll favicons generated successfully!")
    print("Remember to deploy these updated files to ginnytech.it")
    print("Then request Google to re-crawl the favicon via Google Search Console")
