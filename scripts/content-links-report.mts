import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { buildLinkIndex, MIN_SCORE } from '../src/lib/content-links';
const root = path.join(process.cwd(), 'src', 'content');
const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : /\.mdx?$/.test(e.name) ? [path.join(d, e.name)] : []);
const modules = JSON.parse(JSON.stringify({}));
const lessons = walk(path.join(root, 'corso')).filter((f) => path.relative(path.join(root, 'corso'), f).includes('/')).map((f) => {
  const rel = path.relative(path.join(root, 'corso'), f).replace(/\.mdx?$/, '');
  const fm = matter(fs.readFileSync(f, 'utf8')).data;
  return { id: rel, href: `/course/${rel}/`, title: String(fm.title), description: String(fm.description ?? ''), extra: rel.split('/')[0].replace(/-/g, ' ') };
});
const posts = walk(path.join(root, 'blog')).map((f) => {
  const slug = path.basename(f).replace(/\.mdx?$/, '');
  const fm = matter(fs.readFileSync(f, 'utf8')).data;
  return { id: slug, href: `/blog/${slug}/`, title: String(fm.title), description: String(fm.description ?? ''), extra: String(fm.category ?? '') };
});
const idx = buildLinkIndex(lessons, posts);
let l0 = 0, p0 = 0; const cnt: number[] = [];
for (const l of lessons) { const m = idx.postsForLesson(l.id); cnt.push(m.length); if (!m.length) l0++; }
for (const p of posts) if (!idx.lessonsForPost(p.id).length) p0++;
console.log('lessons', lessons.length, 'without blog links', l0, '| posts', posts.length, 'without lesson links', p0, 'MIN', MIN_SCORE);
for (const id of ['analytics-engineering/cheat-sheet','data-warehousing/sql','marketing-data-science/retention','real-time-analytics/monitoring','agentic-ai-data-workflows/observability-evals-sicurezza-e-cost-control','dashboard-visualizzazione/storytelling-dati']) {
  const l = lessons.find((x) => x.id === id); if (!l) continue;
  console.log('\n' + l.title); for (const m of idx.postsForLesson(id)) console.log('  ->', m.score.toFixed(1), m.title);
}
for (const id of ['hadi-cycles','sql-per-marketing','growth-engineering-osservabilita-ai','affinity-index']) {
  const p = posts.find((x) => x.id === id); if (!p) continue;
  console.log('\n[blog] ' + p.title); for (const m of idx.lessonsForPost(id)) console.log('  ->', m.score.toFixed(1), m.title);
}
