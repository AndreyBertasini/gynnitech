# Audit visuale GinnyTech — 2026-02-16

## Metodo di analisi
- Avvio sito in locale (`astro dev`) e revisione visuale via browser automatizzato.
- Verifica dei template principali e delle tipologie pagina (marketing, blog, corso, lesson/docs).
- Build completa per confermare la copertura del sito generato.

## Copertura
Build statica rilevata: **159 pagine**.

Distribuzione:
- `/` (homepage): 1
- `/about`, `/contact`, `/consulting`, `/glossario`, `/perche-questo-corso`, `/privacy`: 6
- `/blog/*`: 7
- `/course/*`: 134
- `/corso/*` (pagine starlight): 11

## Cosa funziona già bene
1. **Coerenza visuale forte**: look&feel “dark + neon” ben mantenuto su tutte le sezioni.
2. **Gerarchia tipografica chiara** nelle hero (home, corso, blog).
3. **Card system consistente** per moduli corso, articoli blog e blocchi informativi.
4. **Pagine lesson/course leggibili** con TOC laterale e struttura didattica ordinata.

## Migliorie consigliate (priorità alta)

### 1) Ridurre i “vuoti verticali” nelle pagine brevi
**Pagine impattate:** `contact`, `blog`, `about`, `privacy` (quando il contenuto è poco).

- Problema: dopo il contenuto principale rimane molto spazio nero prima del footer.
- Effetto: la pagina sembra “incompleta” e poco rifinita.
- Suggerimento:
  - usare un layout con `min-height` calibrata e footer “più vicino” al contenuto;
  - aggiungere una sezione finale riutilizzabile (“CTA / risorsa consigliata / newsletter / prossimo step”) per riempire il finale in modo utile.

### 2) Aumentare il contrasto del testo secondario
**Pagine impattate:** card blog, card contatti, metadati mini su homepage e corso.

- Problema: in diversi blocchi il testo descrittivo grigio su sfondo molto scuro è al limite del contrasto percepito.
- Effetto: leggibilità inferiore su monitor con bassa luminosità.
- Suggerimento:
  - schiarire il colore del body text secondario;
  - aumentare leggermente peso/font-size nei testi sotto i titoli card.

### 3) Rafforzare gli stati hover/focus delle card cliccabili
**Pagine impattate:** `/course`, `/blog`, `/contact`.

- Problema: molte card sono cliccabili ma il feedback visivo può essere più evidente.
- Effetto: affordance migliorabile, specialmente desktop.
- Suggerimento:
  - su hover: micro-lift + border glow leggero + icona/freccia che si anima;
  - su focus-visible: outline evidente e coerente con il colore brand.

### 4) Migliorare la gerarchia CTA sulle pagine statiche
**Pagine impattate:** `about`, `contact`, `consulting`, `perche-questo-corso`.

- Problema: CTA primaria presente nel navbar, ma non sempre ribadita in modo forte nel contenuto.
- Effetto: conversion path meno diretto.
- Suggerimento:
  - inserire una CTA primaria “sticky light” a metà/fine pagina;
  - aggiungere CTA secondaria contestuale (“Vedi percorso”, “Leggi case study”, “Prenota call 15 min”).

## Migliorie consigliate (priorità media)

### 5) Uniformare lo spacing tra sezioni nelle hero e blocchi successivi
- In alcune pagine il passaggio hero → grid è perfetto, in altre risulta più “compresso” o troppo ampio.
- Suggerimento: definire token verticali fissi (`section-gap-sm/md/lg`) e applicarli in modo sistematico.

### 6) Dare più personalità visuale alle pagine testuali
**Pagine impattate:** `privacy`, `glossario`, alcune pagine corso introduttive.

- Suggerimento:
  - aggiungere callout/icone per sezioni chiave;
  - introdurre “anchor navigation” flottante nelle pagine lunghe;
  - valorizzare blocchi FAQ/riepilogo con sfondi differenziati.

### 7) Bilanciare glow/effetti nei titoli principali
- Alcuni headline con glow sono molto forti e possono ridurre la nitidezza del testo.
- Suggerimento: ridurre blur/intensità glow su viewport piccoli e monitor a densità minore.

## Migliorie consigliate (priorità bassa)

### 8) Consistenza microcopy UI
- Uniformare la capitalizzazione tra etichette italiane/inglesi (es. nomi modulo, bottoni, meta).
- Evitare mix non necessario tra “Call”, “Corso”, “Lesson” se esiste equivalente italiano nella stessa vista.

### 9) Arricchire il footer per pagine con poco contenuto
- Inserire mini blocco “risorse più viste” o “inizia da qui” per aumentare utilità e ridurre effetto “spazio vuoto”.

### 10) Inserire segnali di progressione visuale nelle pagine corso
- Aggiungere indicatori progressivi più visibili (es. barra avanzamento modulo/lezione) su listing e lesson, non solo nel contenuto didattico.

## Roadmap suggerita (rapida)

### Sprint 1 (1-2 giorni)
- Riduzione vuoti verticali + CTA finale su pagine statiche.
- Contrasto testo secondario (token colore).
- Hover/focus states più visibili sulle card.

### Sprint 2 (2-3 giorni)
- Standardizzazione spacing tra sezioni.
- Restyling leggero pagine testuali (privacy/glossario).
- Tuning glow titoli.

### Sprint 3 (opzionale)
- Coerenza microcopy completa.
- Footer “intelligente” con risorse dinamiche.
- Progress indicator corso più forte.

## Esito sintetico
La base visuale è già solida e distintiva. Il miglioramento più impattante, a parità di effort, è:
1) ridurre gli spazi vuoti nelle pagine brevi,
2) aumentare la leggibilità del testo secondario,
3) rendere più esplicita l’interazione delle card cliccabili.
