# /ginnytech — Crew di miglioramento lezioni

Orchestratore che mette al lavoro la crew di subagenti per **migliorare una lezione del corso GinnyTech** o **scriverne una nuova** su un tema.

Argomento: `$ARGUMENTS`

---

## Modalità di invocazione

L'argomento può essere:

- **Path lezione esistente** → modalità *improve*. Esempi: `src/content/corso/metriche-fondamenti/statistica-fondamenti.mdx`, oppure forma corta `metriche-fondamenti/statistica-fondamenti`.
- **Topic libero** (no `.mdx`, no path che inizia con `src/`) → modalità *new*. Esempi: `attribution multi-touch incrementale`, `causal inference per marketing`.
- **Vuoto** → chiedi all'utente quale lezione o topic processare. Suggerisci 2–3 lezioni con score basso da `.claude/lesson-status.md`.

---

## Pipeline

### Step 0 — Preparazione

1. Parsa l'argomento e determina la modalità.
2. Se modalità *new*:
   - Invoca lo skill `/scrivi-lezione $ARGUMENTS` per ottenere una bozza di lezione.
   - Recupera il path del nuovo file generato.
   - Procedi con quel path come `lesson_path` per gli step successivi.
3. Se modalità *improve*:
   - Verifica che il file esista (`Glob` o `Read`).
   - Se non esiste, segnalalo all'utente e chiedi conferma del path corretto.

Comunica all'utente in 1 riga cosa stai per fare e qual è il `lesson_path` finale.

### Step 1 — Critique in parallelo (3 subagenti)

Lancia in **un solo messaggio**, in parallelo, tre invocazioni del tool `Agent`:

- `subagent_type: "lesson-critic-pedagogy"`
- `subagent_type: "lesson-critic-voice"`
- `subagent_type: "lesson-critic-substance"`

A ciascuno passa nel `prompt`:

```
Valuta la lezione: <lesson_path assoluto>

Modulo di appartenenza: <nome modulo dal path>
Tipo lezione (se desumibile dal frontmatter): <metodologica | tecnica | analitica>

Leggi il file integralmente. Applica la tua lente. Produci il report JSON secondo
lo schema in .claude/agents/_report-schema.md. Massimo 5 righe di commento prima
del JSON. Non modificare il file.
```

Attendi tutti e tre i report. Estrai i tre blocchi JSON.

### Step 2 — Decisione di prosecuzione

Calcola la media dei `global_score` dei tre critic:

- **≥ 8.5** → la lezione è già in alto. Mostra all'utente i tre report e chiedi se vuole comunque procedere con la riscrittura. Default: skip.
- **5.0 – 8.4** → procedi con riscrittura (caso normale).
- **< 5.0** → la lezione è gravemente sotto standard. Avvisa l'utente che la riscrittura sarà sostanziale e chiedi conferma esplicita prima di procedere.

Se procedi, mostra all'utente un riassunto in 4–6 righe dei `must_fix` aggregati (top 5 max).

### Step 3 — Riscrittura (1 subagente, sequenziale)

Lancia `Agent` con `subagent_type: "lesson-rewriter"`, prompt:

```
Riscrivi la lezione: <lesson_path>
Iterazione: 1

Report del critic pedagogy:
<JSON pedagogy intero>

Report del critic voice:
<JSON voice intero>

Report del critic substance:
<JSON substance intero>

Prima di sovrascrivere il file, crea il backup .bak. Riscrivi tutto il contenuto
risolvendo i must_fix dei tre critic. Produci il report rewriter secondo lo schema.
```

Attendi il report rewriter. Verifica che il `.bak` sia stato creato.

### Step 4 — Validazione in parallelo (2 subagenti)

Lancia in **un solo messaggio**, in parallelo:

- `subagent_type: "lesson-validator-structure"`
- `subagent_type: "lesson-validator-quality"`

Prompt structure:
```
Valida la struttura tecnica del file: <lesson_path>
Esegui tutti i check obbligatori e produci il report JSON validator.
```

Prompt quality:
```
Valida qualitativamente la riscrittura.
- Nuova versione: <lesson_path>
- Originale (backup): <lesson_path>.bak

Report dei tre critic originali:
<JSON pedagogy>
<JSON voice>
<JSON substance>

Report del rewriter:
<JSON rewriter>

Verifica che i must_fix siano stati affrontati e che non ci siano regressioni.
```

Attendi entrambi.

### Step 5 — Decisione e loop

- Entrambi `approve` → vai a Step 6.
- Almeno uno `reject` AND `iteration < 2` → torna a Step 3 con:
  - `iteration: 2`
  - `validator_feedback: { structure: <JSON>, quality: <JSON> }`
- Almeno uno `reject` AND `iteration == 2` → **escalation utente**: mostra i `blocking_failures` di entrambi i validator, chiedi se accettare comunque (con TODO marker) o ripristinare il `.bak`.

### Step 6 — Diff e approvazione utente

Genera un diff fra `.bak` e nuova versione:

```bash
diff -u <lesson_path>.bak <lesson_path> | head -200
```

Mostra all'utente:
- Diff (truncato a ~200 righe se più lungo).
- Sintesi di 6–10 righe con: cosa è stato cambiato, quali `must_fix` risolti, eventuali `deliberately_ignored`.
- Chiedi: **Approvi (`y`) | Rifiuti e ripristini il .bak (`n`) | Vedi diff completo (`d`)**.

### Step 7 — Finalizzazione

Su `y`:
1. Esegui `npm run validate:content` un'ultima volta per sicurezza.
2. Aggiorna `.claude/lesson-status.md`: cambia lo status della lezione a `✅`, aggiorna word count, aggiorna data in cima.
3. Lascia il `.bak` in posizione (l'utente lo cancellerà a discrezione, o sarà ignorato dal git se in `.gitignore`).
4. Mostra all'utente:
   - Path lezione finale.
   - Word count before/after.
   - Score globale before (media critic) → score atteso after (stima).
   - Eventuali advisory dei validator.

Su `n`:
1. Sovrascrivi `<lesson_path>` con il contenuto di `<lesson_path>.bak`.
2. Cancella il `.bak`.
3. Conferma all'utente che la lezione è stata ripristinata.

Su `d`: mostra il diff completo, poi torna a chiedere `y/n`.

---

## Output finale (su approvazione)

Riporta in formato strutturato:

```
✅ Lezione migliorata: <path>

Critic scores (media):  <before> → <after stimato>
Word count:             <before> → <after>
Iterazioni rewriter:    <1 | 2>

Must-fix risolti:
- ...
- ...

Note advisory:
- ...

Tracking aggiornato: .claude/lesson-status.md
Backup originale:    <path>.bak (puoi cancellare manualmente)
```

---

## Note operative

- **Sempre** lanciare i 3 critic in parallelo (singolo messaggio, 3 tool call). Stesso per i 2 validator.
- **Mai** modificare manualmente il file dall'orchestratore: la scrittura passa solo dal `lesson-rewriter`.
- **Mai** procedere oltre Step 6 senza esplicita approvazione utente (`y`).
- Se un subagente non produce JSON parsabile, ri-lancialo **una volta sola** con prompt aggiuntivo "Output non parsabile. Riprova attenendoti rigidamente allo schema in .claude/agents/_report-schema.md."
- Se WebFetch fallisce nel critic substance, accetta il report ma includi nota all'utente.
- Tieni traccia dello stato con TodoWrite per dare visibilità all'utente sui passaggi.

## Risoluzione subagent_type non trovato

I subagenti in `.claude/agents/` vengono registrati all'**avvio della sessione**. Se vengono creati durante una sessione, non sono disponibili finché non si riavvia Claude Code.

**Se `subagent_type: "lesson-critic-pedagogy"` (o qualsiasi altro nome della crew) restituisce errore "agent type not found"**, passa automaticamente a `general-purpose` con il system prompt del file agente incorporato nel `prompt`. Leggi il file `.claude/agents/<nome-agente>.md` con il tool Read, rimuovi il blocco frontmatter (righe tra `---`), e usa il testo rimanente come preambolo del prompt prima delle istruzioni specifiche.

Questo fallback è trasparente per l'utente: non chiedere conferma, procedi direttamente.

## Obiettivo qualitativo non negoziabile

Le lezioni prodotte dalla crew devono:
- Essere **piene, complete, interessanti** — minimo 2500 parole idealmente 3500–5000
- Avere **casi reali con nomi propri e numeri** (Intercom, Dropbox, Netflix, Gorillas — non "un'azienda B2B")
- Avere **citazioni accademiche** quando il topic le merita (Lemon & Verhoef, Kalbach, McKinsey CDJ, Christensen, Binet/Field)
- **Non avere** sezioni Quiz, Lab, Checkpoint, Piano d'azione, "Livello base/intermedio" — il rewriter le incorpora nella prosa
- Suonare scritte da un **esperto umano**, non da un LLM
- Essere **oneste sui limiti** del framework/metodo insegnato
