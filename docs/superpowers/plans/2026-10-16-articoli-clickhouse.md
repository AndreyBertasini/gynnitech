# Lezioni ClickHouse come «articolo tecnico» Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Riscrivere le 5 lezioni del corso il cui argomento è un meccanismo di ClickHouse con il prompt dell'autore (6 sezioni, 1.300–1.900 parole, codice eseguito davvero), con un controllo automatico del formato.

**Architecture:** Nuovo valore `formato: "articolo"` accanto a `"3s"`: lo schema lo accetta, la rubrica di `validation.ts` lo tratta (regola 1, niente avviso sul Riepilogo) e un validatore dedicato (`validate:articolo`, stesso schema di `validate:3s`) ne controlla le regole meccaniche. Ogni blocco `sql` viene eseguito con chDB (ClickHouse embedded, verificato in sandbox: chDB 4.4.0 = ClickHouse 26.9.2.1) da uno script, così i numeri nel testo sono quelli dell'output.

**Tech Stack:** Astro 5 + Starlight + MDX, TypeScript, vitest, Python 3 + chDB (solo strumento locale, non in CI).

**Spec:** `docs/lezioni/prompt-articolo-tecnico.md` (prompt dell'autore, verbatim).

## Decisioni prese (da confermare in revisione)

- **Lezioni in ambito (5):** quelle il cui argomento è un meccanismo ClickHouse: `data-warehousing/clickhouse`, `real-time-analytics/clickhouse-fondamenti`, `clickhouse-ottimizzazione`, `materialized-views`, `cdc-pattern`. **Fuori:** `cheat-sheet` (scheda) e `caso-studio` (progetto) non sono articoli; `streaming`, `anomaly-detection`, `dashboards` e `kafka-streaming/kafka-connect` hanno un altro argomento. Se «tutte» vuol dire solo le 3 con ClickHouse nel nome del file, si tolgono i Task 7 e 8.
- **`clickhouse-fondamenti` perde il formato «3 secondi»** (pilota del 2026-10-15): diventa articolo. Le altre 4 non erano 3s.
- **Il «ingegnere che l'ha rotta in produzione» è una voce, non una biografia:** niente aneddoti in prima persona inventati. Il caso della sezione 1 è o un caso pubblico con link alla fonte primaria, o uno scenario dichiarato «caso ricostruito», con numeri misurati dal runner SQL su dati sintetici.
- **Invariati:** URL, `title`, `order`, `prerequisites`, immagini, `binario`, autori. Cambiano corpo, `dateModified`, `duration` e, se non più coperti, `learningObjectives`.

## Global Constraints

- Branch `claude/great-hawking-e54n7i` (già riallineato a `main` = `435943d`). Un commit per task; push e PR solo nel Task 9; **nessun merge senza OK dell'utente**.
- I commit chiudono con le righe di attribuzione richieste dalla sessione.
- Rispondere e scrivere in italiano; nel corpo delle lezioni **voi**, mai tu.
- Struttura (prompt): 6 H2 nell'ordine caso concreto · meccanismo · errore tipico · soluzione · caso difficile · checklist; titoli H2 liberi e descrittivi. Il corpo conserva l'H1 del titolo (convenzione MDX del sito).
- Lunghezza: 1.300–1.900 parole di prosa (prompt: ~1.400–1.800; codice escluso); ultimo passaggio: togliere il 10%.
- Frasi vietate (prompt): «in questo articolo vedremo», «nel mondo di oggi», «sempre più», «approfondiamo», «in conclusione», «è importante sottolineare», «scopriamo insieme», «non è altro che», «negli ultimi anni». Niente `!`, emoji, superlativi, riassunto finale.
- Frasi cuscinetto: la rubrica (`PIPELINE_CUSHION_PATTERNS`) rifiuta «non sono un esperto», «potrei sbagliarmi», «in generale si può dire». I limiti si dichiarano in altro modo («questo articolo non copre…», «dipende da…»).
- Codice: ogni blocco ```` ```sql ```` gira in chDB senza errori; prima lo schema sbagliato (`*_v1`), poi quello giusto (`*_v2`), tipi espliciti, nomi plausibili, mai foo/bar. Config non SQL (JSON, XML) in blocchi di altro linguaggio e verificata sulla documentazione. chDB non ha `system.query_log` (verificato): nei blocchi `sql` le righe lette si misurano con `EXPLAIN indexes = 1` e con `rows_read` dell'output JSON; `system.query_log` si cita solo nella prosa, come metrica da guardare in produzione. `SYSTEM STOP MERGES` e `system.parts` funzionano (verificato).
- Fatti: ogni impostazione, default, funzione o versione citata si verifica sulla documentazione ufficiale (Context7 `/clickhouse/clickhouse-docs`, dopo `resolve-library-id`) e si annota nella scheda con il link. Un numero è (a) output del runner, (b) citato con link a fonte primaria, o (c) dichiarato esempio. Mai altro.
- Gotcha MDX: nella prosa `<`, `{` e `$` vanno dentro backtick o scritti a parole (`$` attiva KaTeX, `<` apre un tag). Nessun componente della lezione «3 secondi» (`<Percorso />` lancia errore fuori da una lezione 3s) e nessun `QuizExercise`.
- `public/llms-full.txt` si rigenera a ogni build: va committato con l'ultima build (Task 9).

## Regole del formato articolo (implementate nel Task 2)

| # | Regola | Livello |
|---|---|---|
| R1 | Esattamente 6 H2 fuori dai blocchi di codice | errore |
| R2 | 1.300–1.900 parole di prosa | errore |
| R3 | Sezione 2: almeno una riga interamente in grassetto (`**…**`) | errore |
| R4 | Sezione 3: esattamente 3 `###` e almeno un blocco `sql`; sezione 4: almeno un blocco `sql` | errore |
| R5 | Sezione 6: esattamente 5 domande numerate che finiscono con `?` | errore |
| R6 | Nessuna frase vietata (case-insensitive, solo prosa) | errore |
| R7 | Nessun `!` e nessuna emoji nella prosa | errore |
| R8 | Niente «tu»: `tu ti te tuo tua tuoi tue puoi devi hai vuoi sai` (non `sei`: è anche il numero) | errore |
| R9 | Sezione 1: un link Markdown a una fonte **oppure** la dichiarazione `caso ricostruito`, `esempio costruito`, `numeri di esempio` o `scenario costruito` | errore |
| R10 | Nessun tag 3s (`Percorso Obiettivi Slide Schema Passo Pattern Messaggio Domanda …`), nessun `QuizExercise` | errore |
| R11 | Elenchi puntati fuori dalla sezione 6 | avviso |

## Review Focus

- **Blocco SQL che «sembra giusto» ma non gira** (tabella creata con un altro nome, impostazione inesistente) → Task 3: il runner esce con codice 1 e indica blocco e riga; fixture `broken.mdx`.
- **Numero inventato presentato come misura** → Task 2: R9 (articolo senza link né dichiarazione fallisce); ogni task di lezione: i numeri vengono dal runner.
- **Pagine EN che ricadono sull'italiano** (`translate:static` salta le stringhe mancanti con un semplice avviso) → Task 9: `verify-en.sh` deve dare 0 stringhe scoperte.
- **Resti del formato 3s nella lezione convertita** (`Percorso` fa fallire la build) → Task 2: R10 con test su `<Slide` e `<Percorso`.
- **Frase vietata nascosta da maiuscola o punteggiatura** («In conclusione,») o scambiata per codice → Task 2: test case-insensitive e test che la stessa frase in un blocco di codice non conta.

## Procedura per ogni lezione (P1–P9, usata dai Task 4–8)

- **P1** Leggere la lezione attuale; segnare cosa tenere (fatti corretti, codice valido) e cosa buttare.
- **P2** Frontmatter: `formato: "articolo"`, togliere `sezioni`, `dateModified: <data odierna>`, `duration` = parole/200 arrotondate + 1 minuto per blocco `sql`, `learningObjectives` riscritti solo se l'articolo non li copre (2–4, verbo all'infinito).
- **P3** Verificare sulla documentazione ogni fatto del blueprint marcato *(verificare)*; annotare in `docs/lezioni/clickhouse-articoli.md` fatto + link.
- **P4** Scrivere i blocchi `sql`, poi `$S/chvenv/bin/python docs/lezioni/strumenti/run-clickhouse-sql.py <file.mdx> --show`; i numeri del testo si copiano dall'output.
- **P5** Scrivere le 6 sezioni sul blueprint. Il caso difficile ha UN criterio «X se…, Y se…»; la sezione 6 chiude con la metrica e con ciò che pesa ordini di grandezza più del resto. Dichiarare i limiti (cosa l'articolo non copre).
- **P6** `npm run validate:articolo` e `npm run validate:content`: 0 errori sul file.
- **P7** Ultimo passaggio: togliere avverbi, «molto», «davvero», subordinate che ripetono; rieseguire P4 e P6 (le parole restano ≥ 1.300).
- **P8** Compilare la riga della lezione nella scheda: argomento, fonte di ogni numero, fatti verificati (con link), fatti non verificati.
- **P9** Commit: `git add <mdx> docs/lezioni/clickhouse-articoli.md && git commit -m "feat(corso): <slug> riscritta come articolo tecnico"`.

---

### Task 1: Il valore `articolo` nello schema e nella rubrica

**Files:**
- Modify: `src/lib/schemas.ts:37`, `tests/schemas.test.ts:158-172`
- Modify: `scripts/validation.ts` (`checkLessonPipeline`, controllo `hasSummarySection`), `scripts/validation.test.ts` (dopo il blocco «formato 3s», riga 57)

**Interfaces:**
- Produces: `corsoSchema` accetta `formato: '3s' | 'articolo'`; `checkLessonPipeline(body: string, frontmatterBinario: unknown, formato?: unknown): PipelineRuleResult[]` (firma invariata).

- [ ] **Step 1: Test che falliscono.** In `tests/schemas.test.ts`: `accetta formato "articolo" senza sezioni` (`success === true`, `data.formato === 'articolo'`); il test `rifiuta formato diverso da "3s"` diventa `rifiuta formato "slide"` (invariato nell'asserzione). In `scripts/validation.test.ts`, `describe("checkLessonPipeline — lezioni formato articolo")` con: `regola 1 passa con una riga in grassetto e un elenco numerato`, `regola 1 fallisce senza la riga in grassetto`, `regola 2 accetta cinque domande numerate in chiusura`, `senza formato articolo la regola 1 resta quella di sempre` (stesso corpo, `formato` omesso → FAIL).
- [ ] **Step 2:** `npx vitest run tests/schemas.test.ts scripts/validation.test.ts` → i nuovi test falliscono.
- [ ] **Step 3: Implementare.** Schema: `formato: z.enum(['3s', 'articolo']).optional()`. In `checkLessonPipeline` aggiungere `const articolo = formato === "articolo"`; regola 1 per l'articolo = `/^\*\*[^*\n]+\*\*\s*$/m.test(body) && /^\s*1[.)]\s/m.test(body)` (riga interamente in grassetto, senza altri `*` dentro); regola 2 invariata. In `validateCollection`, l'avviso «missing a final summary section» non si emette se `data.formato === "articolo"` (il formato vieta il riassunto finale).
- [ ] **Step 4:** stessi test → PASS. Poi `npm run validate:content 2>&1 | tail -3` → nessun errore nuovo (le lezioni esistenti non cambiano).
- [ ] **Step 5: Commit** `feat(corso): formato articolo nello schema e nella rubrica`.

### Task 2: Validatore `validate:articolo`

**Files:**
- Create: `scripts/lezioni-articolo-rules.ts`, `scripts/lezioni-articolo-rules.test.ts`, `scripts/validate-lezioni-articolo.ts`
- Modify: `package.json` (script `"validate:articolo": "tsx scripts/validate-lezioni-articolo.ts"`; `check` = `npm run validate:content && npm run validate:3s && npm run validate:articolo && astro check && npm run test`), `CLAUDE.md` (comando `validate:articolo` e riga sul formato nella sezione Course Structure)

**Interfaces:**
- Consumes: `Esito` (`{ errors: string[]; warnings: string[] }`) da `scripts/lezioni-3s-rules.ts`.
- Produces: `PAROLE_MIN = 1300`, `PAROLE_MAX = 1900`, `FRASI_VIETATE: readonly string[]`, `checkLezioneArticolo(raw: string, rel: string): Esito`. I messaggi hanno la forma `${rel}: R<n>: <testo>`, come le regole 3s.

- [ ] **Step 1: Test che falliscono** in `scripts/lezioni-articolo-rules.test.ts`, con un costruttore `articolo(o)` che genera una lezione valida (frontmatter `formato: "articolo"`, 6 H2, ~1.600 parole di prosa, riga in grassetto in sezione 2, 3 `###` e blocco `sql` in sezione 3, blocco `sql` in sezione 4, link in sezione 1, 5 domande in sezione 6) e permette di sostituire una sezione. Test (nome → asserzione):
  - `una lezione valida non ha errori né avvisi` → `toEqual({ errors: [], warnings: [] })`
  - `R1: cinque H2 e sette H2 sono errori` → messaggio `/R1/`
  - `R2: 1.000 e 2.100 parole sono errori, 1.600 no; il codice non conta` (1.600 di prosa + 800 di codice → nessun errore R2)
  - `R3: senza riga in grassetto in sezione 2` → `/R3/`
  - `R4: due ### in sezione 3` e `nessun blocco sql in sezione 4` → `/R4/`
  - `R5: quattro domande, o cinque senza ?` → `/R5/`
  - `R6: ciascuna frase vietata, anche «In conclusione,» con la maiuscola, è un errore; la stessa frase dentro un blocco di codice no` (`it.each(FRASI_VIETATE)`)
  - `R7: «!» e un'emoji nella prosa sono errori; «!» in un blocco di codice no`
  - `R8: «puoi» e «il tuo» sono errori; «sei sezioni» no`
  - `R9: sezione 1 senza link né dichiarazione è un errore; con un link o con «caso ricostruito» no`
  - `R10: un <Slide> o un <Percorso /> rimasti sono errori`
  - `R11: un elenco puntato in sezione 4 è un avviso, in sezione 6 no` → `warnings` non vuoto, `errors` vuoto
- [ ] **Step 2:** `npx vitest run scripts/lezioni-articolo-rules.test.ts` → FAIL (modulo mancante).
- [ ] **Step 3: Implementare** `checkLezioneArticolo` secondo la tabella R1–R11. Un solo passaggio: togliere frontmatter, blocchi di codice (fence ``` e ~~~) e codice inline per ottenere la prosa; spezzare in sezioni sugli `## ` fuori dai fence; le parole sono i token separati da spazio della prosa (H1 e H2 inclusi). Il CLI `validate-lezioni-articolo.ts` imita `validate-lezioni-3s.ts` (scansiona `src/content/corso`, solo `formato: "articolo"`, stampa `Lezioni articolo: N` e `E errori, A avvisi`, exit 1 se errori).
- [ ] **Step 4:** i test → PASS; `npm run validate:articolo` → `Lezioni articolo: 0`, `0 errori, 0 avvisi`.
- [ ] **Step 5: Commit** `feat(corso): validate:articolo per il formato articolo tecnico`.

### Task 3: Runner SQL con chDB

**Files:**
- Create: `docs/lezioni/strumenti/run-clickhouse-sql.py`, `docs/lezioni/strumenti/fixtures/ok.mdx`, `docs/lezioni/strumenti/fixtures/broken.mdx`
- Modify: `docs/lezioni/strumenti/README.md` (riga dello strumento e istruzioni d'installazione)

**Interfaces:**
- Produces: `python run-clickhouse-sql.py <lezione.mdx> [--show]`. Apre una sessione chDB in una cartella temporanea, estrae in ordine i blocchi ```` ```sql ````, li esegue un'istruzione per volta (separatore `;` a fine riga, fuori da stringhe e commenti). Stampa `ok  <riga>` o `ERR <riga>: <messaggio>`; con `--show` stampa anche le righe di risultato dei `SELECT`/`EXPLAIN` e, per ogni `SELECT`, `rows_read` e `bytes_read` presi dalle statistiche del risultato JSON. Exit 0 se tutte ok, 1 al primo errore. Ultima riga: `ClickHouse <versione> · chDB <versione>`.

- [ ] **Step 1: Fixture.** `ok.mdx`: un `CREATE TABLE … ENGINE = MergeTree ORDER BY …`, un `INSERT … SELECT … FROM numbers(1000)`, un `SELECT count()`. `broken.mdx`: stesso inizio, poi un `SELECT` da una tabella inesistente.
- [ ] **Step 2: Installare l'ambiente** (fuori dal repo): `S=<scratchpad>; python3 -m venv $S/chvenv && $S/chvenv/bin/pip install chdb`. Verifica: `$S/chvenv/bin/python -c "import chdb; print(chdb.__version__)"` → `4.4.0`.
- [ ] **Step 3: Test che fallisce.** `$S/chvenv/bin/python docs/lezioni/strumenti/run-clickhouse-sql.py docs/lezioni/strumenti/fixtures/ok.mdx` → il file dello script non esiste ancora.
- [ ] **Step 4: Implementare** lo script come da Interfaces.
- [ ] **Step 5: Verificare.** `ok.mdx --show` → exit 0, `count()` = 1000 e una riga `rows_read`; `broken.mdx` → exit 1 e una riga `ERR` con numero di riga e il nome della tabella inesistente.
- [ ] **Step 6: Commit** `docs(lezioni): runner SQL con chDB per gli articoli ClickHouse`.

### Task 4: `real-time-analytics/clickhouse-fondamenti` (da 3s ad articolo)

**Files:** Modify `src/content/corso/real-time-analytics/clickhouse-fondamenti.mdx`; Create `docs/lezioni/clickhouse-articoli.md` (scheda con una riga per lezione, intestazione: lezione · argomento · fonte di ogni numero · fatti verificati con link · fatti non verificati).

**Blueprint — ARGOMENTO:** «la sorting key di una tabella MergeTree: cosa legge davvero una query».
- **Caso:** tabella `eventi_web` (dati sintetici da `numbers()`), `ORDER BY (data_evento)`, dashboard che filtra per `id_cliente`: `EXPLAIN indexes = 1` e `rows_read` mostrano quasi tutti i granuli e le righe letti. Numeri = output del runner, scenario dichiarato ricostruito. Tesi: la causa non è la dimensione del cluster, è l'ordine su disco.
- **Meccanismo (3):** una colonna = un file; parti ordinate per sorting key con indice primario sparso, un segno ogni granulo (8.192 righe di default *(verificare)*); la query scarta granuli, non righe. **Grassetto:** l'indice primario non trova righe, scarta granuli, e li scarta solo se l'ordine fisico segue i filtri.
- **Tre errori:** sorting key che parte dal timestamp mentre si filtra per cliente; `PARTITION BY` per giorno o per cliente «per velocità»; tipi larghi (`String` dove basta `LowCardinality(String)`, `Nullable` ovunque).
- **Soluzione:** criteri: 1) colonne dei filtri della query dominante; 2) le meno selettive per prime *(verificare)*; 3) partizione solo per il ciclo di vita (mese, TTL); 4) tipi stretti. DDL `eventi_web_v2`. Ordine di grandezza dai granuli misurati. **Non reversibile in place:** la sorting key non si cambia (solo si estende con colonne appena aggiunte *(verificare)*); costo = nuova tabella, `INSERT … SELECT`, scambio, spazio doppio durante la copia.
- **Caso difficile:** projection **o** skipping index. *Skipping index se la colonna è già correlata all'ordine fisico; projection se non lo è.* Confusione: trattare l'indice secondario come un B-tree; costo = spazio e insert più lenti senza guadagno in lettura.
- **Metrica:** righe lette / righe restituite (`read_rows` / `result_rows` in `system.query_log`). Pesa di più: la sorting key.

- [ ] **Step 1 (rosso):** applicare solo P1–P2; `npm run validate:articolo` → errori R1, R2, R10 sul file.
- [ ] **Step 2:** P3–P8 sul blueprint (il quiz e i componenti 3s spariscono; la scheda `docs/lezioni/12-real-time-analytics.md` si aggiorna nel Task 9).
- [ ] **Step 3 (verde):** `npm run validate:articolo` → `0 errori`; `npm run validate:content` → nessun errore per il file; runner SQL → exit 0.
- [ ] **Step 4:** P9, commit `feat(corso): clickhouse-fondamenti riscritta come articolo tecnico`.

### Task 5: `real-time-analytics/clickhouse-ottimizzazione`

**Files:** Modify `src/content/corso/real-time-analytics/clickhouse-ottimizzazione.mdx`; Modify `docs/lezioni/clickhouse-articoli.md`.

**Blueprint — ARGOMENTO:** «insert in batch e parti: perché ClickHouse risponde *Too many parts*».
- **Caso:** molti producer che inseriscono una riga alla volta; con `SYSTEM STOP MERGES` e 1.000 insert da una riga il runner conta le parti in `system.parts`. Numero misurato; scenario ricostruito. Tesi: non serve un cluster più grande, serve meno insert.
- **Meccanismo (3):** ogni insert = una parte immutabile; i merge girano in background a velocità limitata; soglie `parts_to_delay_insert` / `parts_to_throw_insert` fanno da backpressure *(verificare nome, default e versione)*. **Grassetto:** ogni insert crea una parte e i merge devono starle dietro; la dimensione del batch decide se ci riescono.
- **Tre errori:** una riga per insert; partizionamento fine (giorno × cliente) che moltiplica le parti; retry alla cieca senza token di deduplicazione, o `OPTIMIZE … FINAL` periodico «per sistemare».
- **Soluzione:** criteri: 1) batch grandi, ordine di 10⁴–10⁵ righe e non più di un insert al secondo per tabella *(verificare «bulk inserts»)*; 2) poche partizioni; 3) insert idempotenti (`insert_deduplication_token` *(verificare)* o chiave naturale con `ReplacingMergeTree`); 4) compressione del trasporto. Codice: stesse N righe in 1.000 insert contro 1. Ordine di grandezza: dalle migliaia di parti a poche unità. Batch reversibile (configurazione del client); partizionamento no (ricopia).
- **Caso difficile:** `async_insert` **o** batching lato client. *async_insert se non controllate i client e non potete raggruppare a monte; batching lato client se avete un punto unico dove raccogliere (consumer, Vector).* Confusione: `wait_for_async_insert = 0` creduto «scritto»: perdita silenziosa; la Buffer table non è alternativa (perde il buffer al crash) *(verificare)*.
- **Metrica:** righe per insert (mediana) e parti attive per partizione, non il throughput. Pesa di più: la dimensione del batch.

- [ ] **Step 1 (rosso):** P1–P2; `npm run validate:articolo` → errori R1, R2.
- [ ] **Step 2:** P3–P8.
- [ ] **Step 3 (verde):** `validate:articolo` e `validate:content` a 0 errori; runner exit 0.
- [ ] **Step 4:** P9, commit `feat(corso): clickhouse-ottimizzazione riscritta come articolo tecnico`.

### Task 6: `data-warehousing/clickhouse`

**Files:** Modify `src/content/corso/data-warehousing/clickhouse.mdx`; Modify `docs/lezioni/clickhouse-articoli.md`.

**Blueprint — ARGOMENTO:** «ClickHouse accanto al warehouse: cosa replicare e come modellarlo».
- **Caso:** dashboard operativa (ordini per ora e per canale) sul warehouse generale, ricaricata ogni pochi secondi da molti utenti. Scenario **dichiarato ricostruito**; nessun prezzo né latenza di prodotti terzi se non con link a fonte primaria; la sola misura è quella del runner sulla stessa aggregazione su dati sintetici. Tesi: il warehouse non è lento, è il pattern (tante query ripetitive su dati recenti) a non essere quello per cui costa poco.
- **Meccanismo (3):** lettura colonnare con indice sparso (rinvio a `clickhouse-fondamenti`); tabella larga denormalizzata contro join a runtime; ClickHouse come copia a finestra (TTL), non come fonte. **Grassetto:** ClickHouse non sostituisce il warehouse, ne serve una copia stretta, denormalizzata e a scadenza, costruita sulle domande della dashboard.
- **Tre errori:** copiare lo schema a stella e fare join a runtime; replicare tutto lo storico senza TTL; usarlo come OLTP con `UPDATE`/`DELETE` puntuali.
- **Soluzione:** criteri: 1) dalla query dominante all'ordine; 2) tabella larga con TTL; 3) caricamento append-only dall'export del warehouse; 4) riconciliazione dei totali. DDL con `TTL` e `INSERT … SELECT`, più la query di riconciliazione. Reversibile finché il warehouse resta la fonte (si ripopola); la sorting key no.
- **Caso difficile:** denormalizzare **o** dictionary per gli attributi che cambiano (categoria prodotto, regione cliente). *Denormalizzate se l'attributo deve restare quello al momento dell'evento; dictionary se deve riflettere il valore corrente.* Confusione: dictionary creduto «storico»: i report passati cambiano da soli.
- **Metrica:** p95 della dashboard e scostamento percentuale dei totali rispetto al warehouse a un istante fisso. Pesa di più: modellare sulla query dominante.

- [ ] **Step 1 (rosso):** P1–P2; `validate:articolo` → errori R1, R2.
- [ ] **Step 2:** P3–P8. **Step 3 (verde):** come Task 5.
- [ ] **Step 4:** P9, commit `feat(corso): data-warehousing/clickhouse riscritta come articolo tecnico`.

### Task 7: `real-time-analytics/materialized-views`

**Files:** Modify `src/content/corso/real-time-analytics/materialized-views.mdx`; Modify `docs/lezioni/clickhouse-articoli.md`.

**Blueprint — ARGOMENTO:** «materialized view incrementali: aggregare all'insert senza sbagliare i numeri».
- **Caso:** MV per minuto che memorizza `avg(importo)` e `uniq(id_utente)` in `SummingMergeTree`; la dashboard somma i minuti e gli utenti unici sono gonfiati. Il runner confronta la somma dei minuti con `uniqMerge` e con la query diretta. Tesi: la MV non conserva una query.
- **Meccanismo (3):** trigger sull'insert (la SELECT vede solo il blocco appena inserito); tabella di destinazione che fonde in background (si rilegge con `GROUP BY`); stati di aggregazione (`-State`/`-Merge`) per le misure non additive. **Grassetto:** una materialized view è un trigger sull'insert, calcola sul blocco appena arrivato e mai sui dati già presenti.
- **Tre errori:** valori finali non additivi in `SummingMergeTree`; lettura della destinazione senza `GROUP BY`/`-Merge`; MV su tabella già piena nell'attesa di un backfill (`POPULATE` perde le righe inserite durante la creazione *(verificare)*).
- **Soluzione:** `AggregatingMergeTree` con `uniqState`/`sumState`; lettura con `-Merge`; backfill con `INSERT … SELECT` per intervalli chiusi. MV rimovibile e ricreabile senza toccare la sorgente; i dati già aggregati male si ricalcolano (costo = scansione della sorgente).
- **Caso difficile:** MV incrementale **o** refreshable MV *(verificare sintassi e stato nella versione)*. *Incrementale se la misura è additiva (o ha uno stato) e il ritardo massimo è noto e piccolo; refreshable se dovete ricalcolare l'intera finestra (join, ritardi lunghi, correzioni).* Confusione: la refreshable creduta «MV più lenta ma uguale»: ricalcola tutto a ogni giro.
- **Metrica:** scostamento tra l'aggregato della MV e la query diretta sulla sorgente per la stessa finestra, e ritardo massimo osservato. Pesa di più: scegliere stati di aggregazione e non valori finali.

- [ ] **Step 1 (rosso):** P1–P2; `validate:articolo` → errori R1, R2. **Step 2:** P3–P8. **Step 3 (verde):** come Task 5.
- [ ] **Step 4:** P9, commit `feat(corso): materialized-views riscritta come articolo tecnico`.

### Task 8: `real-time-analytics/cdc-pattern`

**Files:** Modify `src/content/corso/real-time-analytics/cdc-pattern.mdx`; Modify `docs/lezioni/clickhouse-articoli.md`.

**Blueprint — ARGOMENTO:** «ReplacingMergeTree per il CDC: l'ultimo stato di ogni riga».
- **Caso:** tabella `ordini` replicata da un flusso CDC; ogni update inserisce una nuova riga e il totale in dashboard è gonfiato. Il runner mostra `count()` senza e con `FINAL`. Tesi: `ReplacingMergeTree` non garantisce l'unicità, rimuove i duplicati «prima o poi».
- **Meccanismo (3):** evento CDC = riga completa + versione + flag di cancellazione; `ReplacingMergeTree(ver, is_deleted)` tiene per chiave l'ultima versione, solo al merge *(verificare parametro `is_deleted` e versione minima)*; alla lettura servono `FINAL` o `argMax`. **Grassetto:** in ReplacingMergeTree la deduplica avviene al merge e non alla lettura: i duplicati restano finché non li togliete voi nella query.
- **Tre errori:** sorting key con colonne mutabili (lo stato), così le versioni non collassano; lettura senza `FINAL`/`argMax`; cancellazioni propagate con `ALTER TABLE … DELETE` invece del flag.
- **Soluzione:** `ReplacingMergeTree(_versione, _eliminato) ORDER BY id_ordine`; lettura con `FINAL`; riconciliazione `count()` contro la sorgente a una versione fissa. Lettura reversibile; sorting key no (ricopia).
- **Caso difficile:** `ReplacingMergeTree` **o** `CollapsingMergeTree` *(verificare `VersionedCollapsingMergeTree`)*. *Replacing se leggete lo stato corrente di ogni riga; Collapsing solo se dovete sommare variazioni e potete garantire l'ordine di arrivo.* Confusione: Collapsing scelto perché il CDC emette before/after: fuori ordine i segni non si annullano e le somme restano sbagliate.
- **Metrica:** scarto tra `count()` con `FINAL` e conteggio sulla sorgente a una versione fissa, più il ritardo del CDC. Pesa di più: leggere sempre lo stato deduplicato.

- [ ] **Step 1 (rosso):** P1–P2; `validate:articolo` → errori R1, R2. **Step 2:** P3–P8. **Step 3 (verde):** come Task 5.
- [ ] **Step 4:** P9, commit `feat(corso): cdc-pattern riscritta come articolo tecnico`.

### Task 9: Traduzione EN, build, schede e PR

**Files:**
- Modify: `src/data/i18n/en-static-cache.json`, `public/llms-full.txt`, `docs/lezioni/12-real-time-analytics.md`, `docs/lezioni/PIANO-CONTINUAZIONE.md`, `docs/lezioni/clickhouse-articoli.md`

- [ ] **Step 1:** `npm run check` → exit 0 (include `validate:articolo` con `Lezioni articolo: 5`, 0 errori).
- [ ] **Step 2: Stringhe EN.** Seguire `docs/lezioni/strumenti/README.md` (`rebuild-dump.sh` → traduzione a mano delle sole stringhe nuove → `write-en-pairs.mjs`), adattando i percorsi all'ambiente Linux. I commenti dei blocchi `sql` sono stringhe da tradurre; gli identificatori no.
- [ ] **Step 3:** `bash docs/lezioni/strumenti/verify-en.sh` → `0` stringhe EN scoperte e 778 URL identici (nessuna pagina nuova o persa).
- [ ] **Step 4:** `npm run build` → exit 0, `audit:site` senza errori (include il gemello `.md` di ogni lezione: frontmatter con `url` e `author_url`, corpo ≥ 1.500 caratteri). Aprire in `dist/` la pagina di una lezione e controllare che i blocchi `sql` e la riga in grassetto siano resi.
- [ ] **Step 5:** Aggiornare `12-real-time-analytics.md` (la lezione 2 non è più 3s; il pilota resta documentato come sostituito), `PIANO-CONTINUAZIONE.md` (nota sul formato articolo per le lezioni ClickHouse) e completare la scheda `clickhouse-articoli.md` (stringhe EN, fatti da verificare ancora aperti).
- [ ] **Step 6:** commit `chore: cache EN, llms-full e schede per gli articoli ClickHouse`; `git push -u origin claude/great-hawking-e54n7i`; PR verso `main`, poi `subscribe_pr_activity`. **Non unire** senza OK dell'utente.

## Self-review

- **Copertura del prompt:** struttura a 6 sezioni (R1, R3–R5), lunghezza (R2), voce voi (R8), vietato (R6, R7, R11), numeri inventati (R9 + runner), codice eseguibile (Task 3), ultimo passaggio (P7). Non automatizzabili e lasciati alla rilettura: «tre aggettivi di fila», simmetrie, battuta secca, «massimo tre concetti», qualità del criterio «X se…, Y se…».
- **Coerenza dei nomi:** `formato: "articolo"`, `validate:articolo`, `checkLezioneArticolo`, `run-clickhouse-sql.py`, `clickhouse-articoli.md` sono gli stessi in tutti i task.
- **Proporzione:** il prompt è la specifica; i task portano decisioni (regole, firme, blueprint), non il testo delle lezioni.
- **Rischio noto:** i blueprint contengono fatti ClickHouse scritti a memoria, marcati *(verificare)*; il P3 li chiude uno per uno prima di scrivere.
