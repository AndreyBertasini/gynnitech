/**
 * Dopo `astro build`: fallisce se nelle lezioni (`dist/course`) resta codice non evidenziato,
 * un diagramma Mermaid non disegnato, o se le formule KaTeX calano.
 */
import fs from 'node:fs';
import path from 'node:path';
import { auditRenderedHtml, countSourceFences } from './lib/rendered-code-audit';

const MIN_KATEX = 1524;
const root = process.cwd();
const distDir = path.join(root, 'dist', 'course');
const srcDir = path.join(root, 'src', 'content', 'corso');

const walk = (dir: string, test: (f: string) => boolean): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p, test) : test(p) ? [p] : [];
  });

if (!fs.existsSync(distDir)) {
  console.error('dist/course non esiste: esegui `astro build` prima di `check:rendered-code`.');
  process.exit(1);
}

const src = { code: 0, mermaid: 0 };
// Solo le lezioni dentro un modulo: sono quelle renderizzate da `course/[module]/[slug].astro`.
for (const f of walk(srcDir, (p) => /\.mdx?$/.test(p) && path.dirname(p) !== srcDir)) {
  const c = countSourceFences(fs.readFileSync(f, 'utf8'));
  src.code += c.code;
  src.mermaid += c.mermaid;
}

const tot = { ec: 0, mermaid: 0, katex: 0, plainMermaid: 0 };
const plain = new Map<string, string[]>();
for (const f of walk(distDir, (p) => p.endsWith('.html'))) {
  const r = auditRenderedHtml(fs.readFileSync(f, 'utf8'));
  tot.ec += r.ec;
  tot.mermaid += r.mermaid;
  tot.katex += r.katex;
  tot.plainMermaid += r.plainMermaid;
  if (r.plainCode.length || r.plainMermaid) {
    plain.set(path.relative(root, f), [...r.plainCode, ...Array(r.plainMermaid).fill('mermaid')]);
  }
}

const errors: string[] = [];
const plainTotal = [...plain.values()].reduce((s, v) => s + v.length, 0);
if (plainTotal > 0) {
  errors.push(`${plainTotal} blocchi non renderizzati in ${plain.size} pagine (es. ${[...plain.keys()][0]}: ${[...plain.values()][0].slice(0, 5).join(', ')})`);
}
if (tot.ec < src.code) errors.push(`Expressive Code: ${tot.ec} blocchi, attesi almeno ${src.code} dai sorgenti`);
if (tot.mermaid < src.mermaid) errors.push(`Mermaid: ${tot.mermaid} diagrammi, attesi almeno ${src.mermaid}`);
if (tot.katex < MIN_KATEX) errors.push(`KaTeX: ${tot.katex} formule, attese almeno ${MIN_KATEX}`);

console.log(`check:rendered-code — sorgenti: ${src.code} codice, ${src.mermaid} mermaid | dist: ${tot.ec} expressive-code, ${tot.mermaid} mermaid, ${tot.katex} katex`);
if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  process.exit(1);
}
console.log('✓ codice, diagrammi e formule renderizzati in tutte le lezioni');
