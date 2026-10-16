// Compone una lezione nel formato 3s: node scripts/lezioni-compose.mjs <lezione.mdx> <corpo.txt>
// Il file corpo ha direttive (@sezioni:, @obiettivi:, opzionale @alt:) fino alla prima riga vuota; il resto è il corpo MDX.
// Il frontmatter originale resta intatto: si aggiungono solo formato, sezioni, dateModified (e, se richiesto, learningObjectives).
import fs from 'node:fs';

const [lesson, bodyFile] = process.argv.slice(2);
const raw = fs.readFileSync(lesson, 'utf8').replace(/\r\n/g, '\n');
const m = /^---\n([\s\S]*?)\n---\n/.exec(raw);
if (!m) throw new Error('frontmatter non trovato: ' + lesson);
let fm = m[1];

const src = fs.readFileSync(bodyFile, 'utf8').replace(/\r\n/g, '\n');
const cut = src.indexOf('\n\n');
const head = src.slice(0, cut).split('\n');
let body = src.slice(cut + 2);
const dir = {};
for (const line of head) {
  const d = /^@(\w+):\s*(.*)$/.exec(line);
  if (!d) throw new Error('direttiva non valida: ' + line);
  dir[d[1]] = d[2];
}
if (!dir.sezioni) throw new Error('manca @sezioni');
const sezioni = dir.sezioni.split('|').map((s) => s.trim());

fm = fm.replace(/^formato:.*\n?/m, '').replace(/^sezioni:.*\n?/m, '');
if (dir.obiettivi) {
  const items = dir.obiettivi.split('|').map((s) => s.trim());
  const block = 'learningObjectives:\n' + items.map((s) => `  - ${s}`).join('\n');
  fm = fm.replace(/^learningObjectives:\n(?:[ \t]+-.*\n?)+/m, block + '\n');
}
const add = `formato: "3s"\nsezioni: ${JSON.stringify(sezioni)}`;
if (/^dateModified:.*$/m.test(fm)) fm = fm.replace(/^dateModified:.*$/m, `${add}\ndateModified: 2026-10-15`);
else fm = fm + `\n${add}\ndateModified: 2026-10-15`;
fm = fm.replace(/\n{2,}/g, '\n').replace(/\n$/, '');

if (/<QuizExercise\b/.test(body) && !/import \{ QuizExercise \}/.test(body)) {
  body = `import { QuizExercise } from '../../../components/QuizExercise';\n\n` + body;
}
fs.writeFileSync(lesson, `---\n${fm}\n---\n${body.replace(/\n*$/, '\n')}`);
console.log('ok', lesson, 'sezioni:', sezioni.length);
