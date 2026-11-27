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

### Se la lezione ha un header immagine

Usa il template:

- `templates/course-lesson-with-header-template.mdx`

Consulta la guida operativa:

- `docs/guide/GUIDA_TEMPLATE_LEZIONI_CON_IMMAGINI.md`

Campi aggiuntivi consigliati nel frontmatter:

```markdown
headerImage: '/course-headers/nome-modulo-nome-lezione-ginnytech-ad.png'
headerImageAlt: 'Titolo Lezione - immagine ufficiale della lezione su GinnyTech, creata da AD'
```

Se vuoi assegnare le immagini in modo automatico partendo da una inbox dedicata per le nuove immagini, usa:

```bash
python scripts/process_new_lesson_header_images.py
python scripts/process_new_lesson_header_images.py --apply --build
```

Flusso consigliato:

- metti solo le nuove immagini grezze in `images/inbox/`
- il comando unico genera automaticamente i file `_fix`
- assegna le immagini solo alle lezioni senza `headerImage`
- aggiorna SEO e `headerImageAlt`
- con `--build` verifica anche la build finale

Se vuoi usare il flusso manuale avanzato, restano disponibili:

```bash
python scripts/assign_lesson_header_images.py
python scripts/assign_lesson_header_images.py --apply
```

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
