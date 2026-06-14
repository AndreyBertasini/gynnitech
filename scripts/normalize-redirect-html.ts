import fs from 'node:fs/promises';
import path from 'node:path';
import { redirectEntries } from '../src/lib/config/redirects.mjs';

const cwd = process.cwd();
const distDir = path.resolve(process.env.DIST_DIR ?? path.join(cwd, 'dist'));
const siteUrl = (process.env.SITE_URL ?? 'https://ginnytech.it').replace(/\/$/, '');

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const redirectFilePath = (source: string) => {
  const parts = source.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  return path.join(distDir, ...parts, 'index.html');
};

const absoluteUrl = (pathname: string) => `${siteUrl}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;

const renderRedirectHtml = (source: string, target: string) => {
  const lang = source.startsWith('/en/') ? 'en' : 'it';
  const title = `Redirecting to: ${target}`;

  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8">
    <meta name="robots" content="noindex">
    <meta http-equiv="refresh" content="0;url=${escapeHtml(target)}">
    <link rel="canonical" href="${escapeHtml(absoluteUrl(target))}">
    <title>${escapeHtml(title)}</title>
  </head>
  <body>
    <main data-pagefind-ignore>
      <a href="${escapeHtml(target)}">Redirecting from <code>${escapeHtml(source)}/</code> to <code>${escapeHtml(target)}</code></a>
    </main>
  </body>
</html>
`;
};

const main = async () => {
  await Promise.all(
    redirectEntries.map(async ([source, target]) => {
      const filePath = redirectFilePath(source);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, renderRedirectHtml(source, target), 'utf8');
    }),
  );

  console.log(`[normalize:redirects] normalized ${redirectEntries.length} redirect page(s)`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
