import glob
import re
import os

folder_to_module = {
    'data-warehousing': 'Modulo 3: Infrastructure & Engineering',
    'infrastructure-ops': 'Modulo 3: Infrastructure & Engineering',
    'kafka-streaming': 'Modulo 4: Real-Time Streaming',
    'real-time-analytics': 'Modulo 4: Real-Time Streaming',
    's3-data-lake': 'Modulo 4: Real-Time Streaming',
    'data-collection': 'Modulo 2: Data Collection & Tracking',
    'analisi-prodotto': 'Modulo 5: Analytics & Data Science',
    'dashboard-visualizzazione': 'Modulo 6: Visualization & Reporting'
}

files = glob.glob('src/content/corso/**/*.mdx', recursive=True)
fixed_count = 0

for path in files:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if frontmatter exists and module is missing
    if content.startswith('---') and 'module: ' not in content:
        folder = os.path.basename(os.path.dirname(path))
        if folder in folder_to_module:
            module_name = folder_to_module[folder]
            # Inserire la chiave module sotto description o title nel frontmatter
            new_content = re.sub(
                r'^(description: .*)$', 
                f'\\1\nmodule: "{module_name}"', 
                content, 
                flags=re.MULTILINE
            )
            # fallback se description non esiste
            if new_content == content:
                new_content = re.sub(
                    r'^(title: .*)$', 
                    f'\\1\nmodule: "{module_name}"', 
                    content, 
                    flags=re.MULTILINE
                )
                
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                fixed_count += 1
                print(f"Fixato module in {path}")

print(f"Totale file fixati: {fixed_count}")
