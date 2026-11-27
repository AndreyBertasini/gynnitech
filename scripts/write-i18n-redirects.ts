/**
 * Post-build: aggiunge a dist/_redirects i 301 della politica i18n (vedi src/lib/i18n-rules.ts).
 * Le regole sono esplicite (nessun /en/* generico) così non possono coprire una pagina EN reale.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { buildI18nRedirects, formatRedirects, readEnBlog, movedUrlRules } from './lib/i18n-redirects';

const cwd = process.cwd();
const distDir = path.resolve(process.env.DIST_DIR ?? path.join(cwd, 'dist'));
const contentDir = path.join(cwd, 'src', 'content');
const MARKER = '# --- i18n: generato da scripts/write-i18n-redirects.ts ---';

const exists = async (file: string) => fs.access(file).then(() => true, () => false);

const topLevel = [];
for (const entry of await fs.readdir(distDir, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name.startsWith('_') || entry.name === 'pagefind') continue;
  if (await exists(path.join(distDir, entry.name, 'index.html'))) topLevel.push(entry.name);
}

const itBlogSlugs = new Set(
  (await fs.readdir(path.join(contentDir, 'blog'))).filter((f) => /\.mdx?$/.test(f)).map((f) => f.replace(/\.mdx?$/, '')),
);
const moved = JSON.parse(await fs.readFile(path.join(cwd, 'src', 'data', 'moved-urls.json'), 'utf8')) as Record<string, string>;
const rules = [...buildI18nRedirects(await readEnBlog(contentDir), topLevel.sort(), itBlogSlugs), ...movedUrlRules(moved)];

const redirectsPath = path.join(distDir, '_redirects');
const current = (await fs.readFile(redirectsPath, 'utf8')).split(MARKER)[0].trimEnd();
await fs.writeFile(redirectsPath, `${current}\n\n${MARKER}\n${formatRedirects(rules)}\n`, 'utf8');
console.log(`[i18n:redirects] (i18n + ${Object.keys(moved).length} URL spostati) ${rules.length} regole 301 scritte in ${path.relative(cwd, redirectsPath)}`);
