# Modulo 4 come articoli: scheda delle fonti

Le sette lezioni del modulo 4 (`gestione-data-driven`) riscritte come `formato: "articolo"` con `senzaCodice: true`. Piano: `docs/superpowers/plans/2026-10-17-articoli-modulo-4.md`. Prompt: `docs/lezioni/prompt-articolo-tecnico.md`. Per ogni lezione: da dove viene ogni numero, quali fatti sono stati verificati (con link e se la fonte è primaria o secondaria), quali no.

Regole di lettura:

- **Esempio dichiarato:** il testo dice «caso ricostruito» o «numeri di esempio»; i numeri sono aritmetica del caso, ricalcolata con Python.
- **Fonte secondaria:** un articolo di stampa, un blog o la scheda editoriale di un libro. Il sandbox non raggiunge i siti primari (403 sul proxy); le fonti si trovano con una ricerca e si leggono con l'agente `web-fetch` quando la pagina è pubblica.
- Un link nell'articolo è un URL restituito da una ricerca o da una pagina letta, mai costruito a memoria.

| Lezione | Parole | Durata | Stato |
|---|---|---|---|
| `cultura-data-driven` | 1.373 | 12 min | scritta, vedi sotto |
| `decision-making-dati` | | | da fare |
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
