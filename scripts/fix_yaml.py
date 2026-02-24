import os

DOCS_DIR = 'src/content/corso'

def fix_yaml(content):
    lines = content.split('
')
    new_lines = []
    in_frontmatter = False
    count = 0
    for line in lines:
        if line.strip() == '---':
            count += 1
            in_frontmatter = (count == 1)
            new_lines.append(line)
            continue
        
        if in_frontmatter:
            if line.startswith('description:'):
                val = line.split(':', 1)[1].strip().strip('"').strip("'").replace('"', '"')
                new_lines.append(f'description: "{val}"')
            elif line.startswith('title:'):
                val = line.split(':', 1)[1].strip().strip('"').strip("'").replace('"', '"')
                new_lines.append(f'title: "{val}"')
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)
    return '
'.join(new_lines)

def main():
    if not os.path.exists(DOCS_DIR): return
    for root, dirs, files in os.walk(DOCS_DIR):
        for filename in files:
            if filename.endswith('.mdx'):
                filepath = os.path.join(root, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                new_content = fix_yaml(content)
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
    print("Frontmatter sistemato!")

if __name__ == '__main__':
    main()
