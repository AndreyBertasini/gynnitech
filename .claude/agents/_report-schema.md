# Schema condiviso dei report — crew GinnyTech

Tutti i critic e validator della crew GinnyTech producono il loro output finale in **JSON** seguendo uno schema unico, così l'orchestratore (`/ginnytech`) e il `lesson-rewriter` possono consumare i report in modo deterministico.

Questo file è una **reference**, non un agente. Va letto da ogni subagente all'inizio del lavoro.

---

## Schema critic — `lesson-critic-*`

```json
{
  "agent": "lesson-critic-pedagogy",
  "lesson_path": "src/content/corso/<modulo>/<file>.mdx",
  "verdict": "ship_it | needs_improvement | rewrite",
  "global_score": 0,
  "scores": {
    "<dimension_a>": 0,
    "<dimension_b>": 0
  },
  "strengths": [
    "Frase breve che descrive un punto di forza concreto della lezione."
  ],
  "issues": [
    {
      "line": 42,
      "severity": "critical | high | medium | low",
      "category": "<dimension_a>",
      "problem": "Cosa non va, in modo specifico (no genericità).",
      "evidence": "Citazione breve dal testo o riferimento esatto.",
      "suggestion": "Cosa fare per risolverlo, in modo azionabile."
    }
  ],
  "must_fix": [
    "Top 3 issue critiche o high in ordine di priorità (riferirsi al campo 'problem')."
  ]
}
```

**Regole di compilazione:**

- `global_score`: 0–10. Soglie: ≥8 `ship_it`, 5–7 `needs_improvement`, ≤4 `rewrite`.
- `scores`: una chiave per ciascuna dimensione coperta dal critic (definite nel system prompt del singolo agente). Stesso range 0–10.
- `issues`: ordinare per `severity` desc, poi per `line` asc. Massimo 15 issue. Se ci sono più di 15 problemi, tieni i 15 più gravi.
- `severity`:
  - `critical` = blocca la pubblicazione (es. fatto sbagliato, frase che fraintende il concetto, lezione fuori tema).
  - `high` = la lezione perde valore didattico (es. esempio inventato, manca il "perché" del framework).
  - `medium` = qualità migliorabile ma non rompe l'esperienza (es. transizione fiacca).
  - `low` = polish (parola ripetuta, ritmo).
- `must_fix`: solo `critical` + `high`. Massimo 3 elementi.
- `evidence`: massimo ~120 caratteri. Se serve più contesto, usa `line` per fare lo snap.
- Tutti gli `issues` devono avere `line` valido. Se l'issue è cross-cutting (es. tono dell'intera lezione), usa `line: 0` e specificalo in `problem`.

---

## Schema rewriter — `lesson-rewriter`

```json
{
  "agent": "lesson-rewriter",
  "lesson_path": "src/content/corso/<modulo>/<file>.mdx",
  "iteration": 1,
  "addressed_must_fix": [
    {
      "from_critic": "lesson-critic-pedagogy",
      "must_fix_item": "Frase originale dal must_fix del critic.",
      "how_addressed": "Cosa hai cambiato concretamente, con riferimento alla nuova riga/sezione."
    }
  ],
  "deliberately_ignored": [
    {
      "from_critic": "lesson-critic-voice",
      "issue": "Issue che hai scelto di NON applicare.",
      "reason": "Perché ignorarla migliora la lezione (es. conflitto con altro critic, perdita di rigore tecnico)."
    }
  ],
  "new_file_path": "src/content/corso/<modulo>/<file>.mdx",
  "backup_path": "src/content/corso/<modulo>/<file>.mdx.bak",
  "change_summary": "2-4 frasi che riassumono la riscrittura in linguaggio umano.",
  "word_count_before": 0,
  "word_count_after": 0
}
```

**Regole di compilazione:**

- Il rewriter scrive il nuovo file e crea un `.bak` con il contenuto originale **prima** di sovrascrivere.
- `addressed_must_fix`: deve coprire **tutti** i `must_fix` di **tutti** i critic, oppure giustificare l'omissione in `deliberately_ignored`.
- Se due critic si contraddicono (es. pedagogy chiede più struttura, voice chiede meno schematismo), prendi una decisione esplicita e mettila in `deliberately_ignored` con la motivazione.

---

## Schema validator — `lesson-validator-*`

```json
{
  "agent": "lesson-validator-structure",
  "lesson_path": "src/content/corso/<modulo>/<file>.mdx",
  "verdict": "approve | reject",
  "checks": [
    {
      "name": "word_count_min_3000",
      "passed": true,
      "actual": "3412 parole",
      "expected": "≥ 3000"
    }
  ],
  "blocking_failures": [
    "Nome del check fallito che blocca la pubblicazione."
  ],
  "advisory_notes": [
    "Osservazione non bloccante."
  ]
}
```

**Regole:**

- `verdict: reject` se almeno un check è `blocking`.
- `verdict: approve` con `advisory_notes` non bloccanti è accettabile.
- I validator **non** modificano il file. Solo lettura + comandi di validazione (`npm run validate:content`).

---

## Convenzione di uscita

Ogni subagente termina la sua risposta con un blocco di codice ` ```json ` contenente **solo** il JSON valido secondo lo schema.

Prima del JSON il subagente può scrivere un breve commento in italiano (max 5 righe) per dare contesto, ma il consumatore (orchestratore o rewriter) parserà solo il blocco JSON finale.

Se il JSON non è parsabile, l'orchestratore considera il run del subagente fallito e lo ripete una volta sola.
