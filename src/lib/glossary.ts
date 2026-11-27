/**
 * Glossario: un termine = una pagina /glossario/<slug>/ con contenuto proprio.
 * - src/data/glossary/terms.json: slug, nome, definizione breve, contesto (moduli del corso).
 * - src/data/glossary/bodies/*.ts: testo originale per termine (perché serve, come si usa, esempio,
 *   errori tipici, formula/SQL quando hanno senso). Nessun testo condiviso tra termini.
 * Il minimo di 300 parole è imposto da tests/glossary.test.ts e da scripts/check-content-seo.ts.
 */
import terms from '../data/glossary/terms.json';
import { bodies } from '../data/glossary/bodies';
import { lessonLinks } from '../data/glossary/lesson-links';
import { SITE } from './glossary-constants';

export type TermBody = {
  /** Perché il termine conta nelle decisioni (cosa cambia se lo si capisce male). */
  why: string;
  /** Come si calcola o si applica, passo per passo. */
  how: string;
  /** Esempio con numeri o scenario concreto. */
  example: string;
  /** Errori tipici e come evitarli. */
  pitfalls: string;
  formula?: string;
  /** Query ClickHouse eseguibile (dialetto ClickHouse). */
  sql?: string;
  /** Etichetta dell'intestazione del blocco di codice se non è SQL ClickHouse (es. HCL per Terraform). */
  codeLabel?: string;
  /** Slug di altri termini del glossario. */
  related: string[];
  /** Id di lezioni (modulo/slug) da collegare in aggiunta a quelle calcolate. */
  lessons?: string[];
};

export type BaseTerm = { slug: string; name: string; short: string; definition: string; context: string };
export type GlossaryTerm = BaseTerm & { body: TermBody };

export const baseTerms = terms as BaseTerm[];
export const termPath = (slug: string) => `/glossario/${slug}/`;
export const termUrl = (slug: string) => `${SITE}${termPath(slug)}`;
export const termTitle = (t: BaseTerm) => `${t.short}: definizione ed esempi | GinnyTech`;

const withLessonLinks = (slug: string, body: TermBody): TermBody => ({
  ...body,
  lessons: [...(body.lessons ?? []), ...(lessonLinks[slug] ?? [])],
});

export const glossaryTerms: GlossaryTerm[] = baseTerms
  .filter((t) => Boolean(bodies[t.slug]))
  .map((t) => ({ ...t, body: withLessonLinks(t.slug, bodies[t.slug]) }))
  .sort((a, b) => a.short.localeCompare(b.short, 'it', { sensitivity: 'base' }));

const WORD = /[\p{L}\p{N}][\p{L}\p{N}'’_/.-]*/gu;
export const wordCount = (text: string) => (text.match(WORD) ?? []).length;

/** Parole del contenuto scritto per il termine (definizione + sezioni), senza navigazione. */
export const termWords = (t: GlossaryTerm) =>
  wordCount([t.definition, t.body.why, t.body.how, t.body.example, t.body.pitfalls, t.body.formula ?? ''].join(' '));

/** Moduli del corso citati nel contesto ("Analisi Prodotto / Marketing Data Science"). */
export const contextModuleIds = (context: string, moduleIds: string[]) => {
  const norm = (s: string) =>
    s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return context
    .split('/')
    .map(norm)
    .filter((id) => moduleIds.includes(id));
};
