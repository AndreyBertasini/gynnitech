import type { CollectionEntry } from 'astro:content';

/**
 * Unico predicato di indicizzabilità delle lezioni: lo usano sia la pagina (meta robots)
 * sia la sitemap, così le due cose non possono divergere.
 */
export const isLessonIndexable = (entry: Pick<CollectionEntry<'corso'>, 'id' | 'data'>) =>
  entry.data.draft !== true && entry.data.noindex !== true;

/** Articoli del blog: `noindex: true` nel frontmatter li toglie da sitemap, hreflang e link correlati. */
export const isPostIndexable = (entry: { data: { noindex?: boolean } }) => entry.data.noindex !== true;
