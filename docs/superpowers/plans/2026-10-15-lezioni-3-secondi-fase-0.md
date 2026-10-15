# Lezioni «3 secondi» — Fase 0 (componenti + pilota) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Costruire la libreria di componenti «3 secondi» per le lezioni del sito, con controllo automatico, versione per agenti e traduzione EN, e riscrivere la lezione pilota `real-time-analytics/clickhouse-fondamenti`.

**Architecture:** Componenti Astro in `src/components/lezione/` con solo attributi stringa, un tag per riga, stilizzati da `src/styles/lezione.css` (variabili `--lz-*` per tema scuro e chiaro). La logica pura (etichette, evidenziazioni, passi) sta in moduli TypeScript testati con vitest. Il template della lezione passa i componenti all'MDX e mette il contesto della lezione in `Astro.locals`. Un validatore dedicato controlla le regole del formato solo sulle lezioni `formato: "3s"`.

**Tech Stack:** Astro 7.3 + Starlight + MDX, TypeScript, vitest 3, CSS puro, JavaScript vanilla per lo stepper.

**Spec:** `docs/superpowers/specs/2026-10-15-lezioni-3-secondi-design.md` (regole didattiche: `docs/lezioni/prompt-3-secondi.md`).

> **Aggiornamento dopo il Task 8 (richieste dell'autore, spec §12a):** `<Slide>` è una figura nel testo (niente cornice 16:9, etichetta, barra); `<Schema>` mostra tutti i passi senza stepper (lo stepper del Task 5 è stato rimosso); nuovi `<Obiettivi />` e `<Pattern si no />`; regola 8 del validatore; tolti dal template i box «Cosa imparerai» / «Collegamenti» e le etichette delle card. Nel Task 12 le verifiche su pulsanti e tastiera dello schema non si applicano più: si verifica che tutte le viste siano visibili e che ogni figura abbia spiegazione e pattern.

## Global Constraints

- Branch `claude/lezioni-3-secondi` (impilato sulla PR #102 `claude/analizza-corsi-structure-f4afab`). Un commit per task; push e PR solo nel Task 12.
- `npm run build`, `astro check` e `astro preview` si lanciano dalla copia nello scratchpad (bug tsconfig nelle worktree annidate: robocopy della worktree escludendo `node_modules dist .git .superpowers .astro graphify-out BI`, junction di `node_modules`). `vitest` e `npm run validate:content` girano nella worktree.
- Colori, solo come variabili in `src/styles/lezione.css`:

  | Variabile | Scuro | Chiaro |
  |---|---|---|
  | `--lz-bg` | `#0d0f14` | `#f4f5f7` |
  | `--lz-card` | `#1e2128` | `#e2e5ea` |
  | `--lz-code-bg` / `--lz-code-fg` | `#08090d` / `#e4e6ec` | `#ffffff` / `#1a1d26` |
  | `--lz-accent` | `#ccff00` | `#ccff00` (solo riempimento) |
  | `--lz-accent-line` | `#ccff00` | `#1a1d26` |
  | `--lz-on-accent` | `#08090d` | `#08090d` |
  | `--lz-off` | `#2a2d36` | `#c2c7cf` |
  | `--lz-line` | `#646878` | `#7a7f8c` |
  | `--lz-text-2` | `#9498a3` | `#565b66` |
  | `--lz-cell-light` | `#e4e6ec` | `#ffffff` |
  | `--lz-divider` | `#1e2128` | `#e2e5ea` |
  | `--lz-text` | `#ffffff` | `#1a1d26` |

  Temi: `:root[data-theme='dark']` e `:root[data-theme='light']`. Nel tema chiaro il lime non è mai colore di testo o di bordo.
- Font `Verdana, Geneva, sans-serif` solo dentro gli elementi `.lz-*`; il resto dell'articolo resta nel font del sito.
- Classi con prefisso `lz-`. Nessuno stile scoped che debba vincere su `custom.css` (in produzione `custom.css` arriva dopo): ogni verifica visiva su build + preview, mai su `dev`.
- Testo mai sotto 12px. Etichetta di sezione in maiuscolo **via CSS** (`text-transform`), così la cache EN traduce la forma normale.
- Ogni tag dei componenti della lezione sta su **una riga** e usa **solo attributi stringa** (`nome="…"`), mai espressioni `{…}` (eccezione: `QuizExercise`, che resta com'è). Booleani come `evidenzia="si"`. Gli esempi della spec con `sezione={2}` qui si scrivono `sezione="2"`: versione per agenti e validatore leggono l'MDX riga per riga con regex.
- Dentro gli schemi solo HTML/CSS e SVG inline: nessuna immagine raster.
- Lezioni: invariati `title`, nome file (URL), `headerImage`, `order`, `prerequisites`; nessun fatto inventato; lingua secondo il Passo 7 del prompt (frasi 5–10 parole, «noi», presente, niente passivo).

## Review Focus

- **Senza JavaScript, in stampa, nel PDF:** uno `<Schema>` mostra tutte le viste una sotto l'altra. → Task 5 (HTML del server senza `hidden`) e Task 12 (controllo sull'HTML generato).
- **Tema chiaro:** il lime usato come testo o bordo diventa illeggibile su fondo chiaro. → Task 3 (regole CSS) e Task 12 (stile calcolato nel browser in tema chiaro).
- **Due schemi nella stessa pagina:** pulsanti e frecce di uno non muovono l'altro; le frecce agiscono solo con il focus dentro lo schema. → Task 5 (test di `nextStep`/`stepFromKey`) e Task 12 (prova da tastiera).
- **Tag su più righe o con `{…}`:** romperebbero versione per agenti e validatore in silenzio. → Task 7 (errore bloccante) e Task 6 (test che nessun tag `lz` resti nel Markdown).
- **Schermo stretto (375px):** confronto a 5 criteri o mini-tabella con molte colonne non devono allargare la pagina. → Task 4 (scroll orizzontale interno alla figura) e Task 12 (screenshot mobile).

## API dei componenti (riferimento per tutti i task)

Tutti in `src/components/lezione/`, esportati dalla mappa `lezioneComponents` in `src/components/lezione/index.ts`. Gli attributi `passo="n"` (pezzo che compare al passo n dentro uno `<Schema>`) sono opzionali su tutti i figli marcati ‡.

| Tag | Attributi | Note |
|---|---|---|
| `<Slide sezione titolo messaggio>…</Slide>` | `sezione` (numero), `titolo` (≤ 6 parole), `messaggio` (≤ 12 parole), `didascalia?` | `<figure>`: titolo, etichetta, area disegno (slot), ★, barra |
| `<Percorso />` | — | pillole da `Astro.locals.lezione.sezioni`, testo «Lezione {numero} di {totale}» |
| `<Messaggio autore?>testo</Messaggio>` | `autore?` (citazione, prompt K) | riquadro ★ |
| `<Domanda risposta>testo</Domanda>` | `risposta` | `<details>` «Mostra risposta» |
| `<ErroreTipico sbagliato giusto>` + slot `sbagliato`/`giusto` opzionali | `sbagliato`, `giusto` | ✗ a sinistra, ✓ a destra |
| `<Confronto>` + `<Lato nome sottotitolo esempio? scelta?/>`‡ ×2 + `<Criterio nome a b/>`‡ ≤ 5 | `scelta` = testo della pillola («ClickHouse punta qui») | |
| `<Passi>` + `<Fase nome testo evidenzia?/>`‡ 3–4 | | cerchi numerati + chevron |
| `<Opzioni>` + `<Opzione nome testo verdetto="si\|no"/>`‡ 2–4 | | |
| `<MiniTabella colonne righe evidenzia? separa? didascalia?/>` | `colonne` = «a,b,c»; `righe` = numero; `evidenzia` = grammatica sotto; `separa` = passo da cui le colonne si staccano | scroll orizzontale interno |
| `<TabellaDati evidenzia?>` tabella Markdown `</TabellaDati>` | `evidenzia` = righe 1-based «2,4» | max 8 × 4 |
| `<Barre>` + `<Barra nome valore etichetta? tipo="evidenzia\|normale\|vuoto"/>`‡ | altezza ∝ `valore` / massimo | |
| `<NumeriGrandi>` + `<Numero valore testo/>`‡ ≤ 3 | | numeri sempre in accento (non contano nel limite) |
| `<Relazioni centro>` + `<Nodo nome/>`‡ ≤ 6 | | centro in accento |
| `<Schema sezione titolo>` + `<Passo testo/>` ×3–6 + un disegno | | una vista per passo (Task 5) |

Grammatica di `evidenzia` per `<MiniTabella>`: voci separate da `;`, ognuna `col:<nome>` | `row:<n>` | `cell:<n>,<nome>`, con suffisso opzionale `@<passo>` (accento solo da quel passo, dentro uno `<Schema>`).

---

### Task 1: Campi `formato` e `sezioni` nello schema `corso`

**Files:**
- Modify: `src/lib/schemas.ts` (oggetto `corsoSchema`)
- Test: `tests/schemas.test.ts`

**Interfaces:**
- Produces: `corsoSchema` accetta `formato?: '3s'` e `sezioni?: string[]` (3–6 voci non vuote).

- [ ] **Step 1: Test che falliscono** in `tests/schemas.test.ts`, nello stile dei test esistenti:
  - `accetta formato "3s" con 4 sezioni` → `corsoSchema.safeParse({...base, formato: '3s', sezioni: ['A','B','C','D']}).success === true`
  - `rifiuta formato diverso da "3s"` → `formato: 'slide'` → `success === false`
  - `rifiuta sezioni fuori da 3–6` → 2 voci e 7 voci → entrambe `success === false`
  - `rifiuta una sezione vuota` → `['A','','C']` → `success === false`
- [ ] **Step 2:** `npx vitest run tests/schemas.test.ts` → FAIL sui 4 test nuovi.
- [ ] **Step 3:** In `corsoSchema` aggiungi `formato: z.literal('3s').optional()` e `sezioni: z.array(z.string().trim().min(1)).min(3).max(6).optional()`.
- [ ] **Step 4:** `npx vitest run tests/schemas.test.ts` → PASS; `npm run validate:content` → exit 0.
- [ ] **Step 5:** Commit `feat(lezione): campi formato e sezioni nello schema corso`.

### Task 2: Logica pura delle lezioni

**Files:**
- Create: `src/lib/lezione/model.ts`
- Test: `src/lib/lezione/model.test.ts`

**Interfaces:**
- Produces:
  - `type LezioneContext = { sezioni: string[]; numero: number; totale: number; moduloTitolo: string }`
  - `sectionLabel(ctx: LezioneContext | undefined, sezione: number): string` → `"2 · Leggere poco"`; lancia `Error` se `ctx` manca o `sezione` è fuori da `1..sezioni.length` (la build deve fallire in modo esplicito).
  - `progressSegments(totale: number, attiva: number): boolean[]` → `true` solo all'indice `attiva - 1`.
  - `type Evidenza = { tipo: 'col' | 'row' | 'cell'; colonna?: string; riga?: number; passo?: number }`
  - `parseEvidenzia(spec: string | undefined, colonne: string[]): Evidenza[]` → lancia `Error` su voce malformata o colonna sconosciuta.
  - `cellMark(evidenze: Evidenza[], riga: number, colonna: string): { statico: boolean; passo?: number }` → `statico` se una voce senza `@` copre la cella; `passo` = il più piccolo `@n` che la copre.
  - `parseRighe(spec: string | undefined): number[]` per `TabellaDati` (`"2,4"` → `[2,4]`).

- [ ] **Step 1: Test che falliscono:**
  - `sectionLabel({sezioni:['Righe e colonne','Leggere poco','MergeTree'],…}, 2)` → `'2 · Leggere poco'`; con `4` → lancia; con `undefined` → lancia.
  - `progressSegments(4, 2)` → `[false, true, false, false]`.
  - `parseEvidenzia('col:amount@3;row:2', ['order_id','amount'])` → `[{tipo:'col',colonna:'amount',passo:3},{tipo:'row',riga:2}]`; `parseEvidenzia('col:prezzo', ['amount'])` → lancia; `parseEvidenzia('riga:2', […])` → lancia; `parseEvidenzia(undefined, […])` → `[]`.
  - `cellMark(parseEvidenzia('col:amount@3;cell:2,order_id', cols), 2, 'order_id')` → `{statico:true}`; `cellMark(…, 1, 'amount')` → `{statico:false, passo:3}`.
  - `parseRighe('2,4')` → `[2,4]`; `parseRighe(undefined)` → `[]`.
- [ ] **Step 2:** `npx vitest run src/lib/lezione/model.test.ts` → FAIL (modulo inesistente).
- [ ] **Step 3:** Implementa le funzioni in `src/lib/lezione/model.ts` con le firme sopra.
- [ ] **Step 4:** stesso comando → PASS.
- [ ] **Step 5:** Commit `feat(lezione): logica pura per etichette, barra ed evidenziazioni`.

### Task 3: Stili, componenti base e collegamento al template

**Files:**
- Create: `src/styles/lezione.css`, `src/components/lezione/{Slide,Percorso,Messaggio,Domanda,ErroreTipico}.astro`, `src/components/lezione/index.ts`
- Modify: `src/pages/course/[module]/[slug].astro` (prima di `render(entry)` e riga `<Content />` ~436), `src/env.d.ts`

**Interfaces:**
- Consumes: `LezioneContext`, `sectionLabel`, `progressSegments` (Task 2).
- Produces: `lezioneComponents` (oggetto tag → componente; i task 4–5 vi aggiungono i loro); `Astro.locals.lezione: LezioneContext | undefined`; classi `.lz-slide`, `.lz-msg`, `.lz-domanda`, `.lz-errore`, `.lz-percorso`, `.lz-accento`, `.lz-visto`.

- [ ] **Step 1:** In `src/env.d.ts` dichiara `namespace App { interface Locals { lezione?: import('./lib/lezione/model').LezioneContext } }`.
- [ ] **Step 2:** Nel template, solo se `entry.data.formato === '3s'`, imposta `Astro.locals.lezione = { sezioni: entry.data.sezioni ?? [], numero: posizione nel modulo (indice in moduleLessons ordinati per order + 1), totale: moduleLessons.length, moduloTitolo: moduleData?.title ?? '' }`; sostituisci `<Content />` con `<Content components={lezioneComponents} />`. `lezione.css` si importa dentro i componenti (non nel template), così arriva solo nelle pagine che li usano. Se `Astro.locals.lezione` non risulta visibile ai componenti renderizzati dentro `<Content>`, **fermati e segnalalo**: la ricaduta della spec (`sezioni={frontmatter.sezioni}`) viola la regola degli attributi stringa e va decisa con l'autore.
- [ ] **Step 3:** `lezione.css`: variabili `--lz-*` (Global Constraints) per i due temi, font Verdana su `.lz-*`, cornice `.lz-slide` con `aspect-ratio: 16 / 9` sopra i 640px e altezza libera sotto, etichetta maiuscola via `text-transform`, riquadro ★ (bordo `--lz-accent-line`, stella `--lz-accent`), barra a segmenti, segni ✓/✗/cerchio numerato/chevron, `.lz-accento` (riempimento `--lz-accent`, testo `--lz-on-accent`). Nel tema chiaro nessuna regola usa `--lz-accent` come `color` o `border-color`.
- [ ] **Step 4:** Componenti base secondo l'API: `Slide` (lancia tramite `sectionLabel` se la sezione non esiste), `Percorso` (una pillola per ogni voce di `sezioni`, tutte uguali perché il percorso apre la lezione, più «Lezione {numero} di {totale}» con `Lezione`, `numero`, `di`, `totale` in `<span>` separati per la cache EN), `Messaggio`, `Domanda` (`<details><summary>Mostra risposta</summary>`), `ErroreTipico` (titoli fissi «Sbagliato» e «Giusto»).
- [ ] **Step 5:** `npx vitest run` → PASS (nessuna regressione); dalla copia: `npx astro check` → 0 errori; `npm run build` → exit 0 e le 778 pagine IT invariate (nessuna lezione usa ancora i componenti).
- [ ] **Step 6:** Commit `feat(lezione): stili, componenti base e contesto della lezione`.

### Task 4: Disegni del catalogo

**Files:**
- Create: `src/components/lezione/{Confronto,Lato,Criterio,Passi,Fase,Opzioni,Opzione,MiniTabella,TabellaDati,Barre,Barra,NumeriGrandi,Numero,Relazioni,Nodo}.astro`
- Modify: `src/components/lezione/index.ts`, `src/styles/lezione.css`

**Interfaces:**
- Consumes: `parseEvidenzia`, `cellMark`, `parseRighe` (Task 2).
- Produces: i tag della tabella API; ogni figlio ‡ con `passo="n"` scrive `data-passo="n"` sul proprio elemento radice; le celle di `MiniTabella` con `cellMark().passo` scrivono `data-accento="n"`, quelle statiche hanno `.lz-accento`; `MiniTabella` con `separa="n"` scrive `data-separa="n"`.

- [ ] **Step 1:** Implementa i componenti secondo la tabella API e il Passo 5 del prompt (layout A, B, C, D, E, F, G, I). `Barra` riceve dal genitore il massimo via CSS custom property calcolata in `Barre` (`--lz-max`), oppure `Barre` passa l'altezza in percentuale: scelta libera, l'altezza deve essere proporzionale a `valore`.
- [ ] **Step 2:** `MiniTabella` e `Confronto` stanno dentro un contenitore `overflow-x: auto` largo al massimo quanto la figura: a 375px la pagina non scorre in orizzontale.
- [ ] **Step 3:** Aggiungi i tag a `lezioneComponents`.
- [ ] **Step 4:** Dalla copia: `npx astro check` → 0 errori; `npm run build` → exit 0.
- [ ] **Step 5:** Commit `feat(lezione): disegni del catalogo (confronto, passi, opzioni, tabelle, barre, numeri, relazioni)`.

### Task 5: Schema che cresce

**Files:**
- Create: `src/components/lezione/Schema.astro`, `src/components/lezione/Passo.astro`, `src/components/lezione/schema-stepper.ts`
- Modify: `src/components/lezione/index.ts`, `src/styles/lezione.css`
- Test: `src/components/lezione/schema-stepper.test.ts`

**Interfaces:**
- Consumes: `data-passo`, `data-accento`, `data-separa` (Task 4); `sectionLabel`.
- Produces: `nextStep(current: number, delta: -1 | 1, total: number): number` (limitato a `1..total`, senza giro); `stepFromKey(key: string): -1 | 0 | 1` (`ArrowLeft` → -1, `ArrowRight` → 1, altro → 0); `initSchemas(root: ParentNode): void`.

- [ ] **Step 1: Test che falliscono:** `nextStep(1,-1,4) === 1`, `nextStep(4,1,4) === 4`, `nextStep(2,1,4) === 3`; `stepFromKey('ArrowRight') === 1`, `stepFromKey('ArrowLeft') === -1`, `stepFromKey('Enter') === 0`.
- [ ] **Step 2:** `npx vitest run src/components/lezione/schema-stepper.test.ts` → FAIL.
- [ ] **Step 3:** `schema-stepper.ts`: le due funzioni pure + `initSchemas`, che per ogni `.lz-schema` aggiunge la classe `lz-js`, mostra la vista 1, collega ◀ ▶ e i cerchi, ascolta i tasti sul solo elemento `.lz-schema` (con `tabindex="0"`) e aggiorna una regione `aria-live="polite"` con la riga del passo. Rispetta `prefers-reduced-motion`.
- [ ] **Step 4:** `Schema.astro`: legge i `<Passo testo>` dallo slot `passi` o li riceve come figli iniziali (scelta libera, purché l'autore scriva solo `<Passo testo="…"/>` dentro `<Schema>`), renderizza lo slot del disegno una volta per passo con `Astro.slots.render` e avvolge ogni copia in `<div class="lz-vista" data-attuale="i">` con la riga «Passo i di N — testo» (parole fisse in `<span>` separati). Nessuna vista ha `hidden` nell'HTML del server. Regole CSS enumerate fino a 6: `[data-passo]` con valore > `data-attuale` nascosto, = attuale in accento, < attuale in `.lz-visto`; stessa logica per `data-accento`; `data-separa` ≤ attuale aggiunge spazio tra le colonne. Con `.lz-js` si vede una vista alla volta. Script caricato con `<script>` di Astro che importa `initSchemas`.
- [ ] **Step 5:** `npx vitest run` → PASS; dalla copia `npx astro check` → 0 errori.
- [ ] **Step 6:** Commit `feat(lezione): schema che cresce con viste per passo e stepper accessibile`.

### Task 6: Versione per agenti

**Files:**
- Create: `src/lib/lezione/agent.ts`
- Modify: `src/lib/agent-markdown.ts` (`KNOWN_COMPONENTS`, ciclo di `mdxToAgentMarkdown`)
- Test: `src/lib/lezione/agent.test.ts`, `src/lib/agent-markdown.test.ts`

**Interfaces:**
- Produces: `type AgentState = { passo: number }`; `convertLezioneLine(line: string, state: AgentState): string | null` → `null` se la riga non è un tag della lezione, altrimenti il Markdown (anche `''` per tag di sola apertura/chiusura).

Conversioni (attributi letti con la stessa `attr()` di `agent-markdown.ts`):

| Tag | Markdown |
|---|---|
| `<Slide titolo messaggio>` | `**{titolo}** — ★ {messaggio}` |
| `</Slide>`, `<Confronto>`, `</Confronto>`, `<Passi>`, `</Passi>`, `<Opzioni>`, `</Opzioni>`, `<Barre>`, `</Barre>`, `<NumeriGrandi>`, `</NumeriGrandi>`, `</Relazioni>`, `</Schema>`, `</ErroreTipico>`, `<Percorso />`, `<TabellaDati …>`, `</TabellaDati>` | `''` |
| `<Schema titolo>` | `**{titolo}**` e `state.passo = 0` |
| `<Passo testo>` | `{++state.passo}. {testo}` |
| `<Lato nome sottotitolo esempio? scelta?>` | `- **{nome}**: {sottotitolo}` + `` (`{esempio}`) `` se c'è + ` ← {scelta}` se c'è |
| `<Criterio nome a b>` | `- {nome}: {a} / {b}` |
| `<Fase nome testo>` | `- **{nome}**: {testo}` |
| `<Opzione nome testo verdetto>` | `- ✓ **{nome}**: {testo}` oppure `- ✗ …` |
| `<MiniTabella colonne righe evidenzia? didascalia?>` | `Tabella: {colonne con ", "} ({righe} righe)` + `; evidenziato: {voci leggibili}` + ` — {didascalia}` |
| `<Barra nome valore etichetta?>` | `- {nome}: {etichetta ?? valore}` |
| `<Numero valore testo>` | `- **{valore}** {testo}` |
| `<Relazioni centro>` / `<Nodo nome>` | `**{centro}** è collegato a:` / `- {nome}` |
| `<Messaggio autore?>testo</Messaggio>` | `> ★ {testo}` + ` — {autore}` se c'è |
| `<Domanda risposta>testo</Domanda>` | `**Domanda:** {testo} — *Risposta:* {risposta}` |
| `<ErroreTipico sbagliato giusto>` | `- ✗ {sbagliato}` + a capo + `- ✓ {giusto}` |

- [ ] **Step 1: Test che falliscono** in `agent.test.ts`: una riga per conversione della tabella (valori con apostrofo e «» inclusi); `convertLezioneLine('Testo normale', s) === null`; la sequenza `<Schema titolo="X">`, tre `<Passo …/>` produce `1.`, `2.`, `3.`.
- [ ] **Step 2:** In `agent-markdown.test.ts`: un corpo MDX con tutti i tag della tabella → il risultato non contiene `<` seguito da maiuscola fuori dai blocchi di codice, e contiene `> ★`, `1. `, `✗`, `✓`.
- [ ] **Step 3:** `npx vitest run src/lib/lezione src/lib/agent-markdown.test.ts` → FAIL.
- [ ] **Step 4:** Implementa `convertLezioneLine`; in `mdxToAgentMarkdown`, prima del ramo dei widget sconosciuti, prova `convertLezioneLine(raw.trim(), state)` e, se non è `null`, spingi il risultato (righe vuote comprese, senza duplicarle). Aggiungi i tag a `KNOWN_COMPONENTS`.
- [ ] **Step 5:** stesso comando → PASS; `npx vitest run` → PASS (i test esistenti non cambiano).
- [ ] **Step 6:** Commit `feat(lezione): versione Markdown per agenti dei componenti 3 secondi`.

### Task 7: Validatore del formato «3 secondi»

**Files:**
- Create: `scripts/lezioni-3s-rules.ts`, `scripts/validate-lezioni-3s.ts`
- Modify: `package.json` (`"validate:3s": "tsx scripts/validate-lezioni-3s.ts"`; `check` diventa `npm run validate:content && npm run validate:3s && astro check && npm run test`)
- Test: `scripts/lezioni-3s-rules.test.ts`

**Interfaces:**
- Produces: `checkLezione3s(raw: string, rel: string): { errors: string[]; warnings: string[] }`. La CLI controlla solo i file in `src/content/corso/**` con `formato: "3s"`, stampa gli esiti ed esce con 1 se c'è almeno un errore.

Regole (errori, dalla spec §8):
1. `sezioni` 3–6; le H2 escluse `Riepilogo` e `Pratica` coincidono con `sezioni`, nello stesso ordine.
2. `learningObjectives` esattamente 3.
3. Ogni tag dei componenti della lezione su una riga e senza `={`.
4. `<Slide>`: `titolo` ≤ 6 parole; `messaggio` ≤ 12; parole visibili ≤ 30 (somma di `titolo`, `messaggio`, `didascalia` e, nei figli, `nome`, `sottotitolo`, `testo`, `a`, `b`, `etichetta`; esclusi `esempio`, `colonne` e i blocchi di codice); elementi in accento ≤ 2 (ogni `scelta=`, ogni `evidenzia="si"`, ogni voce di `evidenzia` di `MiniTabella`/`TabellaDati`, ogni `tipo="evidenzia"`; `<Numero>` non conta).
5. 2–3 `<Schema>`, ciascuno con 3–6 `<Passo>` e seguito, prima della H2 successiva, da almeno un `<Messaggio>` e una `<Domanda>`.
6. Ogni sezione di `sezioni` termina (ultimo componente prima della H2 successiva) con una `<Domanda>`.
7. `## Riepilogo` contiene esattamente 3 `<Messaggio>` e un `QuizExercise` con 5 domande (5 occorrenze di `correctIndex`).

Avviso: frase di prosa (fuori da tag, codice e tabelle) oltre 20 parole.

- [ ] **Step 1: Test che falliscono:** costruisci nel test una lezione minima valida (stringa) → `errors` vuoto; poi una mutazione per regola, ciascuna con il suo errore atteso (es. titolo di 7 parole → errore che cita `titolo`; `<Slide` spezzato su due righe → errore regola 3; 3 accenti → errore regola 4; un solo `<Schema>` → errore regola 5; Riepilogo con 2 `<Messaggio>` → errore regola 7); frase di 25 parole → un `warning`.
- [ ] **Step 2:** `npx vitest run scripts/lezioni-3s-rules.test.ts` → FAIL.
- [ ] **Step 3:** Implementa `checkLezione3s` e la CLI.
- [ ] **Step 4:** test → PASS; `npm run validate:3s` → «0 lezioni 3s» ed exit 0 (nessuna lezione è ancora `formato: "3s"`).
- [ ] **Step 5:** Commit `feat(lezione): validatore del formato 3 secondi in npm run check`.

### Task 8: Piano della lezione pilota — **gate dell'autore**

**Files:**
- Create: `docs/lezioni/12-real-time-analytics.md`

- [ ] **Step 1:** Scrivi il piano per `real-time-analytics/clickhouse-fondamenti` con il formato della spec §7: lezione prima/dopo (`streaming` / `clickhouse-ottimizzazione`), 3 obiettivi (riformulazione dei `learningObjectives` attuali), 4 sezioni (la prima si apre con un `<Confronto>` row-oriented / column-oriented: carico transazionale = OLTP, carico analitico = OLAP, con `scelta` sul colonnare, come l'Esempio 1 del prompt), 2 spiegazioni con schema — (a) «Perché leggiamo solo alcune colonne» (mini-tabella che cambia, 4 passi, dati della lezione: 100 milioni di ordini × 100 colonne, query su una colonna, 100 volte più byte nel row-oriented; tabella `ordini` con `id_ordine`, `id_utente`, `importo`, `data_transazione`); (b) «Come MergeTree salta i dati» (flusso o strati: partizione mensile `toYYYYMM(ts)` → `ORDER BY (utente_id, ts)` → insert in batch → parti e merge) —, tabella sezione · slide · messaggio · disegno · domanda, cosa si toglie (la «sequenza di lavoro» diventa `<Passi>`; le 5 domande di ripasso diventano quiz), dubbi sui fatti (es. «oltre 20 miliardi di righe al giorno su singoli cluster» da verificare sulla documentazione ClickHouse/Yandex).
- [ ] **Step 2:** Commit `docs(lezioni): piano della lezione pilota clickhouse-fondamenti`.
- [ ] **Step 3: STOP.** Mostra il piano all'autore e attendi l'approvazione esplicita (o le correzioni) prima del Task 9.

### Task 9: Riscrittura della lezione pilota

**Files:**
- Modify: `src/content/corso/real-time-analytics/clickhouse-fondamenti.mdx`

**Interfaces:**
- Consumes: tutti i componenti (Task 3–5), il piano approvato (Task 8).

- [ ] **Step 1:** Frontmatter: aggiungi `formato: "3s"` e `sezioni` del piano; `learningObjectives` = i 3 obiettivi approvati; tutto il resto invariato (`dateModified` alla data del giorno). Niente slide «obiettivi» nel corpo: li mostra già il box «Cosa imparerai» del template.
- [ ] **Step 2:** Corpo secondo la spec §5 e il piano: `<Percorso />`, gancio (≥ 120 caratteri), slide ponte con `streaming`, le 4 sezioni con slide di apertura e `<Domanda>` finale, le 2 spiegazioni complete (problema → `<Schema>` → esempio vero → `<ErroreTipico>` → `<Messaggio>` → `<Domanda>`), il blocco `CREATE TABLE eventi_web` conservato, il caso Yandex.Metrica, `## Riepilogo` con 3 `<Messaggio>` e `QuizExercise` da 5 domande (`quizId="real-time-analytics-clickhouse-fondamenti"`, import invariato dallo stile delle altre lezioni) e frase ponte verso `clickhouse-ottimizzazione`. Tutti i fatti e i numeri della versione attuale restano.
- [ ] **Step 3:** `npm run validate:3s` → 0 errori; `npm run validate:content` → exit 0 e nessun avviso editoriale per questa lezione; `npx vitest run` → PASS.
- [ ] **Step 4:** Commit `feat(corso): lezione pilota clickhouse-fondamenti nel formato 3 secondi`.

### Task 10: Traduzione inglese del pilota

**Files:**
- Modify: `src/data/i18n/en-static-cache.json`

- [ ] **Step 1:** Dalla copia: `npm run build`. Crea una copia **non committata** di `scripts/translate-static-en.ts` che subito dopo la riga `console.log(\`[translate:static] ${strings.size} unique strings found, ${missingItems.length} missing\`);` scrive `missingItems` in un JSON ed esce. Eseguila sul branch base (PR #102) e su questo branch; le stringhe introdotte sono quelle mancanti qui e non nel base.
- [ ] **Step 2:** Traduci tutte le stringhe introdotte (testo della lezione e parole fisse dei componenti: «Passo», «di», «Lezione», «Mostra risposta», «Sbagliato», «Giusto», etichette dei pulsanti) con le regole di lingua semplice; scrivile nella cache come `entries[sha256(source)] = { source, target, updatedAt }` e salva con `JSON.stringify(cache, null, 2) + '\n'`.
- [ ] **Step 3:** Nuova build dalla copia; ripeti l'estrazione → stringhe introdotte e scoperte: 0. `npx vitest run` → PASS.
- [ ] **Step 4:** Commit `i18n(en): traduzione della lezione pilota e dei componenti 3 secondi`.

### Task 11: Aggiornare la documentazione del progetto

**Files:**
- Modify: `CLAUDE.md` (sezioni «Markdown Extensions» e «Key Paths»: componenti `src/components/lezione/`, regola un tag per riga e solo attributi stringa, `formato: "3s"`, `npm run validate:3s`, link a spec e prompt; correggere «15 module subdirectories» in 21)

- [ ] **Step 1:** Aggiorna `CLAUDE.md` con le righe sopra.
- [ ] **Step 2:** Commit `docs: componenti e validatore 3 secondi in CLAUDE.md`.

### Task 12: Verifica finale e PR

- [ ] **Step 1:** Worktree: `npm run validate:content`, `npm run validate:3s`, `npx vitest run` → tutti verdi. Copia: `npx astro check` → 0 errori; `npm run build` → exit 0, audit del sito superato.
- [ ] **Step 2:** URL invariati: la lista dei file `.html` e `.md` in `dist` (escluse `en/` e `pagefind/`) è identica a quella del branch base.
- [ ] **Step 3:** HTML senza JavaScript: in `dist/course/real-time-analytics/clickhouse-fondamenti/index.html` ogni `.lz-schema` contiene tante `.lz-vista` quanti `<Passo>` e nessuna ha l'attributo `hidden`.
- [ ] **Step 4:** Browser su `astro preview` della copia (configurazione temporanea in `.claude/launch.json`, da non committare): la lezione in tema scuro, chiaro e a 375px. Controlla: ogni schema avanza con ◀ ▶, cerchi e frecce (solo con il focus nello schema; due schemi indipendenti); nel tema chiaro lo stile calcolato di testi e bordi `.lz-*` non è mai `rgb(204, 255, 0)`; nessuno scroll orizzontale della pagina a 375px. Screenshot dei tre casi.
- [ ] **Step 5:** `/en/course/real-time-analytics/clickhouse-fondamenti/` in inglese; `/course/real-time-analytics/clickhouse-fondamenti.md` contiene il confronto row/column come elenco, i due schemi come elenchi numerati e le righe `> ★`.
- [ ] **Step 6:** Rigenera e committa `public/llms-full.txt` (`npm run llms:full`); rimuovi la configurazione temporanea da `.claude/launch.json`.
- [ ] **Step 7:** Push del branch e PR verso `main` se la PR #102 è già unita, altrimenti verso `claude/analizza-corsi-structure-f4afab`. Nella descrizione: screenshot, esito dei controlli, link a spec e piano. Poi chiedi all'autore l'approvazione dello stile (criterio di accettazione della spec §12).
