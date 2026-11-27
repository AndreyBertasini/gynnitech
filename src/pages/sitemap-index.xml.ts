import { SITE_URL } from '../consts';
import { englishSitemapEntries, xmlResponse } from '../lib/sitemap-entries';

// sitemap-en.xml viene elencata solo quando contiene almeno una traduzione rivista.
export const GET = async () => {
  const sitemaps = ['/sitemap-it.xml', ...((await englishSitemapEntries()).length > 0 ? ['/sitemap-en.xml'] : [])];
  const body = sitemaps.map((p) => `  <sitemap><loc>${new URL(p, SITE_URL).href}</loc></sitemap>`).join('\n');
  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`);
};
