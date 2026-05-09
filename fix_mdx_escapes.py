#!/usr/bin/env python3
"""Fix all MDX files: escape unescaped < and > that aren't inside code blocks or HTML tags."""
import re
from pathlib import Path

COURSE_ROOT = Path("/root/projects/gynnitech/src/content/corso")
HTML_TAGS = {'a','abbr','address','area','article','aside','audio','b','bdi','bdo','blockquote',
    'br','button','canvas','caption','cite','code','col','colgroup','data','datalist','dd','del',
    'details','dfn','dialog','div','dl','dt','em','embed','fieldset','figcaption','figure','footer',
    'form','h1','h2','h3','h4','h5','h6','head','header','hr','i','iframe','img','input','ins',
    'kbd','label','legend','li','link','main','map','mark','meta','meter','nav','noscript','object',
    'ol','optgroup','option','output','p','picture','pre','progress','q','rp','rt','ruby','s','samp',
    'script','section','select','small','source','span','strong','style','sub','summary','sup',
    'svg','table','tbody','td','template','textarea','tfoot','th','thead','time','tr','u','ul','var',
    'video','wbr','Aside','Steps','Tabs','TabItem','Card','CardGrid'}

def fix_file(filepath):
    content = filepath.read_text(encoding='utf-8')
    lines = content.split('\n')
    in_code = False
    fixed_lines = []
    fixes = 0
    
    for line in lines:
        if line.strip().startswith('```'):
            in_code = not in_code
            fixed_lines.append(line)
            continue
        
        if in_code:
            fixed_lines.append(line)
            continue
        
        # Check if this line starts with a known HTML tag
        stripped = line.strip()
        # Line starts with < followed by a known tag name
        tag_match = re.match(r'^(\s*)<(\w+)', line)
        is_html_tag = False
        if tag_match:
            tag_name = tag_match.group(2)
            if tag_name in HTML_TAGS or tag_name.endswith('/>'):
                is_html_tag = True
        
        if is_html_tag:
            fixed_lines.append(line)
            continue
        
        # Escape < and > that are NOT in code blocks
        # Pattern: < followed by digit or letter but NOT a known HTML tag
        new_line = line
        
        # Replace <X patterns (comparison operators, etc.)
        # Match < followed by non-whitespace non-tag char
        new_line = re.sub(r'(?<!`)<(?![/!])(\d)', r'`&lt;`\1', new_line)
        new_line = re.sub(r'(?<!`)>(?![/!])(\d)', r'`&gt;`\1', new_line)
        
        # Match standalone < used as comparison: "x < y" but not "<tag>" and not "<=" 
        # Be more conservative: only fix clear comparison patterns
        new_line = re.sub(r'\)\s*<(\d)', r') `&lt;`\1', new_line)
        
        if new_line != line:
            fixes += 1
        
        fixed_lines.append(new_line)
    
    if fixes > 0:
        filepath.write_text('\n'.join(fixed_lines), encoding='utf-8')
        print(f"  {filepath.relative_to(COURSE_ROOT)}: {fixes} fixes")
    
    return fixes

total = 0
for mdx in sorted(COURSE_ROOT.rglob("*.mdx")):
    if ".bak" in str(mdx):
        continue
    total += fix_file(mdx)

print(f"\nTotal: {total} fixes across all files")
