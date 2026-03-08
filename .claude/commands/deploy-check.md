# Deploy Check

Esegui una checklist pre-deploy per il sito GinnyTech (Astro + Cloudflare Pages).

## Utilizzo

```
/deploy-check
```

## Fase 1: Build locale

Chiedi all'utente se vuole eseguire il build ora o saltarlo (es. se l'ha appena fatto).

Se conferma, esegui:
```bash
npm run build
```

Analizza l'output:
- Errori fatali → stop, mostra errori, non procedere
- Warning → annota, continua
- Build OK → annota il numero di pagine generate e le parole indicizzate da Pagefind

## Fase 2: Lezioni stub esposte pubblicamente

Leggi `.claude/lesson-status.md` (se esiste) per trovare lezioni classificate ❌.

Per ogni lezione ❌, verifica che esista fisicamente in `src/content/corso/` e che abbia un frontmatter `draft: true` o sia esclusa dalla navigazione.

Se una lezione ❌ stub è pubblica (nessun draft flag, raggiungibile via URL):

```
⚠️ Lezioni stub pubbliche trovate:
- src/content/corso/marketing-data-science/clustering.mdx (280w)
- src/content/corso/real-time-analytics/stream-processing.mdx (195w)
```

Suggerisci di aggiungere `draft: true` nel frontmatter o di completare le lezioni prima del deploy.

Se `.claude/lesson-status.md` non esiste, suggerisci di eseguire `/audit-corso` prima.

## Fase 3: SEO check — pagine principali

Controlla queste pagine chiave leggendo i file sorgente:

### Homepage (`src/pages/index.astro` o equivalente)
- `<title>` presente e < 60 caratteri?
- `<meta name="description">` presente e 120–160 caratteri?
- `og:title`, `og:description`, `og:image` presenti?
- JSON-LD presente? (cerca `application/ld+json`)
- Se JSON-LD presente: tipo corretto (`Course`, `WebSite`, o `Organization`)?

### Pagina corso (`src/pages/course.astro`)
- Stesso check di title, description, og:*
- JSON-LD con schema `Course` presente?

### Layout base (`src/layouts/Layout.astro`)
- Canonical URL generata correttamente?
- `lang="it"` sull'elemento `<html>`?
- Favicon presente?

Presenta i risultati:
```
### SEO Check

Homepage:
  ✅ title: "GinnyTech — Marketing Data & Analytics Engineering" (52 chars)
  ✅ description: presente (143 chars)
  ✅ og:image presente
  ✅ JSON-LD: Course schema
  ⚠️ og:description mancante

Course page:
  ✅ title OK
  ❌ JSON-LD mancante
```

## Fase 4: Cloudflare config

Leggi `wrangler.toml`:
- `name` configurato?
- `compatibility_date` presente e non vecchia (< 1 anno da oggi)?
- Route o `pages_build_output_dir` configurato?
- `[vars]` o secrets che potrebbero essere esposti?

Segnala solo anomalie — se tutto è OK, di' solo "wrangler.toml OK".

## Fase 5: Quick checks finali

Esegui questi check con Grep/Read:

- **Console.log dimenticati**: cerca `console.log` in `src/` (escludi `.astro` se è per debug noto)
- **TODO critici**: cerca `TODO` o `FIXME` in `src/pages/` e `src/layouts/` (non nelle lezioni)
- **Link rotti ovvi**: cerca `href="#"` o `href=""` nei file .astro principali

## Fase 6: Report finale

```
## Deploy Check — <data>

### Build
✅ Build completato — 69 pagine, 11,936 parole indicizzate

### Lezioni stub
⚠️ 3 lezioni stub pubbliche (vedi sopra)

### SEO
✅ Homepage OK
⚠️ Course page: og:description mancante
❌ Blog index: title troppo lungo (72 chars)

### Cloudflare
✅ wrangler.toml OK

### Quick checks
✅ Nessun console.log trovato
✅ Nessun TODO critico
⚠️ 2 href="#" trovati in src/pages/course.astro:145,203

---
Pronto per il deploy: [✅ SÌ / ⚠️ CON RISERVE / ❌ NO]
Problemi bloccanti: X
Problemi non bloccanti: X
```

**Bloccante** = build fallita, errore SEO grave (title mancante), lezione stub pubblica senza intenzionalità.
**Non bloccante** = warning, og mancanti, TODO minori.

## Note

- Non eseguire il deploy — solo analisi pre-deploy
- Se npm run build fallisce, mostra l'errore completo e interrompi il check
- Il deploy va fatto manualmente o via CI
