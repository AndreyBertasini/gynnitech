#!/usr/bin/env python3
"""Fix <number patterns in MDX files outside code blocks."""
import re

files_to_fix = {
    'src/content/corso/data-collection/privacy.mdx': [('<50%', 'sotto il 50%')],
    'src/content/corso/data-collection/terminology.mdx': [],
    'src/content/corso/infrastructure-ops/caso-studio.mdx': [('<5s', 'sotto 5s'), ('<3K', 'sotto 3K')],
    'src/content/corso/kafka-streaming/caso-studio.mdx': [('<5 secondi', 'sotto 5 secondi')],
    'src/content/corso/marketing-data-science/caso-studio.mdx': [('<30%', 'sotto il 30%')],
    'src/content/corso/real-time-analytics/caso-studio.mdx': [('<10 secondi', 'sotto 10 secondi'), ('<3s', 'sotto 3s'), ('<10s', 'sotto 10s')],
    'src/content/corso/real-time-analytics/clickhouse-ottimizzazione.mdx': [('<10K', 'sotto 10K'), ('<1 byte', 'sotto 1 byte')],
}

for filepath, replacements in files_to_fix.items():
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        changed = False
        # Split by code blocks to only fix non-code parts
        segments = re.split(r'(```[\s\S]*?```)', content)
        new_segments = []
        for seg in segments:
            if seg.startswith('```'):
                new_segments.append(seg)
            else:
                for old, new in replacements:
                    if old in seg:
                        seg = seg.replace(old, new)
                        changed = True
                # Generic: any <digit not in a code block and not in HTML tag
                # Replace <N with "meno di N" for remaining cases
                orig = seg
                seg = re.sub(r'(?<!\w)<(\d)', r'meno di \1', seg)
                if seg != orig:
                    changed = True
                new_segments.append(seg)
        
        if changed:
            new_content = ''.join(new_segments)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'✅ {filepath}')
        else:
            print(f'⏭️ {filepath} (no changes needed)')
    except Exception as e:
        print(f'❌ {filepath}: {e}')
