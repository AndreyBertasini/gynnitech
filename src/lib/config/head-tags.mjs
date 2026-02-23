const starlightHeadTags = [
  // Favicon: cookie logo
  {
    tag: 'link',
    attrs: {
      rel: 'icon',
      type: 'image/png',
      sizes: '96x96',
      href: '/favicon-96x96.png',
    },
  },
  {
    tag: 'link',
    attrs: {
      rel: 'icon',
      type: 'image/png',
      sizes: '48x48',
      href: '/favicon-48x48.png',
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
