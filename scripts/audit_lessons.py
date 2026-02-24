import os
import re

DOCS_DIR = 'src/content/docs'
TRACKING_FILE = 'TRACKING_LEZIONI.md'

def count_chars(text):
    # Rimuove l'intestazione frontmatter
    content = re.sub(r'^---.*?---', '', text, flags=re.DOTALL | re.MULTILINE)
    return len(content.strip())

def extract_title(text):
    match = re.search(r'^title:\s*(.+)$', text, flags=re.MULTILINE)
    if match:
        return match.group(1).strip(" '\"")
    return "Senza Titolo"

def main():
    if not os.path.exists(DOCS_DIR):
        print(f"Errore: Cartella {DOCS_DIR} non trovata.")
        return

    files_data = []
    
    for filename in os.listdir(DOCS_DIR):
        if filename.endswith('.mdx') or filename.endswith('.md'):
            filepath = os.path.join(DOCS_DIR, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            title = extract_title(content)
            chars = count_chars(content)
            
            # Determina lo stato
            if chars < 500:
                status = "🔴 Da Scrivere"
            elif chars < 3000:
                status = "🟡 Da Ampliare (<3000)"
            else:
                status = "🟢 Completa"
                
            files_data.append({
                'file': filename,
                'title': title,
                'chars': chars,
                'status': status
            })

    # Ordina per nome file
    files_data.sort(key=lambda x: x['file'])

    # Scrivi il report
    with open(TRACKING_FILE, 'w', encoding='utf-8') as f:
        f.write("# 📊 Tracker Lezioni Corso MarTech\n\n")
        f.write("Questo file tiene traccia dello stato di avanzamento della riscrittura delle lezioni.\n")
        f.write("L'obiettivo è che ogni lezione abbia lo stato **🟢 Completa** (minimo 3000 caratteri di contenuto di alta qualità).\n\n")
        f.write("| File | Titolo Lezione | Caratteri | Stato |\n")
        f.write("|---|---|---|---|\n")
        
        for data in files_data:
            f.write(f"| `{data['file']}` | {data['title']} | {data['chars']} | {data['status']} |\n")

    print(f"Tracker generato con successo in: {TRACKING_FILE}")

if __name__ == '__main__':
    main()
