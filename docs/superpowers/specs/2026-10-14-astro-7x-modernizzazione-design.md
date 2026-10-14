# Modernizzazione Astro 7.x — design

- **Data:** 2026-10-14
- **Ramo:** `claude/astro-7-3-upgrade-be0c59`
- **Stato:** approvato in brainstorming, in attesa di revisione della spec
- **Progetto:** A di due. Il progetto B (rifinitura visuale) avrà una spec separata.

## 1. Contesto

Il progetto è già su Astro 7.3.1 (lockfile), Vite 8.1 e Starlight 0.42.0. Il commit
`cd6f9f7f Upgrade site to Astro 7` ha però modificato solo `package.json` e
`package-lock.json`: nessun codice è stato adattato ai cambi di comportamento della 7.

Conseguenze già visibili:

- **Regressione in produzione.** Su mobile la hero della home mostra
  "stesso percorso.Lezioni pratiche" senza spazio. Astro 7 ha cambiato il default di
  `compressHTML` in `'jsx'`, che elimina l'a capo dopo
  `<br class="hidden sm:block"/>` (`src/pages/index.astro:103`). Su mobile il `<br>` è
  nascosto, quindi le parole si attaccano.
- **Configurazione fragile.** `astro.config.mjs` contiene circa 120 righe di wrapper
  (`withMarkdownProcessorCompat`) che intercettano i plugin remark/rehype iniettati da
  Starlight, Mermaid ed Expressive Code per forzarli sul processore `unified()`. Il wrapper
  serve per `remark-math` + `rehype-katex`: 17 lezioni hanno formule `$$` e circa 20 hanno
  formule inline.
- **Dipendenze disallineate.** `@astrojs/mdx` 7.0.8 al primo livello, mentre Starlight porta
  con sé la 8.0.0: due copie nel bundle.
- **Documentazione superata.** `CLAUDE.md` descrive ancora "Astro 5".

### Cosa porta la linea 7.x a un sito statico su Cloudflare Pages

| Novità | Versione | Decisione |
|---|---|---|
| Compilatore Rust, Vite 8 + Rolldown | 7.0 | Già attivi, nessuna azione |
| `compressHTML: 'jsx'` di default | 7.0 | Verifica e correzioni (passo 2) |
| Sätteri, processore markdown in Rust | 7.0 | Prova usa e getta (passo 6) |
| `deferRender` sul loader `glob()` | 7.1 | Solo se le misure lo giustificano (passo 5) |
| Direttive CSP aggiuntive | 7.1 | Esclusa: rischio con GA4, Sentry e script inline di Starlight |
| Build statiche incrementali | 7.2, sperimentale | Esclusa: l'utente ha scelto solo funzioni stabili |
| `session: false` | 7.2 | Esclusa: senza adapter né `Astro.session` il runtime è già rimosso in automatico |
| `astro preview --ignore-lock`, logger per servizi immagine | 7.3 | Nessun beneficio per il sito |
| Route caching, cache CDN, `src/fetch.ts`, `finalize()` Cloudflare | 7.0–7.3 | Non applicabili: richiedono rendering lato server |
| React Compiler opzionale (`@astrojs/react` 7) | 7.x | Escluso: nessun problema di prestazioni da risolvere |

Funzionalità stabili precedenti non ancora usate e incluse: `prefetch` e la Fonts API.

## 2. Obiettivi e criteri di successo

**Obiettivi**

1. Allineare le dipendenze all'ultima patch della linea 7.3 ed eliminare la doppia copia di MDX.
2. Correggere tutte le perdite di spazio causate da `compressHTML: 'jsx'`.
3. Adottare le funzionalità stabili utili: `prefetch` e Fonts API, più `deferRender` se misurato
   come vantaggioso.
4. Decidere con una prova se Sätteri può sostituire `unified()` ed eliminare il wrapper.
5. Aggiornare la documentazione di progetto.

**Criteri di successo**

- Il confronto delle fotografie (sezione 3) tra il punto di partenza e lo stato finale mostra
  solo differenze previste e documentate.
- Il numero di elementi `.katex`, Mermaid ed Expressive Code per pagina non cambia.
- `npm run check` e `npm run build` passano.
- Il report finale riporta tempo e picco di memoria della build, prima e dopo.

**Fuori ambito**

Restyling, correzioni visuali (progetto B), contenuti delle lezioni, funzionalità sperimentali,
CSP, cambio di hosting o di adapter.

## 3. La fotografia del sito

### Scopo

Rete di sicurezza: rende visibile ogni differenza di contenuto tra due build, così ogni passo
si verifica in modo oggettivo e non solo a vista.

### Interfaccia

Script `scripts/snapshot-site.ts`, esposto come `npm run snapshot:site`, con due modalità:

```bash
npm run snapshot:site -- capture --dist dist --out .snapshots/<nome>.json
npm run snapshot:site -- compare .snapshots/<a>.json .snapshots/<b>.json [--report <file.md>]
```

### Dati raccolti per ogni pagina

La chiave è il percorso relativo a `dist/`, per esempio `course/metriche-fondamenti/index.html`.

- `text`: testo visibile di `<body>`, esclusi `<script>`, `<style>`, `<noscript>` e `<template>`.
  Ogni sequenza di spazi bianchi viene ridotta a **uno** spazio, senza mai rimuoverla, così
  "percorso.Lezioni" ≠ "percorso. Lezioni".
- `title`, `metaDescription`, `canonical`.
- `headings`: H1–H3 in ordine, con il livello.
- `counts`: `katex` (`.katex`), `mermaid` (`pre.mermaid` o `.mermaid`), `codeBlocks`
  (`.expressive-code`), `images` (`img`).
- `internalLinks`: `href` che iniziano con `/`, ordinati e senza duplicati.

### Normalizzazioni per evitare falsi positivi

- Gli URL con hash sotto `/_astro/` diventano `/_astro/<asset>`.
- Le date ISO e i timestamp generati in build vengono mascherati, se compaiono nel testo.
- Sono esclusi i file non HTML e le pagine di solo redirect, cioè quelle prodotte da
  `normalize:redirects` con `<meta http-equiv="refresh">`.

### Output di `compare`

Un report Markdown (e un riepilogo su stdout) con:

- pagine aggiunte e rimosse;
- per ogni pagina cambiata, i campi diversi; per `text`, i frammenti attorno alla prima
  differenza (±40 caratteri) e il numero totale di differenze;
- totali per categoria.

Codice di uscita: `0` se non ci sono differenze, `1` se ce ne sono.

### Implementazione

- Parsing con `hast-util-from-html`, selezione con `hast-util-select` ed estrazione del testo
  con `hast-util-to-text`. Quest'ultima segue l'algoritmo di `innerText`: separa gli elementi
  di blocco e lascia attaccati quelli inline, che è esattamente il comportamento da
  osservare. Le tre librerie sono già nel lockfile come dipendenze transitive (2.0.3, 6.0.4,
  4.0.2) e vanno dichiarate esplicitamente in `devDependencies`.
- Le funzioni pure (`normalizeText`, `extractPage`, `comparePages`) stanno in
  `scripts/lib/site-snapshot.ts`, con test Vitest in `tests/site-snapshot.test.ts` scritti prima
  del codice.
- Le fotografie vanno in `.snapshots/`, aggiunta a `.gitignore`.

### Doppio uso

1. **Riferimento:** fotografia del codice di partenza (passo 0), poi confronto dopo ogni passo.
2. **Verifica `compressHTML`:** confronto tra una build con `compressHTML: true` e una con
   `'jsx'`. Ogni differenza di `text` è uno spazio perso.

## 4. I passi

Ogni passo è un commit atomico. Il passo 1 va fatto per primo; gli altri sono indipendenti e
vanno eseguiti nell'ordine indicato.

### Passo 0: punto di partenza

1. Script di fotografia e relativi test (sezione 3).
2. `npm run build` sul codice attuale.
3. Misura di tempo e picco di memoria del solo `astro build`, che è la parte su cui agiscono i
   passi:

   ```bash
   node --import ./scripts/measure-process.mjs node_modules/astro/bin/astro.mjs build
   ```

   `scripts/measure-process.mjs` è un modulo di preload che, all'evento `exit`, stampa
   `process.resourceUsage().maxRSS` (KB) e il tempo trascorso. Funziona allo stesso modo su
   Windows e Linux. Il percorso del binario di Astro va verificato nel `package.json` del
   pacchetto installato. Ogni misura si ripete due volte e si annotano entrambi i valori.
4. `capture` → `.snapshots/00-baseline.json`.

### Passo 1: dipendenze

| Pacchetto | Da | A |
|---|---|---|
| `astro` | 7.3.1 | ultima 7.3.x (oggi 7.3.8) |
| `@astrojs/starlight` | 0.42.0 | ultima 0.42.x (oggi 0.42.6) |
| `@astrojs/mdx` | ^7.0.0 (7.0.8) | ^8.0.0 |
| `@astrojs/react` | ^6.0.0 | ^7.0.0 |
| `@astrojs/sitemap` | 3.7.3 | ultima 3.7.x |
| `starlight-image-zoom` | 0.14.2 | ultima compatibile con Starlight 0.42 (oggi 0.16.x) |
| `astro-mermaid` | 2.0.4 | 2.1.x |
| `@astrojs/check` | 0.9.9 | ultima 0.9.x |

Note di compatibilità, verificate sui changelog:

- `@astrojs/react` 7 rimuove l'opzione `babel`, che il progetto non usa. Nessuna modifica al
  codice.
- `@astrojs/mdx` 8 delega MDX al processore markdown configurato (`unified()`), quindi i
  plugin remark/rehype restano attivi. Va verificato che `mdx({ optimize, gfm })` sia ancora
  accettato; se `gfm` è deprecato, si rimuove, perché `unified({ gfm: true })` lo copre già.
- Dopo l'installazione, `npm ls @astrojs/mdx` deve mostrare una sola versione.

**Atteso:** zero differenze nella fotografia.

### Passo 2: `compressHTML`

1. Build con `compressHTML: true` → `capture` → `.snapshots/02-html.json`.
2. Build con il default `'jsx'` → `capture` → `.snapshots/02-jsx.json`.
3. `compare`: ogni differenza di `text` è un punto da correggere nel sorgente `.astro`, con
   `{' '}` esplicito o sistemando il markup. Per la hero:
   `percorso.{' '}<br class="hidden sm:block"/>`.
4. **Regola di decisione:**
   - fino a circa 15 punti: si corregge e si mantiene il default `'jsx'`;
   - oltre: si imposta `compressHTML: true` in `astro.config.mjs` con un commento che spiega
     la scelta, e si correggono comunque i punti già trovati.
5. **Sito inglese.** Ogni stringa italiana modificata cambia hash, quindi va aggiunta a mano in
   `src/data/i18n/en-static-cache.json` con chiave `sha256(source)` e valore
   `{source, target, updatedAt}`. Poi si rifà una build completa e si verifica
   `dist/en/index.html`.

**Atteso:** rispetto al punto di partenza cambiano solo le stringhe corrette, con lo spazio in più.

### Passo 3: `prefetch`

```js
prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
```

Il prefetch scarica solo l'HTML e non esegue script, quindi GA4 non conta pagine viste in più.

**Atteso:** zero differenze di testo. Verifica a vista: nel pannello Network di
`astro preview`, il passaggio del mouse su un link di lezione avvia la richiesta.

### Passo 4: Fonts API

1. Spostare `public/fonts/{inter,montserrat}-latin-*.woff2` in `src/assets/fonts/`.
2. Configurare in `astro.config.mjs`:

   ```js
   fonts: [
     {
       provider: fontProviders.local(),
       name: 'Inter',
       cssVariable: '--font-inter',
       fallbacks: ['sans-serif'],
       options: { variants: [/* 400, 500, 600, 700 normal → src/assets/fonts/inter-latin-<w>-normal.woff2 */] },
     },
     {
       provider: fontProviders.local(),
       name: 'Montserrat',
       cssVariable: '--font-montserrat',
       fallbacks: ['sans-serif'],
       options: { variants: [/* 400, 500, 600, 700, 800 normal */] },
     },
   ],
   ```

3. In `src/styles/custom.css`:
   - rimuovere i nove blocchi `@font-face`;
   - rimuovere dal blocco `@theme` le definizioni di `--font-montserrat` e `--font-inter`,
     ora generate dalla Fonts API;
   - mantenere `--font-sans`, `--font-heading` e `--font-ui`, che le referenziano.
4. In `src/layouts/Layout.astro`:
   - sostituire i quattro `<link rel="preload" href="/fonts/...">` con
     `<Font cssVariable="--font-inter" preload={[{ weight: '500' }]} />` e
     `<Font cssVariable="--font-montserrat" preload={[{ weight: '700' }, { weight: '400' }, { weight: '500' }]} />`,
     così si conserva la priorità dei preload attuali;
   - verificare la forma esatta del filtro `preload` nella documentazione della versione
     installata.
5. Per le pagine Starlight: override del componente `Head`
   (`src/components/starlight/Head.astro`), che renderizza il `Head` predefinito più i due
   `<Font>`, registrato in `components` della configurazione Starlight.
6. Rimuovere le dipendenze `@fontsource/inter`, `@fontsource/montserrat` e `@fontsource/sora`,
   dopo aver verificato con una ricerca che non sono importate. `@fontsource/jetbrains-mono`
   resta, perché usata in `agenti-analisi-dati.astro`.

**Atteso:** zero differenze di testo.

**Verifica a vista:**

- titoli in Montserrat e testo in Inter su home, lezione e blog;
- nessun font di sistema visibile;
- nessun errore 404 su `/fonts/` nel pannello Network;
- nel `<head>` sono presenti i `@font-face` generati e i font di fallback con metriche
  calibrate.

### Passo 5: `deferRender`, solo se misurato

1. Due build complete, con e senza `deferRender: true` sui loader `corso` e `blog`, partendo
   ogni volta da una cache pulita (`node_modules/.astro` rimossa), più una seconda build a cache
   calda per ciascuna variante.
2. **Regola di decisione:** si adotta solo se il picco di memoria scende almeno del 20% e il
   tempo di build, a cache sia fredda sia calda, non sale più del 10%.
3. In entrambi i casi le misure vanno nel report. Se non si adotta, nessun commit di codice.

**Atteso, se adottato:** zero differenze nella fotografia.

### Passo 6: prova di Sätteri (usa e getta)

Su un ramo separato, da eliminare a fine prova:

1. `markdown.processor: satteri({ features: { math: true } })`, rimuovendo il wrapper,
   `remark-math` e `rehype-katex`.
2. Capire cosa produce `features.math` in HTML.
3. Cercare un plugin hast di Sätteri per KaTeX. Se non esiste, scriverne uno minimo che chiama
   `katex.renderToString` sui nodi math, con `displayMode` per `$$`.
4. Verificare che aside e direttive di Starlight, Expressive Code, Mermaid e i badge dei titoli
   funzionino senza wrapper.
5. Build e `compare` con la fotografia del passo precedente.

**Criteri di successo della prova:**

- il numero di `.katex` è identico in tutte le pagine;
- `text` è identico nelle pagine con formule, a parte differenze di sola tipografia (per
  esempio la punteggiatura "smart") da valutare caso per caso;
- nessun errore di build;
- tempo di build non peggiore di quello attuale.

**Esito:**

- **Passa:** migrazione vera in un commit separato sul ramo principale. Si eliminano il
  wrapper (circa 120 righe), `remark-math` e `rehype-katex`. Si aggiungono l'eventuale plugin
  KaTeX in `src/lib/markdown/`, con test. `@astrojs/markdown-remark` si rimuove solo se
  nessun pacchetto la richiede più: Starlight e MDX 8 la dichiarano tra le
  `peerDependencies`, quindi va controllato `peerDependenciesMeta` per capire se è opzionale.
- **Non passa:** il wrapper resta e riceve un commento che spiega cosa manca e quale rilascio
  attendere. Il report riporta l'esito.

### Passo 7: documentazione

In `CLAUDE.md`:

- "Astro 5" diventa "Astro 7";
- lo stato del processore markdown (Sätteri oppure `unified()` con il motivo);
- nei "Known MDX Gotchas", la regola di `compressHTML`: spazi tra elementi inline solo con
  `{' '}` (se si è tenuto `'jsx'`);
- il comando `npm run snapshot:site` e quando usarlo (aggiornamenti di dipendenze).

## 5. Verifica di ogni passo

Un passo si chiude solo se sono soddisfatti tutti i punti:

1. `npm run check` passa.
2. `npm run build` completa passa, inclusi `translate:static`, `normalize:redirects`,
   `index:search` e `audit:site`.
3. `compare` con la fotografia precedente mostra solo le differenze attese del passo.
4. Controllo a vista su `astro preview` (non sul dev server, perché l'ordine del CSS globale
   cambia solo in produzione), desktop e mobile:
   - `/`;
   - `/course/metriche-fondamenti/`;
   - `/course/advanced-sql/indice-window-functions/` (formule);
   - una lezione con Mermaid;
   - un articolo del blog;
   - `/en/`.

Prima di ogni commit si esegue `git checkout -- public/llms-full.txt`, perché la build lo
rigenera sempre.

## 6. Rollback

Ogni passo è un commit e si annulla con `git revert <sha>`. Solo il passo 1 è un prerequisito
degli altri: se un passo successivo fallisce, gli altri procedono.

## 7. Consegna

- Ramo `claude/astro-7-3-upgrade-be0c59` con un commit per passo, pronto per una PR. Il deploy
  resta manuale.
- Report in `docs/superpowers/reports/2026-10-astro-7x-report.md`:
  - tempo e memoria di build prima e dopo;
  - punti `compressHTML` corretti;
  - misure di `deferRender` e decisione;
  - esito della prova di Sätteri.

## 8. Rischi noti

| Rischio | Mitigazione |
|---|---|
| `starlight-image-zoom` 0.16 non compatibile con Starlight 0.42.6 | Controllare le `peerDependencies` prima di installare; altrimenti fermarsi all'ultima versione compatibile |
| Fonts API e `@theme` di Tailwind definiscono la stessa variabile | Rimuovere le definizioni da `@theme` (passo 4.3) e verificare il valore calcolato di `font-family` |
| Override di `Head` in Starlight che perde tag esistenti | L'override renderizza il `Head` predefinito e aggiunge soltanto; la fotografia confronta title, description e canonical |
| Build lunghe che rallentano l'iterazione | Il controllo a vista usa `astro preview` sulla build già fatta; le build complete servono solo per chiudere i passi |
