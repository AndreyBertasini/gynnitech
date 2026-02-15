---
title: "Data Update Report 2025"
description: "Report of data updates for the 2025/2026 period."
order: 9999
---

# Report Aggiornamento Dati 2025/2026

Questo documento riepiloga gli interventi di fact-checking e aggiornamento dati effettuati sui contenuti del corso per allinearli al periodo 2025-2026.

## 1. File Modificati

I seguenti file contenevano riferimenti temporali o esempi numerici che necessitavano di aggiornamento per mantenere la rilevanza.

### `src/content/corso/real-time-analytics/streaming.mdx`
- **Vecchio valore:** "*Consiglio:* Per nuovi progetti nel 2024+, parti con Redpanda."
- **Nuovo valore:** "*Consiglio:* Per nuovi progetti nel 2025+, parti con Redpanda."
- **Motivazione:** Aggiornamento della raccomandazione tecnologica all'anno corrente.

### `src/content/corso/data-collection/seo-content-analytics.mdx` e `src/content/corso/analisi-marketing/seo-content-analytics.mdx`
- **Vecchio valore:** "Aggiungi dati recenti (2024 vs 2021)."
- **Nuovo valore:** "Aggiungi dati recenti (2025 vs 2022)."
- **Vecchio valore:** Titolo esempio "... (2024)"
- **Nuovo valore:** Titolo esempio "... (2025)"
- **Motivazione:** Aggiornamento degli esempi pratici per riflettere l'anno in corso.

### `src/content/corso/data-collection/prioritizzazione-feature.mdx` e `src/content/corso/analisi-prodotto/prioritizzazione-feature.mdx`
- **Vecchio valore:** "*Esempio:* Supportare Internet Explorer 6 nel 2025."
- **Nuovo valore:** "*Esempio:* Supportare Internet Explorer 6 nel 2026."
- **Motivazione:** Mantenimento dell'efficacia dell'esempio ironico (Time Sink) spostando la data nel futuro immediato.

## 2. File Verificati (Nessuna modifica necessaria)

I seguenti file sono stati analizzati e i dati/benchmark contenuti sono risultati ancora validi o evergreen per il 2025/2026.

- **`src/content/corso/analisi-marketing/performance-marketing.mdx`**:
  - Benchmark CPC LinkedIn (5-12 EUR) e CPM (30-50 EUR) validi per il contesto B2B.
  - Riferimenti a piattaforme (TikTok Ads, Programmatic) corretti.
  - Esempi di Naming Convention già aggiornati al 2025 (es. `2025Q1`).

- **`src/content/corso/infrastructure-ops/costs.mdx`**:
  - Costi BigQuery ($6.25/TB), Storage ($0.02/GB) e Snowflake allineati ai listini cloud attuali.

- **`src/content/corso/data-collection/ga4-avanzato.mdx`**:
  - I riferimenti a Universal Analytics sono comparativi ("GA4 è diverso da UA") e quindi corretti tecnicamente.

- **`src/content/corso/marketing-data-science/experimentation.mdx`**:
  - Citazione corretta della chiusura di Google Optimize ("RIP").
  - Bibliografia (2020) ancora rilevante.

- **`src/content/corso/marketing-data-science/brand.mdx`**:
  - Date storiche (2003, 2010, 2011) relative alla bibliografia e invenzione NPS preservate.

- **`src/content/corso/data-collection/product-market-fit.mdx`**:
  - Riferimenti storici a Notion (2018-2020) corretti.
  - Benchmark DAU/MAU validi.
  - Frase "Un prodotto che aveva forte PMF nel 2020 potrebbe non averlo più nel 2025" già aggiornata.

## 3. Note Metodologiche

- **Date Storiche:** Le date di pubblicazione libri, invenzione framework (es. NPS nel 2003) e case study passati (es. Notion 2018) sono state preservate per accuratezza storica.
- **Frontmatter:** I campi `date` nel frontmatter YAML non sono stati modificati come da istruzioni.
- **Duplicati:** Le modifiche sono state propagate ai file duplicati presenti in diverse cartelle di collezione (es. `data-collection` vs `analisi-marketing`) per garantire coerenza.
