
import os
import re

CONTENT_DIRS = [
    r"c:\Users\dyshkantiuk_andrii\Desktop\GYNNITECH\src\content\corso",
    r"c:\Users\dyshkantiuk_andrii\Desktop\GYNNITECH\src\content\blog"
]

def check_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract frontmatter
        match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
        if not match:
            print(f"[ERROR] No frontmatter: {filepath}")
            return False
            
        frontmatter = match.group(1)
        
        # Check for description
        if not re.search(r'^description:', frontmatter, re.MULTILINE):
            print(f"[ERROR] Missing description: {filepath}")
            return False
            
        # Check for title
        if not re.search(r'^title:', frontmatter, re.MULTILINE):
            print(f"[ERROR] Missing title: {filepath}")
            return False
            
        return True
    except Exception as e:
        print(f"[ERROR] Could not read {filepath}: {e}")
        return False

def main():
    has_error = False
    for content_dir in CONTENT_DIRS:
        if not os.path.exists(content_dir):
            print(f"Directory not found: {content_dir}")
            continue
            
        for root, dirs, files in os.walk(content_dir):
            for file in files:
                if file.endswith(".mdx") or file.endswith(".md"):
                    path = os.path.join(root, file)
                    if not check_file(path):
                        has_error = True
                        
    if not has_error:
        print("All files valid.")
    else:
        print("Validation failed.")

if __name__ == '__main__':
    main()
