import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import * as parse5 from 'parse5';
import { redirectEntries } from '../src/lib/config/redirects.mjs';

type CacheEntry = {
  source: string;
  target: string;
  updatedAt: string;
};

type TranslationCache = {
  version: number;
  sourceLanguage: 'it';
  targetLanguage: 'en';
  model: string;
  entries: Record<string, CacheEntry>;
};

type TranslationItem = {
  id: string;
  text: string;
};

const cwd = process.cwd();
const distDir = path.resolve(process.env.DIST_DIR ?? path.join(cwd, 'dist'));
const cachePath = path.resolve(
  process.env.EN_TRANSLATION_CACHE ?? path.join(cwd, 'src', 'data', 'i18n', 'en-static-cache.json'),
);
const siteUrl = process.env.SITE_URL ?? 'https://ginnytech.it';
const model = process.env.OPENAI_TRANSLATION_MODEL ?? 'gpt-4.1-mini';
const batchChars = Number(process.env.TRANSLATION_BATCH_CHARS ?? 9000);
const batchLimit = Number(process.env.TRANSLATION_BATCH_LIMIT ?? 0);
const concurrency = Math.max(1, Number(process.env.TRANSLATION_CONCURRENCY ?? 3));
const maxRetries = Number(process.env.TRANSLATION_MAX_RETRIES ?? 6);
const force = process.env.TRANSLATION_FORCE === '1';
const translateCodeBlocks = process.env.TRANSLATE_CODE_BLOCKS !== '0';
const redirects = redirectEntries as Array<[string, string]>;

const redirectSourceFile = (source: string) => {
  const sourcePath = source.endsWith('/') ? source : `${source}/`;
  return `${sourcePath.replace(/^\//, '')}index.html`;
};

const normalizeRelativeHtmlPath = (relativeHtmlPath: string) => relativeHtmlPath.split(path.sep).join('/');

const redirectTargetBySourceFile = new Map(redirects.map(([source, target]) => [redirectSourceFile(source), target]));

const isRedirectRelativePath = (relativeHtmlPath: string) =>
  redirectTargetBySourceFile.has(normalizeRelativeHtmlPath(relativeHtmlPath));

if (process.env.ALLOW_INSECURE_TLS === '1') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const skipTags = new Set([
  'script',
  'style',
  'code',
  'pre',
  'kbd',
  'samp',
  'svg',
  'math',
  'noscript',
  'textarea',
]);

const translatableAttrNames = new Set(['title', 'alt', 'aria-label', 'aria-description', 'placeholder']);

const translatableJsonLdKeys = new Set([
  'name',
  'headline',
  'alternativeHeadline',
  'description',
  'articleSection',
  'caption',
  'text',
]);

const knownNoTranslate = new Set([
  'GinnyTech',
  'MarTech',
  'SQL',
  'Python',
  'Kafka',
  'ClickHouse',
  'dbt',
  'S3',
  'API',
  'ETL',
  'ELT',
  'KPI',
  'OKR',
  'CAC',
  'LTV',
  'NPS',
  'CRM',
  'CDP',
  'GA4',
  'GTM',
  'IT',
  'EN',
]);

const localAssetPattern =
  /\.(avif|webp|png|jpe?g|gif|svg|ico|css|js|mjs|map|json|xml|txt|pdf|woff2?|ttf|otf|mp4|webm|mp3|wav)$/i;

const italianCodeBlockSignal =
  /\b(?:abbiamo|aggiungi|aggiornamento|alto|andato|aumentare|calcola|calcolare|campagna|campagne|clienti|cliente|codice|composito|confronto|controllo|dati|dato|definisci|domanda|esempio|feature|giorno|indice|lezione|media|mese|metrica|modello|normalizzato|numero|obiettivo|ordini|pesato|pesi|prenotazioni|prezzo|principale|problema|prodotto|profitto|ricavo|rischio|scelta|segmento|settimana|simulazione|spesa|strategici|transazioni|utente|utenti|vendite)\b|[àèéìòù]/i;

const nowIso = () => new Date().toISOString();

const hashText = (text: string) => crypto.createHash('sha256').update(text).digest('hex');

const readJson = async <T>(filePath: string, fallback: T): Promise<T> => {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8')) as T;
  } catch {
    return fallback;
  }
};

const writeJson = async (filePath: string, value: unknown) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

const walkFiles = async (dir: string): Promise<string[]> => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return walkFiles(fullPath);
      return fullPath;
    }),
  );
  return files.flat();
};

const isElementNode = (node: any): node is { tagName: string; attrs?: any[]; childNodes?: any[] } =>
  Boolean(node?.tagName);

const attrValue = (node: any, name: string) =>
  node.attrs?.find((attr: { name: string; value: string }) => attr.name === name)?.value;

const setAttr = (node: any, name: string, value: string) => {
  node.attrs ??= [];
  const existing = node.attrs.find((attr: { name: string; value: string }) => attr.name === name);
  if (existing) {
    existing.value = value;
  } else {
    node.attrs.push({ name, value });
  }
};

const removeAttr = (node: any, name: string) => {
  node.attrs = node.attrs?.filter((attr: { name: string }) => attr.name !== name) ?? [];
};

const parseAstroProps = (node: any) => {
  const rawProps = attrValue(node, 'props');
  if (!rawProps) return null;

  try {
    return JSON.parse(rawProps) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const nonTranslatableAstroPropKeys = new Set([
  'id',
  'moduleId',
  'stageId',
  'quizId',
  'icon',
  'color',
  'href',
  'url',
  'path',
  'slug',
  'order',
  'index',
  'correctIndex',
  'difficulty',
  'duration',
  'totalLessons',
  'totalModules',
  'totalLinks',
  'lessonCount',
  'moduleCount',
  'internalLinks',
  'internalLinkCount',
  'crossModuleLinks',
  'crossModuleIncomingCount',
  'crossModuleOutgoingCount',
  'crossStageIncomingCount',
  'crossStageOutgoingCount',
]);

const nonTranslatableAstroPropContainers = new Set([
  'ids',
  'moduleIds',
  'lessonIds',
  'prerequisites',
  'dependents',
  'externalPrerequisites',
  'externalDependents',
]);

const translatableAstroPropKeys = new Set([
  'title',
  'description',
  'summary',
  'text',
  'explanation',
  'label',
  'category',
  'stageTitle',
  'format',
  'hint',
  'kicker',
]);

const translatableAstroPropContainers = new Set([
  'options',
  'items',
  'deliverables',
  'criteria',
  'checkpoints',
  'questions',
]);

const cssUtilityListPattern = /^(?:from|to|via|bg|text|border|ring|shadow|hover|focus|dark|sm|md|lg|xl|2xl)[\w:/.-]*(?:\s+(?:from|to|via|bg|text|border|ring|shadow|hover|focus|dark|sm|md|lg|xl|2xl)[\w:/.-]*)+$/;

const shouldTranslateAstroPropString = (text: string, key: string | undefined, pathKeys: string[]) => {
  const trimmed = text.trim();
  if (!shouldTranslate(trimmed)) return false;
  if (key && nonTranslatableAstroPropKeys.has(key)) return false;
  if (pathKeys.some((pathKey) => nonTranslatableAstroPropContainers.has(pathKey))) return false;
  if (cssUtilityListPattern.test(trimmed)) return false;
  if (localAssetPattern.test(trimmed)) return false;

  if (key && translatableAstroPropKeys.has(key)) return true;
  if (pathKeys.some((pathKey) => translatableAstroPropContainers.has(pathKey))) return true;

  return /\s/.test(trimmed) && !/^[a-z0-9-_/]+$/i.test(trimmed);
};

const collectAstroSerializedStrings = (
  value: unknown,
  strings: Map<string, string>,
  key?: string,
  pathKeys: string[] = [],
) => {
  if (Array.isArray(value) && value.length >= 2 && typeof value[0] === 'number') {
    const payload = value[1];
    if (typeof payload === 'string') {
      if (shouldTranslateAstroPropString(payload, key, pathKeys)) strings.set(hashText(payload), payload);
      return;
    }
    collectAstroSerializedStrings(payload, strings, key, pathKeys);
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectAstroSerializedStrings(item, strings, key, pathKeys);
    return;
  }

  if (!value || typeof value !== 'object') return;

  for (const [childKey, childValue] of Object.entries(value)) {
    collectAstroSerializedStrings(childValue, strings, childKey, [...pathKeys, childKey]);
  }
};

const applyAstroSerializedTranslations = (
  value: unknown,
  cache: TranslationCache,
  key?: string,
  pathKeys: string[] = [],
): boolean => {
  let changed = false;

  if (Array.isArray(value) && value.length >= 2 && typeof value[0] === 'number') {
    const payload = value[1];
    if (typeof payload === 'string') {
      if (shouldTranslateAstroPropString(payload, key, pathKeys)) {
        value[1] = translateCached(cache, payload);
        return value[1] !== payload;
      }
      return false;
    }
    return applyAstroSerializedTranslations(payload, cache, key, pathKeys);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      changed = applyAstroSerializedTranslations(item, cache, key, pathKeys) || changed;
    }
    return changed;
  }

  if (!value || typeof value !== 'object') return false;

  for (const [childKey, childValue] of Object.entries(value)) {
    changed = applyAstroSerializedTranslations(childValue, cache, childKey, [...pathKeys, childKey]) || changed;
  }
  return changed;
};

const collectAstroIslandProps = (node: any, strings: Map<string, string>) => {
  if (!isElementNode(node) || node.tagName !== 'astro-island') return;

  const props = parseAstroProps(node);
  if (!props) return;

  collectAstroSerializedStrings(props, strings);
};

const applyAstroIslandPropTranslations = (node: any, cache: TranslationCache) => {
  if (!isElementNode(node) || node.tagName !== 'astro-island') return;

  const props = parseAstroProps(node);
  if (!props) return;

  const changed = applyAstroSerializedTranslations(props, cache);
  if (changed) setAttr(node, 'props', JSON.stringify(props));
};

const shouldTranslate = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (knownNoTranslate.has(trimmed)) return false;
  if (trimmed.length === 1) return false;
  if (/^https?:\/\//i.test(trimmed)) return false;
  if (/^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i.test(trimmed)) return false;
  if (!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(trimmed)) return false;
  return true;
};

const textContent = (node: any): string => {
  if (node.nodeName === '#text' && typeof node.value === 'string') return node.value;
  return (node.childNodes ?? []).map(textContent).join('');
};

const shouldTranslateCodeBlock = (text: string) => {
  if (!translateCodeBlocks) return false;
  const trimmed = text.trim();
  if (trimmed.length < 20) return false;
  if (!/[A-Za-zÀ-ÿ]/.test(trimmed)) return false;
  return italianCodeBlockSignal.test(trimmed);
};

const isJsonLdScript = (node: any) =>
  isElementNode(node) &&
  node.tagName === 'script' &&
  String(attrValue(node, 'type') ?? '').toLowerCase() === 'application/ld+json';

const findFirstChildElement = (node: any, tagName: string): any | undefined =>
  (node.childNodes ?? []).find((child: any) => isElementNode(child) && child.tagName === tagName);

const replaceElementText = (node: any, value: string) => {
  const codeChild = isElementNode(node) && node.tagName === 'pre' ? findFirstChildElement(node, 'code') : undefined;
  const target = codeChild ?? node;
  target.childNodes = [{ nodeName: '#text', value }];
};

const readJsonLd = (node: any) => {
  try {
    return JSON.parse(textContent(node));
  } catch {
    return null;
  }
};

const collectJsonLdStrings = (value: unknown, strings: Map<string, string>, key?: string) => {
  if (typeof value === 'string') {
    if (key && translatableJsonLdKeys.has(key) && shouldTranslate(value)) {
      strings.set(hashText(value), value);
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectJsonLdStrings(item, strings, key);
    return;
  }

  if (!value || typeof value !== 'object') return;

  for (const [childKey, childValue] of Object.entries(value)) {
    collectJsonLdStrings(childValue, strings, childKey);
  }
};

const applyJsonLdTranslations = (value: unknown, cache: TranslationCache, key?: string): unknown => {
  if (typeof value === 'string') {
    return key && translatableJsonLdKeys.has(key) && shouldTranslate(value) ? translateCached(cache, value) : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => applyJsonLdTranslations(item, cache, key));
  }

  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value).map(([childKey, childValue]) => [
      childKey,
      applyJsonLdTranslations(childValue, cache, childKey),
    ]),
  );
};

const withTranslatedWhitespace = (raw: string, translate: (text: string) => string) => {
  const match = raw.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!match) return raw;
  const [, before, core, after] = match;
  if (!shouldTranslate(core)) return raw;
  return `${before}${translate(core)}${after}`;
};

const isTranslatableMeta = (node: any, attrName: string) => {
  if (attrName !== 'content') return false;
  if (node.tagName !== 'meta') return false;

  const name = attrValue(node, 'name');
  const property = attrValue(node, 'property');
  return [
    'description',
    'twitter:title',
    'twitter:description',
  ].includes(String(name)) || [
    'og:title',
    'og:description',
    'og:image:alt',
  ].includes(String(property));
};

const collectStrings = (node: any, strings: Map<string, string>, blocked = false) => {
  if (isJsonLdScript(node)) {
    const jsonLd = readJsonLd(node);
    if (jsonLd) collectJsonLdStrings(jsonLd, strings);
    return;
  }

  if (isElementNode(node) && node.tagName === 'pre') {
    const codeBlock = textContent(node);
    if (shouldTranslateCodeBlock(codeBlock)) strings.set(hashText(codeBlock), codeBlock);
    return;
  }

  if (isElementNode(node) && node.tagName === 'code') {
    const inlineCode = textContent(node);
    if (shouldTranslateCodeBlock(inlineCode)) strings.set(hashText(inlineCode), inlineCode);
    return;
  }

  const isBlocked = blocked || (isElementNode(node) && skipTags.has(node.tagName));

  if (node.nodeName === '#text' && typeof node.value === 'string') {
    const core = node.value.trim();
    if (!isBlocked && shouldTranslate(core)) strings.set(hashText(core), core);
  }

  if (isElementNode(node)) {
    if (!isBlocked) collectAstroIslandProps(node, strings);

    for (const attr of node.attrs ?? []) {
      if (translatableAttrNames.has(attr.name) || isTranslatableMeta(node, attr.name)) {
        const value = attr.value.trim();
        if (shouldTranslate(value)) strings.set(hashText(value), value);
      }
    }
  }

  if (isBlocked) return;

  for (const child of node.childNodes ?? []) {
    collectStrings(child, strings, isBlocked);
  }
};

const translateCached = (cache: TranslationCache, text: string) => {
  const entry = cache.entries[hashText(text)];
  return entry?.target ?? text;
};

const originalPublicPath = (relativeHtmlPath: string) => {
  const normalized = relativeHtmlPath.split(path.sep).join('/');
  if (normalized === 'index.html') return '/';
  if (normalized === '404.html') return '/404.html';
  return `/${normalized.replace(/\/index\.html$/, '/').replace(/\.html$/, '/')}`;
};

const englishPublicPath = (relativeHtmlPath: string) => {
  const original = originalPublicPath(relativeHtmlPath);
  return original === '/' ? '/en/' : `/en${original}`;
};

const absoluteUrl = (publicPath: string) => new URL(publicPath, siteUrl).href;

const isLocalPageHref = (href: string) => {
  if (!href.startsWith('/') || href.startsWith('//')) return false;
  const withoutHash = href.split('#')[0] || '/';
  const withoutQuery = withoutHash.split('?')[0] || '/';
  if (withoutQuery.startsWith('/en/')) return false;
  if (withoutQuery.startsWith('/_astro/') || withoutQuery.startsWith('/pagefind/')) return false;
  if (withoutQuery.startsWith('/api/')) return false;
  if (localAssetPattern.test(withoutQuery)) return false;
  return true;
};

const prefixEnglishHref = (href: string) => {
  if (!isLocalPageHref(href)) return href;
  if (href === '/') return '/en/';
  return `/en${href}`;
};

const rewriteRefreshContent = (content: string) =>
  content.replace(/(url=)([^;]+)/i, (_match, prefix: string, target: string) => `${prefix}${prefixEnglishHref(target.trim())}`);

const rewriteDocumentMetadata = (document: any, relativeHtmlPath: string) => {
  const normalizedRelativePath = normalizeRelativeHtmlPath(relativeHtmlPath);
  const redirectTarget = redirectTargetBySourceFile.get(normalizedRelativePath);
  const originalPath = originalPublicPath(normalizedRelativePath);
  const enPath = englishPublicPath(normalizedRelativePath);
  const originalUrl = absoluteUrl(originalPath);
  const enUrl = absoluteUrl(enPath);
  const canonicalUrl = redirectTarget ? absoluteUrl(prefixEnglishHref(redirectTarget)) : enUrl;
  let headNode: any | undefined;

  const localizeLanguageSwitcherLink = (node: any, targetLanguage: string) => {
    if (targetLanguage === 'it') {
      setAttr(node, 'href', originalPath);
      const className = attrValue(node, 'class');
      if (className) {
        setAttr(
          node,
          'class',
          className.replace('bg-white text-slate-950', 'text-slate-300 hover:bg-white/10 hover:text-white'),
        );
      }
      removeAttr(node, 'aria-current');
      return true;
    }

    if (targetLanguage === 'en') {
      setAttr(node, 'href', enPath);
      const className = attrValue(node, 'class');
      if (className) {
        setAttr(
          node,
          'class',
          className.replace('text-slate-300 hover:bg-white/10 hover:text-white', 'bg-emerald-300 text-slate-950'),
        );
      }
      setAttr(node, 'aria-current', 'page');
      return true;
    }

    return false;
  };

  const visit = (node: any) => {
    if (isElementNode(node)) {
      if (node.tagName === 'html') {
        setAttr(node, 'lang', 'en');
        setAttr(node, 'data-language', 'en');
      }

      if (node.tagName === 'head') {
        headNode = node;
      }

      if (node.tagName === 'a') {
        const languageTarget = attrValue(node, 'data-language-target');
        if (languageTarget && localizeLanguageSwitcherLink(node, languageTarget)) {
          for (const child of node.childNodes ?? []) visit(child);
          return;
        }
        const href = attrValue(node, 'href');
        if (href) setAttr(node, 'href', prefixEnglishHref(href));
      }

      if (node.tagName === 'form') {
        const action = attrValue(node, 'action');
        if (action) setAttr(node, 'action', prefixEnglishHref(action));
      }

      if (node.tagName === 'link' && attrValue(node, 'rel') === 'canonical') {
        setAttr(node, 'href', canonicalUrl);
      }

      if (node.tagName === 'link' && attrValue(node, 'rel') === 'alternate') {
        const hreflang = attrValue(node, 'hreflang');
        if (hreflang === 'x-default' || hreflang === 'it-IT') setAttr(node, 'href', originalUrl);
      }

      if (node.tagName === 'meta') {
        const property = attrValue(node, 'property');
        const httpEquiv = attrValue(node, 'http-equiv');
        if (httpEquiv?.toLowerCase() === 'refresh') {
          const content = attrValue(node, 'content');
          if (content) setAttr(node, 'content', rewriteRefreshContent(content));
        }
        if (property === 'og:url') setAttr(node, 'content', enUrl);
        if (property === 'og:locale') setAttr(node, 'content', 'en_US');
      }
    }

    for (const child of node.childNodes ?? []) visit(child);
  };

  visit(document);

  if (headNode) {
    headNode.childNodes ??= [];
    headNode.childNodes.push(
      { nodeName: '#text', value: '\n\t\t' },
      {
        nodeName: 'link',
        tagName: 'link',
        attrs: [
          { name: 'rel', value: 'alternate' },
          { name: 'href', value: enUrl },
          { name: 'hreflang', value: 'en-US' },
        ],
        namespaceURI: 'http://www.w3.org/1999/xhtml',
        childNodes: [],
      },
    );
  }
};

const applyTranslations = (node: any, cache: TranslationCache, blocked = false) => {
  if (isJsonLdScript(node)) {
    const jsonLd = readJsonLd(node);
    if (jsonLd) replaceElementText(node, JSON.stringify(applyJsonLdTranslations(jsonLd, cache)));
    return;
  }

  if (isElementNode(node) && node.tagName === 'pre') {
    const codeBlock = textContent(node);
    if (shouldTranslateCodeBlock(codeBlock)) {
      replaceElementText(node, translateCached(cache, codeBlock));
    }
    return;
  }

  if (isElementNode(node) && node.tagName === 'code') {
    const inlineCode = textContent(node);
    if (shouldTranslateCodeBlock(inlineCode)) {
      replaceElementText(node, translateCached(cache, inlineCode));
    }
    return;
  }

  const isBlocked = blocked || (isElementNode(node) && skipTags.has(node.tagName));

  if (node.nodeName === '#text' && typeof node.value === 'string') {
    if (!isBlocked) node.value = withTranslatedWhitespace(node.value, (text) => translateCached(cache, text));
  }

  if (isElementNode(node)) {
    if (!isBlocked) applyAstroIslandPropTranslations(node, cache);

    for (const attr of node.attrs ?? []) {
      if (translatableAttrNames.has(attr.name) || isTranslatableMeta(node, attr.name)) {
        attr.value = withTranslatedWhitespace(attr.value, (text) => translateCached(cache, text));
      }
    }
  }

  if (isBlocked) return;

  for (const child of node.childNodes ?? []) {
    applyTranslations(child, cache, isBlocked);
  }
};

const chunkItems = (items: TranslationItem[]) => {
  const chunks: TranslationItem[][] = [];
  let current: TranslationItem[] = [];
  let size = 0;

  for (const item of items) {
    const nextSize = item.text.length + 48;
    if (current.length > 0 && size + nextSize > batchChars) {
      chunks.push(current);
      current = [];
      size = 0;
    }
    current.push(item);
    size += nextSize;
  }

  if (current.length > 0) chunks.push(current);
  return batchLimit > 0 ? chunks.slice(0, batchLimit) : chunks;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const retryableStatuses = new Set([408, 409, 429, 500, 502, 503, 504, 520, 522, 524]);

const retryDelay = (attempt: number) => Math.min(45000, 1500 * 2 ** (attempt - 1));

const extractJson = (content: string) => {
  try {
    return JSON.parse(content);
  } catch {
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(content.slice(start, end + 1));
    }
    throw new Error(`Translation response was not JSON: ${content.slice(0, 300)}`);
  }
};

const requestTranslation = async (items: TranslationItem[], attempt = 1): Promise<Record<string, string>> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required to generate missing English translations.');
  }

  let response: Response;
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a professional Italian-to-English localization engine for a technical education website about MarTech, analytics engineering, data engineering, statistics, SQL, Python, Kafka, ClickHouse, product analytics, and marketing analytics. Translate only user-visible text into fluent English. Preserve brand names, URLs, code identifiers, numbers, acronyms, and technical product names. If an item is a code block, SQL block, Python block, terminal block, Mermaid diagram, or ASCII diagram, preserve executable syntax, indentation, punctuation, identifiers, variable names, function names, table names, URLs, and commands exactly; translate only natural-language comments, prose labels, explanatory strings, and diagram labels when appropriate. Keep the original meaning and tone. Return only a valid JSON object shaped as {"translations":{"id":"translated text"}}.',
          },
          {
            role: 'user',
            content: JSON.stringify({ items }),
          },
        ],
      }),
    });
  } catch (error) {
    if (attempt < maxRetries) {
      await sleep(retryDelay(attempt));
      return requestTranslation(items, attempt + 1);
    }
    throw error;
  }

  const raw = await response.text();
  if (!response.ok) {
    if (attempt < maxRetries && retryableStatuses.has(response.status)) {
      await sleep(retryDelay(attempt));
      return requestTranslation(items, attempt + 1);
    }
    throw new Error(`OpenAI translation failed (${response.status}): ${raw.slice(0, 500)}`);
  }

  let content = '{}';
  try {
    content = JSON.parse(raw).choices?.[0]?.message?.content ?? '{}';
  } catch (error) {
    if (attempt < maxRetries) {
      await sleep(retryDelay(attempt));
      return requestTranslation(items, attempt + 1);
    }
    throw error;
  }

  const payload = extractJson(content);
  const translations = payload.translations ?? payload;
  const missing = items.filter((item) => typeof translations[item.id] !== 'string');

  if (missing.length > 0) {
    if (items.length === 1 || attempt >= maxRetries) {
      throw new Error(`Translation response missed ${missing.length} item(s): ${missing.map((item) => item.id).join(', ')}`);
    }
    const midpoint = Math.ceil(items.length / 2);
    return {
      ...(await requestTranslation(items.slice(0, midpoint), attempt + 1)),
      ...(await requestTranslation(items.slice(midpoint), attempt + 1)),
    };
  }

  return translations;
};

const translateMissing = async (cache: TranslationCache, missingItems: TranslationItem[]) => {
  const chunks = chunkItems(missingItems);
  let translatedCount = 0;
  let nextChunkIndex = 0;
  let writeQueue = Promise.resolve();

  const persist = async () => {
    writeQueue = writeQueue.then(() => writeJson(cachePath, cache));
    await writeQueue;
  };

  const worker = async (workerId: number) => {
    while (nextChunkIndex < chunks.length) {
      const index = nextChunkIndex;
      nextChunkIndex += 1;
      const chunk = chunks[index];
      const result = await requestTranslation(chunk);

      for (const item of chunk) {
        cache.entries[item.id] = {
          source: item.text,
          target: String(result[item.id]).trim() || item.text,
          updatedAt: nowIso(),
        };
        translatedCount += 1;
      }

      await persist();
      console.log(
        `[translate:static] worker ${workerId}: ${index + 1}/${chunks.length} batches, ${translatedCount}/${missingItems.length} strings translated`,
      );
    }
  };

  await Promise.all(Array.from({ length: Math.min(concurrency, chunks.length) }, (_, index) => worker(index + 1)));
  await writeQueue;
};

const generateEnglishPages = async (htmlFiles: string[], cache: TranslationCache) => {
  for (const sourcePath of htmlFiles) {
    const relativePath = path.relative(distDir, sourcePath);
    const html = await fs.readFile(sourcePath, 'utf8');
    const document = parse5.parse(html);

    applyTranslations(document, cache);
    rewriteDocumentMetadata(document, relativePath);

    const targetPath = path.join(distDir, 'en', relativePath);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, parse5.serialize(document), 'utf8');
  }
};

const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const writeEnglishSitemap = async (htmlFiles: string[]) => {
  const urls = htmlFiles
    .filter((filePath) => {
      const relativePath = normalizeRelativeHtmlPath(path.relative(distDir, filePath));
      return relativePath !== '404.html' && !isRedirectRelativePath(relativePath);
    })
    .map((filePath) => absoluteUrl(englishPublicPath(path.relative(distDir, filePath))))
    .sort();
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`)
    .join('\n')}\n</urlset>\n`;
  await fs.writeFile(path.join(distDir, 'sitemap-en.xml'), sitemap, 'utf8');

  const sitemapIndexPath = path.join(distDir, 'sitemap-index.xml');
  try {
    const index = await fs.readFile(sitemapIndexPath, 'utf8');
    if (!index.includes('sitemap-en.xml')) {
      const insertion = `  <sitemap><loc>${escapeXml(absoluteUrl('/sitemap-en.xml'))}</loc></sitemap>\n`;
      await fs.writeFile(sitemapIndexPath, index.replace('</sitemapindex>', `${insertion}</sitemapindex>`), 'utf8');
    }
  } catch {
    // Sitemap generation is best-effort because Astro may be configured without sitemap in some environments.
  }
};

const main = async () => {
  const allHtmlFiles = (await walkFiles(distDir)).filter((filePath) => filePath.endsWith('.html'));
  const htmlFiles = allHtmlFiles.filter((filePath) => {
    const relativePath = path.relative(distDir, filePath).split(path.sep).join('/');
    return !relativePath.startsWith('en/') && !relativePath.startsWith('pagefind/');
  });

  const cache = await readJson<TranslationCache>(cachePath, {
    version: 1,
    sourceLanguage: 'it',
    targetLanguage: 'en',
    model,
    entries: {},
  });
  cache.model = model;

  const strings = new Map<string, string>();
  for (const htmlFile of htmlFiles) {
    collectStrings(parse5.parse(await fs.readFile(htmlFile, 'utf8')), strings);
  }

  const missingItems = [...strings.entries()]
    .filter(([id, source]) => force || !cache.entries[id] || cache.entries[id].source !== source)
    .map(([id, text]) => ({ id, text }));

  console.log(`[translate:static] ${htmlFiles.length} HTML files scanned`);
  console.log(`[translate:static] ${strings.size} unique strings found, ${missingItems.length} missing`);

  if (missingItems.length > 0) {
    await translateMissing(cache, missingItems);
  }

  await generateEnglishPages(htmlFiles, cache);
  await writeEnglishSitemap(htmlFiles);
  console.log(`[translate:static] generated ${htmlFiles.length} English HTML pages in ${path.join(distDir, 'en')}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
