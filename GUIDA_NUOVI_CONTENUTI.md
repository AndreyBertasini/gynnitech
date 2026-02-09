# Come creare nuovi contenuti

Per aggiungere nuove lezioni o moduli al corso, segui questi passaggi:

## 1. Aggiungere una Nuova Lezione (in un Modulo esistente)

Basta creare un nuovo file `.mdx` nella cartella del modulo desiderato (es. `src/content/corso/data-collection/`).

**Esempio:** `nuova-lezione.mdx`

```markdown
---
title: "Titolo della Lezione"
description: "Breve descrizione del contenuto."
subtitle: "Sottotitolo opzionale (es. Lezione 2: ...)"
author: "Tuo Nome"
date: "2026-02-09"
order: 2  # (Opzionale) Ordine di apparizione nel menu laterale
---

# Contenuto della Lezione

Scrivi qui il tuo contenuto in Markdown...
```

> **Nota:** Il campo `description` è **obbligatorio**. Senza di esso, la build fallirà.

## 2. Creare un Nuovo Modulo

Se vuoi creare un'intera nuova sezione (es. `Business Intelligence`):

1.  **Crea la Cartella**: `src/content/corso/business-intelligence/`
2.  **Aggiungi Lezioni**: Inserisci i file `.mdx` dentro questa cartella.
3.  **Registra il Modulo**: Apri `src/data/course-modules.ts` e aggiungi la definizione del modulo alla lista `COURSE_MODULES`:

```typescript
  {
    id: 'business-intelligence', // Deve corrispondere al nome della cartella!
    title: 'Business Intelligence & Reporting',
    description: 'Design di dashboard efficaci, KPI e visualizzazione dati.',
    icon: 'Activity', // Scegli un'icona da lucide-react (importala in course.astro se nuova)
    color: 'from-blue-500 to-indigo-500' // Gradiente CSS
  }
```

## 3. Ordine delle Lezioni

Di default, le lezioni vengono ordinate in base al campo `order` nel frontmatter (es. `order: 1`, `order: 2`). Se non specificato, l'ordine potrebbe essere alfabetico o casuale.
