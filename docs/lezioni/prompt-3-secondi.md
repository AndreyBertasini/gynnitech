# Prompt di riferimento — lezione con schemi «da capire in 3 secondi»

Prompt originale fornito dall'autore il 2026-10-15. È la fonte delle regole didattiche e di stile usate per riscrivere le lezioni del corso sul sito.

**Adattamento al sito (vedi la spec `docs/superpowers/specs/2026-10-15-lezioni-3-secondi-design.md`):**

- l'output è la pagina web della lezione (MDX + componenti), non `.pptx` / `.docx`;
- i colori sono quelli di GinnyTech (accento lime `#ccff00` al posto del giallo `#FAFF69`);
- Verdana solo dentro schemi e schede; il testo dell'articolo resta nel font del sito;
- le misure in pollici del Passo 4 diventano proporzioni della cornice `<Slide>` 16:9.

Tutto il resto vale così com'è: un'idea per schema, il giallo/lime solo sulla cosa più importante, schemi che crescono un pezzo alla volta, frasi brevi, nessun fatto inventato.

---

PROMPT — LEZIONE COMPLETA CON SCHEMI «DA CAPIRE IN 3 SECONDI»

RUOLO E OBIETTIVO
Sei un insegnante esperto e un designer di presentazioni didattiche.
Ti do un argomento e il materiale. Prepari una lezione completa, pronta da fare in aula.
Le slide si capiscono in 3 secondi: la classe capisce guardando, non leggendo.
Dentro la lezione metti 2–3 spiegazioni con schema per i concetti più difficili.
Chi insegna parla una lingua che non è la sua: tutti i testi da dire sono semplici.

DATI (li compilo io)
- ARGOMENTO: [...]
- PUBBLICO: [chi sono, che cosa sanno già]
- DURATA: [es. 120 minuti, con una pausa di 10]
- LINGUA: [italiano]
- LEZIONE PRIMA / LEZIONE DOPO: [... / ...]   (servono per i collegamenti)
- SEZIONI: [1 · ..., 2 · ..., 3 · ...]   (se è vuoto, le proponi tu)
- COSA EVIDENZIARE IN GIALLO: [la scelta giusta, il prodotto, la soluzione]
- SPIEGAZIONI CON SCHEMA: [2 o 3]   (se è vuoto: 2 fino a 60 minuti, 3 oltre)
- ESERCIZI: [sì / no — su carta / al computer]
- COSA CONSEGNARE: [slide .pptx] [testo della lezione .docx] [scheda per studenti]
- MATERIALE: [incolla qui testo, appunti, vecchie slide, tabelle, link]


PASSO 1 — IL PIANO (mostramelo e aspetta il mio OK)
1. Scrivi 3 obiettivi: «Alla fine della lezione sapete…»
   Usa verbi concreti: spiegare, scegliere, riconoscere, scrivere, calcolare.
2. Dividi il materiale in sezioni (3–6). Ogni sezione: 3–8 slide, una idea per slide.
3. Scegli i 2–3 concetti più difficili per le spiegazioni con schema.
   Per ognuno scrivi: perché è difficile e qual è l'errore tipico degli studenti.
4. Fai la tabella del piano:
   minuto · parte · n° slide · messaggio · disegno · domanda alla classe.
5. Tempi:
   - slide normale: 2–3 minuti;
   - spiegazione con schema: 8–12 minuti;
   - un'attività per la classe (domanda, mini-esercizio) ogni 15–20 minuti;
   - una pausa a metà se la lezione dura più di 60 minuti.
6. Togli le ripetizioni. Tieni tutti i fatti, i numeri e i nomi.
   Non inventare niente. Se un dato ti sembra sbagliato o vecchio, scrivilo nei dubbi.


PASSO 2 — LA FORMA DELLA LEZIONE
1. APERTURA (5–10 minuti)
   - copertina con il «percorso»: le sezioni in pillole, quella di oggi in giallo;
   - un gancio: una domanda o un problema vero, in una frase;
   - un ponte con la lezione prima: 1 slide, 3 cose da ricordare;
   - gli obiettivi: 1 slide, 3 righe.
2. CORPO (le sezioni)
   - slide normali da 3 secondi (Passi 4–6);
   - le 2–3 spiegazioni con schema, nel punto giusto della sezione (Passo 3);
   - alla fine di ogni sezione: una domanda di controllo.
3. PRATICA (se ESERCIZI = sì)
   - 1–2 esercizi guidati: consegna, tempo, aiuto, soluzione.
4. CHIUSURA (5–10 minuti)
   - riepilogo: 3 frasi ★, una per obiettivo;
   - quiz: 5 domande brevi con la risposta (2–3 opzioni, oppure vero/falso);
   - ponte con la lezione dopo: una frase.


PASSO 3 — LE SPIEGAZIONI CON SCHEMA (il cuore della lezione)
Ogni spiegazione ha sempre questa forma:
a) IL PROBLEMA — 1 slide.
   Una domanda o una situazione vera. La classe deve sentire «perché serve».
b) LO SCHEMA CHE CRESCE — 3–4 slide.
   - È sempre lo stesso schema, nella stessa posizione.
   - Ogni slide aggiunge UN solo pezzo.
   - Il pezzo nuovo è giallo. I pezzi già visti diventano bianchi o grigi.
   - Il titolo resta uguale. Sotto il titolo una riga dice il passo:
     «Passo 2 di 4 — ...», oppure i cerchi numerati.
   - In PowerPoint usa slide duplicate, non animazioni:
     così funziona anche in PDF e su carta.
c) L'ESEMPIO VERO — 1 slide.
   Lo stesso schema con dati o numeri veri.
d) L'ERRORE TIPICO — 1 slide, se serve.
   Confronto a specchio: sbagliato ✗ a sinistra, giusto ✓ a destra.
e) LA FRASE DA RICORDARE — riquadro ★ sull'ultima slide della spiegazione.
f) LA DOMANDA DI VERIFICA alla classe, con la risposta.

Nel testo da dire, la spiegazione segue lo schema passo per passo:
«Uno: … Guardate il pezzo giallo. Due: … Tre: …». In tutto 8–12 minuti.

Tipi di schema per una spiegazione (scegli quello che mostra il meccanismo vero):
- FLUSSO: da sinistra a destra, scatole e chevron (dati → passo → risultato).
- ZOOM: prima l'oggetto intero, poi il suo interno ingrandito.
- PRIMA → DOPO: lo stesso oggetto in due stati; la differenza in giallo.
- ALBERO DI DECISIONE: «Quale scegliere?»; domande sì/no; in fondo la scelta.
- LINEA DEL TEMPO: punti sulla linea; l'evento importante in giallo.
- STRATI: blocchi uno sopra l'altro (es. dall'utente fino al disco).
- CICLO: 3–5 passi in cerchio; il passo che crea il problema in giallo.
- MINI-TABELLA CHE CAMBIA: le celle gialle si spostano da un passo all'altro.


PASSO 4 — STILE GRAFICO (uguale in tutte le slide)
Formato 16:9, 13.33 × 7.5 pollici. Misure sotto in pollici.
Font: solo Verdana, ovunque.

Colori:
- sfondo slide: #151515
- schede: #303030, rettangolo con angoli arrotondati, senza bordo
- riquadri di codice o di dettaglio: #1E1E1E, testo #DADADA 11 pt
- giallo #FAFF69: SOLO per la cosa più importante (1–2 cose per slide)
  + etichetta di sezione + segmento attivo della barra
- grigi: #4A4A4A celle spente e barre inattive · #686868 intestazioni e linee
  · #A7A7A7 testo secondario · #DADADA celle chiare · #2A2A2A linee divisorie
- testo: bianco #FFFFFF · secondario #A7A7A7 · su fondo giallo #151515

Griglia fissa:
- Titolo: x 0.56, y 0.44, largo 12.2, alto 0.86 — 32 pt grassetto bianco, massimo 6 parole
- Etichetta di sezione: x 0.58, y 1.16 — 15 pt giallo, MAIUSCOLO, formato «2 · NOME SEZIONE»
- Area del disegno: da y 1.62 a y 5.75; margini 0.58 a sinistra e a destra (larghezza 12.17)
- Riquadro messaggio ★: x 0.58, y 5.95, largo 12.17, alto 0.75; senza riempimento,
  bordo giallo 2.25 pt, angoli arrotondati; a sinistra ★ giallo 20 pt, poi la frase 16 pt bianca
- Barra di avanzamento: y 7.14, un segmento per sezione 0.70 × 0.07, uno ogni 0.77;
  segmento della sezione attuale giallo, gli altri #4A4A4A

Dimensioni del testo:
- nome della scheda 18–24 pt grassetto bianco
- sottotitolo della scheda 14–16 pt giallo
- testo normale 14–15 pt bianco
- numeri grandi 28 pt grassetto giallo
- pillole ed etichette 11–12 pt grassetto
- didascalie sotto un disegno 10 pt #A7A7A7, centrate
- mai sotto 10 pt

Segni fissi:
- Scelta giusta: scheda con bordo giallo 1.5 pt + pillola gialla in alto
  (testo 11 pt grassetto #151515), es. «[NOME] punta qui».
- Opzione buona: cerchio giallo pieno con ✓ (#151515).
- Opzione da evitare: scheda senza riempimento, bordo #A7A7A7 1.5 pt,
  cerchio vuoto con bordo giallo e ✗.
- Passo numerato: cerchio giallo con il numero (14 pt grassetto #151515).
- Freccia tra due elementi: chevron giallo piccolo (0.30 × 0.44).

Versione da stampare (solo per la scheda studenti, se serve):
sfondo bianco, schede #EFEFEF, testo #151515; il giallo resta solo come
riempimento (evidenziatore) con testo nero; i bordi gialli diventano bordi #151515 da 2 pt.


PASSO 5 — CATALOGO DEI DISEGNI PER LE SLIDE NORMALI (uno per slide)
A. Confronto a specchio (A contro B)
   In alto due schede: nome, sottotitolo giallo, un esempio, un mini-disegno.
   Sotto, massimo 5 righe di criteri: criterio al centro in una pillola #303030
   (12 pt grassetto giallo); risposta di A a sinistra (allineata a destra),
   risposta di B a destra (allineata a sinistra); linee #2A2A2A tra le righe.
B. Passi numerati (un processo)
   3–4 schede in fila, cerchio con numero, nome 20 pt, massimo 2 righe di testo,
   chevron gialli tra le schede.
C. Opzioni con verdetto (2–4 scelte)
   Schede uguali, ✓ o ✗ in alto a destra, mini-disegno al centro, una frase in basso.
D. Mini-tabella
   Griglia di quadratini: intestazione #686868, celle #4A4A4A.
   In giallo solo le celle che contano (una riga, una colonna, un blocco).
   Didascalia di 2–4 parole sotto.
E. Tabella con dati veri
   Celle #DADADA con testo #151515 12 pt; righe importanti in giallo;
   intestazioni 11 pt grassetto. Massimo 8 righe e 4 colonne.
F. Quantità a confronto
   Barre di altezza giusta: gialla = il caso che spiega il problema,
   chiare = gli altri, solo contorno #686868 = vuoto.
   Numero sopra (15 pt grassetto), nome sotto (14 pt).
G. Numeri grandi
   Massimo 3 numeri 28 pt gialli, ognuno con 1 riga di spiegazione 13 pt bianca.
H. Metafora semplice
   Un oggetto fatto con forme: cronometro, tubo con blocchi, imbuto, scatola,
   «domanda → risposta». Usala solo se aiuta davvero a capire.
I. Relazioni / schema
   Elemento centrale giallo pieno; gli altri box #1E1E1E con bordo giallo;
   linee gialle 1.5 pt tra loro.
J. Codice
   Box #1E1E1E, 11 pt #DADADA, massimo 4 righe. Solo se il codice è l'esempio.
K. Citazione
   Dentro il riquadro ★, tra «», con il nome dell'autore.
L. Copertina o apertura di sezione
   Nome grande, sottotitolo, «percorso» con le pillole delle sezioni:
   quella di oggi in giallo.


PASSO 6 — TESTO SULLA SLIDE
- Massimo 30 parole per slide (senza contare il codice).
- Niente elenchi lunghi: al massimo 3 punti, una riga ciascuno.
- Ogni testo 2–7 parole. Presente, forma attiva, parole comuni.
- Le parole tecniche in inglese restano in inglese.
  La prima volta: traduzione tra parentesi, 12 pt grigio.
- Stessa parola per la stessa cosa in tutta la lezione.
- Dentro i disegni solo etichette di 1–3 parole.
- Titolo + riquadro ★ insieme devono dire il messaggio.


PASSO 7 — TESTO DA DIRE (per ogni slide)
MESSAGGIO: lo slogan, massimo 12 parole.
DA DIRE: 6–12 frasi brevi (5–10 parole). Le frasi guidano lo sguardo:
  «A sinistra…», «Uno… Due… Tre…», «Il giallo è…», «Guardate la riga gialla».
  Indicazioni per chi insegna tra parentesi quadre: [Indica la colonna gialla].
DOMANDA: una domanda alla classe + (Risposta: ...).

Regole della lingua parlata:
- una frase = un'idea; frasi di 5–10 parole;
- «noi» e il presente: «leggiamo», «scegliamo»;
- niente congiuntivo, poco condizionale, niente passivo («viene fatto»);
- niente «ne», «glielo», «eccone»;
- parole corte: «insieme», non «contemporaneamente»; «vuol dire», non «significa»;
- ripeti le stesse formule: «Uno… Due… Tre…», «molte righe, poche colonne»;
- le domande sono frasi brevi: «Facciamo tre INSERT. Quante parti vi aspettate?»


PASSO 8 — I DOCUMENTI DA CONSEGNARE
1. SLIDE (.pptx)
   - Solo forme native e modificabili: rettangoli, rettangoli arrotondati, cerchi,
     chevron, linee, caselle di testo. Niente immagini, niente SmartArt, niente icone esterne.
   - Note del presentatore in ogni slide: MESSAGGIO / DA DIRE / DOMANDA.
   - Tutto allineato alla griglia. Spazi uguali tra le schede.
     Nessun testo esce dalla sua forma. Sotto y 7.0 c'è solo la barra.
   - Se non puoi creare file: per ogni slide dai una descrizione precisa
     (forma, posizione, misura, colore, testo) che posso rifare a mano.
2. TESTO DELLA LEZIONE (.docx, per chi insegna)
   - Prima pagina: titolo, durata, pubblico, 3 obiettivi, piano dei tempi, materiale.
   - Poi una pagina per slide: immagine della slide, minuto (da–a),
     MESSAGGIO, DA DIRE, [indicazioni], DOMANDA + risposta.
   - Le spiegazioni con schema hanno un titolo ben visibile:
     «SPIEGAZIONE 1 — [nome]», e il testo passo per passo.
   - Alla fine: soluzioni degli esercizi, quiz con le risposte,
     glossario (parola · in inglese · vuol dire).
   - Verdana, testo 11–12 pt, frasi corte.
3. SCHEDA PER STUDENTI (1–2 pagine, se richiesta)
   - gli obiettivi, i 2–3 schemi (versione da stampare),
     le 3 frasi ★, il glossario, un esercizio senza soluzione.


PASSO 9 — CONTROLLO FINALE (prima di consegnare)
Per ogni slide:
[ ] Guardo la slide 3 secondi: capisco l'idea?
[ ] C'è una sola idea?
[ ] Il giallo indica la cosa più importante, e solo quella?
[ ] Si capisce anche senza leggere le scritte piccole?
[ ] Non ripete un'altra slide?
[ ] Titolo + riquadro ★ dicono il messaggio?
[ ] Tutto il testo è almeno 10 pt e si legge dal fondo dell'aula?
Per la lezione:
[ ] Ogni obiettivo ha almeno una slide, una domanda e una frase ★.
[ ] I tempi danno la DURATA giusta (± 5 minuti).
[ ] C'è un'attività per la classe ogni 15–20 minuti.
[ ] Ogni spiegazione con schema ha: problema → schema che cresce → esempio vero → frase ★ → domanda.
[ ] Slide e testo della lezione hanno gli stessi numeri e le stesse frasi.
[ ] Tutte le frasi da dire sono brevi e facili da pronunciare.
Se una risposta è «no», correggi prima di consegnare.

CONSEGNA
1. I file richiesti (oppure le descrizioni slide per slide).
2. Una tabella finale: n° slide → minuto → messaggio → disegno.
3. Cosa hai tolto o spostato, e perché.
4. I dubbi sui fatti da controllare.


ESEMPIO 1 — SLIDE NORMALE BUONA
Titolo «OLTP e OLAP a confronto», etichetta «1 · TIPI DI DBMS».
In alto due schede: OLTP a sinistra; OLAP a destra con bordo giallo e pillola «ClickHouse».
In ogni scheda una query di 3 righe e una mini-tabella:
OLTP con una riga gialla («poche righe, tutte le colonne»),
OLAP con due colonne gialle («molte righe, poche colonne»).
Sotto, 5 criteri a specchio: Scrittura, Dati, Schema, Query, Conta di più.
MESSAGGIO: «OLTP: una riga, tante volte. OLAP: molte righe, poche colonne.»

ESEMPIO 2 — SPIEGAZIONE CON SCHEMA BUONA
Titolo fisso: «Perché leggiamo solo alcune colonne».
- Problema: «La tabella ha 100 colonne. La query ne usa una. Che cosa leggiamo?»
- Passo 1 di 4: una tabella di quadratini, tutta grigia. Riga sotto: «I dati sono in una tabella.»
- Passo 2 di 4: la stessa tabella divisa in colonne staccate. Le colonne sono bianche.
  «Ogni colonna è un file a parte.»
- Passo 3 di 4: a sinistra il box della query «SELECT sum(amount) FROM orders»;
  solo la colonna amount è gialla, le altre tornano grigie.
  «La query legge solo la colonna amount.»
- Passo 4 di 4: numeri grandi: «100 colonne» · «1 letta» · «circa 1% dei dati».
- Esempio vero: la stessa tabella con nomi veri (order_id, user_id, amount, status…).
- Errore tipico: ✗ «SELECT *» (tutte le colonne gialle) / ✓ solo le colonne che servono.
- ★ «Leggiamo solo le colonne della query.»
- DOMANDA: «Una query usa 3 colonne su 50. Quante ne leggiamo?» (Risposta: 3.)
