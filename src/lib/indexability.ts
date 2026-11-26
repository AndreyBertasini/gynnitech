import type { CollectionEntry } from 'astro:content';

/**
 * Unico predicato di indicizzabilità delle lezioni: lo usano sia la pagina (meta robots)
 * sia la sitemap, così le due cose non possono divergere.
 */
export const isLessonIndexable = (entry: Pick<CollectionEntry<'corso'>, 'id' | 'data'>) => entry.data.draft !== true;
