# GinnyTech

Piattaforma editoriale e formativa in italiano su MarTech, data engineering, analytics engineering e marketing data science.

## Stack

- Astro 6
- React 19 per componenti interattivi
- Tailwind CSS 4
- MDX content collections per blog e corso
- Mermaid, KaTeX e componenti Starlight usati dentro i contenuti MDX
- Pagefind per la ricerca full-text

## Struttura

```text
src/
  components/      componenti Astro e React
  content/         contenuti MDX del blog e del corso
  data/            metadata statici e JSON di supporto
  layouts/         layout condivisi
  pages/           route pubbliche
  utils/           utility e test locali
scripts/           controlli di qualità e utility editoriali
tests/             test di schema e regressione
public/            asset statici e file SEO/AI discovery
```

## Comandi

| Comando | Uso |
| :-- | :-- |
| `npm install` | Installa le dipendenze |
| `npm run dev` | Avvia il sito in locale sulla porta `3000` |
| `npm run validate:content` | Controlla frontmatter e slug dei contenuti |
| `npm run test` | Esegue i test con Vitest |
| `npm run check` | Esegue validazione contenuti, type-check Astro e test |
| `npm run build` | Genera la build di produzione in `dist/` |
| `npm run preview` | Serve la build locale |

## Note operative

- Il contenuto del corso vive in `src/content/corso`.
- Il blog vive in `src/content/blog`.
- La ricerca dipende dagli asset Pagefind generati durante `npm run build`.
- I link e i metadata condivisi sono centralizzati in `src/consts.ts`.

## Qualità minima prima di pubblicare

```sh
npm run check
npm run build
```
