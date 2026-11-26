/**
 * Sitemap generate dalle content collections (sostituiscono @astrojs/sitemap e il vecchio
 * sitemap-en.xml post-build). Contengono solo pagine indicizzabili con canonical self;
 * scripts/check-i18n-seo.ts verifica a ogni build che ogni <loc> corrisponda a una pagina
 * reale, indicizzabile e con canonical uguale a se stessa, e che nessuna pagina indicizzabile manchi.
 *
 * lastmod: `dateModified` (o `date`) del frontmatter; per le pagine senza date nel contenuto
 * si usa la data dell'ultimo commit del file sorgente. In un clone shallow quella data non è
 * reale, quindi lastmod viene omesso invece di essere inventato.
 */
import { execFileSync } from 'node:child_process';
import { getCollection, type CollectionEntry } from 'astro:content';
import { SITE_URL } from '../consts';
import { getPublishedEnPosts } from './i18n-pages';
import { isLessonIndexable } from './indexability';

export type SitemapEntry = { path: string; lastmod?: Date };

const STATIC_IT_PAGES: Array<{ path: string; source: string }> = [
  { path: '/', source: 'src/pages/index.astro' },
  { path: '/about/', source: 'src/pages/about.astro' },
  { path: '/contact/', source: 'src/pages/contact.astro' },
  { path: '/newsletter/', source: 'src/pages/newsletter.astro' },
  { path: '/perche-questo-corso/', source: 'src/pages/perche-questo-corso.astro' },
  { path: '/glossario/', source: 'src/pages/glossario.mdx' },
  { path: '/progress/', source: 'src/pages/progress.astro' },
  { path: '/privacy/', source: 'src/pages/privacy.astro' },
  { path: '/cookie-policy/', source: 'src/pages/cookie-policy.astro' },
  { path: '/gdpr/', source: 'src/pages/gdpr.astro' },
  { path: '/course/learning-path/', source: 'src/pages/course/learning-path.astro' },
];

let shallow: boolean | undefined;
const isShallowClone = () => {
  if (shallow === undefined) {
    try {
      shallow = execFileSync('git', ['rev-parse', '--is-shallow-repository'], { encoding: 'utf8' }).trim() !== 'false';
    } catch {
      shallow = true;
    }
  }
  return shallow;
};

const gitDate = (file: string): Date | undefined => {
  if (isShallowClone()) return undefined;
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], { encoding: 'utf8' }).trim();
    return out ? new Date(out) : undefined;
  } catch {
    return undefined;
  }
};

const latest = (dates: Array<Date | undefined>) => {
  const valid = dates.filter((d): d is Date => d instanceof Date && !Number.isNaN(d.valueOf()));
  return valid.length ? new Date(Math.max(...valid.map((d) => d.valueOf()))) : undefined;
};

const stripExt = (id: string) => id.replace(/\.[^/.]+$/, '');
const blogDate = (post: CollectionEntry<'blog'> | CollectionEntry<'blogEn'>) => post.data.dateModified ?? post.data.date;
const lessonDate = (entry: CollectionEntry<'corso'>) =>
  entry.data.dateModified ?? gitDate(`src/content/corso/${entry.id}${entry.filePath?.match(/\.[^.]+$/)?.[0] ?? '.mdx'}`);

export const italianSitemapEntries = async (): Promise<SitemapEntry[]> => {
  const blog = await getCollection('blog');
  const corso = (await getCollection('corso')).filter((e) => e.id.includes('/'));
  const lessons = corso.filter(isLessonIndexable);

  const modules = new Map<string, Array<Date | undefined>>();
  for (const lesson of corso) {
    const module = lesson.id.split('/')[0];
    modules.set(module, [...(modules.get(module) ?? []), lessonDate(lesson)]);
  }

  const blogPosts = blog.map((post) => ({ path: `/blog/${stripExt(post.id)}/`, lastmod: blogDate(post) }));
  const lessonEntries = lessons.map((lesson) => ({ path: `/course/${stripExt(lesson.id)}/`, lastmod: lessonDate(lesson) }));
  const moduleEntries = [...modules].map(([module, dates]) => ({ path: `/course/${module}/`, lastmod: latest(dates) }));

  return [
    ...STATIC_IT_PAGES.map((page) => ({ path: page.path, lastmod: gitDate(page.source) })),
    { path: '/blog/', lastmod: latest(blogPosts.map((p) => p.lastmod)) },
    ...blogPosts,
    { path: '/course/', lastmod: latest(moduleEntries.map((m) => m.lastmod)) },
    ...moduleEntries,
    ...lessonEntries,
  ];
};

export const englishSitemapEntries = async (): Promise<SitemapEntry[]> => {
  const published = await getPublishedEnPosts();
  if (published.length === 0) return [];
  const posts = published.map(({ post, enPath }) => ({ path: enPath, lastmod: blogDate(post) }));
  return [{ path: '/en/blog/', lastmod: latest(posts.map((p) => p.lastmod)) }, ...posts];
};

const escapeXml = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export const renderUrlset = (entries: SitemapEntry[]) => {
  const seen = new Set<string>();
  const body = entries
    .filter((entry) => (seen.has(entry.path) ? false : (seen.add(entry.path), true)))
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((entry) => {
      const loc = `<loc>${escapeXml(new URL(entry.path, SITE_URL).href)}</loc>`;
      const lastmod = entry.lastmod ? `<lastmod>${isoDate(entry.lastmod)}</lastmod>` : '';
      return `  <url>${loc}${lastmod}</url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
};

export const xmlResponse = (xml: string) =>
  new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
