/**
 * Gate SEO/i18n sull'output di build (fa fallire `npm run build` e quindi la CI).
 *
 * Per ogni pagina HTML buildata (esclusi redirect e 404):
 *  1. <html lang> coerente col prefisso URL (/en/ → en, resto → it);
 *  2. canonical presente e uguale all'URL della pagina;
 *  3. hreflang: se dichiarati, sono it-IT + en-US + x-default(=it), puntano a pagine buildate,
 *     indicizzabili, e la pagina di destinazione dichiara lo stesso gruppo (reciprocità);
 *     ogni pagina /en/ indicizzabile deve dichiararli;
 *  4. nessun testo italiano nelle pagine /en/ (title, description, H1, corpo senza codice);
 * Sitemap: ogni <loc> esiste, è indicizzabile e ha canonical self; ogni pagina indicizzabile
 * è in una sitemap; lastmod, se presente, è una data valida non futura.
 * _redirects: nessuna regola copre una pagina reale; i target interni esistono.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { auditDist } from './lib/seo-page-audit';
import { italianSignals } from './lib/italian-detector';

const distDir = path.resolve(process.env.DIST_DIR ?? 'dist');
const errors: string[] = [];
const fail = (page: string, message: string) => errors.push(`${page}: ${message}`);

const pages = await auditDist(distDir);
const byUrl = new Map(pages.map((p) => [p.url, p]));
const content = pages.filter((p) => !p.isRedirect && p.path !== '/404' && !p.path.startsWith('/en/404'));
const isEnPath = (p: string) => p === '/en/' || p.startsWith('/en/');

for (const page of content) {
  const expectedLang = isEnPath(page.path) ? 'en' : 'it';
  if (page.lang !== expectedLang) fail(page.path, `lang="${page.lang}", atteso "${expectedLang}"`);

  if (page.canonical !== page.url) fail(page.path, `canonical ${page.canonical ?? '(assente)'} ≠ ${page.url}`);

  const group = page.hreflang;
  const keys = Object.keys(group).sort();
  if (keys.length > 0) {
    if (!page.indexable) fail(page.path, 'hreflang su una pagina noindex');
    if (keys.join(',') !== 'en-US,it-IT,x-default') fail(page.path, `hreflang incompleti: ${keys.join(', ')}`);
    if (group['x-default'] !== group['it-IT']) fail(page.path, 'x-default deve coincidere con it-IT');
    const self = isEnPath(page.path) ? group['en-US'] : group['it-IT'];
    if (self !== page.url) fail(page.path, `hreflang della propria lingua ${self} ≠ ${page.url}`);
    for (const [lang, href] of Object.entries(group)) {
      const target = byUrl.get(href);
      if (!target || target.isRedirect) {
        fail(page.path, `hreflang ${lang} → ${href} non è una pagina buildata (200)`);
        continue;
      }
      if (!target.indexable) fail(page.path, `hreflang ${lang} → ${href} è noindex`);
      const back = target.hreflang;
      if (back['it-IT'] !== group['it-IT'] || back['en-US'] !== group['en-US'] || back['x-default'] !== group['x-default']) {
        fail(page.path, `hreflang non reciproco con ${href}`);
      }
    }
  } else if (isEnPath(page.path) && page.indexable) {
    fail(page.path, 'pagina /en/ indicizzabile senza hreflang verso la versione italiana');
  }

  if (isEnPath(page.path)) {
    for (const [field, text] of [['title', page.title], ['description', page.description], ['h1', page.h1.join(' ')]] as const) {
      const hits = italianSignals(text);
      if (hits.strong.length > 0) fail(page.path, `testo italiano nel ${field}: ${hits.strong.slice(0, 5).join(', ')}`);
    }
    const body = italianSignals(page.proseText);
    if (body.ratio > 0.01 || body.strong.length >= 8) {
      fail(page.path, `testo italiano nel corpo (${body.strong.length} parole, es. ${body.strong.slice(0, 8).join(', ')})`);
    }
    // Interfaccia (nav, footer, banner): qui basta una parola italiana per fallire.
    const chrome = italianSignals(page.bodyProse.replace(page.proseText, ' '));
    if (chrome.strong.length > 0) fail(page.path, `testo italiano nell'interfaccia: ${chrome.strong.slice(0, 8).join(', ')}`);
  }
}

// --- Sitemap ---
const readXml = (file: string) => fs.readFile(path.join(distDir, file), 'utf8').catch(() => '');
const index = await readXml('sitemap-index.xml');
if (!index) errors.push('sitemap-index.xml mancante');
const sitemapFiles = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname.slice(1));
if (!sitemapFiles.includes('sitemap-it.xml')) errors.push('sitemap-index.xml non elenca sitemap-it.xml');
for (const file of sitemapFiles) {
  if (!['sitemap-it.xml', 'sitemap-en.xml'].includes(file)) errors.push(`sitemap-index.xml elenca una sitemap inattesa: ${file}`);
}
for (const stray of (await fs.readdir(distDir)).filter((f) => /^sitemap-\d+\.xml$/.test(f))) {
  errors.push(`${stray}: sitemap generata da @astrojs/sitemap, non dalle collection`);
}
const inSitemap = new Map<string, string>();
const today = new Date(Date.now() + 86_400_000);
for (const file of sitemapFiles) {
  const xml = await readXml(file);
  if (!xml) {
    errors.push(`${file} elencata in sitemap-index ma mancante`);
    continue;
  }
  for (const entry of xml.matchAll(/<url><loc>([^<]+)<\/loc>(?:<lastmod>([^<]+)<\/lastmod>)?<\/url>/g)) {
    const [, loc, lastmod] = entry;
    if (inSitemap.has(loc)) errors.push(`${file}: ${loc} duplicato (anche in ${inSitemap.get(loc)})`);
    inSitemap.set(loc, file);
    const page = byUrl.get(loc);
    if (!page || page.isRedirect) errors.push(`${file}: ${loc} non è una pagina buildata (200)`);
    else {
      if (!page.indexable) errors.push(`${file}: ${loc} è noindex`);
      if (page.canonical !== loc) errors.push(`${file}: ${loc} ha canonical ${page.canonical}`);
      if (isEnPath(page.path) !== (file === 'sitemap-en.xml')) errors.push(`${file}: ${loc} è nella sitemap della lingua sbagliata`);
    }
    if (lastmod && (Number.isNaN(Date.parse(lastmod)) || new Date(lastmod) > today)) errors.push(`${file}: lastmod non valido per ${loc}: ${lastmod}`);
  }
}
for (const page of content) {
  if (page.indexable && !inSitemap.has(page.url)) fail(page.path, 'pagina indicizzabile assente dalle sitemap');
}

// --- _redirects ---
const redirects = (await fs.readFile(path.join(distDir, '_redirects'), 'utf8').catch(() => ''))
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'))
  .map((line) => line.split(/\s+/));
const realPages = new Set(content.map((p) => p.path));
const servable = new Set(pages.filter((p) => !p.isRedirect).map((p) => p.path));
const staticFile = async (p: string) => fs.access(path.join(distDir, p)).then(() => true, () => false);
for (const [from, to] of redirects) {
  if (!from || !to) continue;
  if (!from.includes('*') && realPages.has(from.endsWith('/') ? from : `${from}/`) && from !== to.replace(/\/$/, '')) {
    errors.push(`_redirects: ${from} copre una pagina reale`);
  }
  if (to.startsWith('/') && !to.includes(':splat') && !servable.has(to) && !(await staticFile(to))) {
    errors.push(`_redirects: ${from} → ${to} non esiste`);
  }
}

const indexable = content.filter((p) => p.indexable);
console.log(
  `[check:i18n-seo] ${content.length} pagine (${indexable.length} indicizzabili, ${indexable.filter((p) => isEnPath(p.path)).length} EN), ` +
    `${inSitemap.size} URL in ${sitemapFiles.length} sitemap, ${redirects.length} regole _redirects`,
);
if (errors.length > 0) {
  console.error(`[check:i18n-seo] ${errors.length} errori:\n- ${errors.slice(0, Number(process.env.MAX_ERRORS ?? 200)).join('\n- ')}`);
  process.exit(1);
}
console.log('[check:i18n-seo] OK');
