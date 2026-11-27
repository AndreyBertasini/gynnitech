import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { enBlogSlug, isEnPublished, type EnBlogData } from '../../src/lib/i18n-rules';

export type EnBlogRecord = { itSlug: string; data: EnBlogData };
export type RedirectRule = { from: string; to: string };

export const readEnBlog = async (contentDir: string): Promise<EnBlogRecord[]> => {
  const dir = path.join(contentDir, 'blog-en');
  const files = (await fs.readdir(dir)).filter((f) => /\.mdx?$/.test(f)).sort();
  return Promise.all(
    files.map(async (file) => ({
      itSlug: file.replace(/\.mdx?$/, ''),
      data: matter(await fs.readFile(path.join(dir, file), 'utf8')).data as EnBlogData,
    })),
  );
};

const both = (from: string, to: string): RedirectRule[] => {
  const bare = from.replace(/\/$/, '');
  return [{ from: bare, to }, { from: `${bare}/`, to }];
};

/**
 * 301 per tutto ciò che sotto /en/ non è una traduzione rivista:
 * - articoli blog-en non rivisti → originale italiano;
 * - articoli rivisti con slug inglese → nuovo slug (il vecchio slug italiano resta raggiungibile);
 * - corso, home e pagine statiche EN (traduzioni automatiche rimosse) → versione italiana.
 * `italianTopLevel` sono le pagine IT di primo livello (es. "about", "glossario").
 */
export const buildI18nRedirects = (posts: EnBlogRecord[], italianTopLevel: string[], itBlogSlugs: Set<string>) => {
  const rules: RedirectRule[] = [];
  const published = posts.filter((p) => isEnPublished(p.data) && itBlogSlugs.has(p.itSlug));

  for (const post of posts) {
    const enSlug = enBlogSlug(post.itSlug, post.data);
    const isPublished = published.includes(post);
    if (isPublished) {
      if (enSlug !== post.itSlug) rules.push(...both(`/en/blog/${post.itSlug}`, `/en/blog/${enSlug}/`));
      continue;
    }
    const target = itBlogSlugs.has(post.itSlug) ? `/blog/${post.itSlug}/` : '/blog/';
    rules.push(...both(`/en/blog/${post.itSlug}`, target));
    if (enSlug !== post.itSlug) rules.push(...both(`/en/blog/${enSlug}`, target));
  }
  if (published.length === 0) rules.push(...both('/en/blog', '/blog/'));

  rules.push(...both('/en', '/'));
  rules.push({ from: '/en/course', to: '/course/' }, { from: '/en/course/*', to: '/course/:splat' });
  for (const page of italianTopLevel) {
    if (page === 'blog' || page === 'course' || page === 'en') continue;
    rules.push(...both(`/en/${page}`, `/${page}/`));
  }
  return rules;
};

/** Lezioni spostate di modulo (stesso slug): src/data/moved-urls.json, vecchio URL → URL attuale. */
export const movedUrlRules = (moved: Record<string, string>): RedirectRule[] =>
  Object.entries(moved).flatMap(([from, to]) => both(from, to));

export const formatRedirects = (rules: RedirectRule[]) =>
  rules.map((r) => `${r.from.padEnd(70)} ${r.to.padEnd(60)} 301`).join('\n');
