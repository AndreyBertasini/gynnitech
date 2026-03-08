# Check Lezione

Valida la qualità di una singola lezione MDX del corso GinnyTech.

## Utilizzo

```
/check-lezione src/content/corso/<modulo>/<file>.mdx
```

Se non viene passato un argomento, chiedi all'utente quale file controllare.

## Fase 1: Lettura

Leggi il file MDX indicato. Se non esiste, segnalalo e interrompi.

Estrai:
- Frontmatter (title, description, eventuali altri campi)
- Corpo del testo (tutto tranne il frontmatter)

## Fase 2: Controlli meccanici

Esegui questi controlli uno per uno e annota i risultati:

### 2a. Word count
- Conta le parole nel corpo (escluso frontmatter e tag MDX)
- ✅ ≥ 3000 parole
- ⚠️ 1500–2999 parole
- ❌ < 1500 parole (stub)

### 2b. Frontmatter
Controlla il YAML frontmatter:
- `title` presente e non vuoto?
- `title` contiene `:` ma NON è quotato con `"`? → segnala con `file:riga`
- `description` presente? (opzionale ma consigliata)
- Il `title` nel frontmatter è identico o quasi all'H1 nel body? → segnala duplicazione

### 2c. Struttura `<Steps>`
Cerca tutti i blocchi `<Steps>...</Steps>`:
- Contengono paragrafi bold (`**Passo N:**` o `### Titolo`) invece di lista numerata (`1. testo`)? → ❌ broken Steps
- Contengono blocchi di codice (` ``` `) al loro interno? → ❌ code block dentro Steps (rompe il rendering)
- Se Steps è corretto (lista numerata, no code block) → ✅

### 2d. Tag Starlight non chiusi o mal nominati
Cerca aperture di: `<Aside`, `<Steps`, `<Tabs`, `<TabItem`, `<Card`
Per ognuno, verifica che esista il tag di chiusura corrispondente (`</Aside>`, `</Steps>`, ecc.)
Segnala mismatch con `file:riga`.

### 2e. H1 duplicato
- Il file ha un `# Titolo` come primo heading?
- Se sì, e il template già mostra il frontmatter title, segnala come ⚠️ (viene gestito via CSS ma è rumore)

## Fase 3: Controlli di qualità contenuto

### 3a. Anti-pattern da evitare
Cerca queste frasi nel testo (case-insensitive):
- "il dato è il nuovo petrolio"
- "i tre pilastri fondamentali" (o "i 3 pilastri")
- "nell'era digitale"
- "in questo articolo vedremo"
- scenario generico copia-incollato: stessa combo "e-commerce" + "SaaS B2B" ripetuta uguale in più sezioni

Per ognuno trovato: ❌ segnala con `file:riga`

### 3b. Marker di alta qualità
Verifica presenza di (almeno 2 su 4 per considerarsi OK):
- Esempi reali con nomi propri e numeri (es. "McDonald's", "Dropbox 75K", "Gorillas 40%")
- Citazione di autori/ricercatori (es. "Christensen", "Binet", "Deming", "Shewhart")
- Formula o algoritmo scritto esplicitamente
- Template o checklist azionabile che lo studente può usare subito

### 3c. Title vs contenuto
Leggi il `title` nel frontmatter e i primi 3 heading del body.
Il contenuto rispetta ciò che il titolo promette? Se il titolo dice "Framework X" ma il corpo è generico senza trattare Framework X → ⚠️ mismatch

## Fase 4: Output

Presenta il risultato in questo formato:

```
## Check Lezione: <nome-file>

### Punteggio globale
[✅ OK / ⚠️ Da migliorare / ❌ Stub o problemi gravi]

### Metriche
- Parole: XXXX [✅/⚠️/❌]
- Qualità esempi: [✅ presenti / ❌ assenti]
- Anti-pattern: [✅ nessuno / ❌ trovati N]
- Title coerente: [✅ / ⚠️ mismatch]

### Problemi tecnici (MDX)
- [file:riga] descrizione problema
- ...

### Problemi di contenuto
- [file:riga] descrizione problema
- ...

### Suggerimenti
- (max 3 azioni concrete per migliorare)
```

Se non ci sono problemi, di' semplicemente: "Lezione OK — nessun problema rilevato."

Non modificare il file. Solo analisi.
