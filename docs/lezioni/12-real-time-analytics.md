# Piano — Modulo 12: Real-time analytics con ClickHouse

> **Fase 0:** contiene solo la lezione pilota. Le altre lezioni del modulo si aggiungono quando il modulo entra in lavorazione.
> **Stato:** seconda versione, con le correzioni dell'autore del 2026-10-15 (sotto); da approvare prima della riscrittura.

### Regole aggiunte dall'autore (valgono per tutte le lezioni)

1. **Niente box «Cosa imparerai» e «Collegamenti»** in cima alla pagina: gli obiettivi stanno nel corpo con `<Obiettivi />`.
2. **I grafici fanno parte della pagina:** figure dentro il testo, larghe quanto il testo, senza riquadri da slide.
3. **Niente da cliccare:** ogni schema che cresce mostra subito tutti i passi, uno sotto l'altro.
4. **Ogni grafico ha accanto il testo:** una spiegazione scritta con voce umana (cosa vediamo e perché), poi pattern e anti-pattern (`<Pattern si="…" no="…" />`; dopo uno schema vale anche `<ErroreTipico>`).
5. **Nelle card dei collegamenti** niente «Percorso collegato» né etichette di relazione: restano i link.

## Lezione 2 · ClickHouse: database colonnare e MergeTree

- **File:** `src/content/corso/real-time-analytics/clickhouse-fondamenti.mdx` (URL e titolo invariati)
- **Lezione prima:** `streaming` — «Fondamenti di stream processing»
- **Lezione dopo:** `clickhouse-ottimizzazione` — «Pattern di ingestion in tempo reale»
- **Chi legge:** ha fatto la lezione sullo streaming e conosce l'SQL di base (`SELECT`, `AVG`, `WHERE`).

### Obiettivi («Alla fine sai…»)

1. **Spiegare** perché un database colonnare legge meno dati di uno a righe.
2. **Scegliere** partizione per mese e `ORDER BY` sulle chiavi di filtro in una tabella `MergeTree`.
3. **Verificare** quante partizioni e quante colonne legge una query.

Riformulano i tre `learningObjectives` attuali; nella pagina li mostra `<Obiettivi />`.

### Apertura

- `<Percorso />` con le 4 sezioni e «Lezione 2 di 9», poi `<Obiettivi />`.
- **Gancio:** «Calcoliamo la media degli importi su cento milioni di ordini. La tabella ha cento colonne. Ne serve una sola. Un database a righe le legge tutte.»
- **Ponte con `streaming`** (slide, 3 cose da ricordare, dalla lezione precedente):
  1. Il batch lavora su dati a riposo, lo stream su dati in movimento.
  2. Lo stream decide prima che i dati siano completi, per finestre.
  3. Usiamo lo streaming solo dove la decisione perde valore se aspetta.

### Sezioni

| # | Sezione | Contenuto |
|---|---|---|
| 1 | Righe e colonne | Row-oriented contro column-oriented; i due carichi: transazionale (OLTP) e analitico (OLAP) |
| 2 | Leggere poco | Perché il colonnare legge solo le colonne della query; compressione delle colonne omogenee |
| 3 | MergeTree | Partizione per mese, `ORDER BY`, insert in batch, parti e merge; il `CREATE TABLE eventi_web` |
| 4 | Scegliere e verificare | Quando ClickHouse sì e quando no; come controlliamo partizioni e colonne lette; segnali di modello sbagliato; il caso Yandex.Metrica |

### Le due spiegazioni con schema

**SPIEGAZIONE 1 — Perché leggiamo solo alcune colonne** (sezione 2, tipo: mini-tabella che cambia)
- **Perché è difficile:** sembra che «più veloce» voglia dire «calcola più in fretta». In realtà vuol dire «legge meno byte».
- **Errore tipico degli studenti:** pensare che spostare i dati in ClickHouse basti, senza guardare quante colonne legge la query.
- **Problema (slide):** «Cento milioni di ordini, cento colonne. La query usa una colonna. Che cosa leggiamo?»
- **Schema, 4 passi tutti visibili** (una riga per passo: testo a sinistra, tabella a destra) sulla tabella `ordini` (`id_ordine`, `id_utente`, `importo`, `data_transazione`):
  1. I dati sono in una tabella.
  2. Ogni colonna è salvata a parte (le colonne si staccano).
  3. `AVG(importo)` legge solo `importo` (colonna in lime).
  4. Una colonna simile si comprime meglio.
- **Spiegazione scritta:** «Uno, due, tre, quattro» in prosa breve: cosa cambia a ogni riga e perché il motore apre solo `importo`.
- **Esempio vero (figura, numeri grandi):** 100 milioni di ordini · 100 colonne · 100 volte più byte nel sistema a righe.
- **Errore tipico (✗/✓):** ✗ leggiamo tutte le colonne / ✓ leggiamo solo le colonne della query.
- **★** «Leggiamo solo le colonne della query.»
- **Domanda:** «Una query usa 3 colonne su 50. Quante ne leggiamo?» (Risposta: 3.)

**SPIEGAZIONE 2 — Come MergeTree salta i dati** (sezione 3, tipo: flusso a passi)
- **Perché è difficile:** partizione, ordinamento e parti sembrano dettagli di installazione. In realtà decidono quali dati la query salta.
- **Errore tipico degli studenti:** filtrare per una chiave che non è nell'`ORDER BY`, e stupirsi che la scansione resti larga.
- **Problema (slide):** «Vogliamo l'ultimo mese di un utente. Come evitiamo di leggere tutto?»
- **Schema, 4 passi tutti visibili:**
  1. `PARTITION BY toYYYYMM(ts)`: una partizione per mese; la query sull'ultimo mese legge solo quella.
  2. `ORDER BY (utente_id, ts)`: le righe dello stesso utente stanno vicine; il filtro su `utente_id` salta il resto.
  3. Insert in batch: migliaia di righe per volta, non una alla volta.
  4. Ogni insert crea una parte; poche parti grandi vogliono dire merge leggero.
- **Spiegazione scritta:** come le tre leve lavorano insieme sulla stessa query («l'ultimo mese di un utente»).
- **Esempio vero:** il blocco `CREATE TABLE eventi_web` della lezione attuale, invariato, subito dopo lo schema.
- **Errore tipico (✗/✓):** ✗ la query filtra per `regione`, ma l'`ORDER BY` è solo sulla data / ✓ l'`ORDER BY` parte dalle chiavi di filtro.
- **★** «L'ordine su disco decide che cosa saltiamo.»
- **Domanda:** «La query filtra per utente. Quale colonna mettiamo per prima nell'`ORDER BY`?» (Risposta: `utente_id`.)

### Tabella del piano

Ogni figura è seguita da una spiegazione scritta (2–4 frasi, voce umana: cosa vediamo, perché conta) e dal suo pattern / anti-pattern.

| Sezione | Figura | Messaggio ★ | Disegno | Pattern ✓ / Anti-pattern ✗ | Domanda |
|---|---|---|---|---|---|
| Apertura | Ponte | Dallo stream ai dati da analizzare | Passi (3) | ✓ streaming quando la decisione non può aspettare / ✗ streaming per ogni report | — |
| 1 Righe e colonne | Righe contro colonne | Righe per transazioni, colonne per analisi | Confronto a specchio (scelta: colonnare, «ClickHouse punta qui») | ✓ colonnare per medie e conteggi su molte righe / ✗ colonnare per aggiornare un ordine alla volta | Un e-commerce salva ogni ordine: quale sistema? (Risposta: row-oriented) |
| 2 Leggere poco | Problema | Una colonna su cento | Numeri grandi | ✓ partiamo dalle colonne che la query usa / ✗ guardiamo solo il numero di righe | — |
| 2 Leggere poco | Schema 1 (4 passi, tutti visibili) | Leggiamo solo le colonne della query | Mini-tabella che cambia | errore tipico ✗/✓ della spiegazione 1 | 3 colonne su 50: quante ne leggiamo? (Risposta: 3) |
| 2 Leggere poco | Esempio vero | Cento volte meno byte | Numeri grandi | ✓ misuriamo i byte letti su tabelle grandi / ✗ confrontiamo i motori su diecimila righe | — |
| 3 MergeTree | Problema | Ultimo mese di un utente | Numeri grandi | ✓ partiamo dalla query dominante / ✗ partiamo dal nome del motore | — |
| 3 MergeTree | Schema 2 (4 passi, tutti visibili) | L'ordine su disco decide che cosa saltiamo | Passi | errore tipico ✗/✓ della spiegazione 2 | Quale colonna per prima nell'`ORDER BY`? (Risposta: `utente_id`) |
| 4 Scegliere e verificare | ClickHouse sì o no | Colonnare per analisi, righe per transazioni | Opzioni con verdetto | ✓ ClickHouse per scansioni analitiche / ✗ ClickHouse per aggiornamenti frequenti di singole righe | La dashboard condivide il database dello storefront: va bene? (Risposta: no, è un segnale di modello sbagliato) |
| 4 Scegliere e verificare | Come verifichiamo | Misuriamo partizioni e colonne lette | Passi (3–4) | ✓ controlliamo con `EXPLAIN` o i log delle query / ✗ ci fidiamo del motore senza misurare | — |
| 4 Scegliere e verificare | Yandex.Metrica | Il motore nasce per leggere poco | Numeri grandi | ✓ modelliamo per le letture dominanti / ✗ scegliamo il motore prima della diagnosi | — |
| Riepilogo | 3 ★, quiz da 5 domande, ponte verso `clickhouse-ottimizzazione` | — | — | — | — |

Quiz (5 domande, dalle «Domande per ripassare» attuali, 3 opzioni ciascuna): quando conviene il colonnare; quale chiave nell'`ORDER BY`; come verifichiamo partizioni e colonne lette (`EXPLAIN` o log delle query); quale errore rende lenta una dashboard (filtro su una chiave fuori dall'`ORDER BY`); insert singole contro insert in batch (ogni insert crea una parte).

### Cosa tolgo o sposto

- **Tolgo** la frase iniziale sul «binario ml-tabellare»: è un'indicazione per chi scrive, non per chi studia. Il campo `binario` nel frontmatter resta.
- **Tolgo** il paragrafo generico «usare ClickHouse come etichetta… numeri senza decisione, senza baseline»: non dice niente di specifico su ClickHouse. Il secondo errore, quello concreto (`ORDER BY` sulla data e filtro per regione; carico transazionale), diventa l'errore tipico della spiegazione 2 e l'opzione «no» della sezione 4.
- **Sposto** «La sequenza di lavoro» (5 passi) nella slide «Come verifichiamo» della sezione 4, condensata a 3–4 passi.
- **Sposto** «Come riconoscere che stai sbagliando modello»: 2 segnali diventano la domanda della sezione 4 e l'opzione «no»; gli altri restano come elenco breve nel testo della sezione 4.
- **Trasformo** le 5 «Domande per ripassare» nel quiz finale.
- **Resta tutto il resto:** i numeri (100 milioni di ordini, 100 colonne, 100 volte più byte), il codice `CREATE TABLE eventi_web`, la query `SELECT * FROM ordini WHERE id_ordine = 12345`, i nomi dei sistemi (`PostgreSQL`, `MySQL`, `SQL Server`), il caso Yandex.Metrica e il rilascio open source del 2016.

### Dubbi sui fatti

- **«Oltre 20 miliardi di righe al giorno su singoli cluster»** (caso Yandex.Metrica): la lezione attribuisce il dato alla documentazione ufficiale, ma «su singoli cluster» è da verificare. Proposta: nella slide scrivere «oltre 20 miliardi di eventi al giorno» senza «singoli cluster», finché non c'è la fonte esatta.
- **«100 volte più byte»:** è un calcolo d'esempio (100 colonne, 1 letta), non una misura. Nella slide lo presentiamo come esempio, non come benchmark.
