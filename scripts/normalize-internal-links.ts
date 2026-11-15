import fs from 'node:fs/promises';
import path from 'node:path';
import { normalizeInternalLinks } from './lib/internal-links';

// Ultimo passaggio sull'HTML: i link interni senza slash finale costano un 308 a ogni
// clic e a ogni crawl. Li riscriviamo nella forma canonica servita da Cloudflare Pages.
const distDir = path.resolve(process.env.DIST_DIR ?? path.join(process.cwd(), 'dist'));
const siteUrl = process.env.SITE_URL ?? 'https://ginnytech.it';

const walk = async (dir: string): Promise<string[]> => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'pagefind' ? [] : walk(full);
    return entry.name.endsWith('.html') ? [full] : [];
  }));
  return nested.flat();
};

const files = await walk(distDir);
let changed = 0;
for (const file of files) {
  const html = await fs.readFile(file, 'utf8');
  const normalized = normalizeInternalLinks(html, siteUrl);
  if (normalized !== html) {
    await fs.writeFile(file, normalized, 'utf8');
    changed++;
  }
}
console.log(`[normalize:links] ${changed}/${files.length} HTML files updated`);
