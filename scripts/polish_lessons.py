import os

DOCS_DIR = 'src/content/docs'

def main():
    for root, dirs, files in os.walk(DOCS_DIR):
        for filename in files:
            if filename.endswith('.mdx'):
                filepath = os.path.join(root, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Sostituzioni semplici per migliorare la leggibilità
                content = content.replace('##', '\n\n##')
                content = content.replace('<Aside', '\n\n<Aside')
                content = content.replace('</Aside>', '</Aside>\n\n')
                content = content.replace('<Steps>', '\n\n<Steps>\n')
                content = content.replace('</Steps>', '\n</Steps>\n\n')
                content = content.replace('<CardGrid>', '\n\n<CardGrid>\n')
                content = content.replace('</CardGrid>', '\n</CardGrid>\n\n')
                content = content.replace('```', '\n\n```\n')
                
                # Pulizia multipli newline
                while '\n\n\n' in content:
                    content = content.replace('\n\n\n', '\n\n')
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content.strip() + '\n')
    print("Formattazione migliorata su tutti i file!")

if __name__ == '__main__':
    main()
