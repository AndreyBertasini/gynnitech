export interface BlogPost {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  slug: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Analisi dei Cluster per la Segmentazione Clienti',
    description: 'Smetti di trattare tutti i clienti allo stesso modo. Scopri come identificare i segmenti più redditizi con il machine learning.',
    category: 'Data Science',
    date: '08 Febbraio 2026',
    slug: 'cluster-analysis'
  },
  {
    id: '2',
    title: 'Le Trappole Analitiche più Comuni',
    description: 'Correlazione non è causalità, bias di sopravvivenza e altri errori che ogni marketing manager commette almeno una volta.',
    category: 'Best Practices',
    date: '01 Febbraio 2026',
    slug: 'analytic-traps'
  },
  {
    id: '3',
    title: 'Unit Economics: Dove stai perdendo budget?',
    description: 'Come calcolare LTV e CAC correttamente per capire la vera profittabilità delle tue campagne di acquisizione.',
    category: 'Strategia',
    date: '28 Gennaio 2026',
    slug: 'unit-economics'
  },
  {
    id: '4',
    title: 'HADI Cycles: Il segreto della crescita rapida',
    description: 'Hypothesis, Action, Data, Insight. Come applicare il metodo scientifico al marketing per iterare velocemente.',
    category: 'Framework',
    date: '20 Gennaio 2026',
    slug: 'hadi-cycles'
  },
  {
    id: '5',
    title: 'NPS è una "Vanity Metric"?',
    description: 'Analisi critica del Net Promoter Score. Quando è utile, quando è fuorviante e quali alternative considerare.',
    category: 'Metriche',
    date: '15 Gennaio 2026',
    slug: 'nps-critique'
  }
];

export async function getBlogPosts(): Promise<BlogPost[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(blogPosts), 100);
  });
}
