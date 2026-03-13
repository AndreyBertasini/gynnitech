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
    promise: "costruisce orientamento, metodo di studio e ritmo prima di entrare nella parte tecnica del percorso",
    studyTip: "Studialo lentamente e usalo come manuale di metodo: qui decidi come prendere appunti, come esercitarti e come evitare di consumare lezioni senza trasformarle in competenza.",
    workUse: "Ti serve piu' di quanto sembri, perche' molte persone falliscono non per mancanza di intelligenza ma per assenza di struttura nello studio e nella pratica.",
    bridge: "E' la base che rende piu' forti tutti i moduli successivi, dalla raccolta dati fino alla causalita' e agli A/B test.",
  },
  'data-collection': {
    promise: "ti insegna a progettare il dato prima ancora di analizzarlo, con eventi, identita', naming, privacy e controlli di qualita'",
    studyTip: "Tieni accanto un tracking plan o uno schema eventi: ogni lezione rende molto di piu' se la traduci subito in nomi, proprieta', regole e checklist di QA.",
    workUse: "Serve quando il team vuole fidarsi di funnel, dashboard e attribution senza scoprire troppo tardi che la base dati e' incoerente.",
    bridge: "Senza una raccolta dati affidabile, i moduli su metriche, marketing analytics e sperimentazione restano fragili anche se sembrano sofisticati.",
  },
  'metriche-fondamenti': {
    promise: "ti allena a distinguere numeri utili da numeri ornamentali, segnali da rumore e misure da vere domande di business",
    studyTip: "Non limitarti a memorizzare definizioni: per ogni metrica chiediti sempre che decisione dovrebbe cambiare, da cosa dipende e quando puo' ingannare.",
    workUse: "Ti aiuta a leggere KPI, dashboard e report con piu' rigore, evitando interpretazioni troppo veloci o metriche scelte solo per abitudine.",
    bridge: "E' il ponte naturale tra tracking e analisi: qui impari il linguaggio con cui tutto il resto del corso viene pensato e giudicato.",
  },
  'gestione-data-driven': {
    promise: "porta i dati dentro processi decisionali, ricerca utenti, prioritizzazione e cultura organizzativa",
    studyTip: "Leggilo con un quaderno di domande manageriali, non solo analitiche: chi decide, con quali evidenze, con quali tempi e con quali bias organizzativi.",
    workUse: "Serve a trasformare il dato in pratica di team, evitando che analytics resti confinata in dashboard che nessuno usa davvero per decidere.",
    bridge: "Prepara bene i moduli su prodotto, marketing e sperimentazione, perche' ogni tecnica vale di piu' quando entra in un processo decisionale chiaro.",
  },
  'analisi-prodotto': {
    promise: "ti porta dentro il comportamento reale degli utenti, dall'attivazione alla retention, dalla ricerca UX alla validazione di prodotto",
    studyTip: "Studialo sempre collegando ogni concetto a un prodotto concreto: onboarding, aha moment, churn e PMF diventano chiari quando li vedi su percorsi reali.",
    workUse: "E' il modulo che rende piu' robusto il lavoro su crescita, priorita' di roadmap, UX e decisioni su cio' che un prodotto deve cambiare davvero.",
    bridge: "Ti prepara ai moduli su marketing analytics, data science e A/B testing, dove il comportamento utente va misurato, spiegato e testato con piu' precisione.",
  },
  'analisi-marketing': {
    promise: "ti insegna a leggere canali, funnel, CRM, attribuzione e unit economics senza fermarti ai numeri di piattaforma",
    studyTip: "Ogni lezione va tradotta in una domanda di budget, un problema di misurazione o una decisione di canale: e' li' che il modulo diventa davvero utile.",
    workUse: "Serve per capire che cosa genera crescita reale, quali canali sembrano funzionare ma confondono il merito e dove il marketing spreca denaro per cattiva lettura dei dati.",
    bridge: "Si collega direttamente ai moduli su dashboard, marketing data science e sperimentazione, dove il marketing smette di essere reporting e diventa analisi strutturata.",
  },
  'dashboard-visualizzazione': {
    promise: "ti insegna a trasformare dati grezzi in viste leggibili, dashboard utili e narrazioni che aiutano a decidere",
    studyTip: "Non chiederti solo se un grafico e' bello: chiediti quale decisione sostiene, che confronto rende visibile e quale errore di lettura potrebbe evitare.",
    workUse: "Ti serve quando devi presentare dati a manager, founder o team operativi senza ridurre tutto a una parete di numeri senza gerarchia.",
    bridge: "Rafforza tutto cio' che fai nei moduli su metriche, marketing e product analytics, perche' analizzare bene serve anche a comunicare bene.",
  },
  'marketing-data-science': {
    promise: "porta modelli, segmentazione, attribuzione, forecasting e sperimentazione dentro i problemi reali della crescita",
    studyTip: "Studialo sempre chiedendoti quale domanda stai facendo al modello: descrivere, prevedere o stimare un effetto non sono la stessa cosa.",
    workUse: "Serve a costruire un marketing piu' maturo, capace di usare regressioni, cluster e modelli predittivi senza scambiarli automaticamente per causalita'.",
    bridge: "Questo modulo dialoga naturalmente con matematica, filosofia della causalita' e A/B testing, dove i limiti interpretativi diventano ancora piu' importanti.",
  },
  'data-warehousing': {
    promise: "ti fa capire come si organizza un sistema analitico serio, dal modello dati ai motori che rendono sostenibili query e metriche",
    studyTip: "Leggilo come un modulo di architettura del ragionamento, non solo dell'infrastruttura: ogni scelta di schema modifica anche cio' che potrai misurare bene dopo.",
    workUse: "E' essenziale quando i dati iniziano a crescere e bisogna evitare tabelle ingestibili, report incoerenti e costi tecnici nascosti.",
    bridge: "Prepara data lake, analytics engineering e realtime, perche' prima di accelerare serve capire su quale base strutturale stai costruendo.",
  },
  's3-data-lake': {
    promise: "ti insegna a pensare lo storage analitico come sistema leggibile, economico e governabile nel tempo",
    studyTip: "Segui ogni lezione con un occhio a formati, partizionamento e access pattern: il data lake si capisce davvero solo quando immagini come verra' letto e mantenuto.",
    workUse: "Serve a evitare architetture che sembrano economiche all'inizio ma diventano caotiche, lente o costose appena aumentano team, fonti e volumi.",
    bridge: "E' il passaggio naturale verso analytics engineering, ClickHouse e pipeline piu' avanzate, dove lo storage smette di essere un dettaglio e diventa leva.",
  },
  'kafka-streaming': {
    promise: "ti porta dentro la logica dell'event streaming, dove affidabilita', ordine, idempotenza e schema contano quanto il throughput",
    studyTip: "Studialo immaginando il percorso di un evento dal producer al consumer: se vedi il flusso, capisci meglio anche errori, latenze e duplicazioni.",
    workUse: "Ti serve quando il dato non puo' piu' essere pensato come file o batch isolato, ma come flusso continuo che alimenta sistemi e decisioni in tempo quasi reale.",
    bridge: "Prepara il terreno per realtime analytics e infrastruttura operativa, dove la qualita' del flusso decide la qualita' delle analisi.",
  },
  'real-time-analytics': {
    promise: "ti insegna a leggere e costruire analytics in tempo reale con motori e pattern pensati per latenze basse e query pesanti",
    studyTip: "Non studiarlo come una corsa alla velocita': il punto e' capire quando il realtime ha senso, come si mantiene e quali compromessi introduce.",
    workUse: "E' utile in casi come monitoraggio operativo, adtech, eventi live, fraud detection e dashboard che devono reagire senza aspettare il batch del giorno dopo.",
    bridge: "Si collega a streaming, data warehousing e ops, perche' il realtime funziona solo quando ingestione, modellazione e affidabilita' si tengono insieme.",
  },
  'infrastructure-ops': {
    promise: "porta disciplina ingegneristica nel lavoro dati, con deploy, monitoraggio, costi, automazione e documentazione",
    studyTip: "Leggilo con mentalita' operativa: ogni lezione va vista come riduzione di rischio, regressione o dipendenza da procedure manuali fragili.",
    workUse: "Serve quando il team dati smette di essere artigianale e ha bisogno di continuita', osservabilita' e responsabilita' tecnica condivisa.",
    bridge: "Rende piu' sostenibili analytics engineering, realtime e data science, perche' senza ops mature anche i sistemi brillanti si rompono male.",
  },
  'advanced-sql': {
    promise: "ti fa usare SQL come vero strumento analitico avanzato, non come semplice linguaggio di estrazione",
    studyTip: "Studialo con query aperte e dati in testa: ogni pattern va capito per logica, non solo copiato, soprattutto quando lavora su retention, funnel o sequenze.",
    workUse: "E' il modulo che rende piu' forte quasi ogni ruolo analitico, perche' molte domande complesse sul business si chiariscono prima in SQL che in un dashboard builder.",
    bridge: "Si collega direttamente a product analytics, marketing analytics e analytics engineering, dove SQL resta uno dei linguaggi piu' produttivi e piu' sottovalutati.",
  },
  'matematica-analisi-dati': {
    promise: "costruisce la base matematica che rende piu' comprensibili modelli, regressioni, probabilita' e inferenza",
    studyTip: "Affrontalo con calma e torna sui passaggi: qui non serve correre, serve capire che cosa rappresenta ogni oggetto matematico nei problemi reali dei dati.",
    workUse: "Ti aiuta a smettere di usare formule e modelli come scatole chiuse, migliorando il modo in cui interpreti previsione, similitudine, ottimizzazione e test.",
    bridge: "E' una base potente per marketing data science, A/B testing e filosofia della causalita', dove il rigore matematico incontra quello interpretativo.",
  },
  'analytics-engineering': {
    promise: "ti insegna a trasformare dati grezzi in modelli affidabili, riusabili e governabili con dbt e pratiche moderne",
    studyTip: "Studialo pensando a lineage, naming, test e responsabilita': il punto non e' solo far girare un model, ma renderlo affidabile per tutti gli altri.",
    workUse: "Serve quando il team vuole smettere di riscrivere ogni volta le stesse metriche e costruire invece un patrimonio dati piu' stabile e condiviso.",
    bridge: "Si appoggia bene a warehouse e data lake, e prepara sistemi analitici dove BI, marketing e data science lavorano su basi meno improvvisate.",
  },
  'significativita-statistica': {
    promise: "ti porta nel cuore della sperimentazione: ipotesi, randomizzazione, potenza, p-value, errori e governance delle decisioni",
    studyTip: "Studialo sempre distinguendo tre momenti: formulare la domanda, disegnare il test, interpretare il risultato. Molti errori nascono dal confonderli.",
    workUse: "E' indispensabile per A/B test, product changes, landing page, lifecycle e qualsiasi situazione in cui vuoi stimare un effetto senza raccontarti storie.",
    bridge: "Dialoga con marketing data science, matematica e filosofia della causalita', perche' qui probabilita', inferenza e decisione si incontrano davvero.",
  },
  'direzioni-analitica': {
    promise: "ti orienta tra le grandi famiglie del lavoro analitico: marketing, prodotto e finanza",
    studyTip: "Usalo per confrontare logiche, KPI, strumenti e responsabilita': il suo valore cresce se lo leggi come mappa di ruolo e non come lista di buzzword.",
    workUse: "Serve a capire dove vuoi andare professionalmente e come cambia il ragionamento analitico quando cambia la funzione aziendale.",
    bridge: "Aiuta a ricomporre il corso come sistema unico, mostrando come le stesse competenze cambiano forma tra acquisizione, retention, margini e controllo.",
  },
  'filosofia-analisi-dati': {
    promise: "porta dentro l'analisi dati le grandi domande su causa, spiegazione, probabilita' e validita' della conoscenza",
    studyTip: "Leggilo senza fretta e con margini pieni di domande: qui il punto non e' accumulare citazioni, ma rendere piu' rigoroso il modo in cui interpreti dati e modelli.",
    workUse: "Serve a chi non vuole confondere correlazione con causalita', modello con realta', previsione con spiegazione o statistica con verita'.",
    bridge: "Rafforza regressioni, forecasting, attribuzione e A/B testing, perche' rende piu' solido il modo in cui trasformi numeri in conclusioni.",
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
  const prerequisitesCount = args.prerequisitesCount ?? 0;
  const paceHint = args.difficultyLabel === 'Avanzato'
    ? " Procedi con lentezza: qui conta capire il perche' dei passaggi piu' della velocita' con cui li attraversi."
    : prerequisitesCount > 0
      ? " Tieni vicini i prerequisiti: questa pagina rende molto di piu' se richiami i concetti che la precedono."
      : " Puoi usarla anche come ottimo punto di ingresso, pur tornando poi sulle lezioni collegate.";

  if (kind === 'cheat') {
    return {
      label: 'Ripasso rapido',
      whyItMatters: `Questa pagina condensa il cuore operativo del modulo ${args.moduleTitle}. Non va letta come capitolo lineare, ma come strumento per trattenere regole, formule, scorciatoie e criteri di scelta senza perdere il filo del percorso.`,
      howToStudy: `Usala dopo aver studiato le lezioni principali, non al posto loro. Evidenzia 5 righe chiave, marca cio' che dimentichi piu' spesso e torna qui prima di esercitarti o di lavorare su un caso reale.${paceHint}`,
      suggestedOutput: 'Trasformala in una checklist personale o in un foglio di richiamo rapido da tenere accanto quando lavori.',
    };
  }

  if (kind === 'case') {
    return {
      label: 'Caso completo',
      whyItMatters: `Qui il punto non e' accumulare definizioni, ma vedere come dati, vincoli, ipotesi e decisioni si tengono insieme. E' in lezioni come questa che ${moduleProfile.promise}.`,
      howToStudy: `Segui il caso come se fossi dentro il team: contesto, problema, scelta, trade-off, risultato. Fermati nei punti in cui avresti deciso diversamente e chiediti quali numeri o quali limiti ti farebbero cambiare idea.${paceHint}`,
      suggestedOutput: 'Scrivi che decisione avresti preso tu, quali KPI avresti difeso e dove avresti chiesto dati aggiuntivi prima di concludere.',
    };
  }

  if (kind === 'technical') {
    return {
      label: 'Lettura operativa',
      whyItMatters: `Questa e' una lezione operativa: porta il modulo ${args.moduleTitle} dal livello dei concetti a quello di query, modelli, pipeline, strumenti o implementazioni che devono reggere davvero nel lavoro.`,
      howToStudy: `Leggila con editor, notebook o foglio di lavoro aperto. Rifai almeno un esempio, cambia una variabile e osserva dove il ragionamento resta solido e dove invece si rompe.${paceHint}`,
      suggestedOutput: 'Ricostruisci un esempio minimo e poi adattalo a un dataset, un funnel o una pipeline che conosci davvero.',
    };
  }

  return {
    label: 'Lettura concettuale',
    whyItMatters: `Questa lezione rafforza il modo in cui interpreti dati, metriche e decisioni prima ancora di toccare uno strumento. E' una parte importante del corso, perche' ${moduleProfile.workUse.toLowerCase()}`,
    howToStudy: `Studiala con domande a margine: qual e' l'idea centrale, quale errore evita, quale esempio la chiarisce, quale scelta concreta puo' migliorare. L'obiettivo non e' "finirla", ma uscirne con un criterio piu' netto.${paceHint}`,
    suggestedOutput: "Riformula il concetto principale con parole tue e collegalo a un report, un funnel, una campagna o una decisione che hai gia' visto nel lavoro.",
  };
}

export function getModulePageEditorial(args: {
  module: CourseModule;
  lessonCount: number;
  firstLessonTitle?: string;
  nextModuleTitle?: string;
}): ModuleEditorialProfile {
  const profile = getModuleEditorialProfile(args.module.id);
  const pacingHint = args.lessonCount >= 10
    ? ' Affrontalo a blocchi da 2-3 lezioni, con una pausa per appunti e applicazione prima di andare avanti.'
    : ' Puoi seguirlo in modo abbastanza lineare, ma conviene comunque fermarti a sintetizzare i passaggi chiave.';
  const firstLessonHint = args.firstLessonTitle
    ? ` Se vuoi partire bene, apri prima "${args.firstLessonTitle}".`
    : '';
  const bridgeHint = args.nextModuleTitle
    ? ` Dopo questo modulo il passaggio naturale e' ${args.nextModuleTitle}.`
    : '';

  return {
    promise: profile.promise,
    studyTip: `${profile.studyTip}${pacingHint}${firstLessonHint}`,
    workUse: profile.workUse,
    bridge: `${profile.bridge}${bridgeHint}`,
  };
}
