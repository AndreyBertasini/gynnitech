import type { CourseModule } from '../data/course-modules';

type ModuleEditorialProfile = {
  promise: string;
  studyTip: string;
  workUse: string;
  bridge: string;
};

type LessonEditorialArgs = {
  moduleId: string;
  moduleTitle: string;
  category?: string;
  title?: string;
  difficultyLabel?: string;
  prerequisitesCount?: number;
};

type LessonEditorialProfile = {
  label: string;
  whyItMatters: string;
  howToStudy: string;
  suggestedOutput: string;
};

const MODULE_EDITORIAL_PROFILES: Record<string, ModuleEditorialProfile> = {
  panoramica: {
    promise: "Ti fa costruire orientamento, metodo e ritmo di studio, cosi' entri nei moduli tecnici con una base mentale ordinata e gia' pronta all'uso.",
    studyTip: "Leggilo come una guida operativa: prendi appunti, imposta routine brevi, trasforma ogni lezione in pratica e torna qui quando perdi direzione.",
    workUse: "Serve a evitare il problema piu' comune nei corsi lunghi: consumare contenuti senza memoria, senza applicazione e senza continuita' nel lavoro.",
    bridge: "Prepara tutti i moduli successivi, perche' tracking, metriche, regressioni e A/B test rendono molto di piu' quando studi con struttura.",
  },
  'data-collection': {
    promise: "Ti fa costruire una base dati affidabile: eventi, identita', naming, privacy e controlli diventano decisioni progettate, non correzioni dell'ultimo minuto.",
    studyTip: "Studialo con un tracking plan aperto e riscrivi subito eventi, proprieta' e regole di QA, cosi' ogni lezione si fissa meglio.",
    workUse: "Serve quando funnel, dashboard e attribution sembrano chiari ma poggiano su tracciamenti incoerenti, buchi di raccolta o definizioni diverse.",
    bridge: "Rafforza metriche, marketing analytics e sperimentazione, perche' nessuna analisi resta solida se la raccolta dei dati nasce male.",
  },
  'metriche-fondamenti': {
    promise: "Ti fa costruire un linguaggio analitico piu' rigoroso: distingui KPI, driver, segnali e rumore prima di leggere dashboard o report.",
    studyTip: "Per ogni metrica chiediti cosa misura, quale decisione cambia e in quali casi puo' sembrare utile pur raccontando male il business.",
    workUse: "Serve a evitare vanity metrics, interpretazioni impulsive e report pieni di numeri che non aiutano davvero a scegliere priorita' e azioni.",
    bridge: "Si collega a tracking, dashboard, marketing e prodotto, perche' tutto il corso diventa piu' chiaro quando sai nominare bene cio' che misuri.",
  },
  'gestione-data-driven': {
    promise: "Ti fa costruire processi decisionali piu' maturi, dove dati, ricerca, priorita' e responsabilita' entrano nel lavoro quotidiano dei team.",
    studyTip: "Studialo pensando a riunioni vere: chi decide, con quali evidenze, con quali tempi e con quali errori organizzativi da evitare.",
    workUse: "Serve quando analytics rischia di restare reporting passivo invece di guidare roadmap, budget, coordinamento e discussioni tra persone diverse.",
    bridge: "Prepara prodotto, marketing e sperimentazione, perche' le tecniche migliori valgono poco se non entrano in un processo decisionale stabile.",
  },
  'analisi-prodotto': {
    promise: "Ti prepara al lavoro di product analyst: metriche e tracking, funnel e attivazione, retention e monetization, esperimenti, diagnosi e comunicazione.",
    studyTip: "Studialo sempre su un prodotto concreto, cosi' onboarding, churn, aha moment e priorita' di roadmap smettono di restare concetti astratti.",
    workUse: "Serve quando devi capire perche' gli utenti non attivano valore, dove abbandonano e quali cambiamenti meritano davvero attenzione.",
    bridge: "Prepara marketing analytics, data science e A/B test, perche' il comportamento osservato qui verra' poi misurato, previsto e testato.",
  },
  'analisi-marketing': {
    promise: "Ti fa costruire una lettura piu' seria di canali, funnel, CRM, attribuzione e unit economics oltre i numeri delle piattaforme.",
    studyTip: "Studialo traducendo ogni lezione in una decisione di budget, un dubbio di misurazione o un problema di canale da risolvere.",
    workUse: "Serve quando il marketing sembra crescere nei report ma non sai ancora quali attivita' generano margine reale e quali no.",
    bridge: "Si collega a dashboard, data science e sperimentazione, perche' il marketing diventa maturo solo quando viene letto come sistema misurabile.",
  },
  'dashboard-visualizzazione': {
    promise: "Ti fa costruire dashboard, grafici e storie analitiche che aiutano a decidere, non solo a esporre numeri in ordine.",
    studyTip: "Per ogni visual chiediti quale confronto rende leggibile, quale azione sostiene e quale errore di interpretazione dovrebbe prevenire.",
    workUse: "Serve quando devi presentare dati a team e manager senza produrre report belli ma opachi, lunghi o difficili da usare.",
    bridge: "Rafforza metriche, marketing e prodotto, perche' una buona analisi vale di piu' quando viene comunicata con gerarchia e chiarezza.",
  },
  'marketing-data-science': {
    promise: "Ti fa costruire un uso piu' maturo di modelli, segmentazione, forecast e attribuzione dentro i problemi reali della crescita.",
    studyTip: "Studialo distinguendo sempre tra descrivere, prevedere e stimare un effetto, per non chiedere a un modello piu' di quanto possa dire.",
    workUse: "Serve quando vuoi usare regressioni, cluster e previsioni senza confondere performance apparente, correlazione e causalita' nel marketing.",
    bridge: "Si collega a matematica, filosofia della causalita' e A/B test, dove i limiti interpretativi diventano ancora piu' importanti.",
  },
  'data-warehousing': {
    promise: "Ti fa costruire una base architetturale piu' solida, in cui schema, motori e modellazione sostengono analisi leggibili e scalabili.",
    studyTip: "Studialo come architettura del ragionamento: ogni scelta di schema decide anche che cosa potrai misurare bene domani.",
    workUse: "Serve quando i dati crescono e devi evitare query fragili, report incoerenti, costi nascosti e modelli impossibili da mantenere.",
    bridge: "Prepara data lake, analytics engineering e realtime, perche' prima di accelerare devi capire la struttura che stai costruendo.",
  },
  's3-data-lake': {
    promise: "Ti fa costruire data lake piu' leggibili e sostenibili, dove storage, formati e partizioni restano governabili anche quando i volumi aumentano.",
    studyTip: "Studialo pensando a come i dati verranno letti, aggiornati e documentati, non solo a dove verranno salvati.",
    workUse: "Serve quando un data lake sembra economico all'inizio ma rischia di diventare presto caotico, lento o difficile da governare.",
    bridge: "Prepara analytics engineering, ClickHouse e pipeline piu' avanzate, perche' lo storage smette presto di essere un dettaglio tecnico.",
  },
  'kafka-streaming': {
    promise: "Ti fa costruire una mentalita' da flusso: eventi, ordine, idempotenza e schema diventano parti della qualita' del dato.",
    studyTip: "Studialo seguendo il viaggio dell'evento dal producer al consumer, cosi' errori, latenze e duplicazioni diventano molto piu' concreti.",
    workUse: "Serve quando il dato non e' piu' batch isolato ma flusso continuo che alimenta prodotti, sistemi e decisioni quasi in tempo reale.",
    bridge: "Prepara realtime analytics e ops, perche' la qualita' del flusso decide presto anche la qualita' delle analisi.",
  },
  'real-time-analytics': {
    promise: "Ti fa costruire analytics a bassa latenza con motori e pattern pensati per query veloci, eventi continui e decisioni operative.",
    studyTip: "Studialo senza mitizzare il realtime: chiediti quando serve davvero, quali costi introduce e come si mantiene nel tempo.",
    workUse: "Serve in casi come monitoring, adtech, eventi live e alerting, dove aspettare il batch del giorno dopo e' troppo tardi.",
    bridge: "Si collega a streaming, warehouse e ops, perche' il realtime funziona solo quando ingestione, modellazione e affidabilita' si sostengono.",
  },
  'infrastructure-ops': {
    promise: "Ti fa costruire disciplina operativa nel lavoro dati, con deploy, monitoraggio, automazione, documentazione e controllo dei costi.",
    studyTip: "Studialo come riduzione di rischio: ogni lezione dovrebbe togliere dipendenze manuali, regressioni silenziose o manutenzione confusa.",
    workUse: "Serve quando il team dati cresce e non puo' piu' affidarsi a procedure artigianali, memoria individuale e controlli sporadici.",
    bridge: "Rende piu' sostenibili analytics engineering, realtime e data science, perche' i sistemi forti hanno bisogno anche di gestione forte.",
  },
  'advanced-sql': {
    promise: "Ti fa costruire un uso piu' maturo di SQL, capace di leggere sequenze, retention, funnel e metriche con molta piu' precisione.",
    studyTip: "Studialo con query aperte e varianti pratiche, cosi' ogni pattern diventa logica applicabile e non frammento copiato.",
    workUse: "Serve quasi in ogni ruolo analitico, perche' molte domande difficili su business, utenti e performance si chiariscono prima in SQL.",
    bridge: "Si collega a product analytics, marketing analytics e analytics engineering, dove SQL resta uno strumento centrale e spesso sottovalutato.",
  },
  'matematica-analisi-dati': {
    promise: "Ti fa costruire la base matematica che rende piu' leggibili modelli, regressioni, probabilita', inferenza e machine learning applicato.",
    studyTip: "Studialo con calma e torna sui passaggi, perche' qui conta capire cosa rappresenta ogni oggetto matematico nei problemi reali.",
    workUse: "Serve a non usare formule e modelli come scatole chiuse, migliorando il modo in cui interpreti previsione, similitudine e test.",
    bridge: "Prepara data science, A/B testing e causalita', dove rigore matematico e rigore interpretativo devono lavorare insieme.",
  },
  'analytics-engineering': {
    promise: "Ti fa costruire modelli dati affidabili, riusabili e governabili, cosi' il lavoro analitico smette di dipendere da soluzioni improvvisate.",
    studyTip: "Studialo pensando a naming, lineage, test e contratti, non solo all'esecuzione del model o al risultato della query.",
    workUse: "Serve quando il team vuole smettere di riscrivere metriche e tabelle in modi diversi e costruire basi condivise.",
    bridge: "Si appoggia a warehouse e data lake, e prepara sistemi dove BI, marketing e data science lavorano su modelli stabili.",
  },
  'significativita-statistica': {
    promise: "Ti fa costruire un modo piu' rigoroso di progettare esperimenti, leggere risultati e decidere quando un effetto merita fiducia.",
    studyTip: "Studialo separando sempre domanda, disegno e interpretazione, perche' molti errori nascono dal confondere questi tre momenti.",
    workUse: "Serve per A/B test, cambi di prodotto, landing page e lifecycle, quando vuoi stimare un effetto senza auto-ingannarti.",
    bridge: "Si collega a matematica, marketing data science e causalita', dove probabilita', inferenza e decisione si incontrano davvero.",
  },
  'direzioni-analitica': {
    promise: "Ti fa costruire una mappa chiara delle grandi direzioni analitiche, tra marketing, prodotto, finanza e responsabilita' differenti.",
    studyTip: "Studialo confrontando KPI, strumenti e domande tipiche, cosi' ogni area emerge come modo di pensare, non solo come etichetta.",
    workUse: "Serve a capire dove vuoi crescere professionalmente e come cambiano priorita', metriche e linguaggio quando cambia la funzione.",
    bridge: "Ricompone il corso come sistema unico, mostrando come le stesse competenze cambiano forma tra acquisizione, retention e marginalita'.",
  },
  'filosofia-analisi-dati': {
    promise: "Ti fa costruire un pensiero piu' rigoroso su causa, spiegazione, probabilita' e validita' delle conclusioni tratte dai dati.",
    studyTip: "Studialo lentamente e con domande a margine, perche' qui il valore sta nel rendere piu' solido il tuo modo di interpretare.",
    workUse: "Serve quando non vuoi confondere correlazione con causalita', modello con realta' o previsione con vera spiegazione.",
    bridge: "Rafforza regressioni, forecasting, attribution e A/B test, perche' rende piu' solido il passaggio dai numeri alle conclusioni.",
  },
};

const CHEAT_MARKERS = ['cheat', 'sintesi', 'riepilogo'];
const CASE_MARKERS = ['caso studio'];
const TECH_MARKERS = [
  'sql',
  'tracking',
  'streaming',
  'pipeline',
  'clickhouse',
  'data engineering',
  'analytics engineering',
  'window',
  'infrastructure',
  'devops',
  'python',
  'visualizzazione',
  'tecnico',
  'tecnica',
  'real-time',
  'realtime',
  'data lake',
  'production',
  'strumenti',
  'data science',
  'dbt',
  'modellazione',
  'qualita',
];

function normalizeText(...values: Array<string | undefined>): string {
  return values
    .filter((value): value is string => typeof value === 'string' && value.trim() !== '')
    .join(' ')
    .toLowerCase();
}

function matchesAny(source: string, markers: string[]): boolean {
  return markers.some((marker) => source.includes(marker));
}

function classifyLesson(category?: string, title?: string): 'cheat' | 'case' | 'technical' | 'conceptual' {
  const source = normalizeText(category, title);

  if (matchesAny(source, CHEAT_MARKERS)) {
    return 'cheat';
  }

  if (matchesAny(source, CASE_MARKERS)) {
    return 'case';
  }

  if (matchesAny(source, TECH_MARKERS)) {
    return 'technical';
  }

  return 'conceptual';
}

export function getModuleEditorialProfile(moduleId: string): ModuleEditorialProfile {
  return MODULE_EDITORIAL_PROFILES[moduleId] ?? {
    promise: 'organizza una parte importante del percorso in modo progressivo e applicabile',
    studyTip: 'Studialo in sequenza, fermandoti sui passaggi che vuoi davvero trasferire nel lavoro.',
    workUse: 'Serve a trasformare il corso in un sistema di ragionamento e non solo in una raccolta di nozioni.',
    bridge: 'Si collega ai moduli vicini del percorso e ne rafforza il significato pratico.',
  };
}

export function getLessonEditorialProfile(args: LessonEditorialArgs): LessonEditorialProfile {
  const kind = classifyLesson(args.category, args.title);
  const moduleProfile = getModuleEditorialProfile(args.moduleId);

  if (kind === 'cheat') {
    return {
      label: 'Ripasso rapido',
      whyItMatters: `Questa pagina concentra il nucleo operativo del modulo ${args.moduleTitle}. Serve a riprendere formule, criteri e passaggi chiave senza perdere il filo del percorso.`,
      howToStudy: "Usala dopo le lezioni principali, non al loro posto. Evidenzia cio' che dimentichi piu' spesso e torna qui prima di esercizi, ripasso o lavoro reale.",
      suggestedOutput: 'Trasformala in una checklist personale o in un foglio di richiamo rapido da tenere vicino mentre lavori.',
    };
  }

  if (kind === 'case') {
    return {
      label: 'Caso completo',
      whyItMatters: `Qui non accumuli definizioni: vedi come dati, vincoli, ipotesi e decisioni si tengono insieme. E' in lezioni cosi' che ${moduleProfile.promise.toLowerCase()}`,
      howToStudy: "Segui il caso come se fossi nel team: contesto, scelta, trade-off, risultato. Fermati nei punti dubbi e chiediti cosa ti farebbe decidere diversamente.",
      suggestedOutput: 'Scrivi quale decisione avresti preso tu, quali KPI avresti difeso e quali dati avresti chiesto prima di chiudere.',
    };
  }

  if (kind === 'technical') {
    return {
      label: 'Lettura operativa',
      whyItMatters: `Questa e' una lezione operativa: porta ${args.moduleTitle} dal piano dei concetti a quello di query, modelli, strumenti o pipeline che devono reggere davvero.`,
      howToStudy: "Aprila con editor, notebook o foglio di lavoro. Rifai almeno un esempio, cambia una variabile e osserva dove il ragionamento resta solido.",
      suggestedOutput: 'Ricostruisci un esempio minimo e adattalo subito a un dataset, un funnel o una pipeline che conosci davvero.',
    };
  }

  return {
    label: 'Lettura concettuale',
    whyItMatters: `Questa lezione rafforza il modo in cui interpreti dati, metriche e decisioni prima ancora di aprire uno strumento. ${moduleProfile.workUse}`,
    howToStudy: "Leggila con domande a margine: qual e' l'idea centrale, quale errore evita, quale esempio la chiarisce e quale decisione concreta puo' migliorare.",
    suggestedOutput: "Riformula il concetto principale con parole tue e collegalo a un report, un funnel, una campagna o una decisione gia' vista.",
  };
}

export function getModulePageEditorial(args: {
  module: CourseModule;
  lessonCount: number;
  firstLessonTitle?: string;
  nextModuleTitle?: string;
}): ModuleEditorialProfile {
  return getModuleEditorialProfile(args.module.id);
}
