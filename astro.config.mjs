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
    placement: 'bottom-left',
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
            { label: 'Event Tracking Design', link: '/corso/data-collection/event-tracking/' },
            { label: 'Third-Party Integrations', link: '/corso/data-collection/integrations/' },
            { label: 'Data Privacy & Compliance', link: '/corso/data-collection/privacy/' },
          ],
        },
        {
          label: 'Data Warehousing & Architecture',
          items: [
            { label: 'OLAP Strategy', link: '/corso/data-warehousing/olap/' },
            { label: 'ClickHouse Advanced', link: '/corso/data-warehousing/clickhouse/' },
          ],
        },
        {
          label: 'Analytics Engineering',
          items: [
            { label: 'Data Modeling', link: '/corso/analytics-engineering/modeling/' },
            { label: 'dbt Workflow', link: '/corso/analytics-engineering/dbt/' },
            { label: 'Data Quality & Testing', link: '/corso/analytics-engineering/quality/' },
          ],
        },
        {
          label: 'Real-Time Analytics & Streaming',
          items: [
            { label: 'Streaming Ingestion', link: '/corso/real-time-analytics/streaming/' },
            { label: 'ClickHouse Real-Time Features', link: '/corso/real-time-analytics/clickhouse-rt/' },
            { label: 'Live Dashboards & Alerting', link: '/corso/real-time-analytics/dashboards/' },
          ],
        },
        {
          label: 'Marketing Data Science & Python',
          items: [
            { label: 'Advanced Customer Analytics', link: '/corso/data-science/customer-analytics/' },
            { label: 'Python for Data Engineering', link: '/corso/data-science/python/' },
            { label: 'Attribution Modeling', link: '/corso/data-science/attribution/' },
          ],
        },
        {
          label: 'Infrastructure & Ops',
          items: [
            { label: 'CI/CD for Data', link: '/corso/infrastructure-ops/cicd/' },
            { label: 'Cost Management', link: '/corso/infrastructure-ops/costs/' },
            { label: 'Documentation', link: '/corso/infrastructure-ops/documentation/' },
          ],
        },
      ],
    }),
  ],
});
