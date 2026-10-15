# Modulo 4 · Gestione data-driven (gestione-data-driven)

> Riscritto nel formato «3 secondi» (spec: `docs/superpowers/specs/2026-10-15-lezioni-3-secondi-design.md`, §12a). Questa scheda dice che cosa è cambiato e quali fatti vanno verificati. Per le lezioni di questo modulo non c'è stato un piano approvato lezione per lezione: l'autore ha chiesto di riscrivere tutti i moduli.

## Lezioni (ordine del modulo)

| # | File | Sezioni | Schemi | Quiz |
|---|---|---|---|---|
| 1 | `cultura-data-driven` | 5 | 2: i tre pilastri, il percorso in cinque passi | 5 (tutte nuove) |
| 2 | `decision-making-dati` | 4 | 2: le sei lettere di DECIDE, l'antidoto al gut feel | 5 (tutte nuove) |
| 3 | `okr-e-kpi` | 4 | 2: cinque passi per OKR e KPI, tre qualità di un set di KPI | 5 (tutte nuove) |
| 4 | `framework-jtbd` | 4 | 2: tre principi, cinque passi dal job alla decisione | 5 (tutte nuove) |
| 5 | `ricerca-quantitativa` | 4 | 2: quattro strumenti qualitativi, numeri-persone-numeri | 5 (tutte nuove) |
| 6 | `interviste-profondita` | 4 | 2: i cinque momenti dell'intervista, dalla ricerca alla tabella | 5 (tutte nuove) |
| 7 | `ciclo-deming-hadi` | 4 | 2: le quattro fasi del ciclo, il ciclo HADI | 5 (tutte nuove) |
| 8 | `cheat-sheet` | 4 | 2: la checklist in cinque passi, quattro strumenti e quattro ruoli | 5 (tutte nuove) |
| 9 | `caso-studio` | 4 | 2: il laboratorio in cinque passi, la roadmap a sei mesi | 5 (tutte nuove) |

Le nove lezioni non avevano un quiz: i 5 quesiti di ciascuna sono nuovi.

## Cosa è stato tolto o spostato

- I blocchi «Cosa imparerai» e «Collegamenti», le etichette «Percorso collegato» e «Collegamento tematico»: tolti, link intatti.
- In tutte e nove le lezioni c'erano due blocchi di codice identici: una query SQL («base_events / weekly_user_metrics») e uno script Python (z-score su finestra mobile). Non c'entravano con la cultura, le decisioni o i framework di gestione, e sono stati tolti. Resta l'idea in prosa.
- Le tabelle generiche ripetute («Elemento | Definizione operativa | Controllo minimo», «Evidenza osservata | Lettura prudente | Azione consigliata») sono state tolte. L'unica tabella utile, la mappa job funzionale / emotivo / metrica di `framework-jtbd`, è diventata una slide.
- Il paragrafo sui tre errori tipici (media aggregata, qualità del dato, correlazione) ricorreva identico in ogni lezione: resta dove serve alla decisione (cultura, ricerca, diagnosi).
- I «Verdetto: …» finali sono stati assorbiti dalle frasi ★ del Riepilogo; le «Domande per verificare la tua comprensione» sono diventate le `<Domanda>` di fine sezione e il quiz.
- Gli esempi di Amazon (memo di sei pagine, Fire Phone) ricorrevano in più lezioni: i memo restano in `cultura-data-driven`, `cheat-sheet` e `caso-studio` con un taglio diverso; il Fire Phone resta in `decision-making-dati` (gut feel) e `ciclo-deming-hadi` (fase Check).
- Le frasi «Il binario di questa lezione è **ml-tabellare**…» restano come inciso nell'apertura; il campo `binario` nel frontmatter non cambia.

## Fatti da verificare con la fonte

- Amazon, memo narrativi di sei pagine dal 2004 (`cultura-data-driven`, `cheat-sheet`, `caso-studio`): la data e il divieto di slide sono nella lezione originale.
- Amazon Fire Phone (`decision-making-dati`, `ciclo-deming-hadi`): lancio nel 2014, «170 milioni di dollari di perdita», riconoscimento da parte di Bezos «nella lettera agli azionisti del 2015». Verificare cifra, lettera di riferimento e l'affermazione che «i dati descrivevano un mercato saturo e poco differenziato».
- Google e gli OKR (`okr-e-kpi`): adozione nel 1999 dopo la presentazione di John Doerr, che li aveva visti in Intel; riferimento a *Measure What Matters* (2018).
- Superhuman e il test di Sean Ellis (`framework-jtbd`): 2017-2019, soglia del 40% di utenti «molto delusi», racconto di First Round Review del 2018.
- Nielsen, 2000, cinque utenti e circa 85% dei problemi (`ricerca-quantitativa`, `interviste-profondita`).
- Airbnb e gli host giapponesi (`ricerca-quantitativa`): tasso di risposta +21%; aneddoto della lezione originale, non verificato altrove.
- Walkman / iPod / streaming come soluzioni dello stesso job (`framework-jtbd`) e il caso del trapano: esempi classici, non attribuiti a una fonte nella lezione.
- Numeri didattici (abbandono al checkout 62%→71%, mobile 78% contro desktop 52%, KR da 120 a 400 clienti enterprise, 500K nuovi clienti, 200 MQL): esempi della lezione originale, non dati reali.

## Traduzione inglese

878 stringhe nuove, aggiunte a mano a `src/data/i18n/en-static-cache.json`. Dopo la build completa: 0 stringhe introdotte e scoperte, URL invariati (778 pagine).
