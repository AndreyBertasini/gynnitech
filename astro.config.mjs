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

import { redirects } from './src/lib/config/redirects.mjs';
import { starlightHeadTags } from './src/lib/config/head-tags.mjs';
import { staticSidebarSections } from './src/lib/config/sidebar-sections.mjs';

import sentry from '@sentry/astro';
import spotlightjs from '@spotlightjs/astro';

const hasSentryDsn = Boolean(process.env.PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN);
const hasSentryAuthToken = Boolean(process.env.SENTRY_AUTH_TOKEN);

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
  redirects,

  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        kernel: 'lanczos3'
      }
    }
  },
  vite: {
    plugins: [/** @type {any} */ (tailwindcss())]
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypeKatex, { strict: 'ignore' }]],
  },
  integrations: [
    react(),
    mermaid({
      theme: 'dark',
    }),
    sitemap(),
    starlight({
      title: 'GinnyTech',
      logo: {
        src: './src/assets/logo-ginnytech.png',
      },
      favicon: '/favicon-32x32.png',
      plugins: [
        starlightImageZoom(),
      ],
      disable404Route: true,
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
      head: /** @type {any} */ (starlightHeadTags),

      social: [
        {
          label: 'GitHub',
          href: 'https://github.com/AndreyBertasini/gynnitech',
          icon: 'github',
        },
      ],
      customCss: [
        './src/styles/custom.css',
        '@fontsource/inter/400.css',
        '@fontsource/inter/600.css',
      ],
      sidebar: [
        staticSidebarSections[0],
        ...(dynamicSidebar.length > 0 ? [{ label: 'Notion Content', items: dynamicSidebar }] : []),
        ...staticSidebarSections.slice(1),
      ],

    }),
    ...(hasSentryDsn ? [sentry({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      telemetry: false,
      sourcemaps: {
        disable: !hasSentryAuthToken,
      },
    })] : []),
    spotlightjs(),
  ],
});
