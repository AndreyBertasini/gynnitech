# Strumenti del flusso «3 secondi»

Questi file erano nello scratchpad locale della sessione. Sono salvati qui perché chi continua (anche in cloud) possa riusarli. **Vanno adattati**: tutti hanno in testa le variabili `S` (cartella di lavoro temporanea con `bodies/`, `intro-mN.json`, ecc.) e `W` (radice del repository) con percorsi Windows assoluti; sostituiscili con quelli del nuovo ambiente. Su Linux `mirror.ps1` non serve: si può costruire direttamente nel repository.

| File | A che cosa serve |
|---|---|
| `scripts/lezioni-compose.mjs` (nel repo) | Compone un file `corpo.txt` (prima riga `@sezioni: A \| B \| …`, riga vuota, corpo MDX) dentro una lezione esistente: tiene il frontmatter originale e aggiunge `formato: "3s"`, `sezioni`, `dateModified`. |
| `scripts/lezioni-fm-diff.mjs` (nel repo) | Controlla che il frontmatter non sia cambiato rispetto al branch base (solo `formato`, `sezioni`, `dateModified`). |
| `compose-mod.sh <modulo> <prefisso> <slug…>` | Compone più lezioni, lancia `validate:3s` e il confronto del frontmatter. I corpi stanno in `$S/bodies/<prefisso>-<slug>.txt`. |
| `show.mjs <modulo> <slug…>` | Stampa il testo originale di una lezione senza il boilerplate ripetuto, da leggere prima di riscriverla. |
| `show-range.mjs <intro.json> <da> <a>` | Stampa le stringhe italiane da tradurre con il loro indice. |
| `rebuild-dump.sh` | Rifà la build, estrae le stringhe italiane senza traduzione EN introdotte dal branch (`intro.json`). Serve `dump-missing-en.ts.keep` (da copiare come `scripts/dump-missing-en.ts` nella copia di build) e `missing-head.json` (stringhe già mancanti sul branch base). |
| `write-en-pairs.mjs <intro.json> <en.json> <cache>` | Scrive nella cache `src/data/i18n/en-static-cache.json` le coppie `[indice, "traduzione"]`. |
| `verify-en.sh` | Build completa e controllo: 0 stringhe EN scoperte, URL identici (778 pagine). |
| `card-table.mjs <modulo>` | Genera la tabella delle lezioni per la scheda `docs/lezioni/NN-modulo.md`. |
| `fix-track.mjs` | Allinea i frammenti «On the» / «track …» attorno al grassetto `ml-tabellare`. |
| `run-clickhouse-sql.py <lezione.mdx> [--show]` | Esegue in chDB (ClickHouse embedded) i blocchi ```` ```sql ```` di una lezione, in ordine. Exit 1 al primo errore, con riga e messaggio. Con `--show` stampa risultati e `rows_read`: sono i numeri da copiare nel testo. Verificato: chDB 4.4.0 = ClickHouse 26.9.2.1. Non c'è `system.query_log`. Installazione: `python3 -m venv <dir>/chvenv && <dir>/chvenv/bin/pip install chdb`. Prova: `fixtures/ok.mdx` (exit 0) e `fixtures/broken.mdx` (exit 1). |
| `mirror.ps1` | (Windows) copia il repo in una cartella di build per aggirare il bug del tsconfig nei worktree annidati. |
