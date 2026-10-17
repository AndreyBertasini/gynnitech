# Modulo 4 · Gestione data-driven (gestione-data-driven)

> Riscritto nel formato «3 secondi» (spec: `docs/superpowers/specs/2026-10-15-lezioni-3-secondi-design.md`, §12a). Questa scheda dice che cosa è cambiato e quali fatti vanno verificati. Per le lezioni di questo modulo non c'è stato un piano approvato lezione per lezione: l'autore ha chiesto di riscrivere tutti i moduli.

## Aggiornamento 2026-10-17: sette lezioni come articoli

Le lezioni 1–7 (`cultura-data-driven`, `decision-making-dati`, `okr-e-kpi`, `framework-jtbd`, `ricerca-quantitativa`, `interviste-profondita`, `ciclo-deming-hadi`) sono passate dal formato «3 secondi» al formato «articolo» (`formato: "articolo"`, `senzaCodice: true`), con il prompt dell'autore adattato a un modulo senza codice. Restano «3 secondi» `cheat-sheet` e `caso-studio`, che non sono articoli; se ne sono corretti solo due fatti. Le tabelle sotto («Sezioni», «Schemi», «Quiz») descrivono quindi solo quelle due lezioni. Piano: `docs/superpowers/plans/2026-10-17-articoli-modulo-4.md`. Fonte di ogni numero, fatti verificati e non verificati, lezione per lezione: `docs/lezioni/gestione-articoli.md`.

**Fatti verificati o corretti** (solo ricerche: nessuna pagina è stata aperta, perché il sandbox non raggiunge i siti):

- **Fire Phone:** la lettera di Bezos che lo cita è quella del 2018, uscita nell'aprile 2019, non del 2015. I 170 milioni di dollari sono una svalutazione del terzo trimestre 2014, legata a scorte e impegni con i fornitori (a fine trimestre restavano 83 milioni di «esposizione residua» tra scorte, scorte presso i rivenditori e impegni non annullabili: 10-Q di Amazon), non una «perdita». «I dati descrivevano un mercato saturo» e «feature uniche» sono tolti: nessuna fonte pubblica documenta il processo interno.
- **Amazon, memo:** il divieto delle slide è dell'email del giugno 2004; i memo narrativi di sei pagine, letti in silenzio, sono quelli descritti nella lettera del 2017 (aprile 2018). Le fonti discordano sulla lunghezza nel 2004 (quattro o sei pagine). `cheat-sheet` e `caso-studio` allineati.
- **OKR e Google:** circa tre Key Result per Objective e un risultato tra il 60 e il 70% come tipico (fonti su Google); adozione nel 1999 secondo le fonti consultate; Drucker → Grove (Intel) → Doerr. `cheat-sheet` allineato.
- **Superhuman:** 22% → circa 33% restringendo al gruppo che amava il prodotto → 58% in tre trimestri (First Round Review). La «riprogettazione dell'onboarding» non è confermata. Il metodo non si presenta come Jobs to be done: nella lezione è un esempio di sondaggio, nel caso difficile.
- **Nielsen, cinque utenti:** vale per i test di usabilità qualitativi (31% medio → circa 85%), non come numero per le interviste; per le interviste NN/g scrive che non esiste un numero d'oro. Guest, Bunce e Johnson 2006 (sessanta interviste): le cifre su dodici e sei interviste vengono da sintesi secondarie.
- **Airbnb e gli host giapponesi (+21%):** tolto, nessuna fonte.
- **HADI:** nessun autore né data di origine citabili; non è presentato come «adattamento del PDCA». PDCA: Shewhart, Deming, Giappone intorno al 1950-51 (fonti discordi sull'anno).

## Lezioni (ordine del modulo)

> Storico: le righe 1–7 descrivono il formato «3 secondi» fino al 2026-10-17. Oggi sono articoli (vedi sopra).

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

> Storico: elenco della riscrittura «3 secondi» del 2026-10-16. Gli esiti della verifica sono nell'aggiornamento in alto e in `docs/lezioni/gestione-articoli.md`; tre voci di questo elenco (lettera del Fire Phone «2015», onboarding di Superhuman, Airbnb) sono state smentite o tolte.

- Amazon, memo narrativi di sei pagine dal 2004 (`cultura-data-driven`, `cheat-sheet`, `caso-studio`): la data e il divieto di slide sono nella lezione originale.
- Amazon Fire Phone (`decision-making-dati`, `ciclo-deming-hadi`): lancio nel 2014, «170 milioni di dollari di perdita», riconoscimento da parte di Bezos «nella lettera agli azionisti del 2015». Verificare cifra, lettera di riferimento e l'affermazione che «i dati descrivevano un mercato saturo e poco differenziato».
- Google e gli OKR (`okr-e-kpi`): adozione nel 1999 dopo la presentazione di John Doerr, che li aveva visti in Intel; riferimento a *Measure What Matters* (2018).
- Superhuman e il test di Sean Ellis (`framework-jtbd`): sequenza allineata a `marketing-data-science/pmf`: 22% di «molto delusi», poi segmentazione e riprogettazione dell'onboarding, poi 58%; soglia del 40% di Sean Ellis; racconto di First Round Review del 2018. L'intervallo «2017-2019» della lezione originale è stato tolto perché non verificato.
- Nielsen, 2000, cinque utenti e circa 85% dei problemi (`interviste-profondita`): riguarda i test di usabilità e in quella lezione è presentato come tale. In `ricerca-quantitativa` non è più citato.
- Airbnb e gli host giapponesi (`ricerca-quantitativa`): tasso di risposta +21%; aneddoto della lezione originale, non verificato altrove.
- Walkman / iPod / streaming come soluzioni dello stesso job (`framework-jtbd`) e il caso del trapano: esempi classici, non attribuiti a una fonte nella lezione.
- Numeri didattici (abbandono al checkout 62%→71%, mobile 78% contro desktop 52%, KR da 120 a 400 clienti enterprise, 500K nuovi clienti, 200 MQL): esempi della lezione originale, non dati reali.

## Correzioni dopo la revisione (2026-10-16)

- `ricerca-quantitativa`: «cinque-otto interviste» è presentato come euristica di partenza («ci fermiamo quando non emergono pattern nuovi»), non più attribuito a Nielsen, che parla di test di usabilità. Il confronto mobile 78% / desktop 52% descrive una differenza di livello, non il «movimento» dei segmenti, che da una sola istantanea non si deduce.
- `framework-jtbd`: la sequenza di Superhuman era invertita rispetto a `marketing-data-science/pmf`; ora è 22% → segmentazione e onboarding → 58%.

## Traduzione inglese

878 stringhe nuove, aggiunte a mano a `src/data/i18n/en-static-cache.json`. Dopo la build completa: 0 stringhe introdotte e scoperte, URL invariati (778 pagine).
