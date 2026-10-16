import fs from 'node:fs';
const p = process.argv[2];
const cache = JSON.parse(fs.readFileSync(p, 'utf8'));
const entries = Object.values(cache.entries);
const nexts = [
  'ogni evento che implementiamo diventa una riga',
  'gli eventi raccolti finiscono in tabelle, e la governance',
  'le integrazioni esistono per popolare tabelle',
  'lavoriamo con eventi, proprietà e identità che finiscono',
  'i job dei clienti diventano eventi in tabelle',
  'i dati personali finiscono in tabelle, e la conformità',
  'gli eventi che impostiamo oggi finiranno in tabelle',
  'eventi, proprietà e identità popolano le tabelle',
];
let a = 0;
let b = 0;
for (const e of entries) {
  if (/Sul binario$/.test(e.source) && /On the track$/.test(e.target)) {
    e.target = e.target.replace(/On the track$/, 'On the');
    a++;
  }
  if (nexts.some((n) => e.source.startsWith(n)) && !/^track /.test(e.target)) {
    e.target = 'track ' + e.target;
    b++;
  }
}
fs.writeFileSync(p, JSON.stringify(cache, null, 2) + '\n');
console.log('fine:', a, 'inizi:', b);
