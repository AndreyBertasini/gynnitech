# Fix MDX

Corregge automaticamente i problemi MDX/Starlight noti in una lezione GinnyTech.

## Utilizzo

```
/fix-mdx src/content/corso/<modulo>/<file>.mdx
```

Se non viene passato un argomento, chiedi all'utente quale file correggere.

## Importante

**Leggi sempre il file prima di modificarlo.** Mostra all'utente cosa hai trovato e cosa intendi fare, poi chiedi conferma prima di scrivere le modifiche.

## Fase 1: Lettura e diagnosi

Leggi il file MDX. Identifica i problemi presenti tra quelli sotto.

## Problemi che questa skill corregge

### Fix 1: Frontmatter — titolo con `:` non quotato

**Problema**: YAML interpreta `:` come separatore chiave-valore.

```yaml
# SBAGLIATO
title: Metriche: Come misurarle

# CORRETTO
title: "Metriche: Come misurarle"
```

**Come trovarlo**: riga `title:` che contiene `:` nel valore, senza `"` attorno al valore.
**Fix**: aggiungi `"..."` attorno al valore del title (e description se necessario).

---

### Fix 2: `<Steps>` con bold invece di lista numerata

**Problema**: `<Steps>` richiede una `<ol>` come contenuto. Paragrafi bold rompono la struttura HTML.

```mdx
<!-- SBAGLIATO -->
<Steps>
**Passo 1: Definisci l'obiettivo**

Testo del passo.

**Passo 2: Raccogli i dati**

Testo del passo.
</Steps>

<!-- CORRETTO -->
<Steps>
1. **Definisci l'obiettivo**

   Testo del passo.

2. **Raccogli i dati**

   Testo del passo.
</Steps>
```

**Come trovarlo**: dentro `<Steps>...</Steps>` ci sono righe che iniziano con `**` (bold) invece di `1.`, `2.`, ecc.
**Fix**: trasforma ogni `**Passo N: Testo**` in `N. **Testo**`, mantenendo il contenuto indentato sotto.

---

### Fix 3: Code block dentro `<Steps>`

**Problema**: Blocchi di codice (` ``` `) dentro `<Steps>` rompono il rendering Starlight.

```mdx
<!-- SBAGLIATO -->
<Steps>
1. Installa la dipendenza

   ```bash
   npm install foo
   ```
</Steps>

<!-- CORRETTO -->
<Steps>
1. Installa la dipendenza
</Steps>

```bash
npm install foo
```
```

**Come trovarlo**: presenza di ` ``` ` all'interno di un blocco `<Steps>...</Steps>`.
**Fix**: sposta i code block immediatamente dopo il tag `</Steps>`, con un commento `{/* code block spostato fuori da Steps */}` se utile per chiarezza.

---

### Fix 4: Tag Starlight non chiusi o mal nominati

**Problema**: `</Card>` invece di `</Aside>`, o tag aperti senza chiusura.

**Come trovarlo**:
- Conta aperture e chiusure di ogni tag: `<Aside`, `</Aside>`, `<Steps`, `</Steps>`, `<Tabs`, `</Tabs>`, `<TabItem`, `</TabItem>`, `<Card`, `</Card>`
- Segnala mismatch

**Fix**: aggiungi tag mancanti o correggi nomi errati. Se ambiguo, segnala e chiedi all'utente.

---

### Fix 5: H1 duplicato

**Problema**: Il file ha `# Titolo` come primo elemento del body, identico o quasi al `title` in frontmatter. Il template lo nasconde via CSS ma è rumore inutile.

**Come trovarlo**: prima riga non-frontmatter è `# <testo>` e `<testo>` coincide con il `title`.

**Fix**: rimuovi la riga `# Titolo` se è identica al frontmatter title. Se diversa, lasciala (potrebbe essere intenzionale).

---

## Fase 2: Presentazione

Prima di modificare, mostra:

```
## Fix MDX: <nome-file>

Problemi trovati:
- [Fix 2] <Steps> con bold a riga 45, 52, 61
- [Fix 3] Code block dentro Steps a riga 48

Modifiche proposte:
1. Convertire bold → lista numerata in <Steps> (righe 45-70)
2. Spostare code block fuori da <Steps> (riga 48)

Procedo con le correzioni? [sì/no]
```

Attendi conferma.

## Fase 3: Applicazione fix

Applica le correzioni con Edit tool, una per tipo. Dopo ogni modifica, verifica che il risultato sia corretto rileggendo la sezione modificata.

## Fase 4: Summary

```
## Fix completato

Correzioni applicate:
- ✅ Fix 2: Steps convertiti (3 passi → lista numerata)
- ✅ Fix 3: Code block spostato fuori da Steps

Non modificati (non trovati):
- Fix 1: Frontmatter OK
- Fix 4: Tag OK
- Fix 5: Nessun H1 duplicato

Suggerito: esegui /check-lezione per verificare la qualità complessiva.
```

## Note

- Non riscrivere il contenuto — solo correzioni strutturali/sintattiche
- In caso di dubbio su un fix, chiedi all'utente invece di procedere
- Se il file ha errori complessi non coperti da questi fix, segnalali ma non tentare di correggerli automaticamente
