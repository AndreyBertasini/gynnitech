import os
import re

content_dir = r"c:\Users\dyshkantiuk_andrii\Desktop\gynnitech\src\content"

# Regex to match the notionId line in the frontmatter
notion_id_pattern = re.compile(r'^notionId:\s*.*$\n?', re.MULTILINE)

modified_count = 0

for root, dirs, files in os.walk(content_dir):
    for file in files:
        if file.endswith(('.md', '.mdx')):
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            if notion_id_pattern.search(content):
                new_content = notion_id_pattern.sub('', content)
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                modified_count += 1

print(f"Removed notionId from {modified_count} files.")
