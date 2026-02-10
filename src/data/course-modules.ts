export interface CourseModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export const COURSE_MODULES: CourseModule[] = [
  {
    id: 'data-collection',
    title: 'Data Collection & Tracking',
    description: 'Event Tracking, Privacy, Integrazioni e Framework per la raccolta dati strutturata.',
    icon: 'Database',
    color: 'from-teal-500 to-emerald-400'
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
    description: 'Performance Marketing, Branding, Unit Economics e Modelli di Attribuzione.',
    icon: 'Zap',
    color: 'from-orange-500 to-red-400'
  },
  {
    id: 'metriche-dashboard',
    title: 'Metriche e Dashboard',
    description: 'Cruscotti strategici, Data Visualization, SQL, Python e Statistica.',
    icon: 'BarChart',
    color: 'from-green-500 to-emerald-400'
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
    description: 'ClickHouse, strategia OLAP e SQL per architetture dati scalabili.',
    icon: 'Server',
    color: 'from-slate-400 to-zinc-500'
  },
  {
    id: 'real-time-analytics',
    title: 'Real-Time Analytics & ClickHouse',
    description: 'ClickHouse, Materialized Views, Kafka, Streaming e Dashboard Live.',
    icon: 'Zap',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'infrastructure-ops',
    title: 'Infrastructure & Ops',
    description: 'CI/CD per Data, Gestione Costi e Documentazione tecnica.',
    icon: 'GitMerge',
    color: 'from-gray-400 to-slate-500'
  },
  {
    id: 'management',
    title: 'Data-Driven Management',
    description: 'Framework JTBD e gestione strategica guidata dai dati.',
    icon: 'Target',
    color: 'from-violet-500 to-fuchsia-400'
  }
];
