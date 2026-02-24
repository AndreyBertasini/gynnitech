#!/usr/bin/env python3
import os, re
BASE = os.path.join(os.path.dirname(__file__), '..', 'src', 'content', 'corso')

def rewrite(rel_path, body):
    fp = os.path.join(BASE, rel_path)
    with open(fp, 'r', encoding='utf-8') as f: old = f.read()
    fm = re.match(r'^---\n(.*?)\n---', old, re.DOTALL)
    frontmatter = fm.group(0) if fm else '---\n---'
    with open(fp, 'w', encoding='utf-8') as f: f.write(frontmatter + '\n' + body.strip() + '\n')
    print(f"✅ {rel_path}")

# === DASHBOARD-VISUALIZZAZIONE ===

rewrite('dashboard-visualizzazione/caso-studio.mdx', '''
# Caso Studio — Dashboard e Visualizzazione

> **Scenario:** Un team marketing di un e-commerce (€8M revenue) deve costruire un sistema di dashboard che sostituisca i report manuali in Excel.

## 1. Situazione Iniziale

| Problema | Impatto |
|:---|:---|
| Report Excel creato ogni lunedì (6 ore) | 312 ore/anno sprecate |
| Dati da 5 fonti diverse non collegati | Decisioni su dati parziali |
| Ogni manager ha numeri diversi | Zero fiducia nei dati |
| Nessuna dashboard real-time | Reazione lenta ai problemi |

## 2. Architettura Implementata

```mermaid
graph LR
    A["Shopify"] --> E["Airbyte"]
    B["GA4"] --> E
    C["Meta Ads"] --> E
    D["Mailchimp"] --> E
    E --> F["PostgreSQL"]
    F --> G["dbt<br>(trasformazione)"]
    G --> H["Metabase<br>(dashboard)"]
```

## 3. Le 3 Dashboard Create

### Dashboard Executive (CEO)

```sql
SELECT
    DATE_TRUNC('week', order_date) AS week,
    SUM(net_revenue) AS revenue,
    COUNT(DISTINCT customer_id) AS customers,
    ROUND(SUM(net_revenue) / COUNT(*), 2) AS aov,
    SUM(marketing_spend) AS spend,
    ROUND(SUM(net_revenue) / NULLIF(SUM(marketing_spend), 0), 2) AS roas
FROM executive_summary
GROUP BY 1 ORDER BY 1 DESC LIMIT 12;
```

KPI mostrati: Revenue settimanale, AOV, ROAS, New vs Returning customers, Top 5 prodotti.

### Dashboard Marketing

KPI: CPA per canale, ROAS per campagna, Funnel (impression → click → purchase), Budget pacing.

### Dashboard Prodotto

KPI: Conversion rate per categoria, Cart abandonment rate, Search queries senza risultati, Top pages per bounce rate.

## 4. Risultati

| Metrica | Prima | Dopo 3 mesi |
|:---|:---:|:---:|
| Tempo per report | 6 ore/sett | 0 (automatico) |
| Fonti dati integrate | 2 | 5 |
| Tempo per identificare anomalie | 2-3 giorni | <1 ora |
| Decisioni data-driven | ~25% | ~70% |

## Lezioni
1. **Meno è più:** la dashboard executive ha solo 6 KPI, non 30
2. **Automatizza prima i report più dolorosi** — il ROI è immediato
3. **Definisci le metriche PRIMA di costruire le dashboard**
''')

rewrite('dashboard-visualizzazione/cheat-sheet.mdx', '''
# Cheat Sheet — Dashboard & Data Visualization

## Principi di Design

| Principio | Regola |
|:---|:---|
| **5-Second Test** | Il messaggio principale deve essere chiaro in 5 secondi |
| **Max KPI** | 5-7 KPI per dashboard, non di più |
| **Data-Ink Ratio** | Massimizza il rapporto dato/inchiostro (Tufte) |
| **Gestalt** | Usa prossimità, similarità, continuità per raggruppare |
| **Colori** | Max 5-7 colori, rosso=negativo, verde=positivo |

## Quale Grafico Usare

| Obiettivo | Grafico | Quando |
|:---|:---|:---|
| Trend nel tempo | Line chart | Serie temporali |
| Confronto categorie | Bar chart | Classifica, distribuzione |
| Parti di un tutto | Stacked bar / Donut | Composizione (max 5 categorie) |
| Correlazione | Scatter plot | Relazione tra 2 variabili |
| Distribuzione | Histogram / Box plot | Capire la forma dei dati |
| KPI singolo | Scorecard / Big Number | Dashboard executive |
| Funnel | Funnel chart | Conversion path |

## Template SQL per Dashboard

```sql
-- KPI giornaliero con confronto WoW
SELECT
    today.date,
    today.revenue,
    prev_week.revenue AS revenue_prev_week,
    ROUND((today.revenue - prev_week.revenue) / prev_week.revenue * 100, 1) AS wow_change
FROM daily_metrics today
LEFT JOIN daily_metrics prev_week 
    ON prev_week.date = today.date - INTERVAL 7 DAY;
```

## Storytelling Framework

```
1. CONTESTO: "Il nostro obiettivo è..."
2. INSIGHT: "I dati mostrano che..."
3. IMPLICAZIONE: "Questo significa che..."
4. AZIONE: "Dovremmo..."
```

## Errori da Evitare

- ❌ Pie chart con >5 categorie → ✅ Bar chart orizzontale
- ❌ 3D charts → ✅ Sempre 2D
- ❌ Troppi colori → ✅ Palette coerente (max 5-7)
- ❌ Dashboard senza contesto → ✅ Aggiungi target e periodo precedente
- ❌ Tabelle con 50 righe → ✅ Top 10 + "vedi tutto"
''')

rewrite('dashboard-visualizzazione/etl-data-pipeline.mdx', '''
# ETL e Data Pipeline per la Visualizzazione

> **Obiettivo:** Costruire pipeline dati affidabili che alimentino le dashboard con dati puliti e aggiornati.

## 1. ETL vs ELT

| Approccio | Processo | Quando Usarlo |
|:---|:---|:---|
| **ETL** | Extract → Transform → Load | Dati sensibili, trasformazioni complesse |
| **ELT** | Extract → Load → Transform | Cloud DW moderni, dbt |

```mermaid
graph LR
    subgraph ETL
        A1["Extract"] --> B1["Transform"] --> C1["Load"]
    end
    subgraph ELT
        A2["Extract"] --> C2["Load"] --> B2["Transform<br>(dbt)"]
    end
```

## 2. Pipeline con dbt

```sql
-- models/staging/stg_orders.sql
WITH source AS (
    SELECT * FROM {{ source('shopify', 'orders') }}
),
cleaned AS (
    SELECT
        id AS order_id,
        customer_id,
        CAST(created_at AS DATE) AS order_date,
        total_price - total_discounts - total_tax AS net_revenue,
        financial_status,
        fulfillment_status
    FROM source
    WHERE financial_status = 'paid'
      AND cancelled_at IS NULL
)
SELECT * FROM cleaned
```

```sql
-- models/marts/mart_daily_revenue.sql
SELECT
    order_date,
    COUNT(DISTINCT order_id) AS orders,
    COUNT(DISTINCT customer_id) AS unique_customers,
    SUM(net_revenue) AS revenue,
    ROUND(SUM(net_revenue) / COUNT(DISTINCT order_id), 2) AS aov
FROM {{ ref('stg_orders') }}
GROUP BY order_date
```

## 3. Data Quality Checks

```sql
-- tests/assert_revenue_positive.sql
SELECT order_id, net_revenue
FROM {{ ref('stg_orders') }}
WHERE net_revenue <= 0

-- Se restituisce righe, il test fallisce
```

```python
# Test automatici per la pipeline
def test_data_freshness(engine, table: str, max_hours: int = 24):
    """Verifica che i dati siano aggiornati."""
    result = engine.execute(f"""
        SELECT MAX(updated_at) as last_update,
               EXTRACT(hours FROM NOW() - MAX(updated_at)) as hours_ago
        FROM {table}
    """).fetchone()
    assert result.hours_ago < max_hours, f"Dati vecchi di {result.hours_ago}h!"
```

## 4. Orchestrazione

| Tool | Tipo | Prezzo |
|:---|:---|:---|
| **cron + dbt** | Semplice, affidabile | Gratis |
| **Airflow** | Enterprise, DAG complessi | Gratis (self-hosted) |
| **Dagster** | Modern, developer-friendly | Gratis (self-hosted) |
| **Prefect** | Cloud-native | Freemium |

## Risorse
- **Tool:** dbt Core, Airbyte, Airflow
- **Best Practice:** Idempotenza, incremental models, testing
''')

rewrite('dashboard-visualizzazione/python-data-analysis.mdx', '''
# Python per Data Analysis

> **Obiettivo:** Usare Python (pandas, matplotlib) per analisi esplorative e generazione di report che alimentano le dashboard.

## 1. Pandas per l\'Analisi Marketing

```python
import pandas as pd

# Leggere e preparare i dati
orders = pd.read_csv('orders.csv', parse_dates=['order_date'])
orders['month'] = orders['order_date'].dt.to_period('M')

# KPI mensili
monthly = orders.groupby('month').agg(
    revenue=('net_revenue', 'sum'),
    orders=('order_id', 'nunique'),
    customers=('customer_id', 'nunique'),
    aov=('net_revenue', 'mean')
).round(2)

# Crescita MoM
monthly['revenue_growth'] = monthly['revenue'].pct_change().round(3)
print(monthly.tail(6))
```

## 2. Visualizzazione con Matplotlib

```python
import matplotlib.pyplot as plt

fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# Revenue trend
axes[0,0].plot(monthly.index.astype(str), monthly['revenue'], marker='o')
axes[0,0].set_title('Revenue Mensile')
axes[0,0].set_ylabel('€')

# AOV trend
axes[0,1].bar(monthly.index.astype(str), monthly['aov'], color='coral')
axes[0,1].set_title('Average Order Value')

# Customers
axes[1,0].plot(monthly.index.astype(str), monthly['customers'], marker='s', color='green')
axes[1,0].set_title('Clienti Unici')

# Growth
colors = ['green' if x > 0 else 'red' for x in monthly['revenue_growth'].fillna(0)]
axes[1,1].bar(monthly.index.astype(str), monthly['revenue_growth']*100, color=colors)
axes[1,1].set_title('Crescita MoM (%)')

plt.tight_layout()
plt.savefig('monthly_report.png', dpi=150)
```

## 3. Analisi Segmentata

```python
# Segmentazione per canale di acquisizione
channel_perf = orders.groupby('utm_source').agg(
    revenue=('net_revenue', 'sum'),
    orders=('order_id', 'nunique'),
    avg_aov=('net_revenue', 'mean'),
    unique_customers=('customer_id', 'nunique')
).sort_values('revenue', ascending=False)

channel_perf['revenue_share'] = (channel_perf['revenue'] / channel_perf['revenue'].sum() * 100).round(1)
print(channel_perf)
```

## 4. Export per Dashboard

```python
# Salvare i risultati per Metabase/Looker
monthly.to_sql('mart_monthly_kpi', engine, if_exists='replace', index=True)
channel_perf.to_sql('mart_channel_performance', engine, if_exists='replace', index=True)
```

## Risorse
- **Librerie:** pandas, matplotlib, seaborn, plotly
- **Best Practice:** Virtual environments, requirements.txt, type hints
''')

rewrite('dashboard-visualizzazione/sql-per-analisti.mdx', '''
# SQL per Analisti

> **Obiettivo:** Padroneggiare le query SQL necessarie per alimentare dashboard e report di business.

## 1. Le Query Fondamentali per Dashboard

### KPI Giornalieri con Confronto

```sql
SELECT
    d.date,
    d.revenue,
    d.orders,
    d.aov,
    -- Confronto con settimana precedente
    prev.revenue AS revenue_prev_week,
    ROUND((d.revenue - prev.revenue) / NULLIF(prev.revenue, 0) * 100, 1) AS wow_pct,
    -- Confronto con mese precedente
    prev_m.revenue AS revenue_prev_month,
    ROUND((d.revenue - prev_m.revenue) / NULLIF(prev_m.revenue, 0) * 100, 1) AS mom_pct
FROM daily_metrics d
LEFT JOIN daily_metrics prev ON prev.date = d.date - INTERVAL 7 DAY
LEFT JOIN daily_metrics prev_m ON prev_m.date = d.date - INTERVAL 30 DAY
WHERE d.date >= CURRENT_DATE - INTERVAL 30 DAY
ORDER BY d.date DESC;
```

### Funnel Analysis

```sql
WITH funnel AS (
    SELECT
        COUNT(DISTINCT CASE WHEN event = 'page_view' THEN session_id END) AS step1_view,
        COUNT(DISTINCT CASE WHEN event = 'add_to_cart' THEN session_id END) AS step2_atc,
        COUNT(DISTINCT CASE WHEN event = 'checkout_start' THEN session_id END) AS step3_checkout,
        COUNT(DISTINCT CASE WHEN event = 'purchase' THEN session_id END) AS step4_purchase
    FROM events WHERE event_date >= CURRENT_DATE - INTERVAL 30 DAY
)
SELECT
    step1_view AS "Page View",
    step2_atc AS "Add to Cart",
    ROUND(step2_atc * 100.0 / step1_view, 1) AS "View → ATC %",
    step3_checkout AS "Checkout",
    ROUND(step3_checkout * 100.0 / step2_atc, 1) AS "ATC → Checkout %",
    step4_purchase AS "Purchase",
    ROUND(step4_purchase * 100.0 / step1_view, 1) AS "Overall Conv %"
FROM funnel;
```

### Window Functions per Trend

```sql
-- Running total + media mobile 7 giorni
SELECT
    date,
    revenue,
    SUM(revenue) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) / 7 AS ma_7d,
    SUM(revenue) OVER (PARTITION BY DATE_TRUNC('month', date) ORDER BY date) AS mtd_revenue,
    RANK() OVER (PARTITION BY DATE_TRUNC('month', date) ORDER BY revenue DESC) AS best_day_rank
FROM daily_metrics;
```

## 2. Pattern Comuni

### Top N con "Others"

```sql
WITH ranked AS (
    SELECT channel, revenue,
        ROW_NUMBER() OVER (ORDER BY revenue DESC) AS rn
    FROM channel_summary
)
SELECT
    CASE WHEN rn <= 5 THEN channel ELSE 'Others' END AS channel,
    SUM(revenue) AS revenue
FROM ranked GROUP BY 1 ORDER BY revenue DESC;
```

### Percentile e Distribuzione

```sql
SELECT
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY order_value) AS p25,
    PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY order_value) AS median,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY order_value) AS p75,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY order_value) AS p95
FROM orders;
```

## Risorse
- **Libro:** *SQL for Data Scientists* — Renee Teate
- **Practice:** SQLZoo, LeetCode SQL, Mode Analytics tutorials
''')

rewrite('dashboard-visualizzazione/storytelling-dati.mdx', '''
# Storytelling con i Dati

> **Obiettivo:** Trasformare numeri e grafici in narrative persuasive che guidano le decisioni aziendali.

## 1. Perché lo Storytelling è Cruciale

Un'analisi perfetta che nessuno capisce ha **zero impatto**. Lo storytelling trasforma i dati in decisioni.

| Solo Dati 🚫 | Dati + Storia ✅ |
|:---|:---|
| "Il churn è 4.2%" | "Stiamo perdendo 84 clienti al mese — €420K/anno di revenue" |
| "CT rate è 2.3%" | "Solo 2 persone su 100 cliccano — stiamo sprecando il 98% del budget" |
| "NPS è 32" | "1 cliente su 3 ci raccomanderebbe — ma 1 su 5 ci sconsiglia attivamente" |

## 2. Il Framework SCI

Ogni presentazione dati efficace segue la struttura **SCI**:

```mermaid
graph LR
    S["📍 Situazione<br>Dove siamo oggi"] 
    --> C["⚠️ Complicazione<br>Cosa è cambiato / il problema"]
    --> I["💡 Implicazione<br>Cosa dobbiamo fare"]
```

### Esempio

```
SITUAZIONE: "Il nostro e-commerce genera €500K/mese con un AOV di €75"
COMPLICAZIONE: "Negli ultimi 3 mesi il cart abandonment è salito dal 65% al 78%"  
IMPLICAZIONE: "Se non interveniamo, perderemo €180K/anno. 
              Propongo: (1) email recupero carrello, (2) semplificare il checkout"
```

## 3. Regole di Visualizzazione per lo Storytelling

| Regola | Applicazione |
|:---|:---|
| **Annota** | Evidenzia i punti importanti direttamente sul grafico |
| **Confronta** | Mostra sempre il "prima vs dopo" o "noi vs benchmark" |
| **Semplifica** | Un grafico = un messaggio |
| **Colore con scopo** | Grigio per contesto, colore per il focus |
| **Titolo = Insight** | Non "Revenue per mese" ma "Revenue in calo del 12% da ottobre" |

## 4. Template per Presentazione Dati

```python
presentation_template = {
    "title": "Analisi Cart Abandonment Q4 2025",
    "audience": "Leadership team",
    "duration": "10 minuti",
    "slides": [
        {"type": "context", "content": "Obiettivo: ridurre cart abandonment del 15%"},
        {"type": "data", "chart": "line_chart_abandonment_trend", "insight": "Peggiorato del 20% in 3 mesi"},
        {"type": "diagnosis", "content": "Il 60% abbandona al form di pagamento"},
        {"type": "recommendation", "content": "3 azioni: guest checkout, Apple Pay, email recovery"},
        {"type": "impact", "content": "Impatto stimato: +€180K/anno, implementazione: 3 settimane"}
    ]
}
```

## 5. Errori di Storytelling

| Errore | Soluzione |
|:---|:---|
| Iniziare con la metodologia | Inizia con il risultato |
| Troppi grafici | Max 1 grafico per minuto di presentazione |
| Nessuna raccomandazione | Ogni analisi finisce con "Cosa fare" |
| Gergo tecnico | Parla la lingua del pubblico |

## Risorse
- **Libro:** *Storytelling with Data* — Cole Nussbaumer Knaflic
- **Libro:** *The Pyramid Principle* — Barbara Minto
''')

# === INFRASTRUCTURE-OPS ===

rewrite('infrastructure-ops/caso-studio.mdx', '''
# Caso Studio — Infrastructure & Data Ops

> **Scenario:** Una scale-up (Series B, 50 dipendenti) deve costruire un'infrastruttura dati scalabile per supportare 10M eventi/giorno.

## 1. Requisiti

| Requisito | Specifica |
|:---|:---|
| Volume | 10M eventi/giorno → 300M/mese |
| Latenza | Dashboard aggiornate ogni 5 minuti |
| Costo | Budget infra: €3K/mese |
| Team | 1 data engineer, 1 analyst |
| Disponibilità | 99.9% uptime |

## 2. Architettura Scelta

```mermaid
graph LR
    A["SDK Client"] --> B["Kafka<br>(buffer)"]
    B --> C["ClickHouse<br>(analytics)"]
    C --> D["Metabase<br>(dashboard)"]
    B --> E["S3<br>(archive)"]
    F["Terraform"] -.-> B
    F -.-> C
    F -.-> E
    G["GitHub Actions"] -.-> F
```

### Stack Selezionato

| Componente | Tool | Costo/mese |
|:---|:---|:---:|
| Streaming | Kafka (Confluent Cloud Basic) | €200 |
| Analytics DB | ClickHouse Cloud (Dev) | €300 |
| Storage | AWS S3 | €50 |
| Dashboard | Metabase (self-hosted) | €0 |
| IaC | Terraform | €0 |
| CI/CD | GitHub Actions | €0 |
| Monitoring | Grafana Cloud (free tier) | €0 |
| **Totale** | | **€550/mese** |

## 3. Risultati dopo 6 Mesi

| Metrica | Obiettivo | Risultato |
|:---|:---:|:---:|
| Uptime | 99.9% | 99.95% |
| Latenza query p95 | <5s | 2.1s |
| Costo/mese | €3K | €550 |
| Deploy time | <30 min | 8 min |
| Incidenti gravi | 0 | 0 |

## Lezioni
1. Start small: ClickHouse Dev tier gestisce 10M eventi/giorno senza problemi
2. Kafka come buffer protegge ClickHouse da spike di traffico
3. Terraform + GitHub Actions = infrastruttura riproducibile dal giorno 1
''')

rewrite('infrastructure-ops/cheat-sheet.mdx', '''
# Cheat Sheet — Infrastructure & Ops

## Comandi Essenziali

### Terraform

```bash
terraform init          # Inizializza il progetto
terraform plan          # Mostra le modifiche previste
terraform apply         # Applica le modifiche
terraform destroy       # Distrugge l\'infrastruttura
terraform state list    # Lista risorse gestite
```

### Docker

```bash
docker compose up -d     # Avvia i servizi
docker compose logs -f   # Segui i log
docker compose ps        # Stato dei container
docker system prune -a   # Pulizia completa
```

### ClickHouse

```sql
-- Stato del cluster
SELECT * FROM system.metrics WHERE metric LIKE '%Query%';
SELECT database, table, formatReadableSize(total_bytes) FROM system.tables ORDER BY total_bytes DESC;

-- Performance query
SELECT query, query_duration_ms, read_rows, memory_usage FROM system.query_log ORDER BY query_duration_ms DESC LIMIT 10;
```

## Monitoring Checklist

| Cosa Monitorare | Soglia Alert | Tool |
|:---|:---|:---|
| CPU | >80% per 5 min | Grafana |
| Memoria | >85% | Grafana |
| Disco | >80% | Alert email |
| Query latency p95 | >5s | ClickHouse system tables |
| Pipeline lag | >5 min | Kafka consumer lag |
| Error rate | >1% | Application logs |

## Costi di Riferimento

| Servizio | Free Tier | Produzione |
|:---|:---|:---|
| ClickHouse Cloud | 300GB, $300 crediti | Da $200/mese |
| Confluent Kafka | Basic cluster free | Da $100/mese |
| AWS S3 | 5GB, 12 mesi | ~$0.023/GB/mese |
| Terraform Cloud | 500 risorse | Da $20/user/mese |
| Grafana Cloud | 10K metriche | Da $29/mese |
''')

rewrite('infrastructure-ops/iac-terraform.mdx', '''
# Infrastructure as Code con Terraform

> **Obiettivo:** Gestire l\'infrastruttura dati come codice versionato usando Terraform.

## 1. Perché IaC

| Manuale 🚫 | IaC ✅ |
|:---|:---|
| Click sulla console AWS | Codice in Git, review, PR |
| "Chi ha cambiato quella config?" | Git blame + history |
| "Ricrea l\'ambiente di staging" → 2 giorni | `terraform apply` → 10 minuti |
| Drift non rilevato | `terraform plan` mostra i delta |

## 2. Struttura di un Progetto Terraform

```
infra/
├── main.tf              # Provider e backend
├── variables.tf         # Variabili di input
├── outputs.tf           # Output (URL, IP, ecc.)
├── modules/
│   ├── clickhouse/      # Modulo ClickHouse
│   ├── kafka/           # Modulo Kafka
│   └── s3/              # Modulo S3
├── environments/
│   ├── dev.tfvars       # Config per dev
│   └── prod.tfvars      # Config per prod
└── .github/workflows/
    └── terraform.yml    # CI/CD pipeline
```

## 3. Esempio: Provisioning S3 + ClickHouse

```hcl
# main.tf
terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  backend "s3" {
    bucket = "mycompany-terraform-state"
    key    = "data-infra/terraform.tfstate"
    region = "eu-west-1"
  }
}

# S3 Bucket per Data Lake
resource "aws_s3_bucket" "data_lake" {
  bucket = "mycompany-data-lake-${var.environment}"
  
  tags = {
    Environment = var.environment
    Team        = "data-engineering"
    ManagedBy   = "terraform"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "data_lifecycle" {
  bucket = aws_s3_bucket.data_lake.id
  
  rule {
    id     = "archive-old-data"
    status = "Enabled"
    
    transition {
      days          = 90
      storage_class = "GLACIER"
    }
    
    expiration {
      days = 365
    }
  }
}
```

## 4. CI/CD per Terraform

```yaml
# .github/workflows/terraform.yml
name: Terraform
on:
  pull_request:
    paths: ['infra/**']
  push:
    branches: [main]
    paths: ['infra/**']

jobs:
  plan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - run: terraform init
        working-directory: infra
      - run: terraform plan -var-file=environments/prod.tfvars
        working-directory: infra
  
  apply:
    if: github.ref == 'refs/heads/main'
    needs: plan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - run: terraform apply -auto-approve -var-file=environments/prod.tfvars
        working-directory: infra
```

## 5. Best Practices

| Practice | Perché |
|:---|:---|
| Remote state (S3) | Condivisione team + locking |
| Moduli | Riusabilità e organizzazione |
| Plan prima di apply | Review delle modifiche |
| Tag su tutto | Tracking costi e ownership |
| Secrets in Vault/SSM | Mai credenziali nei .tf |

## Risorse
- **Doc:** [terraform.io/docs](https://terraform.io/docs)
- **Corso:** HashiCorp Learn Terraform
- **Tool:** tflint, checkov per security scanning
''')

print(f"\\n=== Batch 5 completato (9 file) ===")
