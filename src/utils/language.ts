export type SiteLanguage = 'it' | 'en';

const EN_PREFIX = '/en';

export const pathLanguage = (pathname: string): SiteLanguage =>
  pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`) ? 'en' : 'it';

export const stripEnglishPrefix = (pathname: string) => {
  if (pathname === EN_PREFIX) return '/';
  if (pathname.startsWith(`${EN_PREFIX}/`)) return pathname.slice(EN_PREFIX.length) || '/';
  return pathname || '/';
};

export const withEnglishPrefix = (pathname: string) => {
  const normalized = stripEnglishPrefix(pathname);
  return normalized === '/' ? `${EN_PREFIX}/` : `${EN_PREFIX}${normalized}`;
};

// Solo il blog ha una versione inglese (articoli con traduzione rivista): il resto del sito
// è italiano e i link /en/<altro> risponderebbero 301. Dalle pagine EN puntiamo all'italiano.
const hasEnglishSection = (pathname: string) => /^\/blog(\/|$)/.test(stripEnglishPrefix(pathname));

export const localizedPath = (pathname: string, language: SiteLanguage) =>
  language === 'en' && hasEnglishSection(pathname) ? withEnglishPrefix(pathname) : stripEnglishPrefix(pathname);

/** Alternativa linguistica dichiarata nell'head (hreflang): unica fonte per il selettore lingua. */
export const declaredAlternateHref = (language: SiteLanguage): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const hreflang = language === 'en' ? 'en-US' : 'it-IT';
  const link = document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${hreflang}"]`);
  if (!link?.href) return undefined;
  const url = new URL(link.href);
  return `${url.pathname}${window.location.search}${window.location.hash}`;
};

export const currentSiteLanguage = (): SiteLanguage => {
  if (typeof window === 'undefined') return 'it';
  return pathLanguage(window.location.pathname);
};

export const currentLocalizedHref = (language: SiteLanguage) => {
  if (typeof window === 'undefined') return language === 'en' ? '/en/' : '/';

  const nextPath = localizedPath(window.location.pathname, language);
  return `${nextPath}${window.location.search}${window.location.hash}`;
};

export const applyDocumentLanguage = (language: SiteLanguage) => {
  if (typeof document === 'undefined') return;

  document.documentElement.lang = language;
  document.documentElement.dataset.language = language;
};
