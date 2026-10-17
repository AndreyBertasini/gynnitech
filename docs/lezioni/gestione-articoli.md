# Modulo 4 come articoli: scheda delle fonti

Le sette lezioni del modulo 4 (`gestione-data-driven`) riscritte come `formato: "articolo"` con `senzaCodice: true`. Piano: `docs/superpowers/plans/2026-10-17-articoli-modulo-4.md`. Prompt: `docs/lezioni/prompt-articolo-tecnico.md`. Per ogni lezione: da dove viene ogni numero, quali fatti sono stati verificati (con link e se la fonte è primaria o secondaria), quali no.

Regole di lettura:

- **Esempio dichiarato:** il testo dice «caso ricostruito» o «numeri di esempio»; i numeri sono aritmetica del caso, ricalcolata con Python.
- **Fonte secondaria:** un articolo di stampa, un blog o la scheda editoriale di un libro. Il sandbox non raggiunge nessun sito (403 sul proxy) e l'agente `web-fetch` non risolve gli host (DNS): nessuna pagina è stata letta. Le fonti e le frasi citate vengono dai risultati di `WebSearch`, che riporta titolo, URL e un riassunto; una fonte è «primaria» quando l'URL restituito è il sito dell'autore (per esempio la lettera sul sito di Amazon), ma il testo non è stato aperto.
- Un link nell'articolo è un URL restituito da una ricerca o da una pagina letta, mai costruito a memoria.

| Lezione | Parole | Durata | Stato |
|---|---|---|---|
| `cultura-data-driven` | 1.373 | 12 min | scritta, vedi sotto |
| `decision-making-dati` | 1.332 | 12 min | scritta, vedi sotto |
| `okr-e-kpi` | | | da fare |
| `framework-jtbd` | | | da fare |
| `ricerca-quantitativa` | | | da fare |
| `interviste-profondita` | | | da fare |
| `ciclo-deming-hadi` | | | da fare |

## gestione-data-driven/cultura-data-driven

**Titolo, URL, prerequisiti invariati.** Il corpo perde tutti i componenti «3 secondi» e il quiz. Tre pilastri del titolo (literacy, evidenza sopra la gerarchia, metrica condivisa) tenuti come meccanismo; il registro delle decisioni è la soluzione. Obiettivo di apprendimento 2 riscritto (da «sintomi nelle dashboard» a «segnali in un verbale e in un report»).

**Caso:** ricostruito (dichiarato), numeri di esempio.

| Numero nel testo | Fonte |
|---|---|
| 38 dashboard, 31 decisioni, 4 con un numero, 27 senza | numeri di esempio del caso dichiarato; 4 + 27 = 31 |
| 87% | 27 / 31 = 87,1% (Python) |
| 13% | 4 / 31 = 12,9% (Python) |
| «28 su 31, nove su dieci» | 28 / 31 = 90,3% (Python); obiettivo dichiarato, non misura |
| 3,1%, 15 maggio, 14 giugno | numeri e date di esempio del registro |
| «venti e trenta minuti» di lettura | fonti secondarie (sotto), «secondo le fonti» |

**Fatti verificati (fonti secondarie, più ricerche concordi):**
- Giugno 2004: email di Bezos che vieta le slide nelle riunioni dei dirigenti, motivata con l'ordine e i nessi che un memo costringe a mostrare: [CNBC, 2018](https://www.cnbc.com/2018/04/23/what-jeff-bezos-learned-from-requiring-6-page-memos-at-amazon.html). Una ricerca riporta il 9 giugno 2004; il testo dice solo «giugno 2004».
- Lettera agli azionisti del 2017, pubblicata nell'aprile 2018: memo narrativi di sei pagine, lettura silenziosa («study hall») a inizio riunione: [Office Watch](https://office-watch.com/2018/powerpoint-banned-at-amazon-jeff-bezos/) e altre cronache. La lettera non spiega perché sei pagine.
- Le fonti discordano sulla lunghezza del memo nell'email del 2004 (quattro o sei pagine) e sulla durata della lettura (venti o trenta minuti): il testo lo dichiara.

**Non verificati / tolti:** «Venti anni dopo la pratica è ancora in uso» (tolto: nessuna fonte datata). L'email originale del 2004 non è stata letta: solo citazioni di seconda mano.

## gestione-data-driven/decision-making-dati

**Titolo, URL, prerequisiti invariati.** Perde i componenti «3 secondi» e il quiz. DECIDE (Define, Evidence, Criteria, Investigate, Decide, Evaluate) è presentato come ordine di lavoro del corso, **non attribuito a un autore**. Obiettivi: il secondo passa al «vi» e se ne aggiunge uno sul processo leggero o completo.

**Caso:** ricostruito (dichiarato), numeri di esempio.

| Numero nel testo | Fonte |
|---|---|
| 15 giorni lavorativi di analisi, 20 minuti di riunione | numeri di esempio del caso dichiarato |
| 200.000 euro, 29 e 35 euro al mese, 1 giugno, 15 maggio | esempi del brief |
| Pesi 50% + 30% + 20% | somma 100 (Python) |
| «3 giorni invece di 15» | obiettivo dichiarato, non misura (nel testo) |
| 170 milioni di dollari, 83 milioni di scorte | fonti secondarie (sotto) |

**Fatti verificati (solo ricerca, nessuna pagina aperta):**
- Fire Phone, terzo trimestre 2014: svalutazione di 170 milioni di dollari, legata soprattutto alla valutazione delle scorte e ai costi degli impegni con i fornitori; circa 25 milioni internazionali; 83 milioni di scorte a fine trimestre. [Fierce](https://www.fierce-network.com/wireless/amazon-takes-170m-writedown-fire-phone), [GeekWire](https://www.geekwire.com/2014/amazon-takes-170m-loss-fire-phone/) (stampa, secondarie; il 10-Q non è comparso nei risultati). Lancio negli Stati Uniti il 25 luglio 2014, in esclusiva con AT&T (Wikipedia e altre; il testo dice «estate del 2014»).
- Lettera agli azionisti del 2018, pubblicata ad aprile 2019: «While the Fire phone was a failure, we were able to take our learnings (as well as the developers) and accelerate our efforts building Echo and Alexa». [Pagina di Amazon](https://www.aboutamazon.com/news/company-news/2018-letter-to-shareholders) (il risultato riporta la frase; CNBC e CNN la confermano). Il testo la parafrasa.
- Lettera del 2016: decisioni reversibili con un processo più leggero; la maggior parte va presa con circa il 70% dell'informazione che si vorrebbe avere; aspettare il 90% è di solito lento. [Pagina di Amazon](https://www.aboutamazon.com/news/company-news/2016-letter-to-shareholders) (riassunto del risultato).

**Corretto rispetto alla lezione precedente:** la lettera di Bezos sul Fire Phone era datata «2015»: è quella del 2018 (aprile 2019). «Perdita» diventa «svalutazione». Tolti «i dati descrivevano un mercato saturo» e «l'azienda aveva scommesso su feature uniche»: nessuna fonte, e nessuna fonte pubblica dice quali dati o quale processo ci fossero dietro la scelta di Amazon.

**Non verificati / non usati:** la dicitura «Type 1 / Type 2» per le decisioni (la ricerca non l'ha confermata nel testo della lettera; non usata); la durata dei prezzi del Fire Phone e le cifre alternative («mezzo miliardo» in una fonte, in contrasto con i 170 milioni).
