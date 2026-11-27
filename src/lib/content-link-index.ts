import { getCollection } from 'astro:content';
import { buildLinkIndex } from './content-links';
import { isLessonIndexable, isPostIndexable } from './indexability';

const strip = (id: string) => id.replace(/\.[^/.]+$/, '');

let index: Promise<ReturnType<typeof buildLinkIndex>> | undefined;

/** Indice lezioni ↔ articoli, costruito una sola volta per build. */
export const getContentLinkIndex = () =>
  (index ??= (async () => {
    const [lessons, posts] = await Promise.all([getCollection('corso'), getCollection('blog')]);
    return buildLinkIndex(
      lessons
        .filter((l) => l.id.includes('/') && isLessonIndexable(l))
        .map((l) => ({
          id: strip(l.id),
          href: `/course/${strip(l.id)}/`,
          title: l.data.title,
          description: l.data.description,
          extra: l.id.split('/')[0].replace(/-/g, ' '),
        })),
      posts.filter(isPostIndexable).map((p) => ({
        id: strip(p.id),
        href: `/blog/${strip(p.id)}/`,
        title: p.data.title,
        description: p.data.description,
        extra: p.data.category,
      })),
    );
  })());
