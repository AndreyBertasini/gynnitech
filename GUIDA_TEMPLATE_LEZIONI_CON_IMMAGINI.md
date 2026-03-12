# Guida Template Lezioni con Immagini

Questa guida serve per creare nuove lezioni del corso con header immagine compatibile con il layout attuale e con lo script automatico di assegnazione immagini.

## File da usare

- Template lezione: `templates/course-lesson-with-header-template.mdx`
- Script automatico immagini: `scripts/assign_lesson_header_images.py`
- Pipeline comando unico per nuove lezioni: `scripts/process_new_lesson_header_images.py`

## Quando usare il template

Usa questo template quando crei una nuova lezione che deve:

- mostrare una immagine sopra il titolo
- avere metadati SEO coerenti
- restare compatibile con l'automazione immagini
- mantenere il formato standard del corso GinnyTech

## Campi frontmatter importanti

Nel template troverai questi campi:

- `title`: titolo completo della lezione
- `description`: meta description SEO della lezione
- `module`: nome leggibile del modulo
- `order`: ordine nel menu del modulo
- `category`: categoria visibile nella struttura contenuti
- `headerImage`: path pubblico dell'immagine header
- `headerImageAlt`: alt text SEO e accessibilita
- `difficulty`: `beginner`, `intermediate`, `advanced`, `base`, `intermedio`, `avanzato`
- `duration`: durata della lezione
- `prerequisites`: array di slug prerequisiti
- `learningObjectives`: obiettivi della lezione

## Flusso manuale

Usa il flusso manuale quando vuoi preparare la lezione gia completa senza script.

1. Copia `templates/course-lesson-with-header-template.mdx`.
2. Salva il file in `src/content/corso/<modulo>/<slug-lezione>.mdx`.
3. Carica l'immagine finale in `public/course-headers/`.
4. Rinomina il file immagine in formato SEO:

   `nome-modulo-nome-lezione-ginnytech-ad.png`

5. Imposta nel frontmatter:

   - `headerImage: '/course-headers/nome-modulo-nome-lezione-ginnytech-ad.png'`
   - `headerImageAlt: 'Titolo Lezione - immagine ufficiale della lezione su GinnyTech, creata da AD'`

6. Aggiorna `description` con una frase breve che contenga:

   - titolo della lezione
   - GinnyTech
   - AD
   - beneficio della lezione

## Flusso automatico con script

Usa il flusso automatico quando hai nuove immagini grezze da assegnare alle future lezioni.

1. Crea o aggiorna le lezioni `.mdx`.
2. Lascia vuoto `headerImage` se vuoi che venga assegnato dallo script.
3. Metti solo le nuove immagini sorgenti in `images/inbox/`.
4. Esegui prima un dry-run con il comando unico:

   ```bash
   python scripts/process_new_lesson_header_images.py
   ```

5. Controlla il report generato a terminale.
6. Se tutto e corretto, esegui la scrittura reale e la build di verifica:

   ```bash
   python scripts/process_new_lesson_header_images.py --apply --build
   ```

## Cosa fa il comando unico

- prende le immagini grezze da `images/inbox/`
- crea automaticamente le versioni `_fix`
- usa solo i file `_fix` per l'assegnazione
- assegna le immagini solo alle lezioni senza `headerImage`
- rinomina in formato SEO e copia in `public/course-headers/`
- aggiorna `description`, `headerImage` e `headerImageAlt`
- elimina dalla inbox i file grezzi usati dopo assegnazione corretta
- con `--build` verifica che il sito compili correttamente

## Quando usare ancora lo script manuale

Usa `scripts/assign_lesson_header_images.py` solo se vuoi controllare separatamente il passaggio di assegnazione, oppure se lavori fuori dalla cartella inbox.

## Cosa fa lo script quando usi `--apply`

- prende le immagini da `images/`
- assegna le immagini alle lezioni in ordine del corso
- rinomina i file in formato SEO
- copia i file in `public/course-headers/`
- aggiorna `description`, `headerImage` e `headerImageAlt`
- elimina l'immagine originale da `images/` solo dopo scrittura corretta

## Regole SEO consigliate

- il nome file deve contenere modulo, lezione, `ginnytech`, `ad`
- il campo `description` deve stare corto e leggibile
- l'alt text deve descrivere la relazione tra immagine e lezione
- evitare nomi generici come `cover.png`, `hero-final.png`, `img-01.png`

## Esempio minimo

```mdx
---
title: 'Mappe Concettuali: Come si Connettono i 17 Moduli'
description: 'Mappe Concettuali su GinnyTech: lezione del corso creata da AD per capire connessioni, ordine dei moduli e percorsi di apprendimento.'
module: 'Panoramica del Corso'
order: 2
category: 'Panoramica'
headerImage: '/course-headers/panoramica-mappe-concettuali-ginnytech-ad.png'
headerImageAlt: 'Mappe Concettuali - immagine ufficiale della lezione su GinnyTech, creata da AD'
difficulty: beginner
duration: '25 min'
prerequisites: []
learningObjectives:
  - Comprendere la struttura del corso.
  - Collegare moduli e prerequisiti.
  - Usare la mappa come guida di studio.
---
```

## Nota pratica

Il template non va salvato dentro `src/content/corso/`, altrimenti Astro lo trattera come contenuto reale del sito. Va copiato da `templates/` e poi adattato.
