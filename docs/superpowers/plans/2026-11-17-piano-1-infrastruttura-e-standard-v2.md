# Piano 1: Infrastruttura, Validatori e Playbook Standard Didattico V2

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introdurre lo schema, il validatore dedicato, i test di governance e il playbook editoriale per il nuovo formato `formato: "didattica-v2"`, mantenendo `npm run check` verde al 100% durante tutta la migrazione delle 236 lezioni.

**Architecture:** `didattica-v2` affianca `articolo` in `src/lib/schemas.ts` e `scripts/validation.ts` tramite un validatore puro dedicato (`scripts/lezioni-v2-rules.ts` + CLI `scripts/validate-lezioni-v2.ts`), senza rompere le 141 lezioni `articolo` prima che vengano elevate. Un'unica matrice di profili modulo (`technical`, `analytical`, `conceptual`) e categorie teoriche allinea `scripts/lezioni-v2-rules.ts`, `tests/theoretical-lessons-cleanliness.test.ts` e `.codex/skills/course-editorial-system/scripts/course_catalog.py`.

**Tech Stack:** TypeScript (`tsx`), Astro 7.3.8 + Zod (`astro/zod`), `@mdx-js/mdx`, Vitest, Python 3 (`course_catalog.py`).

**Spec:** `docs/superpowers/specs/2026-11-17-standard-didattico-v2-236-lezioni-design.md`

## Global Constraints

- Tutte le 236 lezioni in `src/content/corso/` usano i 21 moduli canonici di `src/data/course-program.ts` (`COURSE_MODULES.length === 21`, `COURSE_PHASES.length === 5`, `COURSE_TRACKS.length === 3`, `expectedCoreLessonCount === 236`).
- Coesistenza zero-regressione durante la migrazione: `formato` ammette `'articolo' | 'didattica-v2'`; `npm run validate:articolo` continua a validare le sole lezioni con `formato: 'articolo'` e `npm run validate:v2` valida tutte le lezioni con `formato: 'didattica-v2'`.
- Ogni blocco `<details><summary>Mostra risposta</summary>...</details>` nei file `.mdx` deve compilare senza errori in `npm run check:mdx` (`@mdx-js/mdx` + `remarkMath`) e convertirsi in Markdown leggibile in `src/lib/agent-markdown.ts`.
- Nelle regole V2 è abolito `R8` (divieto seconda persona singolare) ed è abolito `R11` (warning su liste puntate); il rapporto prosa/liste richiede `proseRatio >= 0.45`.
- Soglie parole (esclusi blocchi di codice): `technical` e `analytical` core `1800–3800`, `conceptual` core `1600–3200`, indici (`order === 0` o slug `indice-*`/`cheat-sheet*`/`glossario*`) `1200–2600`.
- H2 richiesti: `6–10` per lezioni core, `4–8` per indici/cheat-sheet; titoli H2 generici vietati (`Introduzione`, `L'idea di fondo`, `Riepilogo`, `Conclusioni`, `Sintesi`); zero `# H1` nel body.

## Review Focus

1. **CRLF su Windows in `public/llms-full.txt` e nei file MDX**: `readFileSync("public/llms-full.txt", "utf-8").split("\n")` fallisce su Windows quando `core.autocrlf=true` aggiunge `\r`; normalizzare sempre con `/\r?\n/` e scrivere `\n` in generazione. (Testato in Task 1)
2. **Tag `<details>` multilinea in MDX e in `mdxToAgentMarkdown`**: in MDX un `<details>` senza riga vuota prima del contenuto Markdown interno può causare errori di compilazione JSX o perdita di testo in `.md` twin / `llms-full.txt`; verificare compilazione `@mdx-js/mdx` e output di `mdxToAgentMarkdown`. (Testato in Task 2)
3. **Conflitto tra `CONCEPTUAL_FOLDERS` e moduli quantitativi (`marketing-data-science`, `analisi-marketing`)**: una lezione in `marketing-data-science` con `category: "Fondamenti"` + codice Python oggi fallisce `tests/theoretical-lessons-cleanliness.test.ts`; la matrice condivisa deve classificare `marketing-data-science` e `analisi-marketing` nel profilo `analytical` (fuori dalle cartelle bloccanti di solo-teoria, oppure con controllo esplicito su `senzaCodice: true` + `THEORETICAL_CATEGORIES`). (Testato in Task 5)
4. **Conteggio parole dentro `<details>` vs blocchi `mermaid`/codice**: le risposte in `<details>` sono prosa didattica e devono contare nelle parole, mentre blocchi ```` ```mermaid ```` e ```` ```sql/python ```` vanno esclusi dal conteggio parole prosa senza falsare il rilevamento dei diagrammi. (Testato in Task 3)
5. **Regola 1 e `SUMMARY_SECTION_REGEX` in `scripts/validation.ts`**: una lezione `didattica-v2` senza H2 `"Riepilogo"` e senza sezione <=4 frasi non deve fallire `validate:content`; `checkLessonPipeline(..., 'didattica-v2')` e `validateCollection` devono riconoscere `formato === 'didattica-v2'`. (Testato in Task 4)

---

## File Structure

- **Modify:** `tests/llms-txt.test.ts:56-85` — Gestione line ending `\r?\n` nei test di `llms-full.txt` e `llms.txt`.
- **Modify:** `scripts/generate-llms-full.ts` e `.gitattributes` — Scrittura LF esplicita e regola `public/*.txt text eol=lf`.
- **Modify:** `src/lib/schemas.ts:37` — Estensione enum `formato: z.enum(['articolo', 'didattica-v2']).optional()`.
- **Modify:** `src/lib/agent-markdown.ts` — Supporto pulito a `<details><summary>...</summary>...</details>` per `.md` twin e `llms-full.txt`.
- **Modify:** `src/styles/global.css` (o `src/pages/course/[module]/[slug].astro`) — Styling accessibile per `details` / `summary` nelle pagine lezione.
- **Create:** `scripts/lezioni-v2-rules.ts` — Motore puro di validazione per `didattica-v2` + matrice profili dei 21 moduli (`V2_MODULE_PROFILE`, `V2_PROFILES`, `checkLezioneV2`).
- **Create:** `scripts/validate-lezioni-v2.ts` — Runner CLI per `npm run validate:v2`.
- **Modify:** `scripts/validation.ts:142-241,488-516` — Supporto `formato === 'didattica-v2'` in `checkLessonPipeline` e `validateCollection`.
- **Modify:** `tests/theoretical-lessons-cleanliness.test.ts` e `.codex/skills/course-editorial-system/scripts/course_catalog.py` — Allineamento `CONCEPTUAL_FOLDERS` e `THEORETICAL_CATEGORIES` con la matrice V2.
- **Create:** `tests/lezioni-v2-rules.test.ts`, `tests/agent-markdown-details.test.ts` — Suite Vitest dedicate.
- **Create:** `docs/lezioni/prompt-didattica-v2.md` — Playbook operativo per autori e agenti sul formato `didattica-v2`.
- **Modify:** `package.json:10-26` — Aggiunta script `validate:v2` e aggiornamento script `check`.

---

### Task 1: Ripristinare `tests/llms-txt.test.ts` e stabilizzare LF su Windows

**Files:**
- Modify: `tests/llms-txt.test.ts:30-35,56-86`
- Modify: `scripts/generate-llms-full.ts`
- Modify/Create: `.gitattributes`

**Interfaces:**
- Consumes: `public/llms.txt`, `public/llms-full.txt`
- Produces: suite `tests/llms-txt.test.ts` verde su Windows/Linux senza regressioni CRLF

- [ ] **Step 1: Verificare il fallimento attuale su Windows**

Run: `cd C:/Users/User/Desktop/gynnitech && npx vitest run tests/llms-txt.test.ts`
Expected: FAIL su `every URL line is a clean absolute ginnytech.it URL` per presenza di `\r` finale su Windows.

- [ ] **Step 2: Aggiornare splitting delle righe in `tests/llms-txt.test.ts`**

Sostituire `author.split("\n")` (riga 31) e `full.split("\n")` (riga 58) con `.split(/\r?\n/)` e normalizzare `llms` all'inizio del file (`readFileSync(..., "utf-8").replace(/\r\n/g, "\n")`) così tutte le slice/regex su sezione e URL sono platform-independent.

- [ ] **Step 3: Garantire `\n` in `scripts/generate-llms-full.ts` e `.gitattributes`**

Assicurare in `scripts/generate-llms-full.ts` che l'output scritto su `public/llms-full.txt` termini e usi `\n`, e aggiungere `public/*.txt text eol=lf` in `.gitattributes`.

- [ ] **Step 4: Eseguire `npm run llms:full` e verificare i test**

Run: `cd C:/Users/User/Desktop/gynnitech && npm run llms:full && npx vitest run tests/llms-txt.test.ts`
Expected: PASS (tutti i test di `tests/llms-txt.test.ts` verdi).

- [ ] **Step 5: Commit**

```bash
git add tests/llms-txt.test.ts scripts/generate-llms-full.ts .gitattributes public/llms-full.txt
git commit -m "fix(tests): normalize CRLF line endings in llms-txt tests and generator"
```

---

### Task 2: Estendere lo schema frontmatter e il supporto `<details>` per `.md` twin e Astro MDX

**Files:**
- Modify: `src/lib/schemas.ts:37`
- Modify: `src/lib/agent-markdown.ts`
- Modify: `src/pages/course/[module]/[slug].astro` (CSS inline scoped per `<details>`/`<summary>`)
- Modify: `tests/schemas.test.ts`
- Create: `tests/agent-markdown-details.test.ts`

**Interfaces:**
- Consumes: `corsoSchema` in `src/lib/schemas.ts`, `mdxToAgentMarkdown(raw: string): string` in `src/lib/agent-markdown.ts`
- Produces: `corsoSchema` con `formato: z.enum(['articolo', 'didattica-v2']).optional()`, rendering pulito di `<details><summary>...</summary>...</details>` in HTML e `.md` twin

- [ ] **Step 1: Scrivere i test che falliscono per `formato: "didattica-v2"` e `<details>`**

In `tests/schemas.test.ts` aggiungere:
```ts
test('accetta formato "didattica-v2"', () => {
    const result = corsoSchema.safeParse({ title: "Lesson 1", description: "Intro", formato: "didattica-v2" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.formato).toBe("didattica-v2");
});
```
In `tests/agent-markdown-details.test.ts` scrivere test con un campione MDX contenente `<details>\n<summary>Mostra risposta</summary>\n\nIl tasso netto scende al 12%.\n\n</details>` che verifica:
1. Compilazione valida con `@mdx-js/mdx` + `remarkMath` (`compile(...)` non lancia eccezioni).
2. `mdxToAgentMarkdown(sample)` rimuove i tag grezzi `<details>`/`<summary>` e preserva `"Mostra risposta"` e `"Il tasso netto scende al 12%."`.

- [ ] **Step 2: Eseguire i test per verificarne il fallimento**

Run: `cd C:/Users/User/Desktop/gynnitech && npx vitest run tests/schemas.test.ts tests/agent-markdown-details.test.ts`
Expected: FAIL su `formato: "didattica-v2"` (enum invalido) e sui tag `<details>` residui in `mdxToAgentMarkdown`.

- [ ] **Step 3: Implementare l'estensione schema, `mdxToAgentMarkdown` e stile `<details>`**

- In `src/lib/schemas.ts:37`: cambiare `formato: z.enum(['articolo', 'didattica-v2']).optional()`.
- In `src/lib/agent-markdown.ts`: convertire `<details>\s*<summary>(.*?)</summary>([\s\S]*?)</details>` in blockquote o blocco Markdown strutturato `**$1**\n$2` prima della pulizia finale.
- In `src/pages/course/[module]/[slug].astro`: aggiungere regole CSS per `.prose details` e `.prose summary` (bordo discreto, padding, cursore pointer, transizione pulita coerente col tema chiaro/scuro).

- [ ] **Step 4: Rieseguire i test e `npm run check:mdx`**

Run: `cd C:/Users/User/Desktop/gynnitech && npx vitest run tests/schemas.test.ts tests/agent-markdown-details.test.ts && npm run check:mdx`
Expected: PASS su tutti i test e su tutti i file MDX.

- [ ] **Step 5: Commit**

```bash
git add src/lib/schemas.ts src/lib/agent-markdown.ts src/pages/course/[module]/[slug].astro tests/schemas.test.ts tests/agent-markdown-details.test.ts
git commit -m "feat(schema): add didattica-v2 format and accessible details rendering"
```

---

### Task 3: Creare il validatore puro `scripts/lezioni-v2-rules.ts` e il runner `scripts/validate-lezioni-v2.ts`

**Files:**
- Create: `scripts/lezioni-v2-rules.ts`
- Create: `scripts/validate-lezioni-v2.ts`
- Create: `tests/lezioni-v2-rules.test.ts`

**Interfaces:**
- Produces (esportati da `scripts/lezioni-v2-rules.ts`):
  - `export type V2ModuleProfile = 'technical' | 'analytical' | 'conceptual'`
  - `export type V2LessonKind = 'core' | 'index'`
  - `export const V2_MODULE_PROFILES: Record<string, V2ModuleProfile>` (tutti e 21 gli slug modulo)
  - `export const V2_WORD_BOUNDS: Record<V2ModuleProfile | 'index', { minWords: number; maxWords: number }>`
  - `export const V2_FORBIDDEN_H2: readonly string[]` (`['introduzione', "l'idea di fondo", 'riepilogo', 'conclusioni', 'sintesi']`)
  - `export function getV2ModuleProfile(moduleOrRel: string): V2ModuleProfile`
  - `export function getV2LessonKind(rel: string, order?: unknown): V2LessonKind`
  - `export function checkLezioneV2(raw: string, rel: string): { errors: string[]; warnings: string[] }`
- Produces (CLI `scripts/validate-lezioni-v2.ts`):
  - Accetta `--filter <mod1,mod2,...>` per restringere la scansione ai moduli indicati e `--require-all` per fallire se esistono file in `src/content/corso/*/*.mdx` privi di `formato: "didattica-v2"`.

- [ ] **Step 1: Scrivere `tests/lezioni-v2-rules.test.ts` (suite completa di casi positivi e negativi)**

Scrivere test con helper `buildValidV2Lesson(overrides)` per verificare ogni regola (`V2-R1`..`V2-R11`) e i casi di Review Focus #4:
- Rifiuta H1 duplicato nel body (`# Titolo`) -> `V2-R1`.
- Rifiuta `< 6` o `> 10` H2 su core (`order: 2`), mentre accetta `4–8` H2 su indici (`order: 0` o slug `indice-*`) -> `V2-R2`.
- Rifiuta titoli H2 generici (`## Introduzione`, `## Riepilogo`, `## Conclusioni`) -> `V2-R2`.
- Verifica soglie parole escludendo blocchi codice e `mermaid`, ma **includendo** il testo dentro `<details>` -> `V2-R3`:
  - `technical` (`advanced-sql`): fail sotto `1800`, pass `1800–3800`, fail sopra `3800`.
  - `conceptual` (`filosofia-analisi-dati`): fail sotto `1600`, pass `1600–3200`, fail sopra `3200`.
  - `index` (`order: 0` / `indice-*`): pass `1200–2600`.
- Verifica presenza di tesi/idea chiave in apertura (callout `> **...**` o riga in grassetto isolata nelle prime 2 sezioni) -> `V2-R4`.
- Verifica presenza di almeno 1 elemento visivo (`mermaid` oppure tabella Markdown con `>= 3` righe dati) -> `V2-R5`.
- Verifica presenza di almeno 1 *worked example* numerico (sezione con >= 3 numeri/percentuali + unità verificabili oppure derivazione esplicita) -> `V2-R6`.
- Verifica requisiti per profilo -> `V2-R7`:
  - `technical`: `>= 2` blocchi di codice non-`mermaid` (nel linguaggio reale, non solo `sql`).
  - `analytical`: `>= 1` blocco `sql`/`python`/`r`, oppure se `senzaCodice: true` una tabella numerica di calcolo (`>= 4` righe dati).
  - `conceptual` con `senzaCodice: true`: `0` blocchi di codice non-`mermaid` + `>= 2` artefatti (tabelle o blockquote `>= 3` righe).
- Verifica **nessuna** segnalazione su uso del `tu` naturale e **nessuna** segnalazione su liste puntate quando `proseRatio >= 0.45`, mentre segnala `V2-R8` se `proseRatio < 0.45`.
- Verifica chiusura con `3–5` domande numerate (`?`) ciascuna dotata di `<details><summary>...</summary>...</details>` -> `V2-R9`.
- Verifica frasi AI-slop vietate, `!`, emoji, link/dichiarazione caso in apertura e assenza residui `3S` o `autore/controllatoDa/autorizzatoDa` -> `V2-R10`, `V2-R11`.

- [ ] **Step 2: Verificare che i test falliscano**

Run: `cd C:/Users/User/Desktop/gynnitech && npx vitest run tests/lezioni-v2-rules.test.ts`
Expected: FAIL con errore modulo `../scripts/lezioni-v2-rules` non trovato.

- [ ] **Step 3: Implementare `scripts/lezioni-v2-rules.ts` e `scripts/validate-lezioni-v2.ts`**

- Implementare `V2_MODULE_PROFILES` mappando tutti i 21 moduli esatti di `src/data/course-program.ts`:
  - `technical`: `data-collection`, `advanced-sql`, `data-warehousing`, `analytics-engineering`, `s3-data-lake`, `kafka-streaming`, `real-time-analytics`, `infrastructure-ops`, `ai-data-workflows`, `agentic-ai-data-workflows`
  - `analytical`: `metriche-fondamenti`, `matematica-analisi-dati`, `significativita-statistica`, `analisi-prodotto`, `analisi-marketing`, `marketing-data-science`
  - `conceptual`: `panoramica`, `gestione-data-driven`, `dashboard-visualizzazione`, `direzioni-analitica`, `filosofia-analisi-dati`
- Implementare `checkLezioneV2(raw, rel)` seguendo rigorosamente i codici `V2-R1`..`V2-R11` testati nello Step 1.
- Implementare `scripts/validate-lezioni-v2.ts` che scansiona `src/content/corso/**/*.mdx`, supporta `--filter <mod1,mod2>` per validare singoli moduli e `--require-all` per verificare copertura 100%, seleziona i file con `data.formato === 'didattica-v2'`, stampa conteggio file V2 controllati (0 se nessuno ancora migrato, exit 0 se nessun errore) ed esce con `1` se ci sono errori.

- [ ] **Step 4: Eseguire i test e il CLI**

Run: `cd C:/Users/User/Desktop/gynnitech && npx vitest run tests/lezioni-v2-rules.test.ts && npx tsx scripts/validate-lezioni-v2.ts && npx tsx scripts/validate-lezioni-v2.ts --filter advanced-sql`
Expected: PASS su tutta la suite `lezioni-v2-rules.test.ts` e exit 0 dal runner (`0 file didattica-v2 trovati, 0 errori`).

- [ ] **Step 5: Commit**

```bash
git add scripts/lezioni-v2-rules.ts scripts/validate-lezioni-v2.ts tests/lezioni-v2-rules.test.ts
git commit -m "feat(validation): add didattica-v2 rule engine and test suite"
```

---

### Task 4: Allineare `scripts/validation.ts` (`validate:content`) al formato `didattica-v2`

**Files:**
- Modify: `scripts/validation.ts:142-172,487-516`
- Create: `tests/validation-didattica-v2.test.ts`

**Interfaces:**
- Consumes: `checkLessonPipeline(body: string, frontmatterBinario: unknown, formato?: unknown): PipelineRuleResult[]` in `scripts/validation.ts`
- Produces: pieno supporto `formato === 'didattica-v2'` in `checkLessonPipeline` e `validateCollection` senza rompere `articolo` né `legacy`

- [ ] **Step 1: Scrivere il test unitario per `checkLessonPipeline` con `didattica-v2`**

In `tests/validation-didattica-v2.test.ts`, costruire un corpo lezione conforme a `didattica-v2` (con `> **Idea chiave:** ...`, tabella, diagramma `mermaid`, sezioni >= 6 frasi, e ultima sezione con 4 domande + `<details>`), chiamare `checkLessonPipeline(body, "ml-tabellare", "didattica-v2")`, e asserire che **tutte e 6 le regole** restituiscano `esito: "PASS"` (inclusa `regola_1_concetto_calcolo` anche quando ogni sezione supera 4 frasi).

- [ ] **Step 2: Eseguire il test per confermare il fallimento attuale**

Run: `cd C:/Users/User/Desktop/gynnitech && npx vitest run tests/validation-didattica-v2.test.ts`
Expected: FAIL su `regola_1_concetto_calcolo` perché `checkLessonPipeline` tratta `didattica-v2` come legacy (`countSentences(s.text) <= 4`).

- [ ] **Step 3: Aggiornare `scripts/validation.ts`**

- In `checkLessonPipeline` (`scripts/validation.ts:143-163`): aggiungere `const isV2 = formato === "didattica-v2";` e per `isV2` verificare in `regola_1` la presenza di un'idea chiave (`> **...**` o `^\*\*[^*\n]+\*\*\s*$`) + passaggi strutturati (elenco numerato/puntato o tabella o blocco codice commentato).
- In `validateCollection` (`scripts/validation.ts:488,500`): includere `data.formato !== "didattica-v2"` nelle eccezioni di `MIN_CORSO_INTRO_CHARACTERS` e `SUMMARY_SECTION_REGEX` (poiché `didattica-v2` vieta i titoli generici `Riepilogo`/`Conclusioni`).

- [ ] **Step 4: Rieseguire il test e `npm run validate:content`**

Run: `cd C:/Users/User/Desktop/gynnitech && npx vitest run tests/validation-didattica-v2.test.ts && npm run validate:content`
Expected: PASS su `validation-didattica-v2.test.ts` e `Content validation passed.`

- [ ] **Step 5: Commit**

```bash
git add scripts/validation.ts tests/validation-didattica-v2.test.ts
git commit -m "feat(validation): support didattica-v2 in pipeline rubric and content checks"
```

---

### Task 5: Riconciliare `tests/theoretical-lessons-cleanliness.test.ts` e `course_catalog.py`

**Files:**
- Modify: `tests/theoretical-lessons-cleanliness.test.ts`
- Modify: `.codex/skills/course-editorial-system/scripts/course_catalog.py`

**Interfaces:**
- Consumes: `V2_MODULE_PROFILES` in `scripts/lezioni-v2-rules.ts`
- Produces: allineamento univoco fra cartelle concettuali, flag `senzaCodice: true` e `THEORETICAL_CATEGORIES` senza falsi positivi sui moduli quantitativi (`marketing-data-science`, `analisi-marketing`) né su `ai-data-workflows`/`agentic-ai-data-workflows`

- [ ] **Step 1: Scrivere/verificare il test di coerenza prima della modifica**

In `tests/theoretical-lessons-cleanliness.test.ts` aggiungere un test che verifichi che:
1. Per tutte le lezioni `formato: "didattica-v2"` in moduli `conceptual` con categoria teorica (oppure con `senzaCodice: true`), nessun blocco codice diverso da `mermaid` sia presente.
2. Le cartelle `ai-data-workflows`, `agentic-ai-data-workflows` e `marketing-data-science` non blocchino blocchi Python/SQL quando la lezione ha `formato: "didattica-v2"` e `senzaCodice !== true`.

- [ ] **Step 2: Eseguire i test e l'audit catalogo attuale**

Run: `cd C:/Users/User/Desktop/gynnitech && npx vitest run tests/theoretical-lessons-cleanliness.test.ts tests/course-catalog-governance.test.ts && python .codex/skills/course-editorial-system/scripts/course_catalog.py audit --repo-root .`
Expected: verifica di base; se il nuovo test verifica le nuove regole su mock o inventario, fallisce finché `CONCEPTUAL_FOLDERS` e `course_catalog.py` non vengono allineati.

- [ ] **Step 3: Allineare `CONCEPTUAL_FOLDERS` e regole `course_catalog.py`**

- Aggiornare `tests/theoretical-lessons-cleanliness.test.ts` per rispettare il profilo `conceptual` (`panoramica`, `gestione-data-driven`, `dashboard-visualizzazione`, `direzioni-analitica`, `filosofia-analisi-dati`) + qualsiasi lezione con `senzaCodice: true` (ammettendo `mermaid`), separando nettamente i moduli `analytical` e `technical` AI.
- Aggiornare `.codex/skills/course-editorial-system/scripts/course_catalog.py` (`CONCEPTUAL_FOLDERS` e controlli correlati) così `course_catalog.py audit` riflette esattamente la stessa tassonomia e supporta `formato: "didattica-v2"` senza warning spurii.

- [ ] **Step 4: Eseguire test governance + audit catalogo**

Run: `cd C:/Users/User/Desktop/gynnitech && npx vitest run tests/theoretical-lessons-cleanliness.test.ts tests/course-catalog-governance.test.ts && python .codex/skills/course-editorial-system/scripts/course_catalog.py audit --repo-root .`
Expected: PASS e exit 0.

- [ ] **Step 5: Commit**

```bash
git add tests/theoretical-lessons-cleanliness.test.ts .codex/skills/course-editorial-system/scripts/course_catalog.py
git commit -m "chore(governance): align theoretical cleanliness rules and course catalog with v2 profiles"
```

---

### Task 6: Scrivere il playbook `docs/lezioni/prompt-didattica-v2.md` e collegare `validate:v2` in `package.json`

**Files:**
- Create: `docs/lezioni/prompt-didattica-v2.md`
- Modify: `package.json:10-25`

**Interfaces:**
- Consumes: `scripts/lezioni-v2-rules.ts`, `scripts/validate-lezioni-v2.ts`
- Produces: `npm run validate:v2` integrato in `npm run check` e prompt di riferimento completo per Piano 2

- [ ] **Step 1: Scrivere `docs/lezioni/prompt-didattica-v2.md`**

Includere:
- Regole editoriali e pedagogiche complete di `didattica-v2` (arco in 5 momenti, voce naturale, divieto di titoli generici e filler, esempi numerici svolti passo-passo, `mermaid` / tabelle, errori comuni con `###`, 3–5 domande con `<details><summary>Mostra risposta</summary>...</details>`).
- Scheda specifica per ciascuno dei 3 profili (`technical`, `analytical`, `conceptual`) e per gli indici (`order: 0`).
- Checklist pre-commit per ogni lezione (`validate:content`, `validate:v2`, `check:mdx`).

- [ ] **Step 2: Aggiornare `package.json`**

Aggiungere `"validate:v2": "tsx scripts/validate-lezioni-v2.ts"` in `scripts` e aggiornare `"check"` a:
`"npm run validate:content && npm run validate:articolo && npm run validate:v2 && npm run check:mdx && astro check && npm run test"`.

- [ ] **Step 3: Eseguire la pipeline di verifica completa di Piano 1**

Run: `cd C:/Users/User/Desktop/gynnitech && npm run check`
Expected: PASS su `validate:content`, `validate:articolo`, `validate:v2`, `check:mdx`, `astro check`, e tutta la suite `vitest run`!

- [ ] **Step 4: Commit**

```bash
git add docs/lezioni/prompt-didattica-v2.md package.json
git commit -m "docs(editorial): add didattica-v2 playbook and wire validate:v2 into npm check"
```
