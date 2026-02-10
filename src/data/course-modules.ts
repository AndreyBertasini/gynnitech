export interface CourseModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export const COURSE_MODULES: CourseModule[] = [
  {
    id: 'Marketing analytics',
    title: 'Marketing analytics',
    description: 'Progettazione del tracciamento eventi, integrazioni ELT e conformità privacy (GDPR/Consent Mode).',
    icon: 'Activity',
    color: 'from-blue-500 to-cyan-400'
  },
  {
    id: 'data-warehousing',
    title: 'Data Warehousing & Architecture',
    description: 'Strategie OLAP, ClickHouse avanzato, compressione dati e ottimizzazione delle query.',
    icon: 'Database',
    color: 'from-purple-500 to-pink-400'
  },
  {
    id: 'analytics-engineering',
    title: 'Analytics Engineering',
    description: 'Modellazione dati (Star Schema vs OBT), workflow dbt, qualità del dato e testing.',
    icon: 'GitMerge',
    color: 'from-orange-500 to-red-400'
  },
  {
    id: 'real-time-analytics',
    title: 'Real-Time Analytics & Streaming',
    description: 'Ingestione streaming (Kafka), ClickHouse Materialized Views e dashboard live.',
    icon: 'Zap',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'marketing-data-science',
    title: 'Marketing Data Science',
    description: 'Analisi predittiva, LTV, Churn prediction, Python ETL e modelli di attribuzione.',
    icon: 'BrainCircuit',
    color: 'from-green-500 to-emerald-400'
  },
  {
    id: 'infrastructure-ops',
    title: 'Infrastructure & Ops',
    description: 'CI/CD per i dati, gestione dei costi cloud, Docker e documentazione tecnica.',
    icon: 'Server',
    color: 'from-slate-500 to-slate-400'
  },
  {
    id: 'management',
    title: 'Data-Driven Management',
    description: 'Framework decisionali, JTBD, OKR e gestione del team dati.',
    icon: 'BrainCircuit',
    color: 'from-indigo-500 to-purple-400'
  }
];
