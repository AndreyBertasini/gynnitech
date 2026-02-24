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

rewrite('marketing-data-science/hadi-cycles.mdx', r'''
# HADI Cycles: Il Segreto della Crescita Rapida

> **Obiettivo:** Padroneggiare il ciclo Hypothesis-Action-Data-Insight per iterare rapidamente e scalare la crescita.

## 1. Il Framework HADI

Le aziende che crescono più velocemente non sono quelle con più budget, ma quelle che **iterano più rapidamente**. Il ciclo HADI struttura questo processo.

```mermaid
graph LR
    H["🧪 Hypothesis<br>Cosa credi?"] --> A["⚡ Action<br>Cosa fai?"]
    A --> D["📊 Data<br>Cosa misuri?"]
    D --> I["💡 Insight<br>Cosa impari?"]
    I --> H
```

## 2. Come Scrivere Ipotesi Efficaci

Una buona ipotesi ha 3 componenti:

```python
hypothesis_template = {
    "if_we": "Aggiungiamo testimonianze sulla landing page",
    "then": "il conversion rate aumenterà del 15%",
    "because": "la social proof riduce l'ansia decisionale",
    "metric": "landing_page_conversion_rate",
    "target": 0.15,  # 15% lift relativo
    "timeline": "2 settimane",
    "confidence": 7,  # 1-10
}
```

### Template di Documentazione

| Campo | Esempio |
|:---|:---|
| **ID** | HADI-042 |
| **Ipotesi** | Se aggiungiamo un countdown al checkout, le conversioni aumenteranno del 10% |
| **Azione** | A/B test: checkout con/senza countdown |
| **Metrica primaria** | checkout_completion_rate |
| **Metrica guardrail** | refund_rate (non deve aumentare) |
| **Durata** | 14 giorni |
| **Sample size** | 5.000 utenti/gruppo |
| **Risultato** | +8.2% (p=0.03) ✅ |
| **Insight** | L'urgenza funziona, ma solo per ordini <€100 |
| **Next step** | Testare urgenza personalizzata per fascia di prezzo |

## 3. La Velocità di Iterazione

La metrica più importante per un growth team è il **numero di esperimenti a settimana**:

| Livello | Esperimenti/Settimana | Aziende |
|:---|:---:|:---|
| Beginner | 1-2 | Startup early-stage |
| Intermediate | 3-5 | Scale-up |
| Advanced | 10-20 | Booking.com, Netflix |
| Expert | 50+ | Google, Amazon |

```python
# Tracker degli esperimenti HADI
import json
from datetime import datetime

class HADITracker:
    def __init__(self):
        self.experiments = []
    
    def add(self, hypothesis: str, action: str, metric: str, target: float):
        self.experiments.append({
            "id": f"HADI-{len(self.experiments)+1:03d}",
            "created": datetime.now().isoformat(),
            "hypothesis": hypothesis,
            "action": action,
            "metric": metric,
            "target": target,
            "status": "backlog",
            "result": None,
            "insight": None
        })
    
    def close(self, exp_id: str, result: float, insight: str):
        for exp in self.experiments:
            if exp["id"] == exp_id:
                exp["status"] = "completed"
                exp["result"] = result
                exp["insight"] = insight
                exp["won"] = result >= exp["target"]
    
    def win_rate(self) -> float:
        completed = [e for e in self.experiments if e["status"] == "completed"]
        won = [e for e in completed if e.get("won")]
        return len(won) / len(completed) if completed else 0
```

## 4. Metriche del Growth Team

| Metrica | Descrizione | Target |
|:---|:---|:---|
| Velocity | Esperimenti lanciati/settimana | >3 |
| Win Rate | % esperimenti con risultato positivo | 20-30% |
| Impact | Lift medio degli esperimenti vinti | >5% |
| Learning Rate | Insight documentati/settimana | >5 |

> **Nota:** Un win rate del 20-30% è normale e sano. Se vinci il 90% degli esperimenti, stai testando cose troppo ovvie.

## Risorse
- **Libro:** *Hacking Growth* — Sean Ellis
- **Tool:** GrowthHackers Northstar, Notion template HADI
''')

rewrite('marketing-data-science/python.mdx', r'''
# Python for Data Engineering nel Marketing

> **Obiettivo:** Usare Python come strumento operativo per ETL, analisi e automazione delle pipeline di marketing data.

## 1. Python nello Stack MarTech

Python è il linguaggio ponte tra marketing e ingegneria dati. Ecco dove si usa:

| Use Case | Librerie | Output |
|:---|:---|:---|
| ETL/ELT | pandas, requests, sqlalchemy | Pipeline dati |
| Analisi | pandas, scipy, statsmodels | Report e insight |
| ML/AI | scikit-learn, xgboost | Modelli predittivi |
| Automazione | schedule, airflow | Job schedulati |
| API Integration | requests, httpx | Connettori custom |

## 2. Pipeline Marketing: Da API a Data Warehouse

```python
import pandas as pd
import requests
from sqlalchemy import create_engine

class MarketingPipeline:
    def __init__(self, db_url: str):
        self.engine = create_engine(db_url)
    
    def extract_meta_ads(self, access_token: str, account_id: str) -> pd.DataFrame:
        """Estrae i dati da Meta Ads API."""
        url = f"https://graph.facebook.com/v18.0/act_{account_id}/insights"
        params = {
            'access_token': access_token,
            'fields': 'campaign_name,impressions,clicks,spend,conversions',
            'date_preset': 'last_30d',
            'level': 'campaign'
        }
        resp = requests.get(url, params=params)
        data = resp.json().get('data', [])
        return pd.DataFrame(data)
    
    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Pulizia e arricchimento dei dati."""
        df['impressions'] = pd.to_numeric(df['impressions'], errors='coerce')
        df['clicks'] = pd.to_numeric(df['clicks'], errors='coerce')
        df['spend'] = pd.to_numeric(df['spend'], errors='coerce')
        df['ctr'] = (df['clicks'] / df['impressions'] * 100).round(2)
        df['cpc'] = (df['spend'] / df['clicks']).round(2)
        df['extracted_at'] = pd.Timestamp.now()
        return df
    
    def load(self, df: pd.DataFrame, table: str):
        """Carica nel data warehouse."""
        df.to_sql(table, self.engine, if_exists='append', index=False)

# Esecuzione
pipeline = MarketingPipeline('postgresql://user:pass@localhost/marketing')
raw = pipeline.extract_meta_ads(token, account)
clean = pipeline.transform(raw)
pipeline.load(clean, 'meta_ads_daily')
```

## 3. Analisi di Coorte con Pandas

```python
def cohort_analysis(orders: pd.DataFrame) -> pd.DataFrame:
    """Analisi di coorte basata sul mese di primo acquisto."""
    orders['order_month'] = orders['order_date'].dt.to_period('M')
    
    first_purchase = orders.groupby('customer_id')['order_month'].min()
    first_purchase.name = 'cohort'
    orders = orders.merge(first_purchase, on='customer_id')
    
    orders['period'] = (orders['order_month'] - orders['cohort']).apply(lambda x: x.n)
    
    cohort_data = orders.groupby(['cohort', 'period']).agg(
        customers=('customer_id', 'nunique')
    ).reset_index()
    
    cohort_sizes = cohort_data[cohort_data['period'] == 0][['cohort', 'customers']]
    cohort_sizes.columns = ['cohort', 'cohort_size']
    
    cohort_data = cohort_data.merge(cohort_sizes, on='cohort')
    cohort_data['retention'] = (cohort_data['customers'] / cohort_data['cohort_size'] * 100).round(1)
    
    return cohort_data.pivot(index='cohort', columns='period', values='retention')
```

## 4. Automazione Report

```python
import schedule
import time

def daily_marketing_report():
    """Genera e invia il report marketing giornaliero."""
    df = pd.read_sql("""
        SELECT channel, SUM(spend) as spend, SUM(conversions) as conv,
               ROUND(SUM(spend)/NULLIF(SUM(conversions),0), 2) as cpa
        FROM marketing_daily WHERE date = CURRENT_DATE - 1
        GROUP BY channel ORDER BY spend DESC
    """, engine)
    
    summary = f"📊 Report Marketing {pd.Timestamp.now().strftime('%d/%m')}\n"
    summary += f"Spesa totale: €{df['spend'].sum():,.0f}\n"
    summary += f"Conversioni: {df['conv'].sum():,}\n"
    summary += f"CPA medio: €{df['cpa'].mean():.2f}\n"
    
    send_slack(summary)

schedule.every().day.at("08:00").do(daily_marketing_report)
```

## Risorse
- **Librerie:** pandas, scikit-learn, requests, sqlalchemy
- **Best Practice:** Type hints, virtual environments, testing
''')

rewrite('marketing-data-science/strategy.mdx', r'''
# Strategy Frameworks per il Marketing Data-Driven

> **Obiettivo:** Applicare framework strategici per allineare la data strategy agli obiettivi di business.

## 1. Il Framework delle 3 Lenti

Ogni strategia marketing data-driven deve rispondere a 3 domande:

```mermaid
graph TD
    A["🎯 DOVE giocare?<br>Mercati, segmenti, canali"] 
    --> B["⚔️ COME vincere?<br>Differenziazione, posizionamento"]
    B --> C["📊 COME misurare?<br>KPI, esperimenti, feedback loop"]
```

## 2. Pirate Metrics (AARRR)

Il framework più usato nelle startup per strutturare le metriche di crescita:

| Stage | Metrica | Esempio | Tool |
|:---|:---|:---|:---|
| **Acquisition** | Come ti trovano? | Visite, signup | GA4, UTM |
| **Activation** | Hanno l'esperienza "aha"? | Onboarding completion | Mixpanel |
| **Retention** | Tornano? | DAU/MAU, D30 retention | Amplitude |
| **Revenue** | Pagano? | ARPU, LTV, conversion | Stripe |
| **Referral** | Portano altri? | K-factor, NPS | Custom |

```sql
-- Funnel AARRR completo
SELECT
    COUNT(DISTINCT CASE WHEN event = 'visit' THEN user_id END) AS acquisition,
    COUNT(DISTINCT CASE WHEN event = 'signup' THEN user_id END) AS signup,
    COUNT(DISTINCT CASE WHEN event = 'activation' THEN user_id END) AS activation,
    COUNT(DISTINCT CASE WHEN event = 'purchase' THEN user_id END) AS revenue,
    COUNT(DISTINCT CASE WHEN event = 'referral_sent' THEN user_id END) AS referral,
    -- Conversion rates
    ROUND(COUNT(DISTINCT CASE WHEN event = 'signup' THEN user_id END) * 100.0 /
          NULLIF(COUNT(DISTINCT CASE WHEN event = 'visit' THEN user_id END), 0), 1) AS visit_to_signup,
    ROUND(COUNT(DISTINCT CASE WHEN event = 'purchase' THEN user_id END) * 100.0 /
          NULLIF(COUNT(DISTINCT CASE WHEN event = 'activation' THEN user_id END), 0), 1) AS activation_to_revenue
FROM events WHERE event_date >= CURRENT_DATE - INTERVAL 30 DAY;
```

## 3. Growth Accounting

```python
def growth_accounting(current_users: set, prev_users: set, new_signups: set) -> dict:
    """Scompone la crescita in componenti."""
    retained = current_users & prev_users
    churned = prev_users - current_users
    resurrected = current_users & (prev_users - current_users)  # Tornati dopo churn
    new = new_signups & current_users
    
    return {
        "retained": len(retained),
        "churned": len(churned),
        "new": len(new),
        "resurrected": len(resurrected),
        "net_growth": len(new) + len(resurrected) - len(churned),
        "quick_ratio": (len(new) + len(resurrected)) / max(len(churned), 1)
    }
# Quick Ratio > 2 = crescita sana, < 1 = stai perdendo utenti
```

## 4. North Star Metric per Settore

| Tipo Azienda | North Star Metric | Perché |
|:---|:---|:---|
| E-commerce | Weekly purchasing users | Cattura frequenza + conversione |
| SaaS B2B | Weekly active teams | Misura il valore organizzativo |
| Marketplace | Weekly transactions | Bilancia domanda e offerta |
| Media/Content | Weekly reading time | Misura engagement reale |
| Social | Daily content creators | Cattura il valore generato |
| FinTech | Weekly transacting users | Misura l'uso effettivo |

## Risorse
- **Framework:** AARRR (Dave McClure), North Star (Sean Ellis)
- **Libro:** *Good Strategy Bad Strategy* — Richard Rumelt
''')

rewrite('marketing-data-science/text-generation.mdx', r'''
# Text Generation per il Marketing

> **Obiettivo:** Usare LLM e NLP per generare, analizzare e ottimizzare i contenuti di marketing su scala.

## 1. Use Case nel Marketing

| Applicazione | Input | Output | Impatto |
|:---|:---|:---|:---|
| Email copywriting | Prodotto + segmento | Email personalizzata | +25% open rate |
| Product descriptions | Specifiche prodotto | Descrizione SEO | -80% tempo |
| Ad copy generation | Brief campagna | 20 varianti di ad | +15% CTR |
| Sentiment analysis | Recensioni clienti | Score + temi | Automazione |
| Chatbot | Domanda utente | Risposta contestuale | -60% ticket |

## 2. Generazione di Ad Copy con Prompt Engineering

```python
from openai import OpenAI

def generate_ad_variants(product: dict, n_variants: int = 5) -> list[str]:
    """Genera varianti di ad copy per A/B testing."""
    client = OpenAI()
    
    prompt = f"""Genera {n_variants} varianti di ad copy per Facebook Ads.

Prodotto: {product['name']}
Prezzo: €{product['price']}
Target: {product['target_audience']}
USP: {product['usp']}
Tono: {product['tone']}

Regole:
- Max 125 caratteri per headline
- Max 250 caratteri per body
- Includi una CTA chiara
- Ogni variante deve usare un angolo diverso (scarcity, social proof, benefit, emotion, curiosity)

Output JSON:
[{{"headline": "...", "body": "...", "cta": "...", "angle": "..."}}]"""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    return response.choices[0].message.content

# Esempio
product = {
    "name": "Corso Data Analytics",
    "price": 297,
    "target_audience": "Marketing manager 28-45 anni",
    "usp": "Da zero a dashboard in 8 settimane",
    "tone": "Professionale ma accessibile"
}
```

## 3. Analisi del Sentiment su Scala

```python
from transformers import pipeline

def analyze_reviews(reviews: list[str]) -> list[dict]:
    """Analizza il sentiment delle recensioni con un modello pre-addestrato."""
    classifier = pipeline("sentiment-analysis", 
                          model="nlptown/bert-base-multilingual-uncased-sentiment")
    results = []
    for review in reviews:
        pred = classifier(review[:512])[0]
        stars = int(pred['label'].split()[0])
        results.append({
            "text": review[:100],
            "stars": stars,
            "sentiment": "positive" if stars >= 4 else "negative" if stars <= 2 else "neutral",
            "confidence": round(pred['score'], 3)
        })
    return results
```

## 4. Personalizzazione Email con Template

```python
def personalize_email(template: str, user: dict, product_recs: list) -> str:
    """Personalizza un template email con dati utente e raccomandazioni."""
    recs_html = "".join(f"<li>{p['name']} - €{p['price']}</li>" for p in product_recs[:3])
    
    return template.format(
        name=user['first_name'],
        last_category=user['last_category_viewed'],
        recommendations=recs_html,
        discount=user.get('discount_pct', 10)
    )
```

## Risorse
- **Tool:** OpenAI API, Hugging Face Transformers
- **Framework:** Prompt Engineering Best Practices
- **Etica:** Sempre dichiarare contenuti generati da AI
''')

rewrite('marketing-data-science/trigger-analytics.mdx', r'''
# Trigger Analytics: Quando i Dati ti Avvisano

> **Obiettivo:** Implementare sistemi di alerting automatico che notificano il team quando le metriche superano soglie critiche.

## 1. Cos'è il Trigger Analytics

Il **trigger analytics** è un sistema che monitora automaticamente le metriche e genera **alert** quando qualcosa di significativo accade — positivo o negativo.

## 2. Tipi di Trigger

| Tipo | Esempio | Azione |
|:---|:---|:---|
| **Soglia statica** | Churn rate > 5% | Alert al team |
| **Anomalia** | Revenue -30% vs media 7gg | Investigazione immediata |
| **Trend** | 3 giorni consecutivi in calo | Review settimanale |
| **Evento** | Nuovo utente completa onboarding | Welcome email |
| **Segmento** | High-value user inattivo da 14gg | Win-back campaign |

## 3. Implementazione con SQL + Alerting

```sql
-- Alert: metriche fuori soglia
WITH daily_metrics AS (
    SELECT
        CURRENT_DATE - 1 AS date,
        COUNT(DISTINCT user_id) AS dau,
        SUM(revenue) AS revenue,
        COUNT(DISTINCT CASE WHEN is_new THEN user_id END) AS new_users
    FROM events WHERE event_date = CURRENT_DATE - 1
),
baselines AS (
    SELECT
        AVG(dau) AS avg_dau,
        STDDEV(dau) AS std_dau,
        AVG(revenue) AS avg_revenue,
        STDDEV(revenue) AS std_revenue
    FROM daily_metrics_history
    WHERE date >= CURRENT_DATE - 30
)
SELECT
    CASE WHEN d.dau < b.avg_dau - 2*b.std_dau THEN '🔴 DAU anomaly'
         WHEN d.revenue < b.avg_revenue - 2*b.std_revenue THEN '🔴 Revenue anomaly'
         WHEN d.new_users = 0 THEN '🔴 Zero new users'
         ELSE '🟢 All normal'
    END AS alert_status,
    d.*, b.avg_dau, b.avg_revenue
FROM daily_metrics d, baselines b;
```

## 4. Sistema di Trigger in Python

```python
from dataclasses import dataclass
from typing import Callable

@dataclass
class Trigger:
    name: str
    metric: str
    condition: Callable
    action: str
    severity: str  # info, warning, critical
    
triggers = [
    Trigger("High Churn", "churn_rate", lambda x: x > 0.05, "slack_alert", "critical"),
    Trigger("Revenue Drop", "daily_revenue", lambda x: x < 5000, "email_team", "warning"),
    Trigger("Conversion Spike", "conversion_rate", lambda x: x > 0.08, "log_insight", "info"),
    Trigger("Cart Abandonment", "cart_abandon_rate", lambda x: x > 0.75, "slack_alert", "warning"),
]

def check_triggers(metrics: dict, triggers: list[Trigger]) -> list[dict]:
    """Controlla tutti i trigger e restituisce quelli attivati."""
    fired = []
    for t in triggers:
        value = metrics.get(t.metric)
        if value and t.condition(value):
            fired.append({
                "trigger": t.name,
                "metric": t.metric,
                "value": value,
                "severity": t.severity,
                "action": t.action
            })
    return fired
```

## 5. User-Level Triggers per Marketing Automation

```python
user_triggers = {
    "welcome_series": {
        "event": "signup_completed",
        "delay": "0 hours",
        "action": "start_email_sequence('welcome')"
    },
    "activation_nudge": {
        "event": "signup_completed AND NOT onboarding_done",
        "delay": "48 hours",
        "action": "send_push('Completa il setup!')"
    },
    "winback": {
        "event": "last_active > 14 days AND ltv > 100",
        "delay": "0 hours", 
        "action": "start_email_sequence('winback_vip')"
    },
    "churn_risk": {
        "event": "usage_decline > 50% week_over_week",
        "delay": "24 hours",
        "action": "notify_csm() AND send_survey()"
    }
}
```

## Risorse
- **Tool:** Metabase Alerts, Grafana Alerting, PagerDuty
- **Pattern:** Event-driven architecture per trigger real-time
''')

rewrite('marketing-data-science/user-centricity.mdx', r'''
# User-Centricity: Mettere l'Utente al Centro

> **Obiettivo:** Costruire una cultura e un sistema di metriche centrato sull'utente, non sul prodotto o sul revenue.

## 1. Il Mindset User-Centric

La differenza tra aziende che crescono e aziende che stagnano spesso si riduce a una domanda: **misuri il successo dal punto di vista dell'azienda o dell'utente?**

| Company-Centric 🚫 | User-Centric ✅ |
|:---|:---|
| "Quanti utenti abbiamo?" | "Quanti utenti ottengono valore?" |
| "Quanto revenue generiamo?" | "Quanto valore generiamo per utente?" |
| "Quante feature abbiamo rilasciato?" | "Quante feature vengono effettivamente usate?" |
| "Qual è il nostro NPS?" | "Quali problemi degli utenti stiamo risolvendo?" |

## 2. Il Framework HEART (Google)

```mermaid
graph TD
    H["❤️ Happiness<br>Soddisfazione, NPS, CSAT"] 
    E["⚡ Engagement<br>Frequenza, intensità d'uso"]
    A["📈 Adoption<br>Nuovi utenti, feature adoption"]
    R["🔄 Retention<br>Ritorno, churn"]
    T["⏱️ Task Success<br>Completion rate, tempo"]
```

| Dimensione | Metrica | Come Misurarla |
|:---|:---|:---|
| **Happiness** | CSAT, NPS, SUS score | Survey in-app |
| **Engagement** | DAU/MAU, session duration | Event tracking |
| **Adoption** | New user activation, feature adoption | Funnel analysis |
| **Retention** | D1/D7/D30, cohort retention | Cohort analysis |
| **Task Success** | Completion rate, error rate | Task tracking |

## 3. Jobs to be Done + Metriche

```python
# Mappare i Job degli utenti alle metriche
user_jobs = {
    "Organizzare il lavoro": {
        "success_metric": "projects_with_deadlines_met_pct",
        "target": "> 80%",
        "leading_indicator": "task_created_within_1h_of_signup",
        "survey_question": "Quanto ti senti organizzato? (1-10)"
    },
    "Collaborare col team": {
        "success_metric": "team_members_active_pct",
        "target": "> 60%",
        "leading_indicator": "first_team_invite_sent",
        "survey_question": "Il tuo team usa lo strumento quotidianamente? (Y/N)"
    }
}
```

## 4. Customer Health Score

```python
def customer_health_score(user: dict) -> dict:
    """Calcola un punteggio di salute 0-100 per ogni utente."""
    weights = {
        'login_frequency': 0.25,      # Quante volte accede
        'feature_adoption': 0.25,     # Quante feature usa
        'support_tickets': 0.15,      # Meno = meglio
        'nps_score': 0.15,            # Soddisfazione dichiarata
        'contract_value_trend': 0.20  # Crescita del valore
    }
    
    scores = {
        'login_frequency': min(user['logins_last_30d'] / 20 * 100, 100),
        'feature_adoption': user['features_used'] / user['features_available'] * 100,
        'support_tickets': max(0, 100 - user['tickets_last_30d'] * 20),
        'nps_score': (user.get('nps', 5) + 100) / 200 * 100,  # Normalize -100/+100 to 0-100
        'contract_value_trend': 50 + user.get('mrr_growth_pct', 0)
    }
    
    health = sum(scores[k] * weights[k] for k in weights)
    
    return {
        "score": round(health, 1),
        "status": "🟢 Healthy" if health >= 70 else "🟡 At Risk" if health >= 40 else "🔴 Critical",
        "components": {k: round(v, 1) for k, v in scores.items()},
        "action": _recommend_action(health, scores)
    }
```

## 5. Voice of Customer (VoC) Pipeline

```sql
-- Aggregare i segnali utente da più fonti
SELECT user_id,
    MAX(nps_score) AS latest_nps,
    COUNT(DISTINCT CASE WHEN source = 'support' THEN ticket_id END) AS support_tickets,
    COUNT(DISTINCT CASE WHEN source = 'survey' AND sentiment = 'negative' THEN response_id END) AS negative_surveys,
    MAX(CASE WHEN source = 'churn_survey' THEN reason END) AS churn_reason
FROM user_feedback
WHERE created_at >= CURRENT_DATE - INTERVAL 90 DAY
GROUP BY user_id;
```

## Risorse
- **Framework:** Google HEART, Jobs to be Done
- **Libro:** *Inspired* — Marty Cagan
- **Tool:** Productboard, Amplitude per user analytics
''')

rewrite('marketing-data-science/caso-studio.mdx', r'''
# Caso Studio — Marketing Data Science

> **Scenario:** Un SaaS B2B (€5M ARR, 2.000 clienti) vuole ridurre il churn del 20% usando data science.

## 1. Il Problema

| Metrica | Valore Attuale | Target |
|:---|:---:|:---:|
| Monthly Churn | 4.2% | 3.4% (-20%) |
| NRR | 95% | 105% |
| LTV | €8.500 | €10.600 |

## 2. La Soluzione: Churn Prediction Model

```python
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Feature engineering
features = [
    'login_frequency_30d', 'feature_adoption_pct', 'support_tickets_30d',
    'nps_score', 'contract_age_months', 'mrr', 'seats_used_pct',
    'api_calls_30d', 'days_since_last_login'
]

X = df[features]
y = df['churned_next_90d']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = GradientBoostingClassifier(n_estimators=200, max_depth=5, random_state=42)
model.fit(X_train, y_train)
print(classification_report(y_test, model.predict(X_test)))
```

## 3. Feature Importance

| Feature | Importanza | Insight |
|:---|:---:|:---|
| days_since_last_login | 0.28 | Il segnale più forte di churn |
| feature_adoption_pct | 0.22 | Chi usa <30% delle feature churna 3x |
| support_tickets_30d | 0.15 | >3 ticket/mese = rischio alto |
| seats_used_pct | 0.12 | Team che non adotta = cancellazione |

## 4. Risultati dopo 6 Mesi

| Metrica | Prima | Dopo | Δ |
|:---|:---:|:---:|:---:|
| Monthly Churn | 4.2% | 3.1% | **-26%** |
| Clienti salvati | — | 47 | — |
| Revenue preservato | — | €400K ARR | — |
| NRR | 95% | 108% | +13pp |

## Lezioni
1. **Il login frequency è il segnale #1** — se non accedono, stanno per andarsene
2. **L'intervento umano batte l'email** — il CSM che chiama ha 3x impact vs email automatica
3. **Prevenire > curare** — intervenire a -30 giorni dal rinnovo è troppo tardi
''')

rewrite('marketing-data-science/cheat-sheet.mdx', r'''
# Cheat Sheet — Marketing Data Science

## Formule Chiave

| Metrica | Formula |
|:---|:---|
| **LTV** | ARPU × (1 / Churn Rate) |
| **CAC** | (Ads + Content + Salary) / New Customers |
| **ROAS** | Revenue from Ads / Ad Spend |
| **K-Factor** | Inviti per utente × Conversion Rate |
| **Quick Ratio** | (New + Resurrected) / Churned |
| **Net Sentiment** | (Positive - Negative) / Total × 100 |

## AARRR Funnel

```
Acquisition → Activation → Retention → Revenue → Referral
```

## Segmentazione RFM

| Score | Recency | Frequency | Monetary |
|:---:|:---|:---|:---|
| 5 | Ultimo acquisto recente | Compra spesso | Spende molto |
| 1 | Non compra da mesi | Compra raramente | Spende poco |

## Attribution Models

| Modello | Primo Touch | Medio | Ultimo Touch |
|:---|:---:|:---:|:---:|
| First Click | 100% | 0% | 0% |
| Last Click | 0% | 0% | 100% |
| Lineare | 33% | 33% | 33% |
| Position-Based | 40% | 20% | 40% |

## Benchmark Churn

| Tipo | Churn Mensile | Note |
|:---|:---:|:---|
| SaaS B2B | 1-2% | Logo churn |
| SaaS B2C | 3-7% | Consumer apps |
| E-commerce | 20-30% | Annual repeat rate 70-80% |

## Checklist A/B Test

- [ ] Ipotesi scritta con formato "Se...allora...perché"
- [ ] Metrica primaria (OEC) definita
- [ ] Sample size calcolato
- [ ] Durata minima 1-2 settimane
- [ ] Nessun peeking durante il test
- [ ] SRM check al lancio
- [ ] Decisione documentata

## Quick Reference Python

```python
# Cohort retention
df.groupby(['cohort','period'])['user_id'].nunique()

# RFM
df.groupby('customer_id').agg(recency=..., frequency=..., monetary=...)

# A/B test significance
from scipy.stats import proportions_ztest
z, p = proportions_ztest([conv_a, conv_b], [n_a, n_b])
```
''')

print(f"\n=== Batch 4 completato (8 file) ===")
