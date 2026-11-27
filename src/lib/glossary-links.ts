import { getCollection } from 'astro:content';
import { buildLinkIndex } from './content-links';
import { isLessonIndexable } from './indexability';
import { glossaryTerms } from './glossary';

const strip = (id: string) => id.replace(/\.[^/.]+$/, '');
let index: Promise<ReturnType<typeof buildLinkIndex>> | undefined;

/** Lezioni più pertinenti per ogni termine (stesso punteggio TF-IDF usato per lezioni ↔ blog). */
export const getGlossaryLessonIndex = () =>
  (index ??= (async () => {
    const lessons = (await getCollection('corso')).filter((l) => l.id.includes('/') && isLessonIndexable(l));
    return buildLinkIndex(
      lessons.map((l) => ({
        id: strip(l.id),
        href: `/course/${strip(l.id)}/`,
        title: l.data.title,
        description: l.data.description,
        extra: l.id.split('/')[0].replace(/-/g, ' '),
      })),
      glossaryTerms.map((t) => ({
        id: t.slug,
        href: `/glossario/${t.slug}/`,
        title: t.short,
        description: `${t.definition} ${t.body.why} ${t.body.how}`,
        extra: t.context,
      })),
    );
  })());
