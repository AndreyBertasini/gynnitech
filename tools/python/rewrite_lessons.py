#!/usr/bin/env python3
"""Riscrive tutte le lezioni placeholder con contenuto reale e dettagliato."""
import os, re

BASE = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'content', 'corso')

def write_lesson(rel_path, content):
    path = os.path.join(BASE, rel_path)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Riscritto: {rel_path}")

# ============================================================
# 1. data-collection/jtbd.mdx (CRITICO)
# ============================================================
write_lesson('data-collection/jtbd.mdx', r'''---
title: Il Framework Jobs to Be Done (JTBD)
description: Comprendere le vere motivazioni dei consumatori e applicare il metodo JTBD alla data collection.
module: "Modulo 2: Data Collection & Tracking"
date: '2026-02-09T00:00:00.000+00:00'
author: GynniTech Team
---

# Il Framework Jobs to Be Done (JTBD)

> **Obiettivo:** Capire *perché* i clienti scelgono un prodotto e come tradurre queste motivazioni in eventi tracciabili per costruire analytics significativi.

## 1. Il Concetto Fondamentale

Il framework JTBD, sviluppato da **Clayton Christensen** alla Harvard Business School, ribalta la prospettiva tradizionale del marketing:

> **Le persone non comprano prodotti; li "assumono" per svolgere un lavoro specifico nella loro vita.**

Quando un utente acquista un trapano, non vuole un trapano. Vuole un buco nel muro. O meglio: vuole appendere quel quadro per sentirsi finalmente "a casa".

### Perché è fondamentale per la Data Collection

La differenza tra **tracciare tutto** e **tracciare ciò che conta** sta proprio qui. Il JTBD ci dice *quali* eventi misurare:

```javascript
// ❌ Tracciamento generico - troppo rumore
analytics.track('button_clicked', { button_id: 'btn-123' });

// ✅ Tracciamento JTBD - cattura l'intento
analytics.track('job_completed', {
  job: 'organize_workspace',
  trigger: 'first_project_created',
  outcome: 'success',
  time_to_complete_seconds: 45
});
```

## 2. La Leggenda del Milkshake

Per capire il JTBD in azione, il caso più celebre è quello del **milkshake di McDonald's**.

Una catena di fast food voleva vendere più milkshake. Provarono di tutto: nuovi gusti, prezzi bassi, pubblicità. **Risultato: zero.**

Christensen scoprì che il 40% dei milkshake veniva venduto alle **8:00 del mattino** a pendolari solitari.

| Domanda JTBD | Risposta |
|:---|:---|
| **Chi** lo compra? | Pendolari solitari in auto |
| **Quando?** | Mattina presto, prima del lavoro |
| **Quale "lavoro" fa?** | Sconfiggere la noia di 30 minuti in auto |
| **Quali alternative?** | Banana (finisce troppo presto), bagel (briciole), caffè (troppo caldo) |
| **Perché il milkshake vince?** | Dura 20 min, tiene impegnata una mano, sazia fino a pranzo |

### Traduzione in eventi tracciabili

```javascript
// Piano di tracking ispirato al JTBD
const jtbd_tracking_plan = {
  job: 'reduce_commute_boredom',
  functional_events: [
    'product_purchased',        // Ha comprato
    'consumption_duration',     // Quanto è durato
    'satisfaction_rating'       // Soddisfazione post-consumo
  ],
  emotional_events: [
    'mood_before_purchase',     // Come si sentiva prima
    'mood_after_consumption'    // Come si sente dopo
  ],
  context_events: [
    'time_of_day',              // Mattina/pomeriggio/sera
    'location_type',            // Drive-through vs in-store
    'is_alone'                  // Solo o in compagnia
  ]
};
```

## 3. I Tre Tipi di Job

Ogni decisione di acquisto coinvolge tre dimensioni:

| Tipo di Job | Definizione | Esempio (App di fitness) | Evento da tracciare |
|:---|:---|:---|:---|
| **Funzionale** | Il compito pratico da svolgere | Seguire un programma di allenamento | `workout_completed` |
| **Emotivo** | Come vuole sentirsi il cliente | Sentirsi in controllo della propria salute | `streak_milestone_reached` |
| **Sociale** | Come vuole essere percepito | Essere visto come persona atletica | `workout_shared_social` |

```python
# Modello dati per tracciare i 3 tipi di job
job_schema = {
    "event": "job_progress",
    "properties": {
        "job_type": "functional | emotional | social",
        "job_id": "string",           # es. "get_fit", "feel_confident"
        "progress_pct": "float",      # 0.0 - 1.0
        "satisfaction": "int",        # 1-10
        "context": {
            "time_of_day": "string",
            "device": "string",
            "session_number": "int"
        }
    }
}
```

## 4. Le 4 Forze del Cambiamento

Perché un cliente decide di lasciare il vecchio prodotto per il nuovo? Quattro forze in competizione:

```mermaid
graph TD
    subgraph Forze_verso_il_NUOVO
        PUSH["🔥 Push: Frustrazione con lo status quo"]
        PULL["🧲 Pull: Attrazione verso la nuova soluzione"]
    end
    subgraph Forze_che_BLOCCANO
        ANXIETY["😰 Ansia: Paura del cambiamento"]
        INERTIA["⚓ Inerzia: Comodità dell'abitudine"]
    end
    PUSH --> SWITCH["🔄 Switch"]
    PULL --> SWITCH
    ANXIETY --> STAY["⏸️ Resta"]
    INERTIA --> STAY
```

### Tracciare le 4 Forze

```sql
-- Query: Analisi delle forze di switch per coorte
SELECT
    u.signup_cohort,
    -- PUSH: frustrazione col prodotto precedente
    AVG(CASE WHEN s.question = 'prev_product_frustration' 
        THEN s.score END) AS avg_push_score,
    -- PULL: attrattiva del nuovo prodotto
    AVG(CASE WHEN s.question = 'new_product_appeal' 
        THEN s.score END) AS avg_pull_score,
    -- ANXIETY: paura del cambiamento
    AVG(CASE WHEN s.question = 'switching_anxiety' 
        THEN s.score END) AS avg_anxiety_score,
    -- INERTIA: abitudine
    AVG(CASE WHEN s.question = 'habit_strength' 
        THEN s.score END) AS avg_inertia_score,
    -- Retention a 30 giorni
    COUNT(DISTINCT CASE WHEN a.last_active >= u.signup_date + INTERVAL 30 DAY 
        THEN u.user_id END) * 100.0 / COUNT(DISTINCT u.user_id) AS retention_d30
FROM users u
LEFT JOIN surveys s ON u.user_id = s.user_id
LEFT JOIN activity a ON u.user_id = a.user_id
GROUP BY u.signup_cohort
ORDER BY u.signup_cohort;
```

## 5. Bisogni Stabili, Soluzioni Dinamiche

I bisogni umani non cambiano. Cambia la tecnologia con cui li soddisfiamo:

| Bisogno Stabile | Soluzione 1900 | Soluzione 2000 | Soluzione 2026 |
|:---|:---|:---|:---|
| Comunicare a distanza | Lettera / Telegrafo | Email / SMS | WhatsApp / Videochiamate AI |
| Spostarsi rapidamente | Cavallo / Treno | Auto / Aereo | Ride sharing / Autonome |
| Conservare ricordi | Ritratto dipinto | Fotocamera | Cloud / Social / AI generativa |
| Imparare cose nuove | Biblioteca | DVD/e-learning | LLM / Corsi interattivi |

> **Principio chiave:** Se ti innamori del tuo prodotto (la soluzione), rischi di fallire. Se ti innamori del problema del cliente (il Job), sarai sempre innovativo.

## 6. Le Interviste JTBD: Le 3 Domande d'Oro

Per scoprire i veri "Jobs" dei clienti, servono interviste qualitative strutturate:

### Timeline dell'Intervista

```mermaid
graph LR
    A["📌 Primo Pensiero<br>Quando hai iniziato a cercare?"] 
    --> B["⚡ Evento Trigger<br>Cosa ti ha fatto dire 'basta'?"]
    --> C["🔍 Ricerca<br>Cosa hai valutato?"]
    --> D["💳 Acquisto<br>Cosa ti ha convinto?"]
    --> E["😊 Post-Acquisto<br>Come ti sei sentito dopo?"]
```

### Le 3 Domande d'Oro

1. **Il Contesto:** "Cosa stava succedendo nella tua vita quando hai deciso che ti serviva questo prodotto?"
2. **Il Momento Zero:** "Qual è stato l'evento specifico che ti ha fatto dire 'Basta, mi serve una soluzione'?"
3. **L'Emozione:** "Come ti sei sentito subito dopo l'acquisto? E dopo una settimana?"

### Template di Analisi delle Interviste

```python
import pandas as pd

# Struttura per analizzare le interviste JTBD
interview_template = {
    "interviewee_id": "INT_001",
    "date": "2026-02-20",
    "product": "App di project management",
    
    # Timeline
    "first_thought": "3 mesi prima, quando i progetti iniziarono a sfuggire",
    "trigger_event": "Perso una deadline importante davanti al cliente",
    "alternatives_considered": ["Trello", "Notion", "Foglio Excel"],
    "purchase_moment": "Demo gratuita dopo aver visto un case study",
    "post_purchase_feeling": "Sollievo, sensazione di controllo",
    
    # I 3 Job
    "functional_job": "Tenere traccia di task e deadline",
    "emotional_job": "Sentirsi organizzato e professionale",
    "social_job": "Apparire affidabile davanti ai clienti",
    
    # Le 4 Forze
    "push": "Caos nei progetti, deadline mancate",
    "pull": "UI pulita, automazioni, integrazioni Slack",
    "anxiety": "Curva di apprendimento, migrazione dati",
    "inertia": "Il team era abituato a Excel"
}

# Aggregazione di 20+ interviste per trovare pattern
def analyze_interviews(interviews: list[dict]) -> pd.DataFrame:
    df = pd.DataFrame(interviews)
    
    # Cluster dei Job più frequenti
    jobs = df[['functional_job', 'emotional_job', 'social_job']]
    print("=== JOB PIÙ FREQUENTI ===")
    for col in jobs.columns:
        print(f"\n{col}:")
        print(df[col].value_counts().head(5))
    
    # Pattern nelle 4 forze
    print("\n=== FORZE DOMINANTI ===")
    forces = df[['push', 'pull', 'anxiety', 'inertia']]
    for col in forces.columns:
        print(f"\n{col} - Temi comuni:")
        print(df[col].value_counts().head(3))
    
    return df
```

## 7. Dal JTBD al Tracking Plan

Il valore reale del JTBD per la data collection è la capacità di creare un **tracking plan orientato ai risultati**, non alle azioni:

| Job Identificato | Evento Chiave | Proprietà | Metrica di Successo |
|:---|:---|:---|:---|
| Organizzare il lavoro | `project_created` | n_tasks, template_used | Tempo al primo task completato |
| Sentirsi produttivo | `daily_summary_viewed` | tasks_completed, streak | % utenti che tornano il giorno dopo |
| Collaborare col team | `member_invited` | role, channel | % inviti accettati entro 24h |
| Non perdere deadline | `reminder_set` | urgency, advance_hours | % deadline rispettate |

## 8. Esercizio Pratico

Prenditi un momento per riflettere sul tuo **caffè di stamattina**:

- **Job Funzionale:** Ti serviva caffeina per svegliarti?
- **Job Emotivo:** Era un piccolo premio per iniziare bene la giornata?
- **Job Sociale:** È stata una scusa per fare due chiacchiere con un collega?

> **Riflessione:** Se gestissi un bar e capissi che il "Job" dei tuoi clienti è quello *Sociale*, investiresti di più in tavolini accoglienti o nella qualità estrema dei chicchi? E soprattutto, *come lo misureresti*?

```python
# Esercizio: definisci il tracking plan per il tuo bar
my_bar_tracking = {
    "job_hypothesis": "Il caffè è una scusa per socializzare",
    "events_to_track": [
        {"event": "order_placed", "props": ["is_alone", "group_size", "time_of_day"]},
        {"event": "table_occupied", "props": ["duration_min", "n_people", "zone"]},
        {"event": "loyalty_card_used", "props": ["frequency", "avg_spend"]},
    ],
    "success_metric": "avg_visit_duration_minutes",
    "expected_outcome": "Clienti in gruppo restano 3x più a lungo"
}
```

## Riepilogo

| Concetto | Takeaway |
|:---|:---|
| **JTBD** | Le persone "assumono" prodotti per un lavoro specifico |
| **3 Tipi di Job** | Funzionale, Emotivo, Sociale |
| **4 Forze** | Push + Pull vs Ansia + Inerzia |
| **Per la Data Collection** | Traccia il *progresso verso il Job*, non solo i click |
| **Interviste** | 3 domande d'oro per scoprire i veri bisogni |

## Risorse

- **Libro:** *Competing Against Luck* — Clayton Christensen (2016)
- **Framework:** [JTBD.info](https://jtbd.info) — Risorse e template
- **Tool:** Miro JTBD Canvas per mappare visivamente i Job
''')

# ============================================================
# 2. data-collection/terminology.mdx
# ============================================================
write_lesson('data-collection/terminology.mdx', r'''---
title: "Terminologia: Metriche, KPI e Driver"
description: "Glossario tecnico fondamentale: la differenza tra metriche, KPI e driver, e perché confonderli è il primo errore che le aziende commettono."
module: "Modulo 2: Data Collection & Tracking"
order: 7
prerequisites: ["data-collection/privacy"]
category: "Fondamenti"
---

# Terminologia: Metriche, KPI e Driver

> **Obiettivo:** Padroneggiare la differenza tra metriche, KPI e driver — il vocabolario essenziale per chiunque lavori con i dati.

## 1. Il Problema: Tutti Parlano di "Metriche", Nessuno si Intende

In una sala riunioni tipica accade questo:

- Il **CEO** dice: "La nostra metrica principale è il fatturato"
- Il **VP Marketing** dice: "Il nostro KPI è il costo per acquisizione"
- Il **Product Manager** dice: "Il driver è l'activation rate"
- Il **Data Analyst** pensa: "State confondendo tre concetti diversi..."

Confondere metriche, KPI e driver porta a **decisioni sbagliate**, dashboard inutili e team disallineati. Facciamo chiarezza.

## 2. Le Definizioni

### Metrica

Una **metrica** è qualsiasi valore misurabile che descrive un aspetto del business.

```sql
-- Esempi di metriche
SELECT 
    COUNT(DISTINCT user_id) AS total_users,          -- Metrica
    COUNT(*) AS total_orders,                         -- Metrica
    SUM(revenue) AS total_revenue,                    -- Metrica
    AVG(session_duration) AS avg_session_duration,    -- Metrica
    COUNT(DISTINCT CASE WHEN is_new THEN user_id END) AS new_users  -- Metrica
FROM events
WHERE event_date = CURRENT_DATE;
```

> **Regola:** Ogni KPI è una metrica, ma non ogni metrica è un KPI.

### KPI (Key Performance Indicator)

Un **KPI** è una metrica **scelta strategicamente** per misurare il progresso verso un obiettivo specifico. È "Key" perché:

- È legato a un **obiettivo aziendale** concreto
- Ha un **target** definito (es. "raggiungere 10.000 utenti attivi")
- Ha un **responsabile** che ne risponde
- Viene **monitorato regolarmente** (daily, weekly)

```python
# Definizione strutturata di un KPI
kpi_definition = {
    "name": "Monthly Active Users (MAU)",
    "formula": "COUNT(DISTINCT user_id) WHERE last_active >= 30 days ago",
    "objective": "Crescita della base utenti",
    "target_q1": 50_000,
    "target_q2": 75_000,
    "owner": "VP Product",
    "review_frequency": "weekly",
    "data_source": "events.user_activity",
    "threshold_red": "<40_000",
    "threshold_yellow": "40_000-48_000", 
    "threshold_green": ">48_000"
}
```

### Driver

Un **driver** è una metrica che **influenza causalmente** un KPI. È la leva su cui puoi agire.

```mermaid
graph LR
    D1["📧 Email open rate<br><i>Driver</i>"] --> K1["🛒 Conversion rate<br><i>KPI</i>"]
    D2["⏱️ Onboarding completions<br><i>Driver</i>"] --> K2["📈 Retention D30<br><i>KPI</i>"]
    D3["🔗 Referral invites sent<br><i>Driver</i>"] --> K3["👥 New users/month<br><i>KPI</i>"]
    K1 --> M["💰 Revenue<br><i>North Star Metric</i>"]
    K2 --> M
    K3 --> M
```

## 3. La Gerarchia: North Star → KPI → Driver → Metrica

```
                    ┌─────────────────────┐
                    │   NORTH STAR METRIC  │  ← 1 sola per azienda
                    │   (es. Weekly Active  │
                    │    Qualified Users)   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
        ┌─────┴─────┐   ┌─────┴─────┐   ┌─────┴─────┐
        │   KPI 1    │   │   KPI 2    │   │   KPI 3    │  ← 3-5 per team
        │ Activation │   │ Retention  │   │  Revenue   │
        │   Rate     │   │    D30     │   │   ARPU     │
        └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
              │                │                │
        ┌─────┴─────┐   ┌─────┴─────┐   ┌─────┴─────┐
        │  Driver A  │   │  Driver C  │   │  Driver E  │  ← Leve operative
        │ Onboarding │   │ Feature    │   │ Upsell     │
        │ Completion │   │ Adoption   │   │ Conversion │
        └───────────┘   └───────────┘   └───────────┘
```

### Esempio Concreto: E-commerce

| Livello | Nome | Valore | Target |
|:---|:---|:---|:---|
| **North Star** | Revenue mensile | €450K | €500K |
| **KPI** | Conversion Rate | 2.8% | 3.5% |
| **KPI** | AOV (Average Order Value) | €85 | €95 |
| **KPI** | Repeat Purchase Rate | 22% | 30% |
| **Driver** | Cart Abandonment Rate | 68% | <60% |
| **Driver** | Product Page → Add to Cart | 12% | 15% |
| **Driver** | Email CTR (carrello abbandonato) | 3.2% | 5% |
| **Metrica** | Pageviews | 1.2M | — |
| **Metrica** | Avg. Load Time | 2.1s | — |

```sql
-- Dashboard KPI con driver per e-commerce
WITH daily_metrics AS (
    SELECT
        event_date,
        COUNT(DISTINCT session_id) AS sessions,
        COUNT(DISTINCT CASE WHEN event = 'purchase' THEN session_id END) AS purchases,
        SUM(CASE WHEN event = 'purchase' THEN revenue END) AS revenue,
        COUNT(DISTINCT CASE WHEN event = 'add_to_cart' THEN session_id END) AS add_to_carts,
        COUNT(DISTINCT CASE WHEN event = 'cart_abandoned' THEN session_id END) AS cart_abandonments
    FROM events
    WHERE event_date >= CURRENT_DATE - INTERVAL 30 DAY
    GROUP BY event_date
)
SELECT
    event_date,
    -- KPI
    ROUND(purchases * 100.0 / NULLIF(sessions, 0), 2) AS conversion_rate_pct,
    ROUND(revenue / NULLIF(purchases, 0), 2) AS aov,
    -- Driver
    ROUND(add_to_carts * 100.0 / NULLIF(sessions, 0), 2) AS add_to_cart_rate_pct,
    ROUND(cart_abandonments * 100.0 / NULLIF(add_to_carts, 0), 2) AS cart_abandon_rate_pct,
    -- Metrica di contesto
    sessions,
    revenue
FROM daily_metrics
ORDER BY event_date DESC;
```

## 4. Vanity Metrics vs Actionable Metrics

Non tutte le metriche sono utili. Alcune sono **vanity metrics**: numeri che fanno bella figura ma non guidano decisioni.

| Vanity Metric 🚫 | Actionable Metric ✅ | Perché |
|:---|:---|:---|
| Utenti registrati totali | Utenti attivi settimanali (WAU) | Un utente registrato che non torna è irrilevante |
| Pageviews totali | Pages per session | Il volume totale dipende dal traffico, non dal valore |
| Download dell'app | Activation rate (D1) | Scaricare ≠ usare |
| Follower sui social | Engagement rate | 100K follower con 0.1% engagement < 10K con 5% |
| "Numero di feature rilasciate" | Feature adoption rate | Rilasciare ≠ usare |

```python
# Funzione per classificare le metriche
def classify_metric(metric: dict) -> str:
    """
    Classifica una metrica come Vanity o Actionable.
    
    Criteri per Actionable:
    1. Legata a un obiettivo di business
    2. Puoi agire su di essa (cambiare un comportamento)
    3. Misura un rapporto, non un valore assoluto
    """
    score = 0
    if metric.get('has_target'):        score += 1
    if metric.get('has_owner'):         score += 1
    if metric.get('is_ratio'):          score += 1
    if metric.get('drives_decision'):   score += 1
    if metric.get('is_comparative'):    score += 1
    
    if score >= 3:
        return "✅ Actionable"
    elif score >= 2:
        return "🟡 Borderline — aggiungi un target"
    else:
        return "🚫 Vanity — ripensa questa metrica"
```

## 5. Costruire il Proprio Albero delle Metriche

### Step-by-step

1. **Definisci la North Star Metric** → la singola metrica che cattura il valore che generi per i clienti
2. **Identifica 3-5 KPI** → metriche chiave per team (Product, Marketing, Sales)
3. **Per ogni KPI, trova 2-3 Driver** → le leve su cui puoi agire concretamente
4. **Assegna owner e target** a ogni KPI e driver
5. **Traccia tutto nel tracking plan** → collega ogni metrica agli eventi necessari

```python
# Template per l'albero delle metriche
metrics_tree = {
    "north_star": {
        "name": "Weekly Qualified Active Users",
        "definition": "Utenti che completano almeno 1 azione di valore a settimana",
        "current": 12_500,
        "target": 20_000,
        "owner": "CEO"
    },
    "kpis": [
        {
            "name": "Activation Rate",
            "definition": "% nuovi utenti che completano l'onboarding in 7gg",
            "current": 0.35,
            "target": 0.50,
            "owner": "PM Onboarding",
            "drivers": [
                {"name": "Onboarding Step 1 Completion", "current": 0.80, "target": 0.90},
                {"name": "Time to First Value", "current": "4.2 min", "target": "< 3 min"},
                {"name": "Tutorial Engagement", "current": 0.45, "target": 0.65}
            ]
        },
        {
            "name": "Retention D30",
            "definition": "% utenti attivi al giorno 30 dopo la registrazione",
            "current": 0.18,
            "target": 0.28,
            "owner": "PM Engagement",
            "drivers": [
                {"name": "Feature Adoption (core)", "current": 0.40, "target": 0.60},
                {"name": "Push Notification CTR", "current": 0.03, "target": 0.06},
                {"name": "Weekly Email Open Rate", "current": 0.22, "target": 0.30}
            ]
        }
    ]
}
```

## 6. Errori Comuni

| Errore | Conseguenza | Soluzione |
|:---|:---|:---|
| Troppi KPI (>7) | Nessuno è davvero "Key" | Seleziona 3-5 max per team |
| KPI senza target | Non sai se stai migliorando | Ogni KPI deve avere un numero target |
| KPI senza owner | Nessuno è responsabile | Ogni KPI ha un nome e cognome |
| Confondere correlazione e causalità nei driver | Intervieni sulla leva sbagliata | Usa A/B test per validare i driver |
| Cambiare KPI ogni mese | Impossibile misurare trend | Mantieni i KPI per almeno 1 quarter |

## Riepilogo

| Termine | Definizione | Esempio |
|:---|:---|:---|
| **Metrica** | Qualsiasi valore misurabile | Pageviews, session duration |
| **KPI** | Metrica chiave con target e owner | Conversion Rate → target 3.5% |
| **Driver** | Metrica che influenza un KPI | Cart abandonment rate |
| **North Star** | L'unica metrica che conta di più | Weekly Active Qualified Users |
| **Vanity Metric** | Numero che sembra bello ma non guida azioni | "1M download" |

## Risorse

- **Libro:** *Lean Analytics* — Alistair Croll & Benjamin Yoskovitz
- **Framework:** Pirate Metrics (AARRR) — Dave McClure
- **Articolo:** "How to Choose the Right KPIs" — Amplitude Blog
''')

# ============================================================
# 3. metriche-fondamenti/ricerca-desk.mdx
# ============================================================
write_lesson('metriche-fondamenti/ricerca-desk.mdx', r'''---
title: "Ricerca Desk (Desk Research)"
description: "Come utilizzare fonti secondarie per raccogliere dati di mercato, benchmark competitivi e insight senza condurre nuove ricerche primarie."
module: "Modulo 1: Fondamenti & Strategia"
order: 6
prerequisites: ["gestione-data-driven/okr-e-kpi"]
category: "Ricerca"
---

# Ricerca Desk (Desk Research)

> **Obiettivo:** Imparare a raccogliere e analizzare dati già esistenti (fonti secondarie) per prendere decisioni informate prima di investire in ricerche primarie costose.

## 1. Cos'è la Desk Research

La **Desk Research** (ricerca a tavolino) consiste nell'analizzare dati e informazioni **già disponibili** — report di settore, statistiche pubbliche, articoli accademici, dati dei competitor — per rispondere a domande di business senza dover condurre interviste, sondaggi o esperimenti.

### Quando Usarla

| Fase del Progetto | Uso della Desk Research |
|:---|:---|
| **Pre-lancio** | Dimensionamento del mercato (TAM/SAM/SOM) |
| **Analisi competitiva** | Benchmark su pricing, feature, posizionamento |
| **Strategia marketing** | Trend di settore, comportamento del consumatore |
| **Business case** | Dati a supporto di investimenti o nuove feature |
| **Validazione** | Confronto dei propri dati interni con benchmark esterni |

## 2. Fonti Secondarie: La Mappa Completa

### Fonti Gratuite

| Fonte | Tipo di Dati | URL |
|:---|:---|:---|
| **Google Trends** | Trend di ricerca nel tempo | trends.google.com |
| **Statista (free tier)** | Statistiche di mercato | statista.com |
| **ISTAT** | Dati demografici e economici Italia | istat.it |
| **Eurostat** | Dati EU su economia, popolazione | ec.europa.eu/eurostat |
| **SimilarWeb (free)** | Traffico web dei competitor | similarweb.com |
| **Crunchbase** | Funding e dati sulle startup | crunchbase.com |
| **Google Scholar** | Paper accademici | scholar.google.com |
| **SEMrush (free tier)** | Keyword e traffico organico | semrush.com |

### Fonti a Pagamento (Premium)

| Fonte | Specializzazione | Prezzo Indicativo |
|:---|:---|:---|
| **Gartner** | Tecnologia e IT | €15K-50K/anno |
| **McKinsey Global Institute** | Strategia e trend macro | Report singoli €500-2K |
| **CB Insights** | Startup e venture capital | €5K-15K/anno |
| **Nielsen** | Consumi e media | Custom |
| **eMarketer/Insider Intelligence** | Digital marketing | €3K-10K/anno |

## 3. Metodologia: Il Processo in 5 Step

```mermaid
graph LR
    A["1️⃣ Definisci<br>le domande"] --> B["2️⃣ Identifica<br>le fonti"]
    B --> C["3️⃣ Raccogli<br>i dati"]
    C --> D["4️⃣ Valuta<br>l'affidabilità"]
    D --> E["5️⃣ Sintetizza<br>gli insight"]
```

### Step 1: Definisci le Domande di Ricerca

```python
# Template per strutturare la ricerca
research_brief = {
    "project": "Lancio app fitness B2C in Italia",
    "questions": [
        "Qual è la dimensione del mercato fitness digitale in Italia?",
        "Chi sono i top 5 competitor e come si posizionano?",
        "Qual è il pricing medio delle app fitness?",
        "Quali sono i trend di crescita del settore?",
        "Qual è il CAC benchmark per app fitness?"
    ],
    "deadline": "2026-03-01",
    "output_format": "Executive summary + appendice dati"
}
```

### Step 2: Identifica le Fonti

Per ogni domanda, trova almeno **2-3 fonti indipendenti** (triangolazione):

```python
# Mappatura domande → fonti
source_mapping = {
    "dimensione_mercato": [
        {"source": "Statista", "type": "report", "reliability": "alta"},
        {"source": "App Annie / data.ai", "type": "dati app store", "reliability": "alta"},
        {"source": "Allied Market Research", "type": "report", "reliability": "media"}
    ],
    "competitor_analysis": [
        {"source": "SimilarWeb", "type": "traffico web", "reliability": "media"},
        {"source": "App Store / Play Store", "type": "download e rating", "reliability": "alta"},
        {"source": "LinkedIn", "type": "dimensione team", "reliability": "media"}
    ],
    "pricing_benchmark": [
        {"source": "Competitor websites", "type": "pricing page", "reliability": "alta"},
        {"source": "App Store subscriptions", "type": "IAP pricing", "reliability": "alta"},
    ]
}
```

### Step 3-4: Raccogli e Valuta

```python
# Framework di valutazione dell'affidabilità delle fonti
def evaluate_source(source: dict) -> dict:
    """Valuta una fonte con il framework CRAAP."""
    criteria = {
        "Currency": "Quanto è recente? (< 2 anni = buono)",
        "Relevance": "È pertinente alla nostra domanda specifica?",
        "Authority": "Chi ha prodotto i dati? (università, azienda, blog?)",
        "Accuracy": "I dati sono supportati da metodologia chiara?",
        "Purpose": "L'autore ha un bias? (es. vendor che vende il proprio prodotto)"
    }
    
    score = sum([
        source.get('is_recent', 0),          # 0-2
        source.get('is_relevant', 0),         # 0-2
        source.get('authority_score', 0),     # 0-2
        source.get('has_methodology', 0),     # 0-2
        source.get('is_unbiased', 0)          # 0-2
    ])
    
    if score >= 8:   return {"reliability": "🟢 Alta", "action": "Usa come fonte primaria"}
    elif score >= 5: return {"reliability": "🟡 Media", "action": "Usa con triangolazione"}
    else:            return {"reliability": "🔴 Bassa", "action": "Scarta o verifica"}
```

### Step 5: Sintetizza gli Insight

```python
# Template di output per il report
executive_summary = {
    "market_size": {
        "tam": "€2.5B (fitness digitale Europa)",
        "sam": "€380M (Italia, app e wearable)",
        "som": "€15M (target: 25-45 anni, premium)",
        "growth_rate": "12% CAGR 2024-2028",
        "sources": ["Statista 2025", "Allied Market Research 2025"]
    },
    "competitive_landscape": {
        "leader": "MyFitnessPal (35% market share)",
        "challengers": ["Freeletics", "Fitbod", "Nike Training Club"],
        "gap_identified": "Nessun competitor ha focus su community italiana",
        "avg_pricing": "€9.99-14.99/mese"
    },
    "key_insights": [
        "Il 67% degli utenti abbandona entro 30 giorni",
        "La retention migliora del 40% con funzionalità social",
        "Il mercato italiano cresce del 18% vs 12% europeo"
    ],
    "recommendations": [
        "Posizionarsi nel segmento premium (€12.99/mese)",
        "Focus su community e social features per la retention",
        "Lancio in Q3 per intercettare il 'settembre effect'"
    ]
}
```

## 4. Desk Research vs Ricerca Primaria

| Criterio | Desk Research | Ricerca Primaria |
|:---|:---|:---|
| **Costo** | Basso (€0-5K) | Alto (€10K-100K+) |
| **Tempo** | 1-2 settimane | 1-3 mesi |
| **Specificità** | Dati generali di mercato | Dati specifici per il tuo caso |
| **Aggiornamento** | Dipende dalla fonte | Sempre attuale |
| **Affidabilità** | Varia per fonte | Alta (se ben disegnata) |
| **Quando usarla** | Prima fase, validazione | Dopo la desk, per approfondire |

> **Best practice:** Inizia **sempre** con la desk research. Ti eviterà di fare domande nelle interviste a cui avresti potuto rispondere con una ricerca Google.

## 5. Errori Comuni

| Errore | Conseguenza | Soluzione |
|:---|:---|:---|
| Usare una sola fonte | Bias di conferma | Triangolazione (min 2-3 fonti) |
| Dati vecchi (>3 anni) | Decisioni su realtà obsoleta | Verifica sempre la data di pubblicazione |
| Confondere TAM con mercato realistico | Sovrastimare l'opportunità | Calcola SAM e SOM realistici |
| Ignorare il bias dell'autore | Dati distorti | Applica il framework CRAAP |
| Non documentare le fonti | Impossibile verificare | Salva URL, data, estratto citato |

## Riepilogo

| Concetto | Takeaway |
|:---|:---|
| **Desk Research** | Analisi di dati esistenti per rispondere a domande di business |
| **Fonti** | Gratuite (Google Trends, ISTAT) + Premium (Gartner, Nielsen) |
| **Metodologia** | 5 step: Domande → Fonti → Raccolta → Valutazione → Sintesi |
| **CRAAP** | Framework per valutare l'affidabilità delle fonti |
| **Triangolazione** | Minimo 2-3 fonti indipendenti per ogni dato |
| **Ordine** | Desk research PRIMA della ricerca primaria |

## Risorse

- **Framework:** CRAAP Test — California State University
- **Tool:** [Google Trends](https://trends.google.com) per trend e stagionalità
- **Template:** Business Model Canvas per sintetizzare i risultati
- **Libro:** *Competitive Intelligence* — Larry Kahaner
''')

print("\n=== Primi 3 file critici riscritti! ===")
print("Procedo con il batch successivo...")
