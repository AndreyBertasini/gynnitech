const redirectEntries = [
  ['/corso/marketing/brand', '/course/marketing-data-science/brand'],
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

export { redirectEntries, redirects, validateRedirectEntries };
