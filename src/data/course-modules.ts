export interface CourseModule {
  id: string;
  title: string;
  description: string;
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
  }
];
