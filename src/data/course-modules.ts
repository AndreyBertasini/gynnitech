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
    description: 'Visione d\'insieme, mappe concettuali e struttura del percorso formativo.',
    icon: 'Map',
    color: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'data-collection',
    title: 'Data Collection & Tracking',
    description: 'Event Tracking, Privacy, Integrazioni e Framework per la raccolta dati strutturata.',
    icon: 'Database',
    color: 'from-teal-500 to-emerald-400'
  },
  {
    id: 'metriche-fondamenti',
    title: 'Metriche e Fondamenti Analitici',
    description: 'Approccio analitico, metriche fondamentali, statistica e ricerca per il business.',
    icon: 'BarChart',
    color: 'from-green-500 to-emerald-400'
  },
  {
    id: 'gestione-data-driven',
    title: 'Gestione Data-Driven',
    description: 'Framework decisionali, Interviste, Ciclo di Deming e Ricerca Quantitativa.',
    icon: 'BrainCircuit',
    color: 'from-indigo-500 to-purple-400'
  },
  {
    id: 'analisi-prodotto',
    title: 'Analisi di Prodotto',
    description: 'Customer Development, NPS, Product Market Fit, UX Research e A/B Testing.',
    icon: 'Activity',
    color: 'from-blue-500 to-cyan-400'
  },
  {
    id: 'analisi-marketing',
    title: 'Analisi di Marketing',
    description: 'Performance Marketing, Martech Ops, Activation, Unit Economics e Modelli di Misurazione.',
    icon: 'Zap',
    color: 'from-orange-500 to-red-400'
  },
  {
    id: 'dashboard-visualizzazione',
    title: 'Dashboard & Data Visualization',
    description: 'Dashboard strategiche, Data Visualization, Storytelling, SQL e Python per analisi.',
    icon: 'LayoutDashboard',
    color: 'from-cyan-500 to-blue-400'
  },
  {
    id: 'marketing-data-science',
    title: 'Marketing Data Science',
    description: 'Attribution, Retention, Cluster Analysis, Embeddings, Python e Sperimentazione.',
    icon: 'FlaskConical',
    color: 'from-pink-500 to-rose-400'
  },
  {
    id: 'data-warehousing',
    title: 'Data Warehousing & Architecture',
    description: 'OLAP, Data Modeling, ClickHouse e SQL per architetture dati scalabili.',
    icon: 'Server',
    color: 'from-slate-400 to-zinc-500'
  },
  {
    id: 's3-data-lake',
    title: 'S3 & Data Lake Architecture',
    description: 'Object Storage, Parquet, Data Lake design, partitioning e integrazione con ClickHouse.',
    icon: 'HardDrive',
    color: 'from-amber-500 to-yellow-400'
  },
  {
    id: 'kafka-streaming',
    title: 'Kafka & Event Streaming',
    description: 'Apache Kafka, Producers, Consumers, Schema Registry, Connect e pipeline real-time.',
    icon: 'Radio',
    color: 'from-red-500 to-orange-400'
  },
  {
    id: 'real-time-analytics',
    title: 'Real-Time Analytics & ClickHouse',
    description: 'ClickHouse, Materialized Views, Streaming, CDC e Dashboard Live.',
    icon: 'Zap',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'infrastructure-ops',
    title: 'Infrastructure & Ops',
    description: 'CI/CD, Cost Management, Monitoring, Terraform e Documentazione tecnica.',
    icon: 'GitMerge',
    color: 'from-gray-400 to-slate-500'
  },
  {
    id: 'advanced-sql',
    title: 'Advanced SQL',
    description: 'Window functions, retention, funnel, sessionizzazione, KPI table e pattern SQL avanzati per analytics.',
    icon: 'Database',
    color: 'from-emerald-400 to-cyan-500'
  },
  {
    id: 'matematica-analisi-dati',
    title: 'Matematica per l\'Analisi Dati',
    description: 'Algebra lineare, calcolo, probabilita\' e inferenza applicate a analytics, ML e sperimentazione.',
    icon: 'BrainCircuit',
    color: 'from-sky-400 to-indigo-500'
  },
  {
    id: 'analytics-engineering',
    title: 'Analytics Engineering',
    description: 'dbt, modeling layer, quality, semantic metrics e deploy per trasformare dati martech in modelli affidabili.',
    seoTitle: 'Analytics Engineering con dbt per MarTech | GinnyTech',
    seoDescription: 'Modulo di Analytics Engineering con dbt: staging, marts, test, semantic layer e deploy per trasformare dati MarTech in modelli affidabili.',
    seoKeywords: ['analytics engineering', 'dbt', 'martech', 'semantic layer', 'data modeling', 'data quality'],
    icon: 'GitMerge',
    color: 'from-emerald-500 to-blue-500'
  },
  {
    id: 'significativita-statistica',
    title: 'Significativita\' Statistica & A/B Testing',
    description: 'Ipotesi, AA/AB test, p-value, power analysis, MDE e prevenzione del peeking per prendere decisioni affidabili con gli esperimenti.',
    seoTitle: 'Significativita\' Statistica e A/B Testing | GinnyTech',
    seoDescription: 'Modulo su significativita\' statistica e A/B testing: ipotesi, randomizzazione, p-value, sample size, potenza statistica e governance degli esperimenti.',
    seoKeywords: ['significativita statistica', 'a/b testing', 'p-value', 'sample size', 'power analysis', 'esperimenti'],
    icon: 'FlaskConical',
    color: 'from-fuchsia-500 to-rose-400'
  },
  {
    id: 'direzioni-analitica',
    title: 'Direzioni in Analitica: Marketing, Prodotto e Finanza',
    description: 'Percorso pratico per orientarsi tra marketing analytics, product analytics e financial analytics con KPI, strumenti e decisioni operative.',
    seoTitle: 'Direzioni in Analitica: Marketing, Prodotto e Finanza | GinnyTech',
    seoDescription: 'Modulo completo su direzioni in analitica: classificazione, strumenti, marketing analytics, product analytics, unit economics, KPI finanziari e controllo di gestione.',
    seoKeywords: ['direzioni analitica', 'marketing analytics', 'product analytics', 'financial analytics', 'unit economics', 'kpi'],
    icon: 'BarChart',
    color: 'from-violet-500 to-sky-400'
  }
];
