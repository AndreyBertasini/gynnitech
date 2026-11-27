/**
 * Regole i18n condivise tra le pagine Astro e gli script post-build (nessun import astro:*).
 *
 * Politica: una pagina /en/ esiste solo se è una traduzione rivista da una persona.
 * Oggi l'unico contenuto inglese è la collection `blogEn`; un articolo viene pubblicato
 * quando il frontmatter ha `translationReviewed: true`. Tutto il resto sotto /en/ risponde
 * 301 verso la versione italiana (vedi scripts/write-i18n-redirects.ts).
 */
export type EnBlogData = { enSlug?: string; translationReviewed?: boolean };

export const stripExtension = (id: string) => id.replace(/\.[^/.]+$/, '');

export const enBlogSlug = (itSlug: string, data: EnBlogData) => data.enSlug ?? itSlug;

export const isEnPublished = (data: EnBlogData) => data.translationReviewed === true;

export const itBlogPath = (itSlug: string) => `/blog/${itSlug}/`;

export const enBlogPath = (itSlug: string, data: EnBlogData) => `/en/blog/${enBlogSlug(itSlug, data)}/`;

export type Alternates = { it: string; en: string };
