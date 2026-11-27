/**
 * Gate SEO sui contenuti buildati (lezioni, moduli, articoli). Fa fallire `npm run build`.
 *
 * Lezioni /course/<modulo>/<lezione>/ indicizzabili:
 *  - un solo H1 e H1 univoco in tutto il corso;
 *  - almeno un blocco di codice;
 *  - link al modulo padre e link precedente/successiva;
 *  - BreadcrumbList con ≥3 voci, URL canonici (slash finale), ultima voce = la pagina stessa;
 *  - schema LearningResource.
 * Moduli /course/<modulo>/: schema Course con provider e almeno una lezione (hasPart).
 * Articoli /blog/<slug>/ indicizzabili: BreadcrumbList canonico e schema Article.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fromHtml } from 'hast-util-from-html';
import { select, selectAll } from 'hast-util-select';
import type { Element } from 'hast';
import { auditHtml, walkHtml } from './lib/seo-page-audit';

const distDir = path.resolve(process.env.DIST_DIR ?? 'dist');
const errors: string[] = [];
const fail = (page: string, message: string) => errors.push(`${page}: ${message}`);
const href = (el: Element) => String(el.properties?.href ?? '');

type Node = Record<string, unknown>;
const jsonLdNodes = (html: string): Node[] => {
  const out: Node[] = [];
  for (const script of selectAll('script[type="application/ld+json"]', fromHtml(html))) {
    try {
      const data = JSON.parse(script.children.map((c) => (c.type === 'text' ? c.value : '')).join('')) as Node;
      out.push(...((data['@graph'] as Node[] | undefined) ?? [data]));
    } catch {
      /* segnalato dal gate i18n/audit:site */
    }
  }
  return out;
};
const typeOf = (n: Node, t: string) => (Array.isArray(n['@type']) ? (n['@type'] as string[]).includes(t) : n['@type'] === t);

const checkBreadcrumb = (page: string, nodes: Node[], url: string, minItems: number) => {
  const crumb = nodes.find((n) => typeOf(n, 'BreadcrumbList'));
  if (!crumb) return fail(page, 'BreadcrumbList assente');
  const items = crumb.itemListElement as Array<{ position: number; name?: string; item?: string }>;
  if (!Array.isArray(items) || items.length < minItems) return fail(page, `BreadcrumbList con ${items?.length ?? 0} voci (min ${minItems})`);
  items.forEach((it, i) => {
    if (it.position !== i + 1) fail(page, `breadcrumb: position ${it.position} al posto di ${i + 1}`);
    if (!it.name) fail(page, `breadcrumb: voce ${i + 1} senza name`);
    if (!it.item || !it.item.startsWith('https://ginnytech.it/') || !it.item.endsWith('/')) fail(page, `breadcrumb: item non canonico "${it.item}"`);
  });
  if (items[items.length - 1]?.item !== url) fail(page, `breadcrumb: ultima voce ${items[items.length - 1]?.item} ≠ ${url}`);
};

const h1Owners = new Map<string, string>();
let lessons = 0;
let modules = 0;
let posts = 0;

for (const file of (await walkHtml(distDir)).sort()) {
  const rel = path.relative(distDir, file).split(path.sep).join('/');
  const m = rel.match(/^(course|blog)\/([^/]+)(?:\/([^/]+))?\/index\.html$/);
  if (!m || (m[1] === 'course' && m[2] === 'learning-path')) continue;
  const html = await fs.readFile(file, 'utf8');
  const page = auditHtml(html, rel);
  if (!page.indexable) continue;
  const nodes = jsonLdNodes(html);
  const tree = fromHtml(html);
  const links = selectAll('a[href]', select('main', tree) ?? tree).map(href);

  if (m[1] === 'course' && m[3]) {
    lessons++;
    if (page.h1.length !== 1) fail(page.path, `${page.h1.length} H1 (atteso 1)`);
    const owner = h1Owners.get(page.h1[0] ?? '');
    if (owner) fail(page.path, `H1 duplicato con ${owner}: "${page.h1[0]}"`);
    else h1Owners.set(page.h1[0] ?? '', page.path);
    if (selectAll('pre', tree).length === 0) fail(page.path, 'nessun blocco di codice');
    if (!links.some((l) => l === `/course/${m[2]}/` || l === `/course/${m[2]}`)) fail(page.path, 'manca il link al modulo padre');
    if (selectAll('a.course-nav-prev, a.course-nav-next', tree).length === 0) fail(page.path, 'mancano i link precedente/successiva');
    checkBreadcrumb(page.path, nodes, page.url, 4);
    if (!nodes.some((n) => typeOf(n, 'LearningResource') && n.name)) fail(page.path, 'schema LearningResource assente');
  } else if (m[1] === 'course') {
    modules++;
    const course = nodes.find((n) => typeOf(n, 'Course'));
    if (!course) fail(page.path, 'schema Course assente');
    else {
      if (!course.provider) fail(page.path, 'Course senza provider');
      if (!Array.isArray(course.hasPart) || course.hasPart.length === 0) fail(page.path, 'Course senza lezioni (hasPart)');
    }
    checkBreadcrumb(page.path, nodes, page.url, 3);
  } else if (m[1] === 'blog' && m[2]) {
    posts++;
    checkBreadcrumb(page.path, nodes, page.url, 3);
    if (!nodes.some((n) => typeOf(n, 'Article'))) fail(page.path, 'schema Article assente');
  }
}

console.log(`[check:content-seo] ${lessons} lezioni, ${modules} moduli, ${posts} articoli indicizzabili controllati`);
if (errors.length > 0) {
  console.error(`[check:content-seo] ${errors.length} errori:\n- ${errors.slice(0, Number(process.env.MAX_ERRORS ?? 200)).join('\n- ')}`);
  process.exit(1);
}
console.log('[check:content-seo] OK');
