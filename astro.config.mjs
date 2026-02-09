// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import fs from 'node:fs';

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
  integrations: [
    react(),
    starlight({
      title: 'GinnyTech',
      logo: {
        src: './src/assets/logo-ginnytech.png',
      },
      favicon: '/logo-ginnytech.png',
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
          label: 'Data Warehousing & Architecture',
          items: [
            { label: 'OLAP Strategy', link: '/course/data-warehousing/olap/' },
            { label: 'ClickHouse Advanced', link: '/course/data-warehousing/clickhouse/' },
          ],
        },
        {
          label: 'Analytics Engineering',
          items: [
            { label: 'Data Modeling', link: '/course/analytics-engineering/modeling/' },
            { label: 'dbt Workflow', link: '/course/analytics-engineering/dbt/' },
            { label: 'Data Quality & Testing', link: '/course/analytics-engineering/quality/' },
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
          label: 'Marketing Data Science & Python',
          items: [
            { label: 'Advanced Customer Analytics', link: '/course/marketing-data-science/customer-analytics/' },
            { label: 'Python for Data Engineering', link: '/course/marketing-data-science/python/' },
            { label: 'Attribution Modeling', link: '/course/marketing-data-science/attribution/' },
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
