const starlightHeadTags = [
  // Favicon: cookie logo
  {
    tag: 'link',
    attrs: {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: '/favicon-32x32.png',
    },
  },
  {
    tag: 'link',
    attrs: {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      href: '/favicon-16x16.png',
    },
  },
  {
    tag: 'link',
    attrs: {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/apple-touch-icon.png',
    },
  },
  {
    tag: 'script',
    attrs: {
      async: true,
      src: 'https://www.googletagmanager.com/gtag/js?id=G-NXL5WZC0SR',
    },
  },
  {
    tag: 'script',
    content: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied'
      });
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
      // Apply saved theme immediately to prevent flash
      (function() {
        var theme = localStorage.getItem('starlight-theme');
        if (theme === 'light' || theme === 'dark') {
          document.documentElement.setAttribute('data-theme', theme);
        } else {
          // First visit: use system preference or default to dark
          var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
          var initial = prefersLight ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', initial);
          localStorage.setItem('starlight-theme', initial);
        }
      })();
    `,
  },
];

const validateHeadTags = (headTags) => {
  for (const [index, headTag] of headTags.entries()) {
    if (!headTag || typeof headTag !== 'object' || typeof headTag.tag !== 'string') {
      throw new Error(`[config] Head tag non valido all'indice ${index}: "tag" mancante o non stringa.`);
    }

    const hasAttrs = headTag.attrs && typeof headTag.attrs === 'object';
    const hasContent = typeof headTag.content === 'string';

    if (!hasAttrs && !hasContent) {
      throw new Error(
        `[config] Head tag "${headTag.tag}" all'indice ${index} deve avere "attrs" o "content".`,
      );
    }
  }
};

validateHeadTags(starlightHeadTags);

export { starlightHeadTags, validateHeadTags };
