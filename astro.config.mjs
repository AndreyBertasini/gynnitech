// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    react(),
    starlight({
      title: 'GYNNITECH',
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
          label: 'Getting Started',
          items: [
            { label: 'Introduction', link: '/docs/corso/getting-started/introduction/' },
            { label: 'The Framework', link: '/docs/corso/getting-started/framework/' },
            { label: 'Terminology', link: '/docs/corso/getting-started/terminology/' },
          ],
        },
        {
          label: 'Data-Driven Management',
          items: [
            { label: 'Strategy Frameworks', link: '/docs/corso/management/strategy/' },
            { label: 'User-Centricity', link: '/docs/corso/management/user-centricity/' },
          ],
        },
        {
          label: 'Product Analytics',
          items: [
            { label: 'Product-Market Fit', link: '/docs/corso/analytics/pmf/' },
            { label: 'Retention Deep-Dive', link: '/docs/corso/analytics/retention/' },
            { label: 'Experimentation', link: '/docs/corso/analytics/experimentation/' },
          ],
        },
        {
          label: 'Marketing & Economics',
          items: [
            { label: 'Unit Economics & LTV', link: '/docs/corso/marketing/economics/' },
            { label: 'Attribution', link: '/docs/corso/marketing/attribution/' },
            { label: 'Brand Health', link: '/docs/corso/marketing/brand/' },
          ],
        },
        {
          label: 'Technical Infrastructure',
          items: [
            { label: 'High-Performance SQL', link: '/docs/corso/infrastructure/sql/' },
            { label: 'ClickHouse Mastery', link: '/docs/corso/infrastructure/clickhouse/' },
            { label: 'Python for Data', link: '/docs/corso/infrastructure/python/' },
          ],
        },
        {
          label: 'Risorse',
          items: [
            { label: 'Blog', link: '/blog' },
            { label: 'Consulenza', link: '/consulting' },
          ]
        }
      ],
    }),
  ],
});
