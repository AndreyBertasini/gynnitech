import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { COURSE_CAPSTONE, COURSE_MODULES, COURSE_PHASES, COURSE_TRACKS, type CourseModule } from '../src/data/course-program';
import { getLessonPracticeKit } from '../src/lib/course-v2';

const CONTENT_ROOT = path.join(process.cwd(), 'src', 'content', 'corso');

const MODULE_FILE_PRIORITY: Record<string, string[]> = {
  panoramica: [
    'mappe-concettuali.mdx',
    'come-studiare-bene-questo-corso.mdx',
    'come-funziona-questo-corso.mdx',
    'come-praticare-sui-dati-mentre-studi.mdx',
    'come-prendere-appunti-senza-perdersi.mdx',
    'come-ricordare-davvero-quello-che-impari.mdx',
    'dal-corso-alle-competenze-di-lavoro.mdx',
    'come-non-perdere-motivazione-nel-lungo-periodo.mdx',
  ],
  'filosofia-analisi-dati': [
    'perche-l-analisi-dati-ha-una-storia-filosofica.mdx',
    'epistemologia-dei-dati.mdx',
    'causalita-causa-ed-effetto-nell-analisi-dei-dati.mdx',
    'causalita-regressioni-e-inferenza-statistica.mdx',
    'determinismo-contingenza-probabilita-e-previsione.mdx',
    'cause-multiple-condizioni-necessarie-e-sufficienti.mdx',
    'filosofia-della-scienza-spiegazione-scientifica-e-responsabilita.mdx',
    'frequentismo-vs-bayesianismo.mdx',
    'etica-algoritmi-e-responsabilita-analitica.mdx',
    'simpson-paradox-e-confounding.mdx',
    'caso-studio-pensiero-filosofico-e-business-decision.mdx',
  ],
};

const phaseDifficulty: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
  foundation: 'beginner',
  application: 'intermediate',
  stack: 'advanced',
  rigor: 'advanced',
  direction: 'advanced',
};

const phaseContext: Record<string, string> = {
  foundation: 'un team che sta costruendo basi affidabili di measurement e decision making',
  application: 'un team che deve trasformare dati e metriche in crescita, prodotto e azioni di business',
  stack: 'una piattaforma dati che deve reggere volumi, latenza e responsabilita operative',
  rigor: 'un contesto analitico in cui precisione tecnica e rigore quantitativo cambiano davvero la decisione',
  direction: 'una leadership analytics che deve leggere i dati con profondita, responsabilita e visione organizzativa',
};

const moduleIndexById = new Map(COURSE_MODULES.map((module, index) => [module.id, index]));

function moduleLabel(module: CourseModule): string {
  const index = moduleIndexById.get(module.id) ?? 0;
  return `Modulo ${index + 1}: ${module.title}`;
}

function inferCategory(module: CourseModule, title: string, isSupplemental: boolean): string {
  if (isSupplemental) return 'Approfondimento';
  if (/lab|workshop/i.test(title)) return 'Lab';
  if (/caso studio|saggio finale|oral exam/i.test(title)) return 'Caso Studio';
  if (/cheat sheet/i.test(title)) return 'Cheat Sheet';
  if (/tracking|contracts|schema|sql|dbt|stream|pipeline|clickhouse|docker|terraform|lake|warehouse/i.test(title)) return 'Tecnico';
  if (/metric|forecast|bayes|power|regress|probabil|causal|unit economics/i.test(title)) return 'Analisi';
  if (/dashboard|storytelling|visual/i.test(title)) return 'Decision Interface';
  if (/portfolio|ruoli|hiring|interview|specializzazione/i.test(title)) return 'Carriera';
  if (/etica|filosof|goodhart|evidenza|spiegare/i.test(title)) return 'Fondamenti Critici';
  return module.phase === 'foundation' ? 'Fondamenti' : 'Decisione';
}

function inferDuration(title: string, isSupplemental: boolean): string {
  if (isSupplemental) return '18 min';
  if (/lab|workshop|caso studio|progetto finale|problem set|oral exam/i.test(title)) return '28 min';
  if (/sql|clickhouse|dbt|stream|tracking|forecast|bayes|regress|power|design/i.test(title)) return '22 min';
  return '18 min';
}

function lessonDescription(module: CourseModule, title: string, isSupplemental: boolean): string {
  if (isSupplemental) {
    return `${title}. Approfondimento supplementare del modulo ${module.title}, utile per estendere il core V2 senza alterare il percorso ufficiale.`;
  }
  return `${title}. Lezione core del modulo ${module.title} con problema reale, modello concettuale, formalizzazione rigorosa, caso applicato, lab a 3 livelli e checkpoint finale.`;
}

function learningObjectives(module: CourseModule, title: string, isSupplemental: boolean): string[] {
  const baseObjectives = [
    `Identificare quale decisione "${title}" aiuta a migliorare dentro ${module.title}.`,
    `Esplicitare definizioni, assunzioni, guardrail e output operativi legati a "${title}".`,
    'Tradurre la lezione in un output pratico usando esercizi, dataset, notebook o query del modulo.',
  ];
  if (isSupplemental) {
    baseObjectives[2] = 'Usare questo approfondimento per rafforzare il ragionamento oltre il core ufficiale del modulo.';
  }
  return baseObjectives;
}

function formalizationTable(module: CourseModule, title: string): string {
  return [
    '| Elemento | Definizione operativa |',
    '|---|---|',
    `| Decisione supportata | Quale scelta migliora quando "${title}" viene definito bene |`,
    `| Input | Dati, vincoli, segmentazioni e segnali tipici di ${module.title} |`,
    '| Meccanismo | Regole con cui il team passa da osservazioni a interpretazione |',
    '| Guardrail | Controlli che evitano letture opportunistiche, confondenti o fuori contesto |',
    '| Output | Query, memo, dashboard, design o raccomandazione difendibile |',
  ].join('\n');
}

function bodyForLesson(module: CourseModule, title: string, isSupplemental: boolean, fileName: string): string {
  const context = phaseContext[module.phase];
  const practiceKit = getLessonPracticeKit(module, title, isSupplemental);
  const supplementalIntro = isSupplemental
    ? `> Questa pagina resta come approfondimento supplementare del modulo. Non appartiene al conteggio delle 216 lezioni core, ma rafforza i passaggi piu delicati del percorso.\n\n`
    : '';
  const conceptMapNote =
    module.id === 'panoramica' && fileName === 'mappe-concettuali.mdx'
      ? `Questa pagina conserva anche la funzione di mappa di orientamento: il percorso ufficiale conta **19 moduli** e **216 lezioni** core distribuite in 5 fasi, dalla fondazione fino a **Direzioni in Analitica: Marketing, Prodotto, Finanza** e **Fondamenti Filosofici dell Analisi dei Dati**.\n\n`
      : '';
  const datasetAssets = practiceKit.datasetPack.assets.map((item) => `- ${item}`).join('\n');

  return `${supplementalIntro}# ${title}

"${title}" si colloca dentro ${module.title}. In ${context}, il punto non e accumulare definizioni, ma capire quale decisione migliora questo tema, quali assunzioni lo rendono leggibile e quale output produce quando il lavoro viene impostato con rigore.

${conceptMapNote}Questa lezione segue lo standard V2 completo: problema reale, modello concettuale, formalizzazione rigorosa, caso, lab graduato, errore tipico e checkpoint finale.

## Problema reale

Il fallimento piu comune in ${module.title} nasce quando il team riconosce che "${title}" conta, ma non sa dire quale decisione dipenda davvero da questo tema. Si aprono dashboard, si leggono report, si discutono strumenti, ma la domanda operativa resta implicita e ogni stakeholder finisce per usare parole simili con significati diversi.

Nel lavoro reale questo produce tre costi immediati: priorita che cambiano al rumore del momento, letture non confrontabili nel tempo e responsabilita che si spostano quando il risultato e deludente. La lezione parte quindi da una domanda concreta: come formulare "${title}" in modo che un team possa prendere una decisione migliore, non solo una discussione piu elegante.

## Modello concettuale

Un modello robusto separa quattro blocchi: decisione da supportare, segnali osservabili, meccanismo che collega segnali e decisione, guardrail che limitano gli errori di interpretazione. "${title}" non e quindi un'etichetta da citare, ma un ponte tra contesto, misura e azione.

Dentro ${module.title}, questo modello va letto insieme all'obiettivo del modulo: ${module.objective} La domanda corretta non e solo "cosa misuro o costruisco?", ma anche "quale ipotesi sto assumendo, quale rischio sto introducendo e quale output mi aspetto di produrre alla fine?".

## Formalizzazione rigorosa

${formalizationTable(module, title)}

La formalizzazione serve a evitare due errori opposti: trattare tutto come opinione oppure ridurre il tema a una checklist cieca. Una formalizzazione buona esplicita definizioni, unita di analisi, denominatori, segmentazioni rilevanti, condizioni di validita e failure mode.

Il criterio operativo resta semplice: se due persone esperte leggono la stessa definizione e guardano lo stesso materiale, devono arrivare a conclusioni comparabili sugli stessi trade-off. Se non succede, il problema non e il tool: e la formalizzazione.

## Esempio o caso studio

Immagina un team che deve prendere una decisione critica collegata a "${title}". All'inizio il problema e formulato male: le metriche sono lette senza baseline, i vincoli non sono esplicitati e gli stakeholder discutono su sintomi diversi. La svolta arriva quando il team riscrive la domanda, chiarisce il meccanismo da osservare e introduce guardrail prima della raccomandazione finale.

Il valore del caso non sta nel singolo numero, ma nella catena logica che collega contesto, misura e decisione. La lezione allena proprio questo passaggio: trasformare una situazione opaca in un output che puo essere discusso, corretto e difeso.

| Passaggio | Domanda guida | Output atteso |
|---|---|---|
| Contesto | Quale decisione stiamo cercando di migliorare? | Problema formulato bene |
| Struttura | Quali definizioni, variabili e segmentazioni contano davvero? | Framework coerente |
| Verifica | Dove il modello puo ingannare? | Guardrail e limiti |
| Decisione | Cosa facciamo adesso e perche? | Azione difendibile |

## Lab / esercizio

**Livello base**: ${practiceKit.exerciseLadder.base}

**Livello intermedio**: ${practiceKit.exerciseLadder.intermediate}

**Livello research-grade**: ${practiceKit.exerciseLadder.researchGrade}

**Dataset e materiali consigliati**: ${practiceKit.datasetPack.summary}
${datasetAssets}

## Errore tipico da evitare

L errore piu tipico e scambiare familiarita con comprensione. Quando un tema viene citato spesso, il team tende a credere che sia gia stato definito abbastanza bene. In realta proprio i concetti piu usati sono quelli che richiedono piu rigore, perche muovono piu decisioni e piu risorse.

Il secondo errore e trattare il framework come una risposta invece che come uno strumento. Se la formalizzazione non lascia spazio a ipotesi, eccezioni, limiti e possibili rotture del modello, stai costruendo un rituale invece di una pratica analitica.

## Quiz o checkpoint

1. Quale decisione cambia davvero quando "${title}" viene formalizzato meglio?
2. Quali guardrail impediscono di leggere segnali rumorosi come se fossero prova?
3. In quale punto del caso il team passa da descrizione del fenomeno a raccomandazione difendibile?

## Riepilogo operativo

In questa lezione hai visto come trasformare "${title}" da etichetta vaga a strumento operativo. Il punto non e memorizzare una definizione, ma sapere quale decisione sostiene, come si formalizza, quali materiali usare per esercitarsi e dove il modello rischia di ingannarti.
`;
}

function canonicalSlug(fileName: string, moduleId: string): string {
  return `${moduleId}/${fileName.replace(/\.mdx$/i, '')}`;
}

async function sortedModuleFiles(moduleId: string): Promise<string[]> {
  const dir = path.join(CONTENT_ROOT, moduleId);
  const fileNames = (await fs.readdir(dir)).filter((name) => name.endsWith('.mdx'));
  const priorities = MODULE_FILE_PRIORITY[moduleId];

  if (priorities) {
    const known = priorities.filter((name) => fileNames.includes(name));
    const remaining = fileNames.filter((name) => !known.includes(name)).sort();
    return [...known, ...remaining];
  }

  const withOrder = await Promise.all(
    fileNames.map(async (fileName) => {
      const raw = await fs.readFile(path.join(dir, fileName), 'utf8');
      const parsed = matter(raw);
      const order = typeof parsed.data.order === 'number' ? parsed.data.order : Number.MAX_SAFE_INTEGER;
      return { fileName, order };
    }),
  );

  return withOrder
    .sort((a, b) => a.order - b.order || a.fileName.localeCompare(b.fileName, 'it'))
    .map((entry) => entry.fileName);
}

function pruneUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, current]) => current !== undefined)) as T;
}

async function rewriteLessons(): Promise<void> {
  let previousModuleLastCoreSlug: string | null = null;

  for (const module of COURSE_MODULES) {
    const fileNames = await sortedModuleFiles(module.id);
    if (fileNames.length < module.coreLessons.length) {
      throw new Error(`Module ${module.id} has ${fileNames.length} files but requires ${module.coreLessons.length} core lessons.`);
    }

    const coreFiles = fileNames.slice(0, module.coreLessons.length);
    const supplementalFiles = fileNames.slice(module.coreLessons.length);
    const difficulty = phaseDifficulty[module.phase];

    for (const [index, fileName] of coreFiles.entries()) {
      const filePath = path.join(CONTENT_ROOT, module.id, fileName);
      const existing = matter(await fs.readFile(filePath, 'utf8'));
      const previousSlug = index === 0 ? previousModuleLastCoreSlug : canonicalSlug(coreFiles[index - 1], module.id);
      const data = pruneUndefined({
        title: module.coreLessons[index].title,
        description: lessonDescription(module, module.coreLessons[index].title, false),
        module: moduleLabel(module),
        order: index + 1,
        category: inferCategory(module, module.coreLessons[index].title, false),
        headerImage: typeof existing.data.headerImage === 'string' ? existing.data.headerImage : undefined,
        headerImageAlt: typeof existing.data.headerImageAlt === 'string' ? existing.data.headerImageAlt : undefined,
        difficulty,
        duration: inferDuration(module.coreLessons[index].title, false),
        prerequisites: previousSlug ? [previousSlug] : [],
        learningObjectives: learningObjectives(module, module.coreLessons[index].title, false),
      });

      const body = bodyForLesson(module, module.coreLessons[index].title, false, fileName);
      await fs.writeFile(filePath, matter.stringify(body, data), 'utf8');
    }

    const lastCoreFile = coreFiles.at(-1);
    previousModuleLastCoreSlug = lastCoreFile ? canonicalSlug(lastCoreFile, module.id) : previousModuleLastCoreSlug;

    for (const fileName of supplementalFiles) {
      const filePath = path.join(CONTENT_ROOT, module.id, fileName);
      const existing = matter(await fs.readFile(filePath, 'utf8'));
      const currentTitle =
        typeof existing.data.title === 'string' && existing.data.title.trim() !== ''
          ? existing.data.title.trim()
          : `Approfondimento ${fileName.replace(/\.mdx$/i, '').replace(/-/g, ' ')}`;
      const data = pruneUndefined({
        title: currentTitle,
        description: lessonDescription(module, currentTitle, true),
        module: moduleLabel(module),
        category: inferCategory(module, currentTitle, true),
        headerImage: typeof existing.data.headerImage === 'string' ? existing.data.headerImage : undefined,
        headerImageAlt: typeof existing.data.headerImageAlt === 'string' ? existing.data.headerImageAlt : undefined,
        difficulty,
        duration: inferDuration(currentTitle, true),
        prerequisites: previousModuleLastCoreSlug ? [previousModuleLastCoreSlug] : [],
        learningObjectives: learningObjectives(module, currentTitle, true),
      });

      const body = bodyForLesson(module, currentTitle, true, fileName);
      await fs.writeFile(filePath, matter.stringify(body, data), 'utf8');
    }
  }
}

async function rewriteLearningPath(): Promise<void> {
  const learningPathPath = path.join(CONTENT_ROOT, 'learning-path.mdx');
  const title = 'Learning Path - Percorso Formativo Completo V2';
  const description =
    'Pagina guida per leggere il percorso GinnyTech V2: 19 moduli, 216 lezioni core, 5 fasi, capstone finale e 3 track conclusivi.';

  const body = `## La logica del percorso

La V2 del corso mantiene la struttura a **19 moduli** ma rende esplicita una differenza che prima si intuiva soltanto: il catalogo non e un archivio di argomenti, e un percorso a **5 fasi** con **216 lezioni core** e un capstone finale che obbliga a ricomporre tutto.

${COURSE_PHASES.map((phase, index) => `${index + 1}. **${phase.title}**: ${phase.description}`).join('\n')}

## Cosa cambia nella V2

- Ogni lezione segue uno standard unico: problema reale, modello, formalizzazione, esempio, lab, errore tipico e checkpoint.
- Ogni modulo mette a disposizione dataset realistici, notebook, query SQL o trasformazioni e soluzioni guidate per esercizi a 3 livelli.
- Ogni modulo chiude con assignment, caso studio end-to-end, cheat sheet, rubrica pubblica ed esame modulo.
- Il percorso culmina in un capstone integrato e in tre track finali per specializzazione professionale.

## Capstone finale

**${COURSE_CAPSTONE.title}**

${COURSE_CAPSTONE.summary}

${COURSE_CAPSTONE.milestones.map((item) => `- ${item}`).join('\n')}

Output richiesti:

${COURSE_CAPSTONE.deliverables.map((item) => `- ${item}`).join('\n')}

## Track finali

${COURSE_TRACKS.map((track) => `### ${track.title}\n\n${track.summary}\n\nOutcome principali:\n${track.outcomes.map((item) => `- ${item}`).join('\n')}`).join('\n\n')}

## Come usare questa pagina

Usa la learning path in tre momenti:

1. all inizio, per capire il perimetro del corso;
2. a meta percorso, per verificare dove il tuo profilo e gia forte e dove no;
3. prima del capstone, per scegliere il track finale e impostare i deliverable piu coerenti con il tuo obiettivo.
`;

  await fs.writeFile(learningPathPath, matter.stringify(body, { title, description }), 'utf8');
}

async function main(): Promise<void> {
  await rewriteLessons();
  await rewriteLearningPath();
  console.log(`Applied V2 curriculum to ${COURSE_MODULES.length} modules.`);
}

main().catch((error) => {
  console.error('Failed to apply V2 curriculum:', error);
  process.exitCode = 1;
});
