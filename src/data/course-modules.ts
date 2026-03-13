export interface CourseModule {
  id: string;
  title: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  icon: string;
  color: string;
}


export const COURSE_MODULES: CourseModule[] = [
  {
    id: 'panoramica',
    title: 'Panoramica del Corso',
    description: 'Il modulo che ti orienta: cosa impari, come studiare bene, come ricordare e come trasformare il corso in pratica e lavoro.',
    icon: 'Map',
    color: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'data-collection',
    title: 'Data Collection & Tracking',
    description: "Progetti eventi, identita', naming, privacy e QA per raccogliere dati affidabili prima ancora di analizzarli.",
    icon: 'Database',
    color: 'from-teal-500 to-emerald-400'
  },
  {
    id: 'metriche-fondamenti',
    title: 'Metriche e Fondamenti Analitici',
    description: "Impari a scegliere metriche che spiegano il business, distinguere segnali da rumore e leggere i numeri con piu' rigore.",
    icon: 'BarChart',
    color: 'from-green-500 to-emerald-400'
  },
  {
    id: 'gestione-data-driven',
    title: 'Gestione Data-Driven',
    description: 'Porti dati, ricerca e framework decisionali dentro il lavoro quotidiano di team, prodotto, marketing e leadership.',
    icon: 'BrainCircuit',
    color: 'from-indigo-500 to-purple-400'
  },
  {
    id: 'analisi-prodotto',
    title: 'Analisi di Prodotto',
    description: "Dal customer development all'attivazione: impari a leggere comportamento, retention, UX e crescita di un prodotto digitale.",
    icon: 'Activity',
    color: 'from-blue-500 to-cyan-400'
  },
  {
    id: 'analisi-marketing',
    title: 'Analisi di Marketing',
    description: "Misuri canali, funnel, CRM, attribuzione e unit economics per capire cosa genera crescita reale e cosa no.",
    icon: 'Zap',
    color: 'from-orange-500 to-red-400'
  },
  {
    id: 'dashboard-visualizzazione',
    title: 'Dashboard & Data Visualization',
    description: 'Costruisci dashboard, grafici e storie analitiche che aiutano a decidere, non solo a mostrare numeri.',
    icon: 'LayoutDashboard',
    color: 'from-cyan-500 to-blue-400'
  },
  {
    id: 'marketing-data-science',
    title: 'Marketing Data Science',
    description: "Usi modelli, attribuzione, forecasting, segmentazione e sperimentazione per leggere crescita, retention e performance.",
    icon: 'FlaskConical',
    color: 'from-pink-500 to-rose-400'
  },
  {
    id: 'data-warehousing',
    title: 'Data Warehousing & Architecture',
    description: 'Capisci come si struttura un sistema analitico: OLAP, modellazione, motori colonnari e query pensate per scalare.',
    icon: 'Server',
    color: 'from-slate-400 to-zinc-500'
  },
  {
    id: 's3-data-lake',
    title: 'S3 & Data Lake Architecture',
    description: 'Progetti data lake leggibili e sostenibili con object storage, formati colonnari, partizionamento e access pattern corretti.',
    icon: 'HardDrive',
    color: 'from-amber-500 to-yellow-400'
  },
  {
    id: 'kafka-streaming',
    title: 'Kafka & Event Streaming',
    description: "Entri nella logica dell'event streaming: producer, consumer, schema, idempotenza e flussi dati in tempo reale.",
    icon: 'Radio',
    color: 'from-red-500 to-orange-400'
  },
  {
    id: 'real-time-analytics',
    title: 'Real-Time Analytics & ClickHouse',
    description: 'Impari a costruire analytics realtime con ClickHouse, materialized views, CDC e dashboard che reagiscono davvero ai dati.',
    icon: 'Zap',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'infrastructure-ops',
    title: 'Infrastructure & Ops',
    description: 'Porti disciplina operativa nel lavoro dati: CI/CD, monitoraggio, costi, automazione e documentazione tecnica.',
    icon: 'GitMerge',
    color: 'from-gray-400 to-slate-500'
  },
  {
    id: 'advanced-sql',
    title: 'Advanced SQL',
    description: 'SQL usato come strumento analitico maturo: window functions, retention, funnel, sessionizzazione e KPI table robuste.',
    icon: 'Database',
    color: 'from-emerald-400 to-cyan-500'
  },
  {
    id: 'matematica-analisi-dati',
    title: 'Matematica per l\'Analisi Dati',
    description: "La base matematica che rende piu' comprensibili modelli, regressioni, probabilita', inferenza e machine learning applicato.",
    icon: 'BrainCircuit',
    color: 'from-sky-400 to-indigo-500'
  },
  {
    id: 'analytics-engineering',
    title: 'Analytics Engineering',
    description: 'Trasformi sorgenti grezze in modelli dati affidabili con dbt, test, semantic layer, governance e deployment.',
    seoTitle: 'Analytics Engineering con dbt per MarTech | GinnyTech',
    seoDescription: 'Modulo di Analytics Engineering con dbt: staging, marts, test, semantic layer e deploy per trasformare dati MarTech in modelli affidabili.',
    seoKeywords: ['analytics engineering', 'dbt', 'martech', 'semantic layer', 'data modeling', 'data quality'],
    icon: 'GitMerge',
    color: 'from-emerald-500 to-blue-500'
  },
  {
    id: 'significativita-statistica',
    title: 'Significativita\' Statistica & A/B Testing',
    description: "Impari a progettare esperimenti, leggere p-value e intervalli, evitare errori di interpretazione e decidere con piu' rigore.",
    seoTitle: 'Significativita\' Statistica e A/B Testing | GinnyTech',
    seoDescription: 'Modulo su significativita\' statistica e A/B testing: ipotesi, randomizzazione, p-value, sample size, potenza statistica e governance degli esperimenti.',
    seoKeywords: ['significativita statistica', 'a/b testing', 'p-value', 'sample size', 'power analysis', 'esperimenti'],
    icon: 'FlaskConical',
    color: 'from-fuchsia-500 to-rose-400'
  },
  {
    id: 'direzioni-analitica',
    title: 'Direzioni in Analitica: Marketing, Prodotto e Finanza',
    description: "Un modulo per orientarti tra marketing, prodotto e finanza, capire KPI, strumenti e responsabilita' dei diversi ruoli.",
    seoTitle: 'Direzioni in Analitica: Marketing, Prodotto e Finanza | GinnyTech',
    seoDescription: 'Modulo completo su direzioni in analitica: classificazione, strumenti, marketing analytics, product analytics, unit economics, KPI finanziari e controllo di gestione.',
    seoKeywords: ['direzioni analitica', 'marketing analytics', 'product analytics', 'financial analytics', 'unit economics', 'kpi'],
    icon: 'BarChart',
    color: 'from-violet-500 to-sky-400'
  },
  {
    id: 'filosofia-analisi-dati',
    title: "Fondamenti filosofici dell'analisi dei dati",
    description: "Un percorso su causalita', spiegazione, probabilita' e filosofia della scienza per leggere meglio dati, regressioni e decisioni.",
    seoTitle: "Fondamenti filosofici dell'analisi dei dati | GinnyTech",
    seoDescription: "Modulo sui fondamenti filosofici dell'analisi dei dati: radici storiche, Aristotele, Hume, Kant, regressioni, inferenza, previsione e applicazioni a marketing analytics e A/B testing.",
    seoKeywords: ['fondamenti filosofici analisi dati', 'causalita', 'regressione', 'inferenza', 'marketing analytics', 'filosofia della scienza'],
    icon: 'BrainCircuit',
    color: 'from-cyan-500 to-indigo-500'
  }
];
