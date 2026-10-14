import {
  GITHUB_PROFILE_URL,
  LINKEDIN_URL,
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from '../consts';

export const PERSON_URL = `${SITE_URL}/about`;
export const PERSON_ID = `${PERSON_URL}#andrii-dyshkantiuk`;
export const ORGANIZATION_ID = `${SITE_URL}/#ginnytech`;

const PERSON_JOB_TITLE = 'MarTech Expert, Data Engineer e Formatore';
const PERSON_DESCRIPTION =
  'Andrii Dyshkantiuk è un esperto di MarTech in Italia con oltre 15 anni di esperienza tra marketing analytics, data engineering e formazione pratica. È il fondatore di GinnyTech.';

/** Profili pubblici che attestano l'identità dell'autore. Aggiungere qui nuovi profili. */
export const PERSON_SAME_AS: readonly string[] = [LINKEDIN_URL, GITHUB_PROFILE_URL];

/** Temi che il nome dell'autore deve richiamare; ognuno punta a un modulo reale del corso. */
export const PERSON_TOPICS: readonly { name: string; href: string }[] = [
  { name: 'MarTech', href: '/course/data-collection/' },
  { name: 'Marketing Analytics', href: '/course/analisi-marketing/' },
  { name: 'Attribution Modeling', href: '/course/analisi-marketing/' },
  { name: 'Product Analytics', href: '/course/analisi-prodotto/' },
  { name: 'A/B Testing', href: '/course/significativita-statistica/' },
  { name: 'Data Engineering', href: '/course/data-warehousing/' },
  { name: 'Analytics Engineering (dbt)', href: '/course/analytics-engineering/' },
  { name: 'Apache Kafka', href: '/course/kafka-streaming/' },
  { name: 'ClickHouse', href: '/course/real-time-analytics/' },
  { name: 'SQL', href: '/course/advanced-sql/' },
  { name: 'Marketing Data Science', href: '/course/marketing-data-science/' },
  { name: "Agentic AI per l'analisi dati", href: '/course/agentic-ai-data-workflows/' },
];

export function personRef() {
  return {
    '@type': 'Person' as const,
    '@id': PERSON_ID,
    name: SITE_AUTHOR,
    url: PERSON_URL,
  };
}

export function organizationRef() {
  return {
    '@type': 'Organization' as const,
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: { '@type': 'ImageObject' as const, url: `${SITE_URL}/ginni.webp` },
  };
}

export function personNode(): Record<string, unknown> {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: SITE_AUTHOR,
    url: PERSON_URL,
    jobTitle: PERSON_JOB_TITLE,
    description: PERSON_DESCRIPTION,
    image: `${SITE_URL}/andrii.webp`,
    sameAs: [...PERSON_SAME_AS],
    knowsAbout: PERSON_TOPICS.map((topic) => topic.name),
    worksFor: { '@id': ORGANIZATION_ID },
  };
}

export function organizationNode(
  type: 'Organization' | 'EducationalOrganization' = 'Organization',
): Record<string, unknown> {
  return {
    '@type': type,
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/ginni.webp`,
    description: SITE_DESCRIPTION,
    sameAs: [...PERSON_SAME_AS],
    founder: personRef(),
  };
}
