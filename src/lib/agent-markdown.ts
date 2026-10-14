import { BOOKING_URL, CONTACT_EMAIL, SITE_AUTHOR, SITE_NAME, SITE_URL } from '../consts';
import { PERSON_SAME_AS, PERSON_TOPICS, PERSON_URL, personNode } from './entity';

export type AgentDocMeta = {
  title: string;
  description?: string;
  url: string;
  datePublished?: Date;
  dateModified?: Date;
};

const KNOWN_COMPONENTS = new Set(['Aside', 'Steps', 'Tabs', 'TabItem', 'Card', 'CardGrid']);
const OPEN = '';
const CLOSE = '';

const IMPORT_START = /^import\s+(\{|\*|[\w$]+\s*(,|from\b)|['"])/;
const EXPORT_START = /^export\s+(?:(?:const|let|var|function|default|async|class|type|interface)\b|\{)/;
const IMPORT_COMPLETE = /(\bfrom\s+['"][^'"]+['"]|^import\s+['"][^'"]+['"])\s*;?\s*$|;\s*$/;
const MDX_COMMENT = /\{\/\*[\s\S]*?\*\/\}/g;
const SELF_CLOSING_COMPONENT = /<[A-Z][A-Za-z0-9]*(?:\s[^<>]*?)?\/>/g;

function attr(tag: string, name: string): string | undefined {
  return new RegExp(`\\b${name}="([^"]*)"`).exec(tag)?.[1];
}

/** Rewrites one stretch of prose (never inline code) so component tags become Markdown or markers. */
function rewriteProse(text: string): string {
  return text
    .replace(MDX_COMMENT, '')
    .replace(SELF_CLOSING_COMPONENT, '')
    .replace(/<Aside\b([^>]*)>/g, (_m, attrs: string) => `${OPEN}${attr(attrs, 'title') ?? ''}${CLOSE}`)
    .replace(/<\/Aside>/g, `${OPEN}/${CLOSE}`)
    .replace(/<TabItem\b([^>]*)>/g, (_m, attrs: string) => {
      const label = attr(attrs, 'label');
      return label ? `**${label}**\n` : '';
    })
    .replace(/<Card\b([^>]*)>/g, (_m, attrs: string) => {
      const title = attr(attrs, 'title');
      return title ? `**${title}**\n` : '';
    })
    .replace(/<\/?(Steps|Tabs|TabItem|CardGrid|Card)\b[^>]*>/g, '');
}

/** Converts an MDX body into plain Markdown an AI agent can read: no imports, no component tags, code untouched. */
export function mdxToAgentMarkdown(body: string): string {
  const out: string[] = [];
  let fence: string | null = null;
  let inAside = false;
  let skippingImport = false;
  let skippingWidget = false;
  let contentStarted = false;

  const quote = (line: string) => (inAside ? (line === '' ? '>' : `> ${line}`) : line);

  const pushCode = (line: string) => {
    contentStarted = true;
    out.push(quote(line));
  };

  const pushProse = (line: string) => {
    if (line.trim() === '') {
      if (inAside) out.push('>');
      else if (out.length > 0 && out[out.length - 1] !== '') out.push('');
      return;
    }
    if (!contentStarted) {
      contentStarted = true;
      if (/^# /.test(line)) return;
    }
    out.push(quote(line));
  };

  const flush = (text: string) => {
    for (const piece of text.split('\n')) {
      if (piece.trim() !== '') pushProse(piece);
    }
  };

  for (const raw of body.replace(/\r\n/g, '\n').split('\n')) {
    if (fence) {
      pushCode(raw);
      const closing = new RegExp(`^\\s*${fence[0]}{${fence.length},}\\s*$`);
      if (closing.test(raw)) fence = null;
      continue;
    }

    const opening = /^\s*(`{3,}|~{3,})/.exec(raw);
    if (opening) {
      fence = opening[1];
      pushCode(raw);
      continue;
    }

    if (skippingImport) {
      if (IMPORT_COMPLETE.test(raw)) skippingImport = false;
      continue;
    }
    if (IMPORT_START.test(raw) || EXPORT_START.test(raw)) {
      if (!IMPORT_COMPLETE.test(raw)) skippingImport = true;
      continue;
    }

    if (skippingWidget) {
      if (/\/>\s*$/.test(raw)) skippingWidget = false;
      continue;
    }
    const widget = /^<([A-Z][A-Za-z0-9]*)\b/.exec(raw);
    if (widget && !KNOWN_COMPONENTS.has(widget[1])) {
      if (/\/>\s*$/.test(raw)) continue;
      if (!/>\s*$/.test(raw)) {
        skippingWidget = true;
        continue;
      }
    }

    if (raw.trim() === '') {
      pushProse('');
      continue;
    }

    const rewritten = raw
      .split(/(`[^`]*`)/)
      .map((segment, index) => (index % 2 === 1 ? segment : rewriteProse(segment)))
      .join('');

    let current = '';
    for (const part of rewritten.split(new RegExp(`(${OPEN}[^${CLOSE}]*${CLOSE})`))) {
      if (part.startsWith(OPEN)) {
        flush(current);
        current = '';
        const marker = part.slice(1, -1);
        if (marker === '/') {
          inAside = false;
        } else {
          inAside = true;
          if (marker) flush(`**${marker}**`);
        }
      } else {
        current += part;
      }
    }
    flush(current);
  }

  return out.join('\n').trim();
}

function yamlString(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
}

const isoDay = (date: Date) => date.toISOString().slice(0, 10);

/** Frontmatter + H1 + converted body: the text served at the `.md` twin of a page. */
export function renderAgentDocument(meta: AgentDocMeta, body: string): string {
  const fields: [string, string | undefined][] = [
    ['title', meta.title],
    ['description', meta.description],
    ['url', meta.url],
    ['author', SITE_AUTHOR],
    ['author_url', PERSON_URL],
    ['publisher', SITE_NAME],
    ['date_published', meta.datePublished && isoDay(meta.datePublished)],
    ['date_modified', meta.dateModified && isoDay(meta.dateModified)],
    ['license', 'CC BY 4.0'],
    ['language', 'it-IT'],
  ];
  const frontmatter = fields
    .filter((field): field is [string, string] => field[1] !== undefined)
    .map(([key, value]) => `${key}: ${yamlString(value)}`)
    .join('\n');

  return `---\n${frontmatter}\n---\n\n# ${meta.title}\n\n${mdxToAgentMarkdown(body)}\n`;
}

/** Markdown twin of /about: who the author is, what they work on, where the proof lives. */
export function renderAboutDocument(): string {
  const person = personNode();
  const topics = PERSON_TOPICS.map((topic) => `- [${topic.name}](${SITE_URL}${topic.href})`).join('\n');
  const profiles = PERSON_SAME_AS.map((url) => `- ${url}`).join('\n');
  const body = [
    String(person.description),
    `**Ruolo:** ${String(person.jobTitle)}`,
    `**Organizzazione:** [${SITE_NAME}](${SITE_URL}), piattaforma gratuita e senza paywall per imparare MarTech, analytics engineering, A/B testing e data engineering.`,
    `## Temi su cui lavora e insegna\n\n${topics}`,
    `## Profili pubblici\n\n${profiles}`,
    `## Contatti\n\n- Email: ${CONTACT_EMAIL}\n- Prenota una call: ${BOOKING_URL}`,
  ].join('\n\n');

  return renderAgentDocument(
    {
      title: `Chi è ${SITE_AUTHOR}`,
      description: String(person.description),
      url: `${PERSON_URL}/`,
    },
    body,
  );
}

export const MARKDOWN_HEADERS = { 'Content-Type': 'text/markdown; charset=utf-8' };
