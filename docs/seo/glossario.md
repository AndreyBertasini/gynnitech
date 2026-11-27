# Glossario

Ogni termine ha una pagina `/glossario/<slug>/` generata da dati; l'hub `/glossario/` elenca tutti i termini con un `DefinedTermSet`.

## Aggiungere un termine

1. In `src/data/glossary/terms.json` aggiungi `slug`, `name`, `short` (nome breve per il title), `definition` (una o due frasi, senza i caratteri `<` e `>`) e `context` (moduli del corso separati da `/`, per esempio `Analisi Prodotto / Marketing Data Science`).
2. In un file di `src/data/glossary/bodies/` scrivi il testo con questi campi: `why`, `how`, `example`, `pitfalls`, `related` (almeno due slug esistenti) e, se hanno senso, `formula` e `sql` (dialetto ClickHouse).
3. Se il calcolo automatico propone lezioni fuori tema, indica a mano le lezioni giuste in `src/data/glossary/lesson-links.ts`.
4. Lancia `npx vitest run tests/glossary.test.ts` e `npm run build`.

## Regole fatte rispettare dai test e dal build

- Almeno 300 parole di testo proprio per pagina (`tests/glossary.test.ts`, e sul HTML in `scripts/check-content-seo.ts`).
- Nessun paragrafo condiviso tra due termini: niente testo da modello riempitivo.
- Title ≤ 60 caratteri, description ≤ 155.
- Schema `DefinedTerm` con `inDefinedTermSet` su ogni pagina e `BreadcrumbList` canonico.
- L'hub elenca tutte le pagine termine e solo quelle.
- Ogni pagina rimanda all'hub e ad almeno una lezione o un modulo.

## Controllo di correttezza

Gli esempi con numeri e le query vanno verificati prima della pubblicazione: i test controllano la struttura, non l'esattezza dei calcoli.
