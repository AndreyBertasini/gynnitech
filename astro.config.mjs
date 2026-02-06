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
      title: 'Mintlify Clone',
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
          label: 'Start Here',
          items: [
            { label: 'Introduction', link: '/docs/introduction/' },
            { label: 'Quickstart', link: '/docs/quickstart/' },
          ],
        },
        {
          label: 'Essentials',
          items: [
             { label: 'Development', link: '/docs/guides/development/' },
             { label: 'Configuration', link: '/docs/guides/configuration/' },
             { label: 'Navigation', link: '/docs/guides/navigation/' },
             { label: 'Global Settings', link: '/docs/guides/global-settings/' },
          ],
        },
        {
          label: 'API Components',
          collapsed: true,
          items: [
             { label: 'API Playground', link: '/docs/guides/api-playground/' },
             { label: 'Authentication', link: '/docs/guides/authentication/' },
             { label: 'Parameters', link: '/docs/guides/parameters/' },
          ],
        },
        {
          label: 'Resources',
          items: [
            { label: 'Community', link: 'https://discord.gg/mintlify' },
            { label: 'Blog', link: 'https://mintlify.com/blog' },
          ]
        }
      ],
    }),
  ],
});
