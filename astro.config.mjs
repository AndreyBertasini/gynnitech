// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import mermaid from 'astro-mermaid';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Starlight Plugins
import starlightImageZoom from 'starlight-image-zoom';
import starlightScrollToTop from 'starlight-scroll-to-top';
import starlightHeadingBadges from 'starlight-heading-badges';
import starlightLinksValidator from 'starlight-links-validator';

const loadSidebar = () => {
  try {
    const data = fs.readFileSync('./src/data/sidebar-generated.json', 'utf-8');
    const items = JSON.parse(data);
    return Array.isArray(items) ? items : [];
  } catch (e) {
    return [];
  }
};

const dynamicSidebar = loadSidebar();

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://ginnytech.it',
  devToolbar: {
    enabled: true,
    placement: 'bottom-left',
  },
  redirects: {
    '/corso/marketing/brand': '/course/marketing-data-science/brand',
    '/corso/marketing/economics': '/course/marketing-data-science/unit-economics',
    '/corso/marketing/attribution': '/course/marketing-data-science/attribution',
    '/corso/infrastructure/clickhouse': '/course/data-warehousing/clickhouse',
    '/corso/infrastructure/sql': '/course/data-warehousing/sql',
    '/corso/infrastructure/python': '/course/marketing-data-science/python',
    '/corso/analytics/retention': '/course/marketing-data-science/retention',
    '/corso/analytics/pmf': '/course/marketing-data-science/pmf',
    '/corso/getting-started/introduction': '/course/data-collection/introduction',
    '/corso/getting-started/framework': '/course/data-collection/framework',
    '/corso/getting-started/terminology': '/course/data-collection/terminology',
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        kernel: 'lanczos3'
      }
    }
  },
  vite: {
    plugins: [tailwindcss()]
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  integrations: [
    react(),
    mermaid({
      theme: 'dark',
      fontFamily: 'Inter, sans-serif',
    }),
    sitemap(),
    starlight({
      title: 'GinnyTech',
      logo: {
        src: './src/assets/logo-ginnytech.png',
      },
      favicon: '/favicon.svg',
      plugins: [
        starlightImageZoom(),
        starlightScrollToTop({
          showOnHomepage: true,
          svgStrokeColor: '#012b4d',
          smoothScroll: true,
          svgPath: 'M17 11 12 6 7 11 M17 18 12 13 7 18',
          borderRadius: '50%',
        }),
        starlightHeadingBadges(),
        starlightLinksValidator({
          errorOnRelativeLinks: false,
          exclude: ['/course/**'],
        }),
      ],
      components: {
        Sidebar: './src/components/starlight/Sidebar.astro',
        Search: './src/components/starlight/Empty.astro', // Remove from header
      },
      expressiveCode: {
        themes: ['github-dark', 'github-light'],
        styleOverrides: {
          codeFontFamily: "'Geist Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
          uiFontFamily: "'Inter', sans-serif",
        },
      },
      head: [
        {
          tag: 'script',
          attrs: {
            type: 'text/partytown',
            async: true,
            src: 'https://www.googletagmanager.com/gtag/js?id=G-NXL5WZC0SR',
          },
        },
        {
          tag: 'script',
          attrs: {
            type: 'text/partytown',
          },
          content: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NXL5WZC0SR');
          `,
        },
        {
          tag: 'link',
          attrs: {
            rel: 'preconnect',
            href: 'https://fonts.googleapis.com',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'preconnect',
            href: 'https://fonts.gstatic.com',
            crossorigin: '',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap',
          },
        },
        {
          tag: 'script',
          content: `
            // Force dark mode if no preference is stored
            if (!localStorage.getItem('starlight-theme')) {
              document.documentElement.setAttribute('data-theme', 'dark');
              localStorage.setItem('starlight-theme', 'dark');
            }
          `,
        },
      ],
      social: [
        {
          label: 'GitHub',
          href: 'https://github.com/openai',
          icon: 'github',
        },
      ],
      customCss: [
        './src/styles/custom.css',
        '@fontsource/inter/400.css',
        '@fontsource/inter/600.css',
      ],
      sidebar: [
        {
          label: 'Menu',
          items: [
            { label: 'Home', link: '/' },
            { label: 'Corso Analisi Dati', link: '/course' },
            { label: 'Blog', link: '/blog' },
            { label: 'Consulenza', link: '/consulting' },
          ]
        },
        ...(dynamicSidebar.length > 0 ? [{ label: 'Notion Content', items: dynamicSidebar }] : []),
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
          items: [
            { label: 'Framework JTBD', link: '/course/management/jtbd/' },
          ],
        },
      ],
    }),
  ],
});
