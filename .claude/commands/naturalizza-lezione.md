# Naturalizza Lezione

Riscrivi una lezione MDX del corso GinnyTech in linguaggio naturale, narrativo e di alto livello. Rimuovi le sezioni didattiche "scolastiche" (Quiz, Lab, Piano d'azione 30 giorni, Checkpoint) e converti il loro contenuto in prosa che scorre, come un grande corso scritto da un autore esperto.

Argomento/file: `$ARGUMENTS`

---

## OBIETTIVO

Trasformare la lezione da "manuale didattico con box ed esercizi" in **prosa narrativa professionale** che:
- Si legge come un capitolo di un libro tecnico ben scritto (Christensen, Kahneman, Hadley Wickham, Crawley)
- Usa storytelling, casi reali e numeri per insegnare
- Mantiene il rigore tecnico ma elimina il tono scolastico
- Conserva tutta l'informazione utile (non perde concetti, esempi, framework)
- Rispetta la lunghezza minima del corso: ≥3000 parole nel corpo

---

## PRIMA DI INIZIARE — OBBLIGATORIO

1. **Apri il file di tracking**: `.claude/naturalizzazione-status.md`
   - Se non esiste, crealo (vedi sezione "Tracking" in fondo)
   - Verifica se la lezione target è già stata processata
   - Se è già `✅ riscritta`, chiedi conferma all'utente prima di rifarla
2. **Leggi il file della lezione** per intero
3. **Conserva il frontmatter integralmente** (title, description, module, order, prerequisites, category, ecc.) — NON modificarlo
4. **Identifica le sezioni da eliminare** (vedi sotto)
5. **Identifica il contenuto recuperabile** dentro quelle sezioni: dati, esempi, formule, soglie. Va tutto fuso nella prosa, non perso.

---

## SEZIONI DA ELIMINARE (e cosa farne)

Cerca questi heading H2 (case-insensitive, con o senza accenti):

| Heading da eliminare | Cosa fare con il contenuto |
|---|---|
| `## Quiz` / `## Quiz o checkpoint` / `## Checkpoint` | Trasforma le domande in **riflessioni guidate** dentro il testo. Esempio: "Quale comportamento indesiderato può incentivare la metrica primaria?" → "Una metrica primaria mal scelta incentiva sempre comportamenti indesiderati: nel caso di una piattaforma SaaS che ottimizzava trial-to-paid, il team scoprì che..." |
| `## Lab` / `## Lab / esercizio` / `## Esercizio` / `## Esercizi` | Estrai gli scenari proposti e **incorporali come esempi narrativi** o casi pratici dentro il flusso. Non lasciare bullet "Livello base/intermedio/avanzato". |
| `## Piano d'azione in 30 giorni` / `## Piano in 30 giorni` / `## Action plan` | Le azioni concrete diventano **un paragrafo narrativo** sull'applicazione pratica, oppure un'`<Aside type="tip">` con la sintesi operativa. Niente settimane numerate. |
| `## Esercizio guidato` / `## Mini-progetto` | Stessa logica del Lab: trasforma in caso narrativo. |

**REGOLA D'ORO**: il contenuto informativo non si perde. Se il Lab proponeva "definisci guardrail per un esperimento", quella nozione deve riemergere nella prosa come "Definire i guardrail prima dell'esperimento è il passo che separa un team che impara da un team che si fa male: senza una soglia di churn pre-dichiarata, ogni risultato positivo sembra accettabile."

---

## SEZIONI DA CONSERVARE (riformulate, non eliminate)

| Heading | Cosa fare |
|---|---|
| `## Riepilogo operativo` / `## Conclusioni` / `## Sintesi` | Mantieni — è richiesto dalla validazione (`scripts/validation.ts`). Riscrivilo in tono narrativo, non bullet asettici. |
| `## Errore tipico da evitare` / `## Errori comuni` | Mantieni o fondilo nel corpo come passaggio narrativo. Se lo mantieni, riscrivilo come racconto di un fallimento reale, non come elenco. |
| `## Esempio` / `## Caso studio` | Mantieni assolutamente — sono il cuore della lezione. Espandili e rendili più vividi se sono telegrafici. |

---

## STILE DI SCRITTURA — REGOLE NON NEGOZIABILI

### Voce e tono
- **Seconda persona singolare** ("tu", "scegli", "considera") quando ti rivolgi allo studente, ma con parsimonia. Preferisci la voce dell'autore esperto che racconta.
- **Italiano fluido**, non tradotto dall'inglese. Niente calchi ("performante", "actionable" se evitabile, "deliverable").
- Periodi di lunghezza variata. Frasi brevi per impatto, periodi più lunghi per ragionamento. Mai sequenze di frasi tutte uguali.
- **Niente "vedremo", "andremo a vedere", "in questa lezione"**: entra subito nel merito.

### Storytelling
- Apri ogni sezione importante con una mini-storia, un dato sorprendente, una contraddizione, oppure una domanda concreta che il lettore si è sicuramente posto.
- Cita aziende, persone, ricerche reali. Se il testo originale era astratto, **cerca un riferimento concreto** (Netflix che cancellò Lilyhammer, Spotify Discover Weekly, Airbnb e i fotografi a NYC, McDonald's e il milkshake, Binet & Field 60/40, ecc.)
- Mostra il **conflitto** prima della soluzione: "Il team ottimizzava il CTR. Le revenue scendevano. La metrica era giusta, l'obiettivo no."

### Anti-pattern proibiti
- ❌ "In questa lezione vedremo..." / "Andremo ad analizzare..."
- ❌ "Il dato è il nuovo petrolio"
- ❌ "I tre pilastri fondamentali"
- ❌ "Nell'era digitale"
- ❌ Bullet list di 5 righe seguita da bullet list di 5 righe — alterna sempre con prosa di collegamento
- ❌ Frasi che iniziano con "È importante notare che" / "Vale la pena sottolineare"
- ❌ Ripetizione meccanica del titolo della sezione nella prima frase
- ❌ Sezioni "Definizione" che ripetono il dizionario

### Densità
- Ogni paragrafo deve aggiungere informazione nuova o un'angolazione nuova. Se puoi tagliarlo senza perdere significato, taglialo.
- Numeri reali > aggettivi vaghi. "Il churn passò dal 12% al 4%" > "il churn migliorò significativamente".

---

## STRUTTURA POST-RISCRITTURA

Dopo la pulizia + naturalizzazione, la lezione dovrebbe avere questa forma tipica:

1. **Hook** (no H2): aneddoto, dato, contraddizione. 100–250 parole.
2. **3–6 sezioni H2** che sviluppano il tema con narrazione + esempi + (quando serve) tabelle, formule, codice.
3. **Esempio o Caso studio** dettagliato con numeri.
4. **Errori tipici** raccontati come storia (non elenco).
5. **Riepilogo / Sintesi** in chiusura — può essere `<Aside type="tip">` con 3–5 righe dense, oppure 1–2 paragrafi narrativi.

**Vincoli tecnici da rispettare** (vedi `scripts/validation.ts`):
- ≥ 3000 caratteri di corpo (puntiamo a ≥3000 **parole** per qualità)
- ≥ 3 H2
- ≥ 120 caratteri di intro prima del primo H2
- Sezione di sintesi presente (Riepilogo / Conclusioni / Sintesi)
- Almeno un segnale di esempio (code block, tabella, "Esempio", "Caso pratico", "Template")

---

## REGOLE MDX — NON ROMPERE NULLA

- `<Steps>`: se presente, deve contenere SOLO lista numerata (`1. testo`). Niente paragrafi bold, niente blocchi codice dentro.
- `<Aside type="tip|caution|note|danger">` chiuso sempre con `</Aside>`.
- `<Tabs>` e `<TabItem>` chiusi correttamente.
- Frontmatter intoccato (puoi solo aggiornare `description` se la vecchia descrive contenuto eliminato).
- Niente H1 nel corpo (`# Titolo`): l'H1 lo genera il template dal frontmatter.
- Titoli H2 con `:` non hanno problemi nel body MDX (i due punti sono problematici solo nel frontmatter YAML).

---

## WORKFLOW PER LA SINGOLA LEZIONE

### Step 1 — Lettura e diagnosi
- Leggi tutto il file
- Annota: parole attuali, sezioni da eliminare presenti, esempi/dati riutilizzabili
- Verifica `.claude/naturalizzazione-status.md`

### Step 2 — Estrazione contenuto recuperabile
Prima di toccare il file, scriviti mentalmente (o in scratch):
- Quali domande del Quiz contengono concetti chiave da spiegare in prosa?
- Quali scenari del Lab/Esercizio possono diventare casi narrativi?
- Quali azioni del Piano 30 giorni possono entrare in una sintesi operativa?

### Step 3 — Riscrittura
- Riscrivi l'intera lezione (o le sezioni interessate + collegamento) in linguaggio naturale
- Fonde il contenuto recuperato nelle sezioni esistenti o crea sezioni narrative nuove
- Mantieni i numeri, i nomi, le formule, le tabelle utili
- Aumenta vividezza degli esempi se sono telegrafici

### Step 4 — Verifica qualità
- Conta le parole (target ≥3000)
- Rileggi cercando anti-pattern (lista sopra)
- Verifica che nessuna delle sezioni vietate sia rimasta
- Verifica che la sezione Riepilogo/Sintesi esista
- Verifica che ci sia almeno un esempio/tabella/codice

### Step 5 — Salvataggio + tracking
- Scrivi il file con Edit/Write
- **Aggiorna `.claude/naturalizzazione-status.md`**: cambia lo status a `✅ riscritta` con data e nuovo word count
- Comunica all'utente: file processato, parole prima/dopo, sezioni eliminate

---

## TRACKING — `.claude/naturalizzazione-status.md`

Questo file è la **memoria di lavoro** per riprendere dopo che si esauriscono i limiti del modello.

### Struttura del file

```markdown
# Naturalizzazione Lezioni — Status

> Aggiornato: YYYY-MM-DD
> Totale: NNN lezioni — ✅ NN riscritte / ⏳ NN da fare / ⏭️ NN skip (cheat-sheet/caso-studio già OK)

## Legenda
- ✅ **riscritta** — naturalizzata, sezioni Quiz/Lab/Piano rimosse, prosa narrativa
- ⏳ **da fare** — non ancora processata
- ⏭️ **skip** — non necessita riscrittura (es. cheat-sheet brevi, casi-studio già narrativi)
- 🔄 **parziale** — iniziata ma incompleta (recupera da qui al riavvio)

---

## panoramica

⏳ `come-funziona-questo-corso.mdx` — 980w
✅ `come-studiare-bene-questo-corso.mdx` — 3120w (era 985w) — 2026-05-03

## metriche-fondamenti

✅ `statistica-fondamenti.mdx` — 4180w (era 4027w) — 2026-05-03 — rimossi: Quiz, Lab
⏳ `metriche-fondamentali.mdx` — 4268w
...
```

### Quando inizializzare il file
Se non esiste al primo run, crealo facendo:
1. Glob di `src/content/corso/**/*.mdx`
2. Per ogni file, status iniziale `⏳ da fare` con il word count corrente (puoi leggerlo da `.claude/lesson-status.md` se è recente)
3. Raggruppa per modulo
4. Marca come `⏭️ skip` i file `cheat-sheet.mdx` (formato volutamente conciso)

### Aggiornamento dopo OGNI lezione
Dopo ogni file processato — anche uno solo — aggiorna immediatamente il tracking. Mai lasciare lo stato inconsistente: se la sessione muore a metà, devi poter riprendere senza ambiguità.

### Stato `🔄 parziale`
Se la riscrittura viene interrotta a metà (stop dell'utente, errore), marca la lezione `🔄 parziale` con una nota di cosa manca. Al riavvio, cercare prima i `🔄`.

---

## MODALITÀ DI INVOCAZIONE

### Lezione singola
```
/naturalizza-lezione src/content/corso/metriche-fondamenti/statistica-fondamenti.mdx
```
→ processa quella sola lezione e aggiorna il tracking.

### Continuazione (no argomenti, o `--continue`)
```
/naturalizza-lezione
```
→ apri `.claude/naturalizzazione-status.md`, trova la prima lezione con stato `🔄 parziale` (priorità) o `⏳ da fare`, e processala.

### Batch ristretto a un modulo
```
/naturalizza-lezione modulo:metriche-fondamenti
```
→ processa in sequenza tutte le lezioni `⏳` di quel modulo, aggiornando il tracking dopo ognuna. Fermati spontaneamente quando rilevi segnali di approssimazione del limite (rispondi all'utente con: "Processate N lezioni di M. Riprendere con `/naturalizza-lezione` per continuare.").

---

## OUTPUT FINALE PER LEZIONE

Dopo ogni lezione riscritta, comunica all'utente in formato compatto:

```
✅ <nome-file>.mdx
   Parole: <prima>w → <dopo>w
   Sezioni eliminate: <Quiz, Lab, Piano d'azione>
   Note: <eventuali avvertenze, es. lezione molto lunga, mancanza di esempi originali>

Tracking aggiornato: .claude/naturalizzazione-status.md
Prossima lezione suggerita: <nome-file dal tracking>
```

In modalità batch, alla fine:

```
## Batch completato
Lezioni riscritte in questa sessione: N
Totale completate finora: NN / 185
Prossimo modulo da affrontare: <nome>
```
