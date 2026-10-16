// Uso: node write-en-pairs.mjs <intro.json> <en.json> <en-static-cache.json>
// intro.json = stringhe italiane mancanti (array); en.json = [[indice, traduzione], ...]
import fs from 'node:fs';
import crypto from 'node:crypto';

const [introPath, enPath, cachePath] = process.argv.slice(2);
const intro = JSON.parse(fs.readFileSync(introPath, 'utf8'));
const pairs = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');

const visti = new Set();
const now = new Date().toISOString();
let scritte = 0;
for (const [i, target] of pairs) {
  const source = intro[i];
  if (source === undefined) throw new Error(`indice ${i} fuori intervallo (${intro.length} stringhe)`);
  if (visti.has(i)) throw new Error(`indice ${i} duplicato`);
  visti.add(i);
  cache.entries[sha(source)] = { source, target, updatedAt: now };
  scritte++;
}
const mancanti = intro.map((_, i) => i).filter((i) => !visti.has(i));
fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2) + '\n');
console.log(`scritte ${scritte} / ${intro.length}; senza traduzione: ${mancanti.join(',') || 'nessuna'}`);
