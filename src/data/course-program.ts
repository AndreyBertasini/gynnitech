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
    title: 'Applicazione Business',
    description: 'Prodotto, marketing, dashboard e modelli decisionali applicati a problemi reali di crescita.',
  },
  {
    id: 'stack',
    title: 'Infrastruttura e Stack',
    description: 'Warehouse, lakehouse, streaming, realtime e disciplina operativa per sistemi analitici affidabili.',
  },
  {
    id: 'rigor',
    title: 'Rigore Quantitativo',
    description: 'SQL avanzato, matematica, analytics engineering e experiment science per alzare il livello del corso.',
  },
  {
    id: 'direction',
    title: 'Direzione e Profondita',
    description: 'Ruoli, responsabilita economica, causalita e lettura critica dei dati in contesti decisionali complessi.',
  },
];

export const COURSE_CAPSTONE: CourseCapstone = {
  title: 'Costruire un sistema completo di Marketing Data & Analytics Engineering',
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
    title: 'Growth & Marketing Measurement',
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
    title: 'Product & Experimentation',
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
    title: 'Data Platform & Analytics Engineering',
    summary:
      'Track finale per chi vuole progettare lo stack analitico end-to-end, dal tracking al warehouse fino al serving layer.',
    moduleIds: ['data-collection', 'data-warehousing', 's3-data-lake', 'kafka-streaming', 'real-time-analytics', 'infrastructure-ops', 'advanced-sql', 'analytics-engineering'],
    outcomes: [
      'Disegnare architetture analitiche scalabili con contratti, QA e osservabilita.',
      'Costruire modelli dati riusabili con dbt e semantic layer.',
      'Sostenere pipeline batch e realtime con disciplina operativa.',
    ],
  },
];

export const COURSE_MODULES: CourseModule[] = [
  {
    id: 'panoramica',
    title: 'Panoramica del Corso e Metodo di Studio per Data Work',
    description:
      'Trasforma il corso da catalogo a sistema cognitivo, con metodo di studio, memoria tecnica e piano di output professionali.',
    objective: 'Trasformare il corso da catalogo a sistema cognitivo.',
    phase: 'foundation',
    prerequisites: [],
    seoTitle: 'Panoramica del Corso e Metodo di Studio per Data Work | GinnyTech',
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
      { title: 'Come funziona il percorso: mappa completa del corso' },
      { title: 'Come si studia materiale tecnico senza dimenticarlo' },
      { title: 'First principles: come ragiona un analista forte' },
      { title: 'Dalla domanda di business alla domanda analitica' },
      { title: 'Come prendere appunti tecnici, versionare idee e costruire memoria' },
      { title: 'Reproducibility mindset: rigore prima della velocita' },
      { title: 'Portfolio, capstone e output professionali del corso' },
      { title: 'Skill diagnostic iniziale e piano di studio personalizzato' },
    ],
  },
  {
    id: 'data-collection',
    title: 'Data Collection & Tracking Systems',
    description:
      'Passa da tag e strumenti isolati a sistemi di misura affidabili, governati e osservabili.',
    objective: 'Passare da "mettere tag" a progettare sistemi di misura affidabili.',
    phase: 'foundation',
    prerequisites: ['Modulo 1 completato o equivalente: metodo di studio e logica del percorso.', 'Conoscenza di base di funnel, eventi e KPI digitali.'],
    seoTitle: 'Data Collection & Tracking Systems | GinnyTech',
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
      { title: 'Measurement architecture: cosa misurare e perche' },
      { title: 'Event taxonomy, naming conventions e governance' },
      { title: 'Identity resolution: user, session, device, customer' },
      { title: 'Tracking client-side, server-side e hybrid tracking' },
      { title: 'Privacy by design: consenso, minimizzazione, conformita' },
      { title: 'Tracking spec, data contracts e documentazione tecnica' },
      { title: 'QA, A/A test, osservabilita e affidabilita del tracking' },
      { title: 'Lab: progettare da zero un piano di tracking professionale' },
    ],
  },
  {
    id: 'metriche-fondamenti',
    title: 'Metriche, KPI Trees e Fondamenti Analitici',
    description:
      'Impara a leggere i numeri come sistemi, con KPI tree, unit economics, baseline corrette e lettura causale dei segnali.',
    objective: 'Far leggere i numeri come sistemi, non come dashboard isolate.',
    phase: 'foundation',
    prerequisites: ['Modulo 2 consigliato: basi di tracking e measurement architecture.', 'Familiarita di base con tassi, medie e concetti di business digitale.'],
    seoTitle: 'Metriche, KPI Trees e Fondamenti Analitici | GinnyTech',
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
      { title: 'Guardrail metrics, counter-metrics e failure metrics' },
      { title: 'Cohort logic, segmentazione e baseline corrette' },
      { title: 'Segnale, rumore, variazione normale e falsi allarmi' },
      { title: 'Correlazione, proxy metric e lettura causale dei KPI' },
      { title: '"Lab: rifare il framework metrico di un business reale"' },
    ],
  },
  {
    id: 'gestione-data-driven',
    title: 'Gestione Data-Driven e Operating System Decisionale',
    description:
      'Porta i dati nel modo quotidiano di decidere con cadence, governance, decision memo e allineamento tra funzioni.',
    objective: 'Inserire i dati nel modo quotidiano di decidere.',
    phase: 'foundation',
    prerequisites: ['Moduli 2-3 consigliati: measurement e basi metriche.', 'Esperienza minima con riunioni, priorita o processi decisionali di team.'],
    seoTitle: 'Gestione Data-Driven e Operating System Decisionale | GinnyTech',
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
      { title: 'PDCA, OODA, HADI e sistemi di miglioramento continuo' },
      { title: 'Hypothesis backlog e priorita delle domande da testare' },
      { title: 'Decision memo: come si scrive una decisione rigorosa' },
      { title: 'Research ops: come raccogliere evidenze senza caos' },
      { title: 'Cadence operative: weekly review, metric review, retro' },
      { title: 'Allineamento tra marketing, prodotto, finance e leadership' },
      { title: 'Org design analytics: embedded, centralized, federated' },
      { title: 'Governance della sperimentazione e ownership decisionale' },
      { title: 'Etica pratica della decisione data-driven' },
    ],
  },
  {
    id: 'analisi-prodotto',
    title: 'Product Analytics e Growth Diagnostics',
    description:
      'Leggi dove il prodotto crea valore, attrito o perdita con funnel, retention, activation e monetization analytics.',
    objective: 'Leggere dove il prodotto crea valore, frizione o perdita.',
    phase: 'application',
    prerequisites: ['Moduli 2-4 consigliati: measurement, metriche e operating system decisionale.', 'Conoscenza base di funnel e ciclo di vita utente.'],
    seoTitle: 'Product Analytics e Growth Diagnostics | GinnyTech',
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
      { title: 'Retention e analisi di coorte nel prodotto' },
      { title: 'Customer development per product analytics' },
      { title: 'Analisi di coorte e behavioral cohorts' },
      { title: 'UX research e dati comportamentali' },
      { title: '"NPS e soddisfazione: Net Promoter Score senza superstizioni"' },
      { title: 'A/B testing per prodotto' },
      { title: 'Prioritizzazione feature con dati' },
      { title: '"Product-market fit: segnali, metriche e falsi positivi"' },
      { title: '"Caso studio: analisi prodotto completa"' },
      { title: 'Cheat Sheet — Analisi di Prodotto' },
    ],
  },
  {
    id: 'analisi-marketing',
    title: 'Marketing Analytics, Incrementality e Unit Economics',
    description:
      'Porta il marketing da reporting a disciplina quantitativa seria con incrementality, unit economics e review decisionali.',
    objective: 'Portare il marketing da reporting a disciplina quantitativa seria.',
    phase: 'application',
    prerequisites: ['Moduli 2-4 consigliati: tracking, metriche e governance decisionale.', 'Familiarita con canali, campagne e funnel marketing.'],
    seoTitle: 'Marketing Analytics, Incrementality e Unit Economics | GinnyTech',
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
      { title: 'Measurement architecture per il marketing' },
      { title: 'UTM discipline e qualita dei metadati' },
      { title: 'Click IDs, campaign IDs e stitching cross-platform' },
      { title: 'Paid, owned, earned: mappa completa dei canali' },
      { title: 'Funnel marketing: reach, click, lead, activation, revenue' },
      { title: 'CAC, LTV, payback, contribution margin' },
      { title: 'Attribution basics: perche i modelli semplici ingannano' },
      { title: 'Last click, first click, linear, time decay: limiti reali' },
      { title: 'Incrementality: misurare cio che il marketing causa davvero' },
      { title: 'Geo-experiments e holdout geografici' },
      { title: 'CRM, lifecycle, reactivation e retention marketing' },
      { title: 'Lead quality e scoring commerciale' },
      { title: 'Creative analytics: misurare messaggio, non solo canale' },
      { title: 'Landing page analytics e intent matching' },
      { title: 'Saturazione dei canali e rendimenti decrescenti' },
      { title: 'Budget allocation e marginal ROI' },
      { title: 'Media mix modeling: logica, limiti, prerequisiti' },
      { title: 'Affiliate e partner measurement' },
      { title: 'Brand vs performance: lettura integrata' },
      { title: 'Frodi, contaminazione dati e reporting sporco' },
      { title: 'Executive marketing dashboard e review decisionale' },
      { title: 'Caso studio: rifare il sistema di misura di un team marketing' },
    ],
  },
  {
    id: 'dashboard-visualizzazione',
    title: 'Dashboard, Visualization e Decision Interface',
    description:
      'Costruisci dashboard che fanno decidere, con gerarchia visiva, semantic consistency, alerting e contesto operativo.',
    objective: 'Costruire dashboard che fanno decidere, non solo guardare.',
    phase: 'application',
    prerequisites: ['Moduli 3 e 6 consigliati: metriche e marketing analytics.', 'Capacita base di leggere grafici e report tabellari.'],
    seoTitle: 'Dashboard, Visualization e Decision Interface | GinnyTech',
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
      { title: 'Decision-first dashboard design' },
      { title: 'Percezione visiva, gerarchia e carico cognitivo' },
      { title: 'Semantic consistency: definizioni metriche e trust' },
      { title: 'Drill-down, segmentazione e navigabilita' },
      { title: 'Annotazioni, storytelling e contesto operativo' },
      { title: 'Alerting, anomaly review e gestione dell urgenza' },
      { title: 'Dashboard per executive vs dashboard per operatori' },
      { title: 'Lab: redesign completo di una dashboard debole' },
    ],
  },
  {
    id: 'marketing-data-science',
    title: 'Marketing Data Science, Forecasting e Decision Models',
    description:
      'Introduce modelli utili al business, distinguendo prediction, causation, scenario planning e model risk.',
    objective: 'Introdurre modelli utili, non "ML cosmetico".',
    phase: 'application',
    prerequisites: ['Moduli 3, 6 e 7 consigliati: metriche, marketing analytics e dashboard.', 'Comfort minimo con probabilita, segmentazione o modelli base.'],
    seoTitle: 'Marketing Data Science, Forecasting e Decision Models | GinnyTech',
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
      { title: 'Prediction vs causation: due mondi diversi' },
      { title: 'Le trappole analitiche piu comuni' },
      { title: 'Segmentazione: da RFM a clustering ragionato' },
      { title: 'Customer heterogeneity e segmenti utili al business' },
      { title: 'Churn propensity e priorita d intervento' },
      { title: 'Survival analysis introduttiva' },
      { title: 'Forecasting: trend, seasonality, noise' },
      { title: 'Time series decomposition per business data' },
      { title: 'Scenario planning e forecasting decisionale' },
      { title: 'Uplift modeling: chi persuadere davvero' },
      { title: 'Propensity vs incrementality' },
      { title: 'Bayesian updating per marketing decisions' },
      { title: 'Multi-armed bandits per ottimizzazione continua' },
      { title: 'Esperimenti + modelli: come convivono' },
      { title: 'Recommendation e ranking: intuizione e limiti' },
      { title: 'Model evaluation: calibration, lift, business value' },
      { title: 'Drift, model decay e monitoraggio' },
      { title: 'Etica, bias e model risk management' },
      { title: 'Caso studio: growth model end-to-end' },
    ],
  },
  {
    id: 'data-warehousing',
    title: 'Data Warehousing & Analytical Architecture',
    description:
      'Capisci davvero come si progetta un sistema analitico scalabile con grain corretto, storicizzazione e trade-off architetturali.',
    objective: 'Far capire davvero come si progetta un sistema analitico scalabile.',
    phase: 'stack',
    prerequisites: ['Moduli 2-3 consigliati: tracking e metriche.', 'Comfort minimo con tabelle, pipeline batch e concetti di modellazione dati.'],
    seoTitle: 'Data Warehousing & Analytical Architecture | GinnyTech',
    seoDescription:
      'OLTP vs OLAP, dimensional modeling, snapshot, SCD, batch pipelines e trade-off architetturali per warehouse moderni.',
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
      { title: 'Anatomia di un analytical system' },
      { title: 'OLTP vs OLAP: implicazioni reali' },
      { title: 'Dimensional modeling: facts, dimensions, grain' },
      { title: 'Snapshot, SCD e storicizzazione corretta' },
      { title: 'Batch pipelines, idempotenza e consistenza' },
      { title: 'Costi, performance e trade-off architetturali' },
      { title: 'Workshop: disegnare il warehouse di un business reale' },
    ],
  },
  {
    id: 's3-data-lake',
    title: 'S3, Data Lake e Lakehouse Architecture',
    description:
      'Passa da bucket con file a un data lake leggibile, governato e compatibile con i moderni pattern lakehouse.',
    objective: 'Passare da "bucket con file" a un data lake leggibile e governato.',
    phase: 'stack',
    prerequisites: ['Modulo 9 consigliato: data warehousing e concetti architetturali di base.', 'Conoscenza base di storage, file formats e query engines.'],
    seoTitle: 'S3, Data Lake e Lakehouse Architecture | GinnyTech',
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
      { title: 'Parquet, ORC, Avro: quando usare cosa' },
      { title: 'Partitioning strategy e data layout' },
      { title: 'Small files problem, compaction e manutenzione' },
      { title: 'Schema evolution e backward compatibility' },
      { title: 'Iceberg, Delta, Hudi: table formats moderni' },
      { title: 'Metadata catalog e discovery layer' },
      { title: 'Query engines e access patterns' },
      { title: 'Lakehouse architecture: logica e limiti' },
      { title: 'Sicurezza, lifecycle policy e governance' },
      { title: 'Cost optimization e storage economics' },
      { title: 'Lab: progettare un data lake professionale' },
    ],
  },
  {
    id: 'kafka-streaming',
    title: 'Kafka & Event Streaming Engineering',
    description:
      'Insegna la logica del dato come flusso, con schema contracts, stream processing e failure handling realistico.',
    objective: 'Insegnare la logica del dato come flusso, non solo come tabella.',
    phase: 'stack',
    prerequisites: ['Modulo 9 consigliato: basi di architettura analitica.', 'Comfort minimo con code, eventi o integrazioni asincrone.'],
    seoTitle: 'Kafka & Event Streaming Engineering | GinnyTech',
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
      { title: 'Event streaming mental model' },
      { title: 'Topics, partitions, ordering e retention' },
      { title: 'Producer, consumer e consumer groups' },
      { title: 'Schema registry e contracts sui messaggi' },
      { title: 'Idempotenza, exactly-once e realta operativa' },
      { title: 'CDC, outbox pattern e integrazione con sistemi transazionali' },
      { title: 'Stream processing, windowing e state' },
      { title: 'Retry, DLQ, backpressure e failure handling' },
      { title: 'Caso studio: architettura streaming end-to-end' },
    ],
  },
  {
    id: 'real-time-analytics',
    title: 'Real-Time Analytics & ClickHouse Systems',
    description:
      'Trasforma il realtime da slogan a sistema robusto con ingestion pattern, MergeTree thinking e cost control.',
    objective: 'Trasformare il realtime da slogan a sistema robusto.',
    phase: 'stack',
    prerequisites: ['Moduli 9-11 consigliati: warehouse, lakehouse e streaming.', 'Conoscenza base di OLAP, latenza e serving layer.'],
    seoTitle: 'Real-Time Analytics & ClickHouse Systems | GinnyTech',
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
      { title: 'Cosa significa davvero "real-time"' },
      { title: 'ClickHouse engine design e MergeTree thinking' },
      { title: 'Ingestion patterns per analytics realtime' },
      { title: 'Materialized views, rollup e pre-aggregation' },
      { title: 'Late events, deduplica e ordine imperfetto' },
      { title: 'CDC verso mart realtime' },
      { title: 'Dashboard operative e serving layer' },
      { title: 'Performance tuning, partizionamento e cost control' },
      { title: 'Lab: costruire una pipeline realtime affidabile' },
    ],
  },
  {
    id: 'infrastructure-ops',
    title: 'Infrastructure & Ops for Data Systems',
    description:
      'Dai disciplina operativa da ingegneria seria a workload dati, deploy, osservabilita, security e incident response.',
    objective: 'Dare disciplina operativa da ingegneria seria.',
    phase: 'stack',
    prerequisites: ['Moduli 9-12 consigliati: architettura dati, lakehouse, streaming e realtime.', 'Conoscenza base di ambienti, deploy o toolchain di sviluppo.'],
    seoTitle: 'Infrastructure & Ops for Data Systems | GinnyTech',
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
      { title: 'Infrastructure as code e ambienti' },
      { title: 'Docker e packaging dei workload dati' },
      { title: 'CI/CD per SQL, dbt e pipeline' },
      { title: 'Observability, logging, metrics e SLO' },
      { title: 'Incident response e data reliability' },
      { title: 'Secrets, access control e governance costi' },
      { title: 'Runbook, documentazione e operativita sostenibile' },
    ],
  },
  {
    id: 'advanced-sql',
    title: 'Advanced SQL for Analytical Systems',
    description:
      'Usa SQL come linguaggio di ragionamento, non solo di estrazione, con pattern per coorti, funnel, esperimenti e performance.',
    objective: 'Usare SQL come linguaggio di ragionamento, non solo di estrazione.',
    phase: 'rigor',
    prerequisites: ['Moduli 9-13 consigliati: architettura dati e basi di stack analitico.', 'Conoscenza operativa di SELECT, GROUP BY, JOIN e date basics.'],
    seoTitle: 'Advanced SQL for Analytical Systems | GinnyTech',
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
      { title: 'Execution order, logical plans e query thinking' },
      { title: 'Join avanzate, semi-join, anti-join e set logic' },
      { title: 'Window functions: struttura mentale' },
      { title: 'Ranking, lag/lead, cumulative logic e frames' },
      { title: 'Cohort analysis in SQL' },
      { title: 'Funnel analysis in SQL' },
      { title: 'Sessionization e behavioral grouping' },
      { title: 'Esperimenti e A/B analysis in SQL' },
      { title: 'Attribution queries e path analytics' },
      { title: 'JSON, array e semi-structured analytics' },
      { title: 'Date-time pitfalls e timezone correctness' },
      { title: 'EXPLAIN, optimization e performance tuning' },
      { title: 'Testing, refactoring e reusable SQL patterns' },
      { title: 'Lab avanzato: query professionali su casi reali' },
    ],
  },
  {
    id: 'matematica-analisi-dati',
    title: 'Matematica per l Analisi Dati',
    description:
      'Inserisce il rigore matematico che rende piu leggibili modelli, inferenza, forecasting e regressioni applicate.',
    objective: 'Inserire il rigore matematico che porta il corso davvero in fascia alta.',
    phase: 'rigor',
    prerequisites: ['Moduli 3 e 14 consigliati: metriche e SQL avanzato.', 'Disponibilita a lavorare con formule, notazione e ragionamento astratto applicato.'],
    seoTitle: 'Matematica per l Analisi Dati | GinnyTech',
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
      { title: 'Similarita, distanze e trasformazioni lineari' },
      { title: 'Probabilita: assiomi, eventi, condizionamento' },
      { title: 'Distribuzioni, aspettativa, varianza e covarianza' },
      { title: 'Legge dei grandi numeri e teorema del limite centrale' },
      { title: 'Teorema di Bayes e aggiornamento delle credenze' },
      { title: 'Stima, errore standard e intervalli di confidenza' },
      { title: 'Test d ipotesi: logica, non rituale' },
      { title: 'Regressione come geometria + ottimizzazione intuitiva' },
      { title: 'Problem set matematico finale con soluzioni guidate' },
    ],
  },
  {
    id: 'analytics-engineering',
    title: 'Analytics Engineering con dbt e Semantic Layer',
    description:
      'Trasforma dati grezzi in modelli affidabili, riusabili e governati con layering, test, contracts e semantic layer.',
    objective: 'Trasformare i dati grezzi in modelli affidabili, riusabili e governati.',
    phase: 'rigor',
    prerequisites: ['Moduli 9, 10 e 14 consigliati: warehouse, lakehouse e SQL avanzato.', 'Conoscenza base di git, modeling e workflow di trasformazione dati.'],
    seoTitle: 'Analytics Engineering con dbt e Semantic Layer | GinnyTech',
    seoDescription:
      'Layering, dbt fundamentals, tests, contracts, lineage, semantic layer, deployment e governance per analytics engineering moderno.',
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
      { title: 'Che cos e davvero l analytics engineering' },
      { title: 'Layering: staging, intermediate, marts' },
      { title: 'dbt fundamentals e project structure' },
      { title: 'Test, contracts e fiducia nei modelli' },
      { title: 'Snapshot e gestione del cambiamento lento' },
      { title: 'Documentation, lineage e discoverability' },
      { title: 'Semantic layer e metric definitions' },
      { title: 'Git workflow, code review e collaborazione tecnica' },
      { title: 'Environments, deployment e release discipline' },
      { title: 'Performance e cost management nelle trasformazioni' },
      { title: 'Reverse ETL e activation layer' },
      { title: 'Ownership, governance e qualita nel tempo' },
      { title: 'Progetto finale: un mini analytics stack completo' },
    ],
  },
  {
    id: 'significativita-statistica',
    title: 'Significativita Statistica, A/B Testing e Experimentation Science',
    description:
      'Porta la sperimentazione a livello serio con design causale, power planning, variance reduction e governance.',
    objective: 'Portare la sperimentazione a livello serio, non da checklist.',
    phase: 'rigor',
    prerequisites: ['Moduli 3, 5, 8 e 15 consigliati: metriche, product diagnostics, modelli e matematica.', 'Conoscenza base di probabilita e interpretazione dei test.'],
    seoTitle: 'Significativita Statistica, A/B Testing e Experimentation Science | GinnyTech',
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
      { title: 'Fondamenti della significativita statistica' },
      { title: 'Domande causali e ipotesi business ben formulate' },
      { title: 'Disegno sperimentale, randomizzazione e unita di analisi' },
      { title: 'A/A test e validazione del sistema di misura' },
      { title: 'Flusso completo di un A/B test professionale' },
      { title: 'Power, MDE, durata e sample size planning' },
      { title: 'CUPED e variance reduction' },
      { title: 'Peeking, multiple testing e sequential testing' },
      { title: 'Bayesian A/B, switchback test e geo-test' },
      { title: 'Governance sperimentale + caso studio end-to-end' },
    ],
  },
  {
    id: 'direzioni-analitica',
    title: 'Direzioni in Analitica: Marketing, Prodotto, Finanza',
    description:
      'Collega i moduli tecnici ai ruoli veri, alle responsabilita economiche e alle scelte di specializzazione professionale.',
    objective: 'Collegare i moduli tecnici ai ruoli veri e alla responsabilita economica.',
    phase: 'direction',
    prerequisites: ['Intero core consigliato fino al modulo 17 o esperienza equivalente.', 'Interesse a collegare analytics, ruoli e accountability economica.'],
    seoTitle: 'Direzioni in Analitica: Marketing, Prodotto, Finanza | GinnyTech',
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
      { title: 'Mappa dei ruoli in analitica moderna' },
      { title: 'Operating model del marketing analytics' },
      { title: 'Operating model del product analytics' },
      { title: 'Finance analytics, FP&A e controllo economico' },
      { title: 'KPI trees per funzione: differenze e intersezioni' },
      { title: 'Forecasting e planning cycles aziendali' },
      { title: 'Budget decisions e allocazione di portafoglio' },
      { title: 'Storytelling per executive e board' },
      { title: 'Business case e decision memo cross-funzionali' },
      { title: 'Stakeholder conflict management' },
      { title: 'Modelli organizzativi: embedded vs centralized' },
      { title: 'Hiring rubric, skill ladder e seniority' },
      { title: 'Interview cases e simulazioni professionali' },
      { title: 'Come scegliere specializzazione, portfolio e capstone' },
    ],
  },
  {
    id: 'filosofia-analisi-dati',
    title: 'Fondamenti Filosofici dell Analisi dei Dati',
    description:
      'Dai profondita epistemologica, causale e critica al lavoro sui dati, collegando evidenza, modelli, rischio e responsabilita.',
    objective: 'Dare profondita epistemologica, causale e critica al corso.',
    phase: 'direction',
    prerequisites: ['Modulo 17 consigliato: experimentation science.', 'Disponibilita a lavorare su causalita, assunzioni, rischio e lettura critica dei modelli.'],
    seoTitle: 'Fondamenti Filosofici dell Analisi dei Dati | GinnyTech',
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
      { title: "Indice — Fondamenti filosofici dell'analisi dei dati" },
      { title: 'Che cosa conta come evidenza' },
      { title: 'Aristotele e le quattro cause' },
      { title: '"David Hume: esperienza, abitudine mentale e scetticismo"' },
      { title: '"Francis Bacon: induzione e idoli della mente"' },
      { title: '"Immanuel Kant: causalità come categoria dell\'intelletto"' },
      { title: '"Karl Popper: falsificabilità e sperimentazione"' },
      { title: '"Thomas Kuhn: paradigmi scientifici e cultura del dato"' },
      { title: 'Judea Pearl, DAG e rivoluzione causale' },
      { title: "\"Frequentismo vs bayesianismo: due modi di leggere l'incertezza\"" },
      { title: '"Epistemologia dei dati: cosa puoi davvero sapere"' },
      { title: 'Etica degli algoritmi e responsabilità analitica' },
      { title: 'Correlazione, causalità e controfattuali' },
      { title: 'Modelli, assunzioni e misspecification' },
      { title: '"Measurement theory: cosa significa misurare bene"' },
      { title: "Simpson's paradox e confounding" },
      { title: 'Metodo scientifico applicato al lavoro sui dati' },
      { title: 'Incertezza, rischio e ignoranza' },
      { title: "Dalla causalità classica al futuro dell'analisi dati" },
      { title: 'Caso studio: pensiero filosofico e decisione di business' },
    ],
  },
];
