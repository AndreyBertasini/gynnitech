import os
import glob
import re

course_dir = 'src/content/corso/'
files = glob.glob(course_dir + '**/*.mdx', recursive=True)

report = {
    'well_done': [],
    'needs_improvement': [],
    'critical': []
}

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
        # Statistiche base
        words = len(content.split())
        code_blocks = len(re.findall(r'`.*?`', content, re.DOTALL))
        callouts = len(re.findall(r'<Callout', content))
        components = len(re.findall(r'<Card|<Accordion|<Steps', content))
        
        # Frontmatter
        has_module = 'module:' in content
        
        score = 0
        issues = []
        
        if words > 1000: score += 2
        elif words > 400: score += 1
        else: issues.append("Troppo corta (< 400 parole)")
        
        if code_blocks > 0: score += 1
        if callouts > 0 or components > 0: score += 1
        
        if not has_module:
            issues.append("Manca 'module:' nel frontmatter")
            score -= 1
            
        filename = os.path.basename(filepath)
        folder = os.path.basename(os.path.dirname(filepath))
        
        info = f"- **{folder}/{filename}** ({words} parole, {code_blocks} blocchi codice, {callouts+components} componenti)"
        if issues:
            info += f"<br>  ⚠️ Problemi: {', '.join(issues)}"
            
        if score >= 3:
            report['well_done'].append(info)
        elif score >= 1:
            report['needs_improvement'].append(info)
        else:
            report['critical'].append(info)

with open('QUALITY_REPORT.md', 'w', encoding='utf-8') as f:
    f.write('# Report Qualità Lezioni\n\n')
    
    f.write('## 🟢 Fatte Bene (Strutturate e Dettagliate)\n')
    for item in sorted(report['well_done']): f.write(item + '\n')
    
    f.write('\n## 🟡 Da Migliorare o Arricchire (Lunghezza media o pochi esempi)\n')
    for item in sorted(report['needs_improvement']): f.write(item + '\n')
        
    f.write('\n## 🔴 Critiche (Molto corte o da rifare)\n')
    for item in sorted(report['critical']): f.write(item + '\n')

print(f"Analizzati {len(files)} file. Report salvato in QUALITY_REPORT.md")
