# Modulo 2 · Raccolta dati (data-collection)

> Riscritto nel formato «3 secondi» (spec: `docs/superpowers/specs/2026-10-15-lezioni-3-secondi-design.md`, §12a). Questa scheda dice che cosa è cambiato e quali fatti vanno verificati. Per le lezioni di questo modulo non c'è stato un piano approvato lezione per lezione: l'autore ha chiesto di riscrivere tutti i moduli.

## Lezioni (ordine del modulo)

| # | File | Sezioni | Schemi | Quiz |
|---|---|---|---|---|
| 1 | `introduction` | 5 | 3: cinque passi per la base, cinque controlli alla fonte, il tasso sale | 5 |
| 2 | `event-tracking` | 5 | 2: percorso di implementazione, invio non bloccante | 5 |
| 3 | `framework` | 4 | 2: confronto tra strumenti, flusso della raccolta | 5 |
| 4 | `privacy` | 5 | 2: percorso verso la conformità, dal consenso alla cancellazione | 5 |
| 5 | `terminology` | 5 | 2: costruzione del glossario, dall'anonimo all'utente identificato | 5 |
| 6 | `jtbd` | 4 | 2: applicazione del framework, tre domande per ogni evento | 5 |
| 7 | `integrations` | 5 | 2: percorso in cinque passi, che cosa dichiariamo prima del modello | 5 |
| 8 | `quickstart` | 5 | 2: percorso in cinque tappe, tre chiamate (identify, track, page) | 5 |

Ogni lezione ha, in fondo, una sezione «Pratica» con l'esercizio SQL che già esisteva (`SqlExercise`), un Riepilogo con tre frasi ★ e un quiz da 5 domande.

## Cosa è stato tolto o spostato

- I blocchi «Cosa imparerai» e «Collegamenti» in apertura sono stati rimossi, come richiesto; restano `Percorso` e `Obiettivi`.
- Le etichette «Percorso collegato» e «Collegamento tematico» sono state tolte; i link restano.
- Nelle lezioni `privacy`, `terminology`, `jtbd` e `quickstart` sono stati tolti il blocco `sql` e il blocco `python` generici (viste e controlli) che non spiegavano una decisione. Restano gli esercizi `SqlExercise`, invariati. `framework` non aveva blocchi di codice.
- In `introduction` restano due query SQL di controllo, il frammento `json` e un frammento `python`; in `event-tracking` il payload `json`; in `integrations` una query SQL e un frammento `python`; in `quickstart` le tre chiamate `javascript`. Ognuno è collegato a una decisione.
- Le «Domande per ripassare» e i «Verdetto: …» finali sono stati assorbiti dal quiz e dalle frasi ★ del Riepilogo.
- Le frasi «Il binario di questa lezione è **ml-tabellare**…» restano come inciso nell'apertura; il campo `binario` nel frontmatter non cambia.
- Il paragrafo sui tre errori (aggregazione precoce, qualità, correlazione) ricorreva identico in più lezioni: resta intero in `introduction` e in forma ridotta nelle altre.

## Fatti da verificare con la fonte

- British Airways (`event-tracking`): attacco Magecart a settembre 2018; multa annunciata dall'ICO a luglio 2019 per 183 milioni di sterline, sanzione definitiva di 20 milioni a ottobre 2020.
- Apple ATT (`framework`): iOS 14.5 e «10 miliardi di dollari» di ricavi pubblicitari persi da Meta nel 2022 sono una stima riportata dalla stessa Meta; controllare il dato esatto.
- Segment (`framework`, `quickstart`): «oltre 400 destinazioni», Rudderstack «oltre 200», costi «100-500 dollari al mese per connettore» (`integrations`): cifre della lezione originale, variano con il listino.
- Google e Looker (`integrations`): annuncio a giugno 2019, 2,6 miliardi di dollari in contanti, chiusura a febbraio 2020.
- Strava (`introduction`): heatmap pubblicata a novembre 2017, scoperta di Nathan Ruser a gennaio 2018; «miliardi di punti GPS» come nella lezione originale.
- Meta e GDPR (`privacy`): multa di 1,2 miliardi di euro del maggio 2023 per i trasferimenti verso gli Stati Uniti, dopo Schrems II.
- Facebook e i video (`terminology`): ammissione a settembre 2016 della sovrastima «60-80%», soglia dei 3 secondi, accordo da 40 milioni di dollari a ottobre 2019.
- Christensen, *Competing Against Luck* (2016), caso del milkshake (`jtbd`): il racconto è ripreso dalla lezione originale; verificare che il dettaglio del tragitto in auto sia quello del libro.
- Segment e Twilio (`quickstart`): fondazione nel 2011, acquisizione per 3,2 miliardi di dollari a ottobre 2020.
- Fivetran (2024), «What is Data Integration?» (`integrations`): riferimento della lezione originale.

## Traduzione inglese

915 stringhe nuove, aggiunte a mano a `src/data/i18n/en-static-cache.json`. Dopo la build completa: 0 stringhe introdotte e scoperte, URL invariati (778 pagine).
