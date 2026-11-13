# Bonifica Chirurgica `3s` e Standard Articolo Ibrido (Opzione 3) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminare immediatamente il 100% dei componenti didattici `3s` (`<Schema>`, `<Passo>`, `<Slide>`, `<Domanda>`, `<QuizExercise>`, `<SqlExercise>`, ecc.) da tutte le 236 lezioni di `ginnytech.it` (Fase A) e implementare il nuovo Standard Articolo Ibrido (Opzione 3: Profilo A `1.400–1.900` parole, Profilo B `1.600–2.400` parole) riscrivendo il primo batch Flagship dell'Onda 1 (Fase B).

**Architecture:** 
1. Aggiorniamo con TDD (`scripts/lezioni-articolo-rules.ts`, `src/lib/schemas.ts`, `scripts/validation.ts`) il validatore per supportare i due profili modulari (Profilo A Strategia/Metriche/Prodotto/Marketing e Profilo B Production & Analytics Engineering) e bandire `formato: "3s"` e tutti i tag `3s`/`QuizExercise`/`SqlExercise` dall'intero repository.
2. Eseguiamo uno script deterministico di bonifica AST/MDX (`scripts/bonifica-3s.ts`) sulle 67 lezioni che contengono tag `3s`, `QuizExercise` o `SqlExercise`, rimuoviamo `src/components/lezione/`, `src/lib/lezione/`, `src/styles/lezione.css`, `scripts/lezioni-3s-rules.ts`, `scripts/validate-lezioni-3s.ts` e aggiorniamo `src/pages/course/[module]/[slug].astro` e `src/lib/agent-markdown.ts`.
3. Riscriviamo in `formato: "articolo"` (Opzione 3) il batch Flagship prioritario dell'Onda 1 (`come-studiare-bene-questo-corso` + 6 lezioni pilastro B2B/Analytics Engineering/ClickHouse/Kafka/Event Tracking/Unit Economics) e verifichiamo l'intero sito con `npm test`, `npm run validate:articolo`, `npm run build` e `npm run audit:site`.

**Tech Stack:** Astro 5, TypeScript, MDX, Vitest, Zod, gray-matter.

---

## File Structure & Responsibilities

- **Modifica:** `scripts/lezioni-articolo-rules.ts` — Aggiunge la classificazione per modulo (`getArticoloProfile`: `'A'` vs `'B'`), le fasce di conteggio parole per profilo (`1400–1900` per Profilo A, `1600–2400` per Profilo B, con tolleranza `1200–2500` per non rompere i 12 articoli esistenti), e rafforza la kill-list R3/R10 (includendo `SqlExercise` e frasi meccaniche come `"Una sessione, tre blocchi"`).
- **Modifica:** `scripts/lezioni-articolo-rules.test.ts` — Test unitari TDD per `getArticoloProfile`, soglie parole Profilo A e Profilo B, e blocco di `SqlExercise` / `"Una sessione, tre blocchi"`.
- **Modifica:** `src/lib/schemas.ts` & `tests/schemas.test.ts` — Rimuove `'3s'` da `formato` in `lessonFrontmatterSchema` (`z.enum(['standard', 'articolo'])`) e aggiorna i test Zod.
- **Modifica:** `scripts/validation.ts`, `scripts/validation.test.ts`, `scripts/pipeline-lezioni.ts`, `package.json` — Rimuove l'integrazione con `lezioni-3s-rules`, aggiunge un controllo globale che vieta qualsiasi tag `3s`/`QuizExercise`/`SqlExercise` in tutte le 236 lezioni, e aggiorna gli script npm.
- **Modifica:** `src/pages/course/[module]/[slug].astro`, `src/lib/agent-markdown.ts`, `src/lib/agent-markdown.test.ts`, `tests/theoretical-lessons-cleanliness.test.ts` — Rimuove gli import di `src/components/lezione`, `src/styles/lezione.css`, `src/lib/lezione/agent`, `QuizExercise` e `SqlExercise` dalle lezioni.
- **Creazione temporanea / Esecuzione:** `scripts/bonifica-3s.ts` — Trasformatore deterministico che converte e ripulisce le 57 lezioni `3s` + 10 lezioni con `SqlExercise` in Markdown puro senza perdita di contenuto informativo e sopra la soglia di 1.500 caratteri di `auditMarkdownTwin`.
- **Eliminazione:** `src/components/lezione/*`, `src/lib/lezione/*`, `src/styles/lezione.css`, `scripts/lezioni-3s-rules.ts`, `scripts/lezioni-3s-rules.test.ts`, `scripts/validate-lezioni-3s.ts`.
- **Riscrittura completa (`formato: "articolo"`, Opzione 3):**
  1. `src/content/corso/panoramica/come-studiare-bene-questo-corso.mdx` (Profilo A)
  2. `src/content/corso/data-collection/architettura-degli-eventi.mdx` (Profilo A)
  3. `src/content/corso/metriche-business/unit-economics-cac-ltv-payback.mdx` (Profilo A)
  4. `src/content/corso/analytics-engineering/dbt-e-ruolo-dell-analytics-engineer.mdx` (Profilo B)
  5. `src/content/corso/analytics-engineering/modelli-staging-intermediate-marts.mdx` (Profilo B)
  6. `src/content/corso/kafka-streaming/kafka-connect-e-cdc-debezium.mdx` (Profilo B)
  7. `src/content/corso/data-warehousing/architetture-dati-moderne-medallion.mdx` (Profilo B)

---

### Task 1: TDD su `lezioni-articolo-rules.ts` e `schemas.ts` per Profilo A/B e dismissione `formato: "3s"`

**Files:**
- Modify: `scripts/lezioni-articolo-rules.test.ts`
- Modify: `scripts/lezioni-articolo-rules.ts`
- Modify: `tests/schemas.test.ts`
- Modify: `src/lib/schemas.ts`

- [ ] **Step 1: Scrivere i test falliti in `scripts/lezioni-articolo-rules.test.ts` e `tests/schemas.test.ts`**
  - Aggiungere test per `getArticoloProfile(moduleOrPath)` che verifica:
    - Moduli `panoramica`, `data-collection`, `metriche-business`, `gestione-data-driven`, `prodotto`, `marketing`, `psicologia-utente`, `finanza`, `fondamenti-filosofici`, `direzioni-analitica` → Profilo `'A'` (`1400–1900` parole consigliate, hard range `1200–2200`).
    - Moduli `sql`, `python`, `statistica`, `ab-testing`, `visualizzazione`, `analytics-engineering`, `real-time-analytics`, `kafka-streaming`, `data-warehousing`, `machine-learning`, `ai` → Profilo `'B'` (`1600–2400` parole consigliate, hard range `1200–2500`).
  - Aggiungere test per R10 che blocca `<SqlExercise` e `"Una sessione, tre blocchi"`.
  - Aggiornare `tests/schemas.test.ts` verificando che `formato: '3s'` sia rifiutato da `lessonFrontmatterSchema` mentre `formato: 'articolo'` e `formato: 'standard'` siano accettati.

- [ ] **Step 2: Eseguire Vitest per verificare il fallimento (RED)**
  - Run: `npx vitest run scripts/lezioni-articolo-rules.test.ts tests/schemas.test.ts`
  - Expected: FAIL sui nuovi test di `getArticoloProfile`, `<SqlExercise` e `formato: '3s'`.

- [ ] **Step 3: Implementare il codice minimo in `scripts/lezioni-articolo-rules.ts` e `src/lib/schemas.ts` (GREEN)**
  - Esportare `getArticoloProfile(moduleOrFile: string): 'A' | 'B'` e `PROFILE_WORD_BOUNDS`.
  - Includere `SqlExercise` in `COMPONENTI_BANDITI` e `"una sessione, tre blocchi"` tra le espressioni meccaniche vietate.
  - Rimuovere `'3s'` da `lessonFrontmatterSchema` in `src/lib/schemas.ts`.

- [ ] **Step 4: Rieseguire Vitest per confermare il passaggio (GREEN)**
  - Run: `npx vitest run scripts/lezioni-articolo-rules.test.ts tests/schemas.test.ts`
  - Expected: PASS (0 errori).

---

### Task 2: Fase A — Bonifica Chirurgica delle 67 lezioni e rimozione totale del sottosistema `3s`

**Files:**
- Create & Run: `scripts/bonifica-3s.ts`
- Modify: `src/content/corso/**/*.mdx` (57 lezioni `3s` + 10 lezioni con `SqlExercise`)
- Modify: `src/pages/course/[module]/[slug].astro`
- Modify: `src/lib/agent-markdown.ts` & `src/lib/agent-markdown.test.ts`
- Modify: `scripts/validation.ts`, `scripts/validation.test.ts`, `scripts/pipeline-lezioni.ts`, `package.json`
- Modify: `tests/theoretical-lessons-cleanliness.test.ts`
- Delete: `src/components/lezione/*`, `src/lib/lezione/*`, `src/styles/lezione.css`, `scripts/lezioni-3s-rules.ts`, `scripts/lezioni-3s-rules.test.ts`, `scripts/validate-lezioni-3s.ts`

- [ ] **Step 1: Scrivere il test di pulizia globale in `tests/theoretical-lessons-cleanliness.test.ts`**
  - Aggiungere un test che scansiona **tutti i 236 file `.mdx`** in `src/content/corso/` e verifica che:
    1. Nessun file abbia `formato: "3s"` o `formato: '3s'` nel frontmatter;
    2. Nessun file contenga tag `<Schema`, `<Passo`, `<Slide`, `<Confronto`, `<Lato`, `<Criterio`, `<Passi`, `<Fase`, `<Opzioni`, `<Opzione`, `<MiniTabella`, `<TabellaDati`, `<Barre`, `<Barra`, `<NumeriGrandi`, `<Numero`, `<Relazioni`, `<Nodo`, `<Pattern`, `<ErroreTipico`, `<Messaggio`, `<Domanda`, `<Percorso`, `<Obiettivi`, `<QuizExercise`, `<SqlExercise` fuori dai blocchi di codice;
    3. Nessun file contenga `"Una sessione, tre blocchi"`.

- [ ] **Step 2: Eseguire il test per verificare il fallimento (RED)**
  - Run: `npx vitest run tests/theoretical-lessons-cleanliness.test.ts`
  - Expected: FAIL sulle 67 lezioni non ancora bonificate.

- [ ] **Step 3: Scrivere ed eseguire `scripts/bonifica-3s.ts` per ripulire le 67 lezioni**
  - Smontare i tag `3s`, `QuizExercise` e `SqlExercise`, rimuovere `formato: "3s"` e `sezioni:` dal frontmatter delle lezioni non ancora in formato `articolo`, rimuovere `<Schema>`/`<Passo>`/`<Passi>`/`<Fase>`/`<MiniTabella>` che duplicano la prosa, trasformare `<Confronto>`, `<Opzioni>`, `<NumeriGrandi>`, `<Barre>`, `<Relazioni>`, `<ErroreTipico>`, `<Pattern>` in Markdown pulito e leggibile, rimuovere `<Domanda>`, `<Percorso />`, `<Obiettivi />`, `<QuizExercise>`, `<SqlExercise>`, e convertire `## Riepilogo` con `<Messaggio>` in `## Punti chiave da portare in produzione` con elenco sintetico pulito (garantendo `≥ 1.500` caratteri per `auditMarkdownTwin`).

- [ ] **Step 4: Rimuovere `src/components/lezione/`, `src/lib/lezione/`, `src/styles/lezione.css`, `scripts/*3s*` e aggiornare `[slug].astro`, `agent-markdown.ts`, `validation.ts`, `pipeline-lezioni.ts`, `package.json`**
  - Pulire gli import e i branch `3s` in `src/pages/course/[module]/[slug].astro`, `src/lib/agent-markdown.ts`, `scripts/validation.ts`, `scripts/pipeline-lezioni.ts`, `package.json`.
  - Eliminare i file `3s` obsoleti.

- [ ] **Step 5: Verificare i test di pulizia e l'intera test suite (GREEN)**
  - Run: `npx vitest run tests/theoretical-lessons-cleanliness.test.ts src/lib/agent-markdown.test.ts scripts/validation.test.ts`
  - Expected: PASS (0 errori).

---

### Task 3: Fase B (Onda 1 — Batch Flagship) — Riscrittura delle 7 lezioni chiave in `formato: "articolo"` (Opzione 3)

**Files:**
- Modify: `src/content/corso/panoramica/come-studiare-bene-questo-corso.mdx` (Profilo A, 1.400–1.900 parole)
- Modify: `src/content/corso/data-collection/architettura-degli-eventi.mdx` (Profilo A, 1.400–1.900 parole)
- Modify: `src/content/corso/metriche-business/unit-economics-cac-ltv-payback.mdx` (Profilo A, 1.400–1.900 parole)
- Modify: `src/content/corso/analytics-engineering/dbt-e-ruolo-dell-analytics-engineer.mdx` (Profilo B, 1.600–2.400 parole)
- Modify: `src/content/corso/analytics-engineering/modelli-staging-intermediate-marts.mdx` (Profilo B, 1.600–2.400 parole)
- Modify: `src/content/corso/kafka-streaming/kafka-connect-e-cdc-debezium.mdx` (Profilo B, 1.600–2.400 parole)
- Modify: `src/content/corso/data-warehousing/architetture-dati-moderne-medallion.mdx` (Profilo B, 1.600–2.400 parole)

- [ ] **Step 1: Riscrivere le 3 lezioni Flagship di Profilo A (`come-studiare-bene-questo-corso`, `architettura-degli-eventi`, `unit-economics-cac-ltv-payback`)**
  - Impostare `formato: "articolo"`, apertura su caso reale aziendale con numeri in €, 6 sezioni `##` specifiche, query SQL / tabella Markdown commentata, max 1 lista puntata per sezione, checklist finale numerata in 5 punti `1. **Verbo — Oggetto.** Spiegazione...`, conteggio parole `1.400–1.900`.

- [ ] **Step 2: Riscrivere le 4 lezioni Flagship di Profilo B (`dbt-e-ruolo-dell-analytics-engineer`, `modelli-staging-intermediate-marts`, `kafka-connect-e-cdc-debezium`, `architetture-dati-moderne-medallion`)**
  - Impostare `formato: "articolo"`, apertura su incidente di produzione reale (ClickHouse/dbt/Kafka/S3), 6 sezioni `##` architetturali, codice SQL/ClickHouse/dbt pronto per la produzione commentato, tabella di trade-off/benchmark, checklist di deploy in 5 punti, conteggio parole `1.600–2.400`.

- [ ] **Step 3: Validare tutte le lezioni `formato: "articolo"` con `npm run validate:articolo`**
  - Run: `npm run validate:articolo`
  - Expected: `19` lezioni validate (`12` preesistenti + `7` nuove Flagship), `0` errori.

- [ ] **Step 4: Eseguire verifica end-to-end (`npm test`, `npm run build`, `npm run audit:site`)**
  - Run: `npm test && npm run build && npm run audit:site`
  - Expected: Tutti i test Vitest PASS, build Astro completata con `0` errori, audit del sito e dei `.md` twin con `0` errori.
