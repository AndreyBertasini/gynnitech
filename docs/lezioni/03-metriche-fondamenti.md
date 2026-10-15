# Modulo 3 · Metriche, KPI tree e fondamenti analitici (metriche-fondamenti)

> Riscritto nel formato «3 secondi» (spec: `docs/superpowers/specs/2026-10-15-lezioni-3-secondi-design.md`, §12a). Questa scheda dice che cosa è cambiato e quali fatti vanno verificati. Per le lezioni di questo modulo non c'è stato un piano approvato lezione per lezione: l'autore ha chiesto di riscrivere tutti i moduli.

## Lezioni (ordine del modulo)

| # | File | Sezioni | Schemi | Quiz |
|---|---|---|---|---|
| 1 | `inizio-successo` | 4 | 2: cinque passi per l'albero, cosa scriviamo prima di leggere | 5 (tutte nuove) |
| 2 | `statistica-fondamenti` | 5 | 2: cinque passi per i controlli, quando il dato è ambiguo | 5 (tutte nuove) |
| 4 | `generazione-idee` | 4 | 2: procedura per coorti, come leggiamo 130 mercati | 5 (tutte nuove) |
| 6 | `ricerca-desk` | 4 | 2: cinque passi quando un numero si muove, perché Flu Trends sbaglia | 5 (tutte nuove) |
| 7 | `cheat-sheet` | 4 | 2: tre trappole della correlazione, cinque passi per fidarci di una proxy | 5 (tutte nuove) |
| 8 | `caso-studio` | 4 | 2: i sei pezzi del framework, cinque passi del laboratorio | 5 (tutte nuove) |

Le sei lezioni non avevano un quiz: i 5 quesiti di ciascuna sono nuovi. I numeri d'ordine 3 e 5 non esistono nel modulo.

## Cosa è stato tolto o spostato

- I blocchi «Cosa imparerai» e «Collegamenti», le etichette «Percorso collegato» e «Collegamento tematico»: tolti, link intatti.
- Le due tabelle generiche che si ripetevano identiche in tutte le lezioni («Passaggio | Domanda da fare | Output atteso» e «Elemento | Definizione operativa | Controllo minimo»): in `inizio-successo` sono diventate lo schema «Cosa scriviamo prima di leggere»; altrove sono state tolte perché non dicevano nulla di specifico.
- La tabella «Letture prudenti per casi frequenti», anch'essa ripetuta in ogni lezione, resta solo in `inizio-successo` (come slide) e in `statistica-fondamenti` (come schema).
- I «Verdetto: …» finali sono stati assorbiti dalle frasi ★ del Riepilogo; le «Domande per ripassare» sono diventate le `<Domanda>` di fine sezione e il quiz.
- Le frasi «Siamo nel binario `ml-tabellare`…» restano come inciso nell'apertura; il campo `binario` nel frontmatter non cambia.
- In `caso-studio` il calcolo del food delivery è stato esplicitato (100 − 80 − 30 = −10 milioni): il testo originale parlava di «netto da commissioni 20 milioni» senza mostrare il passaggio.

## Fatti da verificare con la fonte

- Airbnb (`inizio-successo`): quasi 448 milioni di notti ed esperienze prenotate nel 2023, +14% sul 2022, ricavi 9,9 miliardi di dollari (bilancio annuale).
- Wells Fargo (`statistica-fondamenti`, `cheat-sheet`): circa 2 milioni di conti non autorizzati, sanzioni complessive di 185 milioni di dollari a settembre 2016, dimissioni dell'amministratore delegato a ottobre.
- Netflix (`generazione-idee`): annuncio dal CES del 6 gennaio 2016, 130 nuovi paesi in una volta.
- Google Flu Trends (`ricerca-desk`): lancio a novembre 2008, articolo su Nature nel 2009, previsione circa doppia nel 2012-2013, analisi di Lazer e colleghi su Science nel 2014.
- Shewhart (Bell Labs, anni venti) e Kahneman sul bias dei pattern (`ricerca-desk`): come nella lezione originale.
- Goodhart, 1975 (`cheat-sheet`): la formulazione «quando una misura diventa un obiettivo…» è comunemente attribuita alla sintesi di Marilyn Strathern; controllare l'attribuzione.
- Correlazione formaggio e lenzuola (`cheat-sheet`): esempio del sito Spurious Correlations; citarlo se serve.
- Uber (`caso-studio`): 2019, ricavi 14,1 miliardi di dollari, perdita netta 8,5 miliardi, quotazione a maggio.
- «Ogni ordine perde dieci centesimi su cento» (`caso-studio`): è una lettura didattica del calcolo −10 su 100 di volume lordo, non un dato di un'azienda reale.

## Traduzione inglese

684 stringhe nuove, aggiunte a mano a `src/data/i18n/en-static-cache.json`. Dopo la build completa: 0 stringhe introdotte e scoperte, URL invariati (778 pagine).
