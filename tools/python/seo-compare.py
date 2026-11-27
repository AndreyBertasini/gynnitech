"""Confronto prima/dopo di due CSV di scripts/seo-audit.ts.
Uso: python3 scripts/seo-compare.py before.csv after.csv dist/_redirects > out.csv
Per gli URL spariti indica il 301 di destinazione letto da _redirects (regole esatte e splat)."""
import csv, sys, re

def load(p): return {r['url']: r for r in csv.DictReader(open(p, encoding='utf-8'))}
before, after = load(sys.argv[1]), load(sys.argv[2])
rules = []
for line in open(sys.argv[3], encoding='utf-8'):
    parts = line.split()
    if len(parts) >= 2 and not parts[0].startswith('#') and parts[0].startswith('/'):
        rules.append((parts[0], parts[1], parts[2] if len(parts) > 2 else '301'))

def redirect(url):
    path = url.replace('https://ginnytech.it', '')
    for src, dst, code in rules:
        if '*' in src:
            prefix = src[:-1]
            if path.startswith(prefix): return code, dst.replace(':splat', path[len(prefix):])
        elif src == path or src == path.rstrip('/'):
            return code, dst
    return None

w = csv.writer(sys.stdout)
w.writerow(['url', 'stato_dopo', 'redirect_a', 'lang_prima', 'lang_dopo', 'canonical_prima', 'canonical_dopo',
            'indicizzabile_prima', 'indicizzabile_dopo', 'hreflang_en_prima', 'hreflang_en_dopo', 'parole_prima', 'parole_dopo'])
for url in sorted(set(before) | set(after)):
    b, a = before.get(url, {}), after.get(url, {})
    if a and a.get('indexable') != 'redirect':
        stato, dest = '200', ''
    else:
        r = redirect(url)
        stato, dest = (r[0], r[1]) if r else ('redirect-html' if a else '404', a.get('canonical', '') if a else '')
    w.writerow([url, stato, dest, b.get('lang', ''), a.get('lang', ''), b.get('canonical', ''), a.get('canonical', ''),
                b.get('indexable', ''), a.get('indexable', '') if a else 'no', b.get('hreflang_en', ''), a.get('hreflang_en', ''),
                b.get('words', ''), a.get('words', '')])
