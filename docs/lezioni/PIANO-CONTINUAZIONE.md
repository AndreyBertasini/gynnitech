# Piano di continuazione — riscrittura dei 21 moduli nel formato «3 secondi»

Aggiornato il 2026-10-16. Documento di passaggio: chi continua (anche in una sessione cloud) legge questo file, `docs/superpowers/specs/2026-10-15-lezioni-3-secondi-design.md` (§12a prevale) e `docs/lezioni/prompt-3-secondi.md`.

## 1. Richiesta e decisioni dell'autore

Richiesta permanente: **riscrivere tutte le lezioni di tutti i 21 moduli** nel formato «da capire in 3 secondi»: italiano semplice, frasi di 5–10 parole, «noi», presente; figure dentro la pagina; schemi che mostrano ogni passo insieme; riquadri ★ (`<Messaggio>`); una domanda per sezione; quiz finale di 5 domande; accento lime `#ccff00`; Verdana solo dentro schemi e schede.

Correzioni dell'autore, valide per tutte le lezioni:

- niente riquadri «Cosa imparerai» e «Collegamenti» in testa;
- via le etichette «Percorso collegato» e «Collegamento tematico», ma i link restano;
- le grafiche sono parte della pagina (non slide 16:9 separate) e non c'è nulla da cliccare;
- ogni grafica ha accanto una spiegazione scritta con voce umana e un `<Pattern si no />` (pattern / anti-pattern).

Altre decisioni:

- **la traduzione inglese la fa Claude**, lezione per lezione, in `src/data/i18n/en-static-cache.json`;
- niente approvazione del piano per ogni modulo: rimozioni e fatti da verificare vanno nella scheda `docs/lezioni/NN-modulo.md`;
- **gli URL non cambiano** (778 pagine identiche);
- **un branch e una PR per modulo, impilati** (ogni PR ha come base il branch del modulo precedente).

## 2. Stato dei branch e delle PR

| Modulo | Branch | PR | Base | Stato |
|---|---|---|---|---|
| fase 0 (componenti, validatore, pilota) | `claude/lezioni-3-secondi` | #103 | `claude/analizza-corsi-structure-f4afab` | unita |
| 1 panoramica | `claude/lezioni-m01-panoramica` | #104 | `claude/lezioni-3-secondi` | aperta |
| 2 data-collection | `claude/lezioni-m02-data-collection` | #105 | m01 | aperta |
| 3 metriche-fondamenti | `claude/lezioni-m03-metriche-fondamenti` | #106 | m02 | aperta |
| 4 gestione-data-driven | `claude/lezioni-m04-gestione-data-driven` | #107 | m03 | aperta |
| 5 analisi-prodotto | `claude/lezioni-m05-analisi-prodotto` | #108 | m04 | aperta |
| 6 analisi-marketing | `claude/lezioni-m06-analisi-marketing` | bozza (vedi sotto) | m05 | **incompleto** |
| 12 real-time-analytics | (solo pilota `clickhouse-fondamenti`, in #103) | | | 8 lezioni da fare |

Il branch `claude/analizza-corsi-structure-f4afab` (PR #102, titoli chiari) è la base di tutto: va unito in `main` prima della catena, oppure la catena si rebasa dopo.

### Commenti di revisione ancora da trattare (automatici, Codex)

Sono arrivati sulle PR #104–#108 mentre la sessione lavorava. Vanno corretti **sul branch del modulo** e poi rimessi in cascata (rebase dei branch successivi). Ogni commento ha un `comment_id`: dopo la correzione, rispondere in thread con `gh api repos/AndreyBertasini/gynnitech/pulls/<PR>/comments/<id>/replies` e chiudere il thread.

- **#104 (m01)** — `public/llms-full.txt` non rigenerato dopo la riscrittura di `panoramica/come-funziona-questo-corso.mdx`: lanciare `npm run llms:full` e committare (comment 4285260320).
- **#105 (m02)**, `data-collection/privacy.mdx`:
  - riga ~102: non richiedere «zero righe» subito nei backup; l'EDPB ammette backup con cancellazione al ciclo di retention, serve evitare la reintroduzione dei dati al restore (4285410961);
  - riga ~118: la retention non è «90 giorni» per legge, va derivata dallo scopo; presentare 90 giorni solo come ipotesi (4285410972).
- **#106 (m03)**:
  - `inizio-successo.mdx` ~36: le stringhe di `learningObjectives` ora visibili tramite `<Obiettivi />` non sono nella cache EN; tradurle (4285483879);
  - `inizio-successo.mdx` ~91: domanda invertita, deve essere «A quanti driver colleghiamo ogni iniziativa?» (4285483884);
  - `generazione-idee.mdx` ~82: togliere la coorte del primo acquisto dalla risposta sul confronto tra campagne, a meno che sia incrociata con la campagna (4285483891).
- **#107 (m04)**:
  - `ricerca-quantitativa.mdx` ~147: Nielsen riguarda test di usabilità, non interviste; presentare 5–8 interviste come euristica (4285566072);
  - `ricerca-quantitativa.mdx` ~166: non dedurre il «movimento» dei segmenti da una sola istantanea; aggiungere le basi o descrivere solo la differenza di livello (4285566077);
  - `framework-jtbd.mdx` ~194: la sequenza Superhuman è invertita rispetto a `marketing-data-science/pmf.mdx` (22% → segmentazione e onboarding → 58%) (4285566086).
- **#108 (m05)**:
  - `ux-research.mdx` ~54: il funnel va calcolato con l'ordine degli eventi (coorte iniziale, ogni passo solo dopo il precedente), altrimenti conversioni sopra il 100% (4285685916);
  - `caso-studio.mdx` ~119: la query non produce più il 54%→42% citato; reinserire gli stadi intermedi o calcolare le conversioni passo per passo (4285685928).

Questa classe di errore (affermazioni non verificate nelle lezioni) è la ragione per cui ogni scheda elenca i «fatti da verificare»: i nuovi moduli devono evitare di aggiungerne.

## 3. Modulo 6 · Analisi marketing — stato

Branch `claude/lezioni-m06-analisi-marketing`, due commit sopra m05:

1. `feat(corso): modulo 6 …` — 22 lezioni in italiano, `validate:3s` 0 errori, 1139 test ok.
2. `i18n(en): modulo 6, traduzioni parziali` — stringhe 0–2289 su 2792 già nella cache.

**Manca:**

- tradurre le ultime 503 stringhe: rifare `rebuild-dump.sh` (rigenera `intro.json`; quelle già in cache non compaiono più), tradurre il resto, `verify-en.sh` fino a 0 scoperte e 778 URL;
- generare la scheda `docs/lezioni/06-analisi-marketing.md` (tabella con `card-table.mjs`);
- togliere il «bozza» dalla PR.

Lezioni del modulo, in ordine: performance-marketing, modelli-attribuzione, customer-journey-mapping, mmm-incrementality, funnel-unit-economics, seo-content-analytics, crm-email-analytics, social-media-analytics, efficacia-brand, costruire-brand-forte, martech-dashboard-operativi, ga4-avanzato, server-side-tracking-gtm-server-capi, reverse-etl-sincronizzazione-audience, lifecycle-orchestration-multicanale, cdp-identity-resolution-audience-activation, b2b-martech-ops, gtm-datalayer-qa-tracking, analisi-end-to-end-utm, marketing-data-pipeline, caso-studio, cheat-sheet. L'ultima rimanda a `/course/dashboard-visualizzazione/data-visualization/`.

### Da scrivere nella scheda del modulo 6

**Correzioni rispetto agli originali**

- `crm-email-analytics`: campione per CTR 3,0% → 3,6% ≈ 13.900 invii per variante (l'originale diceva ~20.000);
- `mmm-incrementality`: tolta l'affermazione su Airbnb e SEM;
- `reverse-etl-sincronizzazione-audience`: tolti i numeri di finanziamento di Hightouch e Census (restano gli anni di fondazione);
- `caso-studio`: tolta la query SQL della retention (join sbagliato); payback coerente con un margine mensile assunto di ~350 €; P&G datato 2017 (~200 mln $, l'originale diceva gennaio 2017);
- `cheat-sheet`: tabella last click / data-driven riportata a totali uguali (ricerca generica 950 → 850);
- Uber, «2019» attribuito alla lezione originale (l'evento è probabilmente del 2017).

**Fatti da verificare** (tenuti come «secondo la lezione originale» o con cautela): migrazione ASOS, Wise ~18 mesi, Airbnb WAR micro-influencer, Zalando ROAS +18%/+7%, Bing +12%, Nike Dream Crazy +31% (Edison Trends), P&G ~140 mln $ (marketing-data… `modelli-attribuzione`) e ~200 mln $ (`caso-studio`), Meta ~10 mld $ (feb 2022), Spotify 602M/236M (Q4 2023), Adobe–Marketo 4,75 mld $ (2018), Netflix Gomez-Uribe & Hunt ~80%, Universal Analytics 1 lug 2023/2024, Urchin 2005, Baymard 49 studi ~70%, Amazon pubblicità 46,9 mld $ (2023). Confermato: eBay, Blake–Nosko–Tadelis, Econometrica 2015.

## 4. Moduli ancora da riscrivere

Ordine consigliato (ogni branch parte dal precedente). Lezioni = file `.mdx` del modulo.

| N | Modulo (`src/content/corso/…`) | Lezioni |
|---|---|---|
| 7 | `dashboard-visualizzazione` | 8 |
| 8 | `marketing-data-science` | 19 |
| 9 | `data-warehousing` | 7 |
| 10 | `s3-data-lake` | 12 |
| 11 | `kafka-streaming` | 9 |
| 12 | `real-time-analytics` | 9 (1 fatta: `clickhouse-fondamenti`) |
| 13 | `infrastructure-ops` | 7 |
| 14 | `advanced-sql` | 14 |
| 15 | `matematica-analisi-dati` | 10 |
| 16 | `analytics-engineering` | 13 |
| 17 | `significativita-statistica` | 10 |
| 18 | `direzioni-analitica` | 14 |
| 19 | `filosofia-analisi-dati` | 20 |
| 20 | `ai-data-workflows` | 10 |
| 21 | `agentic-ai-data-workflows` | 10 |

Totale ≈ 173 lezioni, più il completamento del modulo 6.

## 5. Flusso per ogni modulo

1. Branch dal modulo precedente: `claude/lezioni-mNN-<slug>`.
2. Per ogni lezione: `show.mjs <modulo> <slug>` e lettura dell'originale; scrivere il corpo in `bodies/mNN-<slug>.txt` (`@sezioni: A | B | …`, riga vuota, MDX). Struttura tipica: `<Percorso />`, `<Obiettivi />`, introduzione, 4–6 sezioni `## …` con una `<Slide>` o `<Schema>` ciascuna, `<Pattern>`/`<ErroreTipico>`, `<Messaggio>`, `<Domanda>`; `## Riepilogo` con 3 `<Messaggio>` e `QuizExercise` da 5 domande; ultima riga «Nella prossima lezione…» con link all'URL della lezione successiva (l'ultima del modulo punta alla prima del modulo seguente).
3. `compose-mod.sh <modulo> mNN <slug…>` → correggere gli errori di `npm run validate:3s` (limiti: slide ≤ 30 parole e titolo ≤ 6; schema da 3 a 6 `<Passo>`; dopo ogni schema un `<Messaggio>` e una `<Domanda>`; dopo ogni figura una spiegazione scritta e un `<Pattern>`).
4. `npx vitest run`, `npm run validate:content`, commit «feat(corso): modulo N … nel formato 3 secondi (K lezioni)».
5. EN: `rebuild-dump.sh` → `intro.json`; tradurre a blocchi di ~220 stringhe (`show-range.mjs`), scrivere `[[indice, "traduzione"], …]` e applicare con `write-en-pairs.mjs`; `verify-en.sh` fino a 0 scoperte e URL identici.
6. Scheda `docs/lezioni/NN-modulo.md` (cosa è stato tolto, correzioni, fatti da verificare), commit, push, PR con base il branch precedente.

### Regole di traduzione EN

- La cache è indicizzata dallo sha256 della stringa italiana esatta.
- Il grassetto «ml-tabellare» spezza la frase: «…Sul binario» → «…On the», e il frammento dopo → «track, …».
- I blocchi di codice sono stringhe a sé: tradurre solo i commenti e i messaggi stampati, tenere identificatori e a capo (`\n`).
- Le formule tra due frammenti lasciano frasi che iniziano con «.» o «,»: mantenere la punteggiatura iniziale.
- Le celle di tabella e i nomi di colonna sono stringhe a sé.

## 6. Trappole note

- **Bug del tsconfig nei worktree annidati**: la build può fallire con `TSCONFIG_ERROR`; costruire da una copia fuori dal worktree (`mirror.ps1`). Su un clone normale non serve.
- **Ogni build rigenera `public/llms-full.txt`** (3,8 MB, tracciato): rigenerarlo apposta con `npm run llms:full` quando serve (richiesto dal revisore), altrimenti annullare la modifica prima del commit.
- **CSS globale e CSS scoped**: in produzione `custom.css` arriva dopo gli stili della pagina; controllare con build + preview, non solo in dev.
- **EN**: le stringhe italiane nuove restano non tradotte su `/en/` se non sono nella cache; solo una build completa rigenera `dist/en`.
- **Heredoc di Git Bash** dimezzano i backslash: scrivere i file con regex tramite gli strumenti di scrittura.
- **Un tag per riga, solo attributi stringa** (`sezione="2"`): il convertitore per agenti legge l'MDX riga per riga.
- Rinominare una lezione o un modulo tocca anche `module:`, `alt`, descrizioni, `course-program`, llms, percorso di apprendimento, un test e la cache EN.
- Non inventare fatti: ciò che non è verificabile va tolto o attribuito («secondo la lezione originale») e annotato nella scheda.

## 7. Da fare alla fine

- revisione dell'intero branch e approvazione dello stile pilota da parte dell'autore;
- aggiornare i comandi `/scrivi-lezione`, `/naturalizza-lezione` e `/ginnytech` al nuovo stile;
- nota di memoria sul flusso (strumento di composizione, pipeline EN).
