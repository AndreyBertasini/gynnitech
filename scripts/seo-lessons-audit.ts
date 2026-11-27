/**
 * Audit delle lezioni /course/<modulo>/<lezione>/ e degli articoli /blog/ sull'output di build.
 * Uso: DIST_DIR=dist tsx scripts/seo-lessons-audit.ts > lezioni.csv
 * Colonne: parole, H1, blocchi di codice/SQL, link prev/next, link al corso padre, link al blog,
 * breadcrumb e tipo di schema, similarità massima (shingle Jaccard) con un'altra lezione.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fromHtml } from 'hast-util-from-html';
import { select, selectAll } from 'hast-util-select';
import type { Element } from 'hast';
import { auditHtml, toCsv, walkHtml } from './lib/seo-page-audit';

const distDir = path.resolve(process.env.DIST_DIR ?? 'dist');
const attr = (el: Element, name: string) => String(el.properties?.[name] ?? '');
const text = (el: Element): string => el.children.map((c) => (c.type === 'text' ? c.value : c.type === 'element' ? text(c) : '')).join(' ');

const shingles = (words: string[], k = 5) => {
  const set = new Set<string>();
  for (let i = 0; i + k <= words.length; i++) set.add(words.slice(i, i + k).join(' '));
  return set;
};
const jaccard = (a: Set<string>, b: Set<string>) => {
  let inter = 0;
  for (const s of a) if (b.has(s)) inter++;
  return inter / (a.size + b.size - inter || 1);
};

type Row = Record<string, string | number | boolean>;
const lessons: Array<{ row: Row; sh: Set<string>; url: string }> = [];

for (const file of (await walkHtml(distDir)).sort()) {
  const rel = path.relative(distDir, file).split(path.sep).join('/');
  const m = rel.match(/^(course|blog)\/([^/]+)(?:\/([^/]+))?\/index\.html$/);
  if (!m) continue;
  const isLesson = m[1] === 'course' && Boolean(m[3]);
  const isModule = m[1] === 'course' && !m[3];
  const isBlog = m[1] === 'blog';
  if (isModule && m[2] === 'learning-path') continue;
  const html = await fs.readFile(file, 'utf8');
  const page = auditHtml(html, rel);
  const tree = fromHtml(html);
  const main = (select('main', tree) ?? select('body', tree)) as Element;
  const links = selectAll('a[href]', main).map((a) => attr(a, 'href'));
  const internal = (re: RegExp) => new Set(links.filter((h) => re.test(h)).map((h) => h.split('#')[0])).size;
  const lessonLinks = links.filter((h) => /^\/course\/[^/]+\/[^/]+\/?$/.test(h));
  const codeBlocks = selectAll('pre', main);
  const sqlBlocks = codeBlocks.filter((p) => /\b(select|from|where|group by|create table|insert into|with)\b/i.test(text(p))).length;
  const rowKind = isLesson ? 'lezione' : isModule ? 'modulo' : 'articolo';
  const sh = shingles(page.proseText.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []);
  const crumbs = page.jsonLdTypes.includes('BreadcrumbList');
  lessons.push({
    url: page.url,
    sh,
    row: {
      url: page.url,
      tipo: rowKind,
      modulo: m[2],
      parole: page.words,
      h1_count: page.h1.length,
      h1: page.h1[0] ?? '',
      blocchi_codice: codeBlocks.length,
      blocchi_sql: sqlBlocks,
      link_prev_next: selectAll('a.course-nav-prev, a.course-nav-next', main).length,
      link_corso_padre: links.some((h) => h === `/course/${m[2]}/` || h === `/course/${m[2]}`),
      link_lezioni: new Set(lessonLinks).size,
      link_blog: internal(/^\/blog\/[^/]+\/?$/),
      breadcrumb_jsonld: crumbs,
      jsonld: page.jsonLdTypes.join(' | '),
      indicizzabile: page.indexable ? 'si' : 'no',
    },
  });
}

// Similarità: per ogni lezione/articolo la massima Jaccard con un'altra pagina dello stesso tipo.
const byKind = new Map<string, typeof lessons>();
for (const l of lessons) byKind.set(String(l.row.tipo), [...(byKind.get(String(l.row.tipo)) ?? []), l]);
for (const group of byKind.values()) {
  for (const a of group) {
    let best = 0;
    let bestUrl = '';
    for (const b of group) {
      if (a === b) continue;
      const j = jaccard(a.sh, b.sh);
      if (j > best) [best, bestUrl] = [j, b.url];
    }
    a.row.similarita_max = Number(best.toFixed(3));
    a.row.simile_a = best >= 0.15 ? bestUrl : '';
  }
}
process.stdout.write(toCsv(lessons.map((l) => l.row)));
