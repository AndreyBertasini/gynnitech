/**
 * Esporta un CSV con lo stato SEO di ogni pagina buildata.
 * Uso: DIST_DIR=dist tsx scripts/seo-audit.ts > report.csv
 */
import path from 'node:path';
import { auditDist, toCsv } from './lib/seo-page-audit';

const distDir = path.resolve(process.env.DIST_DIR ?? 'dist');
const pages = await auditDist(distDir);
const rows = pages.map((p) => ({
  url: p.url,
  lang: p.lang,
  canonical: p.canonical ?? '',
  canonical_self: p.canonical === p.url,
  indexable: p.isRedirect ? 'redirect' : p.indexable ? 'si' : 'no',
  robots: p.robots,
  hreflang_it: p.hreflang['it-IT'] ?? '',
  hreflang_en: p.hreflang['en-US'] ?? '',
  hreflang_xdefault: p.hreflang['x-default'] ?? '',
  title: p.title,
  title_len: p.title.length,
  description_len: p.description.length,
  h1: p.h1,
  words: p.words,
  jsonld: p.jsonLdTypes,
}));
process.stdout.write(toCsv(rows));
