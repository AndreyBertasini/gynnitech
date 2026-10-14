import fs from 'node:fs/promises';
import path from 'node:path';
import type { Element, Nodes, Root } from 'hast';
import { fromHtml } from 'hast-util-from-html';
import { select, selectAll } from 'hast-util-select';

export type PageSnapshot = {
  title: string;
  metaDescription: string;
  canonical: string;
  headings: { level: number; text: string }[];
  text: string;
  counts: { katex: number; katexDisplay: number; mermaid: number; codeBlocks: number; images: number };
  internalLinks: string[];
};

export type Snapshot = Record<string, PageSnapshot>;

export type TextDiff = { index: number; before: string; after: string; count: number };
export type ChangedPage = { path: string; fields: string[]; textDiff?: TextDiff };
export type CompareResult = { added: string[]; removed: string[]; changed: ChangedPage[] };

const IGNORED_TAGS = new Set(['script', 'style', 'noscript', 'template']);
const BLOCK_TAGS = new Set([
  'address', 'article', 'aside', 'blockquote', 'body', 'caption', 'dd', 'details', 'div', 'dl', 'dt',
  'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header',
  'hr', 'li', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'summary', 'table', 'tbody', 'td', 'tfoot',
  'th', 'thead', 'tr', 'ul',
]);

/** Collapses every whitespace run to one space. Never inserts or removes a space. */
export function normalizeText(text: string): string {
  return text
    .replace(/\/_astro\/([^"'\s)]*?)\.[A-Za-z0-9_-]{8}\.(\w+)/g, '/_astro/$1.$2')
    .replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z/g, '<ISO_DATE>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Visible text of a subtree. Unlike innerText, <br> adds nothing: a <br> is often hidden by CSS
 * at some breakpoints, so the whitespace text around it is what must be compared.
 * Only block-level elements add a separator.
 */
function textOf(node: Nodes): string {
  if (node.type === 'text') return node.value;
  if (node.type !== 'element' && node.type !== 'root') return '';
  if (node.type === 'element' && IGNORED_TAGS.has(node.tagName)) return '';
  const inner = node.children.map(textOf).join('');
  return node.type === 'element' && BLOCK_TAGS.has(node.tagName) ? `\n${inner}\n` : inner;
}

const attr = (el: Element | undefined, name: string): string => {
  const value = el?.properties?.[name];
  return typeof value === 'string' ? value : '';
};

export function extractPage(html: string): PageSnapshot | null {
  const tree: Root = fromHtml(html);

  if (select('meta[http-equiv="refresh"]', tree)) return null;

  const body = select('body', tree);
  const titleEl = select('title', tree);
  const canonicalEl = select('link[rel="canonical"]', tree);
  const descriptionEl = select('meta[name="description"]', tree);

  const headings = selectAll('h1, h2, h3', tree).map((h) => ({
    level: Number(h.tagName.slice(1)),
    text: normalizeText(textOf(h)),
  }));

  const internalLinks = [
    ...new Set(
      selectAll('a[href]', tree)
        .map((a) => attr(a, 'href'))
        .filter((href) => href.startsWith('/') && !href.startsWith('//')),
    ),
  ].sort();

  return {
    title: titleEl ? normalizeText(textOf(titleEl)) : '',
    metaDescription: attr(descriptionEl, 'content'),
    canonical: attr(canonicalEl, 'href'),
    headings,
    text: body ? normalizeText(textOf(body)) : '',
    counts: {
      katex: selectAll('.katex', tree).length,
      katexDisplay: selectAll('.katex-display', tree).length,
      mermaid: selectAll('.mermaid', tree).length,
      codeBlocks: selectAll('.expressive-code', tree).length,
      images: selectAll('img', tree).length,
    },
    internalLinks,
  };
}

const LOOKAHEAD = 8;

/** Number of separate differing regions between two word lists (greedy resync). */
function countDiffRegions(a: string[], b: string[]): number {
  let i = 0;
  let j = 0;
  let count = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    count++;
    let resynced = false;
    for (let k = 1; k <= LOOKAHEAD && !resynced; k++) {
      for (let x = 0; x <= k; x++) {
        const y = k - x;
        if (i + x < a.length && j + y < b.length && a[i + x] === b[j + y]) {
          i += x;
          j += y;
          resynced = true;
          break;
        }
      }
    }
    if (!resynced) {
      i++;
      j++;
    }
  }
  if (i < a.length || j < b.length) count++;
  return count;
}

function diffText(a: string, b: string): TextDiff {
  let index = 0;
  while (index < a.length && index < b.length && a[index] === b[index]) index++;
  const from = Math.max(0, index - 40);
  return {
    index,
    before: a.slice(from, index + 40),
    after: b.slice(from, index + 40),
    count: Math.max(1, countDiffRegions(a.split(' '), b.split(' '))),
  };
}

const FIELDS: (keyof PageSnapshot)[] = [
  'title', 'metaDescription', 'canonical', 'headings', 'text', 'counts', 'internalLinks',
];

export function comparePages(a: Snapshot, b: Snapshot): CompareResult {
  const removed = Object.keys(a).filter((k) => !(k in b)).sort();
  const added = Object.keys(b).filter((k) => !(k in a)).sort();
  const changed: ChangedPage[] = [];

  for (const key of Object.keys(a).filter((k) => k in b).sort()) {
    const fields = FIELDS.filter((f) => JSON.stringify(a[key][f]) !== JSON.stringify(b[key][f]));
    if (fields.length === 0) continue;
    changed.push({
      path: key,
      fields,
      ...(fields.includes('text') ? { textDiff: diffText(a[key].text, b[key].text) } : {}),
    });
  }
  return { added, removed, changed };
}

export function renderReport(result: CompareResult): string {
  const { added, removed, changed } = result;
  if (!added.length && !removed.length && !changed.length) return '# Confronto fotografie\n\nNessuna differenza.\n';

  const lines = [
    '# Confronto fotografie',
    '',
    `Pagine aggiunte: ${added.length} · rimosse: ${removed.length} · cambiate: ${changed.length}`,
    '',
  ];
  if (added.length) lines.push('## Aggiunte', '', ...added.map((p) => `- ${p}`), '');
  if (removed.length) lines.push('## Rimosse', '', ...removed.map((p) => `- ${p}`), '');
  if (changed.length) {
    lines.push('## Cambiate', '');
    for (const page of changed) {
      lines.push(`### ${page.path}`, '', `Campi: ${page.fields.join(', ')}`);
      if (page.textDiff) {
        const d = page.textDiff;
        lines.push(
          `Differenze nel testo: ${d.count} (prima alla posizione ${d.index})`,
          '```',
          `- ${d.before}`,
          `+ ${d.after}`,
          '```',
        );
      }
      lines.push('');
    }
  }
  return lines.join('\n');
}

async function listHtml(dir: string, root = dir): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return listHtml(full, root);
      return e.name.endsWith('.html') ? [path.relative(root, full).split(path.sep).join('/')] : [];
    }),
  );
  return files.flat();
}

export async function captureDist(distDir: string): Promise<Snapshot> {
  const snapshot: Snapshot = {};
  for (const rel of (await listHtml(distDir)).sort()) {
    const page = extractPage(await fs.readFile(path.join(distDir, rel), 'utf-8'));
    if (page) snapshot[rel] = page;
  }
  return snapshot;
}
