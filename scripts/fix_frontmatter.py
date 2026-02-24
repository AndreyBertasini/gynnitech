#!/usr/bin/env python3
"""Fix frontmatter YAML: swap description >- and module lines."""
import glob, re

fixed = 0
for f in sorted(glob.glob('src/content/corso/**/*.mdx', recursive=True)):
    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()
    
    # Pattern: description: >-\r\nmodule: "..."\r\n  actual desc line1\r\n  actual desc line2
    # Fix to: description: >-\r\n  actual desc line1\r\n  actual desc line2\r\nmodule: "..."
    
    pattern = r'(description: >-\r?\n)(module: [^\r\n]+\r?\n)((?:  [^\r\n]+\r?\n)+)'
    
    def fix_match(m):
        desc_start = m.group(1)
        module_line = m.group(2)
        desc_body = m.group(3)
        return desc_start + desc_body + module_line
    
    new_content = re.sub(pattern, fix_match, content)
    
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(new_content)
        fixed += 1
        print(f'✅ {f}')

print(f'\nFixed: {fixed} files')
