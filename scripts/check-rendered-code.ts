/**
 * Dopo `astro build`: confronta, pagina per pagina, i blocchi di codice, i diagrammi Mermaid e le
 * formule del sorgente MDX con l'HTML generato (lezioni e blog). Fallisce se una pagina ha un
 * numero diverso di blocchi Expressive Code o Mermaid, formule KaTeX in errore, oppure se in
 * qualunque pagina di `dist` resta un blocco non renderizzato.
 */
import fs from 'node:fs';
import path from 'node:path';
import { auditRenderedHtml, pageErrors, sourceExpectation } from './lib/rendered-code-audit';

const root = process.cwd();
const dist = path.join(root, 'dist');

const walk = (dir: string, test: (f: string) => boolean): string[] =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name);
        return e.isDirectory() ? walk(p, test) : test(p) ? [p] : [];
      })
    : [];

const isMd = (p: string) => /\.mdx?$/.test(p);

interface Source {
  file: string;
  /** Pagine HTML in cui il sorgente viene renderizzato (la prima che esiste). */
  html: string[];
}

const slugOf = (f: string) => f.replace(/\.mdx?$/, '');
const sources: Source[] = [
  // Lezioni: solo quelle dentro un modulo, renderizzate da `course/[module]/[slug].astro`.
  ...walk(path.join(root, 'src/content/corso'), isMd)
    .filter((f) => path.dirname(f) !== path.join(root, 'src/content/corso'))
    .map((file) => ({
      file,
      html: [path.join(dist, 'course', path.relative(path.join(root, 'src/content/corso'), slugOf(file)), 'index.html')],
    })),
  ...walk(path.join(root, 'src/content/blog'), isMd).map((file) => ({
    file,
    html: [path.join(dist, 'blog', path.relative(path.join(root, 'src/content/blog'), slugOf(file)), 'index.html')],
  })),
  // blog-en non ha una pagina per sorgente (si pubblicano solo le traduzioni riviste, slug da frontmatter):
  // le sue pagine, se esistono, sono coperte dalla scansione generale di `dist` qui sotto.
];

if (!fs.existsSync(path.join(dist, 'course'))) {
  console.error('dist/course non esiste: esegui `astro build` prima di `check:rendered-code`.');
  process.exit(1);
}

const errors: string[] = [];
const tot = { pages: 0, code: 0, mermaid: 0, noPage: 0 };
const checked = new Set<string>();

for (const src of sources) {
  const exp = sourceExpectation(fs.readFileSync(src.file, 'utf8'));
  const htmlFile = src.html.find((h) => fs.existsSync(h));
  if (!htmlFile) {
    // Un sorgente senza pagina (bozza, redirect) non ha nulla da confrontare, ma non deve passare in silenzio
    // se ha blocchi da renderizzare.
    if (exp.code || exp.mermaid || exp.doubleDollarMath) {
      tot.noPage += 1;
    }
    continue;
  }
  checked.add(htmlFile);
  tot.pages += 1;
  tot.code += exp.code;
  tot.mermaid += exp.mermaid;
  for (const e of pageErrors(exp, auditRenderedHtml(fs.readFileSync(htmlFile, 'utf8')))) {
    errors.push(`${path.relative(root, htmlFile)}: ${e}`);
  }
}

// Rete di sicurezza: qualunque altra pagina di dist non deve contenere blocchi non renderizzati.
for (const f of walk(dist, (p) => p.endsWith('.html')).filter((p) => !checked.has(p))) {
  const r = auditRenderedHtml(fs.readFileSync(f, 'utf8'));
  if (r.plainCode.length || r.plainMermaid || r.katexError) {
    errors.push(`${path.relative(root, f)}: ${r.plainCode.length + r.plainMermaid} blocchi non renderizzati, ${r.katexError} formule in errore`);
  }
}

console.log(
  `check:rendered-code — ${tot.pages} pagine confrontate col sorgente (${tot.code} blocchi di codice, ${tot.mermaid} diagrammi)` +
    (tot.noPage ? `; ${tot.noPage} sorgenti con codice/formule senza pagina in dist (non confrontati)` : ''),
);
if (errors.length) {
  for (const e of errors.slice(0, 20)) console.error(`✗ ${e}`);
  if (errors.length > 20) console.error(`… e altri ${errors.length - 20} errori`);
  process.exit(1);
}
console.log('✓ codice, diagrammi e formule renderizzati come promettono i sorgenti');
