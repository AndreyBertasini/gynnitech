const staticSidebarSections = [
  {
    label: 'Menu',
    items: [
      { label: 'Home', link: '/' },
      { label: 'Corso Analisi Dati', link: '/course' },
      { label: 'Articoli', link: '/blog' },
    ],
  },
  {
    label: 'Data Collection & Tracking',
    items: [
      { label: 'Event Tracking Design', link: '/course/data-collection/event-tracking/' },
      { label: 'Third-Party Integrations', link: '/course/data-collection/integrations/' },
      { label: 'Data Privacy & Compliance', link: '/course/data-collection/privacy/' },
    ],
  },
  {
    label: 'Gestione Data-Driven',
    items: [
      { label: 'Cultura Data-Driven', link: '/course/gestione-data-driven/cultura-data-driven/' },
      { label: 'Decision Making con i Dati', link: '/course/gestione-data-driven/decision-making-dati/' },
      { label: 'OKR e KPI', link: '/course/gestione-data-driven/okr-e-kpi/' },
      { label: 'Ciclo di Deming HADI', link: '/course/gestione-data-driven/ciclo-deming-hadi/' },
      { label: 'Framework JTBD', link: '/course/gestione-data-driven/framework-jtbd/' },
    ],
  },
  {
    label: 'Analisi di Prodotto',
    items: [
      { label: 'A/B Testing', link: '/course/analisi-prodotto/ab-testing/' },
      { label: 'Product-Market Fit', link: '/course/analisi-prodotto/product-market-fit/' },
      { label: 'Retention Framework', link: '/course/analisi-prodotto/retention-framework/' },
      { label: 'Analisi di Coorte', link: '/course/analisi-prodotto/analisi-coorte/' },
      { label: 'Strumenti Product Analytics', link: '/course/analisi-prodotto/strumenti-product-analytics/' },
      { label: 'Onboarding & Attivazione', link: '/course/analisi-prodotto/onboarding-attivazione/' },
    ],
  },
  {
    label: 'Analisi di Marketing',
    items: [
      { label: 'Performance Marketing', link: '/course/analisi-marketing/performance-marketing/' },
      { label: 'GA4 Avanzato', link: '/course/analisi-marketing/ga4-avanzato/' },
      { label: 'Customer Journey Mapping', link: '/course/analisi-marketing/customer-journey-mapping/' },
      { label: 'CRM & Email Analytics', link: '/course/analisi-marketing/crm-email-analytics/' },
      { label: 'Modelli di Attribuzione', link: '/course/analisi-marketing/modelli-attribuzione/' },
      { label: 'SEO & Content Analytics', link: '/course/analisi-marketing/seo-content-analytics/' },
    ],
  },
  {
    label: 'Direzioni in Analitica',
    items: [
      { label: 'Classificazione Direzioni', link: '/course/direzioni-analitica/classificazione-delle-direzioni-in-analitica/' },
      { label: 'Strumenti per Analisti', link: '/course/direzioni-analitica/strumenti-pratici-per-analisti-moderni/' },
      { label: 'Product Analytics', link: '/course/direzioni-analitica/introduzione-alla-product-analytics/' },
      { label: 'Unit Economics', link: '/course/direzioni-analitica/unit-economics-cac-ltv-e-marginalita/' },
    ],
  },
  {
    label: "Fondamenti filosofici dell'analisi dei dati",
    items: [
      { label: 'Storia Filosofica', link: '/course/filosofia-analisi-dati/perche-l-analisi-dati-ha-una-storia-filosofica/' },
      { label: 'Aristotele e le Cause', link: '/course/filosofia-analisi-dati/aristotele-e-le-quattro-cause/' },
      { label: "Causa ed Effetto", link: '/course/filosofia-analisi-dati/causalita-causa-ed-effetto-nell-analisi-dei-dati/' },
      { label: 'Regressioni e Inferenza', link: '/course/filosofia-analisi-dati/causalita-regressioni-e-inferenza-statistica/' },
    ],
  },
  {
    label: 'Metriche e Dashboard',
    items: [
      { label: 'Metriche Fondamentali', link: '/course/metriche-fondamenti/metriche-fondamentali/' },
      { label: 'Data Visualization', link: '/course/dashboard-visualizzazione/data-visualization/' },
      { label: 'Dashboard Strategiche', link: '/course/dashboard-visualizzazione/dashboard-strategiche/' },
      { label: 'SQL per Analisti', link: '/course/dashboard-visualizzazione/sql-per-analisti/' },
      { label: 'Python Data Analysis', link: '/course/dashboard-visualizzazione/python-data-analysis/' },
      { label: 'ETL & Data Pipeline', link: '/course/dashboard-visualizzazione/etl-data-pipeline/' },
    ],
  },
  {
    label: 'Marketing Data Science',
    items: [
      { label: 'Attribution Modeling', link: '/course/marketing-data-science/attribution/' },
      { label: 'Retention', link: '/course/marketing-data-science/retention/' },
      { label: 'Python for Data', link: '/course/marketing-data-science/python/' },
      { label: 'Customer Analytics', link: '/course/marketing-data-science/customer-analytics/' },
      { label: 'Cluster Analysis', link: '/course/marketing-data-science/cluster-analysis/' },
      { label: 'Experimentation', link: '/course/marketing-data-science/experimentation/' },
    ],
  },
  {
    label: 'Data Warehousing & Architecture',
    items: [
      { label: 'OLAP Strategy', link: '/course/data-warehousing/olap/' },
      { label: 'ClickHouse Advanced', link: '/course/data-warehousing/clickhouse/' },
    ],
  },
  {
    label: 'Analytics Engineering',
    items: [
      { label: 'dbt e ruolo dell\'Analytics Engineer', link: '/course/analytics-engineering/dbt-e-ruolo-dell-analytics-engineer/' },
      { label: 'Staging dati MarTech', link: '/course/analytics-engineering/staging-e-standardizzazione-dei-dati-martech/' },
      { label: 'Test e contratti dati', link: '/course/analytics-engineering/test-data-quality-e-contratti-dati/' },
      { label: 'Deploy dbt', link: '/course/analytics-engineering/deploy-orchestrazione-e-ci-cd-dbt/' },
    ],
  },
  {
    label: 'Real-Time Analytics & Streaming',
    items: [
      { label: 'Streaming Ingestion', link: '/course/real-time-analytics/streaming/' },
      { label: 'ClickHouse Real-Time Features', link: '/course/real-time-analytics/clickhouse-rt/' },
      { label: 'Live Dashboards & Alerting', link: '/course/real-time-analytics/dashboards/' },
    ],
  },
  {
    label: 'Infrastructure & Ops',
    items: [
      { label: 'CI/CD for Data', link: '/course/infrastructure-ops/cicd/' },
      { label: 'Cost Management', link: '/course/infrastructure-ops/costs/' },
      { label: 'Documentation', link: '/course/infrastructure-ops/documentation/' },
    ],
  },
  {
    label: 'Data-Driven Management',
    items: [{ label: 'Framework JTBD', link: '/course/data-collection/jtbd/' }],
  },
];

const isSidebarLink = (value) => typeof value === 'string' && value.startsWith('/');

const validateSidebarSections = (sections) => {
  const seenLinks = new Set();

  for (const [sectionIndex, section] of sections.entries()) {
    if (!section || typeof section.label !== 'string' || !Array.isArray(section.items)) {
      throw new Error(`[config] Sezione sidebar non valida all'indice ${sectionIndex}.`);
    }

    for (const [itemIndex, item] of section.items.entries()) {
      if (!item || typeof item.label !== 'string' || !isSidebarLink(item.link)) {
        throw new Error(
          `[config] Link sidebar non valido in "${section.label}" [item ${itemIndex}].`,
        );
      }

      if (seenLinks.has(item.link)) {
        throw new Error(`[config] Link sidebar duplicato rilevato: "${item.link}".`);
      }

      seenLinks.add(item.link);
    }
  }
};

validateSidebarSections(staticSidebarSections);

export { staticSidebarSections, validateSidebarSections };
