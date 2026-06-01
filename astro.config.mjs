// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import { unified } from '@astrojs/markdown-remark';

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

const legacyMarkdown = {
  /** @type {any[]} */
  remarkPlugins: [],
  /** @type {any[]} */
  rehypePlugins: [],
  /** @type {any} */
  remarkRehype: undefined,
};
const MARKDOWN_COMPAT_WRAPPED = Symbol.for('ginnytech.markdownCompatWrapped');
const MARKDOWN_LEGACY_INTEGRATION_NAMES = new Set([
  '@astrojs/starlight',
  'astro-mermaid',
  'astro-expressive-code',
  'starlight-links-validator',
  'starlight-directives-restoration',
  'starlight-image-zoom-integration',
]);

/** @param {import('astro').AstroIntegration} integration */
const maybeWrapMarkdownIntegration = (integration) => {
  return MARKDOWN_LEGACY_INTEGRATION_NAMES.has(integration.name)
    ? withMarkdownProcessorCompat(integration)
    : integration;
};

/** @param {any} partialConfig */
const sanitizeMarkdownConfig = (partialConfig) => {
  const nextConfig = { ...partialConfig };
  const markdownConfig = partialConfig.markdown ? { ...partialConfig.markdown } : undefined;

  if (markdownConfig?.remarkPlugins) {
    legacyMarkdown.remarkPlugins.push(...markdownConfig.remarkPlugins);
    Reflect.deleteProperty(markdownConfig, 'remarkPlugins');
  }

  if (markdownConfig?.rehypePlugins) {
    legacyMarkdown.rehypePlugins.push(...markdownConfig.rehypePlugins);
    Reflect.deleteProperty(markdownConfig, 'rehypePlugins');
  }

  if (markdownConfig?.remarkRehype) {
    legacyMarkdown.remarkRehype = markdownConfig.remarkRehype;
    Reflect.deleteProperty(markdownConfig, 'remarkRehype');
  }

  if (markdownConfig && Object.keys(markdownConfig).length > 0) {
    nextConfig.markdown = markdownConfig;
  } else {
    Reflect.deleteProperty(nextConfig, 'markdown');
  }

  return nextConfig;
};

/** @param {any} updateConfig */
const applyMarkdownProcessor = (updateConfig) => {
  return updateConfig({
    markdown: {
      processor: unified({
        gfm: true,
        remarkPlugins: [remarkMath, ...legacyMarkdown.remarkPlugins],
        rehypePlugins: [[rehypeKatex, { strict: 'ignore' }], ...legacyMarkdown.rehypePlugins],
        ...(legacyMarkdown.remarkRehype ? { remarkRehype: legacyMarkdown.remarkRehype } : {}),
      }),
    },
  });
};

/**
 * @param {import('astro').AstroIntegration} integration
 * @returns {import('astro').AstroIntegration}
 */
const withMarkdownProcessorCompat = (integration) => {
  if ((/** @type {any} */ (integration))[MARKDOWN_COMPAT_WRAPPED]) {
    return integration;
  }

  const setupHook = integration.hooks?.['astro:config:setup'];

  const wrappedIntegration = /** @type {import('astro').AstroIntegration & Record<symbol, boolean>} */ ({
    ...integration,
    [MARKDOWN_COMPAT_WRAPPED]: true,
    hooks: {
      ...integration.hooks,
      'astro:config:setup': async (params) => {
        const integrations = params.config.integrations;
        /** @type {any} */
        const originalSplice = integrations.splice;
        (/** @type {any} */ (integrations)).splice = (
          /** @param {number} start @param {number} deleteCount @param {...any} items */
          function patchedSplice(start, deleteCount, ...items) {
          return originalSplice.call(
            this,
            start,
            deleteCount,
            ...items.map((item) => maybeWrapMarkdownIntegration(/** @type {import('astro').AstroIntegration} */ (item))),
          );
        });

        try {
          await setupHook?.({
            ...params,
            updateConfig: (partialConfig) => {
              return params.updateConfig(sanitizeMarkdownConfig(partialConfig));
            },
          });
        } finally {
          (/** @type {any} */ (integrations)).splice = originalSplice;
        }

        applyMarkdownProcessor(params.updateConfig);

        const selfIndex = params.config.integrations.indexOf(wrappedIntegration);
        if (selfIndex >= 0) {
          for (let index = selfIndex + 1; index < params.config.integrations.length; index += 1) {
            params.config.integrations[index] = maybeWrapMarkdownIntegration(params.config.integrations[index]);
          }
        }
      },
    },
  });

  return wrappedIntegration;
};

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
      rehypePlugins: [[rehypeKatex, { strict: 'ignore' }]],
    }),
  },
  integrations: [
    react(),
    withMarkdownProcessorCompat(mermaid({
      theme: 'dark',
    })),
    sitemap(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
    withMarkdownProcessorCompat(starlight({
      title: 'GinnyTech',
      logo: {
        src: './src/assets/logo-ginnytech.webp',
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

    })),
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
