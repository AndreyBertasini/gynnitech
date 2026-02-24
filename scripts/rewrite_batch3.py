#!/usr/bin/env python3
import os, re, glob

BASE = os.path.join(os.path.dirname(__file__), '..', 'src', 'content', 'corso')

def get_frontmatter(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    return match.group(0) if match else '---\n---'

# Content templates per file - dizionario slug -> contenuto corpo
lessons = {}

lessons['marketing-data-science/attribution.mdx'] = '''
# Attribution Modeling nel Marketing Digitale

> **Obiettivo:** Capire come assegnare il credito delle conversioni ai diversi touchpoint del customer journey.

## 1. Il Problema dell'Attribuzione

Un utente vede un ad su Instagram, clicca una email, poi cerca su Google e compra. **Chi riceve il merito?**

```mermaid
graph LR
    A["📱 Instagram Ad"] --> B["📧 Email"] --> C["🔍 Google Search"] --> D["💳 Acquisto"]
```

## 2. Modelli di Attribuzione

| Modello | Come Funziona | Pro | Contro |
|:---|:---|:---|:---|
| **Last Click** | 100% all'ultimo touchpoint | Semplice | Ignora awareness |
| **First Click** | 100% al primo touchpoint | Valorizza discovery | Ignora nurturing |
| **Lineare** | Credito uguale a tutti | Equo | Non distingue importanza |
| **Time Decay** | Più credito ai recenti | Realistico | Penalizza awareness |
| **Position-Based** | 40% primo, 40% ultimo, 20% centro | Bilanciato | Arbitrario |
| **Data-Driven** | ML calcola il contributo reale | Preciso | Richiede molti dati |

## 3. Implementazione con SQL

```sql
-- Modello Position-Based (U-shaped)
WITH touchpoints AS (
    SELECT user_id, channel, touch_time,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY touch_time) AS touch_order,
        COUNT(*) OVER (PARTITION BY user_id) AS total_touches
    FROM marketing_touches
    WHERE user_id IN (SELECT user_id FROM conversions)
),
attributed AS (
    SELECT *, CASE
        WHEN touch_order = 1 THEN 0.40
        WHEN touch_order = total_touches THEN 0.40
        ELSE 0.20 / NULLIF(total_touches - 2, 0)
    END AS credit
    FROM touchpoints
)
SELECT channel,
    ROUND(SUM(credit), 1) AS attributed_conversions,
    ROUND(SUM(credit * revenue), 2) AS attributed_revenue
FROM attributed a JOIN conversions c ON a.user_id = c.user_id
GROUP BY channel ORDER BY attributed_revenue DESC;
```

## 4. Data-Driven Attribution con Python

```python
import numpy as np
from sklearn.linear_model import LogisticRegression

def markov_attribution(journeys: list[list[str]], conversions: list[bool]):
    """Attribuzione basata su catene di Markov."""
    transitions = {}
    for journey, converted in zip(journeys, conversions):
        path = ['Start'] + journey + ['Conversion' if converted else 'Null']
        for i in range(len(path) - 1):
            key = (path[i], path[i+1])
            transitions[key] = transitions.get(key, 0) + 1
    
    # Calcola probabilità di transizione
    states = set(s for pair in transitions for s in pair)
    total_from = {}
    for (src, dst), count in transitions.items():
        total_from[src] = total_from.get(src, 0) + count
    
    transition_probs = {k: v / total_from[k[0]] for k, v in transitions.items()}
    
    # Removal effect per canale
    channels = [s for s in states if s not in ('Start', 'Conversion', 'Null')]
    attribution = {}
    base_conv_rate = _simulate_conversion(transition_probs, channels)
    
    for channel in channels:
        modified = {k: v for k, v in transition_probs.items() if channel not in k}
        new_rate = _simulate_conversion(modified, [c for c in channels if c != channel])
        attribution[channel] = max(0, base_conv_rate - new_rate)
    
    return attribution
```

## 5. UTM e Tracking per l'Attribuzione

```javascript
// Struttura UTM standard per tracking completo
const utm_standard = {
    utm_source: "google",      // Da dove viene il traffico
    utm_medium: "cpc",         // Tipo di canale (cpc, organic, email, social)
    utm_campaign: "spring_sale_2026",  // Nome campagna
    utm_term: "scarpe+running",       // Keyword (per search ads)
    utm_content: "banner_blue_v2"     // Variante creativa
};
```

## 6. Errori Comuni

| Errore | Soluzione |
|:---|:---|
| Affidarsi solo al Last Click | Confronta almeno 3 modelli |
| Ignorare touchpoint offline | Integra CRM e call tracking |
| Non considerare il tempo | Usa finestre di attribuzione (7/14/30 giorni) |
| Duplicare le conversioni | De-duplica per user_id + timestamp |

## Risorse
- **Tool:** Google Analytics 4 Data-Driven Attribution
- **Libro:** *Attribution Theory* — Wayne DeSarbo
- **Framework:** Markov Chain Attribution (open source)
'''

lessons['marketing-data-science/brand.mdx'] = '''
# Brand Health: Misurare la Salute del Marchio

> **Obiettivo:** Definire e tracciare le metriche chiave per valutare la percezione, il valore e la forza di un brand nel tempo.

## 1. Perché Misurare il Brand

Il brand è l'asset più prezioso ma più difficile da misurare. A differenza delle metriche di performance (CTR, CPA), le metriche di brand misurano il **valore percepito** nel lungo termine.

## 2. Le Metriche di Brand Health

| Metrica | Cosa Misura | Come Raccoglierla |
|:---|:---|:---|
| **Brand Awareness** | % pubblico che riconosce il brand | Survey, Google Trends |
| **Brand Recall** | % che lo nomina spontaneamente | Survey unaided |
| **Brand Sentiment** | Positivo/Negativo/Neutro | NLP su social e recensioni |
| **Brand Equity** | Valore economico del brand | Modelli finanziari |
| **Share of Voice** | % menzioni vs competitor | Social listening |

```python
# Analisi del Brand Sentiment con NLP
from collections import Counter

def analyze_brand_sentiment(mentions: list[dict]) -> dict:
    """Analizza il sentiment delle menzioni del brand."""
    sentiments = Counter(m['sentiment'] for m in mentions)
    total = len(mentions)
    return {
        "positive_pct": round(sentiments['positive'] / total * 100, 1),
        "negative_pct": round(sentiments['negative'] / total * 100, 1),
        "neutral_pct": round(sentiments['neutral'] / total * 100, 1),
        "net_sentiment": round(
            (sentiments['positive'] - sentiments['negative']) / total * 100, 1
        ),
        "total_mentions": total,
        "top_positive_topics": _extract_topics(mentions, 'positive'),
        "top_negative_topics": _extract_topics(mentions, 'negative')
    }
```

## 3. Brand Tracking Dashboard

```sql
-- Brand health score settimanale
SELECT
    DATE_TRUNC('week', mention_date) AS week,
    COUNT(*) AS total_mentions,
    ROUND(AVG(CASE WHEN sentiment = 'positive' THEN 1
                    WHEN sentiment = 'negative' THEN -1 ELSE 0 END), 3) AS avg_sentiment,
    COUNT(DISTINCT source) AS channels_present,
    SUM(CASE WHEN is_competitor_comparison THEN 1 ELSE 0 END) AS competitive_mentions
FROM brand_mentions
WHERE brand = 'our_brand'
GROUP BY 1 ORDER BY 1 DESC;
```

## 4. Brand Funnel

```mermaid
graph TD
    A["👀 Awareness<br>Conoscenza del brand"] --> B["🤔 Consideration<br>Lo valutano come opzione"]
    B --> C["❤️ Preference<br>Lo preferiscono ai competitor"]
    C --> D["💳 Purchase<br>Comprano"]
    D --> E["📣 Advocacy<br>Lo raccomandano"]
```

| Stage | KPI | Benchmark |
|:---|:---|:---|
| Awareness | Aided recall | >60% nel target |
| Consideration | Consideration set inclusion | >30% |
| Preference | First choice rate | >15% |
| Purchase | Conversion rate | Varia per settore |
| Advocacy | NPS, referral rate | NPS >50 |

## 5. Share of Search come Proxy di Brand Health

```python
# Google Trends come proxy gratuito di brand awareness
import pandas as pd

def share_of_search(brands: dict[str, list[int]]) -> pd.DataFrame:
    """Calcola Share of Search dai dati Google Trends."""
    df = pd.DataFrame(brands)
    df['total'] = df.sum(axis=1)
    for brand in brands:
        df[f'{brand}_share'] = (df[brand] / df['total'] * 100).round(1)
    return df

# Esempio
data = {
    'Nike': [85, 88, 92, 90, 87],
    'Adidas': [65, 70, 68, 72, 69],
    'Puma': [30, 28, 35, 32, 31]
}
result = share_of_search(data)
```

## Risorse
- **Tool:** Brandwatch, Meltwater per social listening
- **Framework:** Keller Brand Equity Model
- **Libro:** *Building Strong Brands* — David Aaker
'''

lessons['marketing-data-science/cluster-analysis.mdx'] = '''
# Cluster Analysis per la Segmentazione Clienti

> **Obiettivo:** Usare algoritmi di clustering per segmentare la base clienti e personalizzare le strategie di marketing.

## 1. Perché Segmentare

Trattare tutti i clienti allo stesso modo = sprecare budget. La segmentazione permette di:
- Personalizzare messaggi e offerte
- Allocare il budget sui segmenti più profittevoli
- Identificare clienti a rischio churn

## 2. RFM Analysis: Il Punto di Partenza

```python
import pandas as pd
import numpy as np

def rfm_analysis(orders: pd.DataFrame, today: str = '2026-02-24') -> pd.DataFrame:
    """Calcola Recency, Frequency, Monetary per ogni cliente."""
    today = pd.to_datetime(today)
    
    rfm = orders.groupby('customer_id').agg(
        recency=('order_date', lambda x: (today - x.max()).days),
        frequency=('order_id', 'nunique'),
        monetary=('revenue', 'sum')
    ).reset_index()
    
    # Score 1-5 per ogni dimensione
    for col in ['frequency', 'monetary']:
        rfm[f'{col}_score'] = pd.qcut(rfm[col], 5, labels=[1,2,3,4,5])
    rfm['recency_score'] = pd.qcut(rfm['recency'], 5, labels=[5,4,3,2,1])
    
    rfm['rfm_segment'] = (rfm['recency_score'].astype(str) + 
                          rfm['frequency_score'].astype(str) + 
                          rfm['monetary_score'].astype(str))
    return rfm

# Mappatura segmenti
SEGMENTS = {
    '555': '🏆 Champions',
    '554': '🏆 Champions', 
    '544': '💎 Loyal',
    '545': '💎 Loyal',
    '155': '💤 Can\\'t Lose',
    '145': '💤 Can\\'t Lose',
    '511': '🆕 New Customers',
    '111': '☠️ Lost',
    '311': '😴 Hibernating'
}
```

## 3. K-Means Clustering

```python
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt

def customer_clustering(rfm_df: pd.DataFrame, n_clusters: int = 4):
    """Segmenta i clienti con K-Means."""
    features = rfm_df[['recency', 'frequency', 'monetary']]
    scaler = StandardScaler()
    X = scaler.fit_transform(features)
    
    # Elbow method per trovare il K ottimale
    inertias = []
    for k in range(2, 10):
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        km.fit(X)
        inertias.append(km.inertia_)
    
    # Fit finale
    model = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    rfm_df['cluster'] = model.fit_predict(X)
    
    # Profilo dei cluster
    profile = rfm_df.groupby('cluster').agg(
        n_customers=('customer_id', 'count'),
        avg_recency=('recency', 'mean'),
        avg_frequency=('frequency', 'mean'),
        avg_monetary=('monetary', 'mean')
    ).round(1)
    
    return rfm_df, profile
```

## 4. Azioni per Segmento

| Segmento | Strategia | Canale | Offerta |
|:---|:---|:---|:---|
| 🏆 Champions | Loyalty program, early access | Email personale | Esclusività |
| 💎 Loyal | Cross-sell, upsell | Email + Push | Bundle sconto |
| 🆕 New | Onboarding, welcome series | Email drip | Sconto 2° acquisto |
| 😴 Hibernating | Win-back campaign | Email + Retargeting | Sconto aggressivo |
| ☠️ Lost | Sunset o re-engagement | Email finale | Last chance offer |

```sql
-- Query per il marketing automation basato su cluster
SELECT c.cluster, c.customer_id, c.email,
    CASE c.cluster
        WHEN 0 THEN 'loyalty_program'
        WHEN 1 THEN 'winback_campaign'
        WHEN 2 THEN 'upsell_sequence'
        WHEN 3 THEN 'welcome_series'
    END AS campaign_to_trigger
FROM customer_clusters c
WHERE c.last_campaign_date < CURRENT_DATE - INTERVAL 14 DAY
   OR c.last_campaign_date IS NULL;
```

## Risorse
- **Libro:** *Data Science for Marketing Analytics* — Mirza, Nayak
- **Tool:** Scikit-learn clustering module
- **Framework:** RFM + K-Means pipeline
'''

lessons['marketing-data-science/experimentation.mdx'] = '''
# Experimentation: La Scienza degli Esperimenti

> **Obiettivo:** Padroneggiare il design sperimentale per prendere decisioni basate su evidenze statistiche.

## 1. Perché Sperimentare

Le opinioni sono gratuite, i dati costano, ma gli **esperimenti** generano conoscenza causale. Senza sperimentazione puoi dire "X e Y sono correlati", ma non "X causa Y".

## 2. Anatomia di un Esperimento

```mermaid
graph LR
    A["1️⃣ Ipotesi"] --> B["2️⃣ Design"]
    B --> C["3️⃣ Sample Size"]
    C --> D["4️⃣ Esecuzione"]
    D --> E["5️⃣ Analisi"]
    E --> F["6️⃣ Decisione"]
```

| Fase | Domanda Chiave | Output |
|:---|:---|:---|
| Ipotesi | Cosa ci aspettiamo? | H0 e H1 formulate |
| Design | Come lo testiamo? | Gruppi, metriche, durata |
| Sample Size | Quanti utenti servono? | N per gruppo |
| Esecuzione | Il test è pulito? | Monitoraggio SRM |
| Analisi | Il risultato è significativo? | p-value, CI, effect size |
| Decisione | Cosa facciamo? | Ship, iterate, kill |

## 3. Calcolo del Sample Size

```python
from scipy import stats
import math

def sample_size_calculator(
    baseline_rate: float,    # es. 0.05 (5% conversion)
    mde: float,              # es. 0.10 (10% relative lift)
    alpha: float = 0.05,
    power: float = 0.80
) -> int:
    """Calcola il sample size necessario per un A/B test."""
    p1 = baseline_rate
    p2 = baseline_rate * (1 + mde)
    
    z_alpha = stats.norm.ppf(1 - alpha / 2)
    z_beta = stats.norm.ppf(power)
    
    p_avg = (p1 + p2) / 2
    n = ((z_alpha * math.sqrt(2 * p_avg * (1 - p_avg)) + 
          z_beta * math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2) / (p2 - p1) ** 2
    
    return math.ceil(n)

# Esempio: conversion rate 5%, voglio rilevare un lift del 10%
n = sample_size_calculator(0.05, 0.10)
print(f"Servono {n:,} utenti per gruppo")  # ~31,000
```

## 4. Analisi dei Risultati

```python
def analyze_ab_test(control: dict, treatment: dict) -> dict:
    """Analizza i risultati di un A/B test."""
    c_rate = control['conversions'] / control['visitors']
    t_rate = treatment['conversions'] / treatment['visitors']
    
    # Z-test per proporzioni
    p_pool = (control['conversions'] + treatment['conversions']) / \
             (control['visitors'] + treatment['visitors'])
    se = math.sqrt(p_pool * (1-p_pool) * (1/control['visitors'] + 1/treatment['visitors']))
    z = (t_rate - c_rate) / se
    p_value = 2 * (1 - stats.norm.cdf(abs(z)))
    
    # Confidence interval
    se_diff = math.sqrt(c_rate*(1-c_rate)/control['visitors'] + t_rate*(1-t_rate)/treatment['visitors'])
    ci_95 = (t_rate - c_rate - 1.96*se_diff, t_rate - c_rate + 1.96*se_diff)
    
    return {
        "control_rate": f"{c_rate:.4f}",
        "treatment_rate": f"{t_rate:.4f}",
        "relative_lift": f"{(t_rate/c_rate - 1)*100:.1f}%",
        "p_value": f"{p_value:.4f}",
        "significant": p_value < 0.05,
        "confidence_interval": f"[{ci_95[0]*100:.2f}%, {ci_95[1]*100:.2f}%]",
        "recommendation": "✅ Ship" if p_value < 0.05 and t_rate > c_rate else "❌ Do not ship"
    }
```

## 5. Errori da Evitare

| Errore | Perché è Grave | Soluzione |
|:---|:---|:---|
| **Peeking** | Gonfia falsi positivi al 30% | Pre-definisci la durata, non guardare prima |
| **SRM** (Sample Ratio Mismatch) | Split non è 50/50 = bug | Monitora il ratio giornalmente |
| **Troppe metriche** | Più test = più falsi positivi | 1 metrica primaria (OEC) |
| **Test troppo brevi** | Non catturi cicli settimanali | Min 1-2 settimane complete |
| **Bias di selezione** | Gruppi non comparabili | Randomizzazione corretta |

## Risorse
- **Libro:** *Trustworthy Online Controlled Experiments* — Kohavi, Tang, Xu
- **Tool:** Statsig, Optimizely, GrowthBook (open source)
'''

lessons['marketing-data-science/embeddings.mdx'] = '''
# Embeddings per il Marketing

> **Obiettivo:** Capire come usare gli embedding vettoriali per personalizzazione, raccomandazioni e analisi semantica nel marketing.

## 1. Cosa Sono gli Embeddings

Un **embedding** è una rappresentazione numerica (vettore) di un oggetto (testo, prodotto, utente) in uno spazio multidimensionale dove la **distanza** tra vettori riflette la **similarità** semantica.

```python
# Esempio concettuale
embedding_scarpa_running = [0.8, 0.2, 0.9, 0.1, 0.7]  # sportivo, casual, outdoor
embedding_scarpa_elegante = [0.1, 0.9, 0.2, 0.8, 0.1]  # formale, indoor, lusso
# La distanza tra i due vettori è alta = sono prodotti diversi
```

## 2. Applicazioni nel Marketing

| Use Case | Input | Output |
|:---|:---|:---|
| **Raccomandazioni** | Prodotti visti dall'utente | Prodotti simili da suggerire |
| **Segmentazione** | Comportamento utente | Cluster semantici |
| **Ricerca semantica** | Query in linguaggio naturale | Contenuti/prodotti rilevanti |
| **Anomaly detection** | Pattern di acquisto | Comportamenti fraudolenti |

## 3. Product Embeddings con Word2Vec

```python
from gensim.models import Word2Vec

def train_product_embeddings(purchase_sequences: list[list[str]], dim: int = 64):
    """Addestra embeddings sui prodotti usando le sequenze di acquisto come 'frasi'."""
    model = Word2Vec(
        sentences=purchase_sequences,
        vector_size=dim,
        window=5,
        min_count=3,
        workers=4,
        epochs=20
    )
    return model

# Esempio: sequenze di acquisto dei clienti
sequences = [
    ['scarpa_A', 'calzino_B', 'spray_C'],
    ['scarpa_A', 'soletta_D', 'lacci_E'],
    ['borsa_F', 'portafoglio_G', 'cintura_H'],
]

model = train_product_embeddings(sequences)
similar = model.wv.most_similar('scarpa_A', topn=5)
# Output: [('soletta_D', 0.89), ('calzino_B', 0.85), ...]
```

## 4. Customer Embeddings per Personalizzazione

```python
import numpy as np

def customer_embedding(user_purchases: list[str], product_model) -> np.ndarray:
    """Crea un embedding utente come media pesata dei prodotti acquistati."""
    vectors = []
    for product in user_purchases:
        if product in product_model.wv:
            vectors.append(product_model.wv[product])
    if vectors:
        return np.mean(vectors, axis=0)
    return np.zeros(product_model.vector_size)

def recommend(user_embedding, product_model, n=5):
    """Raccomanda prodotti simili al profilo dell'utente."""
    return product_model.wv.similar_by_vector(user_embedding, topn=n)
```

## 5. Embedding per Contenuti Marketing

```python
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer('all-MiniLM-L6-v2')

# Embedding di contenuti marketing
contents = [
    "Come scegliere le scarpe da running perfette",
    "Guida alla corsa per principianti",
    "Le migliori borse in pelle italiana",
    "Allenamento maratona: programma 12 settimane"
]

embeddings = model.encode(contents)
sim_matrix = cosine_similarity(embeddings)
# contents[0] e contents[1] avranno alta similarità
# contents[0] e contents[2] avranno bassa similarità
```

## Risorse
- **Libreria:** Gensim (Word2Vec), Sentence-Transformers
- **Database vettoriale:** Pinecone, Weaviate, Qdrant
- **Paper:** "Prod2Vec" — Grbovic et al. (2015)
'''

# Scrivi i file
for rel_path, body in lessons.items():
    filepath = os.path.join(BASE, rel_path)
    with open(filepath, 'r', encoding='utf-8') as f:
        old = f.read()
    fm = re.match(r'^---\n(.*?)\n---', old, re.DOTALL)
    frontmatter = fm.group(0) if fm else '---\n---'
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(frontmatter + '\n' + body.strip() + '\n')
    print(f"✅ {rel_path}")

print(f"\n=== Batch 3: {len(lessons)} file riscritti ===")
