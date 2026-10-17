# Scheda — Lezioni ClickHouse come articolo tecnico

Piano: `docs/superpowers/plans/2026-10-16-articoli-clickhouse.md`. Prompt: `docs/lezioni/prompt-articolo-tecnico.md`. Formato: `formato: "articolo"` (`npm run validate:articolo`, regole R1–R11). Codice eseguito con `docs/lezioni/strumenti/run-clickhouse-sql.py` (chDB 4.4.0 = ClickHouse 26.9.2.1).

| Lezione | Argomento | Parole di prosa | Blocchi `sql` |
|---|---|---|---|
| `real-time-analytics/clickhouse-fondamenti` | La sorting key di una tabella MergeTree | 1.368 | 3 |
| `real-time-analytics/clickhouse-ottimizzazione` | Insert in batch e parti: perché ClickHouse risponde «Too many parts» | 1.416 | 4 |
| `data-warehousing/clickhouse` | ClickHouse accanto al warehouse: cosa replicare e come modellarlo | 1.377 | 3 |
| `real-time-analytics/materialized-views` | Materialized view incrementali: stati di aggregazione, backfill, vista refreshable | 1.366 | 3 |
| `real-time-analytics/cdc-pattern` | ReplacingMergeTree per il CDC: leggere l'ultimo stato di ogni riga | 1.362 | 3 |

Fonte della documentazione: repository `ClickHouse/clickhouse-docs`, letto via Context7 il 2026-10-16. I percorsi sotto sono file di quel repository.

## real-time-analytics/clickhouse-fondamenti

**Cambio di formato:** era `formato: "3s"` (pilota del 2026-10-15), ora è articolo. Il quiz e i componenti 3s sono stati tolti; URL, titolo, ordine, prerequisiti e immagini sono invariati.

**Caso:** ricostruito (dichiarato nel testo). Cinque milioni di eventi sintetici, mille clienti, 116 giorni, generati dal codice della pagina.

**Fonte di ogni numero (tutti dall'output del runner, `--show`):**

| Numero nel testo | Fonte |
|---|---|
| 4.967 righe restituite | `SELECT count()` su `eventi_web_v1` e `_v2` |
| 5.000.000 righe e 45 MB letti (v1) | `rows_read=5000000 bytes_read=45000000` |
| 49.152 righe e 372 KB letti (v2) | `rows_read=49152 bytes_read=372216` |
| 6 granuli su 612, 4 parti | `EXPLAIN indexes = 1` su v2 |
| 116 e 4 partizioni; 95,21 e 48,29 MiB | `system.parts` dopo `OPTIMIZE … FINAL` |
| 612/612 granuli con l'indice di salto; 5.000.000 righe | `EXPLAIN indexes = 1` e `rows_read` dopo `MATERIALIZE INDEX` |
| 139.264 righe, 17 granuli su 612 con la projection | `rows_read` e `EXPLAIN` dopo `MATERIALIZE PROJECTION` |
| 54,83 MiB di projection contro 48,29 della tabella | `system.projection_parts` |
| «cento volte», «due ordini di grandezza» | 5.000.000 / 49.152 ≈ 102 |

**Fatti verificati sulla documentazione:**
- Granulo di 8.192 righe di default e una voce di indice per granulo (la prima riga): `docs/concepts/glossary.md`, `docs/managing-data/core-concepts/primary-indexes.mdx`.
- Ricerca binaria sulle voci dell'indice sparso: `docs/guides/best-practices/sparse-primary-indexes.md`.
- Chiave ordinata per cardinalità crescente, con la riserva che un filtro in coda è meno efficace: `docs/guides/best-practices/sparse-primary-indexes.md`, `docs/use-cases/observability/build-your-own/schema-design.md`.
- Partizione come strumento di gestione dei dati, non di ottimizzazione; cardinalità ottimale sotto 100–1.000 valori: `docs/best-practices/partitioning_keys.mdx`, `docs/managing-data/core-concepts/partitions.mdx`.
- `LowCardinality` sotto 10.000 valori distinti; `Nullable` crea una colonna `UInt8` in più: `docs/guides/best-practices/query-optimization.md`, `docs/data-modeling/schema-design.md`.
- La chiave primaria non si modifica sul posto, serve migrare la tabella: `docs/use-cases/observability/clickstack/managed-onboarding/tuning-clickstack-schema.md`.
- `EXCHANGE TABLES` è atomico: `knowledgebase/exchangeStatementToSwitchTables.mdx`.
- Indice di salto inefficace con poca correlazione con la chiave; projection come copia nascosta con altro ordine, scelta in automatico: `docs/guides/best-practices/skipping-indexes.md`, `docs/use-cases/observability/clickstack/managing/performance_tuning.md`.

**Non verificati (da controllare quando c'è accesso alla rete):**
- I due link a `clickhouse.com/docs` (`/primary-indexes`, `/best-practices/choosing-a-primary-key`) derivano dai link interni della documentazione; la sandbox non raggiunge il dominio, quindi non li ho aperti.
- `read_rows` e `result_rows` in `system.query_log`: esistono in ClickHouse, ma chDB non ha `system.query_log` e non li ho potuti eseguire.
- «Quasi certamente ogni granulo contiene righe di tutte le campagne»: confermato solo dal risultato 612/612, non da una query dedicata.
- Il peso di ciascuna delle tre scelte sbagliate (ordine, partizione, tipi) da sola: l'esperimento le cambia insieme, e il testo lo dichiara.

## real-time-analytics/clickhouse-ottimizzazione

**Titolo e URL invariati** («Pattern di ingestion in tempo reale»). Non era 3s. Tolti i blocchi `xml`/`sql` del vecchio testo: citavano impostazioni assenti da `system.settings` e `system.merge_tree_settings` di ClickHouse 26.9 (verificato con una query: `flush_on_async_insert`, `flush_after_inserts`, `deduplicate_key`, `active_inserts`, `queue_size`) e contenevano una query con `SAMPLE` che il server rifiuta come errore di sintassi.

**Caso:** ricostruito (dichiarato). 200 producer × 1 riga/s.

| Numero nel testo | Fonte |
|---|---|
| 200 insert/s → 12.000 parti/min; 15 s | aritmetica del caso dichiarato (200 × 60; 3.000 / 200) |
| soglie 1.000 e 3.000 per partizione | `system.merge_tree_settings` (ClickHouse 26.9.2.1) |
| 1.000 insert da una riga → 1.000 parti, 1.000 righe | `system.parts`, merge fermi |
| +58 parti, 101.000 righe; poi 201.000 dopo il retry | `system.parts` / `count()` |
| lotto su 116 giorni rifiutato | errore atteso `TOO_MANY_PARTS` (`max_partitions_per_insert_block`, 100) |
| errore al 51° insert con soglia 50 | direttiva `ripeti: 60` + `errore atteso`, ripetizione 51 |
| 2 parti, 100.000 righe, 50.000 per parte; retry con token scartato | `system.parts` e `count()` su `misure_v2` |
| async insert: 100.001 righe | `count()` dopo l'insert asincrono |
| «una parte ogni riga contro una parte ogni 50.000» | 1.000/1.000 contro 2/100.000 |
| 20.000 righe/s → lotti da 20.000 o 200.000 | esempio di conto dichiarato nel testo |

**Fatti verificati sulla documentazione** (repository `ClickHouse/clickhouse-docs`):
- Lotti da almeno 1.000 righe, idealmente 10.000–100.000; circa un insert al secondo: `docs/best-practices/_snippets/_bulk_inserts.md`, `knowledgebase/exception-too-many-parts.mdx`.
- Errore 252 «Too many parts … Merges are processing significantly slower than inserts»; ogni insert crea una parte; più partizioni moltiplicano il problema: `knowledgebase/exception-too-many-parts.mdx`, `docs/best-practices/partitioning_keys.mdx`.
- Deduplicazione per token: `non_replicated_deduplication_window` per le tabelle non replicate, attiva di default nelle `Replicated*`; stesso token = stesso lotto anche con dati diversi: `docs/guides/developer/deduplicating-inserts-on-retries.md`.
- `wait_for_async_insert = 1` raccomandato, `= 0` rischioso e senza dead-letter queue; le Buffer table perdono il buffer al crash; async insert come sostituto moderno: `docs/best-practices/_snippets/_async_inserts.md`.
- `OPTIMIZE FINAL` da evitare nella maggior parte dei casi: `docs/best-practices/_snippets/_avoid_optimize_final.md`.

**Verificato solo con una prova a parte** (non nei blocchi della pagina): stesso token con dati diversi in una sola partizione → il secondo lotto viene scartato (5 righe invece di 8). Nel lotto multi-partizione della pagina i `block_id` differiscono e il comportamento non è lo stesso: per questo il testo cita la documentazione e non mostra la prova.

**Non verificati:**
- Il link a `clickhouse.com/docs/best-practices/selecting-an-insert-strategy` deriva dai link interni della documentazione; la sandbox non raggiunge il dominio.
- Che i valori predefiniti di `async_insert`/`wait_for_async_insert` valgano anche nel server dell'utente: in chDB 26.9 `system.settings` riporta `async_insert = 1`; per questo gli insert «sbagliati» dichiarano `async_insert = 0`, e il testo non afferma nulla sul default di `async_insert`.
- «Si può inserire a centomila righe al secondo, purché sia un solo insert»: riformulazione della knowledgebase («you can insert 100K rows per second but only with one big bulk INSERT statement»).

## data-warehousing/clickhouse

**Titolo, URL e prerequisiti invariati.** Non era 3s. Tolti: la tabella ClickHouse/Snowflake con latenze «sub-second» e compressione «da cinque a dieci volte rispetto a Parquet», la frase «il pattern è usato da Cloudflare, Uber e Spotify», il rimando a «clickhouse.com (2024)» e gli esempi SQL/Python generici (vista settimanale, z-score): nessuna di queste affermazioni era verificata o legata a ClickHouse.

**Caso:** ricostruito (dichiarato). 40 schermi × 2 ricariche/min × 60 × 24 = 115.200 aggregazioni al giorno. Nessuna misura su warehouse commerciali: il testo lo dichiara.

| Numero nel testo | Fonte |
|---|---|
| 115.200 ricariche al giorno | aritmetica del caso dichiarato |
| 8 milioni di righe, 10.000 prodotti, 8 canali, 80 giorni, 192 celle | generatore del blocco `sql`; le 192 celle contate con una query a parte (24 ore × 8 canali) |
| 8.010.000 righe e 33 MB letti sulla copia fedele | `rows_read=8010000 bytes_read=33367444` |
| 100.864 righe e 1,3 MB sulla tabella larga | `rows_read=100864 bytes_read=1311232` |
| due ordini di grandezza | 8.010.000 / 100.864 ≈ 79 |
| scostamento 0 | query di riconciliazione |
| una sola parte da 8 milioni di righe | `system.parts` su `ordini_v1` dopo `OPTIMIZE FINAL` |
| `merge_with_ttl_timeout` = 14.400 s | `system.merge_tree_settings` |
| fatturato `cat-7` 16.005.218,54 prima e dopo; dictionary 0 dopo | query `prima`/`dopo` |
| ritenzione effettiva fino a ~120 giorni | aritmetica: partizione mensile + TTL 90 giorni con `ttl_only_drop_parts = 1` |

I dati sono relativi a `toStartOfDay(now())`: i conteggi sono ripetibili nello stesso giorno e cambiano di poco solo se il giorno cambia a metà esecuzione. Il `TTL` di 90 giorni non cancella nulla (i dati hanno 80 giorni).

**Fatti verificati sulla documentazione:**
- Join più costosi di una tabella denormalizzata; denormalizzazione fortemente raccomandata per query a bassa latenza; criteri (tabelle che cambiano di rado, relazioni non molti-a-molti): `docs/best-practices/minimize_optimize_joins.md`.
- Un join standard costruisce una tabella hash dal lato destro; le versioni recenti anticipano i filtri senza eliminare sempre il costo; `dictGet` in un `WHERE` su gran parte delle righe non usa indici: `docs/dictionary/best-practices.md`.
- `CREATE DICTIONARY … LIFETIME … LAYOUT(HASHED_ARRAY())` (layout consigliato di default), `SYSTEM RELOAD DICTIONARY`: `docs/dictionary/index.md`, `docs/dictionary/best-practices.md`.
- Mutation: riscrive le parti che contengono le righe corrispondenti, I/O pesante, alternative `ReplacingMergeTree`/delete leggeri/partizioni: `docs/managing-data/updating-data/overview.mdx`, `docs/best-practices/_snippets/_avoid_mutations.md`.
- TTL applicato durante i merge, ritardo minimo 4 ore, `ttl_only_drop_parts = 1` consigliato con partizione per la stessa unità: `knowledgebase/when_is_ttl_applied.mdx`, `docs/use-cases/observability/clickstack/ttl.md`.
- Partizioni eliminabili in modo efficiente (`DROP PARTITION`): `docs/best-practices/_snippets/_avoid_mutations.md`.

**Verificato con una prova a parte:** confronto degli inode dei file prima e dopo una mutation: solo la parte che contiene la riga viene riscritta, le altre ricevono un nuovo nome ma sono collegate con hardlink. Il testo dice «riscrive la parte intera, qui da 8 milioni di righe» perché `ordini_v1` ha una sola parte.

**Non verificati:**
- Il link `clickhouse.com/docs/best-practices/minimize-optimize-joins` deriva dal nome del file `minimize_optimize_joins.md`; non l'ho aperto (dominio non raggiungibile). Lo slug potrebbe usare trattini o underscore.
- «Quando conviene aggiungere ClickHouse accanto al warehouse»: è un giudizio dell'autore dell'articolo, non una misura.
- Il suggerimento «passare a un motore di tabella pensato per questo» rimanda a `ReplacingMergeTree` (lezione sul CDC), non è dimostrato nella pagina.

## real-time-analytics/materialized-views

**Titolo, URL e prerequisiti invariati.** Corretto un difetto preesistente nel frontmatter: una riga orfana («  Materialized Views - immagine ufficiale…») veniva letta da YAML come continuazione di `category`; ora `category` è «Tecnico» (usata solo come etichetta in `src/lib/course-graph.ts`).

**Tolto dal vecchio testo:** l'esempio a catena era rotto (la seconda vista leggeva `user_id` da `mv_events_per_minute`, che non lo contiene); «risultato in <100ms su qualsiasi volume» (nessuna fonte); il paragrafo sul Dataflow Model (Akidau et al., VLDB 2015) e la tesi che i late-arriving events richiedano retraction esterne; il paragrafo generico sugli «errori più comuni» (medie globali, correlazione e causalità), che non parlava di viste.

**Caso:** ricostruito (dichiarato). 5.000 utenti, 300.000 eventi all'ora, 5 ore generate dalla vista parametrica `carica_ora`; i dati sono relativi a `toStartOfDay(now()) - 1 giorno`, quindi i numeri sono ripetibili.

| Numero nel testo | Fonte |
|---|---|
| 189.705 (e 189.771) utenti/ora con `sum(uniq)` | query «La dashboard somma i minuti» |
| 5.000 utenti/ora reali | `uniqExact` sulla tabella grezza |
| 900.000 eventi grezzi contro 600.000 nella vista | query di confronto |
| 120 righe per 60 minuti dopo 1.000 eventi in ritardo | `count()` / `uniqExact(minuto)` sull'ora 1 |
| 1.201.000 eventi grezzi = 1.201.000 nella vista | dopo il backfill |
| ora 1: 5.150 utenti, 301.500 eventi dopo 500 eventi in ritardo con 50 utenti nuovi | `uniqExactMerge` / `sum` |
| 150.057 / 149.943 prima, 209.916 / 90.084 dopo (refreshable); 149.943 / 150.057 (incrementale) | query «L'ora 4 …» |
| 1.506.500 righe rilette da un giro di refresh | `system.view_refreshes` (`read_rows` = `total_rows`) |
| «quasi quaranta volte» | 189.705 / 5.000 ≈ 38 |

**Fatti verificati sulla documentazione:**
- Una vista incrementale esegue la `SELECT` solo sui blocchi inseriti; i dati inoltrati sono il blocco, non il risultato della tabella: `docs/guides/developer/cascading-materialized-views.md`, `docs/use-cases/observability/clickstack/migration/elastic/concepts.md`.
- `AggregatingMergeTree` con stati (`uniqExactState`) e `-Merge`; `SimpleAggregateFunction(sum, …)`: `docs/use-cases/time-series/06_materialized-view-rollup.mdx`, `docs/guides/examples/aggregate_function_combinators/sumSimpleState.md`.
- Backfill con `INSERT … SELECT` di stati per i dati più vecchi del minimo presente; `POPULATE` sconsigliato perché può perdere righe: `docs/use-cases/observability/clickstack/managing/materialized_views.md`.
- Il join in una vista incrementale scatta solo sugli insert della tabella più a sinistra: è uno snapshot della dimensione; la refreshable rilancia la query sull'intero dataset e supporta i join; per un'aggregazione su una tabella la incrementale scala meglio: `docs/materialized-view/incremental-materialized-view.md`, `docs/materialized-view/refreshable-materialized-view.md`.
- `GROUP BY` allineato a `ORDER BY` della destinazione: `docs/materialized-view/incremental-materialized-view.md`.
- Le viste refreshable sono production ready dal 2024: `docs/whats-new/changelog/2024.md` (il testo non lo afferma).

**Verificato con una prova a parte:** le viste refreshable richiedono un database `Atomic`; chDB usa di default un motore `Overlay`, per questo il primo blocco crea `lab ENGINE = Atomic` e fa `USE lab`.

**Non verificati:**
- Il link `clickhouse.com/docs/materialized-view/incremental-materialized-view` deriva dal percorso del file nel repository della documentazione; non l'ho aperto.
- «Lo stato di `uniqExact` cresce con i valori distinti» e il rimando a `uniq`/`uniqCombined`: conoscenza generale, non cercata nella documentazione.
- «Se la tabella grezza ha un TTL più corto della vista, quello che è scaduto non si recupera»: conseguenza logica, non misurata.
- «A un insert al secondo e un refresh al minuto la differenza è il costo che porta a spegnere la vista»: giudizio, non misura.

## real-time-analytics/cdc-pattern

**Titolo, URL e prerequisiti invariati.** Tolti dal vecchio testo: il caso Zalando («From Nightly ETL to Real-Time CDC», 2021) e la riga «Riferimenti: Debezium Documentation (2024)…» perché non verificati (nessun link, nessuna lettura della fonte); il paragrafo «errori comuni» generico; lo schema Kafka Connect Sink → ClickHouse e `ReplacingMergeTree(_version)` senza flag di cancellazione. Gli obiettivi di apprendimento sono stati riscritti: la configurazione di Debezium (obiettivo 1) non è più nella lezione, che lo dichiara; «quando il CDC batte il batch ETL» resta come giudizio in due frasi.

**Caso:** ricostruito (dichiarato). 100.000 ordini, 185.000 eventi, 10% cancellati; versione = `id_ordine * 10 + passo`.

| Numero nel testo | Fonte |
|---|---|
| 90.000 ordini, 9.025.122,29 | `ordini_sorgente` |
| 175.000 righe e 17.547.413,29 con `FINAL` e chiave `(id_ordine, stato)` | `ordini_v1` |
| 150.000 righe e 15.052.863,68 dopo `ALTER … DELETE` | `ordini_v1` dopo la mutation |
| «sbagliato del 67 per cento» | 15.052.863,68 / 9.025.122,29 ≈ 1,668 |
| 130.000 righe e 13.033.869,23 senza `FINAL` | `ordini_v2` con merge fermi |
| 185.000 eventi → 130.000 righe già all'insert | `optimize_on_insert = 1` (verificato in `system.settings`); 185.000 = 100.000 + 50.000 + 25.000 + 10.000 |
| 90.000 e 9.025.122,29 con `FINAL`; differenze 0 e 0 | riconciliazione con la sorgente |
| `FINAL` con filtro sulla chiave: 16.384 righe lette | `rows_read` |
| Collapsing con `FINAL` → «nuovo»; Versioned → «pagato»; somma con segno → «pagato» | blocco finale |

Il `rows_read` di `FINAL` senza filtro (179.152 su 130.000 righe) non è citato: è più alto della tabella e non l'ho spiegato.

**Prova a parte, non nella pagina:** `SYSTEM STOP MERGES` blocca anche le mutation: un `ALTER … DELETE … mutations_sync = 1` su una tabella con i merge fermi non termina mai. Per questo `ordini_v1` non ferma i merge (le chiavi sbagliate non collassano comunque).

**Fatti verificati sulla documentazione:**
- Deduplica solo ai merge, «eventual correctness», `FINAL` per leggere dati deduplicati; sovraccarico di `FINAL` tra il 21% e il 550%; filtro sulle colonne della chiave lo riduce; `ReplacingMergeTree` non può aggiornare i valori della chiave; colonna `Deleted` per le cancellazioni logiche: `docs/guides/developer/replacing-merge-tree.md`, `docs/managing-data/updating-data/overview.mdx`.
- Mutation: riscrive le parti con le righe toccate, I/O pesante, da usare con parsimonia; alternative `ReplacingMergeTree`/`CollapsingMergeTree`: `docs/best-practices/_snippets/_avoid_mutations.md`, `docs/managing-data/deleting-data/delete_mutations.mdx`.
- Collapsing più complesso di Replacing; `VersionedCollapsingMergeTree` per inserimenti da più thread e fuori ordine; query con `sum(x * Sign)` e `HAVING sum(Sign) > 0`: `docs/guides/developer/deduplication.md`, `docs/managing-data/updating-data/overview.mdx`.
- `do_not_merge_across_partitions_select_final` derivato automaticamente se la partizione usa solo colonne della chiave: `docs/whats-new/changelog/2023.md`.

**Non verificati:**
- Che Debezium emetta `op` = `c`/`u`/`d` con immagini prima e dopo e che la versione derivi dall'LSN (PostgreSQL): conoscenza generale, non cercata nella documentazione di Debezium (non raggiungibile).
- «Non serve quando i dati nascono già come eventi (clickstream, log)» e «un ETL batch è più semplice se una latenza di ore è accettabile»: giudizi mantenuti dal vecchio testo, non misurati.
- «Conservate gli eventi nel topic Kafka con una retention adeguata»: consiglio, non dimostrato nella pagina.

## Traduzione EN e verifiche finali (2026-10-17)

- **Stringhe EN scritte:** 367 (prosa, frammenti attorno al codice inline, durate e 13 blocchi di codice). I blocchi di codice sono tradotti per intero: cambiano solo i commenti, gli identificatori e i letterali restano uguali. Le direttive `-- ripeti:` e `-- errore atteso:` non si traducono.
- **Parole di una lettera tra codici:** l'estrattore ignora le stringhe di un solo carattere; quattro punti («o», «e» tra due `code`) sono stati riscritti in italiano come «oppure» / «ed» per poter essere tradotti.
- **Blocchi senza segnale italiano:** tre blocchi (soglie e `async_insert` in `clickhouse-ottimizzazione`, dizionario in `data-warehousing/clickhouse`) non avevano parole della lista `italianCodeBlockSignal`; i loro commenti sono stati riformulati con una parola-segnale («numero», «dati», «prodotto») perché venissero tradotti.
- **Build:** `npm run build` exit 0, `Site quality audit passed: 824 HTML files`, 778 URL identici a `main`; stringhe introdotte e senza EN: 0 (le 15.033 già mancanti su `main` sono estranee e non toccate).
- **Check:** `npm run check` exit 0 (`validate:content` 0 errori, `validate:articolo` 5 lezioni 0 errori, 1.174 test).
