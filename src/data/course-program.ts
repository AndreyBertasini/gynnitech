export type CoursePhaseId = 'foundation' | 'application' | 'stack' | 'rigor' | 'direction';

export interface CoursePhase {
  id: CoursePhaseId;
  title: string;
  description: string;
}

export interface CourseArtifact {
  title: string;
  summary: string;
  deliverables: string[];
}

export interface CourseRubric {
  title: string;
  summary: string;
  criteria: string[];
}

export interface ModuleExamSummary {
  title: string;
  format: string;
  checkpoints: string[];
}

export interface CourseLessonBlueprint {
  title: string;
}

export interface CompletionPack {
  assignment: CourseArtifact;
  caseStudy: CourseArtifact;
  cheatSheet: CourseArtifact;
  rubric: CourseRubric;
}

export interface CourseTrack {
  id: string;
  title: string;
  summary: string;
  moduleIds: string[];
  outcomes: string[];
}

export interface CourseCapstone {
  title: string;
  summary: string;
  milestones: string[];
  deliverables: string[];
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  objective: string;
  phase: CoursePhaseId;
  prerequisites: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  icon: string;
  color: string;
  completionPack: CompletionPack;
  examSummary: ModuleExamSummary;
  coreLessons: CourseLessonBlueprint[];
}

export const COURSE_PHASES: CoursePhase[] = [
  {
    id: 'foundation',
    title: 'Fondazione',
    description: 'Metodo, tracking, metriche e operating system decisionale prima di entrare nelle specializzazioni.',
  },
  {
    id: 'application',
    title: 'Applicazione al business',
    description: 'Prodotto, marketing, dashboard e modelli decisionali applicati a problemi reali di crescita.',
  },
  {
    id: 'stack',
    title: 'Infrastruttura e stack',
    description: 'Warehouse, lakehouse, streaming, realtime e disciplina operativa per sistemi analitici affidabili.',
  },
  {
    id: 'rigor',
    title: 'Rigore quantitativo',
    description: 'SQL avanzato, matematica, analytics engineering e experiment science per alzare il livello del corso.',
  },
  {
    id: 'direction',
    title: 'Direzione e profondità',
    description: 'Ruoli, responsabilita economica, causalita, AI applicata e lettura critica dei dati in contesti decisionali complessi.',
  },
];

export const COURSE_CAPSTONE: CourseCapstone = {
  title: 'Costruire un sistema completo di marketing analytics',
  summary:
    'Capstone finale obbligatorio che unisce tracking, modellazione metrica, architettura dati, trasformazioni, dashboard, forecasting, sperimentazione e raccomandazione economica finale.',
  milestones: [
    'Milestone 1: definire business question, piano di tracking e data contracts.',
    'Milestone 2: costruire KPI tree, baseline e modello metrico di riferimento.',
    'Milestone 3: progettare warehouse o lakehouse design con pipeline e modellazione analytics engineering.',
    'Milestone 4: pubblicare dashboard decisionale e piano sperimentale.',
    'Milestone 5: consegnare previsione, raccomandazione economica e narrativa executive.',
  ],
  deliverables: [
    'Piano di tracking.',
    'Modello metrico.',
    'Warehouse o lakehouse design.',
    'Trasformazioni analytics engineering.',
    'Dashboard decisionale.',
    'Un esperimento.',
    'Una previsione.',
    'Una raccomandazione economica finale.',
  ],
};

export const COURSE_TRACKS: CourseTrack[] = [
  {
    id: 'growth-marketing-measurement',
    title: 'Growth e misurazione del marketing',
    summary:
      'Track finale per chi vuole governare measurement architecture, incrementality, budget allocation e decisioni growth-oriented.',
    moduleIds: ['data-collection', 'metriche-fondamenti', 'analisi-marketing', 'dashboard-visualizzazione', 'marketing-data-science', 'significativita-statistica'],
    outcomes: [
      'Disegnare sistemi di misura marketing credibili.',
      'Leggere unit economics, attribution e incrementality con rigore.',
      'Tradurre insight marketing in azioni di budget e growth review.',
    ],
  },
  {
    id: 'product-experimentation',
    title: 'Prodotto e sperimentazione',
    summary:
      'Track finale per chi vuole lavorare su product analytics, retention, experimentation science e causalita applicata.',
    moduleIds: ['metriche-fondamenti', 'gestione-data-driven', 'analisi-prodotto', 'dashboard-visualizzazione', 'matematica-analisi-dati', 'significativita-statistica', 'filosofia-analisi-dati'],
    outcomes: [
      'Diagnosticare activation, retention e churn in modo sistemico.',
      'Progettare esperimenti e leggere effetti causali con maggiore affidabilita.',
      'Scrivere memo decisionali per prodotto e leadership.',
    ],
  },
  {
    id: 'data-platform-analytics-engineering',
    title: 'Data platform e analytics engineering',
    summary:
      'Track finale per chi vuole progettare lo stack analitico end-to-end, dal tracking al warehouse fino al serving layer.',
    moduleIds: ['data-collection', 'data-warehousing', 's3-data-lake', 'kafka-streaming', 'real-time-analytics', 'infrastructure-ops', 'advanced-sql', 'analytics-engineering', 'ai-data-workflows', 'agentic-ai-data-workflows'],
    outcomes: [
      'Disegnare architetture analitiche scalabili con contratti, QA e osservabilita.',
      'Costruire modelli dati riusabili con dbt e semantic layer.',
      'Sostenere pipeline batch, realtime, AI-assisted e agentiche con disciplina operativa.',
    ],
  },
];

export const COURSE_MODULES: CourseModule[] = [
  {
    id: 'panoramica',
    title: 'Panoramica e metodo di studio',
    description:
      'Trasforma il corso da catalogo a sistema cognitivo, con metodo di studio, memoria tecnica e piano di output professionali.',
    objective: 'Trasformare il corso da catalogo a sistema cognitivo.',
    phase: 'foundation',
    prerequisites: [],
    seoTitle: 'Panoramica e metodo di studio | GinnyTech',
    seoDescription:
      'Modulo introduttivo GinnyTech su metodo di studio, first principles, riproducibilita e piano di apprendimento per data work.',
    seoKeywords: ['ginnytech', 'metodo di studio data work', 'panoramica corso analytics', 'first principles analytics'],
    icon: 'Map',
    color: 'from-blue-500 to-indigo-500',
    completionPack: {
      assignment: {
        title: 'Assignment: Study OS personale',
        summary: 'Progetta un operating system di studio con ritmo, note, revisioni, output e regole di reproducibility.',
        deliverables: ['Piano settimanale.', 'Template note-taking.', 'Criteri di revisione.', 'Roadmap portfolio iniziale.'],
      },
      caseStudy: {
        title: 'Caso studio end-to-end: da catalogo a percorso',
        summary: 'Riorganizza un piano di studio dispersivo in un percorso coerente con obiettivi, vincoli e milestone.',
        deliverables: ['Mappa del percorso.', 'Dipendenze chiave.', 'Rischi di drop-off.', 'Decisioni di prioritizzazione.'],
      },
      cheatSheet: {
        title: 'Cheat sheet: Metodo di studio per data work',
        summary: 'Regole rapide per memoria, pratica, note-taking, revisione e output professionali.',
        deliverables: ['Checklist.', 'Routine.', 'Errori da evitare.'],
      },
      rubric: {
        title: 'Rubrica di valutazione modulo',
        summary: 'Valuta chiarezza del piano, sostenibilita, allineamento agli obiettivi e qualita degli output.',
        criteria: ['Chiarezza del piano.', 'Riproducibilita.', 'Continuita nel tempo.', 'Qualita degli artefatti prodotti.'],
      },
    },
    examSummary: {
      title: 'Esame modulo: diagnostic e piano di studio personalizzato',
      format: 'Memo strutturato con autodiagnosi, piano di apprendimento e output attesi a 90 giorni.',
      checkpoints: ['Obiettivi chiari.', 'Prerequisiti mappati.', 'Routine di studio realistica.', 'Portfolio iniziale definito.'],
    },
    coreLessons: [
      { title: 'Come si studia materiale tecnico senza dimenticarlo' },
      { title: 'First principles: come ragiona un analista forte' },
      { title: 'Dalla domanda di business alla domanda analitica' },
      { title: 'Appunti tecnici: un sistema che costruisce memoria' },
      { title: 'Riproducibilità: rigore prima della velocità' },
      { title: 'Dal corso alle competenze di lavoro' },
      { title: 'Diagnosi iniziale e piano di studio personale' },
      { title: 'Mappe concettuali: come orientarsi nei 21 moduli' },
    ],
  },
  {
    id: 'data-collection',
    title: 'Raccolta dati e sistemi di tracking',
    description:
      'Passa da tag e strumenti isolati a sistemi di misura affidabili, governati e osservabili.',
    objective: 'Passare da "mettere tag" a progettare sistemi di misura affidabili.',
    phase: 'foundation',
    prerequisites: ['Modulo 1 completato o equivalente: metodo di studio e logica del percorso.', 'Conoscenza di base di funnel, eventi e KPI digitali.'],
    seoTitle: 'Raccolta dati e sistemi di tracking | GinnyTech',
    seoDescription:
      'Measurement architecture, taxonomy, identity resolution, privacy, data contracts e QA per sistemi di tracking professionali.',
    seoKeywords: ['tracking systems', 'measurement architecture', 'data contracts', 'identity resolution', 'tracking qa'],
    icon: 'Database',
    color: 'from-teal-500 to-emerald-400',
    completionPack: {
      assignment: {
        title: 'Assignment: tracking plan professionale',
        summary: 'Disegna un piano di tracking con naming, contratti dati, ownership, privacy e controlli di qualita.',
        deliverables: ['Event taxonomy.', 'Property schema.', 'QA plan.', 'RACI di governance.'],
      },
      caseStudy: {
        title: 'Caso studio end-to-end: measurement architecture da zero',
        summary: 'Progetta il sistema di misura di un business reale e difendine le scelte architetturali.',
        deliverables: ['Measurement map.', 'Identity logic.', 'Consent flow.', 'Piano di rollout.'],
      },
      cheatSheet: {
        title: 'Cheat sheet: tracking systems',
        summary: 'Checklist rapida per taxonomy, QA, privacy, contracts e osservabilita del tracking.',
        deliverables: ['Naming rules.', 'QA checks.', 'Failure modes.'],
      },
      rubric: {
        title: 'Rubrica di valutazione modulo',
        summary: 'Valuta completezza del piano, chiarezza dei contratti, copertura dei rischi e tenuta operativa.',
        criteria: ['Copertura degli eventi.', 'Governance.', 'Affidabilita.', 'Conformita privacy.'],
      },
    },
    examSummary: {
      title: 'Esame modulo: measurement system review',
      format: 'Revisione strutturata di un tracking setup con priorita correttive e piano di hardening.',
      checkpoints: ['Eventi chiave.', 'Identity model.', 'Data contracts.', 'QA e monitoraggio.'],
    },
    coreLessons: [
      { title: 'Raccolta dati: fondamenti e strategia' },
      { title: 'Event tracking: implementazione pratica' },
      { title: 'Strumenti di tracking a confronto: come scegliere' },
      { title: 'Privacy e GDPR nella raccolta dati' },
      { title: 'Glossario del tracking: entità, eventi, proprietà' },
      { title: 'Jobs to be done: quali dati vale la pena raccogliere' },
      { title: 'Integrazioni: connettere tool e warehouse' },
      { title: 'Quickstart: il primo tracking in 30 minuti' },
    ],
  },
  {
    id: 'metriche-fondamenti',
    title: 'Metriche, KPI tree e fondamenti analitici',
    description:
      'Impara a leggere i numeri come sistemi, con KPI tree, unit economics, baseline corrette e lettura causale dei segnali.',
    objective: 'Far leggere i numeri come sistemi, non come dashboard isolate.',
    phase: 'foundation',
    prerequisites: ['Modulo 2 consigliato: basi di tracking e measurement architecture.', 'Familiarita di base con tassi, medie e concetti di business digitale.'],
    seoTitle: 'Metriche, KPI tree e fondamenti analitici | GinnyTech',
    seoDescription:
      'North star metric, KPI tree, guardrail metrics, unit economics, baselines e lettura causale dei KPI per decisioni piu rigorose.',
    seoKeywords: ['kpi tree', 'north star metric', 'unit economics', 'baseline analytics', 'correlazione causalita'],
    icon: 'BarChart',
    color: 'from-green-500 to-emerald-400',
    completionPack: {
      assignment: {
        title: 'Assignment: framework metrico del business',
        summary: 'Ricostruisci il sistema di metriche di un business con obiettivi, guardrail, baseline e unit economics.',
        deliverables: ['North star.', 'KPI tree.', 'Guardrail metrics.', 'Glossario metrico.'],
      },
      caseStudy: {
        title: 'Caso studio end-to-end: metriche che guidano davvero',
        summary: 'Analizza un business reale e separa vanity metrics, proxy utili e segnali causali credibili.',
        deliverables: ['Diagnosi KPI.', 'Rischi di distorsione.', 'Piano di monitoraggio.', 'Decision memo.'],
      },
      cheatSheet: {
        title: 'Cheat sheet: KPI tree e metriche',
        summary: 'Promemoria operativo su denominatori, rate, coorti, unit economics e lettura del segnale.',
        deliverables: ['Formule.', 'Controlli.', 'Anti-pattern.'],
      },
      rubric: {
        title: 'Rubrica di valutazione modulo',
        summary: 'Valuta coerenza del sistema metrico, robustezza delle definizioni e capacita di collegare numeri e decisioni.',
        criteria: ['Coerenza logica.', 'Solidita dei denominatori.', 'Utilita decisionale.', 'Chiarezza delle definizioni.'],
      },
    },
    examSummary: {
      title: 'Esame modulo: KPI system defense',
      format: 'Presentazione con difesa del framework metrico davanti a un board simulato.',
      checkpoints: ['North star motivata.', 'Guardrail credibili.', 'Unit economics corretti.', 'Trade-off esplicitati.'],
    },
    coreLessons: [
      { title: 'North Star Metric, KPI tree e metrica obiettivo' },
      { title: 'Guardrail e counter-metric: i freni di ogni obiettivo' },
      { title: 'Coorti, segmenti e baseline corrette' },
      { title: 'Segnale, rumore, variazione normale e falsi allarmi' },
      { title: 'Correlazione, proxy metric e lettura causale dei KPI' },
      { title: 'Progetto: rifare il framework metrico di un business reale' },
    ],
  },
  {
    id: 'gestione-data-driven',
    title: 'Gestione data-driven e processi decisionali',
    description:
      'Porta i dati nel modo quotidiano di decidere con cadence, governance, decision memo e allineamento tra funzioni.',
    objective: 'Inserire i dati nel modo quotidiano di decidere.',
    phase: 'foundation',
    prerequisites: ['Moduli 2-3 consigliati: measurement e basi metriche.', 'Esperienza minima con riunioni, priorita o processi decisionali di team.'],
    seoTitle: 'Gestione data-driven e processi decisionali | GinnyTech',
    seoDescription:
      'PDCA, OODA, HADI, decision memo, research ops, cadence operative e governance della sperimentazione per organizzazioni data-driven.',
    seoKeywords: ['gestione data-driven', 'decision memo', 'research ops', 'hadi', 'ooda', 'operating system decisionale'],
    icon: 'BrainCircuit',
    color: 'from-indigo-500 to-purple-400',
    completionPack: {
      assignment: {
        title: 'Assignment: decision operating system',
        summary: 'Disegna il sistema decisionale di un team con cadence, backlog ipotesi, owner e regole di governance.',
        deliverables: ['Cadence map.', 'Backlog ipotesi.', 'Template memo.', 'RACI decisionale.'],
      },
      caseStudy: {
        title: 'Caso studio end-to-end: mettere ordine nelle decisioni',
        summary: 'Ripara un processo decisionale confuso integrando dati, ricerca e ownership.',
        deliverables: ['Diagnosi operating model.', 'Nuova governance.', 'Rituali operativi.', 'Metric review plan.'],
      },
      cheatSheet: {
        title: 'Cheat sheet: operating system decisionale',
        summary: 'Framework rapidi per review, retro, decision memo, backlog ipotesi e allineamento cross-funzionale.',
        deliverables: ['Checklist meeting.', 'Flow decisionali.', 'Anti-pattern ricorrenti.'],
      },
      rubric: {
        title: 'Rubrica di valutazione modulo',
        summary: 'Valuta chiarezza delle responsabilita, ritmo operativo, qualita delle evidenze e sostenibilita del processo.',
        criteria: ['Ownership.', 'Uso delle evidenze.', 'Cadenza.', 'Qualita delle decisioni.'],
      },
    },
    examSummary: {
      title: 'Esame modulo: decision memo e governance review',
      format: 'Pacchetto composto da memo decisionale, cadence settimanale e piano di allineamento cross-team.',
      checkpoints: ['Backlog ipotesi.', 'Owner chiari.', 'Rituali sostenibili.', 'Regole di escalation.'],
    },
    coreLessons: [
      { title: 'Cultura data-driven: i tre pilastri' },
      { title: 'Decidere con i dati: il framework DECIDE' },
      { title: 'OKR e KPI: dalle metriche agli obiettivi' },
      { title: "Jobs to be done per l'analisi: dai job ai dati" },
      { title: 'Ricerca quantitativa e qualitativa per decisioni' },
      { title: "Interviste in profondità per l'analisi dei dati" },
      { title: 'PDCA e HADI: cicli di miglioramento continuo' },
      { title: 'Cheat sheet: gestione data-driven' },
      { title: 'Progetto: diagnosi della cultura dati aziendale' },
    ],
  },
  {
    id: 'analisi-prodotto',
    title: 'Product analytics e diagnosi della crescita',
    description:
      'Leggi dove il prodotto crea valore, attrito o perdita con funnel, retention, activation e monetization analytics.',
    objective: 'Leggere dove il prodotto crea valore, frizione o perdita.',
    phase: 'application',
    prerequisites: ['Moduli 2-4 consigliati: measurement, metriche e operating system decisionale.', 'Conoscenza base di funnel e ciclo di vita utente.'],
    seoTitle: 'Product analytics e diagnosi della crescita | GinnyTech',
    seoDescription:
      'Activation, funnel decomposition, retention, churn, monetization analytics e growth diagnostics per product teams rigorosi.',
    seoKeywords: ['product analytics', 'growth diagnostics', 'retention cohorts', 'activation metrics', 'monetization analytics'],
    icon: 'Activity',
    color: 'from-blue-500 to-cyan-400',
    completionPack: {
      assignment: {
        title: 'Assignment: product diagnostic pack',
        summary: 'Diagnostica activation, retention, friction e monetization di un prodotto con un piano d intervento prioritizzato.',
        deliverables: ['Value model.', 'Funnel decomposition.', 'Retention readout.', 'Intervention backlog.'],
      },
      caseStudy: {
        title: 'Caso studio end-to-end: prodotto che smette di crescere',
        summary: 'Ricostruisci le cause di rallentamento di un prodotto e proponi azioni sequenziate.',
        deliverables: ['Root cause map.', 'Segment analysis.', 'Experiment queue.', 'Narrativa executive.'],
      },
      cheatSheet: {
        title: 'Cheat sheet: product analytics',
        summary: 'Sintesi operativa di metriche, cohort logic, curve di retention, churn e monetization diagnostics.',
        deliverables: ['Metric glossary.', 'Framework di diagnosi.', 'Warning signs.'],
      },
      rubric: {
        title: 'Rubrica di valutazione modulo',
        summary: 'Valuta profondita della diagnosi, qualita delle ipotesi e capacita di collegare insight ad azioni di prodotto.',
        criteria: ['Diagnosi.', 'Segmentazione.', 'Prioritizzazione.', 'Chiarezza dei trade-off.'],
      },
    },
    examSummary: {
      title: 'Esame modulo: growth diagnostic review',
      format: 'Analisi di un prodotto con deck di 10 slide e backlog di decisioni.',
      checkpoints: ['Activation definita.', 'Funnel decomposto.', 'Retention letta bene.', 'Azioni prioritarie.'],
    },
    coreLessons: [
      { title: 'Introduzione alla product analytics' },
      { title: 'Misurare la retention: definizioni e curve' },
      { title: 'Customer development per product analytics' },
      { title: 'Coorti comportamentali e matrici di transizione' },
      { title: 'UX research e dati comportamentali' },
      { title: 'NPS, CSAT e CES: misurare la soddisfazione' },
      { title: 'A/B test di prodotto: protocollo e anti-pattern' },
      { title: 'Prioritizzare le feature con i dati' },
      { title: 'Product-market fit: segnali, metriche e falsi positivi' },
      { title: 'Caso studio: diagnosi completa di un prodotto' },
      { title: 'Cheat sheet: product analytics' },
    ],
  },
  {
    id: 'analisi-marketing',
    title: 'Marketing analytics e martech',
    description:
      'Porta il marketing da reporting a disciplina quantitativa seria con incrementality, unit economics e review decisionali.',
    objective: 'Portare il marketing da reporting a disciplina quantitativa seria.',
    phase: 'application',
    prerequisites: ['Moduli 2-4 consigliati: tracking, metriche e governance decisionale.', 'Familiarita con canali, campagne e funnel marketing.'],
    seoTitle: 'Marketing analytics e martech | GinnyTech',
    seoDescription:
      'Measurement architecture marketing, attribution, incrementality, MMM, unit economics e executive review per team marketing moderni.',
    seoKeywords: ['marketing analytics', 'incrementality', 'unit economics', 'mmm', 'budget allocation', 'attribution'],
    icon: 'Zap',
    color: 'from-orange-500 to-red-400',
    completionPack: {
      assignment: {
        title: 'Assignment: marketing measurement system',
        summary: 'Ridisegna il sistema di misura di un team marketing con canali, metadati, unit economics e governance.',
        deliverables: ['Measurement map.', 'Funnel marketing.', 'Incrementality plan.', 'Dashboard executive.'],
      },
      caseStudy: {
        title: 'Caso studio end-to-end: rifare il sistema di misura marketing',
        summary: 'Ricostruisci attribution, reporting e allocazione budget di un team in crescita.',
        deliverables: ['Canal mix review.', 'Contaminazioni dati.', 'Marginal ROI model.', 'Decision memo.'],
      },
      cheatSheet: {
        title: 'Cheat sheet: marketing measurement',
        summary: 'Regole operative per UTM, click IDs, funnel, CAC/LTV, incrementality, MMM e budget review.',
        deliverables: ['Glossario.', 'Formule.', 'Checklist di audit.'],
      },
      rubric: {
        title: 'Rubrica di valutazione modulo',
        summary: 'Valuta robustezza del sistema di misura, lettura economica e capacita di difendere decisioni di budget.',
        criteria: ['Qualita dei dati.', 'Lettura economica.', 'Rigorosita causale.', 'Azione decisionale.'],
      },
    },
    examSummary: {
      title: 'Esame modulo: executive marketing review',
      format: 'Business review con 1 dashboard, 1 memo e 1 proposta di budget allocation.',
      checkpoints: ['Funnel chiaro.', 'Incrementality affrontata.', 'Unit economics solidi.', 'Raccomandazione economica.'],
    },
    coreLessons: [
      { title: 'Performance marketing analytics' },
      { title: 'Modelli di attribuzione: da last click a Markov e Shapley' },
      { title: 'Customer journey e funnel analytics' },
      { title: 'Marketing mix modeling: adstock, saturazione e budget' },
      { title: 'Funnel marketing e unit economics' },
      { title: 'SEO e content analytics' },
      { title: 'CRM e email marketing analytics' },
      { title: 'Social media analytics' },
      { title: 'Misurare il brand: brand lift e pricing power' },
      { title: 'Il brand come asset economico: segnali e strategia' },
      { title: 'Dashboard operative per il marketing' },
      { title: 'GA4 avanzato per analisti di marketing' },
      { title: 'Server-side tracking, GTM Server e Conversions API' },
      { title: 'Reverse ETL e sincronizzazione delle audience' },
      { title: 'Lifecycle marketing: orchestrazione multicanale' },
      { title: 'CDP, identity resolution e attivazione delle audience' },
      { title: 'Martech operations nel B2B: CRM, scoring e routing' },
      { title: 'GTM, dataLayer e QA del tracking' },
      { title: 'UTM e parametri di campagna: dal click al ricavo' },
      { title: 'Marketing data pipeline: architettura end-to-end' },
      { title: 'Caso studio: allocare il budget marketing con dati sporchi' },
      { title: 'Cheat sheet: marketing analytics' },
    ],
  },
  {
    id: 'dashboard-visualizzazione',
    title: 'Dashboard e visualizzazione dei dati',
    description:
      'Costruisci dashboard che fanno decidere, con gerarchia visiva, semantic consistency, alerting e contesto operativo.',
    objective: 'Costruire dashboard che fanno decidere, non solo guardare.',
    phase: 'application',
    prerequisites: ['Moduli 3 e 6 consigliati: metriche e marketing analytics.', 'Capacita base di leggere grafici e report tabellari.'],
    seoTitle: 'Dashboard e visualizzazione dei dati | GinnyTech',
    seoDescription:
      'Decision-first dashboard design, storytelling, alerting e navigabilita per trasformare report in interfacce decisionali.',
    seoKeywords: ['dashboard design', 'decision interface', 'data visualization', 'storytelling dati', 'alerting'],
    icon: 'LayoutDashboard',
    color: 'from-cyan-500 to-blue-400',
    completionPack: {
      assignment: {
        title: 'Assignment: dashboard redesign',
        summary: 'Riprogetta una dashboard debole in una decision interface con gerarchia, definizioni e navigazione chiare.',
        deliverables: ['Wireframe.', 'Metric dictionary.', 'Alert logic.', 'Narrativa di review.'],
      },
      caseStudy: {
        title: 'Caso studio end-to-end: dashboard che cambia il modo di decidere',
        summary: 'Mostra come una dashboard ben progettata riduca lavoro manuale e aumenti fiducia nei numeri.',
        deliverables: ['Prima/dopo.', 'KPI hierarchy.', 'Stakeholder map.', 'Decision cadence.'],
      },
      cheatSheet: {
        title: 'Cheat sheet: dashboard decisionali',
        summary: 'Pattern rapidi per visual hierarchy, semantic consistency, drill-down e alerting.',
        deliverables: ['Pattern.', 'Errori visivi.', 'Checklist di review.'],
      },
      rubric: {
        title: 'Rubrica di valutazione modulo',
        summary: 'Valuta leggibilita, utilita decisionale, consistenza semantica e navigabilita della dashboard.',
        criteria: ['Gerarchia visiva.', 'Chiarezza delle metriche.', 'Azionabilita.', 'Manutenibilita.'],
      },
    },
    examSummary: {
      title: 'Esame modulo: dashboard decision interface review',
      format: 'Consegna di redesign con walkthrough e rationale visuale.',
      checkpoints: ['Decision-first design.', 'Metriche coerenti.', 'Drill-down utile.', 'Alerting sensato.'],
    },
    coreLessons: [
      { title: 'Data visualization: principi e percezione visiva' },
      { title: "Dashboard strategiche: progettare per l'executive" },
      { title: 'Storytelling con i dati: narrative e persuasione' },
      { title: 'SQL per analisti: query per dashboard' },
      { title: "Python per l'analisi dei dati e le dashboard" },
      { title: 'ETL e pipeline per dashboard' },
      { title: 'Caso studio: una dashboard executive completa' },
      { title: 'Cheat sheet: dashboard e visualizzazione' },
    ],
  },
  {
    id: 'marketing-data-science',
    title: 'Marketing data science e modelli predittivi',
    description:
      'Introduce modelli utili al business, distinguendo prediction, causation, scenario planning e model risk.',
    objective: 'Introdurre modelli utili, non "ML cosmetico".',
    phase: 'application',
    prerequisites: ['Moduli 3, 6 e 7 consigliati: metriche, marketing analytics e dashboard.', 'Comfort minimo con probabilita, segmentazione o modelli base.'],
    seoTitle: 'Marketing data science e modelli predittivi | GinnyTech',
    seoDescription:
      'Forecasting, uplift, churn propensity, bandits, Bayesian updating e model evaluation per decisioni marketing piu mature.',
    seoKeywords: ['marketing data science', 'forecasting', 'uplift modeling', 'bandits', 'bayesian marketing', 'model evaluation'],
    icon: 'FlaskConical',
    color: 'from-pink-500 to-rose-400',
    completionPack: {
      assignment: {
        title: 'Assignment: decision model pack',
        summary: 'Costruisci un set di modelli per segmentazione, forecast e prioritizzazione interventi con criteri di business value.',
        deliverables: ['Scenario model.', 'Evaluation matrix.', 'Drift checklist.', 'Playbook decisionale.'],
      },
      caseStudy: {
        title: 'Caso studio end-to-end: growth model',
        summary: 'Integra segmentation, forecast, uplift e governance del rischio modello in un caso realistico.',
        deliverables: ['Model framing.', 'Trade-off prediction vs causation.', 'Business readout.', 'Monitoring plan.'],
      },
      cheatSheet: {
        title: 'Cheat sheet: marketing data science',
        summary: 'Riepilogo compatto di modelli, metriche di valutazione, drift e scelte decisionali.',
        deliverables: ['Glossario.', 'Metriche.', 'Decision rules.'],
      },
      rubric: {
        title: 'Rubrica di valutazione modulo',
        summary: 'Valuta framing del problema, qualita della validazione e capacita di collegare il modello al valore di business.',
        criteria: ['Framing.', 'Valutazione.', 'Governance.', 'Impatto economico.'],
      },
    },
    examSummary: {
      title: 'Esame modulo: model review board',
      format: 'Review strutturata di un modello con ipotesi, limiti, business value e monitoraggio.',
      checkpoints: ['Prediction vs causation.', 'Validation corretta.', 'Drift plan.', 'Decision value.'],
    },
    coreLessons: [
      { title: 'Marketing data science: fondamenti e strategia' },
      { title: 'Python per marketing data science' },
      { title: 'Customer analytics e segmentazione' },
      { title: 'Cluster analysis: gerarchico, DBSCAN e mixture model' },
      { title: "Oltre l'NPS: metriche di soddisfazione più affidabili" },
      { title: 'Product-market fit per segmento: metriche e test' },
      { title: 'Attribution modeling in SQL: dal last click al time decay' },
      { title: 'Unit economics avanzate per il marketing' },
      { title: 'Trigger e automazione: campagne basate sul comportamento' },
      { title: 'NLP per il marketing: sentiment, topic e copy' },
      { title: 'Embeddings e rappresentazione semantica' },
      { title: 'Trappole analitiche e bias nel marketing' },
      { title: 'Cicli HADI: un motore di sperimentazione' },
      { title: 'Test di incrementalità e holdout' },
      { title: 'Modelli predittivi per LTV e churn' },
      { title: 'Retention analytics e crescita sostenibile' },
      { title: 'Drift, model decay e monitoraggio' },
      { title: 'Cheat sheet: marketing data science' },
      { title: 'Caso studio: dal modello di churn alla decisione' },
    ],
  },
  {
    id: 'data-warehousing',
    title: 'Data warehouse e modellazione analitica',
    description:
      'Capisci davvero come si progetta un sistema analitico scalabile con grain corretto, storicizzazione e trade-off architetturali.',
    objective: 'Far capire davvero come si progetta un sistema analitico scalabile.',
    phase: 'stack',
    prerequisites: ['Moduli 2-3 consigliati: tracking e metriche.', 'Comfort minimo con tabelle, pipeline batch e concetti di modellazione dati.'],
    seoTitle: 'Corso data warehouse: modellazione dimensionale e SCD',
    seoDescription:
      'Progetta un data warehouse: OLTP vs OLAP, schema a stella, SCD, snapshot e trade-off di architettura. Lezioni gratuite con esempi e un caso studio.',
    seoKeywords: ['data warehouse', 'analytical architecture', 'dimensional modeling', 'olap', 'scd', 'snapshot'],
    icon: 'Server',
    color: 'from-slate-400 to-zinc-500',
    completionPack: {
      assignment: {
        title: 'Assignment: warehouse architecture design',
        summary: 'Disegna il warehouse di un business reale con grain, facts, dimensions, SCD e policy di refresh.',
        deliverables: ['Schema concettuale.', 'Grain definitions.', 'Storage strategy.', 'Trade-off note.'],
      },
      caseStudy: {
        title: 'Caso studio end-to-end: analytical system review',
        summary: 'Analizza un sistema dati esistente e riprogetta la parte warehouse per scalabilita e trust.',
        deliverables: ['Current state.', 'Target model.', 'Migration risks.', 'Decision rationale.'],
      },
      cheatSheet: {
        title: 'Cheat sheet: warehouse architecture',
        summary: 'Promemoria su grain, facts, dimensions, SCD, idempotenza, costi e performance.',
        deliverables: ['Pattern.', 'Trade-off.', 'Checklist di modeling.'],
      },
      rubric: {
        title: 'Rubrica di valutazione modulo',
        summary: 'Valuta correttezza del modello, chiarezza del grain e capacita di gestire storicizzazione e performance.',
        criteria: ['Grain.', 'Modeling.', 'Scalabilita.', 'Manutenibilita.'],
      },
    },
    examSummary: {
      title: 'Esame modulo: architecture design review',
      format: 'Review tecnica di un warehouse con schema, pipeline e piano di manutenzione.',
      checkpoints: ['Grain corretto.', 'SCD coerenti.', 'Batch affidabile.', 'Trade-off esplicitati.'],
    },
    coreLessons: [
      { title: 'Data warehouse moderno: OLTP, OLAP e star schema' },
      { title: 'Modellazione dimensionale: fact e dimension table' },
      { title: 'ClickHouse nel data warehouse moderno' },
      { title: 'Schema evolution e gestione dei cambiamenti' },
      { title: 'OLAP: cubi, ROLLUP, CUBE e GROUPING SETS' },
      { title: 'SQL per il data warehouse: i pattern essenziali' },
      { title: 'Progetto: costruire un data warehouse' },
    ],
  },
  {
    id: 's3-data-lake',
    title: 'Data lake e lakehouse su S3',
    description:
      'Passa da bucket con file a un data lake leggibile, governato e compatibile con i moderni pattern lakehouse.',
    objective: 'Passare da "bucket con file" a un data lake leggibile e governato.',
    phase: 'stack',
    prerequisites: ['Modulo 9 consigliato: data warehousing e concetti architetturali di base.', 'Conoscenza base di storage, file formats e query engines.'],
    seoTitle: 'Data lake e lakehouse su S3 | GinnyTech',
    seoDescription:
      'Object storage, Parquet, schema evolution, table formats moderni, governance e cost optimization per lakehouse professionali.',
    seoKeywords: ['data lake', 'lakehouse', 's3', 'parquet', 'schema evolution', 'iceberg delta hudi'],
    icon: 'HardDrive',
    color: 'from-amber-500 to-yellow-400',
    completionPack: {
      assignment: {
        title: 'Assignment: lakehouse blueprint',
        summary: 'Progetta layout, partitioning, security, lifecycle e discovery layer di un data lake professionale.',
        deliverables: ['Storage layout.', 'Table format choice.', 'Lifecycle policy.', 'Cost controls.'],
      },
      caseStudy: {
        title: 'Caso studio end-to-end: da data swamp a lakehouse',
        summary: 'Ripulisci un data lake ingestibile e convertilo in un sistema leggibile, governato e interrogabile.',
        deliverables: ['Before/after.', 'Schema evolution plan.', 'Compaction strategy.', 'Governance policy.'],
      },
      cheatSheet: {
        title: 'Cheat sheet: data lake e lakehouse',
        summary: 'Checklist compatta per formati, partitioning, table formats, sicurezza e costi di storage.',
        deliverables: ['Storage rules.', 'Anti-pattern.', 'Decision matrix.'],
      },
      rubric: {
        title: 'Rubrica di valutazione modulo',
        summary: 'Valuta leggibilita del layout, robustezza delle scelte formato e sostenibilita operativa nel tempo.',
        criteria: ['Layout.', 'Compatibilita schema.', 'Governance.', 'Efficienza costi.'],
      },
    },
    examSummary: {
      title: 'Esame modulo: lakehouse design review',
      format: 'Consegna architetturale con motivazione delle scelte di formato, layout e governance.',
      checkpoints: ['Formati corretti.', 'Partitioning sensato.', 'Discovery layer.', 'Cost model.'],
    },
    coreLessons: [
      { title: 'Object storage: come funziona davvero' },
      { title: 'Strategie di partizionamento su data lake' },
      { title: 'Query engine su S3: Athena, Presto e Trino' },
      { title: 'Storage class e lifecycle policy su S3' },
      { title: 'Apache Iceberg e table format per data lake' },
      { title: 'Catalogo dati e governance su S3' },
      { title: 'Prestazioni e ottimizzazione delle query su S3' },
      { title: 'Sicurezza e access control sul data lake' },
      { title: 'Monitoring e data quality del data lake' },
      { title: 'Backup e disaster recovery del data lake' },
      { title: 'Delta Lake: transazioni ACID sul data lake' },
      { title: 'Progetto: data lake completo su S3' },
    ],
  },
  {
    id: 'kafka-streaming',
    title: 'Kafka e streaming di eventi',
    description:
      'Insegna la logica del dato come flusso, con schema contracts, stream processing e failure handling realistico.',
    objective: 'Insegnare la logica del dato come flusso, non solo come tabella.',
    phase: 'stack',
    prerequisites: ['Modulo 9 consigliato: basi di architettura analitica.', 'Comfort minimo con code, eventi o integrazioni asincrone.'],
    seoTitle: 'Kafka e streaming di eventi | GinnyTech',
    seoDescription:
      'Mental model dello streaming, topics, partitions, schema registry, CDC, stream processing e failure handling in Kafka.',
    seoKeywords: ['kafka', 'event streaming', 'schema registry', 'cdc', 'stream processing', 'dlq'],
    icon: 'Radio',
    color: 'from-red-500 to-orange-400',
    completionPack: {
      assignment: {
        title: 'Assignment: streaming architecture review',
        summary: 'Disegna un sistema event streaming con producer, consumer, schema contracts e runbook di failure handling.',
        deliverables: ['Topic design.', 'Schema policy.', 'Consumer strategy.', 'Failure playbook.'],
      },
      caseStudy: {
        title: 'Caso studio end-to-end: architettura streaming',
        summary: 'Progetta un flusso eventi end-to-end con CDC, outbox, processing e serving analytics.',
        deliverables: ['Flow map.', 'Ordering strategy.', 'Retry/DLQ plan.', 'Latency budget.'],
      },
      cheatSheet: {
        title: 'Cheat sheet: event streaming',
        summary: 'Promemoria rapido per topic design, consumer groups, ordering, idempotenza e backpressure.',
        deliverables: ['Pattern.', 'Failure modes.', 'Ops checklist.'],
      },
      rubric: {
        title: 'Rubrica di valutazione modulo',
        summary: 'Valuta coerenza del design, qualita dei contracts e robustezza operativa in presenza di failure.',
        criteria: ['Topic design.', 'Contracts.', 'Processing.', 'Operabilita.'],
      },
    },
    examSummary: {
      title: 'Esame modulo: streaming system design',
      format: 'System design document con diagrammi, failure modes e scelte di delivery semantics.',
      checkpoints: ['Ordering.', 'Idempotenza.', 'CDC/outbox.', 'Runbook operativo.'],
    },
    coreLessons: [
      { title: 'Introduzione allo streaming con Kafka' },
      { title: 'Architettura di Kafka: replica e garanzie di consegna' },
      { title: 'Producer, consumer e serializzazione' },
      { title: 'Kafka Connect: integrazione senza codice' },
      { title: 'Schema Registry e governance degli eventi' },
      { title: 'Kafka Streams: processare eventi con Java' },
      { title: 'Kafka in produzione: monitoring e operations' },
      { title: 'Cheat sheet: Kafka e stream processing' },
      { title: 'Progetto: pipeline Kafka end-to-end' },
    ],
  },
  {
    id: 'real-time-analytics',
    title: 'Real-time analytics con ClickHouse',
    description:
      'Trasforma il realtime da slogan a sistema robusto con ingestion pattern, MergeTree thinking e cost control.',
    objective: 'Trasformare il realtime da slogan a sistema robusto.',
    phase: 'stack',
    prerequisites: ['Moduli 9-11 consigliati: warehouse, lakehouse e streaming.', 'Conoscenza base di OLAP, latenza e serving layer.'],
    seoTitle: 'Real-time analytics con ClickHouse | GinnyTech',
    seoDescription:
      'ClickHouse engine design, ingestion realtime, materialized views, late events, deduplica e dashboard operative.',
    seoKeywords: ['real-time analytics', 'clickhouse', 'mergetree', 'materialized views', 'late events', 'serving layer'],
    icon: 'Zap',
    color: 'from-yellow-400 to-orange-500',
    completionPack: {
      assignment: {
        title: 'Assignment: realtime pipeline design',
        summary: 'Disegna una pipeline realtime affidabile con ingestion, pre-aggregazioni, latenza target e serving layer.',
        deliverables: ['Latency target.', 'Ingestion design.', 'MV strategy.', 'Cost controls.'],
      },
      caseStudy: {
        title: 'Caso studio end-to-end: realtime analytics affidabile',
        summary: 'Progetta e difendi un sistema realtime che regga dati sporchi, late events e carichi variabili.',
        deliverables: ['Source-to-dashboard map.', 'Dedup plan.', 'Operational dashboard.', 'Runbook.'],
      },
      cheatSheet: {
        title: 'Cheat sheet: realtime con ClickHouse',
        summary: 'Pattern rapidi per ingestion, MergeTree, materialized views, late events e tuning di produzione.',
        deliverables: ['Schema decisions.', 'Ops checklist.', 'Cost levers.'],
      },
      rubric: {
        title: 'Rubrica di valutazione modulo',
        summary: 'Valuta correttezza del design realtime, robustezza contro eventi imperfetti e sostenibilita economica.',
        criteria: ['Latenza.', 'Affidabilita.', 'Scalabilita.', 'Cost control.'],
      },
    },
    examSummary: {
      title: 'Esame modulo: realtime architecture review',
      format: 'Documento tecnico con piano di ingestion, serving e gestione anomalie.',
      checkpoints: ['Definizione di realtime.', 'MergeTree corretto.', 'Late events gestiti.', 'Ops readiness.'],
    },
    coreLessons: [
      { title: 'Fondamenti di stream processing' },
      { title: 'ClickHouse: database colonnare e MergeTree' },
      { title: 'Pattern di ingestion in tempo reale' },
      { title: 'Change data capture (CDC)' },
      { title: 'Dashboard real-time e monitoring operativo' },
      { title: 'Materialized view e aggregazioni continue' },
      { title: 'Alerting e anomaly detection su stream' },
      { title: 'Cheat sheet: real-time analytics' },
      { title: 'Progetto: pipeline real-time end-to-end' },
    ],
  },
  {
    id: 'infrastructure-ops',
    title: 'Infrastruttura dati e operations',
    description:
      'Dai disciplina operativa da ingegneria seria a workload dati, deploy, osservabilita, security e incident response.',
    objective: 'Dare disciplina operativa da ingegneria seria.',
    phase: 'stack',
    prerequisites: ['Moduli 9-12 consigliati: architettura dati, lakehouse, streaming e realtime.', 'Conoscenza base di ambienti, deploy o toolchain di sviluppo.'],
    seoTitle: 'Infrastruttura dati e operations | GinnyTech',
    seoDescription:
      'IaC, Docker, CI/CD per SQL e dbt, osservabilita, incident response, secrets e governance costi per data systems.',
    seoKeywords: ['data ops', 'iac', 'docker', 'ci/cd data', 'observability', 'incident response'],
    icon: 'GitMerge',
    color: 'from-gray-400 to-slate-500',
    completionPack: {
      assignment: {
        title: 'Assignment: data ops operating model',
        summary: 'Definisci ambienti, CI/CD, osservabilita, incident response e cost governance per un sistema dati.',
        deliverables: ['Environment map.', 'CI/CD policy.', 'SLO set.', 'Incident runbook.'],
      },
      caseStudy: {
        title: 'Caso studio end-to-end: production hardening',
        summary: 'Metti in sicurezza una piattaforma dati fragile con nuove pratiche operative e di deployment.',
        deliverables: ['Gap analysis.', 'Hardening plan.', 'Observability matrix.', 'Ownership model.'],
      },
      cheatSheet: {
        title: 'Cheat sheet: data infrastructure ops',
        summary: 'Promemoria compatto per deploy, monitoraggio, secrets, costi e documentazione operativa.',
        deliverables: ['Checklist di release.', 'Incident checklist.', 'Governance notes.'],
      },
      rubric: {
        title: 'Rubrica di valutazione modulo',
        summary: 'Valuta operabilita, sicurezza, affidabilita e sostenibilita economica delle scelte infrastrutturali.',
        criteria: ['Deploy discipline.', 'Observability.', 'Security hygiene.', 'Cost governance.'],
      },
    },
    examSummary: {
      title: 'Esame modulo: production readiness review',
      format: 'Review di readiness con SLO, runbook, release flow e cost controls.',
      checkpoints: ['Ambienti chiari.', 'CI/CD robusto.', 'SLO presenti.', 'Runbook e secrets corretti.'],
    },
    coreLessons: [
      { title: 'Infrastruttura dati moderna: pilastri e costi' },
      { title: 'CI/CD per pipeline dati' },
      { title: 'Monitoring e alerting delle pipeline dati' },
      { title: "Gestione dei costi dell'infrastruttura dati" },
      { title: 'Orchestrazione: Airflow, Prefect e Dagster' },
      { title: 'Cheat sheet: infrastruttura e operations' },
      { title: 'Progetto: infrastruttura dati completa' },
    ],
  },
  {
    id: 'advanced-sql',
    title: "SQL avanzato per l'analisi",
    description:
      'Usa SQL come linguaggio di ragionamento, non solo di estrazione, con pattern per coorti, funnel, esperimenti e performance.',
    objective: 'Usare SQL come linguaggio di ragionamento, non solo di estrazione.',
    phase: 'rigor',
    prerequisites: ['Moduli 9-13 consigliati: architettura dati e basi di stack analitico.', 'Conoscenza operativa di SELECT, GROUP BY, JOIN e date basics.'],
    seoTitle: "SQL avanzato per l'analisi | GinnyTech",
    seoDescription:
      'Query thinking, joins avanzate, window functions, cohort analysis, funnel SQL, sessionization, testing e tuning.',
    seoKeywords: ['advanced sql', 'window functions', 'sessionization', 'funnel sql', 'cohort sql', 'sql optimization'],
    icon: 'Database',
    color: 'from-emerald-400 to-cyan-500',
    completionPack: {
      assignment: {
        title: 'Assignment: analytical SQL pack',
        summary: 'Risolvi un set di query professionali su coorti, funnel, sessioni, attribution e esperimenti.',
        deliverables: ['Notebook SQL.', 'Query review.', 'Performance notes.', 'Test cases.'],
      },
      caseStudy: {
        title: 'Caso studio end-to-end: query professionali su casi reali',
        summary: 'Analizza un dataset realistico con query sequenziali che portano a una decisione concreta.',
        deliverables: ['Analysis path.', 'Reusable patterns.', 'Optimization rationale.', 'Decision summary.'],
      },
      cheatSheet: {
        title: 'Cheat sheet: advanced SQL',
        summary: 'Pattern rapidi per joins, frames, cohorts, funnel, sessionization e tuning.',
        deliverables: ['Pattern library.', 'Common pitfalls.', 'Optimization hints.'],
      },
      rubric: {
        title: 'Rubrica di valutazione modulo',
        summary: 'Valuta correttezza logica, leggibilita, riusabilita e performance delle query.',
        criteria: ['Correttezza.', 'Leggibilita.', 'Riuso.', 'Performance.'],
      },
    },
    examSummary: {
      title: 'Esame modulo: professional SQL review',
      format: 'Pacchetto di query con code review e difesa del reasoning.',
      checkpoints: ['Logical plan chiaro.', 'Query corrette.', 'Performance difese.', 'Pattern riusabili.'],
    },
    coreLessons: [
      { title: 'Ordine logico di esecuzione: come pensa una query' },
      { title: 'Join avanzate, semi-join, anti-join e logica insiemistica' },
      { title: 'Window functions: ranking e deduplicazione' },
      { title: 'LAG, LEAD e totali cumulativi: analisi sequenziale' },
      { title: 'Analisi di coorte in SQL: la matrice di retention' },
      { title: 'FIRST_VALUE, LAST_VALUE, NTILE e frame di finestra' },
      { title: 'Sessionizzazione e raggruppamento comportamentale' },
      { title: 'Date spine e metriche temporali in SQL' },
      { title: 'Coorti, attribuzione e percorsi in SQL' },
      { title: 'Funnel in SQL: passi in sequenza e finestre di conversione' },
      { title: 'Pivot, ROLLUP e KPI table per il reporting' },
      { title: 'Anomalie, Pareto e segmentazione RFM in SQL' },
      { title: 'Test, refactoring e pattern SQL riusabili' },
      { title: 'Caso studio: tre domande sulle stesse tabelle sporche' },
    ],
  },
  {
    id: 'matematica-analisi-dati',
    title: "Matematica per l'analisi dei dati",
    description:
      'Inserisce il rigore matematico che rende piu leggibili modelli, inferenza, forecasting e regressioni applicate.',
    objective: 'Inserire il rigore matematico che porta il corso davvero in fascia alta.',
    phase: 'rigor',
    prerequisites: ['Moduli 3 e 14 consigliati: metriche e SQL avanzato.', 'Disponibilita a lavorare con formule, notazione e ragionamento astratto applicato.'],
    seoTitle: "Matematica per l'analisi dei dati | GinnyTech",
    seoDescription:
      'Vettori, matrici, probabilita, CLT, Bayes, stima, test d ipotesi e regressione intuitiva per analisti rigorosi.',
    seoKeywords: ['matematica analytics', 'probabilita', 'bayes', 'clt', 'regressione', 'inferenza'],
    icon: 'BrainCircuit',
    color: 'from-sky-400 to-indigo-500',
    completionPack: {
      assignment: {
        title: 'Assignment: problem set quantitativo',
        summary: 'Risolvi un set di problemi su geometria del dato, probabilita, inferenza e regressione intuitiva.',
        deliverables: ['Soluzioni annotate.', 'Interpretazioni business.', 'Error analysis.', 'Glossario formule.'],
      },
      caseStudy: {
        title: 'Caso studio end-to-end: matematica che cambia la decisione',
        summary: 'Mostra come il rigore quantitativo migliori forecast, test ed interpretazione di modelli in un caso reale.',
        deliverables: ['Formalizzazione.', 'Calcoli.', 'Interpretazione.', 'Raccomandazione finale.'],
      },
      cheatSheet: {
        title: 'Cheat sheet: matematica per analisti',
        summary: 'Riepilogo compatto di formule, definizioni, intuizioni geometriche e regole decisionali.',
        deliverables: ['Formule chiave.', 'Intuizioni.', 'Errori tipici.'],
      },
      rubric: {
        title: 'Rubrica di valutazione modulo',
        summary: 'Valuta correttezza formale, capacita interpretativa e collegamento tra matematica e decisioni sui dati.',
        criteria: ['Correttezza.', 'Interpretazione.', 'Rigore.', 'Trasferimento al business.'],
      },
    },
    examSummary: {
      title: 'Esame modulo: problem set con oral defense',
      format: 'Problem set finale con soluzioni guidate e breve difesa orale delle scelte interpretative.',
      checkpoints: ['Notazione corretta.', 'Calcolo corretto.', 'Interpretazione solida.', 'Collegamento ai dati reali.'],
    },
    coreLessons: [
      { title: 'Vettori, matrici e geometria del dato' },
      { title: 'Similarità, distanze e trasformazioni lineari' },
      { title: 'Probabilità: assiomi, eventi e condizionamento' },
      { title: 'Distribuzioni, valore atteso, varianza e covarianza' },
      { title: 'Teorema di Bayes e aggiornamento delle credenze' },
      { title: "Test d'ipotesi: logica, non rituale" },
      { title: 'Stima, errore standard e intervalli di confidenza' },
      { title: 'Legge dei grandi numeri e teorema del limite centrale' },
      { title: 'Regressione: geometria e ottimizzazione' },
      { title: 'Problem set finale con soluzioni guidate' },
    ],
  },
  {
    id: 'analytics-engineering',
    title: 'Analytics engineering con dbt',
    description:
      'Trasforma dati grezzi in modelli affidabili, riusabili e governati con layering, test, contracts e semantic layer.',
    objective: 'Trasformare i dati grezzi in modelli affidabili, riusabili e governati.',
    phase: 'rigor',
    prerequisites: ['Moduli 9, 10 e 14 consigliati: warehouse, lakehouse e SQL avanzato.', 'Conoscenza base di git, modeling e workflow di trasformazione dati.'],
    seoTitle: 'Corso analytics engineering con dbt: modelli, test, metriche',
    seoDescription:
      'Impara analytics engineering con dbt: staging, marts, test, contratti dati, lineage e semantic layer. Lezioni gratuite con esempi su dati di marketing.',
    seoKeywords: ['analytics engineering', 'dbt', 'semantic layer', 'data contracts', 'lineage', 'reverse etl'],
    icon: 'GitMerge',
    color: 'from-emerald-500 to-blue-500',
    completionPack: {
      assignment: {
        title: 'Assignment: mini analytics stack',
        summary: 'Costruisci un mini stack analytics engineering con staging, intermediate, marts, test e metric definitions.',
        deliverables: ['Project structure.', 'Tests.', 'Lineage notes.', 'Release checklist.'],
      },
      caseStudy: {
        title: 'Caso studio end-to-end: analytics stack completo',
        summary: 'Trasforma fonti eterogenee in modelli affidabili e attivabili con governance sostenibile.',
        deliverables: ['Layer design.', 'Contracts.', 'Semantic layer.', 'Activation notes.'],
      },
      cheatSheet: {
        title: 'Cheat sheet: analytics engineering',
        summary: 'Promemoria rapido per layering, materializations, tests, lineage, releases e activation layer.',
        deliverables: ['Naming rules.', 'Test matrix.', 'Review checklist.'],
      },
      rubric: {
        title: 'Rubrica di valutazione modulo',
        summary: 'Valuta qualita dei modelli, disciplina dei test e sostenibilita della collaborazione tecnica.',
        criteria: ['Layering.', 'Quality checks.', 'Governance.', 'Deploy discipline.'],
      },
    },
    examSummary: {
      title: 'Esame modulo: analytics engineering stack review',
      format: 'Review tecnica del progetto dbt con semantic layer, tests e piano di deploy.',
      checkpoints: ['Layer corretti.', 'Tests presenti.', 'Lineage chiaro.', 'Semantic layer difendibile.'],
    },
    coreLessons: [
      { title: "Che cos'è davvero l'analytics engineering" },
      { title: 'Layering in dbt: staging, intermediate e marts' },
      { title: 'Fondamenti di dbt e struttura del progetto' },
      { title: 'Test, data contract e fiducia nei modelli' },
      { title: 'Snapshot e slowly changing dimensions' },
      { title: 'Materializzazioni in dbt: view, table e incremental' },
      { title: 'Semantic layer e definizioni delle metriche' },
      { title: 'Git workflow e code review per progetti dbt' },
      { title: 'Ambienti, deploy e disciplina di rilascio' },
      { title: 'Performance e costi delle trasformazioni dbt' },
      { title: 'Reverse ETL e activation layer con dbt' },
      { title: 'Cheat sheet: analytics engineering con dbt' },
      { title: 'Progetto: un mini analytics stack completo' },
    ],
  },
  {
    id: 'significativita-statistica',
    title: 'Significatività statistica e A/B test',
    description:
      'Porta la sperimentazione a livello serio con design causale, power planning, variance reduction e governance.',
    objective: 'Portare la sperimentazione a livello serio, non da checklist.',
    phase: 'rigor',
    prerequisites: ['Moduli 3, 5, 8 e 15 consigliati: metriche, product diagnostics, modelli e matematica.', 'Conoscenza base di probabilita e interpretazione dei test.'],
    seoTitle: 'Significatività statistica e A/B test | GinnyTech',
    seoDescription:
      'Disegno sperimentale, randomizzazione, A/A, power, CUPED, peeking, Bayesian A/B, switchback test e governance.',
    seoKeywords: ['ab testing', 'experiment science', 'power analysis', 'cuped', 'bayesian ab', 'switchback'],
    icon: 'FlaskConical',
    color: 'from-fuchsia-500 to-rose-400',
    completionPack: {
      assignment: {
        title: 'Assignment: experimentation plan',
        summary: 'Disegna un esperimento professionale con ipotesi, metriche, sample size, governance e piano di analisi.',
        deliverables: ['Hypothesis sheet.', 'Randomization plan.', 'Power calculation.', 'Analysis template.'],
      },
      caseStudy: {
        title: 'Caso studio end-to-end: governance sperimentale',
        summary: 'Rifai un esperimento mal progettato, correggendo bias, peeking e interpretazioni sbagliate.',
        deliverables: ['Diagnosis.', 'Revised design.', 'Risk controls.', 'Decision memo.'],
      },
      cheatSheet: {
        title: 'Cheat sheet: experimentation science',
        summary: 'Riepilogo di potenza, MDE, p-value, CUPED, peeking, Bayesian A/B e geo-test.',
        deliverables: ['Checklist.', 'Formule.', 'Decision rules.'],
      },
      rubric: {
        title: 'Rubrica di valutazione modulo',
        summary: 'Valuta rigore del design, correttezza inferenziale e qualita della governance sperimentale.',
        criteria: ['Design.', 'Power planning.', 'Interpretazione.', 'Governance.'],
      },
    },
    examSummary: {
      title: 'Esame modulo: full experiment review',
      format: 'Pacchetto di sperimentazione completo con planning, analisi e decisione finale.',
      checkpoints: ['Ipotesi causale.', 'Unit of analysis corretta.', 'Power/MDE.', 'Bias controls.'],
    },
    coreLessons: [
      { title: 'Fondamenti della significatività statistica' },
      { title: 'Domande causali e ipotesi di business ben formulate' },
      { title: 'Disegno sperimentale, randomizzazione e unità di analisi' },
      { title: 'A/A test e validazione del sistema di misura' },
      { title: 'Il flusso completo di un A/B test' },
      { title: 'P-value, errori e interpretazione corretta' },
      { title: 'CUPED e riduzione della varianza' },
      { title: 'Peeking, multiple testing e sequential testing' },
      { title: "Oltre l'A/B classico: bayesiano, switchback e geo-test" },
      { title: 'Governance della sperimentazione' },
    ],
  },
  {
    id: 'direzioni-analitica',
    title: "Direzioni dell'analitica: ruoli e carriera",
    description:
      'Collega i moduli tecnici ai ruoli veri, alle responsabilita economiche e alle scelte di specializzazione professionale.',
    objective: 'Collegare i moduli tecnici ai ruoli veri e alla responsabilita economica.',
    phase: 'direction',
    prerequisites: ['Intero core consigliato fino al modulo 17 o esperienza equivalente.', 'Interesse a collegare analytics, ruoli e accountability economica.'],
    seoTitle: "Direzioni dell'analitica: ruoli e carriera | GinnyTech",
    seoDescription:
      'Ruoli analytics, operating model di funzione, KPI trees, budgeting, storytelling executive e skill ladder per analitica moderna.',
    seoKeywords: ['analytics careers', 'marketing analytics roles', 'product analytics roles', 'finance analytics', 'skill ladder'],
    icon: 'BarChart',
    color: 'from-violet-500 to-sky-400',
    completionPack: {
      assignment: {
        title: 'Assignment: specialization map',
        summary: 'Definisci la tua traiettoria tra marketing, prodotto e finanza con skill gap, portfolio e capstone plan.',
        deliverables: ['Role map.', 'Skill ladder.', 'Portfolio plan.', 'Capstone positioning.'],
      },
      caseStudy: {
        title: 'Caso studio end-to-end: allineare funzioni e responsabilita',
        summary: 'Risolvi un conflitto cross-funzionale su KPI, forecasting e priorita di budget.',
        deliverables: ['Stakeholder map.', 'Decision memo.', 'KPI alignment.', 'Operating model choice.'],
      },
      cheatSheet: {
        title: 'Cheat sheet: direzioni in analitica',
        summary: 'Riepilogo di ruoli, KPI, rituali, decisioni economiche e criteri di seniority.',
        deliverables: ['Role summary.', 'KPI map.', 'Career questions.'],
      },
      rubric: {
        title: 'Rubrica di valutazione modulo',
        summary: 'Valuta chiarezza di posizionamento, comprensione dei ruoli e qualita delle scelte di specializzazione.',
        criteria: ['Role clarity.', 'Economic reasoning.', 'Stakeholder handling.', 'Portfolio direction.'],
      },
    },
    examSummary: {
      title: 'Esame modulo: career and operating model defense',
      format: 'Colloquio simulato con business case, skill ladder e scelta di specializzazione.',
      checkpoints: ['Ruolo scelto.', 'Responsabilita economiche comprese.', 'Operating model giustificato.', 'Portfolio coerente.'],
    },
    coreLessons: [
      { title: "Mappa dei ruoli nell'analitica moderna" },
      { title: 'Operating model della marketing analytics' },
      { title: 'Finance analytics, FP&A e controllo di gestione' },
      { title: 'Operating model della product analytics' },
      { title: 'Unit economics, CAC, LTV e marginalità' },
      { title: 'KPI tree per funzione: differenze e intersezioni' },
      { title: 'A/B test nel lavoro del product analyst' },
      { title: 'Forecasting e cicli di pianificazione' },
      { title: 'Hiring rubric, skill ladder e seniority' },
      { title: 'Storytelling per executive e board' },
      { title: 'Allocare il budget: decisioni di portafoglio' },
      { title: 'Gestire i conflitti tra stakeholder' },
      { title: 'Come scegliere specializzazione, portfolio e capstone' },
      { title: "Cheat sheet: ruoli e direzioni dell'analitica" },
    ],
  },
  {
    id: 'filosofia-analisi-dati',
    title: "Fondamenti filosofici dell'analisi dei dati",
    description:
      'Dai profondita epistemologica, causale e critica al lavoro sui dati, collegando evidenza, modelli, rischio e responsabilita.',
    objective: 'Dare profondita epistemologica, causale e critica al corso.',
    phase: 'direction',
    prerequisites: ['Modulo 17 consigliato: experimentation science.', 'Disponibilita a lavorare su causalita, assunzioni, rischio e lettura critica dei modelli.'],
    seoTitle: "Fondamenti filosofici dell'analisi dei dati | GinnyTech",
    seoDescription:
      'Evidenza, spiegazione, controfattuali, misspecification, measurement theory, Goodhart, etica e lettura critica di esperimenti e dashboard.',
    seoKeywords: ['filosofia dei dati', 'causalita', 'measurement theory', 'goodhart', 'epistemologia', 'evidenza'],
    icon: 'BrainCircuit',
    color: 'from-cyan-500 to-indigo-500',
    completionPack: {
      assignment: {
        title: 'Assignment: critical reasoning memo',
        summary: 'Scrivi un memo critico su un analisi reale, esplicitando assunzioni, rischi, causalita e limiti epistemici.',
        deliverables: ['Analisi critica.', 'Assumption map.', 'Risk register.', 'Decision guidance.'],
      },
      caseStudy: {
        title: 'Caso studio end-to-end: pensare bene con i dati',
        summary: 'Applica causalita, measurement theory e responsabilita decisionale a un caso business complesso.',
        deliverables: ['Evidence review.', 'Counterfactual framing.', 'Bias scan.', 'Recommendation.'],
      },
      cheatSheet: {
        title: 'Cheat sheet: filosofia applicata ai dati',
        summary: 'Promemoria di evidenza, correlazione vs causalita, modelli, rischio, Goodhart ed etica analitica.',
        deliverables: ['Concetti chiave.', 'Domande critiche.', 'Anti-pattern cognitivi.'],
      },
      rubric: {
        title: 'Rubrica di valutazione modulo',
        summary: 'Valuta profondita del ragionamento, chiarezza sulle assunzioni e responsabilita nell uso dei risultati.',
        criteria: ['Rigore concettuale.', 'Chiarezza causale.', 'Lettura critica.', 'Responsabilita decisionale.'],
      },
    },
    examSummary: {
      title: 'Esame modulo: saggio finale o oral exam',
      format: 'Saggio argomentativo o colloquio strutturato su evidenza, causalita, modelli e responsabilita.',
      checkpoints: ['Definizione di evidenza.', 'Controfattuale chiaro.', 'Assunzioni esplicitate.', 'Responsabilita decisionale.'],
    },
    coreLessons: [
      { title: "Mappa del modulo: filosofia per l'analisi dei dati" },
      { title: 'Che cosa conta come evidenza' },
      { title: 'Aristotele e le quattro cause di una metrica' },
      { title: 'David Hume: esperienza, abitudine mentale e scetticismo' },
      { title: 'Francis Bacon: induzione e idoli della mente' },
      { title: "Immanuel Kant: causalità come categoria dell'intelletto" },
      { title: 'Karl Popper: falsificabilità e sperimentazione' },
      { title: 'Thomas Kuhn: paradigmi scientifici e cultura del dato' },
      { title: 'Judea Pearl: DAG e rivoluzione causale' },
      { title: "Frequentisti e bayesiani: due letture dell'incertezza" },
      { title: 'Epistemologia dei dati: cosa puoi davvero sapere' },
      { title: 'Etica degli algoritmi e responsabilità analitica' },
      { title: 'Correlazione, causalità e controfattuali' },
      { title: 'Modelli, assunzioni e misspecification' },
      { title: 'Measurement theory: cosa significa misurare bene' },
      { title: 'Paradosso di Simpson e confounding' },
      { title: 'Metodo scientifico applicato al lavoro sui dati' },
      { title: 'Incertezza, rischio e ignoranza' },
      { title: "Dalla causalità classica al futuro dell'analisi dati" },
      { title: 'Caso studio: pensiero filosofico e decisione di business' },
    ],
  },
  {
    id: 'ai-data-workflows',
    title: 'AI assistita per il lavoro sui dati',
    description:
      'Usa AI generativa e AutoML per accelerare analisi, pipeline, feature e decision memo senza perdere controllo, qualita e ownership.',
    objective: 'Applicare AI al lavoro sui dati come sistema controllato, non come scorciatoia opaca.',
    phase: 'direction',
    prerequisites: ['Modulo 19 consigliato: causalita, evidenza e responsabilita analitica.', 'Esperienza con analisi, SQL, metriche e architetture dati del percorso core.'],
    seoTitle: 'AI assistita per il lavoro sui dati | GinnyTech',
    seoDescription:
      'Modulo GinnyTech su AI per data work: prompting analitico, EDA assistita, SQL, data quality, data engineering, AutoML, leakage, drift e casi end-to-end.',
    seoKeywords: ['ai data analytics', 'ai data engineering', 'automl', 'prompting analitico', 'ai assisted analytics'],
    icon: 'BrainCircuit',
    color: 'from-teal-400 to-amber-400',
    completionPack: {
      assignment: {
        title: 'Assignment: workflow AI-assisted per data work',
        summary: 'Disegna un workflow controllato che usa AI per accelerare analisi, documentazione, feature o AutoML con review umana.',
        deliverables: ['Decision brief.', 'Prompt e controlli.', 'Risk register.', 'Output revisionabile.'],
      },
      caseStudy: {
        title: 'Caso studio end-to-end: AI-assisted analytics workflow',
        summary: 'Applica AI a un caso churn, forecasting o funnel diagnostics, separando supporto automatico e responsabilita analitica.',
        deliverables: ['Problem framing.', 'Controlli dati.', 'Model/analysis review.', 'Decision memo.'],
      },
      cheatSheet: {
        title: 'Cheat sheet: AI per data work',
        summary: 'Regole rapide per decidere cosa delegare all AI, cosa controllare e quando fermare il workflow.',
        deliverables: ['Checklist.', 'Prompt patterns.', 'Failure modes.'],
      },
      rubric: {
        title: 'Rubrica di valutazione modulo',
        summary: 'Valuta qualita del workflow, controlli su dati e modello, chiarezza dell ownership e utilita della decisione finale.',
        criteria: ['Decisione chiara.', 'Controlli robusti.', 'Uso appropriato dell AI.', 'Output revisionabile.'],
      },
    },
    examSummary: {
      title: 'Esame modulo: AI-assisted data workflow review',
      format: 'Pacchetto con workflow, prompt, controlli, output analitico e decision memo finale.',
      checkpoints: ['Scope AI esplicito.', 'Quality gates.', 'Baseline manuale.', 'Rischi e monitoraggio.'],
    },
    coreLessons: [
      { title: 'AI come acceleratore del lavoro sui dati' },
      { title: 'Prompting analitico e controllo delle domande' },
      { title: "Analisi esplorativa assistita dall'AI" },
      { title: 'SQL, notebook e data storytelling con AI' },
      { title: 'Data cleaning, data quality e feature engineering' },
      { title: 'AI per data engineering, mapping e documentazione' },
      { title: 'AutoML per classificazione, regressione e forecasting' },
      { title: 'Valutazione: leakage, drift, metriche e limiti' },
      { title: "Caso studio: un workflow end-to-end assistito dall'AI" },
      { title: 'Cheat sheet: AI per il lavoro sui dati' },
    ],
  },
  {
    id: 'agentic-ai-data-workflows',
    title: 'Agentic AI per il lavoro sui dati',
    description:
      'Progetta workflow agentici per analisi, SQL, pipeline, AutoML e analytics operations con tool, stato, guardrail, eval e approval.',
    objective: 'Costruire workflow agentici utili e osservabili per data work professionale.',
    phase: 'direction',
    prerequisites: ['Modulo 20 consigliato: AI-assisted data work e AutoML.', 'Conoscenza di semantic layer, pipeline dati, valutazione modelli e governance.'],
    seoTitle: 'Agentic AI per il lavoro sui dati | GinnyTech',
    seoDescription:
      'Modulo GinnyTech su agentic AI per data work: tool, state, memory, handoff, human approval, agentic SQL, AutoML, observability, eval e cost control.',
    seoKeywords: ['agentic ai data analytics', 'ai agents data engineering', 'agentic automl', 'human in the loop', 'ai workflow governance'],
    icon: 'GitMerge',
    color: 'from-violet-500 to-cyan-400',
    completionPack: {
      assignment: {
        title: 'Assignment: agentic analytics workflow',
        summary: 'Disegna un workflow agentico con ruoli, tool, stato, guardrail, approval e metriche di osservabilita.',
        deliverables: ['Workflow map.', 'Tool policy.', 'Approval gates.', 'Eval plan.'],
      },
      caseStudy: {
        title: 'Caso studio end-to-end: agentic analytics operations',
        summary: 'Progetta un sistema agentico per metric review, incidenti dati, query controllate e raccomandazioni operative.',
        deliverables: ['System design.', 'Runbook.', 'Trace/eval plan.', 'Decision memo.'],
      },
      cheatSheet: {
        title: 'Cheat sheet: agentic AI per data work',
        summary: 'Checklist operativa per usare agenti su dati con sicurezza, limiti, logging e fallback.',
        deliverables: ['Guardrail checklist.', 'Approval matrix.', 'Failure modes.'],
      },
      rubric: {
        title: 'Rubrica di valutazione modulo',
        summary: 'Valuta utilita del workflow, confini degli agenti, osservabilita, sicurezza, controllo costi e qualita degli handoff.',
        criteria: ['Tool boundaries.', 'Human approval.', 'Observability.', 'Cost and risk control.'],
      },
    },
    examSummary: {
      title: 'Esame modulo: agentic data workflow defense',
      format: 'Review architetturale di un workflow agentico con trace, eval, policy strumenti e rollout controllato.',
      checkpoints: ['Tool scope chiaro.', 'State e handoff.', 'Guardrail testati.', 'Rollback e owner finale.'],
    },
    coreLessons: [
      { title: 'Da AI assistita ad agentic AI nel lavoro sui dati' },
      { title: 'Tool, stato, memoria, handoff e guardrail' },
      { title: 'Agentic data analysis con controlli umani' },
      { title: 'Agentic SQL e semantic layer con approvazione umana' },
      { title: 'Agentic data engineering: pipeline, runbook e incidenti' },
      { title: 'Agentic AutoML: planning, training, review e deploy' },
      { title: 'Multi-agent workflow: analyst, engineer, reviewer, owner' },
      { title: 'Observability, eval, sicurezza e controllo dei costi' },
      { title: 'Caso studio: sistema agentico per analytics operations' },
      { title: 'Cheat sheet: agentic AI per il lavoro sui dati' },
    ],
  },
];
