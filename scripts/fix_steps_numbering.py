import os
import re

DOCS_DIR = 'src/content/docs'

def clean_steps_numbers(content):
    # Trova tutti i blocchi <Steps>...</Steps>
    def replace_numbers(match):
        steps_content = match.group(0)
        # Rimuove numeri manuali tipo "1. ", "2. " all'inizio della riga dentro <Steps>
        # ma solo se sono seguiti da un punto e spazio.
        cleaned = re.sub(r'^(\s*)\d+\.\s+', r'\1', steps_content, flags=re.MULTILINE)
        return cleaned

    return re.sub(r'<Steps>.*?</Steps>', replace_numbers, content, flags=re.DOTALL)

def main():
    for root, dirs, files in os.walk(DOCS_DIR):
        for filename in files:
            if filename.endswith('.mdx'):
                filepath = os.path.join(root, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = clean_steps_numbers(content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
    print("Numerazione duplicata rimossa da tutti i blocchi Steps!")

if __name__ == '__main__':
    main()
