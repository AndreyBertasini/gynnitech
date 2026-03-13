# Course Standards

## Canonical Module Taxonomy

Use the folder under `src/content/corso` as the canonical module id. The `module:` frontmatter must match this table.

| Folder | Canonical `module` value |
|---|---|
| `panoramica` | `Modulo 1: Panoramica del Corso` |
| `data-collection` | `Modulo 2: Data Collection & Tracking` |
| `metriche-fondamenti` | `Modulo 3: Metriche e Fondamenti Analitici` |
| `gestione-data-driven` | `Modulo 4: Gestione Data-Driven` |
| `analisi-prodotto` | `Modulo 5: Analisi di Prodotto` |
| `analisi-marketing` | `Modulo 6: Analisi di Marketing` |
| `dashboard-visualizzazione` | `Modulo 7: Dashboard & Data Visualization` |
| `marketing-data-science` | `Modulo 8: Marketing Data Science` |
| `data-warehousing` | `Modulo 9: Data Warehousing & Architecture` |
| `s3-data-lake` | `Modulo 10: S3 & Data Lake Architecture` |
| `kafka-streaming` | `Modulo 11: Kafka & Event Streaming` |
| `real-time-analytics` | `Modulo 12: Real-Time Analytics & ClickHouse` |
| `infrastructure-ops` | `Modulo 13: Infrastructure & Ops` |
| `advanced-sql` | `Modulo 14: Advanced SQL` |
| `matematica-analisi-dati` | `Modulo 15: Matematica per l'Analisi Dati` |
| `analytics-engineering` | `Modulo 16: Analytics Engineering` |
| `significativita-statistica` | `Modulo 17: Significativita' Statistica & A/B Testing` |
| `direzioni-analitica` | `Modulo 18: Direzioni in Analitica` |
| `filosofia-analisi-dati` | `Modulo 19: Fondamenti filosofici dell'analisi dei dati` |

## Lesson Archetypes

### 1. Theoretical lesson

Use for strategy, communication, research, brand, decision-making, framing.

Required structure:
- opening context
- why the topic matters
- core framework or process
- example or case signal
- common mistakes
- final summary

Avoid:
- fenced code blocks for runnable code or pseudo-code
- ASCII trees
- raw templates dumped as code

Prefer:
- tables
- checklists
- decision criteria
- applied business examples
- mermaid only when it replaces a long textual process map better than prose

### 2. Technical lesson

Use for SQL, Python, data engineering, infrastructure, experimentation mechanics, tracking implementation.

Required structure:
- problem statement
- technical concept
- runnable or readable example
- explanation of why the code works
- pitfalls
- summary or recap

Keep code only if removing it would make the lesson less teachable.

### 3. Case study

Use for end-to-end applications.

Required structure:
- context
- data/problem
- analysis path
- decision
- result or expected result
- lessons learned

### 4. Cheat sheet

Use for dense operational recall.

Required structure:
- formulas, quick rules, compact tables, checklists
- low narrative overhead
- scannable layout

## Frontmatter Rules

For every ordered lesson:
- `title`
- `description`
- `module`
- `order`
- `category`
- `difficulty`
- `duration`
- `prerequisites`
- `learningObjectives`

For first lessons in a module, use `prerequisites: []` instead of omitting the field.

## Code Usage Rules

Remove or rewrite code-like blocks when the lesson category is mainly conceptual. Typical signals:
- `Strategia`
- `Comunicazione`
- `Ricerca`
- `Ricerca Qualitativa`
- `Ricerca Quantitativa`
- `Fondamenti`
- `Metriche`
- `Metodologia`
- `Brand`
- `Management`

In theoretical lessons, `mermaid` can stay only if it behaves as a visual process summary. Inline formulas are fine. Plain fenced templates, ASCII diagrams, SQL, Python, YAML, or pseudo-code should be rewritten.

Do not remove code from lessons where implementation is the teaching object:
- `SQL`
- `Data Engineering`
- `Tracking`
- `Analisi Tecnica`
- `Data Science`
- `Infrastructure`
- `Streaming`
- `Window Functions`

## Length Rules

These are editorial thresholds, not hard schema limits:
- under 1,200 words: usually too thin unless it is a cheat sheet
- 1,500 to 3,500 words: healthy range for most lessons
- 3,500 to 4,500 words: review for density and repetition
- above 4,500 words: consider splitting into core lesson + deep dive, or trimming aggressively

## Overview and Catalog Rules

Whenever module taxonomy or lesson count changes, synchronize:
- `src/content/corso/learning-path.mdx`
- `src/content/corso/panoramica/mappe-concettuali.mdx`

These overview files must reflect:
- real module count
- real lesson count
- current module names
- current numbering

## Acceptance Checklist

Before closing a course-wide cleanup:
- module labels match directory mapping
- overview pages match the current catalog
- theoretical lessons are free of disallowed fenced blocks
- ordered lessons include the required metadata
- long lessons have been reviewed for density
- validation, tests, and build pass
