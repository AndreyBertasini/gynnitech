# GinnyTech

Sito editoriale e corso gratuito in italiano su **data engineering, analytics engineering, marketing analytics e AI per i dati**. Online su **[ginnytech.it](https://ginnytech.it)**.

Il repository contiene tutto: i contenuti (corso, blog, glossario), il codice del sito e i controlli automatici di qualità che bloccano la build quando un contenuto o una pagina non rispetta le regole SEO e didattiche.

## Cosa c'è dentro

| Sezione | Contenuto |
| :-- | :-- |
| **Corso** (`/course/`) | 21 moduli e 236 lezioni su SQL, ClickHouse, dbt, data warehouse, Kafka, metriche, A/B test, AI agentica e altro. Ogni lezione ha codice eseguibile, riepilogo e link al modulo e alle lezioni vicine. |
| **Blog** (`/blog/`) | Articoli tecnici su analytics, growth e AI. |
| **Glossario** (`/glossario/`) | 97 termini, una pagina per termine con definizione, esempio e link alle lezioni. |
| **Ricerca** | Ricerca full-text con Pagefind, generata in build. |

## Stack

- [Astro](https://astro.build) 7 con [Starlight](https://starlight.astro.build), React 19 per i componenti interattivi
- Tailwind CSS 4
- Content collections MDX (`corso`, `blog`, `blog-en`), con schema Zod in `src/lib/schemas.ts`
- KaTeX e Mermaid dentro i contenuti MDX
- Vitest per i test, Pagefind per la ricerca
- Deploy statico su Cloudflare Pages (`wrangler.toml`)

## Avvio rapido

Serve Node `22.12.0` (vedi `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:3000
```

| Comando | Cosa fa |
| :-- | :-- |
| `npm run dev` | Server di sviluppo sulla porta 3000 |
| `npm run build` | Build di produzione in `dist/`, indice di ricerca e tutti i controlli SEO |
| `npm run preview` | Serve la build locale |
| `npm run check` | Validazione contenuti, `astro check` e test |
| `npm run test` | Test Vitest |
| `npm run validate:content` | Frontmatter, slug e qualità minima delle lezioni |

## Controlli di qualità

`npm run build` fallisce se qualcosa non torna. I controlli girano anche in CI (`.github/workflows/quality.yml`):

- **`check:i18n-seo`**: attributo `lang` coerente con il prefisso URL, canonical sempre autoreferenziale, hreflang reciproci, sitemap allineata alle pagine indicizzabili, regole di redirect valide.
- **`check:content-seo`**: ogni lezione ha un solo H1 univoco, almeno un blocco di codice, link al modulo, precedente/successiva e BreadcrumbList. Ogni modulo ha lo schema `Course`, ogni termine del glossario ha `DefinedTerm`, e le pagine indicizzabili non linkano articoli `noindex`.
- **`audit:site`**: controlli generali su metadati, schema e link della build.

### Politica i18n

L'italiano è la lingua principale. Le pagine in `/en/` esistono solo per gli articoli di `blog-en` con `translationReviewed: true`; tutte le altre URL `/en/` rispondono con un redirect 301 verso l'equivalente italiano (il blocco è generato in `dist/_redirects`). La sitemap è generata dalle content collection (`src/pages/sitemap-*.xml.ts`).

## Struttura

```text
src/
  content/       corso, blog, blog-en in MDX
  pages/         route del sito (corso, blog, glossario, sitemap)
  components/    componenti Astro e React
  lib/           schemi, regole SEO/i18n, collegamenti tra contenuti
  data/          programma del corso, glossario, redirect storici
scripts/         script TypeScript: validazione, audit SEO, redirect, llms.txt
tests/           test Vitest
docs/            guide editoriali, note SEO, piani, archivio dei report
tools/           utility una tantum (Python), fuori dalla build
public/          asset statici, robots, redirect, headers
```

## Scrivere o modificare una lezione

Le regole editoriali sono in [`CLAUDE.md`](CLAUDE.md) e nelle guide in [`docs/guide/`](docs/guide). In sintesi: ogni lezione è un file `.mdx` in `src/content/corso/<modulo>/`, con frontmatter valido, introduzione, almeno tre sezioni H2 e un riepilogo. Prima di aprire una PR esegui:

```bash
npm run check
npm run build
```

## Deploy

Cloudflare Pages costruisce `main` con `npm run build` e pubblica `dist/`. Per un deploy manuale: `npm run deploy:cloudflare` (richiede `wrangler` autenticato).

## Contribuire

Segnalazioni e correzioni sono benvenute: apri una issue o una pull request. Per i contenuti, includi la fonte quando correggi un dato o un numero.

## Licenza

Apache License 2.0, vedi [`LICENSE`](LICENSE).
