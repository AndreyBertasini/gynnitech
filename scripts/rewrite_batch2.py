#!/usr/bin/env python3
import os

BASE = os.path.join(os.path.dirname(__file__), '..', 'src', 'content', 'corso')

def write_lesson(rel_path, content):
    path = os.path.join(BASE, rel_path)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ {rel_path}")

# metriche-fondamenti/generazione-idee.mdx
write_lesson('metriche-fondamenti/generazione-idee.mdx', '''---
title: "Generazione di Idee Innovative"
description: "Tecniche strutturate per generare ipotesi data-driven e trasformare i dati in idee di crescita."
module: "Modulo 1: Fondamenti & Strategia"
order: 5
prerequisites: ["metriche-fondamenti/approccio-analitico"]
category: "Strategia"
---

# Generazione di Idee Innovative

> **Obiettivo:** Imparare a trasformare i dati in ipotesi di crescita testabili, usando framework strutturati per la generazione di idee.

## 1. Il Problema: Dati Senza Idee = Paralisi

Avere i dati non basta. La sfida è trasformarli in **ipotesi azionabili**. Molte aziende cadono nella trappola dell'"analysis paralysis": analizzano tutto ma non provano nulla.

Il ciclo virtuoso è: **Dati → Insight → Ipotesi → Esperimento → Risultato → Nuovo dato**

```mermaid
graph LR
    A["📊 Dati"] --> B["💡 Insight"]
    B --> C["🧪 Ipotesi"]
    C --> D["⚗️ Esperimento"]
    D --> E["📈 Risultato"]
    E --> A
```

## 2. Framework per la Generazione di Idee

### 2.1 Il Metodo HADI

Il ciclo **HADI** (Hypothesis → Action → Data → Insight) è il framework più usato nelle aziende data-driven:

| Fase | Domanda | Esempio |
|:---|:---|:---|
| **Hypothesis** | Cosa crediamo che succederà? | "Aggiungere social proof aumenterà le conversioni del 15%" |
| **Action** | Cosa facciamo per testarlo? | A/B test: pagina con vs senza recensioni |
| **Data** | Quali dati raccogliamo? | Conversion rate per variante, sample size |
| **Insight** | Cosa abbiamo imparato? | "Le recensioni aumentano del 12% — vicino alla nostra ipotesi" |

### 2.2 ICE Scoring

Per prioritizzare le idee, il framework **ICE** assegna un punteggio 1-10:

```python
def ice_score(impact: int, confidence: int, ease: int) -> float:
    """Calcola il punteggio ICE per prioritizzare le idee."""
    return (impact + confidence + ease) / 3

ideas = [
    {"name": "Aggiungere social proof", "impact": 8, "confidence": 7, "ease": 9},
    {"name": "Redesign checkout", "impact": 9, "confidence": 5, "ease": 3},
    {"name": "Email carrello abbandonato", "impact": 7, "confidence": 8, "ease": 8},
    {"name": "Programma referral", "impact": 9, "confidence": 4, "ease": 4},
]

for idea in sorted(ideas, key=lambda x: ice_score(x['impact'], x['confidence'], x['ease']), reverse=True):
    score = ice_score(idea['impact'], idea['confidence'], idea['ease'])
    print(f"ICE {score:.1f} | {idea['name']}")
```

Output:
```
ICE 8.0 | Aggiungere social proof
ICE 7.7 | Email carrello abbandonato
ICE 5.7 | Redesign checkout
ICE 5.7 | Programma referral
```

### 2.3 La Matrice Impatto/Sforzo

```
    Alto Impatto │
                 │  🏆 Big Bets        ⚡ Quick Wins
                 │  (Alta priorità)    (Parti da qui!)
    ─────────────┼──────────────────────────────────
                 │  🕳️ Sink Holes      📋 Fill-ins
                 │  (Evita)            (Se hai tempo)
    Basso Impatto│
                 └────────────────────────────────→
                   Alto Sforzo          Basso Sforzo
```

## 3. Sorgenti di Idee Basate sui Dati

### Dove Cercare Insight

| Fonte | Tipo di Idea | Esempio |
|:---|:---|:---|
| **Funnel analysis** | Ottimizzazione conversioni | "Il 40% abbandona al checkout → semplifica" |
| **Analisi di coorte** | Retention improvement | "Coorte social ha 2x retention → investi in community" |
| **Heatmaps** | UX/UI improvement | "Nessuno clicca il CTA → cambia posizione/colore" |
| **Customer support** | Pain points ricorrenti | "30% ticket su fatturazione → redesign la sezione" |
| **Competitor analysis** | Feature gap | "Competitor X ha chat live → valuta implementazione" |
| **Search data** | Content/SEO | "500 ricerche/mese per feature che non offriamo" |

```sql
-- Trovare idee dal funnel: dove perdiamo utenti?
SELECT 
    funnel_step,
    COUNT(*) AS users_entered,
    COUNT(*) - LEAD(COUNT(*)) OVER (ORDER BY step_order) AS users_lost,
    ROUND(
        (COUNT(*) - LEAD(COUNT(*)) OVER (ORDER BY step_order)) * 100.0 
        / COUNT(*), 1
    ) AS drop_off_pct
FROM funnel_events
WHERE event_date >= CURRENT_DATE - INTERVAL 30 DAY
GROUP BY funnel_step, step_order
ORDER BY step_order;
```

## 4. Template per Documentare le Idee

```python
idea_template = {
    "id": "IDEA-042",
    "title": "Aggiungere countdown timer al checkout",
    "hypothesis": "Un timer di scarsità aumenterà le conversioni del 10%",
    "ice_score": {"impact": 7, "confidence": 6, "ease": 9, "total": 7.3},
    "data_source": "Funnel analysis mostra 35% drop-off al checkout",
    "test_type": "A/B test",
    "primary_metric": "checkout_completion_rate",
    "guardrail_metric": "refund_rate",  # non deve peggiorare
    "estimated_duration": "2 settimane",
    "owner": "Product Team",
    "status": "backlog"
}
```

## 5. Errori Comuni nella Generazione di Idee

| Errore | Conseguenza | Soluzione |
|:---|:---|:---|
| Idee senza dati di supporto | Sprechi di tempo su intuizioni | Ogni idea deve citare un dato |
| Non definire la metrica di successo | Non sai se ha funzionato | Definisci KPI prima di iniziare |
| Testare troppe cose insieme | Non sai cosa ha causato il risultato | Una variabile alla volta |
| Scartare le idee fallite | Perdi l\'apprendimento | Documenta OGNI esperimento |
| Solo idee incrementali | Mai breakthrough | Riserva il 20% a idee "moonshot" |

## Riepilogo

| Concetto | Takeaway |
|:---|:---|
| **Ciclo** | Dati → Insight → Ipotesi → Esperimento → Apprendimento |
| **HADI** | Framework per strutturare le ipotesi |
| **ICE** | Scoring per prioritizzare (Impact, Confidence, Ease) |
| **Fonti** | Funnel, coorti, heatmaps, support, competitor |
| **Documentazione** | Ogni idea va scritta con ipotesi, metrica e owner |

## Risorse

- **Libro:** *Hacking Growth* — Sean Ellis & Morgan Brown
- **Tool:** [GrowthHackers Experiments](https://growthhackers.com) per ispirazione
- **Framework:** North Star Metric + HADI Cycle
''')

# metriche-fondamenti/caso-studio.mdx
write_lesson('metriche-fondamenti/caso-studio.mdx', '''---
title: "Caso Studio — Fondamenti e Metriche"
description: "Un caso studio completo: come un e-commerce italiano ha costruito il proprio sistema di metriche da zero."
module: "Modulo 1: Fondamenti & Strategia"
order: 8
prerequisites: ["metriche-fondamenti/statistica-fondamenti"]
category: "Caso Studio"
---

# Caso Studio: Da Fogli Excel a Dashboard Data-Driven

> **Scenario:** Un e-commerce italiano di prodotti artigianali (€3M fatturato, 15 dipendenti) vuole passare da decisioni "a sensazione" a un approccio strutturato basato sulle metriche.

## 1. La Situazione Iniziale

| Aspetto | Stato |
|:---|:---|
| **Dati** | Sparsi tra Shopify, Google Analytics, Excel, email |
| **Report** | Il marketing manager crea un Excel ogni lunedì (4 ore) |
| **Metriche** | Ognuno ha la propria definizione di "fatturato" |
| **Decisioni** | Basate sull\'esperienza del fondatore |
| **Team dati** | Nessuno |

### I Problemi Concreti

```
❌ "Il fatturato di gennaio è €280K" (secondo Shopify)
❌ "No, è €265K" (secondo il commercialista — include i resi)
❌ "In realtà è €290K" (secondo il marketing — include ordini non pagati)
→ 3 numeri diversi = 0 fiducia nei dati
```

## 2. Step 1: Definire il Glossario delle Metriche (Settimana 1-2)

La prima azione è stata creare un **glossario condiviso** partendo dalle 10 metriche più importanti:

```python
glossario_metriche = {
    "revenue": {
        "name": "Fatturato Netto",
        "formula": "Vendite lorde - Resi - Sconti - IVA",
        "source": "Shopify Orders API (status: paid, fulfillment: fulfilled)",
        "owner": "CFO",
        "update_frequency": "daily",
        "note": "NON include ordini pending o cancelled"
    },
    "aov": {
        "name": "Average Order Value (AOV)",
        "formula": "Fatturato Netto / Numero Ordini Completati",
        "source": "Derivato da revenue",
        "owner": "Head of Marketing",
        "benchmark": "€75 (media settore artigianato online)"
    },
    "cac": {
        "name": "Customer Acquisition Cost",
        "formula": "(Spesa Ads + Spesa Content + Spesa Affiliate) / Nuovi Clienti",
        "source": "Meta Ads + Google Ads + Shopify",
        "owner": "Head of Marketing",
        "target": "< €35 (con LTV/CAC > 3x)"
    }
}
```

## 3. Step 2: Centralizzare i Dati (Settimana 2-4)

```mermaid
graph LR
    A["Shopify"] --> E["Airbyte<br>(ELT)"]
    B["Google Ads"] --> E
    C["Meta Ads"] --> E
    D["GA4"] --> E
    E --> F["PostgreSQL<br>(Data Warehouse)"]
    F --> G["Metabase<br>(Dashboard)"]
```

Stack scelto (budget: €200/mese):

| Componente | Tool | Costo |
|:---|:---|:---|
| ELT | Airbyte (self-hosted) | €0 |
| Data Warehouse | PostgreSQL su DigitalOcean | €50/mese |
| Trasformazione | dbt Core | €0 |
| Dashboard | Metabase (self-hosted) | €0 |
| Hosting | DigitalOcean Droplet | €150/mese |

## 4. Step 3: La Prima Dashboard Executive (Settimana 3)

```sql
-- Query per la dashboard executive giornaliera
WITH daily AS (
    SELECT
        order_date,
        COUNT(*) AS orders,
        SUM(net_revenue) AS revenue,
        COUNT(DISTINCT customer_id) AS unique_customers,
        SUM(CASE WHEN is_new_customer THEN 1 ELSE 0 END) AS new_customers,
        AVG(net_revenue) AS aov
    FROM orders_clean
    WHERE order_date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY order_date
)
SELECT
    order_date,
    orders,
    revenue,
    aov,
    new_customers,
    unique_customers - new_customers AS returning_customers,
    ROUND(new_customers * 100.0 / unique_customers, 1) AS new_customer_pct
FROM daily
ORDER BY order_date DESC;
```

**Impatto immediato:** Il CEO riceve i numeri ogni mattina alle 8:00 via Slack, aggiornati automaticamente. Le 4 ore settimanali del marketing manager sono liberate.

## 5. Step 4: Analisi che Genera Azioni (Mese 2-3)

### Scoperta #1: Il Paradosso della Spedizione Gratuita

```sql
-- Analisi: la soglia di spedizione gratuita funziona?
SELECT
    CASE
        WHEN order_total < 50 THEN '< €50'
        WHEN order_total BETWEEN 50 AND 69.99 THEN '€50-69'
        WHEN order_total BETWEEN 70 AND 79.99 THEN '€70-79 (vicino soglia)'
        WHEN order_total >= 80 THEN '≥ €80 (free shipping)'
    END AS order_bucket,
    COUNT(*) AS orders,
    AVG(order_total) AS avg_total,
    SUM(order_total) AS total_revenue,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS pct_orders
FROM orders_clean
WHERE order_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY 1
ORDER BY MIN(order_total);
```

**Risultato:**
| Bucket | Ordini | % | AOV |
|:---|:---:|:---:|:---:|
| < €50 | 1.200 | 35% | €32 |
| €50-69 | 890 | 26% | €58 |
| **€70-79** | **620** | **18%** | **€74** |
| ≥ €80 | 720 | 21% | €105 |

**Insight:** Il 18% degli ordini è tra €70-79, appena sotto la soglia di spedizione gratuita (€80). **Azione:** Abbassare la soglia a €70 o aggiungere un suggerimento "Aggiungi €X per la spedizione gratuita".

**Risultato dopo il test:** AOV aumentato del 8%, revenue +5%.

## 6. Risultati dopo 6 Mesi

| Metrica | Prima | Dopo 6 Mesi | Δ |
|:---|:---:|:---:|:---:|
| Tempo per report settimanale | 4 ore | 0 (automatico) | -100% |
| Versioni diverse del fatturato | 3 | 1 (single source of truth) | -67% |
| AOV | €68 | €78 | +15% |
| CAC | €42 | €35 | -17% |
| Decisioni basate su dati | ~20% | ~75% | +275% |

## Lezioni Apprese

1. **Inizia dal glossario**, non dalla tecnologia
2. **Quick wins prima** — la dashboard executive ha convinto tutti in 2 settimane
3. **Stack semplice** — non serve Snowflake per un e-commerce da €3M
4. **Le analisi devono finire con un\\'azione**, non con un grafico
5. **Documenta tutto** — tra 6 mesi nessuno ricorderà perché una metrica è calcolata così
''')

# metriche-fondamenti/cheat-sheet.mdx
write_lesson('metriche-fondamenti/cheat-sheet.mdx', '''---
title: "Cheat Sheet — Metriche e Fondamenti Analitici"
description: "Riferimento rapido con tutte le formule, framework e benchmark del modulo Fondamenti & Strategia."
module: "Modulo 1: Fondamenti & Strategia"
order: 7
prerequisites: ["metriche-fondamenti/statistica-fondamenti"]
tags: ["cheat-sheet", "riassunto", "revisione"]
---

# Cheat Sheet: Fondamenti & Strategia

## Formule Essenziali

### Metriche di Revenue

| Formula | Calcolo | Benchmark |
|:---|:---|:---|
| **ARPU** | Revenue / Totale Utenti | Varia per settore |
| **ARPPU** | Revenue / Utenti Paganti | 3-10x ARPU |
| **LTV** | ARPU × Lifetime medio | LTV/CAC ≥ 3x |
| **CAC** | Costo Marketing / Nuovi Clienti | CAC Payback ≤ 12 mesi |
| **AOV** | Revenue / N. Ordini | €50-150 (e-commerce) |

### Metriche di Crescita

| Formula | Calcolo | Target |
|:---|:---|:---|
| **MoM Growth** | (Mese N - Mese N-1) / Mese N-1 | >5% early stage |
| **K-factor** | Inviti × Conversion Rate | >1 = crescita virale |
| **NPS** | % Promotori - % Detrattori | >50 = eccellente |
| **DAU/MAU** | Daily Active / Monthly Active | >20% = sticky |

### Metriche di Retention

| Formula | Tipo | Uso |
|:---|:---|:---|
| **N-day** | Attivi giorno N / Registrati | Ritorno preciso |
| **Unbounded** | Attivi giorno N+ / Registrati | Ritorno cumulativo |
| **Bracket** | Attivi in finestra / Registrati | Per periodi (sett/mese) |

```sql
-- Retention N-day completa
SELECT
    DATE_TRUNC(\'week\', signup_date) AS cohort,
    COUNT(DISTINCT user_id) AS cohort_size,
    COUNT(DISTINCT CASE WHEN days_since_signup = 1 THEN user_id END) 
        * 100.0 / COUNT(DISTINCT user_id) AS d1_retention,
    COUNT(DISTINCT CASE WHEN days_since_signup = 7 THEN user_id END) 
        * 100.0 / COUNT(DISTINCT user_id) AS d7_retention,
    COUNT(DISTINCT CASE WHEN days_since_signup = 30 THEN user_id END) 
        * 100.0 / COUNT(DISTINCT user_id) AS d30_retention
FROM user_activity_daily
GROUP BY 1
ORDER BY 1 DESC;
```

## Framework di Riferimento

### Piramide dei Bisogni dei Dati

```
    ┌───────────────────┐
    │   AI/Prescrittivo  │  Livello 5
    ├───────────────────┤
    │   ML/Predittivo    │  Livello 4
    ├───────────────────┤
    │   Diagnostico      │  Livello 3
    ├───────────────────┤
    │   Descrittivo/BI   │  Livello 2
    ├───────────────────┤
    │   Raccolta + DW    │  Livello 1 ← INIZIA QUI
    └───────────────────┘
```

### HADI Cycle

| Step | Domanda |
|:---|:---|
| **H**ypothesis | Cosa pensi che succederà? |
| **A**ction | Quale esperimento fai? |
| **D**ata | Quali dati raccogli? |
| **I**nsight | Cosa hai imparato? |

### ICE Scoring

```python
ice = (Impact + Confidence + Ease) / 3  # Ogni valore 1-10
```

### OKR Template

```
Objective: [Qualitativo, ispirazionale]
├── KR1: [Metrica] da [X] a [Y] entro [data]
├── KR2: [Metrica] da [X] a [Y] entro [data]
└── KR3: [Metrica] da [X] a [Y] entro [data]
```

## Benchmark per Settore

### Retention (D1 / D7 / D30)

| Settore | D1 | D7 | D30 |
|:---|:---:|:---:|:---:|
| Social | 40-50% | 25-35% | 15-25% |
| Gaming | 30-40% | 15-20% | 5-10% |
| SaaS B2B | 80-90% | 70-80% | 60-70% |
| E-commerce | 25-35% | 12-18% | 5-10% |
| FinTech | 35-45% | 20-30% | 12-18% |

### Unit Economics

| Metrica | Soglia Sana |
|:---|:---:|
| LTV / CAC | ≥ 3x |
| CAC Payback | ≤ 12-18 mesi |
| Gross Margin | > 70% (SaaS) |
| NRR (B2B SaaS) | > 110% |
| Monthly Churn | < 5% (B2C) / < 2% (B2B) |

## Errori Fatali da Evitare

1. ❌ Partire dalla tecnologia → ✅ Parti dalle domande di business
2. ❌ Troppi KPI (>7) → ✅ Max 3-5 per team
3. ❌ KPI senza target → ✅ Ogni KPI ha un numero obiettivo
4. ❌ Vanity metrics → ✅ Metriche azionabili (rapporti, non totali)
5. ❌ Analisi senza raccomandazione → ✅ Ogni analisi finisce con "Cosa fare"
''')

# panoramica/mappe-concettuali.mdx
write_lesson('panoramica/mappe-concettuali.mdx', '''---
title: "Mappe Concettuali — Connessioni tra i Moduli"
description: "Visione d\'insieme del percorso formativo: come si collegano i moduli e in che ordine affrontarli."
module: "Modulo 1: Fondamenti & Strategia"
order: 10
prerequisites: []
category: "Panoramica"
---

# Mappe Concettuali: La Visione d\'Insieme

> **Obiettivo:** Capire come i 6 moduli del corso si interconnettono e costruire un percorso di apprendimento personalizzato.

## 1. L\'Architettura del Corso

Il corso segue una struttura a **piramide**: ogni modulo costruisce sulle fondamenta del precedente.

```mermaid
graph TD
    M1["🎯 Modulo 1<br>Fondamenti & Strategia<br><i>Perché raccogliere dati?</i>"] 
    --> M2["📡 Modulo 2<br>Data Collection & Tracking<br><i>Come raccogliere i dati?</i>"]
    M2 --> M3["⚙️ Modulo 3<br>Infrastructure & Engineering<br><i>Dove conservare e trasformare?</i>"]
    M3 --> M4["⚡ Modulo 4<br>Real-Time Streaming<br><i>Come elaborare in tempo reale?</i>"]
    M3 --> M5["📊 Modulo 5<br>Analytics & Data Science<br><i>Come analizzare e decidere?</i>"]
    M4 --> M6["📈 Modulo 6<br>Visualization & Reporting<br><i>Come comunicare i risultati?</i>"]
    M5 --> M6
```

## 2. Mappa delle Competenze per Modulo

| Modulo | Competenze Acquisite | Ruoli Target |
|:---|:---|:---|
| **M1: Fondamenti** | Strategia dati, OKR, metriche, JTBD | Tutti |
| **M2: Data Collection** | Tracking plan, event design, GDPR, GA4 | Marketing, Product |
| **M3: Infrastructure** | SQL, ClickHouse, data modeling, ETL, S3 | Data Engineer |
| **M4: Real-Time** | Kafka, streaming, CDC, monitoring | Data Engineer, SRE |
| **M5: Analytics** | Coorti, A/B test, ML, attribution, NPS | Data Analyst, Scientist |
| **M6: Visualization** | Dashboard, storytelling, Python, Metabase | Analyst, Manager |

## 3. Percorsi Personalizzati

### 🎯 Percorso "Marketing Analyst" (8 settimane)

```mermaid
graph LR
    A["M1: Fondamenti<br>2 sett"] --> B["M2: Tracking<br>2 sett"] 
    --> C["M5: Analytics<br>2 sett"] --> D["M6: Viz<br>2 sett"]
```

Focus: Metriche → Tracking → Analisi di coorte, attribution → Dashboard e storytelling

### ⚙️ Percorso "Data Engineer" (10 settimane)

```mermaid
graph LR
    A["M1: Fondamenti<br>1 sett"] --> B["M2: Tracking<br>1 sett"] 
    --> C["M3: Infra<br>3 sett"] --> D["M4: Streaming<br>3 sett"]
    --> E["M6: Monitoring<br>2 sett"]
```

Focus: Tracking → SQL, ClickHouse, S3 → Kafka, CDC → Monitoring & Observability

### 📊 Percorso "Product Manager" (6 settimane)

```mermaid
graph LR
    A["M1: Fondamenti<br>2 sett"] --> B["M5: Analytics<br>2 sett"] 
    --> C["M6: Viz<br>2 sett"]
```

Focus: OKR, JTBD, metriche → A/B test, retention, PMF → Dashboard per stakeholder

## 4. Connessioni tra Argomenti

Le lezioni non sono isolate. Ecco le connessioni più importanti:

| Da (Lezione) | A (Lezione) | Connessione |
|:---|:---|:---|
| OKR e KPI (M1) | Tracking Plan (M2) | I KPI definiscono *cosa* tracciare |
| Event Tracking (M2) | Kafka Producers (M4) | Gli eventi fluiscono nel sistema streaming |
| Data Modeling (M3) | Analisi di Coorte (M5) | Il modello dati determina le analisi possibili |
| ClickHouse (M3) | Dashboard Live (M6) | Il data warehouse alimenta le dashboard |
| A/B Testing (M5) | HADI Cycles (M5) | L\'esperimento è il cuore del ciclo HADI |
| Schema Registry (M4) | Data Quality (M3) | I contratti dati garantiscono la qualità |

## 5. Checklist di Completamento

Usa questa checklist per tracciare il tuo progresso:

- [ ] **M1:** Sai definire OKR per il tuo team
- [ ] **M1:** Sai distinguere KPI da metriche da driver
- [ ] **M2:** Sai progettare un tracking plan da zero
- [ ] **M2:** Sai implementare il consent mode per GDPR
- [ ] **M3:** Sai scrivere query SQL per analisi di business
- [ ] **M3:** Sai progettare uno schema per ClickHouse
- [ ] **M4:** Sai configurare un topic Kafka con partitioning
- [ ] **M4:** Sai implementare una pipeline Kafka → ClickHouse
- [ ] **M5:** Sai disegnare ed eseguire un A/B test
- [ ] **M5:** Sai calcolare LTV, CAC e unit economics
- [ ] **M6:** Sai creare una dashboard executive
- [ ] **M6:** Sai raccontare i dati con lo storytelling

## Risorse

- Il [Learning Path completo](/corso/learning-path/) con l\'elenco di tutte le lezioni
- Ogni modulo ha un **Caso Studio** finale e un **Cheat Sheet** per il ripasso
''')

print("\\n=== Batch 2 completato (4 file) ===")
