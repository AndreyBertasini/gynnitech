/**
 * Lettura SEO di un HTML già buildato: lingua, canonical, robots, hreflang, H1, title,
 * description, JSON-LD e conteggio parole del contenuto principale (senza nav/header/footer).
 * Usato da `scripts/seo-audit.ts` (CSV prima/dopo) e da `scripts/check-i18n-seo.ts` (gate CI).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fromHtml } from 'hast-util-from-html';
import { matches, select, selectAll } from 'hast-util-select';
import type { Element, Root, RootContent } from 'hast';

export const SITE = 'https://ginnytech.it';

export type PageAudit = {
  file: string;
  url: string;
  path: string;
  lang: string;
  title: string;
  description: string;
  h1: string[];
  canonical: string | null;
  robots: string;
  indexable: boolean;
  isRedirect: boolean;
  hreflang: Record<string, string>;
  words: number;
  mainText: string;
  /** Testo principale senza blocchi di codice: per i controlli sulla lingua. */
  proseText: string;
  /** Tutto il <body> (nav, footer, banner inclusi) senza script e codice. */
  bodyProse: string;
  jsonLdTypes: string[];
};

const textOf = (node: Root | RootContent | Element): string => {
  if (node.type === 'text') return node.value;
  if ('children' in node) return node.children.map((child) => textOf(child as RootContent)).join(' ');
  return '';
};

const strip = (value: string) => value.replace(/\s+/g, ' ').trim();

const attr = (el: Element | undefined | null, name: string) => {
  const value = el?.properties?.[name];
  if (Array.isArray(value)) return value.join(' ');
  return value == null ? '' : String(value);
};

const MAIN_NOISE = 'nav, header, footer, aside, script, style, noscript, svg, template, [data-pagefind-ignore], .sr-only, button';

export const countWords = (text: string) => (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’_-]*/gu) ?? []).length;

const collectJsonLdTypes = (value: unknown, out: Set<string>) => {
  if (Array.isArray(value)) {
    value.forEach((item) => collectJsonLdTypes(item, out));
    return;
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const type = record['@type'];
    if (typeof type === 'string') out.add(type);
    if (Array.isArray(type)) type.forEach((t) => typeof t === 'string' && out.add(t));
    Object.values(record).forEach((child) => collectJsonLdTypes(child, out));
  }
};

export const filePathToUrlPath = (relativeHtmlPath: string) => {
  const normalized = relativeHtmlPath.split(path.sep).join('/');
  if (normalized === 'index.html') return '/';
  if (normalized.endsWith('/index.html')) return `/${normalized.slice(0, -'index.html'.length)}`;
  return `/${normalized.replace(/\.html$/, '')}`;
};

export const auditHtml = (html: string, relativeHtmlPath: string): PageAudit => {
  const tree = fromHtml(html);
  const htmlEl = select('html', tree);
  const urlPath = filePathToUrlPath(relativeHtmlPath);

  const robots = attr(select('meta[name="robots"]', tree), 'content').toLowerCase();
  const refresh = select('meta[http-equiv="refresh"]', tree);
  const canonicalEl = select('link[rel~="canonical"]', tree);
  const hreflang: Record<string, string> = {};
  for (const link of selectAll('link[rel~="alternate"][hreflang]', tree)) {
    hreflang[attr(link, 'hrefLang')] = attr(link, 'href');
  }

  const mainEl = (select('[data-pagefind-body]', tree) ?? select('main', tree) ?? select('body', tree)) as Element | undefined;
  let mainText = '';
  let proseText = '';
  const CODE = 'script, style, noscript, template, svg, pre, code, kbd, samp, .expressive-code, .katex, [translate="no"], .notranslate';
  const pruneSel = (node: Element, selector: string) => {
    node.children = node.children.filter((child) => {
      if (child.type !== 'element') return true;
      if (matches(selector, child)) return false;
      pruneSel(child, selector);
      return true;
    });
  };
  const bodyEl = select('body', tree) as Element | undefined;
  let bodyProse = '';
  if (bodyEl) {
    const body = structuredClone(bodyEl);
    pruneSel(body, CODE);
    bodyProse = strip(textOf(body));
  }
  if (mainEl) {
    const clone = structuredClone(mainEl);
    const prune = (node: Element) => {
      node.children = node.children.filter((child) => {
        if (child.type !== 'element') return true;
        if (matches(MAIN_NOISE, child)) return false;
        prune(child);
        return true;
      });
    };
    prune(clone);
    mainText = strip(textOf(clone));
    const prose = structuredClone(clone);
    const pruneCode = (node: Element) => {
      node.children = node.children.filter((child) => {
        if (child.type !== 'element') return true;
        if (matches('pre, code, kbd, samp, .expressive-code, .katex', child)) return false;
        pruneCode(child);
        return true;
      });
    };
    pruneCode(prose);
    proseText = strip(textOf(prose));
  }

  const jsonLdTypes = new Set<string>();
  for (const script of selectAll('script[type="application/ld+json"]', tree)) {
    try {
      collectJsonLdTypes(JSON.parse(textOf(script)), jsonLdTypes);
    } catch {
      jsonLdTypes.add('INVALID_JSON');
    }
  }

  const isRedirect = Boolean(refresh);
  return {
    file: relativeHtmlPath,
    url: new URL(urlPath, SITE).href,
    path: urlPath,
    lang: attr(htmlEl, 'lang'),
    title: strip(textOf(select('title', tree) ?? { type: 'root', children: [] })),
    description: attr(select('meta[name="description"]', tree), 'content'),
    h1: selectAll('h1', tree).map((h) => strip(textOf(h))).filter(Boolean),
    canonical: canonicalEl ? attr(canonicalEl, 'href') : null,
    robots,
    indexable: !isRedirect && !robots.includes('noindex'),
    isRedirect,
    hreflang,
    words: countWords(mainText),
    mainText,
    proseText,
    bodyProse,
    jsonLdTypes: [...jsonLdTypes].sort(),
  };
};

export const walkHtml = async (dir: string, root = dir): Promise<string[]> => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (path.relative(root, full).split(path.sep)[0] === 'pagefind') return [];
        return walkHtml(full, root);
      }
      return entry.name.endsWith('.html') ? [full] : [];
    }),
  );
  return nested.flat();
};

export const auditDist = async (distDir: string) => {
  const files = (await walkHtml(distDir)).sort();
  const pages: PageAudit[] = [];
  for (const file of files) {
    const rel = path.relative(distDir, file);
    pages.push(auditHtml(await fs.readFile(file, 'utf8'), rel));
  }
  return pages;
};

const csvCell = (value: unknown) => {
  const text = Array.isArray(value) ? value.join(' | ') : String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

export const toCsv = (rows: Array<Record<string, unknown>>) => {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  return `${[headers.join(','), ...rows.map((row) => headers.map((h) => csvCell(row[h])).join(','))].join('\n')}\n`;
};
