# Istruzioni Operative Corso MarTech - GinnyTech

Questo file contiene la memoria storica e le linee guida per lo sviluppo del corso su `ginnytech.it`. Ogni AI che lavora su questo progetto deve seguire rigorosamente queste istruzioni.

## 🏁 Obiettivo del Progetto
Creare il primo e più autorevole corso gratuito di Marketing Technology (MarTech) in Italia. Le lezioni devono essere profonde, tecniche e orientate all'azione.

## 🏗️ Architettura dei Contenuti
I file si trovano in `src/content/docs/` e sono organizzati in sottocartelle per mappare la sidebar di Starlight:
- `data-collection/` (Tracking, GTM, Privacy)
- `marketing-data-science/` (Attribuzione, LTV, Clustering)
- `infrastructure-ops/` (CI/CD, dbt, Costs)
- `data-warehousing/` (OLAP, ClickHouse)
- `real-time-analytics/` (Streaming, Dashboards)
- `metriche-dashboard/` (SQL, Python, Unit Economics)
- `analisi-prodotto/` (Retention, PMF, A/B Testing)
- `analisi-marketing/` (Performance, SEO, Brand)
- `gestione-data-driven/` (HADI, JTBD, Cultura)

## 💎 Standard di Qualità delle Lezioni
Ogni nuova lezione o aggiornamento deve rispettare:
1. **Lunghezza:** Minimo 3000 caratteri di contenuto reale.
2. **Lingua:** Italiano professionale (stile Senior Data/MarTech Engineer).
3. **Componenti UI:** Utilizzare i componenti di Astro Starlight:
   - `<Aside type="tip|danger|warning">` per consigli o trappole (Analytic Traps).
   - `<Steps>` per procedure e workflow.
   - `<CardGrid>` e `<Card>` per riepiloghi o confronti.
   - `mermaid` per diagrammi di flusso e architetture dati.
4. **SEO:** Il frontmatter deve avere una `description` accattivante di circa 150-160 caratteri.
5. **Difficoltà:** Inserire sempre il badge nel frontmatter:
   ```yaml
   sidebar:
     badge:
       text: Base | Intermedio | Avanzato
       variant: success | tip | danger
   ```

## 🛠️ Tool di Manutenzione
- **Audit Script:** `python scripts/audit_lessons.py` (Genera il file `TRACKING_LEZIONI.md` con il conteggio caratteri e lo stato).
- **Controllo Link:** Eseguire `npm run build` per validare che tutti i link interni siano corretti.

## 📜 Storico Lavoro (Febbraio 2026)
- Riscrittura totale di 37 lezioni (tutte portate a >3000 caratteri).
- Riorganizzazione dei file in sottocartelle per risolvere errori 404 della sidebar.
- Implementazione dei badge di difficoltà e diagrammi Mermaid.
