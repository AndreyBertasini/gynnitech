import re
import os
import shutil

base_dir = r"c:\Users\dyshkantiuk_andrii\Desktop\gynnitech"
learning_path_file = os.path.join(base_dir, "_LEARNING_PATH.md")
content_dir = os.path.join(base_dir, "src", "content", "corso")
wrong_dir = os.path.join(content_dir, "data-collection")

with open(learning_path_file, 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(r'\(([a-z0-9-]+)/([a-z0-9-]+\.mdx)\)')
matches = pattern.findall(text)

moved_files = []
try:
    with open("fix_log.txt", "w", encoding="utf-8") as log:
        for folder, file_name in matches:
            if folder == "data-collection":
                continue
            
            source_path = os.path.join(wrong_dir, file_name)
            target_folder = os.path.join(content_dir, folder)
            target_path = os.path.join(target_folder, file_name)
            
            if os.path.exists(source_path):
                os.makedirs(target_folder, exist_ok=True)
                shutil.move(source_path, target_path)
                moved_files.append(file_name)
                log.write(f"Moved {file_name} to {folder}/\n")
        log.write(f"Total moved: {len(moved_files)}\n")
except Exception as e:
    with open("fix_error.txt", "w", encoding="utf-8") as err:
        err.write(str(e))
