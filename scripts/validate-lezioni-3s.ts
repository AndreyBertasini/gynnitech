/** npm run validate:3s — controlla le regole del formato «3 secondi» sulle lezioni con formato: "3s". */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { checkLezione3s } from './lezioni-3s-rules';

const root = path.join(process.cwd(), 'src/content/corso');
const files = (await glob('**/*.mdx', { cwd: root, absolute: true })).sort();

let lezioni = 0;
const errors: string[] = [];
const warnings: string[] = [];

for (const file of files) {
  const raw = await fs.readFile(file, 'utf8');
  if (matter(raw).data.formato !== '3s') continue;
  lezioni += 1;
  const esito = checkLezione3s(raw, path.relative(process.cwd(), file).split(path.sep).join('/'));
  errors.push(...esito.errors);
  warnings.push(...esito.warnings);
}

console.log(`Lezioni 3s: ${lezioni}`);
for (const w of warnings) console.log(`avviso  ${w}`);
for (const e of errors) console.error(`errore  ${e}`);
console.log(`${errors.length} errori, ${warnings.length} avvisi`);
process.exit(errors.length > 0 ? 1 : 0);
