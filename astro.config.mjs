// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { unified } from '@astrojs/markdown-remark';

import fs from 'node:fs';
import mermaid from 'astro-mermaid';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeStripCourseH1 from './src/lib/rehype-strip-course-h1.mjs';

// Starlight Plugins
import starlightImageZoom from 'starlight-image-zoom';

import { redirects } from './src/lib/config/redirects.mjs';
import { starlightHeadTags } from './src/lib/config/head-tags.mjs';
import { staticSidebarSections } from './src/lib/config/sidebar-sections.mjs';

import sentry from '@sentry/astro';
import spotlightjs from '@spotlightjs/astro';

const hasSentryDsn = Boolean(process.env.PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN);
const hasSentryAuthToken = Boolean(process.env.SENTRY_AUTH_TOKEN);
const enableSpotlight = process.env.ENABLE_SPOTLIGHT === '1' || process.env.PUBLIC_SPOTLIGHT === '1';

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
    enabled: false,
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
    plugins: [/** @type {any} */ (tailwindcss())],
    build: {
      chunkSizeWarningLimit: 700,
    },
  },
  markdown: {
    processor: unified({
      gfm: true,
      remarkPlugins: [remarkMath],
      rehypePlugins: [[rehypeKatex, { strict: 'ignore' }], rehypeStripCourseH1],
    }),
  },
  integrations: [
    // Le sitemap sono endpoint generati dalle content collections (src/pages/sitemap-*.xml.ts).
    // Starlight aggiunge @astrojs/sitemap da solo se non lo trova: questo segnaposto con lo
    // stesso nome lo impedisce, altrimenti sitemap-index.xml verrebbe sovrascritta.
    { name: '@astrojs/sitemap', hooks: {} },
    react(),
    mermaid({
      theme: 'dark',
    }),
    starlight({
      title: 'GinnyTech',
      logo: {
        src: './src/assets/logo-ginnytech.webp',
      },
      favicon: '/favicon-32x32.png',
      pagefind: false,
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
        'katex/dist/katex.min.css',
        './src/styles/custom.css',
      ],
      sidebar: [
        staticSidebarSections[0],
        ...(dynamicSidebar.length > 0 ? [{ label: 'Notion Content', items: dynamicSidebar }] : []),
        ...staticSidebarSections.slice(1),
      ],

    }),
    mdx({
      optimize: true,
      gfm: true,
    }),
    ...(hasSentryDsn ? [sentry({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      telemetry: false,
      sourcemaps: {
        disable: !hasSentryAuthToken,
      },
    })] : []),
    ...(enableSpotlight ? [spotlightjs()] : []),
  ],
});
