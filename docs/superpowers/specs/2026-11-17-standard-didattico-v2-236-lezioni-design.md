# Spec: Standard Didattico V2 (`didattica-v2`) per tutte le 236 lezioni di GinnyTech

**Data:** 2026-11-17
**Stato:** Bozza approvata per pianificazione
**Ambito:** `src/content/corso/` (21 moduli, 236 lezioni core + `learning-path.mdx`), validazione, rendering MDX/Astro, catalogo editoriale, `llms-full.txt` e traduzioni.

---

## 1. Diagnosi sullo stato attuale (verificata su disco)

Al 2026-11-17 il catalogo `src/content/corso/` contiene **21 moduli e 236 lezioni**:
- **141 lezioni** in 15 moduli usano `formato: "articolo"` (regolato da `scripts/lezioni-articolo-rules.ts`).
- **95 lezioni** in 6 moduli non usano ancora uno standard unificato:
  - `filosofia-analisi-dati` (20 lezioni, media **819** parole, min 654): dispense brevi in stile vecchio.
  - `marketing-data-science` (19 lezioni, media **974** parole, min 626): dispense brevi, spesso astratte.
  - `analisi-marketing` (22 lezioni, media **1.251** parole, min 822): copertura irregolare, poche derivazioni svolte.
  - `direzioni-analitica` (14 lezioni, media **1.549** parole, min 1.174): lunghezza buona ma tono e chiusura misti (`tu`/impersonale, `Verdetto:`).
  - `ai-data-workflows` (10 lezioni, media **3.130** parole) e `agentic-ai-data-workflows` (10 lezioni, media **3.057** parole): già ricche, concrete e leggibili, ma con H1 duplicato nel body, metadati pipeline (`autore`/`controllatoDa`/`autorizzatoDa`), nessuna verifica automatica di qualità didattica e nessuna chiusura uniforme con risposte.

### Perché le attuali 141 lezioni `articolo` risultano rigide, brevi o poco chiare
1. **Gabbia fissa a 6 sezioni H2 (`SEZIONI_ATTESE = 6`)**: costringe argomenti complessi (es. window functions, design sperimentale, Kafka partitioning) in sei blocchi identici a prescindere dalla progressione cognitiva reale.
2. **Tetto/pavimento stretto (`1.300–1.900` / `2.400` parole)**: 7 moduli su 15 (`metriche-fondamenti`, `analisi-prodotto`, `significativita-statistica`, `dashboard-visualizzazione`, `gestione-data-driven`, `infrastructure-ops`, `matematica-analisi-dati`) si fermano sistematicamente tra **1.303 e 1.336 parole**, con chiusure ripetitive usate per raggiungere la soglia.
3. **Divieto di elenchi puntati nelle sezioni 1–5 (`R11`)**: penalizza le liste anche quando servono per confrontare trade-off, parametri o criteri decisionali, generando muri di prosa densa.
4. **Blocco `sql` obbligatorio nelle sezioni 3 e 4 (`R4`)**: forza query SQL artificiali anche in moduli su Python, statistica, Kafka, Docker o matematica, dove lo strumento reale è codice Python, YAML, bash, formule o tabelle di calcolo.
5. **Assenza di *worked example* numerico obbligatorio e di supporto visivo**: molte lezioni spiegano un metodo a parole senza mostrare un calcolo completo passo-passo sui numeri reali e senza diagrammi di flusso/architettura.
6. **Divieto rigido della seconda persona (`R8`) e assenza di feedback nell'autoverifica (`R5`)**: il registro burocratico (`"eseguite"`, `"verificate"`) appesantisce la lettura, e le 5 domande finali non offrono una risposta verificabile dallo studente.

---

## 2. Obiettivi dello Standard `didattica-v2`

1. Unificare **tutte le 236 lezioni** (le 95 mancanti + le 141 esistenti) sotto un formato didattico moderno, chiaro, progressivo e verificabile automaticamente (`formato: "didattica-v2"`).
2. Passare da **modello burocratico a struttura fissa** a **modello pedagogico adattivo per natura del modulo** (3 profili: `technical`, `analytical`, `conceptual`).
3. Garantire che ogni migrazione avvenga **senza rompere i gate CI** durante il lavoro incrementale: `articolo` e `didattica-v2` coesistono in `schemas.ts` e `validation.ts` finché tutte le 236 lezioni non passano a `didattica-v2`.

---

## 3. Specifiche del formato `didattica-v2`

### 3.1 Frontmatter e intestazione
- `formato: "didattica-v2"` obbligatorio.
- Campi obbligatori e invarianti: `title`, `description` (specifica, niente boilerplate `"Lezione core/narrativa del modulo"`), `module`, `order`, `category`, `binario` (`"ml-tabellare" | "sistemi-llm"`), `draft` (`boolean`, `false` per pubblicazione), `duration` (`"XX min"`), `difficulty` (`base | intermedio | avanzato | beginner | intermediate | advanced`), `prerequisites` (array di slug validi), `learningObjectives` (`>= 2` obiettivi specifici e verificabili), `dateModified`.
- `senzaCodice: true` opzionale (obbligatorio se la lezione non contiene blocchi di codice eseguibili e rispetta le regole delle lezioni teoriche).
- **Nessun `# H1` nel body**: `src/pages/course/[module]/[slug].astro` renderizza già `<h1>` dal frontmatter `title`.
- Rimuovere progressivamente i metadati interni legacy (`autore`, `controllatoDa`, `autorizzatoDa`) nelle lezioni riscritte/migrate a `didattica-v2`.

### 3.2 Voce, stile e chiarezza didattica
- **Italiano diretto da docente esperto**: ammesso l'uso naturale di `tu` oppure della forma impersonale/`noi` (purché coerente all'interno della lezione). Abolito il divieto meccanico del `tu` (`R8`).
- **Elenchi puntati e tabelle ammessi** ovunque aiutino la scansione visiva (criteri, parametri, confronti prima/dopo, trade-off), purché la lezione resti guidata dalla prosa esplicativa e non diventi una lista di bullet point (`proseRatio >= 0.45`).
- **Zero AI-slop / filler** (`FRASI_VIETATE` estesa: *"in questo articolo vedremo"*, *"nel mondo di oggi"*, *"sempre più"*, *"approfondiamo"*, *"in conclusione"*, *"è importante sottolineare"*, *"scopriamo insieme"*, *"non è altro che"*, *"negli ultimi anni"*, *"vale la pena ricordare"*, *"in sintesi finale"*, oltre a zero emoji e zero `!` nella prosa).
- **Titoli H2 naturali e specifici del dominio**: vietati titoli generici di riempimento (`"Introduzione"`, `"L'idea di fondo"`, `"Riepilogo"`, `"Conclusioni"`, `"Sintesi"`). Numero di sezioni H2 libero tra **6 e 10** (per indici/cheat sheet: **4–8**).

### 3.3 Arco didattico obbligatorio in 5 momenti (su 6–10 H2 liberi)
1. **Problema reale e modello mentale (apertura)**:
   - Incipit concreto (caso reale con fonte esterna verificabile `[testo](https://...)` oppure dichiarazione esplicita *"numeri di esempio"* / *"caso ricostruito"* / *"scenario costruito"*).
   - **Callout o tesi chiave in apertura** (`> **Idea chiave:** ...` oppure riga in grassetto isolata) che condensa il principio in 1–2 frasi senza formule.
2. **Spiegazione progressiva + intuizione visiva**:
   - Dal concetto intuitivo alla formalizzazione.
   - Almeno **1 elemento visivo strutturato**: blocco ` ```mermaid ` (renderizzato nativamente da `astro-mermaid` 2.1.0) oppure tabella comparativa Markdown completa (`>= 3` righe dati).
3. **Esempio numerico svolto passo-passo (*Worked Example*)**:
   - Almeno una sezione con dati numerici espliciti, passaggi intermedi mostrati nel dettaglio e risultato finale commentato in chiave decisionale (no cifre isolate senza derivazione).
4. **Applicazione pratica per profilo di modulo** (Tabella 1):
   - **`technical`** (`data-collection`, `advanced-sql`, `data-warehousing`, `analytics-engineering`, `s3-data-lake`, `kafka-streaming`, `real-time-analytics`, `infrastructure-ops`, `ai-data-workflows`, `agentic-ai-data-workflows`): almeno **2 blocchi di codice** nel linguaggio nativo del modulo (`sql`, `python`, `bash`, `yaml`, `json`, `toml`), commentati e realistici (niente `sql` finto dove serve Python/YAML).
   - **`analytical`** (`metriche-fondamenti`, `matematica-analisi-dati`, `significativita-statistica`, `analisi-prodotto`, `analisi-marketing`, `marketing-data-science`): **derivazione matematica/tabellare completa** + almeno **1 blocco `sql` o `python`** (salvo `senzaCodice: true`, nel qual caso serve una tabella di calcolo completa con almeno 4 righe di passaggi).
   - **`conceptual`** (`panoramica`, `gestione-data-driven`, `dashboard-visualizzazione`, `direzioni-analitica`, `filosofia-analisi-dati`): se `category` è teorica (allineata con `tests/theoretical-lessons-cleanliness.test.ts` e `course_catalog.py`), **zero blocchi di codice eseguibili** (ammesso `mermaid`), ma almeno **2 artefatti strutturati** (tabelle decisionali/metriche, memorie/brief in blockquote `>= 3` righe, confronti prima/dopo). Se la lezione ha `category` operativa/pratica fuori dalle categorie teoriche (es. dashboard spec o SQL operativo), segue le regole del blocco codice o `senzaCodice: true` esplicito.
5. **Trappole comuni e autoverifica con risposte collassabili**:
   - **2–3 errori/anti-pattern reali** (con **###** o sottotitoli chiari: sintomo, perché succede, come si evita).
   - Ultima sezione H2 con **3–5 domande o micro-casi decisionali numerati** (`1. ...?`) ciascuno accompagnato da una risposta sintetica argomentata dentro `<details><summary>Mostra risposta</summary>...</details>` (compatibile con Astro MDX, `.md` twin via `agent-markdown.ts`, `llms-full.txt` e `translate:static`).

### 3.4 Soglie quantitative per tipologia di lezione (`prosa` esclusi blocchi codice)
| Tipologia | Criterio identificazione | Parole prosa min–max | H2 min–max |
|---|---|---:|---:|
| **Lezione Core — Tecnica / Analitica (`technical`, `analytical`)** | `order >= 1`, slug non `indice-*`/`cheat-sheet*` | **1.800 – 3.800** | **6 – 10** |
| **Lezione Core — Concettuale (`conceptual`)** | `order >= 1`, slug non `indice-*`/`cheat-sheet*` | **1.600 – 3.200** | **6 – 10** |
| **Indice modulo / Cheat sheet / Guida di sintesi** | `order === 0` oppure slug `indice-*` / `cheat-sheet*` / `glossario*` | **1.200 – 2.600** | **4 – 8** |

---

## 4. Allineamento ecosistema repository (vincoli critici)

1. **`tests/llms-txt.test.ts` su Windows**: attualmente fallisce con CRLF su `public/llms-full.txt` (`split("\n")` lascia `\r`). Fix con `/\r?\n/` + normalizzazione LF in `scripts/generate-llms-full.ts` e `.gitattributes`.
2. **`src/lib/schemas.ts` + `scripts/validation.ts`**:
   - Estendere `formato` a `z.enum(['articolo', 'didattica-v2']).optional()`.
   - In `scripts/validation.ts`: consentire `didattica-v2` nelle eccezioni `intro` e `SUMMARY_SECTION_REGEX` (come `articolo`), e integrare in `checkLessonPipeline` il supporto esplicito a `formato === "didattica-v2"` senza forzare la regola della sezione <=4 sentences.
   - Riconciliare `PROSE_CHECK` e `hasPipelineClosure` in modo che non entrino in conflitto con `didattica-v2`.
3. **Coerenza `tests/theoretical-lessons-cleanliness.test.ts` ↔ `.codex/skills/course-editorial-system/scripts/course_catalog.py` ↔ `scripts/lezioni-v2-rules.ts`**:
   - I tre file devono condividere esattamente lo stesso set di cartelle concettuali (`CONCEPTUAL_FOLDERS`) e categorie teoriche (`THEORETICAL_CATEGORIES`), evitando il conflitto attuale in `marketing-data-science` (dove una lezione pratica poteva avere `category: "Fondamenti"` + Python).
4. **Rendering `<details>` in `src/lib/agent-markdown.ts` e `scripts/generate-llms-full.ts`**:
   - Assicurare che `<details><summary>...</summary>...</details>` sia accettato da `check:mdx`, reso accessibile in CSS/Astro, e convertito pulitamente in Markdown leggibile (es. `**Risposta:** ...`) in `mdxToAgentMarkdown` senza perdere contenuto né introdurre warning JSX.
5. **Migrazione graduale senza rotture**:
   - `npm run validate:articolo` continua a validare le eventuali lezioni ancora `formato: "articolo"`.
   - `npm run validate:v2` valida tutte le lezioni `formato: "didattica-v2"`.
   - `npm run check` esegue `validate:content`, `validate:articolo`, `validate:v2`, `check:mdx`, `astro check` e `npm run test`.
   - A fine Wave 2 (236/236 lezioni su `didattica-v2`), `validate:articolo` potrà verificare `0` residui legacy o essere ritirato in pulizia finale.
