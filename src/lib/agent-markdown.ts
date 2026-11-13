import { BOOKING_URL, CONTACT_EMAIL, CREDLY_CLICKHOUSE_BADGE_URL, SITE_AUTHOR, SITE_NAME, SITE_URL } from '../consts';
import { PERSON_CREDENTIALS, PERSON_SAME_AS, PERSON_TOPICS, PERSON_URL, personNode } from './entity';
function attr(tag: string, name: string): string | undefined {
  return new RegExp(`\\b${name}="([^"]*)"`).exec(tag)?.[1];
}

export type AgentDocMeta = {
  title: string;
  description?: string;
  url: string;
  datePublished?: Date;
  dateModified?: Date;
};

const KNOWN_COMPONENTS = new Set(['Aside', 'Steps', 'Tabs', 'TabItem', 'Card', 'CardGrid']);
const OPEN = '';
const CLOSE = '';

const IMPORT_START = /^import\s+(\{|\*|[\w$]+\s*(,|from\b)|['"])/;
const EXPORT_START = /^export\s+(?:(?:const|let|var|function|default|async|class|type|interface)\b|\{)/;
const IMPORT_COMPLETE = /(\bfrom\s+['"][^'"]+['"]|^import\s+['"][^'"]+['"])\s*;?\s*$|;\s*$/;
const MDX_COMMENT = /\{\/\*[\s\S]*?\*\/\}/g;
const SELF_CLOSING_COMPONENT = /<[A-Z][A-Za-z0-9]*(?:\s[^<>]*?)?\/>/g;

/** Rewrites one stretch of prose (never inline code) so component tags become Markdown or markers. */
function rewriteProse(text: string): string {
  return text
    .replace(MDX_COMMENT, '')
    .replace(SELF_CLOSING_COMPONENT, '')
    .replace(/<Aside\b([^>]*)>/g, (_m, attrs: string) => `${OPEN}${attr(attrs, 'title') ?? ''}${CLOSE}`)
    .replace(/<\/Aside>/g, `${OPEN}/${CLOSE}`)
    .replace(/<TabItem\b([^>]*)>/g, (_m, attrs: string) => {
      const label = attr(attrs, 'label');
      return label ? `**${label}**\n` : '';
    })
    .replace(/<Card\b([^>]*)>/g, (_m, attrs: string) => {
      const title = attr(attrs, 'title');
      return title ? `**${title}**\n` : '';
    })
    .replace(/<\/?(Steps|Tabs|TabItem|CardGrid|Card)\b[^>]*>/g, '');
}

/** Converts an MDX body into plain Markdown an AI agent can read: no imports, no component tags, code untouched. */
export function mdxToAgentMarkdown(body: string): string {
  const out: string[] = [];
  let fence: string | null = null;
  let inAside = false;
  let skippingImport = false;
  let skippingWidget = false;
  let contentStarted = false;

  const quote = (line: string) => (inAside ? (line === '' ? '>' : `> ${line}`) : line);

  const pushCode = (line: string) => {
    contentStarted = true;
    out.push(quote(line));
  };

  const pushProse = (line: string) => {
    if (line.trim() === '') {
      if (inAside) out.push('>');
      else if (out.length > 0 && out[out.length - 1] !== '') out.push('');
      return;
    }
    if (!contentStarted) {
      contentStarted = true;
      if (/^# /.test(line)) return;
    }
    out.push(quote(line));
  };

  const flush = (text: string) => {
    for (const piece of text.split('\n')) {
      if (piece.trim() !== '') pushProse(piece);
    }
  };

  for (const raw of body.replace(/\r\n/g, '\n').split('\n')) {
    if (fence) {
      pushCode(raw);
      const closing = new RegExp(`^\\s*${fence[0]}{${fence.length},}\\s*$`);
      if (closing.test(raw)) fence = null;
      continue;
    }

    const opening = /^\s*(`{3,}|~{3,})/.exec(raw);
    if (opening) {
      fence = opening[1];
      pushCode(raw);
      continue;
    }

    if (skippingImport) {
      if (IMPORT_COMPLETE.test(raw)) skippingImport = false;
      continue;
    }
    if (IMPORT_START.test(raw) || EXPORT_START.test(raw)) {
      if (!IMPORT_COMPLETE.test(raw)) skippingImport = true;
      continue;
    }

    if (skippingWidget) {
          if (/\/>\s*$/.test(raw)) skippingWidget = false;
          continue;
        }

        const widget = /^<([A-Z][A-Za-z0-9]*)\b/.exec(raw);
    if (widget && !KNOWN_COMPONENTS.has(widget[1])) {
      if (/\/>\s*$/.test(raw)) continue;
      if (!/>\s*$/.test(raw)) {
        skippingWidget = true;
        continue;
      }
    }

    if (raw.trim() === '') {
      pushProse('');
      continue;
    }

    const rewritten = raw
      .split(/(`[^`]*`)/)
      .map((segment, index) => (index % 2 === 1 ? segment : rewriteProse(segment)))
      .join('');

    let current = '';
    for (const part of rewritten.split(new RegExp(`(${OPEN}[^${CLOSE}]*${CLOSE})`))) {
      if (part.startsWith(OPEN)) {
        flush(current);
        current = '';
        const marker = part.slice(1, -1);
        if (marker === '/') {
          inAside = false;
        } else {
          inAside = true;
          if (marker) flush(`**${marker}**`);
        }
      } else {
        current += part;
      }
    }
    flush(current);
  }

  return out.join('\n').trim();
}

function yamlString(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
}

const isoDay = (date: Date) => date.toISOString().slice(0, 10);

/** Frontmatter + H1 + converted body: the text served at the `.md` twin of a page. */
export function renderAgentDocument(meta: AgentDocMeta, body: string): string {
  const fields: [string, string | undefined][] = [
    ['title', meta.title],
    ['description', meta.description],
    ['url', meta.url],
    ['author', SITE_AUTHOR],
    ['author_url', PERSON_URL],
    ['publisher', SITE_NAME],
    ['date_published', meta.datePublished && isoDay(meta.datePublished)],
    ['date_modified', meta.dateModified && isoDay(meta.dateModified)],
    ['license', 'CC BY 4.0'],
    ['language', 'it-IT'],
  ];
  const frontmatter = fields
    .filter((field): field is [string, string] => field[1] !== undefined)
    .map(([key, value]) => `${key}: ${yamlString(value)}`)
    .join('\n');

  return `---\n${frontmatter}\n---\n\n# ${meta.title}\n\n${mdxToAgentMarkdown(body)}\n`;
}

/** Markdown twin of /about: who the author is, what they work on, where the proof lives. */
export function renderAboutDocument(): string {
  const person = personNode();
  const topics = PERSON_TOPICS.map((topic) => `- [${topic.name}](${SITE_URL}${topic.href})`).join('\n');
  const credentials = PERSON_CREDENTIALS.map(
    (cred) => `- **${cred.name}** (${cred.recognizedBy.name}) — ${cred.description} Verifica badge: ${cred.url}`,
  ).join('\n');
  const profiles = PERSON_SAME_AS.map((url) => `- ${url}`).join('\n');
  const body = [
    String(person.description),
    `**Ruolo:** ${String(person.jobTitle)}`,
    `**Organizzazione:** [${SITE_NAME}](${SITE_URL}), piattaforma gratuita e senza paywall per imparare MarTech, analytics engineering, A/B testing e data engineering.`,
    `## Certificazioni e Credenziali Tecniche\n\n${credentials}`,
    `## Servizi di Consulenza B2B\n\n- [Consulenza Analytics Engineering, Data Warehouse e Product Analytics](${SITE_URL}/consulting)\n- [Consulenza ClickHouse Italia: Migrazione, Ottimizzazione MergeTree e Real-Time Analytics](${SITE_URL}/consulenza/clickhouse)`,
    `## Temi su cui lavora e insegna\n\n${topics}`,
    `## Profili pubblici\n\n${profiles}`,
    `## Contatti\n\n- Email: ${CONTACT_EMAIL}\n- Prenota una call: ${BOOKING_URL}`,
  ].join('\n\n');

  return renderAgentDocument(
    {
      title: `Chi è ${SITE_AUTHOR}`,
      description: String(person.description),
      url: `${PERSON_URL}/`,
    },
    body,
  );
}

/** Markdown twin of /consulting: B2B Analytics Engineering, Data Warehouse & ClickHouse consulting services. */
export function renderConsultingDocument(): string {
  const body = [
    `Consulenza tecnica diretta con **${SITE_AUTHOR}** (Analytics Engineer, **ClickHouse Certified Developer** e MarTech Expert con oltre 15 anni di esperienza) per aziende, scale-up SaaS, e-commerce e team dati in Italia.`,
    `## Problemi aziendali che risolviamo\n\n- **Costi Data Warehouse fuori controllo (BigQuery, Snowflake, Redshift):** re-ingegnerizzazione dei modelli analitici, partizionamento e migrazione dei carichi event-driven su ClickHouse con riduzione drastica della spesa cloud.\n- **Dashboard lente e query PostgreSQL bloccate:** separazione tra database transazionale (OLTP) e motore analitico colonnare (OLAP) per portare i tempi di risposta da minuti a millisecondi.\n- **Numeri che non tornano tra GA4, CRM, Ads e Backend:** centralizzazione dei dati aziendali con pipeline server-side proprietarie e modellazione certificata in dbt (Single Source of Truth).\n- **Assenza di Product Analytics su misura:** progettazione di tassonomie eventi, analisi funnel, retention, cohort analysis e A/B testing statistico su dati proprietari.`,
    `## Aree di intervento e Stack Tecnologico\n\n- **ClickHouse & Real-Time OLAP:** progettazione schema MergeTree, Materialized Views, ottimizzazione query, ingestion da Kafka e S3 ([Approfondisci la Consulenza ClickHouse](${SITE_URL}/consulenza/clickhouse)).\n- **Analytics Engineering & dbt:** trasformazione dati modulare, data quality test automatici, documentazione lineage e semantic layer.\n- **Event Streaming & Data Collection:** pipeline Kafka, CDC (Debezium), data lakehouse su S3/Parquet e tracking first-party server-side.\n- **Product & Marketing Analytics:** attribution modeling, marketing mix, sperimentazione A/B e dashboard esecutive.`,
    `## Modalità di collaborazione\n\n1. **Audit Architetturale & Diagnosi Rapida:** revisione di query, costi cloud, modelli dbt o cluster ClickHouse con piano d'azione esecutivo.\n2. **Progetto Chiavi in Mano (End-to-End):** implementazione completa di data warehouse, migrazione a ClickHouse o pipeline analitica con affiancamento al team.\n3. **Fractional Analytics Engineer / Advisory:** supporto continuativo per guidare le scelte architetturali e formare il team interno.`,
    `## Contatti e Prenotazione\n\n- Prenota una call conoscitiva gratuita di 15 minuti: ${BOOKING_URL}\n- Email diretta: ${CONTACT_EMAIL}\n- Profilo autore: ${PERSON_URL}`,
  ].join('\n\n');

  return renderAgentDocument(
    {
      title: `Consulenza Analytics Engineering, Data Warehouse e ClickHouse in Italia`,
      description: `Consulenza B2B in Analytics Engineering, ClickHouse, dbt e Product Analytics con ${SITE_AUTHOR} (ClickHouse Certified Developer).`,
      url: `${SITE_URL}/consulting/`,
    },
    body,
  );
}

/** Markdown twin of /consulenza/clickhouse: Vertical landing page for ClickHouse consulting in Italy. */
export function renderClickHouseConsultingDocument(): string {
  const body = [
    `Servizio specialistico di **Consulenza ClickHouse in Italia** guidato da **${SITE_AUTHOR}**, **ClickHouse Certified Developer** (esame pratico hands-on certificato) e Analytics Engineer con oltre 15 anni di esperienza su architetture dati ad alto volume.`,
    `## Perché scegliere un ClickHouse Certified Developer\n\nClickHouse offre prestazioni straordinarie su miliardi di righe, ma richiede scelte architetturali rigorose su **ORDER BY (sorting key)**, **PRIMARY KEY**, famiglia **MergeTree** (\`MergeTree\`, \`ReplacingMergeTree\`, \`AggregatingMergeTree\`, \`CollapsingMergeTree\`), **Materialized Views** incrementali e strategie di partizionamento. Un design errato porta a \`Too many parts\`, Out-Of-Memory o scansioni inutili.`,
    `## Scenari di intervento su ClickHouse\n\n- **Migrazione da BigQuery / Snowflake / Redshift a ClickHouse:** abbattimento dei costi pay-per-query su dataset di eventi, log, telemetria e product analytics.\n- **Affiancamento a PostgreSQL / MySQL per Analytics Real-Time:** eliminazione dei colli di bottiglia OLTP spostando reportistica, dashboard clienti e aggregazioni pesanti su ClickHouse (via CDC, PeerDB, Kafka o pipeline batch).\n- **Ottimizzazione e Tuning Cluster ClickHouse esistenti:** audit di \`system.query_log\`, \`system.parts\`, compression codec (ZSTD, Gorilla, DoubleDelta), indici data-skipping, proiezioni e gestione della memoria.\n- **Pipeline Real-Time Kafka + ClickHouse + dbt:** ingestione streaming fault-tolerant, deduplicazione idempotente e modellazione analitica con \`dbt-clickhouse\`.`,
    `## Credenziali e Formazione Open-Source\n\n- Certificazione ufficiale: **ClickHouse Certified Developer** (${CREDLY_CLICKHOUSE_BADGE_URL})\n- Autore del modulo gratuito in italiano [Real-Time Analytics con ClickHouse](${SITE_URL}/course/real-time-analytics/) e [Kafka e Streaming di Eventi](${SITE_URL}/course/kafka-streaming/) su GinnyTech.`,
    `## Contatti\n\n- Prenota un audit tecnico di 15 minuti: ${BOOKING_URL}\n- Email: ${CONTACT_EMAIL}`,
  ].join('\n\n');

  return renderAgentDocument(
    {
      title: `Consulenza ClickHouse Italia: Migrazione, Tuning e Real-Time Analytics`,
      description: `Consulenza ClickHouse in Italia con ${SITE_AUTHOR}, ClickHouse Certified Developer. Architettura MergeTree, migrazione da BigQuery/PostgreSQL, pipeline Kafka e dbt.`,
      url: `${SITE_URL}/consulenza/clickhouse/`,
    },
    body,
  );
}

export const MARKDOWN_HEADERS = { 'Content-Type': 'text/markdown; charset=utf-8' };
