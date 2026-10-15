# Lezioni «da capire in 3 secondi» — design

- **Data:** 2026-10-15
- **Stato:** design approvato in chat sezione per sezione; questa spec è da rivedere prima del piano di implementazione.
- **Branch:** `claude/lezioni-3-secondi` (parte da `claude/analizza-corsi-structure-f4afab`, PR #102 dei titoli).
- **Prompt di riferimento:** [`docs/lezioni/prompt-3-secondi.md`](../../lezioni/prompt-3-secondi.md).

## 1. Obiettivo

Riscrivere le 237 lezioni del corso sul sito nello stile del prompt «lezione completa con schemi da capire in 3 secondi»: chi legge capisce guardando, non leggendo. Ogni lezione ha un'idea per blocco, 2–3 spiegazioni con schema che cresce un pezzo alla volta, frasi ★ da ricordare, domande di verifica e un quiz. Il testo è italiano semplice, a frasi brevi.

L'unica differenza voluta rispetto al prompt è la palette: si usano i colori di GinnyTech (lime `#ccff00` al posto del giallo `#FAFF69`).

**Successo:** una lezione riscritta si capisce scorrendo solo titoli, schemi e riquadri ★; supera i controlli automatici del formato; mantiene tutti i fatti della versione precedente; ha la versione inglese tradotta; nessun URL cambia.

## 2. Decisioni prese

| Tema | Decisione |
|---|---|
| Dove vivono le lezioni | Pagine del sito (MDX). Niente `.pptx` / `.docx`. |
| Formato della pagina | Articolo + schemi: testo leggibile e breve, schede visive, 2–3 schemi che crescono, ★, quiz. |
| Tecnologia | Componenti Astro (HTML/CSS, SVG solo dove serve) scritti nell'MDX. |
| Colori | Palette GinnyTech, con tema scuro e chiaro (tabella §3). |
| Font | Verdana dentro schemi e schede; testo dell'articolo nel font del sito (Inter, titoli Montserrat). |
| Ritmo | Pilota (`real-time-analytics/clickhouse-fondamenti`), poi un modulo alla volta con piano approvato. |
| Inglese | Ogni lezione riscritta viene tradotta nella cache EN. |
| Ordine dei moduli | Ordine del corso (1 → 21), salvo priorità diverse dell'autore. |

## 3. Sistema visivo

Ogni schema sta in una cornice 16:9 (la «slide») inserita nel flusso della pagina, larga quanto la colonna di testo. Sotto i 640px il rapporto si libera in altezza e le schede vanno in colonna.

### Colori

Variabili CSS `--lz-*`, definite per i due temi del sito (`:root[data-theme='dark']` e `:root[data-theme='light']`).

| Ruolo (prompt) | Variabile | Tema scuro | Tema chiaro (= «versione da stampare» del prompt) |
|---|---|---|---|
| sfondo slide `#151515` | `--lz-bg` | `#0d0f14` | `#f4f5f7` |
| scheda `#303030` | `--lz-card` | `#1e2128` | `#e2e5ea` |
| codice/dettaglio `#1E1E1E` | `--lz-code-bg` / `--lz-code-fg` | `#08090d` / `#e4e6ec` | `#ffffff` / `#1a1d26` |
| giallo `#FAFF69` | `--lz-accent` | `#ccff00` | `#ccff00` solo come riempimento |
| bordo evidenziato | `--lz-accent-line` | `#ccff00` | `#1a1d26`, 2px |
| testo su accento | `--lz-on-accent` | `#08090d` | `#08090d` |
| celle spente, barre inattive `#4A4A4A` | `--lz-off` | `#2a2d36` | `#c2c7cf` |
| intestazioni e linee `#686868` | `--lz-line` | `#646878` | `#7a7f8c` |
| testo secondario `#A7A7A7` | `--lz-text-2` | `#9498a3` | `#565b66` |
| celle chiare `#DADADA` | `--lz-cell-light` | `#e4e6ec` | `#ffffff` |
| divisori `#2A2A2A` | `--lz-divider` | `#1e2128` | `#e2e5ea` |
| testo | `--lz-text` | `#ffffff` | `#1a1d26` |

Nel tema chiaro il lime non si usa mai come colore di testo o di bordo (contrasto insufficiente): diventa evidenziatore con testo scuro, come nella versione da stampare del prompt.

### Regole fisse (dal prompt, Passi 4–5)

- Lime solo per la cosa più importante: 1–2 elementi per slide, più etichetta di sezione e segmento attivo della barra.
- Titolo della slide: massimo 6 parole, grassetto. Etichetta di sezione maiuscola «2 · NOME SEZIONE», in accento.
- Riquadro ★: bordo accento, stella accento a sinistra, frase di massimo 12 parole.
- Barra di avanzamento in fondo: un segmento per sezione, quello attuale in accento.
- Segni: scelta giusta = bordo accento + pillola «… punta qui»; opzione buona = cerchio pieno con ✓; da evitare = scheda vuota con bordo grigio e cerchio vuoto con ✗; passo = cerchio accento con numero; tra due elementi = chevron accento.
- Testo mai sotto 12px sul web (il prompt dice 10 pt); numeri grandi in accento e grassetto.
- Solo forme disegnate in HTML/CSS o SVG inline: niente immagini raster dentro gli schemi.

## 4. Componenti

Cartella `src/components/lezione/`. Astro puro; l'unico JavaScript è quello dello schema che cresce (vanilla, senza React). Stili in `src/styles/lezione.css` con classi `.lz-*`: nel build di produzione `custom.css` arriva dopo gli stili scoped, quindi si usano classi specifiche e si verifica con build + preview, mai solo con `dev`.

### Sezioni della lezione

La lezione dichiara le sezioni una volta sola nel frontmatter (`sezioni: [...]`). Il template `src/pages/course/[module]/[slug].astro` le mette in `Astro.locals` prima di renderizzare il contenuto; i componenti le leggono da lì e l'autore scrive solo il numero di sezione (`sezione={2}`). Se `Astro.locals` non fosse disponibile durante il render dell'MDX, la ricaduta è passare `sezioni={frontmatter.sezioni}` come prop.

### Cornice `<Slide>`

```mdx
<Slide sezione={1} titolo="Righe contro colonne" messaggio="OLTP legge una riga. OLAP legge poche colonne.">
  <Confronto … />
</Slide>
```

Contiene titolo, etichetta di sezione, area del disegno (un solo disegno), riquadro ★ (`messaggio`) e barra di avanzamento. È una `<figure>`; il messaggio fa da didascalia.

### Disegni del catalogo (Passo 5 del prompt)

| Prompt | Componente | Contenuto |
|---|---|---|
| A Confronto a specchio | `<Confronto>` | due schede (nome, sottotitolo, esempio, scelta opzionale), fino a 5 criteri con le risposte a specchio |
| B Passi numerati | `<Passi>` | 3–4 passi con cerchio numerato, nome e massimo 2 righe; chevron tra i passi |
| C Opzioni con verdetto | `<Opzioni>` | 2–4 schede con ✓/✗ e una frase |
| D Mini-tabella | `<MiniTabella>` | griglia di quadratini; righe, colonne o blocchi in accento; didascalia breve |
| E Tabella con dati veri | `<TabellaDati>` | massimo 8 righe × 4 colonne; righe importanti in accento |
| F Quantità a confronto | `<Barre>` | barre proporzionali; una in accento, le altre chiare, vuoto = solo contorno |
| G Numeri grandi | `<NumeriGrandi>` | massimo 3 numeri con una riga di spiegazione |
| I Relazioni | `<Relazioni>` | elemento centrale in accento, satelliti con bordo accento, linee |
| J Codice | blocco di codice dentro `<Slide>` | massimo 4 righe |
| K Citazione | `messaggio` della `<Slide>` | tra «», con l'autore |
| L Apertura | `<Percorso>` | pillole delle sezioni e posizione nel modulo |
| H Metafora | SVG dedicato nella lezione | solo quando aiuta davvero |

### Schema che cresce `<Schema>`

```mdx
<Schema sezione={2} titolo="Perché leggiamo solo alcune colonne"
  passi={["I dati sono in una tabella.", "Ogni colonna è un file a parte.",
          "La query legge solo amount.", "Leggiamo circa l'1% dei dati."]}>
  <MiniTabella … />   {/* ogni pezzo porta passo={n} */}
</Schema>
```

- Lo schema si scrive **una volta**, nello stato finale. Ogni pezzo porta `passo={n}`, cioè il passo in cui compare.
- Il componente renderizza il contenuto una volta per passo (`Astro.slots.render` ripetuto) e marca ogni vista con `data-passo-attuale`. Regole CSS enumerate (fino a 6 passi) mostrano i pezzi con `passo` ≤ attuale, colorano in accento quelli con `passo` = attuale e in grigio i precedenti; i pezzi futuri restano nascosti.
- Sotto il titolo, fisso: «Passo 2 di 4 — …» e i cerchi numerati.
- **Con JavaScript:** si vede una vista alla volta; pulsanti ◀ ▶, cerchi cliccabili, frecce sinistra/destra quando lo schema ha il focus; il cambio di passo è annunciato con `aria-live="polite"`.
- **Senza JavaScript, in stampa e in PDF:** tutte le viste una sotto l'altra (regola del prompt «slide duplicate, non animazioni»).
- Con `prefers-reduced-motion` nessuna transizione.
- Tipi di schema supportati attraverso i disegni del catalogo o un SVG dedicato: flusso, zoom, prima → dopo, albero, linea del tempo, strati, ciclo, tabella che cambia.

### Blocchi brevi nel testo

- `<Messaggio>`: riquadro ★ autonomo (frase da ricordare, riepilogo).
- `<ErroreTipico sbagliato=… giusto=…>`: ✗ a sinistra, ✓ a destra; può contenere due disegni a specchio.
- `<Domanda risposta="…">`: domanda di verifica con risposta a scomparsa (`<details>`).
- Quiz finale: il `QuizExercise` esistente (React, `client:visible`), 5 domande.

### Versione per agenti

`src/lib/agent-markdown.ts` impara a convertire ogni componente in Markdown leggibile: `<Slide>` → titolo in grassetto, contenuto e `> ★ messaggio`; `<Confronto>` → tabella; `<Passi>` → elenco numerato; `<Schema>` → «Passo 1 di 4: …» in elenco; `<MiniTabella>`/`<TabellaDati>` → tabella; `<Messaggio>` → `> ★ …`; `<ErroreTipico>` → righe ✗/✓; `<Domanda>` → domanda + risposta. Ogni convertitore ha il suo test in `agent-markdown.test.ts`.

## 5. Struttura di una lezione

```mdx
---
title: "ClickHouse: database colonnare e MergeTree"   # invariato
formato: "3s"
sezioni: ["Righe e colonne", "Leggere poco", "MergeTree", "Ordine fisico"]
learningObjectives: [3 obiettivi con verbi concreti]   # campo già esistente
# … resto del frontmatter invariato
---

<Percorso />                         {/* pillole delle sezioni, «Lezione 2 di 9» */}

Gancio: un problema vero in 1–2 frasi (≥ 120 caratteri, è l'intro richiesta dalla validazione).

<Slide …>ponte: 3 cose dalla lezione prima, con il link</Slide>
<Slide …>obiettivi: le 3 righe di learningObjectives</Slide>

## Righe e colonne                   {/* una H2 per sezione, nell'ordine di `sezioni` */}
<Slide sezione={1} …>apertura da 3 secondi</Slide>
Testo breve. Frasi di 5–10 parole.
<Domanda risposta="…">controllo di fine sezione</Domanda>

## Leggere poco
<Slide sezione={2} …>problema</Slide>
<Schema sezione={2} …>3–4 passi</Schema>
<Slide sezione={2} …>esempio vero con i dati della lezione</Slide>
<ErroreTipico … />
<Messaggio>frase da ricordare</Messaggio>
<Domanda risposta="…">verifica</Domanda>

…

## Riepilogo
<Messaggio>★ obiettivo 1</Messaggio>
<Messaggio>★ obiettivo 2</Messaggio>
<Messaggio>★ obiettivo 3</Messaggio>
<QuizExercise client:visible quizId="…" questions={[5 domande]} />
Ponte verso la lezione dopo, con il link.
```

- 3–6 sezioni; dentro ogni sezione una idea per `<Slide>`.
- 2–3 spiegazioni con schema per lezione, nei concetti più difficili, sempre nell'ordine: problema → `<Schema>` → esempio vero → `<ErroreTipico>` (se serve) → `<Messaggio>` → `<Domanda>`.
- Pratica: gli esercizi esistenti (`SqlExercise`, blocchi di codice) restano; dove ha senso 1–2 esercizi guidati con consegna, aiuto e soluzione a scomparsa, in una H2 `## Pratica` prima del `Riepilogo`.
- La struttura soddisfa già `scripts/validation.ts`: ≥ 3 H2, intro ≥ 120 caratteri, segnale di esempio, sezione `Riepilogo`.
- Nei moduli concettuali resta valido il test che vieta certi blocchi di codice nelle lezioni teoriche (`tests/theoretical-lessons-cleanliness.test.ts`).

## 6. Lingua e contenuto

- Dal prompt (Passi 6–7): frasi di 5–10 parole, una idea per frase; «noi» e il presente; niente congiuntivo, poco condizionale, niente passivo; niente «ne», «glielo»; parole corte («vuol dire», «insieme»); stesse formule ripetute; stessa parola per la stessa cosa in tutta la lezione.
- Dentro gli schemi: etichette di 1–3 parole; massimo 30 parole per slide (codice escluso); massimo 3 punti per elenco.
- Termini tecnici inglesi restano in inglese; la prima volta con la traduzione tra parentesi.
- **Contenuto:** si tengono tutti i fatti, i numeri, i nomi e i casi reali della lezione attuale. Non si inventa niente. Ciò che si toglie o si sposta e i dati dubbi vanno nel piano del modulo.
- Restano invariati: `title`, URL (nome file), `headerImage`, `order`, `prerequisites`. La `description` cambia solo se il contenuto la smentisce.

## 7. Processo

Il piano di implementazione che segue questa spec copre solo la **Fase 0**. Ogni modulo, dopo, segue il processo descritto qui sotto con il proprio piano di modulo, senza una nuova spec.

### Fase 0 — pilota (una PR)

1. Componenti, stili, convertitori per agenti, controllo automatico (§8) e relativi test.
2. Campi `formato` e `sezioni` nello schema `corso` (`src/lib/schemas.ts`) con test.
3. Stringhe fisse dei componenti tradotte nella cache EN («Passo», «di», «Mostra risposta», «Errore tipico», «Sbagliato», «Giusto», «Lezione … di …»).
4. Piano della lezione pilota in `docs/lezioni/12-real-time-analytics.md` (solo la lezione pilota), approvato dall'autore.
5. Riscrittura di `real-time-analytics/clickhouse-fondamenti`.
6. Verifica completa (§8) e screenshot in tema scuro, chiaro e mobile per l'approvazione dello stile.

Dopo l'approvazione del pilota: aggiornare `/scrivi-lezione`, `/naturalizza-lezione` e la crew `/ginnytech`, che oggi spingono verso la prosa narrativa (passo separato, fuori da questa spec).

### Ogni modulo

1. **Piano** in `docs/lezioni/<NN>-<modulo>.md`, per ogni lezione: lezione prima/dopo, 3 obiettivi, sezioni, 2–3 concetti difficili (perché sono difficili, errore tipico, tipo di schema), tabella sezione · n° slide · messaggio · disegno · domanda, cosa si toglie o sposta, dubbi sui fatti. **L'autore approva il piano prima della scrittura.**
2. **Riscrittura** delle lezioni, un commit per lezione.
3. **Controllo** automatico (§8) + revisione slide per slide con le domande del Passo 9 del prompt.
4. **Inglese:** stringhe nuove delle pagine del modulo estratte e tradotte tutte nella cache (§10).
5. **Verifica** e **una PR per modulo**.

I moduli procedono in sequenza: tutti toccano `en-static-cache.json`, e i conflitti su quel file costano più del tempo guadagnato in parallelo.

## 8. Controlli

### Automatico — `scripts/validate-lezioni-3s.ts`

Gira solo sulle lezioni con `formato: "3s"`, dentro `npm run check` (le lezioni non ancora riscritte non sono toccate). Errori bloccanti:

- `sezioni` ha 3–6 voci; le H2 del corpo, escluse `Riepilogo` e un'eventuale `Pratica`, corrispondono a `sezioni` nello stesso ordine;
- `learningObjectives` ha esattamente 3 voci;
- ogni `<Slide>`: `titolo` ≤ 6 parole, `messaggio` ≤ 12 parole, testo visibile ≤ 30 parole (codice escluso), ≤ 2 elementi in accento. Un elemento è in accento quando un disegno lo marca con la prop `evidenzia` (righe, colonne, celle, barre, numeri) o `scelta` (scheda giusta); etichetta di sezione e barra non contano;
- 2–3 `<Schema>` per lezione, ciascuno con 3–6 passi e seguito, prima della H2 successiva, da almeno un `<Messaggio>` e una `<Domanda>`;
- ogni sezione termina con una `<Domanda>`;
- `## Riepilogo` contiene esattamente 3 `<Messaggio>` e un `QuizExercise` con 5 domande;
- nessuna frase del testo supera 20 parole (avviso, non errore: le frasi bersaglio sono di 5–10).

Il validatore ha i suoi test in vitest.

### Verifica per ogni PR

- `npm run validate:content`, `vitest`, `astro check`.
- Build completa (nelle worktree annidate dalla copia nello scratchpad, per il bug di tsconfig).
- URL invariati: lista delle pagine generate identica a quella del branch base.
- Nessuna stringa inglese scoperta sulle pagine riscritte.
- Browser su build + preview: una lezione per modulo in tema scuro, tema chiaro e mobile; lo schema che cresce funziona con mouse, tastiera e senza JavaScript.
- `public/llms-full.txt` rigenerato e committato.

## 9. File coinvolti

- nuovi: `src/components/lezione/*.astro`, `src/components/lezione/schema.ts` (stepper), `src/styles/lezione.css`, `scripts/validate-lezioni-3s.ts` (+ test), `docs/lezioni/<NN>-<modulo>.md`;
- modificati: `src/lib/schemas.ts` (+ `tests/schemas.test.ts`), `src/pages/course/[module]/[slug].astro` (sezioni in `Astro.locals`, import dei componenti per l'MDX), `src/lib/agent-markdown.ts` (+ test), `package.json` (script `check`), `src/data/i18n/en-static-cache.json`, `public/llms-full.txt`, le lezioni del modulo in lavorazione.

## 10. Inglese

Per ogni modulo: build, estrazione delle stringhe mancanti delle pagine del modulo (copia temporanea di `scripts/translate-static-en.ts` che scrive `missingItems`, non committata), traduzione di tutte quelle introdotte dalla riscrittura, scrittura nella cache con chiave `sha256(source)`, nuova build e confronto con il branch base: zero stringhe scoperte nuove. Le traduzioni seguono le stesse regole di lingua semplice.

## 11. Rischi, dipendenze, fuori scope

- **Rinomina degli URL** (sessione separata, 44 file): la riscrittura di un modulo parte solo dopo che il rinomino dei suoi file è unito. Il pilota non è tra i file rinominati.
- **Perdita di sfumature** semplificando la lingua: il piano elenca cosa si toglie; i fatti restano tutti.
- **Volume:** circa una sessione per modulo; il pilota serve a misurare il tempo reale.
- **Fuori scope:** materiale per l'aula (`.pptx`, `.docx`, scheda studenti), nuove immagini header, cambi di URL, doppioni tra moduli e argomenti mancanti segnalati in `docs/titoli-corso.md`.

## 12a. Modifiche dopo la prima prova (2026-10-15, richieste dall'autore)

Prevalgono sulle sezioni precedenti dove le contraddicono.

1. **Template della lezione (tutte le lezioni):** via i box «Cosa imparerai» e «Collegamenti» in cima alla pagina; nelle card dei collegamenti via l'intestazione «Percorso collegato» e le etichette di relazione («Collegamento tematico», «Modulo vicino»…), i link restano. Gli obiettivi si mostrano nel corpo con `<Obiettivi />` (legge `learningObjectives`); la slide «obiettivi» di §5 diventa questo componente.
2. **Le figure fanno parte della pagina** (supera §3 «cornice 16:9» e §4 «Cornice comune»): `<Slide>` è una figura nel testo, larga quanto il testo e alta quanto serve, senza riquadro, etichetta di sezione e barra di avanzamento. Restano titolo breve, disegno e riquadro ★. `sezione` è accettata ma non mostrata.
3. **Niente da cliccare** (supera §4 «Schema che cresce», parte JavaScript): `<Schema>` mostra subito tutti i passi, una riga per passo (testo a sinistra, disegno a destra; su mobile uno sotto l'altro). Nessun pulsante, nessuno script.
4. **Ogni grafico ha accanto il testo:** dopo ogni `<Slide>` e ogni `<Schema>`, prima della figura o H2 successiva, servono una spiegazione scritta con voce umana (cosa vediamo, perché conta) e pattern / anti-pattern con `<Pattern si="…" no="…" />` (dopo uno schema vale anche `<ErroreTipico>`). Nuova regola 8 del validatore, insieme all'obbligo di `<Obiettivi />` prima della prima H2.

## 12. Criteri di accettazione del pilota

- La pagina di `clickhouse-fondamenti` rende con le due forme degli esempi del prompt il materiale che la lezione ha già: il confronto row-oriented / column-oriented per carichi transazionali e analitici (confronto a specchio, come «OLTP e OLAP a confronto») e la lettura delle sole colonne della query (schema che cresce in 4 passi, come «Perché leggiamo solo alcune colonne»). Le sigle OLTP/OLAP si introducono solo come nomi dei due carichi già descritti.
- Supera il controllo automatico, `validate:content`, i test, `astro check` e la build.
- Funziona in tema scuro e chiaro e su mobile (nessuno scroll orizzontale della pagina); tutti i passi degli schemi sono visibili senza interazione.
- La versione `.md` per agenti contiene gli schemi in forma testuale.
- `/en/` della lezione è in inglese.
- L'autore approva lo stile prima del primo modulo.
