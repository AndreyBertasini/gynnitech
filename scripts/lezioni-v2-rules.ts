import matter from 'gray-matter';

export type V2ModuleProfile = 'technical' | 'analytical' | 'conceptual';
export type V2LessonKind = 'core' | 'index';

export const V2_MODULE_PROFILES: Record<string, V2ModuleProfile> = {
  // Technical (10)
  'data-collection': 'technical',
  'advanced-sql': 'technical',
  'data-warehousing': 'technical',
  'analytics-engineering': 'technical',
  's3-data-lake': 'technical',
  'kafka-streaming': 'technical',
  'real-time-analytics': 'technical',
  'infrastructure-ops': 'technical',
  'ai-data-workflows': 'technical',
  'agentic-ai-data-workflows': 'technical',
  // Analytical (6)
  'metriche-fondamenti': 'analytical',
  'matematica-analisi-dati': 'analytical',
  'significativita-statistica': 'analytical',
  'analisi-prodotto': 'analytical',
  'analisi-marketing': 'analytical',
  'marketing-data-science': 'analytical',
  // Conceptual (5)
  panoramica: 'conceptual',
  'gestione-data-driven': 'conceptual',
  'dashboard-visualizzazione': 'conceptual',
  'direzioni-analitica': 'conceptual',
  'filosofia-analisi-dati': 'conceptual',
};

export const V2_WORD_BOUNDS: Record<V2ModuleProfile | 'index', { minWords: number; maxWords: number }> = {
  technical: { minWords: 1800, maxWords: 3800 },
  analytical: { minWords: 1800, maxWords: 3800 },
  conceptual: { minWords: 1600, maxWords: 3200 },
  index: { minWords: 1200, maxWords: 2600 },
};

export const V2_FORBIDDEN_H2: readonly string[] = [
  'introduzione',
  "l'idea di fondo",
  'riepilogo',
  'conclusioni',
  'sintesi',
];

const THEORETICAL_CATEGORIES = new Set([
  'Strategia',
  'Comunicazione',
  'Ricerca',
  'Ricerca Qualitativa',
  'Ricerca Quantitativa',
  'Fondamenti',
  'Metriche',
  'Metodologia',
  'Brand',
  'Management',
]);

const ANALYTICAL_CODE_LANGS = new Set(['sql', 'python', 'py', 'r']);

const FRASI_VIETATE: RegExp[] = [
  /\bin questo modulo\b/i,
  /\bin questa lezione\b/i,
  /\bin questo articolo\b/i,
  /\bvedremo come\b/i,
  /\bvediamo ora\b/i,
  /\bcapiremo insieme\b/i,
  /\babbiamo visto\b/i,
  /\bnel prossimo paragrafo\b/i,
  /\bnei paragrafi successivi\b/i,
  /\bin conclusione\b/i,
  /\bricapitolando\b/i,
  /\bvale la pena notare\b/i,
  /\bè importante sottolineare\b/i,
  /\bin poche parole\b/i,
  /\bti mostro\b/i,
  /\bvi mostro\b/i,
  /\bti spiegherò\b/i,
  /\bvi spiegherò\b/i,
  /\bscoprirete\b/i,
  /\bfacciamo un passo indietro\b/i,
  /\bpartiamo dalle basi\b/i,
];

const PRONOMI_VIETATI = /(?:^|[^A-Za-zÀ-ÿ])(?:[Nn]oi|vi|Vi)(?![A-Za-zÀ-ÿ])/;
const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
const RIGA_IN_GRASSETTO = /^\s*\*\*[^*\n]+\*\*\s*$/;

const RESTO_3S: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /^\s*import\s+/, label: 'import JSX/ESM' },
  { pattern: /<LezioneCard\b/, label: '<LezioneCard>' },
  { pattern: /<Sezione\b/, label: '<Sezione>' },
  { pattern: /<Quiz\b/, label: '<Quiz>' },
  { pattern: /<Esercizio\b/, label: '<Esercizio>' },
  { pattern: /<Schema\b/, label: '<Schema>' },
  { pattern: /<Tabella\b/, label: '<Tabella>' },
  { pattern: /\bTODO\b/, label: 'TODO' },
  { pattern: /\bTBD\b/, label: 'TBD' },
  { pattern: /\bFIXME\b/, label: 'FIXME' },
  { pattern: /\[da completare\]/i, label: '[da completare]' },
  { pattern: /\[placeholder\]/i, label: '[placeholder]' },
];

const QUANTITA_CON_UNITA =
  /(?:[€$]\s*\d+(?:[.,]\d+)?|\d+(?:[.,]\d+)?\s*(?:%|euro|€|\$|ms|sec|min|ore|giorni|mesi|anni|gb|mb|kb|tb|righe|record|utenti|ordini|clienti|eventi|click|sessioni|lead|visite|casi|successi|conversioni|richieste|query|nodi|partizioni|token|pp|x)\b)/gi;

const DERIVAZIONE_INDICATOR =
  /(?:\d+(?:[.,]\d+)?\s*[+\-*/×÷=]\s*\d+(?:[.,]\d+)?|→\s*\d+|=\s*\d+(?:[.,]\d+)?%?|da\s+\d+(?:[.,]\d+)?%?\s+a\s+\d+(?:[.,]\d+)?%?|\b(?:calcol|risultato|totale|somma|media|tasso|margine|differenza|variazione|incremento|riduzione|pari a|quindi|otteniamo|equivale|derivazione|esempio numerico)\b)/i;

interface Riga {
  indice: number;
  testo: string;
  codice: boolean;
  lingua: string;
  blockId: number | null;
  vuota: boolean;
}

interface Sezione {
  titolo: string;
  righe: Riga[];
}

interface CodeBlockInfo {
  id: number;
  lingua: string;
  nonEmptyLines: number;
}

interface TableInfo {
  dataRows: number;
  numericRows: number;
}

export function getV2ModuleProfile(moduleOrRel: string): V2ModuleProfile {
  const normalized = moduleOrRel.replace(/\\/g, '/').toLowerCase().trim();
  if (normalized in V2_MODULE_PROFILES) {
    return V2_MODULE_PROFILES[normalized];
  }
  const segments = normalized.split('/').filter(Boolean);
  for (const seg of segments) {
    if (seg in V2_MODULE_PROFILES) {
      return V2_MODULE_PROFILES[seg];
    }
  }
  return 'conceptual';
}

export function getV2LessonKind(rel: string, order?: unknown): V2LessonKind {
  if (order === 0 || order === '0') {
    return 'index';
  }
  const normalized = rel.replace(/\\/g, '/').toLowerCase();
  const fileName = normalized.split('/').pop() ?? '';
  const slug = fileName.replace(/\.mdx?$/, '');
  if (/^(indice-|cheat-sheet|glossario)/.test(slug) || slug === 'indice') {
    return 'index';
  }
  return 'core';
}

function resolveV2Profile(rel: string, frontmatterModule: unknown): V2ModuleProfile {
  const relSegments = rel.replace(/\\/g, '/').toLowerCase().split('/').filter(Boolean);
  for (const seg of relSegments) {
    if (seg in V2_MODULE_PROFILES) {
      return V2_MODULE_PROFILES[seg];
    }
  }
  if (typeof frontmatterModule === 'string') {
    const modNorm = frontmatterModule.trim().toLowerCase();
    if (modNorm in V2_MODULE_PROFILES) {
      return V2_MODULE_PROFILES[modNorm];
    }
  }
  return getV2ModuleProfile(rel);
}

function leggiRighe(body: string): {
  righe: Riga[];
  codeBlocks: CodeBlockInfo[];
  unclosedFence: boolean;
} {
  const linee = body.split('\n');
  const righe: Riga[] = [];
  const codeBlocks: CodeBlockInfo[] = [];

  let inFence = false;
  let fenceChar = '`';
  let fenceLen = 3;
  let lingua = '';
  let currentBlockId: number | null = null;
  let currentNonEmpty = 0;

  for (let i = 0; i < linee.length; i += 1) {
    const testo = linee[i];
    const openMatch = !inFence ? testo.match(/^\s{0,3}(`{3,}|~{3,})(.*)$/) : null;
    if (openMatch) {
      inFence = true;
      fenceChar = openMatch[1][0];
      fenceLen = openMatch[1].length;
      lingua = openMatch[2].trim().split(/\s+/)[0]?.toLowerCase() ?? '';
      currentBlockId = codeBlocks.length;
      currentNonEmpty = 0;
      righe.push({
        indice: i,
        testo,
        codice: true,
        lingua,
        blockId: currentBlockId,
        vuota: false,
      });
      continue;
    }

    if (inFence) {
      const closeRegex = new RegExp(`^\\s{0,3}${fenceChar}{${fenceLen},}\\s*$`);
      if (closeRegex.test(testo)) {
        righe.push({
          indice: i,
          testo,
          codice: true,
          lingua,
          blockId: currentBlockId,
          vuota: false,
        });
        codeBlocks.push({
          id: currentBlockId!,
          lingua,
          nonEmptyLines: currentNonEmpty,
        });
        inFence = false;
        lingua = '';
        currentBlockId = null;
        continue;
      }

      if (testo.trim().length > 0) {
        currentNonEmpty += 1;
      }
      righe.push({
        indice: i,
        testo,
        codice: true,
        lingua,
        blockId: currentBlockId,
        vuota: testo.trim().length === 0,
      });
      continue;
    }

    righe.push({
      indice: i,
      testo,
      codice: false,
      lingua: '',
      blockId: null,
      vuota: testo.trim().length === 0,
    });
  }

  if (inFence && currentBlockId !== null) {
    codeBlocks.push({
      id: currentBlockId,
      lingua,
      nonEmptyLines: currentNonEmpty,
    });
  }

  return { righe, codeBlocks, unclosedFence: inFence };
}

function dividiInSezioni(righe: Riga[]): { intro: Riga[]; sezioni: Sezione[] } {
  const intro: Riga[] = [];
  const sezioni: Sezione[] = [];
  let corrente: Sezione | null = null;

  for (const r of righe) {
    if (!r.codice) {
      const h2Match = r.testo.match(/^##\s+(.+)$/);
      if (h2Match) {
        corrente = { titolo: h2Match[1].trim(), righe: [] };
        sezioni.push(corrente);
        continue;
      }
    }
    if (corrente) {
      corrente.righe.push(r);
    } else {
      intro.push(r);
    }
  }

  return { intro, sezioni };
}

function normalizeH2Title(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/’/g, "'")
    .replace(/^\d+[.)]\s*/, '')
    .replace(/[:.!?]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isTableRow(line: string): boolean {
  const t = line.trim();
  return t.startsWith('|') && t.endsWith('|') && t.length > 2;
}

function isTableSeparator(line: string): boolean {
  return /^\s*\|(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(line);
}

function extractTables(righe: Riga[]): TableInfo[] {
  const tables: TableInfo[] = [];
  let i = 0;

  while (i < righe.length) {
    const r = righe[i];
    if (
      !r.codice &&
      i > 0 &&
      !righe[i - 1].codice &&
      isTableRow(righe[i - 1].testo) &&
      isTableSeparator(r.testo)
    ) {
      let dataRows = 0;
      let numericRows = 0;
      let j = i + 1;
      while (j < righe.length && !righe[j].codice && isTableRow(righe[j].testo)) {
        dataRows += 1;
        if (/\d/.test(righe[j].testo)) {
          numericRows += 1;
        }
        j += 1;
      }
      tables.push({ dataRows, numericRows });
      i = j;
      continue;
    }
    i += 1;
  }

  return tables;
}

function countBlockquotesWithMinLines(righe: Riga[], minLines: number): number {
  let count = 0;
  let currentLines = 0;

  for (const r of righe) {
    if (r.codice) {
      if (currentLines >= minLines) count += 1;
      currentLines = 0;
      continue;
    }
    if (/^\s*>/.test(r.testo)) {
      const inner = r.testo.replace(/^\s*>\s?/, '').trim();
      if (inner.length > 0) {
        currentLines += 1;
      }
    } else {
      if (currentLines >= minLines) count += 1;
      currentLines = 0;
    }
  }
  if (currentLines >= minLines) {
    count += 1;
  }
  return count;
}

function countProseWords(righe: Riga[]): number {
  const cleanedLines = righe
    .filter((r) => !r.codice && !r.vuota && !isTableSeparator(r.testo))
    .map((r) =>
      r.testo
        .replace(/<\/?(?:details|summary)\b[^>]*>/gi, ' ')
        .replace(/[`|]/g, ' '),
    );

  const joined = cleanedLines.join(' ').trim();
  if (!joined) return 0;
  return joined.split(/\s+/).filter(Boolean).length;
}

function hasSubstantialProse(righe: Riga[]): boolean {
  const proseLines = righe.filter((r) => {
    if (r.codice || r.vuota) return false;
    const t = r.testo.trim();
    if (/^#{1,6}\s+/.test(t)) return false;
    if (/^<\/?(?:details|summary)\b[^>]*>$/i.test(t)) return false;
    if (/^\s*(?:---+|===+|\*\*\*+)\s*$/.test(t)) return false;
    return true;
  });

  if (proseLines.length === 0) return false;

  const totalWords = proseLines
    .map((r) => r.testo.trim())
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;

  if (proseLines.length >= 2 && totalWords >= 4) {
    return true;
  }

  if (proseLines.length === 1) {
    const line = proseLines[0].testo.trim();
    const sentences = line.split(/[.!?]+(?:\s+|$)/).filter((s) => s.trim().length > 0).length;
    return totalWords >= 20 && sentences >= 2;
  }

  return false;
}

function maxConsecutiveListItems(righe: Riga[]): number {
  let max = 0;
  let current = 0;
  for (const r of righe) {
    if (r.codice) {
      current = 0;
      continue;
    }
    if (r.vuota) continue;
    if (/^\s*(?:[-*+]|\d+[.)])\s+/.test(r.testo)) {
      current += 1;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  }
  return max;
}

function stripInlineCodeAndImages(line: string): string {
  return line
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/`[^`]*`/g, ' ');
}

export function checkLezioneV2(
  raw: string,
  rel: string,
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const normalizedRaw = raw.replace(/\r\n/g, '\n');
  const normalizedRel = rel.replace(/\\/g, '/');

  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(normalizedRaw);
  } catch (err) {
    errors.push(`V2-R1: frontmatter YAML non valido (${(err as Error).message})`);
    return { errors, warnings };
  }

  const data = (parsed.data ?? {}) as Record<string, unknown>;
  const body = parsed.content ?? '';
  const profile = resolveV2Profile(normalizedRel, data.module);
  const kind = getV2LessonKind(normalizedRel, data.order);
  const { righe, codeBlocks, unclosedFence } = leggiRighe(body);
  const { intro, sezioni } = dividiInSezioni(righe);

  // V2-R1: Frontmatter + no duplicate H1 in body
  if (data.formato !== 'didattica-v2') {
    errors.push(`V2-R1: formato deve essere "didattica-v2" (trovato ${JSON.stringify(data.formato ?? null)})`);
  }
  if (typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('V2-R1: campo title obbligatorio nel frontmatter');
  }
  if (
    typeof data.description !== 'string' ||
    data.description.trim().length === 0 ||
    /^lezione\s+(?:core|narrativa)\s+del\s+modulo\b/i.test(data.description.trim())
  ) {
    errors.push('V2-R1: description specifica obbligatoria (niente boilerplate "Lezione core/narrativa del modulo")');
  }
  const objectives = Array.isArray(data.learningObjectives)
    ? data.learningObjectives.filter((item) => typeof item === 'string' && item.trim().length > 0)
    : [];
  if (objectives.length < 2) {
    errors.push(`V2-R1: learningObjectives deve contenere almeno 2 obiettivi (trovati ${objectives.length})`);
  }
  if (righe.some((r) => !r.codice && /^#\s+/.test(r.testo))) {
    errors.push('V2-R1: nessun # H1 duplicato nel body (il titolo arriva dal frontmatter)');
  }
  if (unclosedFence) {
    errors.push('V2-R1: blocco di codice fenced non chiuso');
  }

  // V2-R2: H2 section count & forbidden H2 titles
  const minH2 = kind === 'index' ? 4 : 6;
  const maxH2 = kind === 'index' ? 8 : 10;
  if (sezioni.length < minH2 || sezioni.length > maxH2) {
    errors.push(
      `V2-R2: ${sezioni.length} sezioni H2 trovate (${kind}); ammesse ${minH2}–${maxH2}`,
    );
  }
  for (const s of sezioni) {
    const normalizedTitle = normalizeH2Title(s.titolo);
    if (V2_FORBIDDEN_H2.includes(normalizedTitle)) {
      errors.push(`V2-R2: titolo H2 vietato ("${s.titolo}")`);
    }
  }

  // V2-R3: Prose word count (code & mermaid excluded, <details> prose included)
  const boundsKey = kind === 'index' ? 'index' : profile;
  const { minWords, maxWords } = V2_WORD_BOUNDS[boundsKey];
  const wordCount = countProseWords(righe);
  if (wordCount < minWords || wordCount > maxWords) {
    errors.push(
      `V2-R3: ${wordCount} parole di prosa (codice e mermaid esclusi, profilo ${boundsKey}); ammesse ${minWords}–${maxWords}`,
    );
  }

  // V2-R4: Opening key thesis (callout > **...** or isolated bold line in intro + first 2 H2 sections)
  const openingWindow = [
    ...intro,
    ...(sezioni[0]?.righe ?? []),
    ...(sezioni[1]?.righe ?? []),
  ];
  const hasOpeningThesis = openingWindow.some(
    (r) =>
      !r.codice &&
      (/^\s*>\s*\*\*[^*\n]+\*\*/.test(r.testo) || RIGA_IN_GRASSETTO.test(r.testo)),
  );
  if (!hasOpeningThesis) {
    errors.push(
      'V2-R4: manca una tesi chiave o callout (> **...** o riga in grassetto isolata) nelle prime due sezioni',
    );
  }

  // V2-R5: At least 1 structured visual element (mermaid or Markdown table >= 3 data rows)
  const mermaidBlocks = codeBlocks.filter((b) => b.lingua === 'mermaid');
  const tables = extractTables(righe);
  const hasVisual = mermaidBlocks.length >= 1 || tables.some((t) => t.dataRows >= 3);
  if (!hasVisual) {
    errors.push(
      'V2-R5: serve almeno un elemento visivo strutturato (diagramma mermaid o tabella Markdown con >= 3 righe dati)',
    );
  }

  // V2-R6: At least 1 numeric worked example in body sections
  const bodySectionsForWorked = sezioni.length > 1 ? sezioni.slice(0, -1) : sezioni;
  const hasWorkedExample = bodySectionsForWorked.some((s) => {
    const sectionText = s.righe
      .filter((r) => !r.codice)
      .map((r) => r.testo)
      .join('\n');
    const unitMatches = sectionText.match(QUANTITA_CON_UNITA) ?? [];
    return unitMatches.length >= 3 && DERIVAZIONE_INDICATOR.test(sectionText);
  });
  if (!hasWorkedExample) {
    errors.push(
      'V2-R6: manca un worked example numerico (>= 3 quantita con unita/percentuali e derivazione esplicita)',
    );
  }

  // V2-R7: Profile-specific requirements
  const nonMermaidBlocks = codeBlocks.filter((b) => b.lingua !== 'mermaid');
  const category = typeof data.category === 'string' ? data.category.trim() : '';

  if (kind === 'core') {
    if (profile === 'technical') {
      if (data.senzaCodice === true) {
        errors.push('V2-R7: profilo technical non ammette senzaCodice: true');
      }
      const runnableBlocks = nonMermaidBlocks.filter(
        (b) => b.lingua.length > 0 && b.nonEmptyLines >= 1,
      );
      if (runnableBlocks.length < 2) {
        errors.push(
          `V2-R7: profilo technical richiede >= 2 blocchi di codice non-mermaid con linguaggio esplicito (trovati ${runnableBlocks.length})`,
        );
      }
    } else if (profile === 'analytical') {
      if (data.senzaCodice === true) {
        if (nonMermaidBlocks.length > 0) {
          errors.push(
            `V2-R7: senzaCodice: true vieta blocchi di codice non-mermaid (trovati ${nonMermaidBlocks.length})`,
          );
        }
        const hasCalcTable = tables.some((t) => t.dataRows >= 4 && t.numericRows >= 3);
        if (!hasCalcTable) {
          errors.push(
            'V2-R7: profilo analytical con senzaCodice: true richiede una tabella numerica di calcolo (>= 4 righe dati)',
          );
        }
      } else {
        const hasAnalyticalCode = nonMermaidBlocks.some((b) =>
          ANALYTICAL_CODE_LANGS.has(b.lingua),
        );
        if (!hasAnalyticalCode) {
          errors.push(
            'V2-R7: profilo analytical richiede >= 1 blocco sql/python/r (oppure senzaCodice: true con tabella >= 4 righe)',
          );
        }
      }
    } else {
      // conceptual
      const enforceNoCode = data.senzaCodice === true || THEORETICAL_CATEGORIES.has(category);
      if (enforceNoCode && nonMermaidBlocks.length > 0) {
        errors.push(
          `V2-R7: profilo conceptual (${data.senzaCodice === true ? 'senzaCodice: true' : category}) vieta blocchi di codice non-mermaid (trovati ${nonMermaidBlocks.length})`,
        );
      }
      const structuralArtefacts =
        mermaidBlocks.length +
        tables.filter((t) => t.dataRows >= 3).length +
        countBlockquotesWithMinLines(righe, 3);
      if (structuralArtefacts < 2) {
        errors.push(
          `V2-R7: profilo conceptual richiede >= 2 artefatti strutturali tra tabelle (>= 3 righe), mermaid o blockquote (>= 3 righe) (trovati ${structuralArtefacts})`,
        );
      }
    }
  } else if (data.senzaCodice === true && nonMermaidBlocks.length > 0) {
    errors.push(
      `V2-R7: senzaCodice: true vieta blocchi di codice non-mermaid (trovati ${nonMermaidBlocks.length})`,
    );
  }

  // V2-R8: Anti-snippet-orphan (every non-mermaid code block has prose before and after in the same section)
  const nonMermaidIds = new Set(nonMermaidBlocks.map((b) => b.id));
  const containers: Riga[][] = [intro, ...sezioni.map((s) => s.righe)];
  for (const container of containers) {
    const blocksInContainer: Array<{ id: number; start: number; end: number }> = [];
    for (let i = 0; i < container.length; i += 1) {
      const r = container[i];
      if (r.codice && r.blockId !== null && nonMermaidIds.has(r.blockId)) {
        const existing = blocksInContainer.find((b) => b.id === r.blockId);
        if (existing) {
          existing.end = i;
        } else {
          blocksInContainer.push({ id: r.blockId, start: i, end: i });
        }
      }
    }

    for (let idx = 0; idx < blocksInContainer.length; idx += 1) {
      const current = blocksInContainer[idx];
      const prevEnd = idx > 0 ? blocksInContainer[idx - 1].end + 1 : 0;
      const nextStart =
        idx + 1 < blocksInContainer.length ? blocksInContainer[idx + 1].start : container.length;

      const beforeSlice = container.slice(prevEnd, current.start);
      const afterSlice = container.slice(current.end + 1, nextStart);

      if (!hasSubstantialProse(beforeSlice)) {
        errors.push(
          `V2-R8: blocco di codice non-mermaid alla riga ${container[current.start].indice + 1} privo di prosa contestuale prima (>= 2 righe nella sezione)`,
        );
      }
      if (!hasSubstantialProse(afterSlice)) {
        errors.push(
          `V2-R8: blocco di codice non-mermaid alla riga ${container[current.end].indice + 1} privo di commento o implicazione dopo (>= 2 righe nella sezione)`,
        );
      }
    }
  }

  // V2-R9: Final H2 section contains >= 2 <details> verification items
  const lastSection = sezioni[sezioni.length - 1];
  const lastSectionNonCode = lastSection
    ? lastSection.righe
        .filter((r) => !r.codice)
        .map((r) => r.testo)
        .join('\n')
    : '';
  const detailsMatches = [...lastSectionNonCode.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/gi)];
  const nonEmptyDetails = detailsMatches.filter(
    (m) => m[1].replace(/<[^>]+>/g, ' ').trim().length > 0,
  );
  if (nonEmptyDetails.length < 2) {
    errors.push(
      `V2-R9: l'ultima sezione H2 deve contenere almeno 2 domande o esercizi con risposta in <details> (trovati ${nonEmptyDetails.length})`,
    );
  }

  // V2-R10: Prose-first ratio >= 0.45, list cap <= 8, editorial voice, no emoji or !
  const textLines = righe.filter((r) => {
    if (r.codice || r.vuota) return false;
    const trimmed = r.testo.trim();
    if (/^<\/?(?:details|summary)\b[^>]*>$/i.test(trimmed)) return false;
    if (/^<summary\b[^>]*>.*<\/summary>$/i.test(trimmed)) return false;
    return true;
  });
  const proseLines = textLines.filter((r) => {
    const t = r.testo;
    return (
      !/^#{1,6}\s+/.test(t) &&
      !/^\s*(?:[-*+]|\d+[.)])\s+/.test(t) &&
      !isTableRow(t) &&
      !RIGA_IN_GRASSETTO.test(t) &&
      !/^\s*(?:---+|===+|\*\*\*+)\s*$/.test(t)
    );
  });
  const proseRatio = textLines.length > 0 ? proseLines.length / textLines.length : 0;
  if (proseRatio < 0.45) {
    errors.push(
      `V2-R10: proseRatio ${(proseRatio * 100).toFixed(0)}% inferiore al minimo 45%`,
    );
  }

  const maxList = maxConsecutiveListItems(righe);
  if (maxList > 8) {
    errors.push(`V2-R10: elenco troppo lungo (${maxList} voci consecutive; massimo 8)`);
  }

  for (const r of righe) {
    if (r.codice || r.vuota) continue;
    const cleanText = stripInlineCodeAndImages(r.testo);
    if (PRONOMI_VIETATI.test(cleanText)) {
      errors.push(`V2-R10: registro noi/vi vietato alla riga ${r.indice + 1}`);
      break;
    }
  }

  for (const r of righe) {
    if (r.codice || r.vuota) continue;
    const cleanText = stripInlineCodeAndImages(r.testo);
    const matchedPhrase = FRASI_VIETATE.find((re) => re.test(cleanText));
    if (matchedPhrase) {
      errors.push(`V2-R10: frase meta/editoriale vietata alla riga ${r.indice + 1}`);
      break;
    }
  }

  for (const r of righe) {
    if (r.codice || r.vuota) continue;
    const cleanText = stripInlineCodeAndImages(r.testo);
    if (EMOJI_REGEX.test(cleanText)) {
      errors.push(`V2-R10: emoji vietata nella prosa alla riga ${r.indice + 1}`);
      break;
    }
  }

  for (const r of righe) {
    if (r.codice || r.vuota) continue;
    const cleanText = stripInlineCodeAndImages(r.testo);
    if (cleanText.includes('!')) {
      errors.push(`V2-R10: punto esclamativo nella prosa alla riga ${r.indice + 1}`);
      break;
    }
  }

  // V2-R11: Zero 3S remnants or placeholders
  for (const r of righe) {
    if (r.codice || r.vuota) continue;
    const found = RESTO_3S.find((item) => item.pattern.test(r.testo));
    if (found) {
      errors.push(`V2-R11: residuo 3S o placeholder "${found.label}" alla riga ${r.indice + 1}`);
      break;
    }
  }

  return { errors, warnings };
}
