---
context: fork
---

# Audit Corso

Scansiona tutte le lezioni del corso GinnyTech e aggiorna `.claude/lesson-status.md` con lo stato attuale di ogni lezione.

## Utilizzo

```
/audit-corso
```

Nessun argomento richiesto. Processa l'intero corso.

## Struttura del corso

- Lezioni in: `src/content/corso/<modulo>/<lezione>.mdx`
- 13 moduli, ~114 lezioni totali
- Status file: `.claude/lesson-status.md`

## Fase 1: Scopri tutti i file

Usa Glob per trovare tutti i file MDX:
```
src/content/corso/**/*.mdx
```

Raggruppa per modulo (directory padre). Annota il totale.

## Fase 2: Audit parallelo per modulo

Lancia un subagent (Task, subagent_type=Explore) per ogni modulo in parallelo.

Ogni subagent riceve questo prompt:

```
Analizza le lezioni MDX nel modulo: src/content/corso/<nome-modulo>/

Per ogni file .mdx trovato, leggi il contenuto e classifica:

CLASSIFICAZIONE:
- ✅ OK: ≥3000 parole, nessun anti-pattern grave, struttura MDX valida
- ⚠️ incomplete: 1500-2999 parole, o anti-pattern presenti, o problemi MDX minori
- ❌ stub: <1500 parole, o contenuto solo con titoli/placeholder senza sostanza

WORD COUNT: conta le parole nel corpo (escluso frontmatter e tag MDX apertura/chiusura).

ANTI-PATTERN (abbassa il rating):
- "il dato è il nuovo petrolio"
- "i tre pilastri fondamentali"
- "nell'era digitale"
- scenario copy-paste identico in più sezioni

PROBLEMI MDX (abbassa il rating se gravi):
- <Steps> con bold invece di lista numerata
- code block dentro <Steps>
- tag Starlight non chiusi

Per ogni lezione restituisci una riga in questo formato esatto:
<status> `<nome-file>.mdx` — <N>w[, <nota breve se problemi>]

Esempio:
✅ `analisi-coorte.mdx` — 3404w
⚠️ `intro-metriche.mdx` — 1823w, anti-pattern opener
❌ `clustering-avanzato.mdx` — 312w, stub

Elenca TUTTE le lezioni del modulo, una per riga.
```

Attendi il completamento di tutti i subagent prima di procedere.

## Fase 3: Merge risultati

Raccogli l'output di tutti i subagent. Organizza per modulo nello stesso ordine di `src/data/course-modules.ts`.

## Fase 4: Aggiorna `.claude/lesson-status.md`

Leggi il file esistente (se c'è) e sostituiscine il contenuto con il nuovo report.

Formato del file aggiornato:

```markdown
# Lesson Status

> Aggiornato: <data oggi>
> Totale: <N> lezioni — ✅ <n> OK / ⚠️ <n> incomplete / ❌ <n> stub

## <nome-modulo-1>

✅ `lezione-a.mdx` — 3200w
⚠️ `lezione-b.mdx` — 1900w, manca profondità
❌ `lezione-c.mdx` — 280w, stub

## <nome-modulo-2>

...
```

Scrivi il file con Write tool.

## Fase 5: Summary

Presenta all'utente:

```
## Audit Corso completato

Lezioni analizzate: 114
✅ OK:         XX (XX%)
⚠️ incomplete: XX (XX%)
❌ stub:       XX (XX%)

Moduli con più problemi:
1. <modulo> — X stub, X incomplete
2. <modulo> — X stub, X incomplete
3. <modulo> — X stub, X incomplete

File aggiornato: .claude/lesson-status.md
```

## Note

- Non modificare i file delle lezioni — solo analisi e aggiornamento dello status
- Se un file MDX non ha frontmatter o ha errori di parsing, classificalo ❌ e annota "errore frontmatter"
- Le lezioni di riferimento (qualità alta) sono in: gestione-data-driven/, analisi-prodotto/, metriche-fondamenti/, dashboard-visualizzazione/
