# Piano 2: Migrazione delle 95 lezioni legacy ed elevazione delle 141 lezioni articolo a `didattica-v2`

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portare tutte le 236 lezioni in `src/content/corso/` al nuovo standard `formato: "didattica-v2"` — prima migrando i 6 moduli legacy mancanti (95 lezioni) in ordine crescente di complessità/stato, poi elevando tutte le 141 lezioni attualmente in `formato: "articolo"` in 5 lotti coerenti per area tematica — mantenendo verde l'intera build e la suite di test dopo ogni modulo.

**Architecture:** Ogni task copre un modulo atomico (o un piccolo lotto omogeneo di moduli adiacenti), trasformando i file `.mdx` in `src/content/corso/<modulo>/` verso `formato: "didattica-v2"` secondo `docs/lezioni/prompt-didattica-v2.md` e verificandoli con `npm run validate:v2`, `npm run validate:content`, `npm run check:mdx` e `vitest` prima del commit. L'esecuzione a moduli isolati permette di parallelizzare i moduli indipendenti (via subagenti per modulo) senza conflitti su file condivisi, chiudendo con rigenerazione `llms-full.txt`, audit sito e deploy finale.

**Tech Stack:** MDX + YAML frontmatter, Astro 7.3.8, `astro-mermaid`, `remark-math`, `scripts/validate-lezioni-v2.ts`, `scripts/validation.ts`, `scripts/check-mdx.ts`, Vitest, `course_catalog.py`.

**Spec:** `docs/superpowers/specs/2026-11-17-standard-didattico-v2-236-lezioni-design.md`
**Prerequisito:** Completamento integrale di `docs/superpowers/plans/2026-11-17-piano-1-infrastruttura-e-standard-v2.md` (`npm run check` verde).

## Global Constraints

- Ogni file modificato deve avere `formato: "didattica-v2"` nel frontmatter, zero `# H1` nel body, `draft: false` esplicito e nessun campo `autore`/`controllatoDa`/`autorizzatoDa`.
- Rispettare sempre il profilo modulo di `V2_MODULE_PROFILES`:
  - `technical` (`1800–3800` parole prosa, `>= 2` blocchi codice reali nel linguaggio del modulo, `>= 1` `mermaid` o tabella, worked example numerico, 2–3 errori `###`, 3–5 domande con `<details>`).
  - `analytical` (`1800–3800` parole prosa, derivazione numerica completa, `>= 1` blocco `sql`/`python` o `senzaCodice: true` + tabella di calcolo `>= 4` righe, `>= 1` `mermaid` o tabella, 2–3 errori `###`, 3–5 domande con `<details>`).
  - `conceptual` (`1600–3200` parole prosa, `>= 1` `mermaid` o tabella, worked example decisionale con numeri, `>= 2` artefatti strutturati, `0` blocchi codice se `category` teorica + `senzaCodice: true`, 2–3 errori `###`, 3–5 domande con `<details>`).
  - Indici/cheat sheet (`order: 0` o slug `indice-*`/`cheat-sheet*`): `1200–2600` parole prosa, `4–8` H2.
- Preservarne sempre l'identità concettuale, `order`, `module`, `binario`, `prerequisites` validi, `headerImage`/`headerImageAlt` esistenti e formulazioni matematiche con escape LaTeX validi (`findControlCharIssues` pulito in `check:mdx`).
- Al termine di ogni task verificare che i test di governance/pulizia non introducano regressioni sui moduli rimanenti e committare per modulo/lotto.

## Review Focus

1. **Escape LaTeX nei file matematici/statistici (`\frac`, `\text`, `\tau`, `\beta`)**: durante la riscrittura in stringhe o template literal di YAML/MDX, backslash singoli o mal formattati rompono `remark-math` o attivano `findControlCharIssues`; eseguire sempre `npm run check:mdx` dopo ogni modulo quantitativo. (Verificato in Task 2, 3, 7, 8)
2. **Coerenza delle unità e delle cifre nei *worked example***: numeri inventati internamente incoerenti (es. somme di coorti o tassi di conversione che non tornano matematicamente nei passaggi intermedi) fanno perdere credibilità didattica; verificare ogni calcolo numerico passo-passo. (Verificato in ogni task `analytical` e `technical`)
3. **Blocco `mermaid` in MDX con etichette contenenti parentesi/virgolette/caratteri speciali**: parentesi tonde o apici non quotati dentro nodi `A[...]` possono causare errori di parsing Mermaid a runtime; racchiudere etichette complesse fra virgolette `A["Testo (note)"]`. (Verificato in `npm run build` + `audit:site` nei task e in chiusura)
4. **Sovrascrittura accidentale di `learningObjectives`, `prerequisites` o `headerImage` già validi**: ogni lezione ha già `prerequisites` e `headerImage` referenziati dal programma V2 e da `validate:content`; preservarli sempre (migliorando `description` e `learningObjectives` solo se generici). (Verificato da `npm run validate:content` in ogni task)
5. **Esaurimento `validate:articolo` solo a fine Wave 2**: fino a quando esiste almeno 1 lezione in `formato: "articolo"`, `npm run validate:articolo` deve restare verde; quando in Task 11 rimangono `0` lezioni `articolo`, aggiornare lo script/check finale in modo pulito. (Verificato in Task 11)

---

## File Structure — Inventario completo delle 236 lezioni

### Wave 1 — I 6 moduli legacy mancanti (95 lezioni)
| Task | Modulo | Lezioni | Profilo V2 | Stato iniziale verificato |
|---|---|---:|---|---|
| Task 1 | `filosofia-analisi-dati` | 20 | `conceptual` | 819 parole medie, dispense corte |
| Task 2 | `marketing-data-science` | 19 | `analytical` | 974 parole medie, dispense corte |
| Task 3 | `analisi-marketing` | 22 | `analytical` | 1.251 parole medie, disomogenee |
| Task 4 | `direzioni-analitica` | 14 | `conceptual` | 1.549 parole medie, registro misto |
| Task 5 | `ai-data-workflows` + `agentic-ai-data-workflows` | 20 (10+10) | `technical` | ~3.100 parole medie, già ricche ma con H1/boilerplate pipeline |

### Wave 2 — I 15 moduli `articolo` da elevare a `didattica-v2` (141 lezioni)
| Task | Moduli nel lotto | Lezioni | Profilo V2 | Gap principale attuale |
|---|---|---:|---|---|
| Task 6 | `panoramica` (8) + `gestione-data-driven` (12) + `dashboard-visualizzazione` (7) | 27 | `conceptual` | 1.300–1.350 parole, prose dense senza liste né `mermaid` |
| Task 7 | `metriche-fondamenti` (9) + `analisi-prodotto` (11) | 20 | `analytical` | ~1.305 parole inchiodate al minimo, poche derivazioni numeriche |
| Task 8 | `matematica-analisi-dati` (11) + `significativita-statistica` (10) | 21 | `analytical` | ~1.325 parole, SQL forzato al posto di calcolo/Python |
| Task 9 | `data-collection` (12) + `advanced-sql` (10) + `data-warehousing` (11) | 33 | `technical` | 6 H2 rigidi, assenza diagrammi architetturali e worked trace |
| Task 10 | `analytics-engineering` (12) + `s3-data-lake` (7) + `kafka-streaming` (7) + `real-time-analytics` (7) + `infrastructure-ops` (7) | 40 | `technical` | 1.335–1.600 parole, esempi brevi senza debug/edge case completi |

### Wave 3 — Chiusura ecosistema, verifica completa e pubblicazione
| Task | Ambito | Risultato |
|---|---|---|
| Task 11 | Ritiro residui `articolo`, rigenerazione `llms-full.txt`, `release:course-v2`, verifica manuale/visiva e deploy | `236/236` in `didattica-v2`, build/test/audit 100% verdi |

---

## Wave 1: Migrazione dei 6 moduli legacy (95 lezioni)

### Task 1: Migrare `filosofia-analisi-dati` (20 lezioni, `conceptual`) a `didattica-v2`

**Files:**
- Modify: `src/content/corso/filosofia-analisi-dati/*.mdx` (tutti i 20 file)

**Interfaces:**
- Consumes: `scripts/lezioni-v2-rules.ts` (`checkLezioneV2`, profilo `conceptual`), `docs/lezioni/prompt-didattica-v2.md`
- Produces: 20 lezioni valide in `didattica-v2` (indice `indice-filosofia-analisi-dati.mdx` 1.200–2.600 parole; 19 lezioni core 1.600–3.200 parole)

- [ ] **Step 1: Inventariare i 20 file del modulo e controllare categorie/prerequisiti esistenti**

Run: `cd C:/Users/User/Desktop/gynnitech && python3 -c "from pathlib import Path; import re; [print(f.name, re.search(r'^order:\s*(\d+)', f.read_text('utf-8'), re.M).group(1)) for f in sorted(Path('src/content/corso/filosofia-analisi-dati').glob('*.mdx'))]"`
Expected: lista ordinata `0..19` dei 20 file.

- [ ] **Step 2: Riscrivere le 20 lezioni in lotti da 5 file verso `didattica-v2`**

Per ciascuno dei 20 file:
- Impostare `formato: "didattica-v2"`, `senzaCodice: true` dove la categoria è teorica (nessun codice finto; ammessi `mermaid`, tabelle decisionali e blockquote `>= 3` righe), rimuovere `autore`/`controllatoDa`/`autorizzatoDa` e qualsiasi `# H1` iniziale.
- Strutturare 6–10 H2 naturali (4–8 per `indice-filosofia-analisi-dati.mdx`) con: caso reale iniziale + `> **Idea chiave:** ...`, diagramma `mermaid` o tabella comparativa, esempio numerico/decisionale svolto (come una scelta di metrica o disegno studio cambia la decisione aziendale), 2–3 errori concettuali comuni (`###`), e 3–5 domande di autoverifica con `<details><summary>Mostra risposta</summary>...</details>`.

- [ ] **Step 3: Eseguire la validazione mirata sul modulo**

Run: `cd C:/Users/User/Desktop/gynnitech && npx tsx scripts/validate-lezioni-v2.ts --filter filosofia-analisi-dati && npm run validate:content && npm run check:mdx && npx vitest run tests/theoretical-lessons-cleanliness.test.ts`
Expected: PASS su tutti i 20 file (`0 errori`), nessun controllo `check:mdx` fallito.

- [ ] **Step 4: Commit**

```bash
git add src/content/corso/filosofia-analisi-dati/
git commit -m "content(corso): migrate filosofia-analisi-dati (20 lessons) to didattica-v2"
```

---

### Task 2: Migrare `marketing-data-science` (19 lezioni, `analytical`) a `didattica-v2`

**Files:**
- Modify: `src/content/corso/marketing-data-science/*.mdx` (tutti i 19 file)

**Interfaces:**
- Consumes: `scripts/lezioni-v2-rules.ts` (profilo `analytical`), `docs/lezioni/prompt-didattica-v2.md`
- Produces: 19 lezioni valide in `didattica-v2` (1.800–3.800 parole prosa per le core, 1.200–2.600 per eventuale indice)

- [ ] **Step 1: Verificare inventario, categorie e codice/formule dei 19 file**

Run: `cd C:/Users/User/Desktop/gynnitech && python3 -c "from pathlib import Path; [print(f.name) for f in sorted(Path('src/content/corso/marketing-data-science').glob('*.mdx'))]"`
Expected: 19 file elencati.

- [ ] **Step 2: Riscrivere le 19 lezioni in `didattica-v2`**

Per ogni lezione (CLV, Markov attribution, MMM, uplift modeling, geo-lift, RFM, elasticity, budget allocation, ecc.):
- Aprire con scenario marketing concreto (budget, canali, marginalità reale) + `> **Idea chiave:** ...`.
- Includere almeno 1 diagramma `mermaid` (flusso attribuzione / DAG causale / funnel) e almeno 1 **worked example numerico completo** (dati tabellari pre/post, calcoli passo-passo di ROAS marginale / probabilità di transizione / uplift netto).
- Includere almeno 1 blocco `python` o `sql` eseguibile e commentato (oppure `senzaCodice: true` + tabella di calcolo completa `>= 4` righe per le poche lezioni puramente strategiche).
- Chiudere con 2–3 errori tipici (`###`) e 3–5 domande numeriche/decisionali con `<details><summary>Mostra risposta</summary>...</details>`.

- [ ] **Step 3: Validare il modulo e l'integrità LaTeX/MDX**

Run: `cd C:/Users/User/Desktop/gynnitech && npx tsx scripts/validate-lezioni-v2.ts --filter marketing-data-science && npm run validate:content && npm run check:mdx`
Expected: PASS con `0 errori` sui 19 file e compilazione LaTeX/MDX pulita.

- [ ] **Step 4: Commit**

```bash
git add src/content/corso/marketing-data-science/
git commit -m "content(corso): migrate marketing-data-science (19 lessons) to didattica-v2"
```

---

### Task 3: Migrare `analisi-marketing` (22 lezioni, `analytical`) a `didattica-v2`

**Files:**
- Modify: `src/content/corso/analisi-marketing/*.mdx` (tutti i 22 file)

**Interfaces:**
- Consumes: `scripts/lezioni-v2-rules.ts` (profilo `analytical`), `docs/lezioni/prompt-didattica-v2.md`
- Produces: 22 lezioni valide in `didattica-v2`

- [ ] **Step 1: Verificare inventario dei 22 file**

Run: `cd C:/Users/User/Desktop/gynnitech && python3 -c "from pathlib import Path; [print(f.name) for f in sorted(Path('src/content/corso/analisi-marketing').glob('*.mdx'))]"`
Expected: 22 file elencati.

- [ ] **Step 2: Elevare e riscrivere le 22 lezioni in `didattica-v2`**

Trasformare ciascuna delle 22 lezioni portandole a 1.800–3.800 parole prosa (1.200–2.600 per indice), con focus su:
- Calcolo esplicito di CAC, payback period, LTV/CAC per coorte, marginal ROAS, cannibalizzazione branded/non-branded, incrementality testing e funnel multi-touch.
- Esempio svolto su tabella mensile/settimanale reale + query SQL o snippet Python realistico (su schema eventi/ordini coerente con il modulo).
- Diagramma `mermaid` o tabella di riconciliazione + 2–3 errori comuni + autoverifica con `<details>`.

- [ ] **Step 3: Validare il modulo**

Run: `cd C:/Users/User/Desktop/gynnitech && npx tsx scripts/validate-lezioni-v2.ts --filter analisi-marketing && npm run validate:content && npm run check:mdx`
Expected: PASS su tutti i 22 file.

- [ ] **Step 4: Commit**

```bash
git add src/content/corso/analisi-marketing/
git commit -m "content(corso): migrate analisi-marketing (22 lessons) to didattica-v2"
```

---

### Task 4: Migrare `direzioni-analitica` (14 lezioni, `conceptual`) a `didattica-v2`

**Files:**
- Modify: `src/content/corso/direzioni-analitica/*.mdx` (tutti i 14 file)

**Interfaces:**
- Consumes: `scripts/lezioni-v2-rules.ts` (profilo `conceptual`), `docs/lezioni/prompt-didattica-v2.md`
- Produces: 14 lezioni valide in `didattica-v2`

- [ ] **Step 1: Verificare inventario dei 14 file**

Run: `cd C:/Users/User/Desktop/gynnitech && python3 -c "from pathlib import Path; [print(f.name) for f in sorted(Path('src/content/corso/direzioni-analitica').glob('*.mdx'))]"`
Expected: 14 file elencati.

- [ ] **Step 2: Normalizzare ed elevare le 14 lezioni a `didattica-v2`**

Preservare i concetti validi già presenti (media attuale ~1.549 parole), eliminare boilerplate (`autore/controllatoDa/autorizzatoDa`, `# H1`, `Verdetto:`), ampliare l'arco didattico a 1.600–3.200 parole prosa (1.200–2.600 per indice) con diagramma `mermaid` / matrice decisionale, caso numerico svolto, errori tipici e risposte `<details>` nell'autoverifica finale.

- [ ] **Step 3: Validare il modulo**

Run: `cd C:/Users/User/Desktop/gynnitech && npx tsx scripts/validate-lezioni-v2.ts --filter direzioni-analitica && npm run validate:content && npm run check:mdx && npx vitest run tests/theoretical-lessons-cleanliness.test.ts`
Expected: PASS su tutti i 14 file.

- [ ] **Step 4: Commit**

```bash
git add src/content/corso/direzioni-analitica/
git commit -m "content(corso): migrate direzioni-analitica (14 lessons) to didattica-v2"
```

---

### Task 5: Normalizzare `ai-data-workflows` (10) e `agentic-ai-data-workflows` (10) in `didattica-v2`

**Files:**
- Modify: `src/content/corso/ai-data-workflows/*.mdx` (10 file)
- Modify: `src/content/corso/agentic-ai-data-workflows/*.mdx` (10 file)

**Interfaces:**
- Consumes: `scripts/lezioni-v2-rules.ts` (profilo `technical`), `docs/lezioni/prompt-didattica-v2.md`
- Produces: 20 lezioni conformi a `didattica-v2` (Wave 1 completa: 95/95 moduli mancanti migrati!)

- [ ] **Step 1: Analizzare scostamenti dai criteri V2 nei 20 file esistenti**

Run: `cd C:/Users/User/Desktop/gynnitech && python3 -c "from pathlib import Path; import re; [print(f.parent.name, f.name, 'H1' if re.search(r'^# ', f.read_text('utf-8'), re.M) else 'noH1', 'details' if '<details>' in f.read_text('utf-8') else 'nodetails') for m in ['ai-data-workflows','agentic-ai-data-workflows'] for f in sorted(Path('src/content/corso', m).glob('*.mdx'))]"`
Expected: lista puntuale dei gap strutturali (H1 duplicato, frontmatter legacy, assenza `<details>`, eventuali lunghezze > 3.800 parole o H2 generici).

- [ ] **Step 2: Rifinire tutti i 20 file senza perdere profondità**

Questi due moduli sono già il riferimento stilistico qualitativo (~3.100 parole medie). Intervenire chirurgicamente su:
- `formato: "didattica-v2"`, rimozione `autore`/`controllatoDa`/`autorizzatoDa`, rimozione `# H1` duplicato nel body.
- Assicurare presenza di `> **Idea chiave:** ...` in apertura, almeno 1 diagramma `mermaid` o tabella, almeno 1 esempio numerico/costo/latenza/eval svolto passo-passo, 2–3 errori tipici (`###`), e 3–5 domande con `<details><summary>Mostra risposta</summary>...</details>`.
- Verificare che il conteggio parole prosa rientri in `1800–3800` (`1200–2600` per eventuali indici).

- [ ] **Step 3: Validare i 2 moduli e verificare `npm run check` (milestone fine Wave 1: 95/236 V2 + 141/236 articolo)**

Run: `cd C:/Users/User/Desktop/gynnitech && npx tsx scripts/validate-lezioni-v2.ts && npm run check`
Expected: PASS su tutti i `95` file `didattica-v2` + tutti i `141` `articolo` + `astro check` + `vitest`.

- [ ] **Step 4: Commit**

```bash
git add src/content/corso/ai-data-workflows/ src/content/corso/agentic-ai-data-workflows/
git commit -m "content(corso): align ai-data-workflows and agentic-ai-data-workflows (20 lessons) to didattica-v2"
```

---

## Wave 2: Elevazione qualitativa delle 141 lezioni `articolo` a `didattica-v2`

> **Nota di approccio su Wave 2:** Le 141 lezioni in `articolo` soffrono tutte di 4 difetti strutturali comuni: gabbia fissa a 6 H2, pavimento a ~1.300 parole con filler in chiusura, assenza di liste puntate chiarificatrici, assenza di diagrammi `mermaid` / esempi numerici svolti e blocco `sql` meccanico anche quando il tema è concettuale, statistico o infrastrutturale. In ogni task sotto, **non limitarsi a cambiare il frontmatter**: ristrutturare le sezioni in modo naturale (6–10 H2), sostituire il filler con spiegazioni più chiare, diagrammi e calcoli svolti, e aggiungere `<details>` alle domande finali.

### Task 6: Elevare i 3 moduli concettuali (`panoramica` 8 + `gestione-data-driven` 12 + `dashboard-visualizzazione` 7 = 27 lezioni)

**Files:**
- Modify: `src/content/corso/panoramica/*.mdx` (8 file)
- Modify: `src/content/corso/gestione-data-driven/*.mdx` (12 file)
- Modify: `src/content/corso/dashboard-visualizzazione/*.mdx` (7 file)

**Interfaces:**
- Consumes: `scripts/lezioni-v2-rules.ts` (profilo `conceptual`), `docs/lezioni/prompt-didattica-v2.md`
- Produces: 27 lezioni elevate a `didattica-v2` (`1600–3200` parole prosa per core, `1200–2600` per indici)

- [ ] **Step 1: Eseguire la riscrittura/elevazione dei 3 moduli (`conceptual`)**

- Sostituire i blocchi `sql` forzati (dove presenti su temi non-SQL, es. governance o design KPI in `dashboard-visualizzazione`) con diagrammi `mermaid` (gerarchie KPI, wireflow dashboard, processi decisionali), tabelle prima/dopo, brief decisionali realistici e calcoli svolti di metriche/budget.
- Rimuovere i paragrafi filler ripetitivi della vecchia sezione 5, espandere con esempi aziendali completi, liste puntate chiare per trade-off e autoverifica con `<details>`.

- [ ] **Step 2: Validare i 3 moduli**

Run: `cd C:/Users/User/Desktop/gynnitech && npx tsx scripts/validate-lezioni-v2.ts --filter panoramica,gestione-data-driven,dashboard-visualizzazione && npm run validate:content && npm run validate:articolo && npm run check:mdx`
Expected: PASS su tutti i 27 file `didattica-v2`, sulle rimanenti `114` lezioni `articolo` e su `check:mdx`.

- [ ] **Step 3: Commit**

```bash
git add src/content/corso/panoramica/ src/content/corso/gestione-data-driven/ src/content/corso/dashboard-visualizzazione/
git commit -m "content(corso): upgrade panoramica, gestione-data-driven, dashboard-visualizzazione (27 lessons) to didattica-v2"
```

---

### Task 7: Elevare i 2 moduli di analisi prodotto e metriche (`metriche-fondamenti` 9 + `analisi-prodotto` 11 = 20 lezioni)

**Files:**
- Modify: `src/content/corso/metriche-fondamenti/*.mdx` (9 file)
- Modify: `src/content/corso/analisi-prodotto/*.mdx` (11 file)

**Interfaces:**
- Consumes: `scripts/lezioni-v2-rules.ts` (profilo `analytical`), `docs/lezioni/prompt-didattica-v2.md`
- Produces: 20 lezioni elevate a `didattica-v2` (`1800–3800` parole prosa per core)

- [ ] **Step 1: Elevare le 20 lezioni da 1.300 parole rigide a lezioni analitiche complete**

- Per ogni lezione (retention curve, North Star, funnel activation, DAU/MAU stickiness, feature adoption, cohort churn, ecc.): aggiungere un **esempio numerico svolto** su tabella utenti/coorti reale (es. coorti settimanali da 1.000 utenti calcolate riga per riga), un diagramma `mermaid` del funnel o della scomposizione algebrica della metrica, query SQL/Python realistiche e autoverifica con `<details>`.

- [ ] **Step 2: Validare i 2 moduli**

Run: `cd C:/Users/User/Desktop/gynnitech && npx tsx scripts/validate-lezioni-v2.ts --filter metriche-fondamenti,analisi-prodotto && npm run validate:content && npm run validate:articolo && npm run check:mdx`
Expected: PASS su tutti i 20 file e sulle rimanenti `94` lezioni `articolo`.

- [ ] **Step 3: Commit**

```bash
git add src/content/corso/metriche-fondamenti/ src/content/corso/analisi-prodotto/
git commit -m "content(corso): upgrade metriche-fondamenti and analisi-prodotto (20 lessons) to didattica-v2"
```

---

### Task 8: Elevare i 2 moduli quantitativi (`matematica-analisi-dati` 11 + `significativita-statistica` 10 = 21 lezioni)

**Files:**
- Modify: `src/content/corso/matematica-analisi-dati/*.mdx` (11 file)
- Modify: `src/content/corso/significativita-statistica/*.mdx` (10 file)

**Interfaces:**
- Consumes: `scripts/lezioni-v2-rules.ts` (profilo `analytical`), `docs/lezioni/prompt-didattica-v2.md`
- Produces: 21 lezioni elevate a `didattica-v2` con formule LaTeX verificate e derivazioni numeriche passo-passo

- [ ] **Step 1: Elevare le 21 lezioni sostituendo SQL forzati con derivazioni matematiche + Python/SQL appropriato**

- Costruire intuizione visiva e geometrica prima della notazione formale (es. vettori, derivate parziali, Bayes, p-value, potenza statistica, test A/B bayesiani/frequentisti, intervalli bootstrap).
- Svolgere ogni formula su numeri piccoli verificabili a mano + script Python (`scipy`/`numpy`/`pandas`) o SQL analitico realistico, prestando massima attenzione agli escape LaTeX (`\\text`, `\\frac`) in `remark-math`.

- [ ] **Step 2: Validare i 2 moduli e l'integrità LaTeX**

Run: `cd C:/Users/User/Desktop/gynnitech && npx tsx scripts/validate-lezioni-v2.ts --filter matematica-analisi-dati,significativita-statistica && npm run validate:content && npm run validate:articolo && npm run check:mdx`
Expected: PASS su tutti i 21 file (zero warning/errori `findControlCharIssues`) e sulle rimanenti `73` lezioni `articolo`.

- [ ] **Step 3: Commit**

```bash
git add src/content/corso/matematica-analisi-dati/ src/content/corso/significativita-statistica/
git commit -m "content(corso): upgrade matematica-analisi-dati and significativita-statistica (21 lessons) to didattica-v2"
```

---

### Task 9: Elevare il blocco Core Data & SQL (`data-collection` 12 + `advanced-sql` 10 + `data-warehousing` 11 = 33 lezioni)

**Files:**
- Modify: `src/content/corso/data-collection/*.mdx` (12 file)
- Modify: `src/content/corso/advanced-sql/*.mdx` (10 file)
- Modify: `src/content/corso/data-warehousing/*.mdx` (11 file)

**Interfaces:**
- Consumes: `scripts/lezioni-v2-rules.ts` (profilo `technical`), `docs/lezioni/prompt-didattica-v2.md`
- Produces: 33 lezioni elevate a `didattica-v2` (`1800–3800` parole prosa per core)

- [ ] **Step 1: Elevare le 33 lezioni tecniche con tracciamento dati e schemi reali**

- In `data-collection`: tracciare eventi client/server, DataLayer, consenso/PII, payload JSON/Python/SQL reali con diagrammi di sequenza `mermaid`.
- In `advanced-sql`: mostrare **tabelle di input + righe intermedie + output risultante** per window functions, CTE ricorsive, `QUALIFY`, lateral join, anti-join su `NULL`, piano di esecuzione e costi I/O.
- In `data-warehousing`: diagrammi ERD `mermaid` (star/snowflake/SCD Type 2/factless fact), trace su chiavi surrogate e late-arriving facts, SQL DDL/DML completo.

- [ ] **Step 2: Validare i 3 moduli**

Run: `cd C:/Users/User/Desktop/gynnitech && npx tsx scripts/validate-lezioni-v2.ts --filter data-collection,advanced-sql,data-warehousing && npm run validate:content && npm run validate:articolo && npm run check:mdx`
Expected: PASS su tutti i 33 file e sulle rimanenti `40` lezioni `articolo`.

- [ ] **Step 3: Commit**

```bash
git add src/content/corso/data-collection/ src/content/corso/advanced-sql/ src/content/corso/data-warehousing/
git commit -m "content(corso): upgrade data-collection, advanced-sql, data-warehousing (33 lessons) to didattica-v2"
```

---

### Task 10: Elevare il blocco Data Platform & Ops (`analytics-engineering` 12 + `s3-data-lake` 7 + `kafka-streaming` 7 + `real-time-analytics` 7 + `infrastructure-ops` 7 = 40 lezioni)

**Files:**
- Modify: `src/content/corso/analytics-engineering/*.mdx` (12 file)
- Modify: `src/content/corso/s3-data-lake/*.mdx` (7 file)
- Modify: `src/content/corso/kafka-streaming/*.mdx` (7 file)
- Modify: `src/content/corso/real-time-analytics/*.mdx` (7 file)
- Modify: `src/content/corso/infrastructure-ops/*.mdx` (7 file)

**Interfaces:**
- Consumes: `scripts/lezioni-v2-rules.ts` (profilo `technical`), `docs/lezioni/prompt-didattica-v2.md`
- Produces: 40 lezioni elevate a `didattica-v2` (Wave 2 completa: **236/236 lezioni in `didattica-v2`!**)

- [ ] **Step 1: Elevare i 5 moduli nel loro stack nativo (SQL/dbt/YAML/Parquet/Kafka/Flink/Docker/Terraform)**

- Eliminare qualsiasi query `sql` finta in `kafka-streaming`, `s3-data-lake` o `infrastructure-ops` e usare i blocchi reali (configurazioni `yaml`, comandi `bash`, snippet `python`, modelli dbt `sql` + `schema.yml`, DDL Iceberg/ClickHouse/DuckDB).
- Aggiungere diagrammi `mermaid` di pipeline/partizionamento/watermark/checkpointing e un esempio numerico di sizing, throughput, compaction o latency budget svolto passo-passo in ogni lezione.

- [ ] **Step 2: Validare tutti i 5 moduli e verificare copertura 236/236**

Run: `cd C:/Users/User/Desktop/gynnitech && npx tsx scripts/validate-lezioni-v2.ts && python3 -c "from pathlib import Path; import re; files=list(Path('src/content/corso').glob('*/*.mdx')); v2=sum(1 for f in files if re.search(r'^formato:\s*[\"\']?didattica-v2', f.read_text('utf-8'), re.M)); print(f'didattica-v2: {v2}/{len(files)}')" && npm run check`
Expected: `didattica-v2: 236/236` e `npm run check` verde al 100%!

- [ ] **Step 3: Commit**

```bash
git add src/content/corso/analytics-engineering/ src/content/corso/s3-data-lake/ src/content/corso/kafka-streaming/ src/content/corso/real-time-analytics/ src/content/corso/infrastructure-ops/
git commit -m "content(corso): upgrade platform and ops modules (40 lessons) to didattica-v2 (236/236 complete)"
```

---

## Wave 3: Chiusura ecosistema, rigenerazione `llms-full.txt`, build completa e audit finale

### Task 11: Consolidare lo stato 236/236, rigenerare `llms-full.txt` ed eseguire `release:course-v2`

**Files:**
- Modify: `public/llms-full.txt` (rigenerato)
- Modify: `scripts/validate-lezioni-articolo.ts` (o sostituzione della chiamata in `package.json` con verifica `0` residui legacy `articolo`, mantenendo la compatibilità storica)

**Interfaces:**
- Consumes: 236 lezioni `didattica-v2` in `src/content/corso/`, `package.json` (`release:course-v2`)
- Produces: artefatto sito compilato, tradotto (`translate:static`), indicizzato (`pagefind`), verificato da `audit:site` e `course_catalog.py audit`

- [ ] **Step 1: Attivare `--require-all` per controllo anti-regressione legacy (0 lezioni `articolo` residue) e aggiornare `public/llms-full.txt`**

- In `package.json`, cambiare `"validate:v2": "tsx scripts/validate-lezioni-v2.ts --require-all"` (così fallisce se una lezione core in `src/content/corso/*/*.mdx` torna a `articolo` o resta senza `formato: "didattica-v2"`).
- Rigenerare `public/llms-full.txt` con `npm run llms:full`.

- [ ] **Step 2: Eseguire la pipeline di rilascio completa senza deploy**

Run: `cd C:/Users/User/Desktop/gynnitech && npm run release:course-v2`
Expected:
- `course_catalog.py audit --repo-root .` -> exit 0.
- `npm run check` (`validate:content`, `validate:articolo`, `validate:v2`, `check:mdx`, `astro check`, `vitest run`) -> exit 0.
- `npm run build` (`llms:full`, `astro build`, `translate:static`, `normalize:redirects`, `normalize:links`, `index:search`, `audit:site`) -> exit 0.

- [ ] **Step 3: Controllo a campione su pagine HTML generate (`dist/`)**

Verificare che almeno 3 pagine rappresentative (1 `conceptual`, 1 `analytical`, 1 `technical`, es. `filosofia-analisi-dati`, `significativita-statistica`, `advanced-sql`) contengano il markup `<details>`, i diagrammi Mermaid renderizzabili e nessun duplicato `<h1>` nel corpo.

- [ ] **Step 4: Commit finale e richiesta conferma deploy**

```bash
git add scripts/validate-lezioni-v2.ts public/llms-full.txt
git commit -m "chore(release): enforce 236/236 didattica-v2 parity and regenerate llms-full.txt"
```
(Eventuale `npm run deploy:cloudflare` solo dopo conferma esplicita post-build).
