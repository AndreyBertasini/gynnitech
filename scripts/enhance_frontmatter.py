import os
import re

DOCS_DIR = 'src/content/docs'

DIFFICULTY_MAPPING = {
    'introduction.mdx': ('Base', 'success'),
    'terminology.mdx': ('Base', 'success'),
    'quickstart.mdx': ('Base', 'success'),
    'brand.mdx': ('Base', 'success'),
    'pmf.mdx': ('Base', 'success'),
    'user-centricity.mdx': ('Base', 'success'),
    'analytic-traps.mdx': ('Intermedio', 'tip'),
    'attribution.mdx': ('Intermedio', 'tip'),
    'event-tracking.mdx': ('Intermedio', 'tip'),
    'dashboards.mdx': ('Intermedio', 'tip'),
    'economics.mdx': ('Intermedio', 'tip'),
    'nps-critique.mdx': ('Intermedio', 'tip'),
    'retention.mdx': ('Intermedio', 'tip'),
    'strategy.mdx': ('Intermedio', 'tip'),
    'unit-economics.mdx': ('Intermedio', 'tip'),
    'customer-analytics.mdx': ('Intermedio', 'tip'),
    'cluster-analysis.mdx': ('Intermedio', 'tip'),
    'costs.mdx': ('Intermedio', 'tip'),
    'dbt.mdx': ('Avanzato', 'danger'),
    'cicd.mdx': ('Avanzato', 'danger'),
    'clickhouse-rt.mdx': ('Avanzato', 'danger'),
    'clickhouse.mdx': ('Avanzato', 'danger'),
    'sql.mdx': ('Avanzato', 'danger'),
    'python.mdx': ('Avanzato', 'danger'),
    'integrations.mdx': ('Avanzato', 'danger'),
    'modeling.mdx': ('Avanzato', 'danger'),
    'quality.mdx': ('Avanzato', 'danger'),
    'olap.mdx': ('Avanzato', 'danger'),
    'streaming.mdx': ('Avanzato', 'danger'),
    'embeddings.mdx': ('Avanzato', 'danger'),
    'experimentation.mdx': ('Avanzato', 'danger'),
    'hadi-cycles.mdx': ('Avanzato', 'danger'),
    'text-generation.mdx': ('Avanzato', 'danger'),
    'framework.mdx': ('Avanzato', 'danger'),
}

def main():
    if not os.path.exists(DOCS_DIR): return
    
    for filename, (diff_text, diff_variant) in DIFFICULTY_MAPPING.items():
        filepath = os.path.join(DOCS_DIR, filename)
        if not os.path.exists(filepath): continue
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'badge:' in content: continue
        
        match = re.search(r'^---(.*?)---', content, re.DOTALL)
        if not match: continue
        
        frontmatter = match.group(1).rstrip()
        body = content[match.end():]
        
        new_sidebar = f"\nsidebar:\n  badge:\n    text: {diff_text}\n    variant: {diff_variant}\n"
        new_content = "---" + frontmatter + new_sidebar + "---" + body
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
    
    print("Frontmatter aggiornato per tutte le lezioni!")

if __name__ == '__main__':
    main()
