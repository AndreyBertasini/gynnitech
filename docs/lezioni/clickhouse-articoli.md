# Scheda — Lezioni ClickHouse come articolo tecnico

Piano: `docs/superpowers/plans/2026-10-16-articoli-clickhouse.md`. Prompt: `docs/lezioni/prompt-articolo-tecnico.md`. Formato: `formato: "articolo"` (`npm run validate:articolo`, regole R1–R11). Codice eseguito con `docs/lezioni/strumenti/run-clickhouse-sql.py` (chDB 4.4.0 = ClickHouse 26.9.2.1).

| Lezione | Argomento | Parole di prosa | Blocchi `sql` |
|---|---|---|---|
| `real-time-analytics/clickhouse-fondamenti` | La sorting key di una tabella MergeTree | ~1.350 | 3 |
| `real-time-analytics/clickhouse-ottimizzazione` | Insert in batch e parti: perché ClickHouse risponde «Too many parts» | ~1.420 | 4 |

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

**Titolo e URL invariati** («Pattern di ingestion in tempo reale»). Non era 3s. Tolti i blocchi `xml`/`sql` del vecchio testo: contenevano impostazioni che non esistono in ClickHouse (`flush_on_async_insert`, `flush_after_inserts`, `deduplicate_key`, `active_inserts`, `queue_size` come segnali) e una query con `SAMPLE` non valida.

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
