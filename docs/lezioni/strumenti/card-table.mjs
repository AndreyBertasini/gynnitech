// Uso: node card-table.mjs <modulo> — stampa la tabella delle lezioni per la scheda
import fs from 'node:fs';
const W = 'C:/Users/User/Desktop/gynnitech/.claude/worktrees/analizza-corsi-structure-f4afab/src/content/corso';
const m = process.argv[2];
const rows = fs.readdirSync(`${W}/${m}`).filter((f) => f.endsWith('.mdx')).map((f) => {
  const raw = fs.readFileSync(`${W}/${m}/${f}`, 'utf8').replace(/\r\n/g, '\n');
  const order = +/^order:\s*(\d+)/m.exec(raw)?.[1];
  const sez = JSON.parse(/^sezioni:\s*(\[.*\])$/m.exec(raw)?.[1] ?? '[]');
  const sch = [...raw.matchAll(/^<Schema [^>]*titolo="([^"]*)"/gm)].map((x) => x[1]);
  const q = (raw.match(/correctIndex\s*:/g) ?? []).length;
  return { order, f: f.replace('.mdx', ''), sez: sez.length, sch, q };
}).sort((a, b) => a.order - b.order);
console.log('| # | File | Sezioni | Schemi | Quiz |\n|---|---|---|---|---|');
for (const r of rows) console.log(`| ${r.order} | \`${r.f}\` | ${r.sez} | ${r.sch.length}: ${r.sch.join(', ')} | ${r.q} |`);
