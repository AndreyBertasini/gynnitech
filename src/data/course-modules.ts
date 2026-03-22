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
    description: "Ti orienta nel percorso: cosa impari, come studiare bene, come ricordare e come trasformare il corso in pratica.",
    seoTitle: 'Panoramica del Corso Data Analytics per Marketing & Business | GinnyTech',
    seoDescription: 'Scopri il corso GinnyTech di data analytics: struttura, moduli, percorso di studio e come trasformare i dati in valore reale per business e marketing.',
    seoKeywords: ['corso data analytics', 'data analytics italiano', 'corso analisi dati', 'ginnytech', 'percorso formativo data'],
    icon: 'Map',
    color: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'data-collection',
    title: 'Data Collection & Tracking',
    description: "Progetti eventi, identita', naming, privacy e QA per raccogliere dati affidabili prima che entrino in dashboard e analisi.",
    seoTitle: 'Data Collection e Tracking: Event Design e Privacy | GinnyTech',
    seoDescription: "Modulo su data collection e tracking: progettazione eventi, naming conventions, identity resolution, privacy GDPR e quality assurance dei dati.",
    seoKeywords: ['data collection', 'event tracking', 'tracking design', 'ga4 eventi', 'privacy dati gdpr', 'data quality'],
    icon: 'Database',
    color: 'from-teal-500 to-emerald-400'
  },
  {
    id: 'metriche-fondamenti',
    title: 'Metriche e Fondamenti Analitici',
    description: "Impari a scegliere metriche che spiegano il business, distinguere segnali da rumore e leggere i numeri con rigore.",
    seoTitle: 'Metriche e Fondamenti Analitici per Business | GinnyTech',
    seoDescription: 'Modulo su metriche e fondamenti analitici: scegliere KPI significativi, distinguere segnali da rumore, north star metric e statistica descrittiva applicata.',
    seoKeywords: ['metriche business', 'kpi analytics', 'fondamenti analisi dati', 'statistica descrittiva', 'north star metric', 'metriche prodotto'],
    icon: 'BarChart',
    color: 'from-green-500 to-emerald-400'
  },
  {
    id: 'gestione-data-driven',
    title: 'Gestione Data-Driven',
    description: "Porti dati, ricerca e framework decisionali dentro il lavoro quotidiano di team, prodotto, marketing e leadership aziendale.",
    seoTitle: 'Gestione Data-Driven: Decision Making e OKR con i Dati | GinnyTech',
    seoDescription: "Modulo su gestione data-driven: framework decisionali, OKR, ricerca qualitativa e quantitativa, framework JTBD e cultura del dato per team e leadership.",
    seoKeywords: ['gestione data driven', 'decision making dati', 'okr kpi', 'framework jtbd', 'cultura data driven', 'data driven management'],
    icon: 'BrainCircuit',
    color: 'from-indigo-500 to-purple-400'
  },
  {
    id: 'analisi-prodotto',
    title: 'Analisi di Prodotto',
    description: "Leggi comportamento, attivazione, retention, UX e crescita per capire dove un prodotto crea valore e dove si rompe.",
    seoTitle: 'Analisi di Prodotto: Retention, Funnel e Product Analytics | GinnyTech',
    seoDescription: 'Modulo di product analytics: analisi comportamento utenti, attivazione, retention, UX research, product-market fit e framework di crescita del prodotto.',
    seoKeywords: ['analisi prodotto', 'product analytics', 'retention analysis', 'funnel analisi', 'product market fit', 'ux research'],
    icon: 'Activity',
    color: 'from-blue-500 to-cyan-400'
  },
  {
    id: 'analisi-marketing',
    title: 'Analisi di Marketing',
    description: "Misuri canali, funnel, CRM, attribuzione e unit economics per capire quale marketing genera crescita reale e margine.",
    seoTitle: 'Analisi di Marketing: Canali, Funnel e Attribuzione | GinnyTech',
    seoDescription: 'Modulo di marketing analytics: analisi canali, funnel, CRM, email marketing, modelli di attribuzione, unit economics e performance marketing.',
    seoKeywords: ['analisi marketing', 'marketing analytics', 'modelli attribuzione', 'funnel marketing', 'unit economics', 'performance marketing'],
    icon: 'Zap',
    color: 'from-orange-500 to-red-400'
  },
  {
    id: 'dashboard-visualizzazione',
    title: 'Dashboard & Data Visualization',
    description: 'Costruisci dashboard, grafici e storie analitiche che aiutano a decidere, prioritizzare e comunicare numeri con chiarezza.',
    seoTitle: 'Dashboard e Data Visualization per Analisti | GinnyTech',
    seoDescription: 'Modulo su dashboard e data visualization: costruire grafici efficaci, storytelling con i dati, dashboard strategiche e best practice di visualizzazione.',
    seoKeywords: ['dashboard analytics', 'data visualization', 'storytelling dati', 'dashboard strategiche', 'grafici analisi dati', 'bi dashboard'],
    icon: 'LayoutDashboard',
    color: 'from-cyan-500 to-blue-400'
  },
  {
    id: 'marketing-data-science',
    title: 'Marketing Data Science',
    description: "Usi modelli, attribuzione, forecasting, segmentazione e sperimentazione per leggere crescita, retention e performance con disciplina.",
    seoTitle: 'Marketing Data Science: Segmentazione, Forecasting e Modelli | GinnyTech',
    seoDescription: 'Modulo di marketing data science: modelli predittivi, segmentazione clienti, attribution modeling, forecasting, NPS e sperimentazione controllata.',
    seoKeywords: ['marketing data science', 'segmentazione clienti', 'customer analytics', 'forecasting marketing', 'attribution modeling', 'machine learning marketing'],
    icon: 'FlaskConical',
    color: 'from-pink-500 to-rose-400'
  },
  {
    id: 'data-warehousing',
    title: 'Data Warehousing & Architecture',
    description: 'Capisci come si struttura un sistema analitico con OLAP, modellazione, motori colonnari e query pensate per scalare.',
    seoTitle: 'Data Warehousing e Architettura Analitica: OLAP e Modellazione | GinnyTech',
    seoDescription: 'Modulo su data warehousing e architettura analitica: OLAP, modellazione dimensionale, motori colonnari, schema design e query ottimizzate per analytics.',
    seoKeywords: ['data warehousing', 'architettura analitica', 'olap', 'modellazione dimensionale', 'data modeling', 'schema design analytics'],
    icon: 'Server',
    color: 'from-slate-400 to-zinc-500'
  },
  {
    id: 's3-data-lake',
    title: 'S3 & Data Lake Architecture',
    description: 'Progetti data lake leggibili e sostenibili con object storage, formati colonnari, partizionamento e access pattern corretti.',
    seoTitle: 'S3 e Data Lake Architecture: Object Storage e Parquet | GinnyTech',
    seoDescription: 'Modulo su S3 e data lake: progettazione con object storage, formati Parquet e Avro, partizionamento, data lifecycle e pipeline real-time su AWS.',
    seoKeywords: ['data lake', 's3 analytics', 'object storage', 'parquet avro', 'data lake architecture', 'partizionamento dati'],
    icon: 'HardDrive',
    color: 'from-amber-500 to-yellow-400'
  },
  {
    id: 'kafka-streaming',
    title: 'Kafka & Event Streaming',
    description: "Entri nella logica dell'event streaming: producer, consumer, schema, idempotenza e flussi dati affidabili in tempo reale.",
    seoTitle: 'Apache Kafka e Event Streaming per Data Engineering | GinnyTech',
    seoDescription: 'Modulo su Apache Kafka e event streaming: architettura broker, producer, consumer, schema registry, Kafka Connect e pipeline dati real-time affidabili.',
    seoKeywords: ['apache kafka', 'event streaming', 'kafka producer consumer', 'kafka connect', 'schema registry', 'streaming data pipeline'],
    icon: 'Radio',
    color: 'from-red-500 to-orange-400'
  },
  {
    id: 'real-time-analytics',
    title: 'Real-Time Analytics & ClickHouse',
    description: 'Costruisci analytics realtime con ClickHouse, materialized views, CDC e dashboard che reagiscono davvero ai dati operativi.',
    seoTitle: 'Real-Time Analytics con ClickHouse: Materialized Views e CDC | GinnyTech',
    seoDescription: 'Modulo su real-time analytics con ClickHouse: fondamenti, materialized views incrementali, change data capture, ottimizzazione query e dashboard operative.',
    seoKeywords: ['real time analytics', 'clickhouse', 'materialized views', 'change data capture cdc', 'streaming analytics', 'olap real time'],
    icon: 'Zap',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'infrastructure-ops',
    title: 'Infrastructure & Ops',
    description: 'Porti disciplina operativa nel lavoro dati con CI/CD, monitoraggio, costi, automazione e documentazione tecnica condivisa.',
    seoTitle: 'Infrastructure e Ops per Data Engineering: CI/CD e Terraform | GinnyTech',
    seoDescription: 'Modulo su infrastructure e ops per data: CI/CD pipeline, infrastructure as code con Terraform, monitoraggio, gestione costi cloud e documentazione tecnica.',
    seoKeywords: ['data infrastructure', 'ci cd data engineering', 'terraform data', 'monitoring observability', 'infrastructure as code', 'data ops'],
    icon: 'GitMerge',
    color: 'from-gray-400 to-slate-500'
  },
  {
    id: 'advanced-sql',
    title: 'Advanced SQL',
    description: 'Usi SQL come strumento analitico maturo per retention, funnel, window functions, sessionizzazione e KPI table robuste.',
    seoTitle: 'Advanced SQL per Analisti: Window Functions e Query Analitiche | GinnyTech',
    seoDescription: 'Modulo di SQL avanzato: window functions, funnel SQL, analisi di retention, sessionizzazione, CTE ricorsive e KPI table per analisi dati professionali.',
    seoKeywords: ['advanced sql', 'sql analytics', 'window functions sql', 'sql funnel', 'sql retention analysis', 'query analitiche avanzate'],
    icon: 'Database',
    color: 'from-emerald-400 to-cyan-500'
  },
  {
    id: 'matematica-analisi-dati',
    title: 'Matematica per l\'Analisi Dati',
    description: "Costruisci la base matematica che rende piu' leggibili modelli, regressioni, probabilita', inferenza e machine learning applicato.",
    seoTitle: "Matematica per l'Analisi Dati: Probabilita', Statistica e Regressione | GinnyTech",
    seoDescription: "Modulo di matematica per l'analisi dati: probabilita', statistica inferenziale, regressione lineare, distribuzioni e fondamenti di machine learning applicato.",
    seoKeywords: ['matematica analisi dati', 'statistica inferenziale', 'regressione lineare', 'probabilita statistica', 'basi machine learning', 'matematica data science'],
    icon: 'BrainCircuit',
    color: 'from-sky-400 to-indigo-500'
  },
  {
    id: 'analytics-engineering',
    title: 'Analytics Engineering',
    description: 'Trasformi sorgenti grezze in modelli dati affidabili con dbt, test, semantic layer, governance e deployment ripetibile.',
    seoTitle: 'Analytics Engineering con dbt per MarTech | GinnyTech',
    seoDescription: 'Modulo di Analytics Engineering con dbt: staging, marts, test, semantic layer e deploy per trasformare dati MarTech in modelli affidabili.',
    seoKeywords: ['analytics engineering', 'dbt', 'martech', 'semantic layer', 'data modeling', 'data quality'],
    icon: 'GitMerge',
    color: 'from-emerald-500 to-blue-500'
  },
  {
    id: 'significativita-statistica',
    title: 'Significativita\' Statistica & A/B Testing',
    description: "Impari a progettare esperimenti, leggere p-value e intervalli, evitare errori interpretativi e decidere con piu' rigore.",
    seoTitle: 'Significativita\' Statistica e A/B Testing | GinnyTech',
    seoDescription: 'Modulo su significativita\' statistica e A/B testing: ipotesi, randomizzazione, p-value, sample size, potenza statistica e governance degli esperimenti.',
    seoKeywords: ['significativita statistica', 'a/b testing', 'p-value', 'sample size', 'power analysis', 'esperimenti'],
    icon: 'FlaskConical',
    color: 'from-fuchsia-500 to-rose-400'
  },
  {
    id: 'direzioni-analitica',
    title: 'Direzioni in Analitica: Marketing, Prodotto e Finanza',
    description: "Ti orienti tra marketing, prodotto e finanza per capire KPI, strumenti, responsabilita' e logiche dei diversi ruoli.",
    seoTitle: 'Direzioni in Analitica: Marketing, Prodotto e Finanza | GinnyTech',
    seoDescription: 'Modulo completo su direzioni in analitica: classificazione, strumenti, marketing analytics, product analytics, unit economics, KPI finanziari e controllo di gestione.',
    seoKeywords: ['direzioni analitica', 'marketing analytics', 'product analytics', 'financial analytics', 'unit economics', 'kpi'],
    icon: 'BarChart',
    color: 'from-violet-500 to-sky-400'
  },
  {
    id: 'filosofia-analisi-dati',
    title: "Fondamenti filosofici dell'analisi dei dati",
    description: "Esplori causalita', spiegazione, probabilita' e filosofia della scienza per leggere meglio dati, regressioni e decisioni.",
    seoTitle: "Fondamenti filosofici dell'analisi dei dati | GinnyTech",
    seoDescription: "Modulo sui fondamenti filosofici dell'analisi dei dati: radici storiche, Aristotele, Hume, Kant, regressioni, inferenza, previsione e applicazioni a marketing analytics e A/B testing.",
    seoKeywords: ['fondamenti filosofici analisi dati', 'causalita', 'regressione', 'inferenza', 'marketing analytics', 'filosofia della scienza'],
    icon: 'BrainCircuit',
    color: 'from-cyan-500 to-indigo-500'
  }
];
