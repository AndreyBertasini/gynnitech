# Template per Creazione Contenuti

Usa questi template per aggiungere nuove lezioni o articoli al blog. Copia il contenuto del template, incollalo in un nuovo file `.mdx`, e compila i campi.

---

## 1. 🎓 Template Corso (Lezione)

Questo template è ottimizzato per le lezioni del corso. Include campi per il titolo, la descrizione, l'ordine di apparizione e la categoria.

**Dove salvare il file:** `src/content/corso/[nome-modulo]/[nome-lezione].mdx`
*Esempio: `src/content/corso/marketing-data-science/intro-python.mdx`*

### Contenuto da Copiare:

```markdown
---
title: "Titolo della Lezione"
description: "Descrizione breve e accattivante di cosa imparerà lo studente in questa lezione."
order: 10
category: "Concetti Fondamentali"
---

# Titolo della Lezione

Scrivi qui l'introduzione della lezione. Spiega brevemente gli obiettivi e cosa verrà trattato.

## Sottotitolo della Sezione

Qui inizia il contenuto principale. Puoi usare **grassetto**, *corsivo*, e liste puntate:
- Punto chiave 1
- Punto chiave 2
- Punto chiave 3

### Esempio Pratico

```python
# Puoi inserire blocchi di codice se necessario
def esempio():
    print("Codice Python o SQL")
```

> **Nota Importante:** Usa questo stile per evidenziare note o concetti chiave che lo studente non deve dimenticare.

## Conclusione

Riassunto veloce di quanto appreso e link alla lezione successiva se necessario.
```

---

## 2. 📝 Template Blog Post

Questo template è per gli articoli del blog. Include campi per data, autore, categoria e immagine di copertina.

**Dove salvare il file:** `src/content/blog/[nome-articolo].mdx`
*Esempio: `src/content/blog/nuove-tendenze-analytics.mdx`*

### Contenuto da Copiare:

```markdown
---
title: "Titolo dell'Articolo Accattivante"
description: "Un sottotitolo o riassunto breve che invogli alla lettura e sia utile per la SEO."
date: 2026-02-10
category: "Data Strategy"
author: "GynniTech Team"
image: "/images/blog/default-cover.jpg"
---

# Titolo Principale dell'Articolo

Introduzione coinvolgente che spiega il "perché" di questo articolo. Qual è il problema che stiamo risolvendo o l'opportunità da cogliere?

## Primo Paragrafo Importante

Approfondimento del tema.
1. Primo dettaglio
2. Secondo dettaglio

![Descrizione immagine opzionale](/images/blog/grafico-esempio.jpg)
*Didascalia dell'immagine*

## Secondo Paragrafo

Altre informazioni utili. Ricordati di strutturare il testo con paragrafi brevi per facilitare la lettura.

### Sottosezione di dettaglio

Dettagli tecnici o specifici.

## Conclusione

Cosa abbiamo imparato? Qual è la "Call to Action" o il prossimo passo per il lettore?
```

---

## 🚀 Istruzioni Veloci per Astro

1. **Creare il file**: Crea un nuovo file con estensione `.mdx` nella cartella corretta (`src/content/corso/...` o `src/content/blog/...`).
2. **Frontmatter**: La parte tra i tre trattini `---` all'inizio del file è fondamentale. Non cancellarla e rispetta la sintassi (chiave: "valore").
   - `order`: Usa numeri interi (1, 2, 10, 20) per ordinare le lezioni.
   - `category`: Raggruppa le lezioni visivamente nella pagina del modulo.
3. **Immagini**: Salva le tue immagini nella cartella `public/images/` e collegale usando il percorso assoluto (es. `/images/mia-foto.jpg`).
4. **Link**: Per collegare altre pagine interne, usa percorsi relativi o assoluti (es. `[Vai al corso](/course)`).
