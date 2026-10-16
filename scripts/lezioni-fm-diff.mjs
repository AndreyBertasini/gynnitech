// Confronta il frontmatter di ogni lezione con la versione del branch base. Temporaneo, non committare.
// Confronta il frontmatter di ogni lezione con quello del branch base: node scripts/lezioni-fm-diff.mjs <branch-base> <modulo>
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const [base, folder] = process.argv.slice(2);
const dir = path.join('src/content/corso', folder);
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.mdx'))) {
  const rel = `src/content/corso/${folder}/${f}`;
  const now = matter(fs.readFileSync(rel, 'utf8')).data;
  const old = matter(execSync(`git show ${base}:${rel}`, { encoding: 'utf8' })).data;
  const keys = new Set([...Object.keys(old), ...Object.keys(now)]);
  const diff = [];
  for (const k of keys) {
    if (['formato', 'sezioni', 'dateModified'].includes(k)) continue;
    const a = JSON.stringify(old[k]);
    const b = JSON.stringify(now[k]);
    if (a !== b) diff.push(`${k}: ${a?.slice(0, 80)} → ${b?.slice(0, 80)}`);
  }
  console.log(`${f}: ${diff.length ? '\n   ' + diff.join('\n   ') : 'frontmatter ok'}`);
}
