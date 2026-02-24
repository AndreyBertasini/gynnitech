import os

DOCS_DIR = 'src/content/docs'
FEEDBACK_IMPORT = "import { Feedback } from '../../../components/Feedback';"
FEEDBACK_TAG = "

<Feedback client:load />
"

def main():
    if not os.path.exists(DOCS_DIR): return
    
    for filename in os.listdir(DOCS_DIR):
        if filename.endswith('.mdx'):
            filepath = os.path.join(DOCS_DIR, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if '<Feedback' in content: continue
            
            if FEEDBACK_IMPORT not in content:
                if content.startswith('---'):
                    parts = content.split('---', 2)
                    if len(parts) >= 3:
                        content = f"---{parts[1]}---" + f"
{FEEDBACK_IMPORT}
" + parts[2]
            
            new_content = content.rstrip() + FEEDBACK_TAG
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
    
    print("Componente Feedback aggiunto a tutte le lezioni!")

if __name__ == '__main__':
    main()
