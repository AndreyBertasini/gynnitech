/** npm run validate:articolo — controlla le regole del formato «articolo tecnico» sulle lezioni con formato: "articolo". */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { checkLezioneArticolo } from './lezioni-articolo-rules';

const root = path.join(process.cwd(), 'src/content/corso');
const files = (await glob('**/*.mdx', { cwd: root, absolute: true })).sort();

let lezioni = 0;
const errors: string[] = [];
const warnings: string[] = [];

for (const file of files) {
  const raw = await fs.readFile(file, 'utf8');
  if (matter(raw).data.formato !== 'articolo') continue;
  lezioni += 1;
  const esito = checkLezioneArticolo(raw, path.relative(process.cwd(), file).split(path.sep).join('/'));
  errors.push(...esito.errors);
  warnings.push(...esito.warnings);
}

console.log(`Lezioni articolo: ${lezioni}`);
for (const w of warnings) console.log(`avviso  ${w}`);
for (const e of errors) console.error(`errore  ${e}`);
console.log(`${errors.length} errori, ${warnings.length} avvisi`);
process.exit(errors.length > 0 ? 1 : 0);
