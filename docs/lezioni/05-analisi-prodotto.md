# Modulo 5 · Product analytics e diagnosi della crescita (analisi-prodotto)

> Ristrutturato il 2026-11-27 nel formato `didattica-v2` (profilo `analytical`). Design: `modulo-5-product-analytics-design.md` (spec condivisa del coordinatore); standard: `docs/superpowers/specs/2026-11-17-standard-didattico-v2-236-lezioni-design.md`. Questa scheda sostituisce quella della versione «3 secondi».

## Obiettivo

Chi legge il modulo dall'inizio alla fine deve poter lavorare come product analyst e rispondere alle domande tipiche del mestiere e dei colloqui: metriche, tracking, funnel, attivazione, retention, engagement, monetization, ricerca utenti, esperimenti, inferenza causale, diagnosi, strumenti, comunicazione.

## Lezioni (ordine del modulo)

Le 11 lezioni esistenti sono state riscritte da zero con gli stessi slug (URL invariati); 12 sono nuove. Totale: 23 lezioni, e il corso passa da 236 a 248 lezioni core.

| # | File | Titolo | Stato |
|---|---|---|---|
| 1 | `introduzione-product-analytics` | Introduzione alla product analytics: il mestiere del product analyst | riscritta |
| 2 | `north-star-metric-tree` | North Star Metric e metric tree: dalla strategia alle metriche di team | nuova |
| 3 | `tracking-plan-event-model` | Tracking plan e modello a eventi: dati di prodotto di cui fidarsi | nuova |
| 4 | `funnel-analysis` | Funnel analysis: ordine dei passi, finestra e segmenti | nuova |
| 5 | `onboarding-attivazione` | Onboarding e attivazione: trovare l'evento che predice la retention | nuova |
| 6 | `retention-framework` | Misurare la retention: definizioni, curve di coorte e churn | riscritta |
| 7 | `analisi-coorte` | Coorti comportamentali, growth accounting e matrici di transizione | riscritta |
| 8 | `engagement-metriche` | Metriche di engagement: DAU/MAU, power user curve e adozione delle funzionalità | nuova |
| 9 | `monetization-analytics` | Monetization analytics: ARPU, MRR, NRR, LTV e CAC payback | nuova |
| 10 | `product-market-fit` | Misurare il Product-Market Fit | riscritta |
| 11 | `customer-development` | Customer development per product analytics | riscritta |
| 12 | `ux-research` | UX research e dati comportamentali | riscritta |
| 13 | `nps-net-promoter-score` | NPS, CSAT e CES: misurare la soddisfazione | riscritta |
| 14 | `ab-testing` | A/B test di prodotto: dal disegno alla decisione | riscritta |
| 15 | `esperimenti-avanzati` | Esperimenti avanzati: varianza, interferenza e test sequenziali | nuova |
| 16 | `inferenza-causale-osservazionale` | Inferenza causale senza esperimento: DiD, synthetic control, RDD e propensity score | nuova |
| 17 | `diagnosi-calo-metrica` | Diagnosi di un calo di metrica: dal grafico rosso alla causa | nuova |
| 18 | `prioritizzazione-feature` | Prioritizzare le feature con i dati: RICE, Kano, Cost of Delay e opportunity sizing | riscritta |
| 19 | `strumenti-product-analytics` | Gli strumenti del product analyst: Amplitude, Mixpanel, PostHog, GA4 e warehouse | nuova |
| 20 | `comunicare-insight` | Comunicare un insight: dal brief alla raccomandazione | nuova |
| 21 | `colloquio-product-analyst` | Il colloquio da product analyst: domande tipiche e risposte modello | nuova |
| 22 | `caso-studio` | Caso studio: diagnosi completa di un prodotto | riscritta |
| 23 | `cheat-sheet` | Cheat sheet di product analytics: formule, soglie e checklist del modulo | riscritta |

Sei sessioni hanno scritto le lezioni in parallelo (blocchi 1–3, 4–6, 7–9, 10–13, 14–16, 17–23 escluso il caso studio). La sessione di integrazione ha unito i branch, riscritto `caso-studio` e fatto la revisione di coerenza.

## Schema dati comune

Tutte le query del modulo usano lo stesso schema (Postgres/DuckDB; le differenze con BigQuery sono indicate nei commenti):

- `events(user_id, event_name, event_time, properties)`
- `users(user_id, signup_time, channel, country, platform)`
- `subscriptions(subscription_id, user_id, plan, mrr, start_date, end_date)`: una riga per periodo di piano, `end_date` NULL se attivo
- `survey_responses(user_id, survey, score, responded_at)`
- `assignments(experiment_id, user_id, variant, assigned_at)`
- `raw_events(...)` e `identity_map(...)` solo in `tracking-plan-event-model`, per la parte di pulizia; `orders(order_id, user_id, created_at, amount)` solo in `strumenti-product-analytics`, come esempio di fonte transazionale

Armonizzazione fatta in integrazione: `subscriptions` dichiarata con `subscription_id` in `nps-net-promoter-score`, `product-market-fit` e `prioritizzazione-feature`; in `prioritizzazione-feature` `started_at`/`ended_at` sono diventati `start_date`/`end_date`.

## Caso studio (lezione 22)

Scenario costruito, dichiarato nel testo: Agenda Pro, SaaS di prenotazioni per piccoli studi. Il percorso usa tutto il modulo: North Star e metric tree → verifica del tracking (duplicati iOS, +12% che diventa +6%) → scomposizione logaritmica del nuovo MRR (iscritti × conversione × ARPA) e controllo dell'effetto mix → funnel di attivazione ordinato (passo «profilo → pagina pubblicata» da 63,4% a 37,0%) → controlli su retention, NRR ed engagement → session replay, interviste e difference-in-differences web/app (−14 punti) → opportunity sizing e confronto delle opzioni → A/B test (campione 471 per braccio, SRM, +10,5 punti, IC 95% +5,3/+15,7, guardrail) → memo.

Verifiche: la query del funnel è stata eseguita con DuckDB su un dataset sintetico costruito con i conteggi del caso (3.500/2.870/1.820/1.295 e 3.710/3.005/1.113/816, più eventi fuori ordine e fuori finestra) e restituisce esattamente le percentuali della tabella. Il blocco Python è stato eseguito e il suo output è riportato nella lezione.

## Link interni e prerequisiti

- Aggiunti i rimandi segnalati dai blocchi (per esempio introduzione → funnel, diagnosi, A/B test, inferenza causale; retention → coorti, PMF, A/B test, inferenza causale, engagement). Il `cheat-sheet` rimanda a tutte le altre 22 lezioni; il `caso-studio` alle lezioni usate in ogni passo.
- `prerequisites` puntano solo a lezioni precedenti nel nuovo ordine. Modifiche in integrazione: `funnel-analysis` (+ `tracking-plan-event-model`), `customer-development` (→ `product-market-fit`), `strumenti-product-analytics` (→ `tracking-plan-event-model`), `comunicare-insight` (→ `ab-testing`, `diagnosi-calo-metrica`), `ab-testing` (+ `north-star-metric-tree`), `caso-studio` (→ `diagnosi-calo-metrica`, `ab-testing`, `comunicare-insight`).

## Revisione di coerenza

- `cheat-sheet`: LTV e CAC payback con ARPA, come in `monetization-analytics`; conversione free → paid con gli iscritti della coorte al denominatore; intervallo di Wilson per il test di Sean Ellis, come in `product-market-fit`.
- `analisi-coorte`: il nome «quick ratio» è attribuito a Mamoon Hamid, come scrive lo stesso Jonathan Hsu nell'articolo citato (verificato: Hsu, «Diligence at Social Capital, Part 1», 2015; i valori «poco sopra 1» e «1,5–2 molto buono per un consumer» sono nel testo).
- Nomi delle metriche (tasso di attivazione, MRR, NRR, ARPU/ARPA, SRM, MDE, guardrail, stickiness) già coerenti tra le lezioni; nessun aneddoto famoso raccontato per intero in più di una lezione.

## Fatti e fonti

- Ogni lezione dichiara «scenario costruito» o «numeri di esempio» dove i numeri non sono reali.
- Verificati in integrazione: Andrew Chen e Li Jin, «The Power User Curve» (a16z, 2018), con il nome L30 attribuito al growth team di Facebook (`engagement-metriche`); Jonathan Hsu sul quick ratio (`analisi-coorte`).
- Citati con fonte nelle lezioni e non ricontrollati in integrazione: Kohavi e i titoli di Bing (`ab-testing`), Sean Ellis a Dropbox ed Eventbrite (`product-market-fit`).
- I fatti «da verificare» della scheda precedente (Netflix 2012, Revolut, Strava, FitTrack) non compaiono più nelle lezioni riscritte. Facebook e i «7 amici in 10 giorni» resta in `onboarding-attivazione`, presentato con i suoi limiti causali.

## Traduzione inglese

Non più applicabile. Dalla fase 1 SEO (`docs/seo/i18n.md`) le pagine `/en/course/*` non esistono: rispondono 301 verso l'italiano e `src/data/i18n/en-static-cache.json` è stato rimosso dal repository. Una versione inglese del modulo richiederebbe un nuovo flusso di traduzione rivista, fuori dallo scopo di questa ristrutturazione.

## File condivisi aggiornati

- `src/data/course-program.ts`: 23 `coreLessons` del modulo nell'ordine nuovo; descrizione e `seoDescription` del modulo.
- `scripts/validation.ts` e `src/lib/entry-body.test.ts`: totale lezioni core da 236 a 248.
- `src/content/corso/learning-path.mdx` e `src/content/corso/panoramica/mappe-concettuali.mdx`: 248 lezioni; nell'esempio di stima dei tempi il modulo 5 conta 23 lezioni (53 lezioni, 26,5 ore, 6 settimane a 5 ore, 9 a 3 ore).
- `src/lib/config/sidebar-sections.mjs`: sezione «Analisi di Prodotto» con le 23 lezioni.
- `src/data/glossary/lesson-links.ts`: termini collegati alle lezioni nuove (north-star-metric, funnel-analysis, conversion-rate, tracking-plan, onboarding, activation-rate, time-to-value, cohort-analysis, dau-mau-ratio, mrr, arpu, ltv, cac).
- `src/lib/course-editorial.ts`: promessa del modulo.
- `docs/titoli-corso.md`: sezione del modulo 5 con i titoli in uso.
- `public/llms-full.txt`: rigenerato dalla build.
