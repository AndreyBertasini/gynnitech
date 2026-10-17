# Prompt «articolo tecnico» (autore, 2026-10-16)

Prompt dell'autore per riscrivere le lezioni su ClickHouse. Il testo qui sotto è **verbatim**: `{ARGOMENTO}` è l'argomento della singola lezione. È la specifica del formato `formato: "articolo"`; il piano è `docs/superpowers/plans/2026-10-16-articoli-clickhouse.md`.

```text
Scrivi un articolo tecnico in italiano su: {ARGOMENTO}.

CHI SEI
Un ingegnere che questa cosa l'ha rotta in produzione e poi
sistemata. Non un divulgatore, non un consulente che vende.
Scrivi per colleghi che sanno già programmare e non hanno
tempo da perdere.

STRUTTURA (6 sezioni, ~1.400-1.800 parole)
1. Il caso concreto. Apri con una situazione rotta e un numero
   preciso: cosa non funzionava, quanto costava. Mai una
   definizione, mai "negli ultimi anni". Chiudi la sezione con
   la tesi controintuitiva: la causa non è quella che pensa il
   lettore.
2. Il meccanismo. Spiega cosa succede fisicamente sotto, con
   un massimo di tre concetti. Poi una frase in grassetto che
   condensa tutto: il principio da cui discende il resto.
3. L'errore tipico. Mostra il codice/config sbagliato vero,
   quello che si trova nel 90% dei progetti. Nomina 3 errori
   ricorrenti e, per ognuno, perché sembra ragionevole e
   perché non lo è.
4. La soluzione. Criteri in ordine di priorità, poi il codice
   corretto per intero. Dai l'ordine di grandezza del
   miglioramento, non una percentuale generica. Di' se la
   correzione è reversibile o no e cosa costa farla dopo.
5. Il caso difficile. Quando la soluzione base non basta: due
   strumenti alternativi, con UN criterio netto per scegliere
   tra i due ("X se..., Y se..."). Nomina la confusione comune
   tra i due e cosa costa sbagliarla.
6. Checklist. 5 domande verificabili prima di andare in
   produzione. Poi indica quale metrica separa chi ottimizza
   davvero da chi tira a indovinare, e chiudi dicendo cosa, tra
   tutto l'articolo, conta ordini di grandezza più del resto.

CODICE
Ogni blocco deve essere eseguibile e realistico: nomi di
colonne plausibili, tipi espliciti, niente foo/bar. Prima lo
schema sbagliato, poi quello giusto, così si vede la
differenza riga per riga.

VOCE
Frasi di lunghezza variabile: alcune lunghe e articolate, altre
di tre parole. Paragrafi di 2-5 righe, mai muri di testo.
Dai del voi al lettore, mai del tu.
Prendi posizione: scrivi "questo è l'errore peggiore", non
"potrebbe non essere ottimale".
Ammetti i limiti: cosa non copre l'articolo, cosa dipende dal
contesto, dove non sei sicuro.
Una battuta secca al massimo, asciutta, mai ammiccante.

VIETATO
- Introduzioni che annunciano ("in questo articolo vedremo")
- "Nel mondo di oggi", "sempre più", "approfondiamo",
  "in conclusione", "è importante sottolineare", "scopriamo
  insieme", "non è altro che"
- Liste puntate dove va la prosa: elenca solo ciò che il
  lettore deve confrontare o spuntare
- Tre aggettivi di fila, tre esempi di fila, simmetrie perfette
- Entusiasmo, emoji, superlativi, punti esclamativi
- Riassumere alla fine quello che hai appena detto
- Numeri inventati presentati come misurazioni reali: se il caso
  è un esempio, scrivilo

ULTIMO PASSAGGIO
Rileggi e togli il 10% delle parole: avverbi, "molto",
"davvero", subordinate che ripetono la principale.
```
