# Piano: pipeline Markdown standard Astro 7

Spec: `docs/superpowers/specs/2026-11-27-pipeline-markdown-astro7-design.md`

Global Constraints: nessun `.mdx` modificato; stile invariato fuori dai blocchi di codice; nessuna formula KaTeX in errore e almeno una formula KaTeX per ogni sorgente con `$$`.

Riferimenti visivi: prima di Task 2, screenshot di `advanced-sql/window-functions-avanzate`, una lezione Python e una con Mermaid (dark+light) in scratchpad.

## Task 1: audit del codice renderizzato (test di regressione)

Interfaces: produce `auditRenderedHtml(html): { plainCode: string[]; plainMermaid: number; ec: number; mermaid: number; katex: number }` e il CLI `scripts/check-rendered-code.ts` (`npm run check:rendered-code`), consumati da Task 2.

1. Scrivere `tests/rendered-code.test.ts` con fixture HTML: `<pre><code class="language-sql">` → plainCode `["sql"]`; `language-mermaid` → plainMermaid 1; `<div class="expressive-code">` → ec 1; `<pre class="mermaid">` → mermaid 1; `language-math` ignorato. Eseguire `npx vitest run tests/rendered-code.test.ts`. Expected: FAIL (modulo mancante).
2. Implementare `scripts/lib/rendered-code-audit.ts`. Expected: test PASS.
3. Il CLI percorre `dist/course/**/index.html` e conta i fence nei sorgenti `src/content/corso/**/*.mdx` (mermaid vs altri). Esce con codice 1 se plainCode > 0, se plainMermaid > 0, se ec < fence non-mermaid, se mermaid < fence mermaid, o se katex è in errore. Eseguire contro il `dist/` attuale. Expected: exit 1 (736 plain).
4. Aggiungere `check:rendered-code` a `package.json` e allo script `build`, subito dopo `astro build`. Commit.

## Task 2: rimuovere `withMarkdownProcessorCompat`

1. Eliminare lo shim da `astro.config.mjs` (vedi spec, Design §1); `mermaid()` e `starlight()` diventano integrazioni semplici.
2. Eseguire `npx astro build`, poi `npm run check:rendered-code`. Expected: exit 0, ec = 536 (= fence), mermaid = 200.
3. Commit.

## Task 3: stile del codice invariato

1. `expressiveCode.styleOverrides`: `codeBackground: '#13151a'`, `borderColor: '#2a2d37'`, `borderRadius: '0.5rem'`, mantenendo i font.
2. `custom.css`: rimuovere la regola `.course-prose pre { … !important }`; rivedere `.expressive-code` (bordo duplicato).
3. Build, screenshot dopo (dark+light) da confrontare con i riferimenti. Expected: fondo e bordo uguali, nessun doppio bordo, testo colorato, pulsante copia.
4. `npm run test` più `npm run check:rendered-code`. Expected: tutto verde. Commit.

## Review Focus

- Le pagine `/course` sono solo scure e senza `data-theme`: il codice usa sempre il tema scuro (`useDarkModeMediaQuery: false`).
- Il CSS di Expressive Code viene caricato sulle pagine `/course`.
- Le lezioni con `$` nei blocchi di codice: KaTeX non deve interpretarli.
- Gli H1 duplicati non devono ricomparire (`rehypeStripCourseH1` è ancora attivo).

## Aggiornamento (PR successiva)

Il controllo `check:rendered-code` confronta ora pagina per pagina sorgente e HTML (lezioni e blog), segue CommonMark per i fence, sostituisce la soglia esatta di KaTeX con "nessuna formula in errore e almeno una formula per ogni sorgente con `$$`" e scansiona tutto `dist` per blocchi non renderizzati. `blog-en` non ha una pagina per sorgente (si pubblicano solo traduzioni riviste) ed è coperto dalla sola scansione generale.
