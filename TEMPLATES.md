# Template per Nuovi Contenuti

Copia e incolla questi template per creare nuovi file `.mdx`.

## 1. 🎓 Template Corso (Lezione)

**Percorso:** `src/content/corso/[modulo]/nome-lezione.mdx`

```markdown
---
title: "Titolo della Lezione"
description: "Descrizione concisa di cosa imparerà lo studente (Obbligatorio per SEO e anteprime)."
order: 1  # (Opzionale) Numero per l'ordinamento nel menu laterale.
---

# Titolo della Lezione

Introduzione alla lezione...

## Argomento 1

Dettagli...

<Callout type="insight">
**Insight Chiave:** Usa questo componente per evidenziare concetti importanti.
</Callout>

```

---

## 2. 📝 Template Blog Post

**Percorso:** `src/content/blog/nome-articolo.mdx`

```markdown
---
title: "Titolo dell'Articolo"
description: "Riassunto breve del contenuto per le card e la SEO."
date: 2026-02-09
category: "Data Engineering" # Categorie: Strategy, Data Engineering, Analytics, Management
author: "GynniTech Team" # (Opzionale, default: GynniTech Team)
image: "/images/blog/cover-image.jpg" # (Opzionale) Immagine di copertina
---

# Titolo dell'Articolo

Introduzione...

## Paragrafo 1

Contenuto...

> Citazione o concetto importante.

### Conclusione

Riassunto finale.
```
