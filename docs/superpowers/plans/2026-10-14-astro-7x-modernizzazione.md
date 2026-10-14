# Modernizzazione Astro 7.x Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allineare il sito a Astro 7.3.x, correggere la regressione `compressHTML: 'jsx'`, adottare le funzioni stabili utili (`prefetch`, Fonts API, `deferRender` se misurato), decidere con una prova se Sätteri può sostituire `unified()`, poi pubblicare su `main`.

**Architecture:** Uno script di "fotografia" (`scripts/snapshot-site.ts` + `scripts/lib/site-snapshot.ts`) cattura testo, struttura e contatori di ogni pagina di `dist/`. Ogni task di modernizzazione è un commit e si chiude solo se il confronto con la fotografia precedente mostra differenze attese. Le funzioni pure dello script sono sviluppate in TDD con Vitest.

**Tech Stack:** Astro 7.3.x, Starlight 0.42.x, Vite 8, Tailwind 4, TypeScript, tsx, Vitest 3, `hast-util-from-html`, `hast-util-select`, `hast-util-to-text`.

**Spec:** `docs/superpowers/specs/2026-10-14-astro-7x-modernizzazione-design.md`

## Global Constraints

- Solo funzioni stabili: niente `experimental.*`, CSP, `session`, né funzioni che richiedono server (route caching, `src/fetch.ts`).
- Verifiche visive sempre su `astro preview` dopo una build, mai sul dev server (l'ordine del CSS globale cambia solo in produzione).
- Dopo ogni `npm run build`: `git checkout -- public/llms-full.txt` prima di fare commit.
- Ogni stringa italiana modificata va aggiunta a mano a `src/data/i18n/en-static-cache.json` (chiave `sha256(source)`, valore `{source, target, updatedAt}`), poi build completa e controllo di `dist/en/`.
- Le lezioni (`src/content/corso/**`) non si modificano: le regole di `scripts/validation.ts` non vanno toccate.
- Titoli YAML con `:` tra virgolette; `<Steps>` solo con elenchi numerati (non rilevante qui, ma non rompere i file MDX).
- Commit con trailer `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Il worktree non ha `node_modules`: Task 2 esegue `npm ci`.

## Review Focus

1. Testo inline adiacente (`<code>`, `<strong>`, `<a>`) nelle lezioni MDX che perde lo spazio dopo il cambio `compressHTML` → lo copre il confronto `jsx` vs `true` di Task 4 su tutte le pagine, non solo i `.astro`.
2. Pagine di solo redirect e pagine senza `<title>`/`<body>` in `dist/` non devono far fallire `capture` → test in Task 1.
3. Stringhe corrette che cambiano hash e tornano in italiano su `/en/` → verifica `dist/en/index.html` in Task 4.
4. Pagine Starlight (lezioni, blog) senza i font preload dopo la Fonts API, o `--font-inter` definita due volte (Tailwind `@theme` e Fonts API) → verifica in Task 6 del `font-family` calcolato su una pagina Starlight e su una del layout custom.
5. Formule `$$` (display) rese come inline, o viceversa, dalla prova Sätteri → il conteggio `.katex` e la presenza di `.katex-display` sono nella fotografia (Task 1) e nel criterio di Task 8.

---

### Task 1: Script di fotografia (TDD)

**Files:**
- Create: `scripts/lib/site-snapshot.ts`
- Create: `scripts/snapshot-site.ts`
- Create: `scripts/measure-process.mjs`
- Test: `tests/site-snapshot.test.ts`
- Modify: `package.json` (script `snapshot:site`, devDependencies `hast-util-from-html`, `hast-util-select`, `hast-util-to-text`, versioni già nel lockfile: 2.0.3, 6.0.4, 4.0.2)
- Modify: `.gitignore` (riga `.snapshots/`)

**Interfaces:**
- Produces, in `scripts/lib/site-snapshot.ts`:
  - `type PageSnapshot = { title: string; metaDescription: string; canonical: string; headings: { level: number; text: string }[]; text: string; counts: { katex: number; katexDisplay: number; mermaid: number; codeBlocks: number; images: number }; internalLinks: string[] }`
  - `type Snapshot = Record<string, PageSnapshot>`
  - `normalizeText(text: string): string` — riduce ogni sequenza di spazi bianchi a un solo spazio, `trim()`, maschera `/_astro/<nome>.<hash>.<ext>` in `/_astro/<nome>.<ext>` e le date ISO complete (`\d{4}-\d{2}-\d{2}T[\d:.]+Z`) in `<ISO_DATE>`. Non rimuove mai uno spazio.
  - `extractPage(html: string): PageSnapshot | null` — `null` se la pagina è di solo redirect (contiene `<meta http-equiv="refresh"`).
  - `comparePages(a: Snapshot, b: Snapshot): { added: string[]; removed: string[]; changed: { path: string; fields: string[]; textDiff?: { index: number; before: string; after: string; count: number } }[] }`
  - `renderReport(result: ReturnType<typeof comparePages>): string` — Markdown con totali e una sezione per pagina cambiata.
  - `captureDist(distDir: string): Promise<Snapshot>` — percorre `dist/**/*.html`, chiave = percorso relativo con `/`.
- Produces CLI: `npm run snapshot:site -- capture --dist <dir> --out <file>`; `npm run snapshot:site -- compare <a.json> <b.json> [--report <file.md>]` (uscita `0` se identiche, `1` altrimenti).
- Produces `scripts/measure-process.mjs`: modulo di preload che all'evento `exit` stampa su stderr `MEASURE elapsed_s=<n> max_rss_mb=<n>`.

- [ ] **Step 1: Scrivere i test falliti in `tests/site-snapshot.test.ts`** (stile `describe/test` di `tests/schemas.test.ts`):
  - `normalizeText("percorso.\n  Lezioni")` → `"percorso. Lezioni"`; `normalizeText("percorso.Lezioni")` → `"percorso.Lezioni"` (non inserisce né toglie spazi); `normalizeText("/_astro/index.AbC123xy.css")` → `"/_astro/index.css"`.
  - `extractPage` su `<html><head><title>T</title><meta name="description" content="D"><link rel="canonical" href="/x/"></head><body><h1>Uno</h1><p>a<strong>b</strong></p><span class="katex"></span><span class="katex-display"></span><a href="/c/">c</a><a href="https://e.it">e</a></body></html>` → `title "T"`, `metaDescription "D"`, `canonical "/x/"`, `headings [{level:1,text:"Uno"}]`, `text` contiene `"ab"` (inline attaccati), `counts.katex 1`, `counts.katexDisplay 1`, `internalLinks ["/c/"]`.
  - `extractPage` su HTML con `<meta http-equiv="refresh" content="0;url=/x/">` → `null`.
  - `extractPage` su `"<p>solo frammento</p>"` (senza head/title/body) → oggetto con `title ""` e senza eccezioni.
  - `extractPage` ignora `<script>`, `<style>`, `<noscript>` e `<template>` nel `text`.
  - `comparePages` con due snapshot identici → `added/removed/changed` vuoti.
  - `comparePages` con `text` `"percorso. Lezioni"` contro `"percorso.Lezioni"` → un elemento `changed` con `fields` che include `"text"` e `textDiff.count >= 1`.
  - `comparePages` riporta pagine `added` e `removed`.
  - `renderReport` su risultato vuoto contiene `"Nessuna differenza"`.
- [ ] **Step 2: Eseguire** `npx vitest run tests/site-snapshot.test.ts`. Expected: FAIL (modulo `scripts/lib/site-snapshot` inesistente).
- [ ] **Step 3: Implementare** `scripts/lib/site-snapshot.ts`: parsing con `fromHtml(html)` di `hast-util-from-html`, selezione con `select`/`selectAll` di `hast-util-select`, testo con `toText` di `hast-util-to-text` applicato a `body` dopo aver rimosso dall'albero `script`, `style`, `noscript`, `template`; `normalizeText` sul risultato. `textDiff.index` è la prima posizione diversa; `before`/`after` sono ±40 caratteri attorno; `count` è il numero di segmenti diversi calcolato confrontando le parole (`split(" ")`) in modo semplice (non serve un algoritmo di diff completo).
- [ ] **Step 4: Eseguire** `npx vitest run tests/site-snapshot.test.ts`. Expected: tutti PASS.
- [ ] **Step 5: Implementare** `scripts/snapshot-site.ts` (argomenti con `process.argv`, scrittura JSON con indentazione 2) e `scripts/measure-process.mjs` (`process.on('exit', ...)` con `process.resourceUsage().maxRSS` in KB e `process.uptime()`). Aggiungere lo script `"snapshot:site": "tsx scripts/snapshot-site.ts"` e `.snapshots/` a `.gitignore`.
- [ ] **Step 6: Prova manuale su `dist` fittizia.** Creare in scratchpad una cartella con due HTML, eseguire `capture` due volte e `compare`. Expected: uscita `0` con "Nessuna differenza"; poi modificare uno spazio nel secondo HTML → uscita `1` e frammento mostrato.
- [ ] **Step 7: Commit** `git add scripts tests package.json package-lock.json .gitignore` → `feat(tooling): script di fotografia del sito per confronto tra build`.

---

### Task 2: Punto di partenza

**Files:** nessuna modifica al codice (solo `.snapshots/` e misure annotate in `docs/superpowers/reports/2026-10-astro-7x-report.md`, creato qui con la sezione "Punto di partenza").

**Interfaces:**
- Consumes: CLI di Task 1.
- Produces: `.snapshots/00-baseline.json`; sezione "Punto di partenza" del report con tempo e `max_rss_mb` (due misure).

- [ ] **Step 1:** `npm ci`. Expected: installazione completata senza errori. Se compare `TSCONFIG_ERROR` in un worktree annidato, riprovare la build sul percorso del worktree stesso (vedi memoria "Nested worktree build bug"); annotare un `Ruling` se serve.
- [ ] **Step 2:** `npm run build`. Expected: build completa, incluso `audit:site`, senza errori. Poi `git checkout -- public/llms-full.txt`.
- [ ] **Step 3:** `npx tsx scripts/snapshot-site.ts capture --dist dist --out .snapshots/00-baseline.json`. Expected: file creato; stampato il numero di pagine (> 300).
- [ ] **Step 4:** Misurare due volte: `node --import ./scripts/measure-process.mjs node_modules/astro/bin/astro.mjs build` (verificare il percorso reale del bin in `node_modules/astro/package.json`). Annotare le due righe `MEASURE`.
- [ ] **Step 5:** Creare il report con la sezione "Punto di partenza" e committare: `docs: misure di build di partenza`.

---

### Task 3: Dipendenze (Passo 1)

**Files:**
- Modify: `package.json`, `package-lock.json`
- Modify (solo se necessario): `astro.config.mjs` (opzione `gfm` di `mdx()`)

**Interfaces:**
- Consumes: `.snapshots/00-baseline.json`.
- Produces: `.snapshots/01-deps.json`.

- [ ] **Step 1:** Prima di installare, leggere con `npm view <pacchetto>@<versione> peerDependencies` che `starlight-image-zoom` più recente richieda una `@astrojs/starlight` compatibile con 0.42.x; se no, scegliere l'ultima compatibile e annotare un `Ruling`.
- [ ] **Step 2:** Aggiornare in `package.json`: `astro ^7.3.8`, `@astrojs/starlight ^0.42.6`, `@astrojs/mdx ^8.0.0`, `@astrojs/react ^7.0.0`, `@astrojs/sitemap` ultima 3.7.x, `starlight-image-zoom` (da Step 1), `astro-mermaid ^2.1.0`, `@astrojs/check` ultima 0.9.x; `npm install`.
- [ ] **Step 3:** `npm ls @astrojs/mdx`. Expected: una sola versione (8.x) in tutto l'albero.
- [ ] **Step 4:** `npm run check`. Expected: passa. Se `mdx({ gfm: true })` genera errore o avviso di opzione sconosciuta, rimuovere `gfm: true` da `mdx(...)` (resta coperto da `unified({ gfm: true })`) e annotare un `Ruling`.
- [ ] **Step 5:** `npm run build`, `git checkout -- public/llms-full.txt`, poi `capture` in `.snapshots/01-deps.json` e `compare .snapshots/00-baseline.json .snapshots/01-deps.json`. Expected: uscita `0`. Se ci sono differenze, ricondurle al pacchetto responsabile aggiornando un pacchetto alla volta, poi correggere o fissare la versione di quello.
- [ ] **Step 6:** Commit `chore(deps): allinea Astro 7.3.8, Starlight 0.42.6, MDX 8, React 7`.

---

### Task 4: `compressHTML` (Passo 2)

**Files:**
- Modify: `src/pages/index.astro:103` e gli altri punti individuati dal confronto
- Modify: `src/data/i18n/en-static-cache.json`
- Modify (solo se oltre ~15 punti): `astro.config.mjs` (`compressHTML: true` con commento)

**Interfaces:**
- Consumes: CLI di Task 1.
- Produces: `.snapshots/02-html.json`, `.snapshots/02-jsx.json`, `.snapshots/02-fixed.json`; elenco dei punti corretti nel report.

- [ ] **Step 1:** Impostare temporaneamente `compressHTML: true` in `astro.config.mjs`, `npm run build`, `capture` → `.snapshots/02-html.json`. Rimuovere l'impostazione, `npm run build`, `capture` → `.snapshots/02-jsx.json`.
- [ ] **Step 2:** `compare .snapshots/02-html.json .snapshots/02-jsx.json --report .snapshots/02-diff.md`. Expected: l'elenco include almeno `index.html` ("percorso.Lezioni"). Leggere il report e censire ogni pagina/frammento, anche delle lezioni MDX.
- [ ] **Step 3:** Decidere con la regola della spec: ≤ ~15 punti → correggere nei sorgenti (`{' '}` o markup); oltre → `compressHTML: true` con commento e correggere comunque i punti già trovati. Annotare un `Ruling` con il numero di punti e la scelta.
- [ ] **Step 4:** Per la hero: `Marketing e Data Engineering nello stesso percorso.{' '}<br class="hidden sm:block"/>`. Per ogni stringa italiana toccata, aggiungere la voce a `en-static-cache.json`.
- [ ] **Step 5:** `npm run build` completa, `git checkout -- public/llms-full.txt`, `capture` → `.snapshots/02-fixed.json`, `compare .snapshots/02-html.json .snapshots/02-fixed.json`. Expected: nessuna differenza di `text` rispetto alla versione `true` (se si è tenuto `'jsx'`) oppure nessuna differenza in assoluto (se si è impostato `true`).
- [ ] **Step 6:** Verificare `grep -c "percorso. Lezioni" dist/index.html` ≥ 1 e che `dist/en/index.html` contenga la frase inglese corrispondente alla hero, non l'italiano.
- [ ] **Step 7:** Controllo visivo su `astro preview`, viewport mobile, home: la hero legge "stesso percorso. Lezioni pratiche".
- [ ] **Step 8:** Commit `fix: ripristina spazi persi con compressHTML jsx (hero e altri)`.

---

### Task 5: `prefetch` (Passo 3)

**Files:** Modify: `astro.config.mjs`

**Interfaces:** Consumes `.snapshots/02-fixed.json`; produces `.snapshots/03-prefetch.json`.

- [ ] **Step 1:** Aggiungere in `defineConfig`: `prefetch: { prefetchAll: true, defaultStrategy: 'hover' },`.
- [ ] **Step 2:** `npm run build`, `git checkout -- public/llms-full.txt`, `capture` → `.snapshots/03-prefetch.json`, `compare` con `02-fixed`. Expected: nessuna differenza di `text`, `headings`, `counts`.
- [ ] **Step 3:** Su `astro preview`, nel pannello Network, il passaggio del mouse su un link di lezione avvia la richiesta della pagina (`<link rel="prefetch">` o fetch). Annotare l'esito. La cookie banner non deve registrare pagine in più: con GA4 rifiutato nessun evento parte (controllare la lista richieste).
- [ ] **Step 4:** Commit `feat: prefetch al passaggio del mouse`.

---

### Task 6: Fonts API (Passo 4)

**Files:**
- Move: `public/fonts/{inter,montserrat}-latin-*.woff2` → `src/assets/fonts/` (`git mv`)
- Modify: `astro.config.mjs` (`fonts`, import `fontProviders` da `astro/config`, `components.Head`)
- Create: `src/components/starlight/Head.astro`
- Modify: `src/layouts/Layout.astro:125-130`, `src/styles/custom.css` (righe 1–65 e blocco tema ~100–106)
- Modify: `package.json` (rimuovere `@fontsource/inter`, `@fontsource/montserrat`, `@fontsource/sora`)

**Interfaces:** Consumes `.snapshots/03-prefetch.json`; produces `.snapshots/04-fonts.json` e le variabili CSS `--font-inter`, `--font-montserrat` generate da Astro.

- [ ] **Step 1:** Consultare la documentazione installata (`/withastro/docs`, Fonts API) per la forma esatta del filtro `preload` di `<Font>`; annotare un `Ruling` se differisce dalla spec.
- [ ] **Step 2:** `git mv` dei nove file woff2. In `astro.config.mjs` aggiungere `fonts: [...]` con `fontProviders.local()` per Inter (pesi 400, 500, 600, 700) e Montserrat (400, 500, 600, 700, 800), `cssVariable: '--font-inter'` / `'--font-montserrat'`, `fallbacks: ['sans-serif']`, `src` verso `./src/assets/fonts/<famiglia>-latin-<peso>-normal.woff2`.
- [ ] **Step 3:** In `custom.css`: eliminare i nove `@font-face` e le definizioni di `--font-montserrat` e `--font-inter` nel blocco tema (restano `--font-sans`, `--font-heading`, `--font-ui`).
- [ ] **Step 4:** In `Layout.astro` sostituire i quattro `<link rel="preload" href="/fonts/...">` con `<Font cssVariable="--font-inter" preload={...500} />` e `<Font cssVariable="--font-montserrat" preload={...700, 400, 500} />` (import da `astro:assets`), mantenendo i pesi di preload attuali. Creare `src/components/starlight/Head.astro` che renderizza `StarlightHead` (`import Default from '@astrojs/starlight/components/Head.astro'`) più i due `<Font>`, e registrarlo in `starlight({ components: { Head: ... } })`.
- [ ] **Step 5:** Verificare con `grep -rn "@fontsource/\(inter\|montserrat\|sora\)" src` che non ci siano import, poi `npm uninstall` dei tre pacchetti.
- [ ] **Step 6:** `npm run build`, `git checkout -- public/llms-full.txt`. Expected: nessun errore. `capture` → `.snapshots/04-fonts.json`, `compare` con `03-prefetch`. Expected: nessuna differenza.
- [ ] **Step 7:** Su `astro preview`, con `javascript_tool`: su `/` e su `/course/metriche-fondamenti/inizio-successo/` leggere `getComputedStyle(document.querySelector('h1')).fontFamily` e quello del `body`. Expected: iniziano con `Montserrat`/`Inter` (con i fallback generati). Nessuna richiesta 404 verso `/fonts/` e nel `<head>` sono presenti i preload dei font. Annotare i risultati.
- [ ] **Step 8:** Commit `feat(fonts): Fonts API di Astro al posto degli @font-face manuali`.

---

### Task 7: `deferRender`, solo se misurato (Passo 5)

**Files:** Modify (provvisorio, poi tenuto o annullato): `src/content.config.ts` (loader `corso` e `blog`).

**Interfaces:** Consumes il report; produce la sezione "deferRender" del report e, se adottato, il commit.

- [ ] **Step 1:** Senza `deferRender`: rimuovere `node_modules/.astro`, misurare la build (due volte, cache fredda) e una build a cache calda con il comando di Task 2 Step 4.
- [ ] **Step 2:** Aggiungere `deferRender: true` ai loader `corso` e `blog` e ripetere le stesse misure.
- [ ] **Step 3:** Regola della spec: adottare solo se `max_rss_mb` scende ≥ 20% e il tempo non sale > 10% (a freddo e a caldo). Annotare un `Ruling` con i numeri.
- [ ] **Step 4:** Se adottato: `build` completa, `capture` → `.snapshots/05-defer.json`, `compare` con `04-fonts`, atteso nessuna differenza, poi commit `perf: deferRender sui loader dei contenuti`. Se non adottato: `git checkout -- src/content.config.ts`, nessun commit di codice.
- [ ] **Step 5:** Scrivere le misure nel report e committare `docs: misure deferRender`.

---

### Task 8: Prova Sätteri (Passo 6)

**Files:** su ramo usa e getta `spike/satteri`; in caso di esito positivo, nuovo commit su questo ramo che modifica `astro.config.mjs` (rimuove `withMarkdownProcessorCompat` e relative costanti), `package.json` e crea `src/lib/markdown/satteri-katex.ts` con test in `tests/satteri-katex.test.ts`.

**Interfaces:** Consumes `.snapshots/04-fonts.json` (o `05-defer`); produces `.snapshots/06-satteri.json` e l'esito nel report.

- [ ] **Step 1:** `git switch -c spike/satteri`. Impostare `markdown.processor: satteri({ features: { math: true } })` (da `@astrojs/markdown-satteri`), rimuovere il wrapper, `remark-math` e `rehype-katex`. `npm run build` e osservare gli errori.
- [ ] **Step 2:** Esaminare l'HTML di una lezione con formule (`/course/advanced-sql/indice-window-functions/`): cosa produce `features.math`? Cercare su npm un plugin hast di Sätteri per KaTeX (`npm search satteri katex`); se manca, scriverne uno minimo che chiama `katex.renderToString(source, { displayMode, throwOnError: false })` sui nodi math (`displayMode` per i blocchi `$$`).
- [ ] **Step 3:** Verificare senza wrapper: aside e direttive di Starlight, Expressive Code, Mermaid, badge dei titoli (`__SHB__`).
- [ ] **Step 4:** `capture` → `.snapshots/06-satteri.json`, `compare` con la fotografia precedente. Criteri della spec: `counts.katex` e `counts.katexDisplay` identici in tutte le pagine; `text` identico nelle pagine con formule (tranne tipografia "smart", da valutare); nessun errore; tempo di build non peggiore.
- [ ] **Step 5 (se passa):** tornare al ramo principale, applicare la migrazione vera: test in `tests/satteri-katex.test.ts` per il plugin (formula inline → `class="katex"`, blocco → `katex-display`, formula non valida → non lancia), poi implementazione, rimozione di `remark-math`, `rehype-katex` e, solo se `peerDependenciesMeta` lo consente, `@astrojs/markdown-remark`; `npm run check`, build, `compare` senza differenze, commit `refactor: Sätteri come processore markdown, rimosso il wrapper unified`.
- [ ] **Step 6 (se non passa):** tornare al ramo principale, aggiungere sopra `withMarkdownProcessorCompat` un commento che spiega cosa manca, annotare l'esito nel report. In ogni caso `git branch -D spike/satteri`.

---

### Task 9: Documentazione, verifica finale, pubblicazione

**Files:**
- Modify: `CLAUDE.md`
- Modify: `docs/superpowers/reports/2026-10-astro-7x-report.md`

**Interfaces:** Consumes tutte le fotografie e le misure; produce lo stato finale su `main` e il deploy.

- [ ] **Step 1:** `CLAUDE.md`: "Astro 5" → "Astro 7"; stato del processore markdown (Sätteri o `unified()` con il motivo); regola `compressHTML` nei "Known MDX Gotchas" (se si è tenuto `'jsx'`: spazi tra elementi inline solo con `{' '}`); comando `npm run snapshot:site` e quando usarlo (aggiornamenti di dipendenze); Fonts API e `prefetch` nella sezione Architecture.
- [ ] **Step 2:** Completare il report: misure prima/dopo, punti `compressHTML` corretti, decisione `deferRender`, esito Sätteri.
- [ ] **Step 3:** `npm run check` e `npm run build` finali. Expected: passano. Poi `git checkout -- public/llms-full.txt`. Controllo visivo su `astro preview` (desktop e mobile) di: `/`, `/course/metriche-fondamenti/`, `/course/advanced-sql/indice-window-functions/`, una lezione con Mermaid, un articolo del blog, `/en/`.
- [ ] **Step 4:** Commit `docs: aggiorna CLAUDE.md e report modernizzazione Astro 7.x`.
- [ ] **Step 5 (pubblicazione, richiesta esplicitamente dall'utente):** solo se i passi precedenti sono tutti verdi: `git fetch origin main`, `git merge origin/main` nel ramo (risolvere eventuali conflitti, rieseguire `npm run check`), poi `git push origin claude/astro-7-3-upgrade-be0c59:main`, che deve essere un fast-forward; se viene rifiutato, fermarsi e chiedere. `gh` non è autenticato: nessuna PR.
- [ ] **Step 6 (deploy):** `npm run build` pulita, poi `npm run deploy:cloudflare`. Se `wrangler` non è autenticato, riportarlo e fermarsi senza tentare login. Dopo il deploy, aprire `https://ginnytech.it/` su mobile e verificare la frase della hero con lo spazio.

---

## Self-review

- **Copertura della spec:** sezione 3 → Task 1; passi 0–7 → Task 2–9; criteri di successo e consegna → Task 2, 7, 9; rischi noti → Step di verifica in Task 3 e 6.
- **Coerenza dei nomi:** `captureDist`, `comparePages`, `renderReport`, `extractPage`, `normalizeText` sono usati solo in Task 1; gli altri task usano la CLI.
- **Proporzione:** il piano è più lungo della spec perché fissa nomi, valori e criteri di decisione; i corpi delle funzioni non sono trascritti.
