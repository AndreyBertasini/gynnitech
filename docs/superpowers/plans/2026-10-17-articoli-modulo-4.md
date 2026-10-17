# Modulo 4 come «articolo» Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Riscrivere le 7 lezioni «articolo» del modulo 4 (Gestione data-driven) con il prompt dell'autore adattato a un modulo senza codice, con un controllo automatico del formato e ogni fatto pubblico verificato su una fonte.

**Architecture:** Si riusa `formato: "articolo"` (PR #112). Un flag di frontmatter `senzaCodice: true` cambia due regole del validatore: al posto dei blocchi `sql` (R4) le sezioni 3 e 4 mostrano un «documento» sbagliato e uno giusto, cioè una tabella Markdown o una citazione di almeno 3 righe; nessun blocco di codice nella lezione (R12). Niente runner: i numeri sono (a) fatti pubblici con link a una fonte trovata con una ricerca, (b) aritmetica del caso dichiarato, calcolata con Python e registrata nella scheda, (c) dichiarati esempio.

**Tech Stack:** Astro 5 + Starlight + MDX, TypeScript, vitest, Python 3 (solo per l'aritmetica), WebSearch / agente `web-fetch` per le fonti.

**Spec:** `docs/lezioni/prompt-articolo-tecnico.md` (prompt dell'autore, verbatim) con gli adattamenti qui sotto. Piano precedente di riferimento: `docs/superpowers/plans/2026-10-16-articoli-clickhouse.md`.

## Decisioni prese (risposte dell'utente il 2026-10-17)

- **Formato:** articolo adattato (non prosa narrativa, non crew `/ginnytech`).
- **Ambito (7):** `cultura-data-driven`, `decision-making-dati`, `okr-e-kpi`, `framework-jtbd`, `ricerca-quantitativa`, `interviste-profondita`, `ciclo-deming-hadi`. **Fuori:** `cheat-sheet` e `caso-studio` (scheda e progetto, non articoli): restano «3 secondi»; si toccano solo per correggere un fatto sbagliato emerso dalla verifica.
- Le 7 lezioni perdono il formato «3 secondi» (PR #110, 2026-10-16), come `clickhouse-fondamenti`.
- **Esecuzione e merge:** l'utente ha chiesto la riscrittura; si esegue in sessione. **Nessun merge in main senza un OK esplicito**: la PR resta aperta.
- **Invariati:** URL, `title`, `order`, `prerequisites`, immagini, `binario`, `category: Decisione`, autori.

## Adattamento del prompt a un modulo senza codice

| Il prompt dice | Nel modulo 4 |
|---|---|
| «Un ingegnere che l'ha rotta in produzione» | Resta una voce, non una biografia: niente aneddoti in prima persona inventati. Chi scrive ha visto fallire il processo, non lo racconta come proprio. |
| «Ogni blocco di codice eseguibile; prima lo schema sbagliato, poi quello giusto» | Sezione 3: il documento sbagliato come si trova nel 90% delle aziende (tabella o citazione). Sezione 4: lo stesso documento riscritto per intero. Mai foo/bar: campi, nomi e cifre plausibili. |
| «Un numero preciso» in apertura | Caso pubblico con link a una fonte trovata con una ricerca, oppure caso dichiarato «caso ricostruito» / «numeri di esempio». |
| «Numeri inventati presentati come misure» vietati | Un numero è (a) di una fonte linkata, (b) aritmetica del caso dichiarato, verificata con Python, (c) dichiarato esempio. Mai altro. |
| «Dai l'ordine di grandezza del miglioramento» | In un caso ricostruito è un obiettivo dichiarato come tale («da 4 decisioni su 31 a quasi tutte»), mai una misura. |

## Global Constraints

- Branch `claude/great-hawking-e54n7i` (riallineato a `main` = `de63e3f`). Un commit per task; push e PR nel Task 9; **niente merge senza OK**.
- I commit chiudono con le righe di attribuzione della sessione. Scrivere in italiano; nel corpo **voi**, mai tu.
- Struttura: 6 H2 (caso concreto · meccanismo · errore tipico · soluzione · caso difficile · checklist), titoli descrittivi; il corpo conserva l'H1. 1.300–1.900 parole di prosa (tabelle e citazioni contano come prosa); ultimo passaggio: togliere il 10%.
- Frasi vietate: «in questo articolo vedremo», «nel mondo di oggi», «sempre più», «approfondiamo», «in conclusione», «è importante sottolineare», «scopriamo insieme», «non è altro che», «negli ultimi anni». Niente `!`, emoji, superlativi, riassunto finale. Frasi cuscinetto rifiutate dalla rubrica: «non sono un esperto», «potrei sbagliarmi», «in generale si può dire».
- **Varietà tra gli articoli** (rilievo della revisione di #112): una sola volta per articolo «Sembra ragionevole», niente «Tre cose, in questa sequenza». Restano uguali le tappe imposte dal prompt («I criteri, in ordine di priorità», «Il criterio:», «La confusione comune è», «Questo articolo non copre», «Prima di andare in produzione»). Mai tre aggettivi o tre esempi di fila.
- **Fonti:** un link nell'articolo è un URL restituito da una ricerca o da una pagina letta; mai costruito a memoria. Un fatto vale se due fonti indipendenti concordano; altrimenti si qualifica («secondo…») o si toglie. Le fonti secondarie si dichiarano tali nella scheda. Non si attribuisce a un'azienda una causa interna che nessuna fonte documenta.
- Gotcha MDX: nella prosa `<`, `{` e `$` vanno scritti a parole (`$` attiva KaTeX, `<` apre un tag). Nessun componente 3s, nessun `QuizExercise`, nessun blocco ```` ``` ````. Tabelle: una riga di intestazione e il separatore `| --- |`.
- Il test `tests/theoretical-lessons-cleanliness.test.ts` vieta i blocchi di codice nelle lezioni teoriche; `category: Decisione` non è nell'elenco, ma R12 tiene comunque le lezioni senza codice. Non cambiare `category`.
- `public/llms-full.txt` si rigenera a ogni build: va committato con l'ultima build (Task 9).

## Regole (Task 1)

| # | Cambia | Livello |
|---|---|---|
| R4 | Con `senzaCodice: true`: sezione 3 = esattamente 3 `###` e un documento; sezione 4 = un documento. «Documento» = tabella Markdown (riga `\| --- \|`) oppure 3 righe consecutive che iniziano con `>`. Senza il flag resta come oggi (blocchi `sql`). | errore |
| R12 | Con `senzaCodice: true`: nessun blocco di codice recintato in tutta la lezione. | errore |

R1–R3, R5–R11 invariate. `schemas.ts`: `senzaCodice: z.boolean().optional()`.

## Review Focus

- **Numero inventato presentato come misura** → R9 (link o dichiarazione in sezione 1) e la scheda con la fonte di ogni numero; l'aritmetica dei casi ricostruiti si ricalcola con Python.
- **Fatto pubblico sbagliato** (la lezione attuale data al 2015 la lettera di Bezos sul Fire Phone: è quella del 2018, uscita nell'aprile 2019) → ogni task verifica i fatti marcati *(verificare)* prima di scrivere; ciò che non si conferma si toglie.
- **Causa attribuita a un'azienda senza fonte** (Fire Phone, Superhuman) → regola nelle Global Constraints; la revisione finale controlla le frasi con un nome proprio.
- **Documento «sbagliato» che non è realistico** (sembra un esempio scolastico) → il documento riproduce un formato che esiste (verbale, richiesta di analisi, scheda OKR, traccia di intervista, ticket); il revisore lo legge.
- **Pagine EN che ricadono sull'italiano** → Task 9: 0 stringhe introdotte senza traduzione.
- **Resti del formato 3s o codice** → R10 e R12 con test.

## Procedura per ogni lezione (Q1–Q9, Task 2–8)

- **Q1** Leggere la lezione attuale: tenere i fatti corretti, buttare il resto.
- **Q2** Frontmatter: `formato: "articolo"`, `senzaCodice: true`, togliere `sezioni`, `dateModified: 2026-10-17`, `duration: "<N> min"` con N = parole/120 arrotondato per eccesso, `learningObjectives` riscritti solo se l'articolo non li copre (2–4, infinito, voi se serve).
- **Q3** Verificare i fatti *(verificare)* con WebSearch (e l'agente `web-fetch` per leggere la pagina); annotare fatto + link + «primaria/secondaria» in `docs/lezioni/gestione-articoli.md`.
- **Q4** Calcolare con Python (`python3 -I -c`) ogni numero dei casi ricostruiti; registrare formula e risultato nella scheda.
- **Q5** Scrivere le 6 sezioni sul blueprint: il caso difficile ha UN criterio «X se…, Y se…»; la sezione 6 chiude con la metrica e con ciò che pesa ordini di grandezza più del resto; dichiarare cosa l'articolo non copre.
- **Q6** `npm run validate:articolo` e `npm run validate:content`: 0 errori sul file.
- **Q7** Ultimo passaggio: avverbi, «molto», «davvero», subordinate che ripetono; rieseguire Q6 (le parole restano ≥ 1.300).
- **Q8** Compilare la sezione della lezione nella scheda: numeri con fonte, fatti verificati, fatti non verificati.
- **Q9** Commit: `git add <mdx> docs/lezioni/gestione-articoli.md && git commit -m "feat(corso): <slug> riscritta come articolo"`.

---

### Task 1: La variante «senza codice» del formato articolo

**Files:**
- Modify: `src/lib/schemas.ts` (accanto a `formato`), `tests/schemas.test.ts`
- Modify: `scripts/lezioni-articolo-rules.ts`, `scripts/lezioni-articolo-rules.test.ts`
- Modify: `CLAUDE.md` (paragrafo «Articolo tecnico»: una riga sul flag)
- Create: `docs/lezioni/gestione-articoli.md` (scheda, intestazione e tabella vuota)

**Interfaces:**
- Consumes: `checkLezioneArticolo(raw: string, rel: string): Esito` (stessa firma); `matter(raw).data`.
- Produces: `checkLezioneArticolo` legge `matter(raw).data.senzaCodice === true` e applica R4/R12 come da tabella; `corsoSchema` accetta `senzaCodice?: boolean`.

- [ ] **Step 0: Baseline EN** — build dell'albero pulito (= main) con `build-and-dump.sh` dello scratchpad → `missing-main-m4.json`; serve al Task 9.
- [ ] **Step 1: Test che falliscono** in `scripts/lezioni-articolo-rules.test.ts`, con una lezione di 6 sezioni valida e `senzaCodice: true`: `senzaCodice: R4 accetta una tabella nella sezione 3 e una citazione nella sezione 4` (0 errori); `senzaCodice: R4 fallisce se la sezione 4 non ha né tabella né citazione` (errore che contiene `R4`); `senzaCodice: R12 rifiuta un blocco di codice` (errore `R12`); `senzaCodice: due righe » non bastano come documento` (errore `R4`); regressione `senza senzaCodice la sezione 3 senza sql continua a fallire`. In `tests/schemas.test.ts`: accetta `senzaCodice: true`, rifiuta `senzaCodice: "si"`.
- [ ] **Step 2: Eseguire** `npx vitest run scripts/lezioni-articolo-rules.test.ts tests/schemas.test.ts` → falliscono i nuovi test.
- [ ] **Step 3: Implementare** `const haDocumento = (righe: Riga[]): boolean` (tabella o ≥3 righe `>` consecutive, solo righe non di codice) e il ramo `senzaCodice` in R4; R12 = nessuna riga con `codice === true`. Aggiungere il campo allo schema.
- [ ] **Step 4: Eseguire** gli stessi test → passano; `npm run validate:articolo` → i 5 articoli ClickHouse restano a 0 errori.
- [ ] **Step 5: CLAUDE.md e scheda**, poi commit `feat(corso): variante senza codice del formato articolo`.

### Task 2: `cultura-data-driven` (order 1, prerequisiti: nessuno)

Titolo attuale: «Cultura data-driven: i tre pilastri». Aprire da `gestione-data-driven/cultura-data-driven.mdx`.

- **Caso (ricostruito, dichiarato):** scale-up e-commerce con 38 dashboard attive; nel trimestre 31 decisioni di prodotto, 4 citano un numero, 27 chiuse in riunione dal responsabile senza evidenza scritta. Tesi: non manca la tecnologia, manca una regola su chi può essere smentito da un numero. (Controllo: 4 + 27 = 31.)
- **Meccanismo (3 concetti):** diritto di decisione · evidenza dichiarata prima («cosa ci farebbe cambiare idea») · definizione unica di ogni metrica con un proprietario. Grassetto: un'azienda è data-driven quando un numero può battere un'opinione autorevole, e lo prova un registro delle decisioni, non il numero di dashboard.
- **Tre errori:** comprare lo strumento prima di cambiare le regole · tre definizioni di «cliente attivo» (marketing 30 giorni, prodotto 7 giorni, finanza contratto non scaduto) · dati chiamati a giustificare una decisione già presa. Documento sbagliato: citazione, il verbale di una riunione («si decide di procedere, dati a supporto in allegato»). Documento giusto: tabella, il registro delle decisioni compilato (decisione, responsabile, evidenza, «cambieremo idea se…», revisione a 30 giorni).
- **Soluzione (criteri):** un registro, un responsabile per riga · la frase «cambieremo idea se…» prima di guardare i dati · una definizione per metrica · revisione a 30 giorni (previsione contro risultato) · gli strumenti per ultimi. Obiettivo dichiarato: da 4 su 31 a quasi tutte nel trimestre dopo. Reversibile, costo sociale: abbandonare il registro dopo averlo imposto dice che ha vinto la gerarchia.
- **Caso difficile:** memo narrativo contro revisione di dashboard. Criterio: memo se la decisione dipende da una catena di ragionamento da discutere; dashboard se è una soglia su metriche già definite. Confusione comune: usare il memo per monitorare, o la dashboard per decidere la strategia. Fonte: email di Bezos del giugno 2004 e lettura silenziosa del memo *(verificare data, lunghezza «sei pagine», lettera agli azionisti che lo descrive; le fonti trovate discordano su 2017/2018 e su 4–6 pagine: qualificare)*.
- **Checklist + metrica:** metrica = quota di decisioni con previsione scritta prima e confronto a 30 giorni. Pesa di più: la frase «cambieremo idea se…» scritta prima.

### Task 3: `decision-making-dati` (order 2, prerequisito: `cultura-data-driven`)

Titolo: «Decidere con i dati: il framework DECIDE».

- **Caso (ricostruito):** decisione di prezzo; l'analisi costa 15 giorni lavorativi di un analista, la riunione decide l'opposto in 20 minuti, nessun criterio era scritto. Tesi: la causa non sono i dati mancanti, è che la decisione non era definita prima dell'analisi.
- **Meccanismo (3):** la decisione viene prima dell'analisi (che cosa, chi, entro quando) · i criteri prima dei dati · un solo responsabile con controlli a 30, 60 e 90 giorni. DECIDE (Define, Evidence, Criteria, Investigate, Decide, Evaluate) è la sequenza di questa lezione: **non** attribuirla a un autore.
- **Tre errori:** analisi su richiesta senza decisione · criteri scritti dopo aver visto i dati (gut feel mascherato) · decisione a comitato senza responsabile. Sbagliato: citazione, la richiesta di analisi («ci serve un'analisi sul pricing»). Giusto: tabella, il decision brief (decisione, scadenza, responsabile, criteri, soglia che cambierebbe la scelta).
- **Soluzione:** criteri in ordine; obiettivo dichiarato: da 15 giorni a 3 per analisi che nascono da una decisione definita. Reversibile.
- **Caso difficile:** processo leggero contro DECIDE completo. Criterio: costo e tempo di tornare indietro (reversibile → leggero; irreversibile → completo). Confusione comune: trattare ogni decisione come irreversibile (lentezza) o come reversibile (errori costosi). Fonti *(verificare)*: Bezos, lettera agli azionisti 2015 (uscita nel 2016), decisioni «a senso unico» e «a doppio senso», soglia del 70% dell'informazione; Fire Phone: svalutazione di 170 milioni di dollari nel terzo trimestre 2014, inventario di 83 milioni (fonti già trovate: Fierce, GeekWire; cercare una fonte primaria), e la frase della lettera agli azionisti 2018 (aprile 2019): «While the Fire phone was a failure…». Dire «svalutazione», non «perdita». Nessuna causa interna.
- **Checklist + metrica:** quota di analisi richieste con una decisione e una scadenza scritte. Pesa di più: definire la decisione prima di aprire il dato.

### Task 4: `okr-e-kpi` (order 3, prerequisito: `decision-making-dati`)

- **Caso (numeri di esempio):** trimestre in cui 9 Key Result su 9 sono al 100% e i ricavi enterprise calano dell'8%. Tesi: i KR misuravano attività. Scheda sbagliata: «Lanciare la campagna enterprise», «Organizzare 3 webinar».
- **Meccanismo (3):** gli OKR cambiano un livello, i KPI sorvegliano una salute · un Key Result è un numero con baseline e target datato · un set di KPI è piccolo, bilanciato, con soglie d'allerta. Grassetto: se non può fallire, non è un Key Result.
- **Tre errori:** KR che sono attività · KR senza baseline · lista di 25 KPI. Sbagliato: tabella, scheda OKR con tre KR-attività. Giusto: tabella, lo stesso obiettivo con KR «clienti enterprise attivi da 120 a 400 entro il 31 dicembre» e baseline.
- **Soluzione:** criteri; obiettivo dichiarato: da 3 KR su 3 senza baseline a 3 su 3 con baseline e data. Reversibile a fine trimestre; costo: un trimestre.
- **Caso difficile:** OKR contro KPI per lo stesso tema (il churn). Criterio: OKR se serve cambiare il livello in un trimestre, KPI se serve tenerlo entro una soglia. Confusione: OKR che ricopia un KPI; KPI trattato come obiettivo. Fonte *(verificare)*: OKR nati in Intel con Andy Grove, portati a Google da John Doerr nel 1999 (fonti trovate: materiale editoriale del libro *Measure What Matters*, secondarie: scrivere «secondo il libro di Doerr»).
- **Checklist + metrica:** quota di KR con baseline e data al giorno 1 del trimestre. Pesa di più: la baseline.

### Task 5: `framework-jtbd` (order 4, prerequisito: `okr-e-kpi`)

- **Caso (pubblico, verificare):** Superhuman: il 22% degli utenti «molto delusi» senza il prodotto contro la soglia del 40% di Sean Ellis; poi segmentazione, interventi su onboarding e prodotto, poi 58% (First Round Review, 2018; fonti trovate: blog Superhuman, First Round, Mind the Product). Le fonti discordano sui tempi («qualche trimestre» / «meno di un anno»): non indicarli. Tesi: la causa non è «il prodotto è sbagliato», è che si misurava sul segmento sbagliato.
- **Meccanismo (3):** il job è il progresso che il cliente cerca, non il prodotto · si segmenta per job, non per demografia · ogni job ha una metrica di completamento. Grassetto da formulare.
- **Tre errori:** job che nomina la soluzione · segmentazione demografica · metrica di clic al posto del completamento. Sbagliato: tabella, tre «job» riscritti male. Giusto: la stessa tabella con job, segmento, metrica.
- **Soluzione:** criteri; finanziare gli interventi che alzano il tasso di completamento al minor costo. Reversibile.
- **Caso difficile:** survey PMF (Ellis) contro interviste di cambio (switching). Criterio: survey se avete utenti attivi per misurare e già sapete il job; interviste se non sapete ancora quale job. Confusione: usare la survey per scoprire invece che per misurare.
- **Verificare:** Walkman/iPod/streaming e il trapano della lezione attuale sono esempi classici senza fonte: tenerli solo con fonte (la frase di Levitt sul «buco da un quarto di pollice» è di attribuzione discussa), altrimenti toglierli.
- **Checklist + metrica:** tasso di completamento del job per segmento.

### Task 6: `ricerca-quantitativa` (order 5, prerequisito: `framework-jtbd`)

- **Caso (numeri di esempio):** l'abbandono al checkout sale dal 62% al 71% in due settimane; mobile 78% contro desktop 52% (livelli, non movimenti: una sola istantanea non dice quale segmento si è mosso). Il team spende lo sprint sulla causa sbagliata. Tesi: il numero dice dove e quanto, non perché.
- **Meccanismo (3):** numeri per segnalare, persone per spiegare, numeri per verificare · tre strumenti per l'analista (session recording, survey in-app, ticket categorizzati) · il segmento prima del metodo.
- **Tre errori:** interviste usate per stimare frequenze · survey con domande chiuse che presuppongono la causa · session recording guardati a caso. Sbagliato: citazione, una domanda di survey che orienta. Giusto: tabella, il piano di ricerca (segnale, ipotesi, metodo, verifica numerica).
- **Soluzione:** criteri; reversibile.
- **Caso difficile:** session recording contro interviste. Criterio: recording se la causa è dentro il prodotto e si vede (dove ci si blocca); interviste se è fuori dallo schermo (motivazione, contesto).
- **Verificare:** Airbnb e gli host giapponesi (+21% di risposte): cercare una fonte; se non c'è, toglierlo. I numeri di esempio si dichiarano.
- **Checklist + metrica:** quota di cali investigati con almeno un metodo qualitativo e una verifica numerica.

### Task 7: `interviste-profondita` (order 6, prerequisito: `ricerca-quantitativa`)

- **Caso (ricostruito, aritmetica):** 5 interviste, 3 su 5 vogliono la funzione: «il 60% dei clienti». L'intervallo di Wilson al 95% per 3 su 5 va da circa il 23% a circa l'88%: calcolarlo con Python e registrarlo. Tesi: le interviste generano ipotesi, non frequenze.
- **Meccanismo (3):** si chiede il comportamento passato, non l'opinione · si ascolta per episodi (ultima volta, contesto, alternativa) · ogni pattern diventa un'ipotesi in tabella con segmento e periodo di controllo.
- **Tre errori:** domande ipotetiche («lo usereste?») · domande che suggeriscono la risposta · intervistare solo i clienti contenti. Sbagliato: citazione, traccia di intervista. Giusto: tabella, traccia riscritta per episodi.
- **Soluzione:** criteri; reversibile.
- **Caso difficile:** numero fisso di interviste contro saturazione. Criterio: numero fisso (5–8) se il segmento è omogeneo e il budget è dato; saturazione (si smette quando le ultime tre interviste non portano codici nuovi) se il segmento è vario o la domanda è nuova. Fonte *(verificare)*: Guest, Bunce e Johnson 2006, *Field Methods* (60 interviste; nel sottoinsieme del Ghana, 92% dei codici entro le prime 12; fonte trovata secondaria, aprire l'estratto o il PDF; l'articolo non generalizza la cifra). Nielsen 2000 (5 utenti) riguarda i test di usabilità: citarlo solo come tale o non citarlo.
- **Checklist + metrica:** quota di ipotesi nate da interviste che hanno una verifica numerica.

### Task 8: `ciclo-deming-hadi` (order 7, prerequisito: `interviste-profondita`)

- **Caso (ricostruito):** un cambio alla definizione di «ordine valido» in un modello dbt; il ricavo mensile scende del 6,4% senza che nessuno abbia scritto baseline né ipotesi; la fase Check non c'è stata. Aritmetica da fissare in Q4.
- **Meccanismo (3):** PDCA (Plan, Do, Check, Act) è il ciclo di Shewhart reso noto da Deming *(verificare l'attribuzione)* · HADI (Hypothesis, Action, Data, Insights) è la variante per cicli brevi; **origine non attribuibile a una fonte citabile** (la ricerca non trova un autore): dirlo · la fase Check confronta con la baseline dichiarata.
- **Tre errori:** ipotesi non falsificabile · ciclo senza baseline · Check saltata o Act che generalizza da un solo ciclo. Sbagliato: citazione, ticket «migliorare il modello ordini». Giusto: tabella, scheda del ciclo (ipotesi, metrica, baseline, soglia, data del Check).
- **Soluzione:** criteri; reversibile.
- **Caso difficile:** HADI contro PDCA. Criterio: HADI se l'azione costa meno di una settimana ed è reversibile; PDCA se il cambiamento è strutturale (modello dati, processo) e va standardizzato nella fase Act. Confusione: usare HADI per un cambiamento strutturale.
- **Verificare:** il Fire Phone nella fase Check della lezione attuale: fuori, per la regola «nessuna causa interna senza fonte».
- **Checklist + metrica:** quota di cicli con baseline e data del Check dichiarate prima del Do.

### Task 9: EN, scheda del modulo, cheat-sheet/caso-studio, build, revisione, PR

**Files:**
- Modify: `src/data/i18n/en-static-cache.json`, `public/llms-full.txt`, `docs/lezioni/04-gestione-data-driven.md`, `docs/lezioni/gestione-articoli.md`
- Modify (solo se emerge un fatto sbagliato): `gestione-data-driven/cheat-sheet.mdx`, `caso-studio.mdx`

- [ ] **Step 1:** `grep -n "Fire Phone\|2015\|memo\|OKR\|Superhuman" cheat-sheet.mdx caso-studio.mdx`; correggere solo i fatti smentiti dalla verifica (stessa formula del Fire Phone: «svalutazione», lettera del 2018).
- [ ] **Step 2: EN.** Build + `dump-missing-en.ts` → `missing-now-m4.json`; `compute-intro.mjs missing-main-m4.json missing-now-m4.json intro-m4.json`; tradurre le stringhe nuove (la prosa a frammenti attorno a link e codice inline; ogni tabella e citazione è una o più stringhe), `write-en-pairs.mjs`; ripetere finché «stringhe introdotte e senza traduzione: 0».
- [ ] **Step 3:** `04-gestione-data-driven.md`: nota sul nuovo formato dei 7 articoli, i fatti verificati e quelli corretti (lettera del Fire Phone), come oggi per ClickHouse in `12-real-time-analytics.md`.
- [ ] **Step 4:** `npm run check` (exit 0), `npm run build` (exit 0, audit passato, 778 URL identici a main, 0 stringhe EN scoperte).
- [ ] **Step 5: Revisione finale** con un agente nuovo sul diff `origin/main..HEAD` (superpowers:requesting-code-review), con `Review Focus` in mano e il compito di controllare ogni frase con un nome proprio contro la scheda. Correggere in un solo giro; ledger con `Ruling:` e `minor (deferred):`.
- [ ] **Step 6:** push, PR pronta alla revisione (corpo: cosa cambia, fatti verificati e corretti, verifiche con i numeri, cosa resta fuori), `subscribe_pr_activity`. **Fermarsi: il merge in main solo dopo l'OK dell'utente.**
