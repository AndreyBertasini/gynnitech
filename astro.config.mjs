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
          label: 'Corso Gratuito',
          items: [
            { label: 'Introduzione', link: '/docs/corso/1-introduzione/' },
            {
              label: 'Modulo 1: Fondamenti',
              collapsed: false,
              items: [
                { label: 'Cosa è il Marketing Data-Driven', link: '/docs/corso/2-data-driven/' },
                { label: 'Metriche che contano', link: '/docs/corso/3-metriche/' },
              ],
            },
            {
              label: 'Modulo 2: Strumenti',
              collapsed: true,
              items: [
                { label: 'Google Analytics 4', link: '/docs/corso/4-ga4/' },
                { label: 'Excel per Marketer', link: '/docs/corso/5-excel/' },
              ],
            },
          ],
        },
        /*
        {
          label: 'Start Here',
          items: [
            { label: 'Introduction', link: '/docs/introduction/' },
            { label: 'Quickstart', link: '/docs/quickstart/' },
          ],
        },
        */
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
