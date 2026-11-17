# Playbook Editoriale `didattica-v2`

Guida operativa per scrivere e migrare tutte le 236 lezioni di `src/content/corso/` allo standard `formato: "didattica-v2"`.
Le regole qui sotto corrispondono ai controlli automatici di `scripts/lezioni-v2-rules.ts` (`npm run validate:v2`), `scripts/validation.ts` (`npm run validate:content`), `scripts/check-mdx.ts` (`npm run check:mdx`) e `tests/theoretical-lessons-cleanliness.test.ts`.

---

## 1. Contratto Frontmatter e Igiene MDX

Ogni file `.mdx` migrato a `didattica-v2` deve rispettare questo contratto YAML:

```yaml
---
title: "Titolo specifico della lezione"
description: "Descrizione concreta di cosa sa fare lo studente dopo la lezione (niente boilerplate)."
module: "nome-modulo"
order: 1
category: "Categoria"
binario: "ml-tabellare" # oppure "sistemi-llm"
draft: false
duration: "35 min" # formato: "<num> min|minuti|h|ore"
difficulty: "intermedio" # base | intermedio | avanzato (o beginner | intermediate | advanced)
prerequisites:
  - "nome-modulo/lezione-precedente"
learningObjectives:
  - "Calcolare ... dato un dataset di ..."
  - "Diagnosticare ... confrontando ..."
dateModified: 2026-11-17
formato: "didattica-v2"
# senzaCodice: true  # opzionale; vietato nelle core technical
---
```

### Vincoli bloccanti sul file (`V2-R1`, `V2-R11`, `validation.ts`)
- **Campi obbligatori:** `formato: "didattica-v2"`, `title`, `description` specifica (vietato `"Lezione core del modulo..."` / `"Lezione narrativa del modulo..."`), `module`, `order` intero univoco nel modulo, `category`, `binario` (`ml-tabellare` o `sistemi-llm`), `draft: false`, `duration`, `difficulty`, `prerequisites` (ogni slug deve esistere in `src/content/corso`), `learningObjectives` (almeno **2** obiettivi specifici e verificabili; vietati testi generici da template), `dateModified`.
- **Campi legacy vietati (`V2-R11`):** rimuovere sempre `autore`, `controllatoDa`, `autorizzatoDa`.
- **Zero `# H1` nel body:** Astro genera già `<h1>` dal frontmatter `title`. Il body inizia con prosa o direttamente con la prima sezione `## H2`.
- **Zero residui 3S e placeholder (`V2-R11`):** niente `import ...` JSX/ESM, niente componenti legacy (`<LezioneCard>`, `<Sezione>`, `<Quiz>`, `<Esercizio>`, `<Schema>`, `<Tabella>`, `<Percorso>`, `<Obiettivi>`, `<Slide>`, `<Passo>`, `<Confronto>`, `<Lato>`, `<Criterio>`, `<Passi>`, `<Fase>`, `<Opzioni>`, `<Opzione>`, `<MiniTabella>`, `<TabellaDati>`, `<Barre>`, `<Barra>`, `<NumeriGrandi>`, `<Numero>`, `<Relazioni>`, `<Nodo>`, `<Pattern>`, `<ErroreTipico>`, `<Messaggio>`, `<Domanda>`, `QuizExercise`, `SqlExercise`), niente `"una sessione, tre blocchi"`, niente `TODO`, `TBD`, `FIXME`, `[da completare]`, `[placeholder]`.
- **Blocchi fenced chiusi:** ogni blocco ```` ``` ```` o `~~~` deve avere chiusura corrispondente e, per codice eseguibile, linguaggio dichiarato.
- **Formule LaTeX sicure per MDX:** verificare con `npm run check:mdx` che non ci siano caratteri di controllo o escape non validi.

---

## 2. Arco Pedagogico in 5 Momenti (su 6–10 H2 liberi)

I titoli `## H2` sono **liberi e specifici del dominio** (niente gabbia fissa). Ogni lezione core deve attraversare questi 5 momenti nell'arco delle sue **6–10 sezioni H2** (**4–8** per indici `order: 0`).

### Momento 1 — Caso o problema d'apertura + ancoraggio fattuale (`V2-R10`)
- Apri (nell'intro o nella prima sezione `## H2`) con una situazione concreta, un guasto, un dilemma decisionale o un caso misurabile.
- **Obbligatorio nell'apertura** (intro + prima `## H2`): includi almeno **una fonte esterna verificabile** (`https://...`) **oppure** una dichiarazione esplicita usando esattamente una di queste formule: `"numeri di esempio"`, `"caso ricostruito"`, `"scenario costruito"`, `"esempio costruito"`.
- Non usare mai formule template come `"Questa lezione appartiene al binario..."`.

### Momento 2 — Intuizione e tesi chiave (`V2-R4`, `V2-R5`)
- Nelle **prime due sezioni** (intro + H2 #1 + H2 #2) inserisci la tesi centrale in uno di questi formati:
  - callout in blockquote con grassetto: `> **Idea chiave:** ...`
  - oppure riga isolata in grassetto: `**Principio in una frase senza formule.**`
- Costruisci il modello mentale prima della formalizzazione e inserisci almeno **1 elemento visivo strutturato**:
  - diagramma ```` ```mermaid ```` (renderizzato nativamente da `astro-mermaid`)
  - oppure tabella Markdown completa con almeno **3 righe dati**.

### Momento 3 — Modello, meccanismo e *Worked Example* numerico (`V2-R6`)
- Spiega come funziona il meccanismo sotto il cofano, senza salti logici.
- Almeno una sezione `## H2` (esclusa l'ultima) deve contenere nella prosa un **esempio numerico svolto passo-passo**:
  - almeno **3 quantità con unità o percentuali** (es. `€`, `$`, `%`, `euro`, `ms`, `sec`, `min`, `ore`, `giorni`, `mesi`, `anni`, `gb`, `mb`, `righe`, `record`, `utenti`, `ordini`, `clienti`, `eventi`, `click`, `sessioni`, `lead`, `visite`, `casi`, `conversioni`, `query`, `nodi`, `partizioni`, `token`, `pp`, `x`)
  - **e** una **derivazione esplicita** (operazioni `+ - * / × ÷ =`, frecce `→ <numero>`, passaggi `da X a Y`, oppure termini come `calcol...`, `risultato`, `totale`, `somma`, `media`, `tasso`, `margine`, `differenza`, `variazione`, `incremento`, `riduzione`, `pari a`, `quindi`, `otteniamo`, `equivale`, `derivazione`, `esempio numerico`).
- Garantisci inoltre che almeno una sezione soddisfi il controllo di verificabilità (`regola_5` in `validation.ts`): nome proprio + anno/percentuale oppure numero + unità misurabile.

### Momento 4 — Applicazione concreta ed errori comuni
- Applica il metodo secondo il profilo del modulo (vedi Sezione 4: codice reale nel linguaggio nativo, derivazioni tabellari o artefatti decisionali).
- Dedica spazio a **2–3 errori tipici / anti-pattern reali**, ciascuno strutturato con sottotitoli `###` chiari che spiegano: **sintomo**, **perché sembra ragionevole / perché succede**, **come si evita o si corregge**.

### Momento 5 — Verifica autonoma con risposte collassabili (`V2-R9`)
- L'ultima sezione `## H2` (titolo naturale legato al controllo pratico, es. `Verifica sulle tue query` o `Controllo decisionale`) deve contenere **da 3 a 5 domande o micro-casi numerati** che terminano con `?`.
- Ogni domanda deve essere abbinata **1:1** al proprio blocco `<details><summary>Mostra risposta</summary>...</details>` non vuoto subito dopo la domanda e prima della domanda successiva:

```markdown
## Controllo operativo prima del deploy

1. Se una tabella degli eventi cresce di 50 milioni di righe al giorno, quale chiave scegli per evitare full scan nelle query per tenant?

<details>
<summary>Mostra risposta</summary>

Metti `tenant_id` come prefisso della chiave di ordinamento prima del timestamp, così il motore salta subito i granuli degli altri tenant.

</details>
```

---

## 3. Voce, Stile, Prose-First e Divieti

### Voce e registro (`V2-R10`)
- **Italiano diretto da docente esperto:** usa il `tu` oppure la forma impersonale/`noi` mantenendo coerenza per tutta la lezione.
- **Vietato il `voi`:** mai `voi`, `vostro`, `vostra`, `vostri`, `vostre`, né forme come `vi mostro`, `vi spiego`, `scoprirete`.
- **Zero emoji** nella prosa.
- **Zero punti esclamativi (`!`)** nella prosa (ammessi solo dentro blocchi di codice o inline code).

### Rapporto prosa / liste (`V2-R8`)
- Liste puntate, numerate e tabelle sono ammesse ovunque aiutino il confronto (criteri, parametri, prima/dopo, trade-off).
- Tuttavia la lezione deve restare guidata dalla prosa esplicativa: **`proseRatio >= 0.45`** (almeno il 45% delle righe testuali non-codice deve essere prosa continua, escludendo titoli, liste, tabelle, righe isolate in grassetto e separatori `---`).

### Titoli H2 vietati (`V2-R2`)
Non usare mai come titolo `## H2` (anche con numeri iniziali o punteggiatura finale):
- `Introduzione`
- `L'idea di fondo`
- `Riepilogo`
- `Conclusioni`
- `Sintesi`

### Frasi vietate (`FRASI_VIETATE` in `lezioni-v2-rules.ts` + `validation.ts`)
Evita ogni meta-commento editoriale, filler AI e frase cuscinetto:
- Meta-testo sul documento/corso: `in questo modulo`, `in questa lezione`, `in questo articolo`, `vedremo come`, `vediamo ora`, `capiremo insieme`, `abbiamo visto`, `nel prossimo paragrafo`, `nei paragrafi successivi`, `ti mostro`, `ti spiegherò`, `scoprirete`, `vi mostr*`, `vi spieg*`, `facciamo un passo indietro`, `partiamo dalle basi`.
- Chiusure e riempitivi: `in conclusione`, `ricapitolando`, `in poche parole`, `in sintesi finale`, `nel mondo di oggi`, `sempre più`, `approfondiamo`, `scopriamo insieme`, `non è altro che`, `negli ultimi anni`, `vale la pena notare`, `vale la pena ricordare`, `è importante sottolineare`.
- Cuscinetti e meta-ragionamento (`validation.ts`): `non sono un esperto`, `potrei sbagliarmi`, `in generale si può dire`, `CauCoT`, `ToT`, `Structural CoT`, `Chain of Thought`.

---

## 4. Schede Operative per Profilo di Modulo

Le soglie di parole si riferiscono **alla sola prosa** (esclusi blocchi codice e `mermaid`; inclusa la prosa dentro `<details>`).

| Tipologia / Profilo | Moduli inclusi (`V2_MODULE_PROFILES`) | Parole prosa | Sezioni H2 | Vincolo artefatti e codice (`V2-R7`) |
|---|---|---:|---:|---|
| **`technical`** (core) | `data-collection`, `advanced-sql`, `data-warehousing`, `analytics-engineering`, `s3-data-lake`, `kafka-streaming`, `real-time-analytics`, `infrastructure-ops`, `ai-data-workflows`, `agentic-ai-data-workflows` | **1.800 – 3.800** | **6 – 10** | `senzaCodice: true` vietato. Minimo **2 blocchi di codice non-mermaid** con linguaggio esplicito |
| **`analytical`** (core) | `metriche-fondamenti`, `matematica-analisi-dati`, `significativita-statistica`, `analisi-prodotto`, `analisi-marketing`, `marketing-data-science` | **1.800 – 3.800** | **6 – 10** | Minimo **1 blocco `sql` / `python` / `py` / `r`** (oppure `senzaCodice: true` con tabella di calcolo `>= 4` righe dati e `>= 3` numeriche) |
| **`conceptual`** (core) | `panoramica`, `gestione-data-driven`, `dashboard-visualizzazione`, `direzioni-analitica`, `filosofia-analisi-dati` | **1.600 – 3.200** | **6 – 10** | Minimo **2 artefatti strutturali** (tabelle `>= 3` righe, `mermaid`, o blockquote `>= 3` righe). Regole codice sotto |
| **Indice / Cheat sheet** | Qualsiasi modulo con `order: 0` oppure slug `indice*`, `cheat-sheet*`, `glossario*` | **1.200 – 2.600** | **4 – 8** | Se `senzaCodice: true`, zero blocchi non-mermaid |

### Dettaglio profilo `technical` (10 moduli)
- Usa il **linguaggio reale del modulo**: `sql` / `yaml` in `analytics-engineering`, `python` / `json` in `ai-data-workflows` e `agentic-ai-data-workflows`, `bash` / `yaml` / `toml` in `infrastructure-ops` e `kafka-streaming`, ecc. Niente SQL artificiale dove il flusso è in Python o YAML.
- Inserisci **almeno 2 blocchi di codice eseguibili non-mermaid** con linguaggio dichiarato e almeno una riga di codice commentata (`#`, `--`, `//`, `/*`), così `validation.ts` (`regola_1`) e `V2-R7` risultano soddisfatti in modo naturale.
- Evita `foo`/`bar`: usa nomi reali di tabelle, topic, DAG, modelli e tipi espliciti.

### Dettaglio profilo `analytical` (6 moduli)
- Mostra sempre la **derivazione matematica o tabellare completa** su numeri realistici prima o accanto al codice.
- Inserisci **almeno 1 blocco eseguibile** in `sql`, `python` (`py`) o `r` per replicare il calcolo su scala reale.
- Se la lezione è puramente metodologica/matematica senza codice eseguibile, dichiara `senzaCodice: true` nel frontmatter, rimuovi ogni blocco di codice non-mermaid e includi **almeno una tabella di calcolo** con **>= 4 righe dati** di cui **>= 3 righe con valori numerici**.

### Dettaglio profilo `conceptual` (5 moduli) e `THEORETICAL_CATEGORIES`
Il comportamento sul codice dipende dalla `category` nel frontmatter (`THEORETICAL_CATEGORIES` allineate con `tests/theoretical-lessons-cleanliness.test.ts` e `course_catalog.py`):
- **Categorie teoriche:** `Strategia`, `Comunicazione`, `Ricerca`, `Ricerca Qualitativa`, `Ricerca Quantitativa`, `Fondamenti`, `Metriche`, `Metodologia`, `Brand`, `Management`.
  - In un modulo `conceptual` con una di queste categorie (oppure in **qualsiasi** lezione con `senzaCodice: true`): **zero blocchi di codice non-mermaid** (i diagrammi ```` ```mermaid ```` sono sempre consentiti e conteggiati tra gli artefatti).
- **Categorie operative fuori da `THEORETICAL_CATEGORIES`** in moduli `conceptual` (es. specifica tecnica in `dashboard-visualizzazione`):
  - O includi **almeno 1 blocco di codice reale** con linguaggio esplicito (es. `sql`, `json`, `yaml`), **oppure** dichiari esplicitamente `senzaCodice: true` nel frontmatter.
- In ogni caso, una lezione core `conceptual` deve contenere **almeno 2 artefatti strutturali** scelti tra:
  - diagrammi ```` ```mermaid ````
  - tabelle Markdown con `>= 3` righe dati
  - blockquote multi-riga con `>= 3` righe non vuote (es. template di memo, brief analitico, verbale di decisione).

### Dettaglio lezioni Indice (`order: 0` o slug `indice*` / `cheat-sheet*` / `glossario*`)
- Coprono mappa del modulo, criteri di navigazione tra le lezioni e collegamento pratico ai concetti chiave.
- Rispettano **1.200–2.600 parole** di prosa, **4–8 sezioni `## H2`**, arco d'apertura (link o disclaimer), tesi chiave nelle prime due sezioni, almeno 1 elemento visivo (`mermaid` o tabella `>= 3` righe), almeno 1 *worked example* numerico, `proseRatio >= 0.45`, voce/divieti e chiusura con 3–5 domande numerate + `<details>`.

---

## 5. Checklist Pre-Commit e Comandi di Verifica

Prima di fare commit su una o più lezioni migrate, esegui sempre in quest'ordine:

### Checklist editoriale rapida
1. **Frontmatter pulito:** `formato: "didattica-v2"`, `binario` valido, `draft: false`, `learningObjectives` >= 2 specifici, zero `autore`/`controllatoDa`/`autorizzatoDa`.
2. **Body senza H1 e senza residui 3S:** nessun `# Titolo` nel body, nessun componente `<Slide>`/`<Quiz>`/`<Tabella>`, nessun `TODO`/`TBD`.
3. **Arco in 5 momenti completo:** apertura con `https://...` o disclaimer esplicito; `> **Idea chiave:** ...` o grassetto isolato nelle prime 2 sezioni; >= 1 `mermaid` o tabella `>= 3` righe; worked example con >= 3 quantità + derivazione; 2–3 errori comuni con `###`; ultima `## H2` con 3–5 domande `?` ciascuna seguita da `<details><summary>Mostra risposta</summary>...</details>`.
4. **Profilo rispettato:** parola-count nel range del profilo, H2 nel range (nessun titolo vietato), codice/artefatti conformi a `technical` / `analytical` / `conceptual` / `index`, `proseRatio >= 0.45`.
5. **Voce pulita:** niente `voi`/`vostro`, niente emoji, niente `!` fuori dai blocchi codice, nessuna frase di `FRASI_VIETATE`.

### Comandi CLI dalla root del repository

```bash
# 1. Validazione rapida sul singolo modulo su cui stai lavorando
npx tsx scripts/validate-lezioni-v2.ts --filter <nome-modulo>

# 2. Validazione strutturale globale di tutte le lezioni didattica-v2
npm run validate:v2

# 3. Validazione frontmatter, prerequisiti, slug e rubrica Argo/Giano
npm run validate:content

# 4. Compilazione MDX + controllo caratteri di controllo LaTeX
npm run check:mdx

# 5. Gate completo pre-merge (content + articolo + v2 + mdx + astro check + vitest)
npm run check
```

A migrazione completata su tutte le 236 lezioni, verifica la copertura al 100% con:

```bash
npx tsx scripts/validate-lezioni-v2.ts --require-all
```
