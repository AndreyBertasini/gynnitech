const staticSidebarSections = [
  {
    label: 'Menu',
    items: [
      { label: 'Home', link: '/' },
      { label: 'Corso Analisi Dati', link: '/course' },
      { label: 'Blog', link: '/blog' },
      { label: 'Consulenza', link: '/consulting' },
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
    label: 'Metriche e Dashboard',
    items: [
      { label: 'Metriche Fondamentali', link: '/course/metriche-dashboard/metriche-fondamentali/' },
      { label: 'Data Visualization', link: '/course/metriche-dashboard/data-visualization/' },
      { label: 'Dashboard Strategiche', link: '/course/metriche-dashboard/dashboard-strategiche/' },
      { label: 'SQL per Analisti', link: '/course/metriche-dashboard/sql-per-analisti/' },
      { label: 'Python Data Analysis', link: '/course/metriche-dashboard/python-data-analysis/' },
      { label: 'ETL & Data Pipeline', link: '/course/metriche-dashboard/etl-data-pipeline/' },
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
    items: [{ label: 'Framework JTBD', link: '/course/management/jtbd/' }],
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
