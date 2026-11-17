import { describe, expect, test } from 'vitest';
import {
  V2_FORBIDDEN_H2,
  V2_MODULE_PROFILES,
  V2_WORD_BOUNDS,
  checkLezioneV2,
  getV2LessonKind,
  getV2ModuleProfile,
} from '../scripts/lezioni-v2-rules';

interface BuildLessonOverrides {
  rel?: string;
  frontmatter?: Record<string, unknown>;
  body?: string;
  sectionCount?: number;
  proseParagraphsPerSection?: number;
  wordsPerParagraph?: number;
  includeOpeningThesis?: boolean;
  openingThesisInSectionIndex?: number;
  includeOpeningCaseContext?: boolean;
  openingCaseLine?: string;
  includeMermaid?: boolean;
  tableDataRows?: number;
  includeWorkedExample?: boolean;
  codeBlocks?: Array<{ lang: string; body?: string; proseBefore?: string[]; proseAfter?: string[] }>;
  detailsInLastSection?: number;
  detailsWordCount?: number;
  detailsQuestionPrefix?: (index: number) => string;
  detailsQuestionSuffix?: string;
  detailsSummaryText?: string;
  detailsBodyOverride?: string;
  extraListItems?: string[];
  extraProseLines?: string[];
  forbiddenH2?: string;
}

function makeWords(count: number, prefix = 'analisi'): string {
  const tokens: string[] = [];
  for (let i = 0; i < count; i += 1) {
    tokens.push(`${prefix}${i % 7}`);
  }
  return tokens.join(' ');
}

function serializeYamlValue(value: unknown): string {
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return '\n' + value.map((item) => `  - ${JSON.stringify(String(item))}`).join('\n');
  }
  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value);
  }
  return JSON.stringify(String(value));
}

function buildValidV2Lesson(overrides: BuildLessonOverrides = {}): { raw: string; rel: string } {
  const rel = overrides.rel ?? 'src/content/corso/advanced-sql/window-functions.mdx';
  const profile = getV2ModuleProfile(rel);

  const defaultFrontmatter: Record<string, unknown> = {
    title: 'Ottimizzazione delle window function su grandi tabelle',
    description:
      'Come calcolare metriche mobili e classifiche partizionate in SQL senza moltiplicare i costi di scansione su ClickHouse e PostgreSQL.',
    module: 'Modulo 14: SQL avanzato per l analisi',
    order: 2,
    category: profile === 'conceptual' ? 'Strategia' : 'SQL',
    difficulty: 'intermediate',
    duration: '18 min',
    prerequisites: [],
    learningObjectives: [
      'Stimare il costo di partizionamento e ordinamento in una window function su tabelle superiori a 10 milioni di righe',
      'Scegliere tra frame ROWS e RANGE per evitare errori silenziosi in presenza di timestamp duplicati',
    ],
    binario: 'ml-tabellare',
    formato: 'didattica-v2',
    draft: false,
    dateModified: '2026-11-17',
  };

  if (profile === 'conceptual' && !overrides.frontmatter?.category) {
    defaultFrontmatter.senzaCodice = true;
  }

  const fm = { ...defaultFrontmatter, ...(overrides.frontmatter ?? {}) };
  const fmLines = Object.entries(fm)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${serializeYamlValue(value)}`);

  if (overrides.body !== undefined) {
    return {
      rel,
      raw: `---\n${fmLines.join('\n')}\n---\n\n${overrides.body.trim()}\n`,
    };
  }

  const kind = getV2LessonKind(rel, fm.order);
  const sectionCount = overrides.sectionCount ?? (kind === 'index' ? 5 : 6);
  const proseParagraphsPerSection = overrides.proseParagraphsPerSection ?? 4;
  const wordsPerParagraph =
    overrides.wordsPerParagraph ?? (kind === 'index' ? 65 : profile === 'conceptual' ? 75 : 85);

  const includeOpeningThesis = overrides.includeOpeningThesis ?? true;
  const openingThesisInSectionIndex = overrides.openingThesisInSectionIndex ?? 0;
  const includeOpeningCaseContext = overrides.includeOpeningCaseContext ?? true;
  const openingCaseLine =
    overrides.openingCaseLine ??
    'Nel caso ricostruito di una piattaforma e-commerce da 120 mila ordini mensili, il calcolo cumulativo senza partizione corretta ha raddoppiato la latenza.';
  const includeMermaid = overrides.includeMermaid ?? true;
  const tableDataRows = overrides.tableDataRows ?? 3;
  const includeWorkedExample = overrides.includeWorkedExample ?? true;
  const detailsInLastSection = overrides.detailsInLastSection ?? 3;
  const detailsWordCount = overrides.detailsWordCount ?? 25;
  const detailsQuestionPrefix = overrides.detailsQuestionPrefix ?? ((d: number) => `${d}.`);
  const detailsQuestionSuffix = overrides.detailsQuestionSuffix ?? '?';
  const detailsSummaryText = overrides.detailsSummaryText ?? 'Mostra risposta';

  const defaultCodeBlocks: Array<{
    lang: string;
    body?: string;
    proseBefore?: string[];
    proseAfter?: string[];
  }> =
    fm.senzaCodice === true
      ? []
      : profile === 'technical'
        ? [
            {
              lang: 'sql',
              body: 'SELECT user_id, order_date,\n  SUM(amount) OVER (PARTITION BY user_id ORDER BY order_date) AS running_total\nFROM orders;',
            },
            {
              lang: 'python',
              body: 'def check_frame(rows):\n    return sum(r["amount"] for r in rows)\nprint(check_frame([{"amount": 120}, {"amount": 80}]))',
            },
          ]
        : profile === 'analytical'
          ? [
              {
                lang: 'sql',
                body: 'SELECT cohort_month, COUNT(DISTINCT user_id) AS retained_users\nFROM cohort_events\nGROUP BY cohort_month;',
              },
            ]
          : [];

  const codeBlocks = overrides.codeBlocks ?? defaultCodeBlocks;
  const sections: string[] = [];

  for (let idx = 0; idx < sectionCount; idx += 1) {
    const isLast = idx === sectionCount - 1;
    let heading = `Sezione tecnica numero ${idx + 1} sul flusso operativo`;
    if (idx === 0 && overrides.forbiddenH2) {
      heading = overrides.forbiddenH2;
    } else if (isLast) {
      heading = 'Verifica pratica e controllo delle scelte';
    }

    const lines: string[] = [`## ${heading}`, ''];

    if (includeOpeningThesis && idx === openingThesisInSectionIndex) {
      lines.push(
        '> **Idea chiave:** La scelta del frame e della partizione determina sia la correttezza del calcolo sia il costo di memoria della query, quindi devi fissarli prima di ottimizzare gli indici.',
        '',
      );
    }

    if (idx === 0 && includeOpeningCaseContext) {
      lines.push(openingCaseLine, '');
    }

    for (let p = 0; p < proseParagraphsPerSection; p += 1) {
      lines.push(
        `Puoi verificare questo passaggio sul tuo dataset di produzione: ${makeWords(wordsPerParagraph, `dato${idx}_${p}`)}.`,
        '',
      );
    }

    if (idx === 0) {
      const listItems = overrides.extraListItems ?? [
        '- Controlla la granularità della chiave primaria prima della join.',
        '- Misura la latenza p95 su un campione rappresentativo di partizioni.',
        '- Verifica il comportamento dei valori nulli nell ordinamento.',
        '- Documenta la soglia di tolleranza concordata con il team di prodotto.',
      ];
      lines.push(...listItems, '');
    }

    if (idx === 1 && includeMermaid) {
      lines.push(
        '```mermaid',
        'flowchart LR',
        '  A[Eventi grezzi] --> B[Partizione utente]',
        '  B --> C[Calcolo metrica]',
        '```',
        '',
      );
    }

    if (idx === 1 && tableDataRows > 0) {
      lines.push('| Strategia | Latenza ms | Memoria MB | Esito |', '|---|---|---|---|');
      for (let r = 1; r <= tableDataRows; r += 1) {
        lines.push(`| Variante ${r} | ${r * 45} | ${r * 120} | Valida |`);
      }
      lines.push('');
    }

    if (idx === 1 && profile === 'conceptual' && fm.senzaCodice === true) {
      lines.push(
        '> Checklist decisionale prima del rilascio:',
        '> 1. La metrica guida una scelta settimanale chiara.',
        '> 2. Il responsabile del dato conosce la definizione esatta.',
        '> 3. Esiste una soglia numerica per intervenire.',
        '',
      );
    }

    if (idx === 2 && includeWorkedExample) {
      lines.push(
        'Nell esempio numerico su 1.200 ordini giornalieri, il carrello medio passa da 42 euro a 48 euro, con una crescita del 14,3% e un incremento totale di 7.200 euro al giorno. Sottraendo 1.800 euro di costi variabili, il margine netto ottenuto equivale a 5.400 euro = 4,5 euro per ordine.',
        '',
      );
    }

    if (idx === 2 && overrides.extraProseLines) {
      lines.push(...overrides.extraProseLines, '');
    }

    if (idx === 3 && codeBlocks.length > 0) {
      for (const block of codeBlocks) {
        const before = block.proseBefore ?? [
          'Prima di eseguire il codice verifica che le colonne di partizione abbiano indici coerenti con la query.',
          'Puoi eseguire questo blocco sul tuo ambiente locale per osservare il piano di esecuzione reale.',
        ];
        const after = block.proseAfter ?? [
          'Il risultato mostra come il costo cresca in funzione lineare solo quando la partizione evita il sort su disco.',
          'Se il dataset supera la memoria allocata devi intervenire sulla finestra temporale prima di scalare il cluster.',
        ];
        lines.push(...before, '');
        lines.push(`\`\`\`${block.lang}`, block.body ?? 'SELECT 1;', '```', '');
        lines.push(...after, '');
      }
    }

    if (isLast && detailsInLastSection > 0) {
      for (let d = 1; d <= detailsInLastSection; d += 1) {
        const answerBody =
          overrides.detailsBodyOverride ??
          `Confronta i numeri osservati con il baseline storico: ${makeWords(detailsWordCount, `risposta${d}`)}.`;
        lines.push(
          `${detailsQuestionPrefix(d)} Come verifichi l impatto della scelta ${d} sui dati reali del tuo team${detailsQuestionSuffix}`,
          '',
          '<details>',
          `<summary>${detailsSummaryText}</summary>`,
          '',
          answerBody,
          '',
          '</details>',
          '',
        );
      }
    }

    sections.push(lines.join('\n'));
  }

  return {
    rel,
    raw: `---\n${fmLines.join('\n')}\n---\n\n${sections.join('\n')}`,
  };
}

describe('lezioni-v2-rules metadata and helpers', () => {
  test('V2_MODULE_PROFILES maps all 21 canonical modules with correct profiles', () => {
    const keys = Object.keys(V2_MODULE_PROFILES);
    expect(keys).toHaveLength(21);
    expect(V2_MODULE_PROFILES['advanced-sql']).toBe('technical');
    expect(V2_MODULE_PROFILES['data-collection']).toBe('technical');
    expect(V2_MODULE_PROFILES['ai-data-workflows']).toBe('technical');
    expect(V2_MODULE_PROFILES['agentic-ai-data-workflows']).toBe('technical');
    expect(V2_MODULE_PROFILES['marketing-data-science']).toBe('analytical');
    expect(V2_MODULE_PROFILES['metriche-fondamenti']).toBe('analytical');
    expect(V2_MODULE_PROFILES['significativita-statistica']).toBe('analytical');
    expect(V2_MODULE_PROFILES['filosofia-analisi-dati']).toBe('conceptual');
    expect(V2_MODULE_PROFILES['panoramica']).toBe('conceptual');
  });

  test('getV2ModuleProfile normalizes Windows backslash paths', () => {
    expect(
      getV2ModuleProfile('src\\content\\corso\\marketing-data-science\\churn-model.mdx'),
    ).toBe('analytical');
    expect(getV2ModuleProfile('src\\content\\corso\\advanced-sql\\cte.mdx')).toBe('technical');
    expect(getV2ModuleProfile('src\\content\\corso\\gestione-data-driven\\okrs.mdx')).toBe(
      'conceptual',
    );
  });

  test('getV2LessonKind identifies core vs index lessons', () => {
    expect(getV2LessonKind('src/content/corso/advanced-sql/window.mdx', 2)).toBe('core');
    expect(getV2LessonKind('src/content/corso/filosofia-analisi-dati/x.mdx', 0)).toBe('index');
    expect(
      getV2LessonKind('src\\content\\corso\\advanced-sql\\indice-window-functions.mdx', 1),
    ).toBe('index');
    expect(getV2LessonKind('src/content/corso/advanced-sql/cheat-sheet-sql.mdx', 9)).toBe(
      'index',
    );
    expect(getV2LessonKind('src/content/corso/panoramica/glossario-dati.mdx', 5)).toBe('index');
  });

  test('V2_WORD_BOUNDS and V2_FORBIDDEN_H2 match specification', () => {
    expect(V2_WORD_BOUNDS).toEqual({
      technical: { minWords: 1800, maxWords: 3800 },
      analytical: { minWords: 1800, maxWords: 3800 },
      conceptual: { minWords: 1600, maxWords: 3200 },
      index: { minWords: 1200, maxWords: 2600 },
    });
    expect(V2_FORBIDDEN_H2).toEqual([
      'introduzione',
      "l'idea di fondo",
      'riepilogo',
      'conclusioni',
      'sintesi',
    ]);
  });
});

describe('checkLezioneV2 valid baselines', () => {
  test('valid technical, analytical, conceptual, and index lessons pass with zero errors', () => {
    const tech = buildValidV2Lesson({
      rel: 'src/content/corso/advanced-sql/window.mdx',
    });
    expect(checkLezioneV2(tech.raw, tech.rel).errors).toEqual([]);

    const analytical = buildValidV2Lesson({
      rel: 'src/content/corso/marketing-data-science/clv.mdx',
    });
    expect(checkLezioneV2(analytical.raw, analytical.rel).errors).toEqual([]);

    const conceptual = buildValidV2Lesson({
      rel: 'src/content/corso/filosofia-analisi-dati/simpson.mdx',
    });
    expect(checkLezioneV2(conceptual.raw, conceptual.rel).errors).toEqual([]);

    const indexLesson = buildValidV2Lesson({
      rel: 'src/content/corso/advanced-sql/indice-window-functions.mdx',
      frontmatter: { order: 0 },
      sectionCount: 4,
      proseParagraphsPerSection: 5,
      wordsPerParagraph: 65,
    });
    expect(checkLezioneV2(indexLesson.raw, indexLesson.rel).errors).toEqual([]);
  });

  test('normalizes CRLF line endings before validation', () => {
    const tech = buildValidV2Lesson();
    const crlfRaw = tech.raw.replace(/\n/g, '\r\n');
    expect(checkLezioneV2(crlfRaw, tech.rel).errors).toEqual([]);
  });

  test('allows natural tu, noi, impersonal vi è/sono, URL ! fragments, and bullet lists when proseRatio >= 0.45', () => {
    const lesson = buildValidV2Lesson({
      extraListItems: Array.from({ length: 10 }, (_, i) => `- Verifica numero ${i + 1} sul tuo ambiente`),
      extraProseLines: [
        'Puoi adattare questa regola al tuo team senza cambiare il modello dati esistente.',
        'Noi confrontiamo la latenza p95 prima e dopo il partizionamento, perché vi è un limite netto di memoria.',
        'Consulta [la documentazione ufficiale](https://example.com/docs?flag=1!2#anchor) per i parametri.',
      ],
    });
    expect(checkLezioneV2(lesson.raw, lesson.rel).errors).toEqual([]);
  });
});

describe('checkLezioneV2 rule enforcement V2-R1..V2-R11', () => {
  test('V2-R1 rejects missing/wrong formato, duplicate H1 in body, boilerplate description, and <2 learningObjectives', () => {
    const wrongFormat = buildValidV2Lesson({ frontmatter: { formato: 'articolo' } });
    expect(checkLezioneV2(wrongFormat.raw, wrongFormat.rel).errors.join('\n')).toMatch(/V2-R1/);

    const withH1 = buildValidV2Lesson({
      extraProseLines: ['# Titolo duplicato nel body'],
    });
    expect(checkLezioneV2(withH1.raw, withH1.rel).errors.join('\n')).toMatch(/V2-R1/);

    const boilerplate = buildValidV2Lesson({
      frontmatter: { description: 'Lezione core del modulo SQL avanzato' },
    });
    expect(checkLezioneV2(boilerplate.raw, boilerplate.rel).errors.join('\n')).toMatch(/V2-R1/);

    const fewObjectives = buildValidV2Lesson({
      frontmatter: { learningObjectives: ['Solo un obiettivo'] },
    });
    expect(checkLezioneV2(fewObjectives.raw, fewObjectives.rel).errors.join('\n')).toMatch(/V2-R1/);
  });

  test('V2-R2 enforces H2 count bounds for core (6-10) and index (4-8) and rejects forbidden H2 titles', () => {
    const tooFewCore = buildValidV2Lesson({ sectionCount: 5, wordsPerParagraph: 105 });
    expect(checkLezioneV2(tooFewCore.raw, tooFewCore.rel).errors.join('\n')).toMatch(/V2-R2/);

    const tooManyCore = buildValidV2Lesson({ sectionCount: 11, wordsPerParagraph: 55 });
    expect(checkLezioneV2(tooManyCore.raw, tooManyCore.rel).errors.join('\n')).toMatch(/V2-R2/);

    const tooFewIndex = buildValidV2Lesson({
      rel: 'src/content/corso/advanced-sql/indice-test.mdx',
      frontmatter: { order: 0 },
      sectionCount: 3,
      wordsPerParagraph: 110,
    });
    expect(checkLezioneV2(tooFewIndex.raw, tooFewIndex.rel).errors.join('\n')).toMatch(/V2-R2/);

    const tooManyIndex = buildValidV2Lesson({
      rel: 'src/content/corso/advanced-sql/indice-test.mdx',
      frontmatter: { order: 0 },
      sectionCount: 9,
      wordsPerParagraph: 45,
    });
    expect(checkLezioneV2(tooManyIndex.raw, tooManyIndex.rel).errors.join('\n')).toMatch(/V2-R2/);

    for (const forbidden of ['Introduzione', "L'idea di fondo", 'Riepilogo', 'Conclusioni', 'Sintesi']) {
      const badHeading = buildValidV2Lesson({ forbiddenH2: forbidden });
      expect(checkLezioneV2(badHeading.raw, badHeading.rel).errors.join('\n')).toMatch(/V2-R2/);
    }
  });

  test('V2-R3 checks word bounds, includes <details> prose, and excludes fenced code and mermaid blocks', () => {
    const tooShortTech = buildValidV2Lesson({ wordsPerParagraph: 20, detailsWordCount: 10 });
    expect(checkLezioneV2(tooShortTech.raw, tooShortTech.rel).errors.join('\n')).toMatch(/V2-R3/);

    const bigCodePadding = Array.from({ length: 1200 }, (_, i) => `SELECT col_${i} FROM tbl;`).join(
      '\n',
    );
    const shortProseLargeCode = buildValidV2Lesson({
      wordsPerParagraph: 20,
      detailsWordCount: 10,
      codeBlocks: [
        { lang: 'sql', body: bigCodePadding },
        { lang: 'python', body: 'x = ' + Array.from({ length: 800 }, () => '1').join(' + ') },
      ],
    });
    // Code blocks must NOT inflate prose word count
    expect(checkLezioneV2(shortProseLargeCode.raw, shortProseLargeCode.rel).errors.join('\n')).toMatch(
      /V2-R3/,
    );

    // <details> prose MUST count toward total prose words to clear the 1800-word threshold
    const rescuedByDetails = buildValidV2Lesson({
      wordsPerParagraph: 55,
      detailsInLastSection: 3,
      detailsWordCount: 200,
    });
    expect(checkLezioneV2(rescuedByDetails.raw, rescuedByDetails.rel).errors).toEqual([]);
  });

  test('V2-R4 requires opening key thesis callout or isolated bold line in first 2 H2 sections', () => {
    const missingThesis = buildValidV2Lesson({ includeOpeningThesis: false });
    expect(checkLezioneV2(missingThesis.raw, missingThesis.rel).errors.join('\n')).toMatch(/V2-R4/);

    const lateThesis = buildValidV2Lesson({ openingThesisInSectionIndex: 3 });
    expect(checkLezioneV2(lateThesis.raw, lateThesis.rel).errors.join('\n')).toMatch(/V2-R4/);
  });

  test('V2-R5 requires at least one mermaid diagram or markdown table with >= 3 data rows', () => {
    const noVisuals = buildValidV2Lesson({ includeMermaid: false, tableDataRows: 2 });
    expect(checkLezioneV2(noVisuals.raw, noVisuals.rel).errors.join('\n')).toMatch(/V2-R5/);

    const onlyTable = buildValidV2Lesson({ includeMermaid: false, tableDataRows: 3 });
    expect(checkLezioneV2(onlyTable.raw, onlyTable.rel).errors).toEqual([]);
  });

  test('V2-R6 requires at least one numeric worked example in body sections', () => {
    const noWorkedExample = buildValidV2Lesson({ includeWorkedExample: false });
    expect(checkLezioneV2(noWorkedExample.raw, noWorkedExample.rel).errors.join('\n')).toMatch(
      /V2-R6/,
    );
  });

  test('V2-R7 enforces profile code and artefact requirements including senzaCodice and marketing-data-science', () => {
    const techTooFewCode = buildValidV2Lesson({
      rel: 'src/content/corso/advanced-sql/only-one.mdx',
      codeBlocks: [{ lang: 'sql', body: 'SELECT 1;' }],
    });
    expect(checkLezioneV2(techTooFewCode.raw, techTooFewCode.rel).errors.join('\n')).toMatch(
      /V2-R7/,
    );

    const analyticalNoCode = buildValidV2Lesson({
      rel: 'src/content/corso/marketing-data-science/no-code.mdx',
      codeBlocks: [],
    });
    expect(checkLezioneV2(analyticalNoCode.raw, analyticalNoCode.rel).errors.join('\n')).toMatch(
      /V2-R7/,
    );

    const analyticalSenzaCodiceValid = buildValidV2Lesson({
      rel: 'src/content/corso/marketing-data-science/tabella.mdx',
      frontmatter: { senzaCodice: true },
      tableDataRows: 4,
      codeBlocks: [],
    });
    expect(checkLezioneV2(analyticalSenzaCodiceValid.raw, analyticalSenzaCodiceValid.rel).errors).toEqual(
      [],
    );

    const analyticalSenzaCodiceSmallTable = buildValidV2Lesson({
      rel: 'src/content/corso/marketing-data-science/tabella-corta.mdx',
      frontmatter: { senzaCodice: true },
      tableDataRows: 3,
      codeBlocks: [],
    });
    expect(
      checkLezioneV2(
        analyticalSenzaCodiceSmallTable.raw,
        analyticalSenzaCodiceSmallTable.rel,
      ).errors.join('\n'),
    ).toMatch(/V2-R7/);

    const conceptualWithCode = buildValidV2Lesson({
      rel: 'src/content/corso/filosofia-analisi-dati/bad-code.mdx',
      frontmatter: { senzaCodice: true },
      codeBlocks: [{ lang: 'python', body: 'print(1)' }],
    });
    expect(checkLezioneV2(conceptualWithCode.raw, conceptualWithCode.rel).errors.join('\n')).toMatch(
      /V2-R7/,
    );

    const conceptualOperationalNoCode = buildValidV2Lesson({
      rel: 'src/content/corso/dashboard-visualizzazione/grafici-kpi.mdx',
      frontmatter: { category: 'Visualizzazione' },
      codeBlocks: [],
    });
    expect(
      checkLezioneV2(conceptualOperationalNoCode.raw, conceptualOperationalNoCode.rel).errors.join(
        '\n',
      ),
    ).toMatch(/V2-R7/);

    const conceptualOperationalWithCode = buildValidV2Lesson({
      rel: 'src/content/corso/dashboard-visualizzazione/grafici-kpi.mdx',
      frontmatter: { category: 'Visualizzazione' },
      codeBlocks: [{ lang: 'sql', body: 'SELECT metric_date, SUM(revenue) FROM kpi GROUP BY 1;' }],
    });
    expect(
      checkLezioneV2(conceptualOperationalWithCode.raw, conceptualOperationalWithCode.rel).errors,
    ).toEqual([]);

    const conceptualTooFewArtefacts = buildValidV2Lesson({
      rel: 'src/content/corso/filosofia-analisi-dati/few-artefacts.mdx',
      frontmatter: { senzaCodice: true },
      includeMermaid: false,
      tableDataRows: 0,
      body: undefined,
    });
    // Even with the default 3-line blockquote in idx=1, without mermaid and without table it only has 1 artefact
    expect(
      checkLezioneV2(conceptualTooFewArtefacts.raw, conceptualTooFewArtefacts.rel).errors.join('\n'),
    ).toMatch(/V2-R7/);
  });

  test('V2-R8 enforces proseRatio >= 0.45 without failing on non-orphan code layout', () => {
    const lowProseRatio = buildValidV2Lesson({
      proseParagraphsPerSection: 1,
      wordsPerParagraph: 250,
      extraListItems: Array.from({ length: 45 }, (_, i) => `- Voce elenco ${i + 1}`),
    });
    expect(checkLezioneV2(lowProseRatio.raw, lowProseRatio.rel).errors.join('\n')).toMatch(
      /V2-R8/,
    );

    const consecutiveCodeBlocks = buildValidV2Lesson({
      codeBlocks: [
        { lang: 'sql', body: 'SELECT 1;', proseAfter: [] },
        { lang: 'python', body: 'print(1)', proseBefore: [] },
      ],
    });
    expect(checkLezioneV2(consecutiveCodeBlocks.raw, consecutiveCodeBlocks.rel).errors).toEqual([]);
  });

  test('V2-R9 requires 3-5 numbered ? questions paired with non-empty <details><summary> blocks', () => {
    const tooFewQuestions = buildValidV2Lesson({ detailsInLastSection: 2 });
    expect(checkLezioneV2(tooFewQuestions.raw, tooFewQuestions.rel).errors.join('\n')).toMatch(
      /V2-R9/,
    );

    const tooManyQuestions = buildValidV2Lesson({ detailsInLastSection: 6 });
    expect(checkLezioneV2(tooManyQuestions.raw, tooManyQuestions.rel).errors.join('\n')).toMatch(
      /V2-R9/,
    );

    const fiveQuestionsValid = buildValidV2Lesson({ detailsInLastSection: 5 });
    expect(checkLezioneV2(fiveQuestionsValid.raw, fiveQuestionsValid.rel).errors).toEqual([]);

    const missingQuestionMark = buildValidV2Lesson({ detailsQuestionSuffix: '.' });
    expect(
      checkLezioneV2(missingQuestionMark.raw, missingQuestionMark.rel).errors.join('\n'),
    ).toMatch(/V2-R9/);

    const nonNumberedQuestion = buildValidV2Lesson({
      detailsQuestionPrefix: (d) => `Domanda ${d}:`,
    });
    expect(
      checkLezioneV2(nonNumberedQuestion.raw, nonNumberedQuestion.rel).errors.join('\n'),
    ).toMatch(/V2-R9/);

    const emptySummary = buildValidV2Lesson({ detailsSummaryText: '   ' });
    expect(checkLezioneV2(emptySummary.raw, emptySummary.rel).errors.join('\n')).toMatch(/V2-R9/);

    const emptyDetailsBody = buildValidV2Lesson({ detailsBodyOverride: '   ' });
    expect(checkLezioneV2(emptyDetailsBody.raw, emptyDetailsBody.rel).errors.join('\n')).toMatch(
      /V2-R9/,
    );
  });

  test('V2-R10 enforces opening link/disclaimer, editorial voice, forbidden phrases, and no emoji or !', () => {
    const missingOpeningSource = buildValidV2Lesson({ includeOpeningCaseContext: false });
    expect(
      checkLezioneV2(missingOpeningSource.raw, missingOpeningSource.rel).errors.join('\n'),
    ).toMatch(/V2-R10/);

    const openingExternalLinkValid = buildValidV2Lesson({
      openingCaseLine:
        'Il benchmark pubblico su [ClickBench](https://benchmark.clickhouse.com/) mostra costi triplicati senza partizione.',
    });
    expect(
      checkLezioneV2(openingExternalLinkValid.raw, openingExternalLinkValid.rel).errors,
    ).toEqual([]);

    const voiVoice = buildValidV2Lesson({
      extraProseLines: ['Adesso voi confrontate i due piani di esecuzione.'],
    });
    expect(checkLezioneV2(voiVoice.raw, voiVoice.rel).errors.join('\n')).toMatch(/V2-R10/);

    const viMostroVoice = buildValidV2Lesson({
      extraProseLines: ['Questo schema vi mostra il flusso completo.'],
    });
    expect(checkLezioneV2(viMostroVoice.raw, viMostroVoice.rel).errors.join('\n')).toMatch(
      /V2-R10/,
    );

    const forbiddenPhrases = [
      'In questa lezione esaminiamo i costi del cluster.',
      'Nel mondo di oggi i dati crescono velocemente.',
      'Le query diventano sempre più pesanti.',
      'Ora approfondiamo il partizionamento.',
      'Adesso scopriamo insieme questa metrica.',
      'La window function non è altro che un calcolo su finestra.',
      'Negli ultimi anni molti team hanno migrato.',
      'Vale la pena ricordare questo vincolo.',
      'In sintesi finale conviene misurare prima.',
    ];
    for (const phrase of forbiddenPhrases) {
      const bad = buildValidV2Lesson({ extraProseLines: [phrase] });
      expect(checkLezioneV2(bad.raw, bad.rel).errors.join('\n')).toMatch(/V2-R10/);
    }

    const withRocketEmoji = buildValidV2Lesson({
      extraProseLines: ['Controlla sempre il piano di esecuzione 🚀 prima del rilascio.'],
    });
    expect(checkLezioneV2(withRocketEmoji.raw, withRocketEmoji.rel).errors.join('\n')).toMatch(
      /V2-R10/,
    );

    const withCheckmarkEmoji = buildValidV2Lesson({
      extraProseLines: ['Controllo completato ✅ prima del rilascio.'],
    });
    expect(checkLezioneV2(withCheckmarkEmoji.raw, withCheckmarkEmoji.rel).errors.join('\n')).toMatch(
      /V2-R10/,
    );

    const withExclamation = buildValidV2Lesson({
      extraProseLines: ['Attenzione a questo errore critico!'],
    });
    expect(checkLezioneV2(withExclamation.raw, withExclamation.rel).errors.join('\n')).toMatch(
      /V2-R10/,
    );
  });

  test('V2-R11 rejects legacy pipeline metadata, 3S component remnants, and placeholders', () => {
    for (const legacyField of ['autore', 'controllatoDa', 'autorizzatoDa']) {
      const withLegacyMeta = buildValidV2Lesson({
        frontmatter: { [legacyField]: 'Hermes' },
      });
      expect(checkLezioneV2(withLegacyMeta.raw, withLegacyMeta.rel).errors.join('\n')).toMatch(
        /V2-R11/,
      );
    }

    const legacyMarkers = [
      "import LezioneCard from '../../components/LezioneCard.astro';",
      '<LezioneCard titolo="Esempio" />',
      '<Percorso step="1" />',
      '<Slide title="Intro" />',
      '<TabellaDati rows={[]} />',
      '<QuizExercise question="Test" />',
      'Struttura basata su una sessione, tre blocchi per ogni modulo.',
      'Questa parte va rivista: TODO aggiungere query finale.',
      'Inserisci qui [da completare] il caso reale.',
    ];
    for (const marker of legacyMarkers) {
      const bad = buildValidV2Lesson({ extraProseLines: [marker] });
      expect(checkLezioneV2(bad.raw, bad.rel).errors.join('\n')).toMatch(/V2-R11/);
    }
  });
});
