import { getCollection, type CollectionEntry } from 'astro:content';
import { isPostIndexable } from './indexability';
import { enBlogPath, isEnPublished, itBlogPath, stripExtension, type Alternates } from './i18n-rules';

export type PublishedEnPost = { post: CollectionEntry<'blogEn'>; itSlug: string; enPath: string };

/** Articoli inglesi pubblicabili: rivisti da una persona e con un originale italiano. */
export const getPublishedEnPosts = async (): Promise<PublishedEnPost[]> => {
  const itSlugs = new Set((await getCollection('blog')).filter(isPostIndexable).map((p) => stripExtension(p.id)));
  return (await getCollection('blogEn'))
    .filter((post) => isEnPublished(post.data) && itSlugs.has(stripExtension(post.id)))
    .map((post) => ({ post, itSlug: stripExtension(post.id), enPath: enBlogPath(stripExtension(post.id), post.data) }));
};

/** Coppia hreflang per un articolo italiano, se esiste la traduzione pubblicata. */
export const blogAlternates = async (itSlug: string): Promise<Alternates | undefined> => {
  const match = (await getPublishedEnPosts()).find((p) => p.itSlug === itSlug);
  return match ? { it: itBlogPath(itSlug), en: match.enPath } : undefined;
};
