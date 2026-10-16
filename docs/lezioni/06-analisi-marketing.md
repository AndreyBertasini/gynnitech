# Modulo 6 · Analisi marketing (analisi-marketing)

> Riscritto nel formato «3 secondi» (spec: `docs/superpowers/specs/2026-10-15-lezioni-3-secondi-design.md`, §12a). Questa scheda dice che cosa è cambiato e quali fatti vanno verificati. Per le lezioni di questo modulo non c'è stato un piano approvato lezione per lezione: l'autore ha chiesto di riscrivere tutti i moduli.

## Lezioni (ordine del modulo)

| # | File | Sezioni | Schemi | Quiz |
|---|---|---|---|---|
| 1 | `performance-marketing` | 4 | 2: Sei passi per analizzare le performance, La sequenza che parte dal valore | 5 |
| 2 | `modelli-attribuzione` | 5 | 2: Sei passi per impostare l'attribuzione, Come funziona l'effetto rimozione | 5 |
| 3 | `customer-journey-mapping` | 5 | 2: La sequenza di lavoro in sei passi, Quattro dimensioni che rivelano la causa | 5 |
| 4 | `mmm-incrementality` | 5 | 2: Sei passi per costruire un MMM, La fisica della risposta pubblicitaria | 5 |
| 5 | `funnel-unit-economics` | 6 | 3: Il protocollo in sei passi, Tre numeri, tre domande, Un test per ogni stadio | 5 |
| 6 | `seo-content-analytics` | 4 | 2: Sei passi per il canale organico, Tre controlli sul catalogo | 5 |
| 7 | `crm-email-analytics` | 6 | 3: Il protocollo in sei mosse, I tre pilastri della deliverability, Un test email solido | 5 |
| 8 | `social-media-analytics` | 5 | 2: Sei passi per misurare i social, Tre discipline per il paid | 5 |
| 9 | `efficacia-brand` | 6 | 2: Il protocollo in sei passi, Tre controlli su un lift | 5 |
| 10 | `costruire-brand-forte` | 6 | 2: Il sistema di misura in sei passi, Quattro pilastri, quattro domande | 5 |
| 11 | `martech-dashboard-operativi` | 6 | 2: Sei passi per una dashboard che decide, Tre destini per un alert | 5 |
| 12 | `ga4-avanzato` | 6 | 2: Tre pilastri della misura, Cinque cause strutturali di divergenza | 5 |
| 13 | `server-side-tracking-gtm-server-capi` | 5 | 2: Un evento add_to_cart, cinque stadi, Tre controlli prima di scalare | 5 |
| 14 | `reverse-etl-sincronizzazione-audience` | 5 | 2: Il contratto di una sync, Tre fasce di latenza | 5 |
| 15 | `lifecycle-orchestration-multicanale` | 6 | 3: Quattro stadi del motore, Tre famiglie di regole negative, Tre guasti tipici | 5 |
| 16 | `cdp-identity-resolution-audience-activation` | 6 | 2: Un ciclo chiuso in quattro fasi, Tre misure del valore dell'unificazione | 5 |
| 17 | `b2b-martech-ops` | 6 | 2: Quattro blocchi dello stack, Tre scelte per un'integrazione che regge | 5 |
| 18 | `gtm-datalayer-qa-tracking` | 6 | 2: Quattro regole del contratto, Dal browser al warehouse | 5 |
| 19 | `analisi-end-to-end-utm` | 6 | 2: La sequenza di lavoro in sei passi, Quattro tappe che possono perdere il dato | 5 |
| 20 | `marketing-data-pipeline` | 6 | 2: Dalle sorgenti all'attivazione, Tre livelli per accorgersi del guasto | 5 |
| 21 | `caso-studio` | 6 | 3: La sequenza di lavoro in sei passi, Tre stime indipendenti del lift, Il piano da votare | 5 |
| 22 | `cheat-sheet` | 6 | 2: Il protocollo in sei mosse, Lo stack in quattro strati | 5 |

Le ventidue lezioni non avevano un quiz: i 5 quesiti di ciascuna sono nuovi.

## Cosa è stato tolto o spostato

- I blocchi di codice passano da 52 a 27 nel modulo. Sono stati tenuti solo quelli che spiegano la decisione. Per lezione (originale → riscritta): `performance-marketing` SQL e Python tolti (2 → 0); `modelli-attribuzione` 5 → 1 (resta il Python; il diagramma Mermaid è stato tolto e l'effetto rimozione è spiegato dallo schema «Come funziona l'effetto rimozione»); `analisi-end-to-end-utm` 4 → 2; `ga4-avanzato` 4 → 2; `gtm-datalayer-qa-tracking` 4 → 2 (restano i due JavaScript); `marketing-data-pipeline` 4 → 2; `cheat-sheet` 4 → 2; `caso-studio` 3 → 2; `b2b-martech-ops`, `costruire-brand-forte`, `customer-journey-mapping`, `efficacia-brand`, `funnel-unit-economics`, `lifecycle-orchestration-multicanale`, `martech-dashboard-operativi`, `mmm-incrementality` 2 → 1. Invariati: `cdp-identity-resolution-audience-activation`, `crm-email-analytics` (2), `server-side-tracking-gtm-server-capi`, `social-media-analytics` (1); `reverse-etl-sincronizzazione-audience` e `seo-content-analytics` non ne avevano.
- Le tabelle di dati sono presentate con `<TabellaDati>` in 14 lezioni; `b2b-martech-ops`, `marketing-data-pipeline` e `martech-dashboard-operativi` non hanno più tabelle (da 1 a 0).
- I «Verdetto: …» finali (presenti in tutte le lezioni originali) sono stati assorbiti dalle frasi ★ del Riepilogo.
- Le frasi «Il binario di questa lezione è **ml-tabellare**…» restano come inciso nell'apertura; il campo `binario` nel frontmatter non cambia.
- Le lezioni originali del modulo non avevano i box «Cosa imparerai» e «Collegamenti» né le etichette «Percorso collegato» / «Collegamento tematico» nel testo: stavano nel template, già tolti nella fase 0 (#103).
- `cheat-sheet` rimanda a `/course/dashboard-visualizzazione/data-visualization/` come lezione successiva (primo modulo ancora da riscrivere).

## Correzioni rispetto agli originali

- `crm-email-analytics`: il campione per portare il CTR dal 3,0% al 3,6% è circa 13.900 invii per variante (l'originale diceva circa 20.000).
- `mmm-incrementality`: tolta l'affermazione su Airbnb e SEM.
- `reverse-etl-sincronizzazione-audience`: tolti i numeri di finanziamento di Hightouch e Census; restano gli anni di fondazione.
- `caso-studio`: tolta la query SQL della retention (join sbagliato); il payback è coerente con un margine mensile assunto di circa 350 €; P&G è datato 2017 (circa 200 milioni di dollari), mentre l'originale diceva gennaio 2017.
- `cheat-sheet`: la tabella last click / data-driven è riportata a totali uguali (ricerca generica 950 → 850).
- Uber: il «2019» è attribuito alla lezione originale; l'evento è probabilmente del 2017.

## Fatti da verificare con la fonte

Presentati come «secondo la lezione originale» o con cautela:

- Migrazione ASOS; Wise, circa 18 mesi; Airbnb e il WAR dei micro-influencer.
- Zalando, ROAS +18% / +7%; Bing, +12%.
- Nike «Dream Crazy», +31% (Edison Trends).
- P&G: circa 140 milioni di dollari (`modelli-attribuzione`) e circa 200 milioni (`caso-studio`).
- Meta, circa 10 miliardi di dollari (febbraio 2022).
- Spotify, 602M / 236M (Q4 2023).
- Adobe–Marketo, 4,75 miliardi di dollari (2018).
- Netflix, Gomez-Uribe e Hunt, circa 80%.
- Universal Analytics, 1 luglio 2023 / 2024; Urchin, 2005.
- Baymard, 49 studi, circa 70%.
- Amazon pubblicità, 46,9 miliardi di dollari (2023).

Confermati: eBay, Blake–Nosko–Tadelis, Econometrica 2015.

## Traduzione inglese

Tradotte a mano in `src/data/i18n/en-static-cache.json`: le stringhe 0-2289 del modulo (sessione precedente) e altre 603 in questa (le ultime del modulo 6 e quelle cambiate dalle correzioni di revisione dei moduli 2-5). Dopo la build completa: 0 stringhe introdotte e scoperte rispetto al branch base (modulo 5), URL invariati (778 pagine), audit del sito superato.
