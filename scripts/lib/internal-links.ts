import { mapMarkupOutsideTextRegions } from './html-text-regions';

// Percorsi serviti così come sono (file, asset, endpoint): mai aggiungere lo slash.
const passthroughPrefixes = ['/_astro/', '/pagefind/', '/cdn-cgi/', '/api/'];

/**
 * Cloudflare Pages risponde 308 a `/pagina` → `/pagina/`. Scrivere i link interni già
 * con lo slash evita un redirect per ogni clic e per ogni crawl.
 */
export function addTrailingSlash(href: string): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  const match = href.match(/^([^?#]*)(.*)$/);
  if (!match) return href;
  const [, pathname, rest] = match;
  if (pathname === '' || pathname.endsWith('/')) return href;
  if (passthroughPrefixes.some((prefix) => pathname.startsWith(prefix))) return href;
  const lastSegment = pathname.slice(pathname.lastIndexOf('/') + 1);
  if (lastSegment.includes('.')) return href;
  return `${pathname}/${rest}`;
}

/** Normalizza gli attributi href interni (relativi o assoluti sul sito) di un documento HTML. */
export function normalizeInternalLinks(html: string, siteUrl: string): string {
  const origin = siteUrl.replace(/\/$/, '');
  const attr = /(\shref=)(["'])([^"']*)\2/gi;
  return mapMarkupOutsideTextRegions(html, (markup) =>
    markup.replace(attr, (whole, prefix: string, quote: string, value: string) => {
      if (value.startsWith(`${origin}/`)) {
        return `${prefix}${quote}${origin}${addTrailingSlash(value.slice(origin.length))}${quote}`;
      }
      if (value === origin) return `${prefix}${quote}${origin}/${quote}`;
      return `${prefix}${quote}${addTrailingSlash(value)}${quote}`;
    }),
  );
}
