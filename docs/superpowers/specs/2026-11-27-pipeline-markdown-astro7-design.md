# Pipeline Markdown standard Astro 7: codice e diagrammi renderizzati in tutte le lezioni

Data: 2026-11-27 · Dimensione: piccola modifica (config + CSS + test), nessuna lezione toccata.

## Intento

Oggi nessun blocco di codice del sito è colorato e nessun diagramma Mermaid viene disegnato.
Nella build sono stati contati 736 `<pre>` semplici; ci sono 0 blocchi `expressive-code`, 0 blocchi
Shiki e 0 `.mermaid` (i blocchi `mermaid` sono 200). I sorgenti sono corretti: tutti i 738 blocchi
recintati dichiarano il linguaggio. La correzione va fatta **in modo globale** con la configurazione
standard di Astro 7 e **senza cambiare lo stile attuale** delle pagine.

## Causa

L'adattatore scritto a mano `withMarkdownProcessorCompat` in `astro.config.mjs` ricrea `unified()`
dopo il setup di ogni integrazione e ci rimette solo i plugin legacy (`markdown.remarkPlugins/rehypePlugins`).
`astro-expressive-code` 0.44.2 e `astro-mermaid` 2.1.0 si agganciano invece in modo nativo a
`config.markdown.processor` (`processor.options.rehypePlugins.push(...)` / `updateConfig({ markdown: { processor: unified({...}) } })`).
L'adattatore cancella questi plugin, mentre Expressive Code ha già impostato `syntaxHighlight: false`:
il risultato è nessuna colorazione e nessun Mermaid.
Fonte: guida di aggiornamento ad Astro v7 e reference di `markdown.processor` (docs Astro consultate via Context7, 2026-11-27).

## Obiettivi

- Tutti i blocchi `sql/python/bash/yaml/json/javascript/java/text` vengono renderizzati da Expressive Code (colori, pulsante copia, cornice).
- Tutti i blocchi `mermaid` vengono renderizzati come diagrammi.
- KaTeX e `rehypeStripCourseH1` continuano a funzionare come oggi (nessuna formula in errore, nessun H1 duplicato).
- L'aspetto attuale resta: fondo `#13151a`, bordo `#2a2d37`, raggio 0.5rem, font `Geist Mono`. Le pagine `/course` e il blog sono solo scure e non hanno `data-theme` (il selettore di tema non è montato): il codice usa sempre il tema scuro (`useDarkModeMediaQuery: false`); `github-light` esiste solo se un domani compare `data-theme='light'`.
- Un test di regressione rende impossibile che il problema torni senza che ce ne si accorga.

## Non-obiettivi

- Nessuna modifica ai file `.mdx` delle lezioni.
- Nessun passaggio a Sätteri.
- Nessun ridisegno della tipografia, delle tabelle o dei `<details>`.

## Anti-obiettivi (fallimento anche se "funziona")

- Cambia l'aspetto delle pagine al di fuori dei blocchi di codice.
- Spariscono le formule KaTeX o ricompare l'H1 duplicato.
- Su `/course/...` il codice è colorato ma manca il CSS di Expressive Code, oppure, con il sistema operativo in tema chiaro, il codice esce con i colori del tema chiaro su fondo scuro.
- Le formule `$...$` dentro i blocchi di codice vengono interpretate.

## Approcci considerati

| | Approccio | Esito |
|---|---|---|
| **A, scelto** | Rimuovere `withMarkdownProcessorCompat` e restare su `unified()` (`@astrojs/markdown-remark`); Expressive Code e Mermaid si agganciano in modo nativo. I colori di `.course-prose pre` passano in `expressiveCode.styleOverrides`. | Scelto dall'utente: è il rischio minimo, cambia un solo file di config e KaTeX resta intatto. |
| B | Migrare a Sätteri, il motore predefinito di Astro 7. | Scartato: bisogna portare remark-math/rehype-katex e lo strip dell'H1 su plugin Sätteri e non è stato trovato un supporto KaTeX ufficiale; il guadagno di velocità non serve (la build dura 18 s). |
| C | Togliere Expressive Code e usare lo Shiki nativo di Astro. | Scartato: si perdono il pulsante copia e le cornici, e Starlight continua a includere Expressive Code, quindi ci sarebbero due evidenziatori. |

## Design (decisioni prese)

1. `astro.config.mjs`: eliminare `legacyMarkdown`, `MARKDOWN_COMPAT_WRAPPED`,
   `MARKDOWN_LEGACY_INTEGRATION_NAMES`, `maybeWrapMarkdownIntegration`, `sanitizeMarkdownConfig`,
   `applyMarkdownProcessor` e `withMarkdownProcessorCompat`. `mermaid(...)` e `starlight(...)` diventano
   voci semplici di `integrations`. Resta il solo `markdown.processor: unified({ gfm: true, remarkPlugins: [remarkMath], rehypePlugins: [[rehypeKatex, { strict: 'ignore' }], rehypeStripCourseH1] })`.
2. MDX: `mdx({ optimize: true, gfm: true })` eredita il processor (`extendMarkdownConfig` è attivo per default).
3. Stile del codice: `expressiveCode.styleOverrides` riceve fondo, bordo e raggio uguali a quelli attuali
   (`codeBackground`, `borderColor`, `borderRadius`); in `custom.css` la regola `.course-prose pre { ... !important }`
   viene limitata ai `pre` che non appartengono a Expressive Code oppure rimossa. Le regole `.expressive-code`
   (righe ~331 e ~519) vanno riviste per evitare un doppio bordo.
4. Test di regressione (vitest su `dist/`, oppure uno script in `npm run build`): falliscono
   - un `<pre><code class="language-*">` in `dist/course/**` diverso da `language-math`;
   - un `language-mermaid` non trasformato;
   - una pagina (lezione o articolo del blog) con un numero di blocchi `.expressive-code` o `.mermaid` diverso dai fence del suo sorgente, confrontato pagina per pagina e non sul totale del sito. Il conteggio dei fence segue CommonMark: anche `~~~`, e un wrapper da 4 backtick con dentro un esempio da 3 conta un blocco solo;
   - un numero di `.katex` inferiore al valore di riferimento.

## Lasciato a chi implementa

- La posizione esatta del test (vitest con build oppure step in `build`): scelta in base ai tempi di CI.
- Il tema Mermaid resta `dark` come oggi; l'adattamento al tema chiaro è fuori scope.
- La verifica visiva con screenshot Playwright di una lezione SQL, una Python e una con Mermaid, in tema chiaro e scuro, prima e dopo.
