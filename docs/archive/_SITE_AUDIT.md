# Audit Sito GinnyTech

## 1. Mappa Struttura del Sito

### Pagine (src/pages/)
- **Home**: `index.astro` (Landing page principale)
- **About**: `about.astro` ("Chi Sono")
- **Blog**: `blog/index.astro` (Lista articoli)
- **Corso**:
  - `course/learning-path.astro` (Percorso di apprendimento)
  - `course/[module]/index.astro` (Indice del modulo)
  - `course/[module]/[slug].astro` (Lezione singola)

### Contenuti (src/content/)
- **corso/**: Contiene le lezioni divise per modulo (es. `analisi-marketing`, `data-collection`). Formato .mdx.
- **blog/**: Articoli del blog. Formato .mdx.
- **docs/**: Documentazione varia e pagine legali (es. `privacy.mdx`, `economics.mdx`).
- **config.ts**: Definizione delle collezioni di contenuti.

### Componenti Principali (src/components/)
- **UI Globale**: `Navbar.tsx`, `Footer.astro`, `Hero.astro`
- **Feature**: `FeatureGrid.astro`, `StarField.tsx`
- **Blog**: `BlogCard.astro`
- **Starlight (Integrati)**: `starlight/Sidebar.astro`, `starlight/Empty.astro`
- **UI Specifica**: `ui/LessonCard.tsx`, `ui/LessonList.tsx`, `ui/SearchWidget.tsx`, `ui/Tooltip.tsx`

### Layouts
- `src/layouts/Layout.astro`: Layout principale usato da tutte le pagine custom.

### Configurazione
- **astro.config.mjs**:
  - Integrazioni: Starlight (per sidebar e docs), React, Tailwind, PartyTown (analytics), Mermaid, Sitemap.
  - Redirects: Mappature da vecchi URL `/corso/...` a nuovi `/course/...`.
  - Sidebar: Definita manualmente nel config.
- **Tailwind**: Configurato via plugin Vite in `astro.config.mjs`.

---

## 2. Analisi Homepage (src/pages/index.astro)

### Blocchi e Ordine
1.  **Navbar**: Logo, Link (Home, Corso, Blog, Consulenza), Search, GitHub.
2.  **Hero Section**:
    -   **Titolo**: "Data Analytics per Marketing & Business"
    -   **Sottotitolo**: "Smetti di copiare query..."
    -   **CTA Primaria**: "Inizia il Corso" (Button)
    -   **CTA Secondaria**: "Vedi il Programma" (Button)
3.  **Feature Grid**:
    -   3 Card: "Engineering Mindset", "Business Fluent", "Real-World Ready".
    -   Icone SVG + Titolo + Descrizione breve.
4.  **CTA Finale (Bottom)**:
    -   Testo: "Il corso è completamente gratuito..."
    -   **Problema**: Manca un bottone d'azione (CTA visiva). È solo testo.
5.  **Footer**: Copyright e link social.

### Gerarchia Visiva
-   Molto chiara. L'utente vede subito la proposta di valore (Hero) e poi i benefici (Features).
-   Il footer è standard.

### Criticità Homepage
-   La sezione finale ("CTA Section") è debole. Ha il background scuro (`bg-brand-dark`) ma manca di una "Call to Action" cliccabile per chi ha scrollato fino in fondo.

---

## 3. Analisi Tono e Testi

### Tono di Voce
-   **Stile**: "Engineer-to-Engineer" ma accessibile. Diretto, pragmatico, anti-accademico.
-   **Parole Chiave**: "Reale", "Sporco", "Infrastrutture", "Fatturato", "Scalabile".
-   **Messaggio**: Focalizzato sulla trasformazione da "esecutore di query" a "costruttore di valore".
-   **Coerenza**: Alta. Il tono è mantenuto sia nella Home che nelle pagine About e nel contenuto del corso.

### Elementi Estratti
-   **H1 Home**: "Data Analytics per Marketing & Business"
-   **H1 About**: "Chi Sono"
-   **CTA Home**: "Inizia il Corso", "Vedi il Programma".
-   **CTA About**: "LinkedIn", "Prenota una Call".

---

## 4. Problemi Identificati e Suggerimenti

### 1. Navigazione e Struttura URL
-   **Discrepanza**: I file sono in `src/content/corso` (italiano), ma gli URL pubblici sono `/course/...` (inglese). Questo è gestito correttamente dai redirect e dalle rotte dinamiche, ma bisogna fare attenzione a non rompere i link interni se si modifica la logica in `utils/url.ts` (se esiste) o nel config.
-   **Starlight**: L'uso di Starlight è ibrido. Gestisce la sidebar e probabilmente lo stile della documentazione, ma le rotte sembrano custom (`src/pages/course/...`). Questo aggiunge complessità alla manutenzione della sidebar (hardcoded in `astro.config.mjs`).

### 2. Homepage
-   **Manca CTA Finale**: Aggiungere un bottone "Inizia ora" nella sezione scura in fondo alla home per catturare l'utente dopo la lettura dei benefit.

### 3. Contenuti (Corso)
-   La struttura è molto profonda. Assicurarsi che la breadcrumb (se presente) funzioni correttamente su mobile.
-   L'integrazione con Mermaid per i diagrammi è presente e funzionante, ottimo per un corso tecnico.

### 4. Blog
-   I post del blog usano una logica simile a quella del corso. Verificare che la categorizzazione (tag/categorie) sia coerente tra Blog e Corso.

### Suggerimenti Immediati
1.  Aggiungere un bottone alla sezione CTA finale della Homepage.
2.  Verificare se la sidebar di Starlight può essere generata dinamicamente dai contenuti invece che hardcodata in `astro.config.mjs`, per evitare disallineamenti futuri.
3.  Uniformare, se possibile, la nomenclatura delle cartelle (tutto inglese o tutto italiano) per facilitare la navigazione nel codice, anche se non è urgente.
