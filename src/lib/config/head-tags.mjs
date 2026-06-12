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
    content: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;

      var deniedConsent = {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied'
      };
      var analyticsConsent = Object.assign({}, deniedConsent, { analytics_storage: 'granted' });

      gtag('consent', 'default', deniedConsent);

      function loadGoogleAnalytics() {
        if (window.__ginnytechGaLoaded) return;
        window.__ginnytechGaLoaded = true;
        var script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-NXL5WZC0SR';
        document.head.appendChild(script);
        gtag('js', new Date());
        gtag('config', 'G-NXL5WZC0SR');
      }

      function scheduleAnalyticsLoad() {
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(loadGoogleAnalytics, { timeout: 3000 });
        } else {
          window.setTimeout(loadGoogleAnalytics, 1800);
        }
      }

      try {
        var savedConsent = localStorage.getItem('cookie-consent');
        if (savedConsent === 'analytics-granted' || savedConsent === 'granted') {
          gtag('consent', 'update', analyticsConsent);
          scheduleAnalyticsLoad();
        }
      } catch (_) {}

      window.addEventListener('ginnytech:analytics-consent-granted', function() {
        gtag('consent', 'update', analyticsConsent);
        scheduleAnalyticsLoad();
      });

      window.addEventListener('ginnytech:analytics-consent-denied', function() {
        gtag('consent', 'update', deniedConsent);
      });
    `,
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
