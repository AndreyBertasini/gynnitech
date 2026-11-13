# Design Spec — Bonifica Chirurgica Componenti `3s` e Riscrittura Standard Articolo Ibrido (Opzione 3)

**Data:** 2026-11-13  
**Autore:** Andrii Dyshkantiuk (GinnyTech)  
**Stato:** Approvato dall'utente (`confermo /superpowers:executing-plans`)

---

## 1. Contesto e Problema

Il catalogo formativo di `ginnytech.it` (`src/content/corso/`, **236 lezioni** distribuite su **21 moduli**) presenta attualmente una tripla frammentazione di formato e qualità:

1. **57 lezioni in `formato: "3s"` (Moduli 1–6)** con **1.167 occorrenze** di componenti didattici rigidi (`<Schema>`, `<Passo>`, `<Slide>`, `<Confronto>`, `<Lato>`, `<Criterio>`, `<Passi>`, `<Fase>`, `<Opzioni>`, `<Opzione>`, `<MiniTabella>`, `<TabellaDati>`, `<Barre>`, `<Barra>`, `<NumeriGrandi>`, `<Numero>`, `<Relazioni>`, `<Nodo>`, `<Pattern>`, `<ErroreTipico>`, `<Messaggio>`, `<Domanda>`, `<Percorso />`, `<Obiettivi />`) più **57 `<QuizExercise>`** e **10 `<SqlExercise>`** (67 file `.mdx` totali coinvolti). Questi componenti generano blocchi ripetitivi (es. *"Una sessione, tre blocchi"* in `/course/panoramica/come-studiare-bene-questo-corso/`), bottoni `← Precedente / Successivo →`, domande a tendina e frammentazione del testo.
2. **12 lezioni in `formato: "articolo"`** (`7` in Modulo 4 `gestione-data-driven` e `5` in Modulo 16 `real-time-analytics`), già scritte come articoli tecnici ma validate finora con una soglia unica (`1.000–2.200` parole).
3. **167 lezioni in formato `legacy` (Moduli 7–21)**, prive di componenti `3s` ma spesso strutturate come dispense scolastiche brevi con sezioni generiche (`Introduzione`, `Riepilogo`, `Conclusioni`).

### Obiettivo Strategico B2B
Posizionare **Andrii Dyshkantiuk** (Analytics Engineer & **ClickHouse Certified Developer**) come riferimento autorevole in Italia per CTO, Head of Data, Engineering Manager e Marketing/Product Leader:
- **Zero widget didattici / scolastici** in tutto il sito (`0` tag `3s`, `0` `QuizExercise`, `0` `SqlExercise`).
- **Standard Editoriale Ibrido (Opzione 3)** calibrato per fascia di modulo così che ogni lezione sembri un articolo d'autore da Engineering Blog / Field Report di produzione.

---

## 2. Architettura in Due Fasi (Approccio 1 + Priorità Onda 1/2/3 dell'Approccio 3)

### Fase A — Bonifica Chirurgica Immediata (Zero Tag `3s` su 236/236 lezioni)
1. **Parser & Trasformatore AST/MDX (`scripts/bonifica-3s.ts`)**:
   - Rimuove da tutte le `236` lezioni qualsiasi import e utilizzo di `QuizExercise`, `SqlExercise` e dei `24` componenti `src/components/lezione/`.
   - Smonta i blocchi `<Schema>...</Schema>` (e relativi `<Passo>`, `<Passi>`, `<Fase>`, `<MiniTabella>`) che duplicano meccanicamente il paragrafo successivo (come *"Una sessione, tre blocchi"*).
   - Smonta `<Slide>`, `<Percorso />`, `<Obiettivi />`, `<Domanda>` e la sezione `## Riepilogo` di sole frasi `<Messaggio>`.
   - Converte i dati utili di confronto/metriche (`<Confronto>`, `<Lato>`, `<Criterio>`, `<Opzioni>`, `<Opzione>`, `<NumeriGrandi>`, `<Numero>`, `<Barre>`, `<Barra>`, `<Relazioni>`, `<Nodo>`, `<ErroreTipico>`, `<Pattern>`) in prosa/elenchi Markdown puliti privi di simboli artificiali (`★`) e di qualsiasi componente JSX, mantenendo intatte le `<TabellaDati>` come normali tabelle Markdown.
   - Aggiorna il frontmatter delle 57 lezioni ex-`3s` rimuovendo `formato: "3s"` e `sezioni: [...]` finché non vengono riscritte in `formato: "articolo"`.
2. **Rimozione definitiva del sottosistema `3s` dal codice sorgente**:
   - Eliminazione di `src/components/lezione/` (23 file), `src/styles/lezione.css`, `src/lib/lezione/` (`agent.ts`, `agent.test.ts`, `model.ts`, `model.test.ts`), `scripts/lezioni-3s-rules.ts`, `scripts/lezioni-3s-rules.test.ts`, `scripts/validate-lezioni-3s.ts`.
   - Rimozione di `QuizExercise.tsx` e `SqlExercise.tsx` da `src/pages/course/[module]/[slug].astro`, rimozione del branch `formato === '3s'` e di `Astro.locals.lezione`.
   - Aggiornamento di `src/lib/schemas.ts`, `src/lib/agent-markdown.ts`, `src/lib/agent-markdown.test.ts`, `scripts/validation.ts`, `scripts/validation.test.ts`, `scripts/pipeline-lezioni.ts`, `package.json`, `tests/schemas.test.ts`, `tests/theoretical-lessons-cleanliness.test.ts`.

### Fase B — Riscrittura Standard Articolo Ibrido (Opzione 3) per Onde
Tutte le lezioni riscritte adottano `formato: "articolo"` con **due profili di validazione automatica** in `scripts/lezioni-articolo-rules.ts` determinati dal modulo (`folder` o `frontmatter.module`):

#### Profilo A — Strategia, Metriche, Prodotto & Marketing (`1.400–1.900` parole)
- **Moduli target**:
  - Modulo 1 (`panoramica`)
  - Modulo 2 (`fondamenti-filosofici`)
  - Modulo 3 (`direzioni-analitica`)
  - Modulo 4 (`gestione-data-driven`)
  - Modulo 5 (`data-collection`)
  - Modulo 6 (`metriche-business`)
  - Modulo 7 (`psicologia-utente`)
  - Modulo 13 (`prodotto`)
  - Modulo 14 (`marketing`)
  - Modulo 20 (`finanza`)
- **Struttura d'autore**:
  1. **Incidente economico / Decisione sbagliata in apertura** (prima del primo H2, `≥ 120` caratteri): caso concreto con cifre in €, percentuali, CAC/LTV/ROAS o attribution distorta.
  2. **6 sezioni `##` (H2) con titoli specifici sul dominio** (zero numeri `1.`, zero titoli generici come `Introduzione`, `Il caso`, `Riepilogo`, `Conclusioni`, `Checklist`):
     - Meccanismo reale dietro la metrica o il processo decisionale;
     - Formula/modello o query SQL/tabella dati realistica con calcolo commentato passo-passo;
     - Anatomia dell'errore aziendale più costoso e perché le dashboard standard lo nascondono;
     - Framework decisionale applicato a un caso B2B/e-commerce/SaaS reale;
     - Architettura del dato o contratto di misurazione tra team (Marketing, Product, Finance, Data);
     - **Checklist operativa finale** con 5 punti numerati (`1. **Verbo — Oggetto.** Spiegazione...`).

#### Profilo B — Production & Analytics Engineering (`1.600–2.400` parole)
- **Moduli target**:
  - Modulo 8 (`sql`)
  - Modulo 9 (`python`)
  - Modulo 10 (`statistica`)
  - Modulo 11 (`ab-testing`)
  - Modulo 12 (`visualizzazione`)
  - Modulo 15 (`analytics-engineering`)
  - Modulo 16 (`real-time-analytics`)
  - Modulo 17 (`kafka-streaming`)
  - Modulo 18 (`data-warehousing`)
  - Modulo 19 (`machine-learning`)
  - Modulo 21 (`ai`)
- **Struttura d'autore**:
  1. **Incidente di produzione / Bottleneck architetturale in apertura** (`≥ 120` caratteri): query da 40 secondi, OOM su ClickHouse, duplicati at-least-once in Kafka, modello dbt rotto alle 07:00.
  2. **6 sezioni `##` (H2) tecniche e specifiche**:
     - Architettura fisica sotto il cofano (storage colonnare, granule, partizioni, DAG dbt, consumer group, ecc.);
     - Implementazione production-ready commentata (SQL ClickHouse/PostgreSQL, YAML/SQL dbt, Python) con output reale;
     - Anti-pattern di produzione e diagnosi sulle tabelle di sistema (`system.query_log`, `EXPLAIN`, test dbt);
     - Benchmark / trade-off di scala, latenza e costi infrastrutturali;
     - Pattern di integrazione nello stack moderno (`Kafka → ClickHouse`, `dbt → Warehouse`, CI/CD dati);
     - **Checklist di messa in produzione** con 5 punti numerati (`1. **Verbo — Oggetto.** Spiegazione...`).

#### Ordine delle 3 Onde di Riscrittura
- **Onda 1 (Impatto immediato B2B & ex-`3s`)**:
  - **Batch Flagship prioritario (7 lezioni vetrina)**:
    1. `panoramica/come-studiare-bene-questo-corso.mdx` (l'URL segnalato dall'utente)
    2. `analytics-engineering/dbt-e-ruolo-dell-analytics-engineer.mdx` (linkato dalle pagine Consulenza/Home)
    3. `analytics-engineering/modelli-staging-intermediate-marts.mdx` (pilastro Analytics Engineering)
    4. `kafka-streaming/kafka-connect-e-cdc-debezium.mdx` (pilastro Streaming & CDC verso ClickHouse)
    5. `data-warehousing/architetture-dati-moderne-medallion.mdx` (pilastro Architetture Dati B2B)
    6. `data-collection/architettura-degli-eventi.mdx` (pilastro Event Tracking Server-Side/First-Party)
    7. `metriche-business/unit-economics-cac-ltv-payback.mdx` (pilastro Unit Economics B2B/SaaS)
  - Seguono i restanti batch dei Moduli 1–6 (55 lezioni ex-`3s`).
- **Onda 2 (Core Engineering B2B)**: Moduli `analytics-engineering`, `real-time-analytics`, `kafka-streaming`, `data-warehousing`, `sql`, `ab-testing`, `visualizzazione`.
- **Onda 3 (Completamento Catalogo 236/236)**: Moduli `prodotto`, `marketing`, `psicologia-utente`, `python`, `statistica`, `machine-learning`, `finanza`, `ai`.

---

## 3. Regole di Validazione Automatica (`scripts/lezioni-articolo-rules.ts`)

| Regola | Specifica |
|---|---|
| **R1 — Lunghezza per Profilo** | **Profilo A**: `1.400–1.900` parole di prosa. **Profilo B**: `1.600–2.400` parole di prosa. (Soglia hard minima `1.200` per retrocompatibilità sui 12 articoli già pubblicati o adeguamento diretto a `≥ 1.400`). |
| **R2 — Apertura sul caso reale** | Almeno `120` caratteri di prosa concreta prima del primo `##`. |
| **R3 — Sezioni H2** | Da `5` a `7` sezioni `##` (target standard: `6`), zero numeri in testa (`## 1.`), zero titoli generici nella kill-list (`Introduzione`, `Riepilogo`, `Conclusioni`, `Quiz`, `Lab`, `Esercizio`, `Checklist`, ecc.). |
| **R4 — Sviluppo argomentativo** | Almeno `100` parole di prosa in ogni sezione `##` prima dell'ultima, e almeno un paragrafo di `≥ 50` parole per sezione. |
| **R5 — Densità elenchi puntati** | Massimo `1` elenco puntato non ordinato (`- ` / `* `) per sezione `##`. |
| **R6 — Ritmo del periodo** | Media parole/frase `≥ 13`, quota frasi `< 8` parole `≤ 25%`. |
| **R7 — Codice / Esempio verificato** | Almeno `1` blocco di codice eseguibile con `≥ 40` parole di spiegazione dopo il blocco, oppure `senzaCodice: true` esplicito per lezioni puramente strategiche/filosofiche. |
| **R8 — Tabella o diagramma** | Almeno una tabella Markdown (`\| --- \|`) o blocco `mermaid`/`text`/`ascii` con paragrafo di lettura prima o dopo. |
| **R9 — Checklist finale** | Ultima sezione `##` con `4–6` punti numerati nel formato `1. **Verbo — Oggetto.** Spiegazione...`. |
| **R10 — Zero componenti banditi** | Vietati tutti i `24` tag `3s`, `QuizExercise` e `SqlExercise` in **qualsiasi** lezione del corso (anche legacy). |
| **R11 — Obiettivi frontmatter** | `learningObjectives` tra `3` e `5` voci. |
| **R12 — Copertura concetti chiave** | Tutti i termini di `concettiChiave` (se presenti) compaiono nel corpo. |

---

## 4. Criteri di Accettazione e Verifica

1. `npm test` passa al 100% (inclusi i nuovi test Vitest per Profilo A/B e per l'assenza totale di tag `3s` su tutte le 236 lezioni).
2. `npm run validate:articolo` passa con `0` errori su tutti i file con `formato: "articolo"`.
3. `npm run build` compila l'intero sito Astro (`dist/`) con `0` errori.
4. `npm run audit:site` verifica tutte le pagine HTML generate e i relativi `.md` twin (`0` broken link, `0` pagine corte o malformate).
