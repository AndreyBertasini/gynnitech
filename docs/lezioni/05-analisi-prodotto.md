# Modulo 5 · Analisi di prodotto (analisi-prodotto)

> Riscritto nel formato «3 secondi» (spec: `docs/superpowers/specs/2026-10-15-lezioni-3-secondi-design.md`, §12a). Questa scheda dice che cosa è cambiato e quali fatti vanno verificati. Per le lezioni di questo modulo non c'è stato un piano approvato lezione per lezione: l'autore ha chiesto di riscrivere tutti i moduli.

## Lezioni (ordine del modulo)

| # | File | Sezioni | Schemi | Quiz |
|---|---|---|---|---|
| 1 | `introduzione-product-analytics` | 5 | 2: Il loop in quattro caselle, Sei passi dalla dashboard all'azione | 5 |
| 2 | `retention-framework` | 4 | 2: Sei passi per la retention di coorte, Come smontiamo una media stabile | 5 |
| 3 | `customer-development` | 4 | 2: Sei domande su fatti passati, Sei passi dalla nota alla roadmap | 5 |
| 4 | `analisi-coorte` | 5 | 2: Sei passi per le coorti comportamentali, Cinque transizioni, cinque owner | 5 |
| 6 | `ux-research` | 4 | 2: Quattro cause dell'abbandono, Sei passi dalla falla alla causa | 5 |
| 7 | `nps-net-promoter-score` | 4 | 2: Sei passi per costruire il segnale, Il loop di Stripe in tre passi | 5 |
| 8 | `ab-testing` | 4 | 2: Il protocollo in sei passi, Sei anti-pattern da riconoscere | 5 |
| 9 | `prioritizzazione-feature` | 5 | 2: Sei passi per ordinare il backlog, Cinque errori, cinque sintomi | 5 |
| 10 | `product-market-fit` | 4 | 2: Sei passi per riconoscere il fit, Tre falsi positivi classici | 5 |
| 11 | `caso-studio` | 5 | 2: Il metodo in sei passi, Tre orizzonti di intervento | 5 |
| 12 | `cheat-sheet` | 4 | 2: Sei mosse prima di ogni decisione, Tre controlli sui conteggi | 5 |

Le undici lezioni non avevano un quiz: i 5 quesiti di ciascuna sono nuovi. Il numero d'ordine 5 non esiste nel modulo.

## Cosa è stato tolto o spostato

- I blocchi «Cosa imparerai» e «Collegamenti», le etichette «Percorso collegato» e «Collegamento tematico»: tolti, link intatti.
- Le tabelle generiche ripetute («Passaggio | Domanda da fare | Output atteso», «Evidenza osservata | Lettura prudente | Azione consigliata», «Elemento | Definizione operativa | Controllo minimo»): tolte, tranne la lettura prudente, che resta in `introduzione-product-analytics` (come slide) e in `cheat-sheet`.
- I blocchi SQL e Python sono stati tenuti solo dove spiegano la decisione: le soglie dei segmenti, la matrice di transizione e l'LTV per segmento (`analisi-coorte`), il funnel con `LAG` (`ux-research`), il calcolo del campione e il confronto per segmento (`ab-testing`), il funnel di onboarding (`caso-studio`) e la retention di coorte (`cheat-sheet`). Sono stati tolti: la query di retention settimanale e quella sulle coorti del primo mese (`analisi-coorte`), lo stickiness trend e la retention D30 per canale (`caso-studio`), la regressione con SHAP (`caso-studio`), le tre query di retention, activation e LTV (`cheat-sheet`).
- Tre errori nel codice originale, corretti o tolti:
  - `ab-testing`: il testo diceva «circa 1.500 utenti per variante» per baseline 34%, effetto minimo +4 punti, alfa 5%, potenza 80%. Il calcolo corretto è circa 2.260 (con la formula standard per due proporzioni); la durata cambia di conseguenza (basta un ciclo settimanale con 5.000 utenti a settimana, non tre settimane).
  - `cheat-sheet`: la query di retention usava una colonna `retention_rate` mai definita e un denominatore sbagliato. Riscritta con la dimensione iniziale della coorte al denominatore e il filtro sulle coorti mature.
  - `caso-studio`: la query dello stickiness calcolava un DAU senza senso; è stata tolta.
- `prioritizzazione-feature`: i conti dell'esempio RICE e WSJF sono stati ricontrollati e sono corretti (10.200, 1.620, 2.700; 5.000 e 2.000).
- Gli esempi di Google (41 sfumature di blu) ricorrevano in tre lezioni: restano in `ab-testing` e `prioritizzazione-feature`; nel `cheat-sheet` è stato tolto.
- I «Verdetto: …» finali sono stati assorbiti dalle frasi ★ del Riepilogo; le «Domande per verificare» sono diventate le `<Domanda>` di fine sezione e il quiz.
- Le frasi «Il binario di questa lezione è **ml-tabellare**…» restano come inciso nell'apertura; il campo `binario` nel frontmatter non cambia.

## Fatti da verificare con la fonte

- Facebook e i sette amici in dieci giorni (`introduzione-product-analytics`): attribuito al growth team guidato da Chamath Palihapitiya, «centinaia di milioni di account».
- Netflix 2012, «22 percento dei power user» che diventano regular in due mesi e «9 percento» dopo sei mesi (`retention-framework`, `analisi-coorte`): cifra e anno **non verificati**; la lezione li presenta come «secondo la lezione originale». Da confermare o togliere.
- Revolut, da cambio valuta monouso a super-app (`retention-framework`): aneddoto non verificato, presentato come «secondo la lezione originale».
- Dropbox, 5.000 → 75.000 indirizzi in una notte (`customer-development`): il testo originale diceva «su Hacker News»; la piattaforma non è nominata perché le ricostruzioni divergono (Digg o Hacker News).
- Airbnb 2009, foto professionali, prenotazioni «da due a tre volte» (`ux-research`): da confermare con la fonte originale.
- Spotify, Discover Weekly e Daily Mixes (`ux-research`): la causalità dei dati sulla ricerca è della lezione originale.
- Reichheld 2003, Harvard Business Review, con Bain and Company (`nps-net-promoter-score`). Nel testo originale c'erano anche un'affermazione su Netflix (promotori che abbandonano il 10-25% in meno) e una su Apple: sono state tolte perché non verificabili.
- Stripe e il workflow su feedback CSAT delle pagine di documentazione (`nps-net-promoter-score`): dalla lezione originale.
- Kohavi e i titoli di Bing, +12% di revenue per ricerca (`ab-testing`); Google, 41 sfumature di blu, circa 200 milioni di dollari l'anno, New York Times 2009 (`ab-testing`, `prioritizzazione-feature`).
- Intercom e il framework RICE (`prioritizzazione-feature`): il testo originale indicava il 2013; l'anno è stato tolto perché la formalizzazione pubblica di RICE è successiva.
- Superhuman, test di Sean Ellis, soglia del 40%, First Round Review 2018 (`product-market-fit`).
- Strava, oltre 100 milioni di atleti nel 2022 (`caso-studio`).
- FitTrack (`caso-studio`): è un caso didattico inventato; tutti i suoi numeri sono illustrativi e il testo lo dichiara.
- Benchmark delle transizioni B2C (20-40%, 30-50%, 10-25%, 5-15%, 3-8%) in `analisi-coorte`: indicazioni della lezione originale, non attribuite a una fonte.

## Traduzione inglese

1165 stringhe nuove, aggiunte a mano a `src/data/i18n/en-static-cache.json`. Dopo la build completa: 0 stringhe introdotte e scoperte, URL invariati (778 pagine).
