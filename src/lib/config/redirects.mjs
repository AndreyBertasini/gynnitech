const legacyRedirectEntries = [
  ['/corso/marketing/brand', '/course/analisi-marketing/efficacia-brand'],
  ['/corso/marketing/economics', '/course/marketing-data-science/unit-economics'],
  ['/corso/marketing/attribution', '/course/marketing-data-science/attribution'],
  ['/corso/infrastructure/clickhouse', '/course/data-warehousing/clickhouse'],
  ['/corso/infrastructure/sql', '/course/data-warehousing/sql'],
  ['/corso/infrastructure/python', '/course/marketing-data-science/python'],
  ['/corso/analytics/retention', '/course/marketing-data-science/retention'],
  ['/corso/analytics/pmf', '/course/marketing-data-science/pmf'],
  ['/corso/getting-started/introduction', '/course/data-collection/introduction'],
  ['/corso/getting-started/framework', '/course/data-collection/framework'],
  ['/corso/getting-started/terminology', '/course/data-collection/terminology'],
];

// Nessuna pagina /en/ del corso: i vecchi URL inglesi puntano direttamente all'italiano (un solo hop).
const englishRedirectEntries = legacyRedirectEntries.map(([source, target]) => [`/en${source}`, target]);

const redirectEntries = [...legacyRedirectEntries, ...englishRedirectEntries];

const isInternalPath = (value) => typeof value === 'string' && value.startsWith('/');

const validateRedirectEntries = (entries) => {
  const seenSources = new Set();

  for (const [source, target] of entries) {
    if (seenSources.has(source)) {
      throw new Error(`[config] Redirect duplicato rilevato: "${source}".`);
    }

    if (!isInternalPath(source) || !isInternalPath(target)) {
      throw new Error(
        `[config] Redirect non valido: "${source}" -> "${target}". Entrambi devono iniziare con '/'.`,
      );
    }

    seenSources.add(source);
  }
};

validateRedirectEntries(redirectEntries);

const redirects = Object.fromEntries(redirectEntries);

export { legacyRedirectEntries, redirectEntries, redirects, validateRedirectEntries };
