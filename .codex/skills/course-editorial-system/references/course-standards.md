# Course Standards

## Canonical Module Taxonomy

Use the folder under `src/content/corso` as the canonical module id. The `module:` frontmatter must match this table.

| Folder | Canonical `module` value |
|---|---|
| `panoramica` | `Modulo 1: Panoramica e metodo di studio` |
| `data-collection` | `Modulo 2: Raccolta dati e sistemi di tracking` |
| `metriche-fondamenti` | `Modulo 3: Metriche, KPI tree e fondamenti analitici` |
| `gestione-data-driven` | `Modulo 4: Gestione data-driven e processi decisionali` |
| `analisi-prodotto` | `Modulo 5: Product analytics e diagnosi della crescita` |
| `analisi-marketing` | `Modulo 6: Marketing analytics e martech` |
| `dashboard-visualizzazione` | `Modulo 7: Dashboard e visualizzazione dei dati` |
| `marketing-data-science` | `Modulo 8: Marketing data science e modelli predittivi` |
| `data-warehousing` | `Modulo 9: Data warehouse e modellazione analitica` |
| `s3-data-lake` | `Modulo 10: Data lake e lakehouse su S3` |
| `kafka-streaming` | `Modulo 11: Kafka e streaming di eventi` |
| `real-time-analytics` | `Modulo 12: Real-time analytics con ClickHouse` |
| `infrastructure-ops` | `Modulo 13: Infrastruttura dati e operations` |
| `advanced-sql` | `Modulo 14: SQL avanzato per l'analisi` |
| `matematica-analisi-dati` | `Modulo 15: Matematica per l'analisi dei dati` |
| `analytics-engineering` | `Modulo 16: Analytics engineering con dbt` |
| `significativita-statistica` | `Modulo 17: Significatività statistica e A/B test` |
| `direzioni-analitica` | `Modulo 18: Direzioni dell'analitica: ruoli e carriera` |
| `filosofia-analisi-dati` | `Modulo 19: Fondamenti filosofici dell'analisi dei dati` |
| `ai-data-workflows` | `Modulo 20: AI assistita per il lavoro sui dati` |
| `agentic-ai-data-workflows` | `Modulo 21: Agentic AI per il lavoro sui dati` |

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
