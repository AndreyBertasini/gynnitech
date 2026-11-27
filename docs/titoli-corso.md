# Revisione dei titoli del corso

> **Stato:** approvata e applicata il 2026-10-15. Oltre a `title` e H1 sono stati aggiornati il campo `module:` delle lezioni, gli `headerImageAlt` e le 23 `description` che ripetevano il titolo vecchio, `course-program.ts` (moduli, `seoTitle`, fasi, percorsi, capstone, `coreLessons`), l'elenco moduli in `public/llms.txt` e `learning-path.mdx`, e le traduzioni EN in `en-static-cache.json`. Gli URL non sono cambiati.

## Come rivedere

- Correggi direttamente la colonna **Proposto**, oppure scrivimi in chat (es. "advanced-sql 5: preferisco …").
- _(invariato)_ vuol dire che il titolo attuale resta com'è. Se vuoi cambiarlo, scrivi il nuovo titolo al suo posto.
- **⚠ URL** segnala le lezioni il cui indirizzo non corrisponde più al contenuto. In questo giro gli URL restano fermi: sono elencati in fondo per il giro successivo.
- Il nuovo titolo sostituisce sia il `title` del frontmatter sia l'H1 della lezione.

## Regole applicate

1. **Il titolo dice cosa impari**, ricavato dal contenuto reale della lezione (intro e H2), non dal vecchio blueprint.
2. **Italiano + termini di settore** (window functions, A/B test, dbt, data contract, North Star Metric), in sentence case: maiuscola solo all'inizio, nei nomi propri e nelle sigle. Accenti e apostrofi corretti.
3. **Lunghezza:** lezioni ≤ 60 caratteri, moduli ≤ 45.
4. **Titolo del frontmatter = H1**, sempre.
5. **Formati fissi:** `Cheat sheet: <tema>` · `Caso studio: <scenario>` quando si analizza · `Progetto: <cosa costruisci>` quando si costruisce.
6. **Argomenti sovrapposti tra moduli:** il titolo dice l'angolo del modulo. Nessuna lezione viene spostata o unita.

## Riepilogo

- **Lezioni:** 141 titoli da cambiare su 237.
- **Moduli:** 21 su 21 (soprattutto lingua, maiuscole e lunghezza).
- **Fasi e percorsi:** 4 fasi, 3 percorsi, il titolo del capstone.
- **Bug corretti:** 6 titoli che parlavano d'altro rispetto al contenuto (tutti in `advanced-sql`), 8 titoli con gli apici visibili, i titoli diversi dall'H1.
- **URL:** restano tutti uguali. 44 non corrispondono più al contenuto e sono elencati in fondo.

## Fasi, percorsi e capstone

| Tipo | Attuale | Proposto | Motivo |
|---|---|---|---|
| Fase | Fondazione | _(invariato)_ |  |
| Fase | Applicazione Business | **Applicazione al business** | maiuscole, italiano |
| Fase | Infrastruttura e Stack | **Infrastruttura e stack** | maiuscole |
| Fase | Rigore Quantitativo | **Rigore quantitativo** | maiuscole |
| Fase | Direzione e Profondita | **Direzione e profondità** | accento, maiuscole |
| Percorso | Growth & Marketing Measurement | **Growth e misurazione del marketing** | lingua |
| Percorso | Product & Experimentation | **Prodotto e sperimentazione** | lingua |
| Percorso | Data Platform & Analytics Engineering | **Data platform e analytics engineering** | maiuscole, "&" |
| Capstone | Costruire un sistema completo di Marketing Data & Analytics Engineering | **Costruire un sistema completo di marketing analytics** | più corto, maiuscole |

## Moduli

| N | Cartella | Attuale | Proposto | Motivo |
|---|---|---|---|---|
| 1 | `panoramica` | Panoramica del Corso e Metodo di Studio per Data Work | **Panoramica e metodo di studio** | più corto: 52 → 29 caratteri |
| 2 | `data-collection` | Data Collection & Tracking Systems | **Raccolta dati e sistemi di tracking** | lingua |
| 3 | `metriche-fondamenti` | Metriche, KPI Trees e Fondamenti Analitici | **Metriche, KPI tree e fondamenti analitici** | maiuscole |
| 4 | `gestione-data-driven` | Gestione Data-Driven e Operating System Decisionale | **Gestione data-driven e processi decisionali** | "operating system decisionale" è gergo |
| 5 | `analisi-prodotto` | Product Analytics e Growth Diagnostics | **Product analytics e diagnosi della crescita** | lingua, maiuscole |
| 6 | `analisi-marketing` | Marketing Analytics, Incrementality e Unit Economics | **Marketing analytics e martech** | il modulo copre anche lo stack (GA4, GTM, CDP, reverse ETL) |
| 7 | `dashboard-visualizzazione` | Dashboard, Visualization e Decision Interface | **Dashboard e visualizzazione dei dati** | lingua |
| 8 | `marketing-data-science` | Marketing Data Science, Forecasting e Decision Models | **Marketing data science e modelli predittivi** | nel modulo non c'è una lezione di forecasting |
| 9 | `data-warehousing` | Data Warehousing & Analytical Architecture | **Data warehouse e modellazione analitica** | lingua, "&" |
| 10 | `s3-data-lake` | S3, Data Lake e Lakehouse Architecture | **Data lake e lakehouse su S3** | lingua, più corto |
| 11 | `kafka-streaming` | Kafka & Event Streaming Engineering | **Kafka e streaming di eventi** | lingua, "&" |
| 12 | `real-time-analytics` | Real-Time Analytics & ClickHouse Systems | **Real-time analytics con ClickHouse** | lingua, "&" |
| 13 | `infrastructure-ops` | Infrastructure & Ops for Data Systems | **Infrastruttura dati e operations** | lingua |
| 14 | `advanced-sql` | Advanced SQL for Analytical Systems | **SQL avanzato per l'analisi** | lingua |
| 15 | `matematica-analisi-dati` | Matematica per l Analisi Dati | **Matematica per l'analisi dei dati** | apostrofo mancante |
| 16 | `analytics-engineering` | Analytics Engineering con dbt e Semantic Layer | **Analytics engineering con dbt** | più corto, maiuscole |
| 17 | `significativita-statistica` | Significativita Statistica, A/B Testing e Experimentation Science | **Significatività statistica e A/B test** | accento, più corto: 65 → 37 |
| 18 | `direzioni-analitica` | Direzioni in Analitica: Marketing, Prodotto, Finanza | **Direzioni dell'analitica: ruoli e carriera** | il modulo parla di ruoli, non di funzioni aziendali |
| 19 | `filosofia-analisi-dati` | Fondamenti Filosofici dell Analisi dei Dati | **Fondamenti filosofici dell'analisi dei dati** | apostrofo mancante, maiuscole |
| 20 | `ai-data-workflows` | AI per Analisi Dati, Data Engineering e AutoML | **AI assistita per il lavoro sui dati** | più corto, distinto dal modulo 21 |
| 21 | `agentic-ai-data-workflows` | Agentic AI per Analisi Dati, Data Engineering e AutoML | **Agentic AI per il lavoro sui dati** | più corto, distinto dal modulo 20 |

## Lezioni

### Pagina introduttiva

| # | File | Attuale | Proposto | Motivo |
|---|---|---|---|---|
|  | `learning-path` | Learning Path - Percorso Formativo Completo | **Percorso formativo completo** | maiuscole, lingua |

### 1 · Panoramica e metodo di studio

`panoramica` · 8 lezioni · 5 titoli da cambiare

| # | File | Attuale | Proposto | Motivo |
|---|---|---|---|---|
| 2 | `come-studiare-bene-questo-corso` | Come si studia materiale tecnico senza dimenticarlo | _(invariato)_ |  |
| 3 | `come-funziona-questo-corso` | 'First principles: come ragiona un analista forte' | **First principles: come ragiona un analista forte** | apici visibili nel titolo · ⚠ URL |
| 4 | `come-praticare-sui-dati-mentre-studi` | Dalla domanda di business alla domanda analitica | _(invariato)_ | ⚠ URL |
| 5 | `come-prendere-appunti-senza-perdersi` | Come prendere appunti tecnici, versionare idee e costruire memoria | **Appunti tecnici: un sistema che costruisce memoria** | più corto: 66 → 50 |
| 6 | `come-ricordare-davvero-quello-che-impari` | 'Reproducibility mindset: rigore prima della velocita' | **Riproducibilità: rigore prima della velocità** | apici visibili nel titolo, accento, lingua · ⚠ URL |
| 7 | `dal-corso-alle-competenze-di-lavoro` | Dal corso alle competenze di lavoro | _(invariato)_ |  |
| 8 | `come-non-perdere-motivazione-nel-lungo-periodo` | Skill diagnostic iniziale e piano di studio personalizzato | **Diagnosi iniziale e piano di studio personale** | lingua · ⚠ URL |
| 9 | `mappe-concettuali` | Mappe Concettuali: Come Entrare nei 21 Moduli del Corso | **Mappe concettuali: come orientarsi nei 21 moduli** | maiuscole, più chiaro |

### 2 · Raccolta dati e sistemi di tracking

`data-collection` · 8 lezioni · 6 titoli da cambiare

| # | File | Attuale | Proposto | Motivo |
|---|---|---|---|---|
| 1 | `introduction` | Data collection: fondamenti e strategia | **Raccolta dati: fondamenti e strategia** | lingua, coerente col modulo |
| 2 | `event-tracking` | Event tracking: implementazione pratica | _(invariato)_ |  |
| 3 | `framework` | Framework di data collection: strumenti e pattern | **Strumenti di tracking a confronto: come scegliere** | più chiaro: la lezione confronta strumenti |
| 4 | `privacy` | Privacy e compliance nella data collection | **Privacy e GDPR nella raccolta dati** | più concreto, lingua |
| 5 | `terminology` | Terminologia e glossario del data tracking | **Glossario del tracking: entità, eventi, proprietà** | più concreto |
| 6 | `jtbd` | JTBD e il valore dei dati raccolti | **Jobs to be done: quali dati vale la pena raccogliere** | sigla sciolta, più chiaro |
| 7 | `integrations` | Integrazioni: connettere tool e warehouse | _(invariato)_ |  |
| 8 | `quickstart` | Quickstart: data collection in 30 minuti | **Quickstart: il primo tracking in 30 minuti** | lingua |

### 3 · Metriche, KPI tree e fondamenti analitici

`metriche-fondamenti` · 6 lezioni · 3 titoli da cambiare

| # | File | Attuale | Proposto | Motivo |
|---|---|---|---|---|
| 1 | `inizio-successo` | North Star Metric, KPI tree e metrica obiettivo | _(invariato)_ | ⚠ URL |
| 2 | `statistica-fondamenti` | Guardrail metrics, counter-metrics e failure metrics | **Guardrail e counter-metric: i freni di ogni obiettivo** | tre termini inglesi di fila, poco leggibile · ⚠ URL |
| 4 | `generazione-idee` | Cohort logic, segmentazione e baseline corrette | **Coorti, segmenti e baseline corrette** | lingua · ⚠ URL |
| 6 | `ricerca-desk` | Segnale, rumore, variazione normale e falsi allarmi | _(invariato)_ | ⚠ URL |
| 7 | `cheat-sheet` | Correlazione, proxy metric e lettura causale dei KPI | _(invariato)_ | ⚠ URL |
| 8 | `caso-studio` | Lab: rifare il framework metrico di un business reale | **Progetto: rifare il framework metrico di un business reale** | formato "Progetto:" al posto di "Lab:" |

### 4 · Gestione data-driven e processi decisionali

`gestione-data-driven` · 9 lezioni · 6 titoli da cambiare

| # | File | Attuale | Proposto | Motivo |
|---|---|---|---|---|
| 1 | `cultura-data-driven` | Cultura data-driven: fondamenti e principi | **Cultura data-driven: i tre pilastri** | "fondamenti e principi" è generico |
| 2 | `decision-making-dati` | Decision-making basato sui dati | **Decidere con i dati: il framework DECIDE** | lingua, più concreto |
| 3 | `okr-e-kpi` | OKR e KPI: dalle metriche agli obiettivi | _(invariato)_ |  |
| 4 | `framework-jtbd` | Framework JTBD applicato alla gestione | **Jobs to be done per l'analisi: dai job ai dati** | sigla sciolta, distinto da data-collection |
| 5 | `ricerca-quantitativa` | Ricerca quantitativa e qualitativa per decisioni | _(invariato)_ |  |
| 6 | `interviste-profondita` | Interviste di profondità per insight sui dati | **Interviste in profondità per l'analisi dei dati** | "di profondità" è un calco |
| 7 | `ciclo-deming-hadi` | Ciclo di Deming (PDCA) e miglioramento continuo | **PDCA e HADI: cicli di miglioramento continuo** | la lezione copre anche HADI |
| 8 | `cheat-sheet` | Cheat Sheet — Gestione Data-Driven | **Cheat sheet: gestione data-driven** | formato unico "Cheat sheet: <tema>", H1 diverso |
| 9 | `caso-studio` | Progetto: diagnosi della cultura dati aziendale | _(invariato)_ |  |

### 5 · Product analytics e diagnosi della crescita

`analisi-prodotto` · 23 lezioni · modulo ristrutturato il 2026-11-27 (11 lezioni riscritte, 12 nuove; slug esistenti invariati). I titoli sotto sono quelli in uso.

| # | File | Titolo |
|---|---|---|
| 1 | `introduzione-product-analytics` | Introduzione alla product analytics: il mestiere del product analyst |
| 2 | `north-star-metric-tree` | North Star Metric e metric tree: dalla strategia alle metriche di team |
| 3 | `tracking-plan-event-model` | Tracking plan e modello a eventi: dati di prodotto di cui fidarsi |
| 4 | `funnel-analysis` | Funnel analysis: ordine dei passi, finestra e segmenti |
| 5 | `onboarding-attivazione` | Onboarding e attivazione: trovare l'evento che predice la retention |
| 6 | `retention-framework` | Misurare la retention: definizioni, curve di coorte e churn |
| 7 | `analisi-coorte` | Coorti comportamentali, growth accounting e matrici di transizione |
| 8 | `engagement-metriche` | Metriche di engagement: DAU/MAU, power user curve e adozione delle funzionalità |
| 9 | `monetization-analytics` | Monetization analytics: ARPU, MRR, NRR, LTV e CAC payback |
| 10 | `product-market-fit` | Misurare il Product-Market Fit |
| 11 | `customer-development` | Customer development per product analytics |
| 12 | `ux-research` | UX research e dati comportamentali |
| 13 | `nps-net-promoter-score` | NPS, CSAT e CES: misurare la soddisfazione |
| 14 | `ab-testing` | A/B test di prodotto: dal disegno alla decisione |
| 15 | `esperimenti-avanzati` | Esperimenti avanzati: varianza, interferenza e test sequenziali |
| 16 | `inferenza-causale-osservazionale` | Inferenza causale senza esperimento: DiD, synthetic control, RDD e propensity score |
| 17 | `diagnosi-calo-metrica` | Diagnosi di un calo di metrica: dal grafico rosso alla causa |
| 18 | `prioritizzazione-feature` | Prioritizzare le feature con i dati: RICE, Kano, Cost of Delay e opportunity sizing |
| 19 | `strumenti-product-analytics` | Gli strumenti del product analyst: Amplitude, Mixpanel, PostHog, GA4 e warehouse |
| 20 | `comunicare-insight` | Comunicare un insight: dal brief alla raccomandazione |
| 21 | `colloquio-product-analyst` | Il colloquio da product analyst: domande tipiche e risposte modello |
| 22 | `caso-studio` | Caso studio: diagnosi completa di un prodotto |
| 23 | `cheat-sheet` | Cheat sheet di product analytics: formule, soglie e checklist del modulo |

### 6 · Marketing analytics e martech

`analisi-marketing` · 22 lezioni · 14 titoli da cambiare

| # | File | Attuale | Proposto | Motivo |
|---|---|---|---|---|
| 1 | `performance-marketing` | Performance marketing analytics | _(invariato)_ |  |
| 2 | `modelli-attribuzione` | Modelli di attribuzione marketing | **Modelli di attribuzione: da last click a Markov e Shapley** | più concreto, distinto da MDS |
| 3 | `customer-journey-mapping` | Customer journey e funnel analytics | _(invariato)_ |  |
| 4 | `mmm-incrementality` | Marketing Mix Modeling (MMM) | **Marketing mix modeling: adstock, saturazione e budget** | maiuscole, più concreto |
| 5 | `funnel-unit-economics` | Funnel marketing e unit economics | _(invariato)_ |  |
| 6 | `seo-content-analytics` | SEO e content analytics | _(invariato)_ |  |
| 7 | `crm-email-analytics` | CRM e email marketing analytics | _(invariato)_ |  |
| 8 | `social-media-analytics` | Social media analytics | _(invariato)_ |  |
| 9 | `efficacia-brand` | Brand analytics e misurazione dell'efficacia | **Misurare il brand: brand lift e pricing power** | sovrapposto alla lezione 10 |
| 10 | `costruire-brand-forte` | Costruire un brand forte: dati e strategia | **Il brand come asset economico: segnali e strategia** | distinto dalla lezione 9 |
| 11 | `martech-dashboard-operativi` | Martech dashboard e analytics operativi | **Dashboard operative per il marketing** | lingua |
| 12 | `ga4-avanzato` | GA4 avanzato per analisti di marketing | _(invariato)_ |  |
| 13 | `server-side-tracking-gtm-server-capi` | Server-side tracking e GTM Server | **Server-side tracking, GTM Server e Conversions API** | la lezione copre anche la CAPI |
| 14 | `reverse-etl-sincronizzazione-audience` | Reverse ETL e sincronizzazione audience | **Reverse ETL e sincronizzazione delle audience** | grammatica |
| 15 | `lifecycle-orchestration-multicanale` | Lifecycle orchestration multicanale | **Lifecycle marketing: orchestrazione multicanale** | lingua |
| 16 | `cdp-identity-resolution-audience-activation` | CDP e identity resolution | **CDP, identity resolution e attivazione delle audience** | la lezione copre anche l'attivazione |
| 17 | `b2b-martech-ops` | B2B martech operations | **Martech operations nel B2B: CRM, scoring e routing** | più concreto |
| 18 | `gtm-datalayer-qa-tracking` | GTM DataLayer e QA del tracking marketing | **GTM, dataLayer e QA del tracking** | grafia di dataLayer, più corto |
| 19 | `analisi-end-to-end-utm` | Analisi end-to-end con UTM e parametri di campagna | **UTM e parametri di campagna: dal click al ricavo** | più chiaro |
| 20 | `marketing-data-pipeline` | Marketing data pipeline: architettura end-to-end | _(invariato)_ |  |
| 21 | `caso-studio` | Caso studio: strategia marketing data-driven | **Caso studio: allocare il budget marketing con dati sporchi** | "strategia data-driven" è generico |
| 22 | `cheat-sheet` | Cheat sheet di marketing analytics | **Cheat sheet: marketing analytics** | formato unico "Cheat sheet: <tema>" |

### 7 · Dashboard e visualizzazione dei dati

`dashboard-visualizzazione` · 8 lezioni · 3 titoli da cambiare

| # | File | Attuale | Proposto | Motivo |
|---|---|---|---|---|
| 1 | `data-visualization` | Data visualization: principi e percezione visiva | _(invariato)_ |  |
| 2 | `dashboard-strategiche` | Dashboard strategiche: progettare per l'executive | _(invariato)_ |  |
| 3 | `storytelling-dati` | Storytelling con i dati: narrative e persuasione | _(invariato)_ |  |
| 4 | `sql-per-analisti` | SQL per analisti: query per dashboard | _(invariato)_ |  |
| 5 | `python-data-analysis` | Python per data analysis e dashboard | **Python per l'analisi dei dati e le dashboard** | lingua |
| 6 | `etl-data-pipeline` | ETL e pipeline per dashboard | _(invariato)_ |  |
| 7 | `caso-studio` | Caso studio: dashboard esecutiva completa | **Caso studio: una dashboard executive completa** | "esecutiva" in italiano ha un altro senso |
| 8 | `cheat-sheet` | Cheat Sheet — Dashboard e Visualizzazione | **Cheat sheet: dashboard e visualizzazione** | formato unico "Cheat sheet: <tema>", H1 diverso |

### 8 · Marketing data science e modelli predittivi

`marketing-data-science` · 19 lezioni · 10 titoli da cambiare

| # | File | Attuale | Proposto | Motivo |
|---|---|---|---|---|
| 1 | `strategy` | Marketing data science: fondamenti e strategia | _(invariato)_ |  |
| 2 | `python` | Python per marketing data science | _(invariato)_ |  |
| 3 | `customer-analytics` | Customer analytics e segmentazione | _(invariato)_ |  |
| 4 | `cluster-analysis` | Cluster analysis: tecniche e applicazioni | **Cluster analysis: gerarchico, DBSCAN e mixture model** | "tecniche e applicazioni" è generico |
| 5 | `nps-critique` | NPS critique e metriche di soddisfazione avanzate | **Oltre l'NPS: metriche di soddisfazione più affidabili** | lingua, distinto da analisi-prodotto |
| 6 | `pmf` | PMF e product-market fit analytics | **Product-market fit per segmento: metriche e test** | "PMF e product-market fit" ripete la stessa cosa |
| 7 | `attribution` | Attribution modeling moderno | **Attribution modeling in SQL: dal last click al time decay** | distinto da analisi-marketing |
| 8 | `unit-economics` | Unit economics avanzate per il marketing | _(invariato)_ |  |
| 9 | `trigger-analytics` | Trigger analytics e automazione marketing | **Trigger e automazione: campagne basate sul comportamento** | più chiaro |
| 10 | `text-generation` | Text generation e NLP per marketing | **NLP per il marketing: sentiment, topic e copy** | la lezione è più ampia della generazione di testo |
| 11 | `embeddings` | Embeddings e rappresentazione semantica | _(invariato)_ |  |
| 12 | `analytic-traps` | Trappole analitiche e bias nel marketing | _(invariato)_ |  |
| 13 | `hadi-cycles` | HADI cycles: applicazione pratica | **Cicli HADI: un motore di sperimentazione** | lingua, distinto da gestione-data-driven |
| 14 | `incrementality` | Incrementality testing e holdout | **Test di incrementalità e holdout** | lingua |
| 15 | `churn-prediction` | Modelli predittivi per LTV e churn | _(invariato)_ |  |
| 16 | `retention` | Retention analytics e crescita sostenibile | _(invariato)_ |  |
| 17 | `user-centricity` | Drift, model decay e monitoraggio | _(invariato)_ | ⚠ URL |
| 18 | `cheat-sheet` | Cheat Sheet — Marketing Data Science | **Cheat sheet: marketing data science** | formato unico "Cheat sheet: <tema>", H1 diverso |
| 19 | `caso-studio` | Caso studio: marketing data science end-to-end | **Caso studio: dal modello di churn alla decisione** | più concreto |

### 9 · Data warehouse e modellazione analitica

`data-warehousing` · 7 lezioni · 5 titoli da cambiare

| # | File | Attuale | Proposto | Motivo |
|---|---|---|---|---|
| 1 | `fondamenti` | Data warehousing moderno: architettura e concetti | **Data warehouse moderno: OLTP, OLAP e star schema** | più concreto |
| 2 | `data-modeling` | Modellazione dati per warehouse | **Modellazione dimensionale: fact e dimension table** | più concreto |
| 3 | `clickhouse` | ClickHouse nel data warehouse moderno | _(invariato)_ |  |
| 4 | `schema-evolution` | Schema evolution e gestione dei cambiamenti | _(invariato)_ |  |
| 5 | `olap` | OLAP e modellazione analitica avanzata | **OLAP: cubi, ROLLUP, CUBE e GROUPING SETS** | "modellazione analitica avanzata" è generico |
| 6 | `sql` | SQL per data warehouse: query pattern essenziali | **SQL per il data warehouse: i pattern essenziali** | grammatica |
| 7 | `caso-studio` | Caso studio: costruire un data warehouse | **Progetto: costruire un data warehouse** | formato "Progetto:" (si costruisce) |

### 10 · Data lake e lakehouse su S3

`s3-data-lake` · 12 lezioni · 9 titoli da cambiare

| # | File | Attuale | Proposto | Motivo |
|---|---|---|---|---|
| 1 | `introduzione-object-storage` | 'Object storage: come funziona davvero' | **Object storage: come funziona davvero** | apici visibili nel titolo |
| 2 | `partitioning-strategy` | Strategie di partizionamento su data lake | _(invariato)_ |  |
| 3 | `query-engines` | Athena e Presto/Trino: query engines su S3 | **Query engine su S3: Athena, Presto e Trino** | ordine più leggibile |
| 4 | `data-lifecycle` | Data lifecycle e gestione dello storage | **Storage class e lifecycle policy su S3** | più concreto |
| 5 | `iceberg` | Apache Iceberg e table formats per data lake | **Apache Iceberg e table format per data lake** | plurale inglese |
| 6 | `governance` | Catalogo dati e governance su S3 | _(invariato)_ |  |
| 7 | `performance-s3` | Prestazioni e ottimizzazione query su S3 | **Prestazioni e ottimizzazione delle query su S3** | grammatica |
| 8 | `sicurezza` | Sicurezza e access control su data lake | **Sicurezza e access control sul data lake** | grammatica |
| 9 | `monitoring` | Data lake monitoring e data quality | **Monitoring e data quality del data lake** | ordine più leggibile |
| 10 | `backup-dr` | Data lake: backup e disaster recovery | **Backup e disaster recovery del data lake** | coerente con le altre lezioni |
| 11 | `delta-lake` | Delta Lake: ACID su data lake | **Delta Lake: transazioni ACID sul data lake** | più chiaro |
| 12 | `caso-studio` | Progetto: data lake completo su S3 | _(invariato)_ |  |

### 11 · Kafka e streaming di eventi

`kafka-streaming` · 9 lezioni · 4 titoli da cambiare

| # | File | Attuale | Proposto | Motivo |
|---|---|---|---|---|
| 1 | `introduzione-streaming` | Introduzione allo streaming con Kafka | _(invariato)_ |  |
| 2 | `kafka-fondamenti` | Kafka: fondamenti e architettura | **Architettura di Kafka: replica e garanzie di consegna** | distinto dalla lezione 1 di introduzione |
| 3 | `kafka-producers-consumers` | Producer, Consumer e Serializzazione | **Producer, consumer e serializzazione** | maiuscole |
| 4 | `kafka-connect` | Kafka Connect: integrazione senza codice | _(invariato)_ |  |
| 5 | `kafka-schema-registry` | Schema Registry e governance degli eventi | _(invariato)_ |  |
| 6 | `kafka-operations` | Kafka Streams: processare eventi con Java | _(invariato)_ | ⚠ URL |
| 7 | `kafka-ops` | Operations: monitorare e gestire Kafka in produzione | **Kafka in produzione: monitoring e operations** | più chiaro |
| 8 | `cheat-sheet` | Cheat Sheet — Kafka e Stream Processing | **Cheat sheet: Kafka e stream processing** | formato unico "Cheat sheet: <tema>" |
| 9 | `caso-studio` | Progetto: pipeline Kafka end-to-end | _(invariato)_ |  |

### 12 · Real-time analytics con ClickHouse

`real-time-analytics` · 9 lezioni · 5 titoli da cambiare

| # | File | Attuale | Proposto | Motivo |
|---|---|---|---|---|
| 1 | `streaming` | Fondamenti di stream processing | _(invariato)_ |  |
| 2 | `clickhouse-fondamenti` | ClickHouse: fondamenti e architettura | **ClickHouse: database colonnare e MergeTree** | distinto da data-warehousing |
| 3 | `clickhouse-ottimizzazione` | Ingestion patterns per analytics realtime | **Pattern di ingestion in tempo reale** | lingua, grafia di "realtime" · ⚠ URL |
| 4 | `cdc-pattern` | Change Data Capture (CDC) pattern | **Change data capture (CDC)** | maiuscole, "pattern" superfluo |
| 5 | `dashboards` | Dashboard real-time e monitoring operativo | _(invariato)_ |  |
| 6 | `materialized-views` | Materialized Views e Continuous Aggregates | **Materialized view e aggregazioni continue** | maiuscole, lingua |
| 7 | `anomaly-detection` | Alerting e anomaly detection su stream | _(invariato)_ |  |
| 8 | `cheat-sheet` | Cheat Sheet — Real-Time Analytics | **Cheat sheet: real-time analytics** | formato unico "Cheat sheet: <tema>", H1 diverso |
| 9 | `caso-studio` | Progetto: pipeline real-time end-to-end | _(invariato)_ |  |

### 13 · Infrastruttura dati e operations

`infrastructure-ops` · 7 lezioni · 4 titoli da cambiare

| # | File | Attuale | Proposto | Motivo |
|---|---|---|---|---|
| 1 | `introduzione` | Infrastruttura dati moderna: fondamenti | **Infrastruttura dati moderna: pilastri e costi** | "fondamenti" è generico |
| 2 | `ci-cd` | CI/CD per pipeline dati | _(invariato)_ |  |
| 3 | `monitoring` | Monitoring e alerting per data pipeline | **Monitoring e alerting delle pipeline dati** | grammatica |
| 4 | `cost-management` | Gestione dei costi dell'infrastruttura dati | _(invariato)_ |  |
| 5 | `airflow-prefect` | Orchestrazione pipeline: Airflow e Prefect | **Orchestrazione: Airflow, Prefect e Dagster** | la lezione copre anche Dagster |
| 6 | `cheat-sheet` | Cheat Sheet — Infrastructure & Ops | **Cheat sheet: infrastruttura e operations** | formato unico "Cheat sheet: <tema>", H1 diverso |
| 7 | `caso-studio` | Progetto: infrastruttura dati completa | _(invariato)_ |  |

### 14 · SQL avanzato per l'analisi

`advanced-sql` · 14 lezioni · 14 titoli da cambiare

| # | File | Attuale | Proposto | Motivo |
|---|---|---|---|---|
| 1 | `indice-window-functions` | Execution order, logical plans e query thinking | **Ordine logico di esecuzione: come pensa una query** | lingua · ⚠ URL |
| 2 | `window-functions-avanzate` | Join avanzate, semi-join, anti-join e set logic | **Join avanzate, semi-join, anti-join e logica insiemistica** | H1 diverso, lingua · ⚠ URL |
| 3 | `ranking-e-deduplicazione` | 'Window functions: struttura mentale' | **Window functions: ranking e deduplicazione** | apici visibili nel titolo, più concreto |
| 4 | `lag-lead-e-analisi-sequenziale` | Ranking, lag/lead, cumulative logic e frames | **LAG, LEAD e totali cumulativi: analisi sequenziale** | il ranking è nella lezione 3, lingua |
| 5 | `aggregazioni-su-finestra` | Cohort analysis in SQL | **Analisi di coorte in SQL: la matrice di retention** | lingua, più concreto · ⚠ URL |
| 6 | `frame-first-last-e-ntile` | Funnel analysis in SQL | **FIRST_VALUE, LAST_VALUE, NTILE e frame di finestra** | titolo ≠ contenuto (il titolo veniva dal vecchio blueprint) |
| 7 | `esercizi-guidati-window-functions` | Sessionization e behavioral grouping | **Sessionizzazione e raggruppamento comportamentale** | H1 diverso, lingua · ⚠ URL |
| 8 | `date-spine-e-metriche-temporali` | Esperimenti e A/B analysis in SQL | **Date spine e metriche temporali in SQL** | titolo ≠ contenuto (il titolo veniva dal vecchio blueprint) |
| 9 | `coorti-e-retention` | Attribution queries e path analytics | **Coorti, attribuzione e percorsi in SQL** | metà lezione è su coorti e retention |
| 10 | `funnel-e-sessionizzazione` | JSON, array e semi-structured analytics | **Funnel in SQL: passi in sequenza e finestre di conversione** | titolo ≠ contenuto (il titolo veniva dal vecchio blueprint) |
| 11 | `pivot-rollup-e-kpi-table` | Date-time pitfalls e timezone correctness | **Pivot, ROLLUP e KPI table per il reporting** | titolo ≠ contenuto (il titolo veniva dal vecchio blueprint) |
| 12 | `anomalie-pareto-e-segmentazione` | EXPLAIN, optimization e performance tuning | **Anomalie, Pareto e segmentazione RFM in SQL** | titolo ≠ contenuto (il titolo veniva dal vecchio blueprint) |
| 13 | `cheat-sheet` | Testing, refactoring e reusable SQL patterns | **Test, refactoring e pattern SQL riusabili** | H1 diverso, lingua · ⚠ URL |
| 14 | `caso-studio` | 'Lab avanzato: query professionali su casi reali' | **Caso studio: tre domande sulle stesse tabelle sporche** | apici visibili nel titolo, H1 diverso |

### 15 · Matematica per l'analisi dei dati

`matematica-analisi-dati` · 10 lezioni · 4 titoli da cambiare

| # | File | Attuale | Proposto | Motivo |
|---|---|---|---|---|
| 1 | `vettori-norme-e-similarita` | Vettori, matrici e geometria del dato | _(invariato)_ |  |
| 2 | `matrici-trasformazioni-e-sistemi-lineari` | Similarità, distanze e trasformazioni lineari | _(invariato)_ |  |
| 3 | `funzioni-derivate-e-ottimizzazione` | Probabilità: assiomi, eventi, condizionamento | **Probabilità: assiomi, eventi e condizionamento** | grammatica · ⚠ URL |
| 4 | `integrali-gradienti-e-funzioni-multivariate` | Distribuzioni, aspettativa, varianza e covarianza | **Distribuzioni, valore atteso, varianza e covarianza** | "aspettativa" è un calco · ⚠ URL |
| 5 | `probabilita-distribuzioni-e-bayes` | Teorema di Bayes e aggiornamento delle credenze | _(invariato)_ |  |
| 6 | `test-ipotesi-e-test-non-parametrici` | Test d'ipotesi: logica, non rituale | _(invariato)_ |  |
| 7 | `campionamento-clt-e-intervalli` | Stima, errore standard e intervalli di confidenza | _(invariato)_ |  |
| 8 | `autovalori-svd-e-riduzione-dimensionale` | Legge dei grandi numeri e teorema del limite centrale | _(invariato)_ | ⚠ URL |
| 9 | `cheat-sheet` | Regressione come geometria + ottimizzazione intuitiva | **Regressione: geometria e ottimizzazione** | il "+" non va nei titoli · ⚠ URL |
| 10 | `caso-studio` | Problem set matematico finale con soluzioni guidate | **Problem set finale con soluzioni guidate** | più corto |

### 16 · Analytics engineering con dbt

`analytics-engineering` · 13 lezioni · 12 titoli da cambiare

| # | File | Attuale | Proposto | Motivo |
|---|---|---|---|---|
| 1 | `indice-analytics-engineering` | Che cos'è davvero l'analytics engineering | _(invariato)_ |  |
| 2 | `dbt-e-ruolo-dell-analytics-engineer` | 'Layering: staging, intermediate, marts' | **Layering in dbt: staging, intermediate e marts** | apici visibili nel titolo, più chiaro · ⚠ URL |
| 3 | `progetto-dbt-fonti-e-ambienti-martech` | dbt fundamentals e project structure | **Fondamenti di dbt e struttura del progetto** | lingua |
| 4 | `staging-e-standardizzazione-dei-dati-martech` | Test, contracts e fiducia nei modelli | **Test, data contract e fiducia nei modelli** | H1 diverso, lingua · ⚠ URL |
| 5 | `marts-martech-funnel-retention-e-attribution` | Snapshot e gestione del cambiamento lento | **Snapshot e slowly changing dimensions** | termine di settore · ⚠ URL |
| 6 | `materialization-incremental-e-snapshot` | Materialization, incremental e snapshot per eventi e stato cliente | **Materializzazioni in dbt: view, table e incremental** | più corto: 66 → 51, gli snapshot sono nella lezione 5 |
| 7 | `test-data-quality-e-contratti-dati` | Semantic layer e metric definitions | **Semantic layer e definizioni delle metriche** | lingua · ⚠ URL |
| 8 | `seed-macro-e-package-riusabili` | Git workflow, code review e collaborazione tecnica | **Git workflow e code review per progetti dbt** | più concreto · ⚠ URL |
| 9 | `documentazione-lineage-exposures-e-governance` | Environments, deployment e release discipline | **Ambienti, deploy e disciplina di rilascio** | lingua · ⚠ URL |
| 10 | `semantic-layer-e-metriche-riusabili` | Performance e cost management nelle trasformazioni | **Performance e costi delle trasformazioni dbt** | lingua · ⚠ URL |
| 11 | `deploy-orchestrazione-e-ci-cd-dbt` | Reverse ETL e activation layer | **Reverse ETL e activation layer con dbt** | distinto da analisi-marketing · ⚠ URL |
| 12 | `cheat-sheet` | Cheat Sheet - Analytics Engineering con dbt | **Cheat sheet: analytics engineering con dbt** | formato unico "Cheat sheet: <tema>" |
| 13 | `caso-studio` | 'Progetto finale: un mini analytics stack completo' | **Progetto: un mini analytics stack completo** | apici visibili nel titolo, formato "Progetto:" |

### 17 · Significatività statistica e A/B test

`significativita-statistica` · 10 lezioni · 6 titoli da cambiare

| # | File | Attuale | Proposto | Motivo |
|---|---|---|---|---|
| 1 | `fondamenti-della-significativita-statistica` | Fondamenti della significativita statistica | **Fondamenti della significatività statistica** | accento |
| 2 | `ipotesi-business-e-domande-sperimentali` | Domande causali e ipotesi business ben formulate | **Domande causali e ipotesi di business ben formulate** | grammatica |
| 3 | `disegno-esperimentale-randomizzazione-e-metriche` | Disegno sperimentale, randomizzazione e unità di analisi | _(invariato)_ |  |
| 4 | `aa-test-e-affidabilita-del-sistema` | A/A test e validazione del sistema di misura | _(invariato)_ |  |
| 5 | `ab-test-dalla-variante-alla-decisione` | Flusso completo di un A/B test professionale | **Il flusso completo di un A/B test** | "professionale" non aggiunge informazione |
| 6 | `p-value-errori-e-interpretazione-corretta` | P-value, errori e interpretazione corretta | _(invariato)_ |  |
| 7 | `sample-size-potenza-mde-e-durata` | CUPED e variance reduction | **CUPED e riduzione della varianza** | lingua · ⚠ URL |
| 8 | `peeking-multiple-testing-e-governance` | Peeking, multiple testing e sequential testing | _(invariato)_ |  |
| 9 | `caso-studio` | Bayesian A/B, switchback test e geo-test | **Oltre l'A/B classico: bayesiano, switchback e geo-test** | non è un caso studio: spiega quando l'A/B classico non basta · ⚠ URL |
| 10 | `cheat-sheet` | Governance sperimentale + caso studio end-to-end | **Governance della sperimentazione** | il "+ caso studio end-to-end" non c'è nella lezione · ⚠ URL |

### 18 · Direzioni dell'analitica: ruoli e carriera

`direzioni-analitica` · 14 lezioni · 10 titoli da cambiare

| # | File | Attuale | Proposto | Motivo |
|---|---|---|---|---|
| 1 | `indice-direzioni-analitica` | Mappa dei ruoli in analitica moderna | **Mappa dei ruoli nell'analitica moderna** | grammatica |
| 2 | `classificazione-delle-direzioni-in-analitica` | Operating model del marketing analytics | **Operating model della marketing analytics** | genere coerente ("la product analytics") · ⚠ URL |
| 3 | `marketing-analytics-fondamenti-operativi` | Finance analytics, FP&A e controllo economico | **Finance analytics, FP&A e controllo di gestione** | termine italiano standard · ⚠ URL |
| 4 | `strumenti-pratici-per-analisti-moderni` | Operating model del product analytics | **Operating model della product analytics** | genere coerente · ⚠ URL |
| 5 | `unit-economics-cac-ltv-e-marginalita` | Unit economics, CAC, LTV e marginalità | _(invariato)_ |  |
| 6 | `marketing-analytics-canali-funnel-e-roi` | 'KPI trees per funzione: differenze e intersezioni' | **KPI tree per funzione: differenze e intersezioni** | apici visibili nel titolo, plurale inglese · ⚠ URL |
| 7 | `product-analytics-e-ab-testing` | Product analytics e A/B testing | **A/B test nel lavoro del product analyst** | angolo del modulo, distinto dal modulo 17 |
| 8 | `introduzione-alla-product-analytics` | Forecasting e planning cycles aziendali | **Forecasting e cicli di pianificazione** | lingua · ⚠ URL |
| 9 | `controllo-di-gestione-e-finanza-manageriale` | Hiring rubric, skill ladder e seniority | _(invariato)_ | ⚠ URL |
| 11 | `metriche-prodotto-dau-mau-retention-e-stickiness` | Storytelling per executive e board | _(invariato)_ | ⚠ URL |
| 12 | `coorti-retention-e-ciclo-di-vita` | Budget decisions e allocazione di portafoglio | **Allocare il budget: decisioni di portafoglio** | lingua · ⚠ URL |
| 13 | `financial-analytics-kpi-ebitda-e-cash-flow` | Stakeholder conflict management | **Gestire i conflitti tra stakeholder** | lingua · ⚠ URL |
| 14 | `caso-studio` | Come scegliere specializzazione, portfolio e capstone | _(invariato)_ |  |
| 15 | `cheat-sheet` | Cheat Sheet — Direzioni Analitica | **Cheat sheet: ruoli e direzioni dell'analitica** | formato unico "Cheat sheet: <tema>", H1 diverso |

### 19 · Fondamenti filosofici dell'analisi dei dati

`filosofia-analisi-dati` · 20 lezioni · 5 titoli da cambiare

| # | File | Attuale | Proposto | Motivo |
|---|---|---|---|---|
| 0 | `indice-filosofia-analisi-dati` | Indice — Fondamenti filosofici dell'analisi dei dati | **Mappa del modulo: filosofia per l'analisi dei dati** | H1 diverso, formato "Indice —" |
| 1 | `perche-l-analisi-dati-ha-una-storia-filosofica` | Che cosa conta come evidenza | _(invariato)_ | ⚠ URL |
| 2 | `aristotele-e-le-quattro-cause` | Aristotele e le quattro cause | **Aristotele e le quattro cause di una metrica** | H1 diverso (76 caratteri), più concreto |
| 3 | `david-hume-esperienza-abitudine-mentale-e-scetticismo` | David Hume: esperienza, abitudine mentale e scetticismo | _(invariato)_ |  |
| 4 | `francis-bacon-induzione-e-idoli-della-mente` | Francis Bacon: induzione e idoli della mente | _(invariato)_ |  |
| 5 | `immanuel-kant-causalita-come-categoria-dell-intelletto` | Immanuel Kant: causalità come categoria dell'intelletto | _(invariato)_ |  |
| 6 | `karl-popper-falsificabilita-e-sperimentazione` | Karl Popper: falsificabilità e sperimentazione | _(invariato)_ |  |
| 7 | `thomas-kuhn-paradigmi-e-data-culture` | Thomas Kuhn: paradigmi scientifici e cultura del dato | _(invariato)_ |  |
| 8 | `judea-pearl-dag-e-rivoluzione-causale` | Judea Pearl, DAG e rivoluzione causale | **Judea Pearl: DAG e rivoluzione causale** | formato "Autore: tema" come le altre |
| 9 | `frequentismo-vs-bayesianismo` | Frequentismo vs bayesianismo: due modi di leggere l'incertezza | **Frequentisti e bayesiani: due letture dell'incertezza** | più corto: 61 → 52 |
| 10 | `epistemologia-dei-dati` | Epistemologia dei dati: cosa puoi davvero sapere | _(invariato)_ |  |
| 11 | `etica-algoritmi-e-responsabilita-analitica` | Etica degli algoritmi e responsabilità analitica | _(invariato)_ |  |
| 12 | `causalita-causa-ed-effetto-nell-analisi-dei-dati` | Correlazione, causalità e controfattuali | _(invariato)_ |  |
| 13 | `causalita-regressioni-e-inferenza-statistica` | Modelli, assunzioni e misspecification | _(invariato)_ |  |
| 14 | `cause-multiple-condizioni-necessarie-e-sufficienti` | Measurement theory: cosa significa misurare bene | _(invariato)_ | ⚠ URL |
| 15 | `simpson-paradox-e-confounding` | Simpson's paradox e confounding | **Paradosso di Simpson e confounding** | H1 diverso, lingua |
| 17 | `filosofia-della-scienza-spiegazione-scientifica-e-responsabilita` | Metodo scientifico applicato al lavoro sui dati | _(invariato)_ |  |
| 18 | `determinismo-contingenza-probabilita-e-previsione` | Incertezza, rischio e ignoranza | _(invariato)_ | ⚠ URL |
| 19 | `dalla-causalita-classica-al-futuro-dell-analisi-dati` | Dalla causalità classica al futuro dell'analisi dati | _(invariato)_ |  |
| 20 | `caso-studio-pensiero-filosofico-e-business-decision` | Caso studio: pensiero filosofico e decisione di business | _(invariato)_ |  |

### 20 · AI assistita per il lavoro sui dati

`ai-data-workflows` · 10 lezioni · 3 titoli da cambiare

| # | File | Attuale | Proposto | Motivo |
|---|---|---|---|---|
| 1 | `ai-come-acceleratore-del-lavoro-sui-dati` | AI come acceleratore del lavoro sui dati | _(invariato)_ |  |
| 2 | `prompting-analitico-e-controllo-delle-domande` | Prompting analitico e controllo delle domande | _(invariato)_ |  |
| 3 | `analisi-esplorativa-assistita` | Analisi esplorativa assistita | **Analisi esplorativa assistita dall'AI** | assistita da cosa? ora è esplicito |
| 4 | `sql-notebook-e-data-storytelling-con-ai` | SQL, notebook e data storytelling con AI | _(invariato)_ |  |
| 5 | `data-cleaning-data-quality-e-feature-engineering` | Data cleaning, data quality e feature engineering | _(invariato)_ |  |
| 6 | `ai-per-data-engineering-mapping-e-documentazione` | AI per data engineering, mapping e documentazione | _(invariato)_ |  |
| 7 | `automl-per-classificazione-regressione-e-forecasting` | AutoML per classificazione, regressione e forecasting | _(invariato)_ |  |
| 8 | `valutazione-leakage-drift-metriche-e-limiti` | Valutazione: leakage, drift, metriche e limiti | _(invariato)_ |  |
| 9 | `caso-studio-workflow-ai-assisted-end-to-end` | Caso studio: workflow AI-assisted end-to-end | **Caso studio: un workflow end-to-end assistito dall'AI** | lingua |
| 10 | `cheat-sheet-ai-per-data-work` | Cheat sheet: AI per data work | **Cheat sheet: AI per il lavoro sui dati** | "data work" → come il titolo del modulo |

### 21 · Agentic AI per il lavoro sui dati

`agentic-ai-data-workflows` · 10 lezioni · 5 titoli da cambiare

| # | File | Attuale | Proposto | Motivo |
|---|---|---|---|---|
| 1 | `da-ai-assistita-ad-agentic-ai-per-data-work` | Da AI assistita ad agentic AI per data work | **Da AI assistita ad agentic AI nel lavoro sui dati** | "data work" → come il titolo del modulo |
| 2 | `tool-state-memory-handoff-e-guardrail` | Tool, state, memory, handoff e guardrail | **Tool, stato, memoria, handoff e guardrail** | H1 diverso, lingua |
| 3 | `agentic-data-analysis-con-controlli-umani` | Agentic data analysis con controlli umani | _(invariato)_ |  |
| 4 | `agentic-sql-e-semantic-layer-con-approval` | Agentic SQL e semantic layer con approval | **Agentic SQL e semantic layer con approvazione umana** | lingua |
| 5 | `agentic-data-engineering-pipeline-runbook-e-incidenti` | Agentic data engineering: pipeline, runbook e incidenti | _(invariato)_ |  |
| 6 | `agentic-automl-planning-training-review-e-deploy` | Agentic AutoML: planning, training, review e deploy | _(invariato)_ |  |
| 7 | `multi-agent-workflow-analyst-engineer-reviewer-owner` | Multi-agent workflow: analyst, engineer, reviewer, owner | _(invariato)_ |  |
| 8 | `observability-evals-sicurezza-e-cost-control` | Observability, evals, sicurezza e cost control | **Observability, eval, sicurezza e controllo dei costi** | lingua |
| 9 | `caso-studio-sistema-agentico-per-analytics-operations` | Caso studio: sistema agentico per analytics operations | _(invariato)_ |  |
| 10 | `cheat-sheet-agentic-ai-per-data-work` | Cheat sheet: agentic AI per data work | **Cheat sheet: agentic AI per il lavoro sui dati** | "data work" → come il titolo del modulo |

## Fuori da questo giro

Problemi strutturali emersi durante l'analisi. Non li tocco adesso: servono decisioni sul contenuto, non sui titoli.

### 1. URL che non corrispondono al contenuto (44 lezioni)

Lo script `scripts/apply-v2-curriculum.ts` ha riassegnato i titoli ai file in base all'ordine, e i contenuti sono stati riscritti per seguire i nuovi titoli. I nomi dei file sono rimasti quelli vecchi. Esempi: `metriche-fondamenti/cheat-sheet` è la lezione su correlazione e proxy metric; `kafka-streaming/kafka-operations` è Kafka Streams, mentre le operations sono in `kafka-ops`. Sistemarli vuol dire rinominare i file con redirect 301.

- `advanced-sql/aggregazioni-su-finestra`
- `advanced-sql/cheat-sheet`
- `advanced-sql/esercizi-guidati-window-functions`
- `advanced-sql/indice-window-functions`
- `advanced-sql/window-functions-avanzate`
- `analytics-engineering/dbt-e-ruolo-dell-analytics-engineer`
- `analytics-engineering/deploy-orchestrazione-e-ci-cd-dbt`
- `analytics-engineering/documentazione-lineage-exposures-e-governance`
- `analytics-engineering/marts-martech-funnel-retention-e-attribution`
- `analytics-engineering/seed-macro-e-package-riusabili`
- `analytics-engineering/semantic-layer-e-metriche-riusabili`
- `analytics-engineering/staging-e-standardizzazione-dei-dati-martech`
- `analytics-engineering/test-data-quality-e-contratti-dati`
- `direzioni-analitica/classificazione-delle-direzioni-in-analitica`
- `direzioni-analitica/controllo-di-gestione-e-finanza-manageriale`
- `direzioni-analitica/coorti-retention-e-ciclo-di-vita`
- `direzioni-analitica/financial-analytics-kpi-ebitda-e-cash-flow`
- `direzioni-analitica/introduzione-alla-product-analytics`
- `direzioni-analitica/marketing-analytics-canali-funnel-e-roi`
- `direzioni-analitica/marketing-analytics-fondamenti-operativi`
- `direzioni-analitica/metriche-prodotto-dau-mau-retention-e-stickiness`
- `direzioni-analitica/strumenti-pratici-per-analisti-moderni`
- `filosofia-analisi-dati/cause-multiple-condizioni-necessarie-e-sufficienti`
- `filosofia-analisi-dati/perche-l-analisi-dati-ha-una-storia-filosofica`
- `filosofia-analisi-dati/determinismo-contingenza-probabilita-e-previsione`
- `kafka-streaming/kafka-operations`
- `marketing-data-science/user-centricity`
- `matematica-analisi-dati/autovalori-svd-e-riduzione-dimensionale`
- `matematica-analisi-dati/cheat-sheet`
- `matematica-analisi-dati/funzioni-derivate-e-ottimizzazione`
- `matematica-analisi-dati/integrali-gradienti-e-funzioni-multivariate`
- `metriche-fondamenti/cheat-sheet`
- `metriche-fondamenti/generazione-idee`
- `metriche-fondamenti/inizio-successo`
- `metriche-fondamenti/ricerca-desk`
- `metriche-fondamenti/statistica-fondamenti`
- `panoramica/come-funziona-questo-corso`
- `panoramica/come-non-perdere-motivazione-nel-lungo-periodo`
- `panoramica/come-praticare-sui-dati-mentre-studi`
- `panoramica/come-ricordare-davvero-quello-che-impari`
- `real-time-analytics/clickhouse-ottimizzazione`
- `significativita-statistica/caso-studio`
- `significativita-statistica/cheat-sheet`
- `significativita-statistica/sample-size-potenza-mde-e-durata`

### 2. Argomenti promessi dai vecchi titoli che non esistono più

- `advanced-sql`: i vecchi titoli promettevano JSON e dati semi-strutturati, date-time e timezone, EXPLAIN e performance tuning, A/B analysis in SQL. Nessuna lezione li tratta.
- `significativita-statistica`: l'URL `sample-size-potenza-mde-e-durata` fa pensare a una lezione su sample size e potenza statistica, che invece parla di CUPED. Il calcolo del sample size compare solo in `analisi-prodotto/ab-testing`.
- `marketing-data-science`: il titolo del modulo prometteva forecasting, ma non c'è una lezione di forecasting (c'è in `direzioni-analitica`).

### 3. Argomenti ripetuti tra moduli

- **A/B test:** `analisi-prodotto/ab-testing`, l'intero modulo `significativita-statistica`, `direzioni-analitica/product-analytics-e-ab-testing`.
- **Coorti e retention:** `analisi-prodotto` (2 lezioni), `advanced-sql` (2 lezioni), `metriche-fondamenti/generazione-idee`, `marketing-data-science/retention`.
- **Attribuzione:** `analisi-marketing/modelli-attribuzione`, `marketing-data-science/attribution`, `advanced-sql/coorti-e-retention`.
- **Funnel e sessionizzazione:** 4 lezioni di `advanced-sql` si sovrappongono (frame/NTILE, sessionizzazione, funnel, LAG/LEAD).
- **NPS e PMF:** sia in `analisi-prodotto` sia in `marketing-data-science`.
- **Unit economics:** `analisi-marketing`, `marketing-data-science`, `direzioni-analitica`.
- **Altri doppioni:** JTBD (`data-collection`, `gestione-data-driven`), HADI (`gestione-data-driven`, `marketing-data-science`), reverse ETL (`analisi-marketing`, `analytics-engineering`), ClickHouse (`data-warehousing`, `real-time-analytics`), storytelling (`dashboard-visualizzazione`, `direzioni-analitica`).

### 4. Altri dettagli

- Il campo `headerImageAlt` di molte lezioni descrive ancora il vecchio titolo (es. "Cheat Sheet - Window Functions per Analytics").
- I `coreLessons` in `src/data/course-program.ts` non corrispondono più alle lezioni reali. In questo giro li allineo ai nuovi titoli, perché `apply-v2-curriculum.ts` li usa come fonte.
- Buchi nella numerazione `order` (es. `filosofia-analisi-dati` salta il 16, `direzioni-analitica` il 10, `panoramica` parte da 2). Non si vedono nel sito.
- `CLAUDE.md` dice che i moduli sono 15: sono 21.

