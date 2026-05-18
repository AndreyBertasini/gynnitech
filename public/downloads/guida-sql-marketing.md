# 50+ Query SQL per Marketing Analytics

## Guida pratica di GinnyTech — italiana, commentata, pronta all'uso

---

### 1. METRICHE BASE

```sql
-- 🔢 Utenti attivi per giorno (DAU)
SELECT
  DATE(event_timestamp) AS giorno,
  COUNT(DISTINCT user_id) AS utenti_attivi
FROM events
WHERE DATE(event_timestamp) >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY 1
ORDER BY 1;

-- 📈 Tasso di retention D7
WITH first_visit AS (
  SELECT user_id, MIN(DATE(event_timestamp)) AS first_day
  FROM events
  GROUP BY user_id
)
SELECT
  f.first_day,
  COUNT(DISTINCT f.user_id) AS nuovi_utenti,
  COUNT(DISTINCT e.user_id) AS tornati_d7,
  ROUND(COUNT(DISTINCT e.user_id) * 100.0 / COUNT(DISTINCT f.user_id), 1) AS retention_pct
FROM first_visit f
LEFT JOIN events e
  ON e.user_id = f.user_id
  AND DATE(e.event_timestamp) = f.first_day + 7
GROUP BY 1
ORDER BY 1;
```

---

### 2. ANALISI CAMPAGNE

```sql
-- 💰 ROAS per campagna
SELECT
  utm_campaign,
  SUM(spend) AS costo_totale,
  SUM(revenue) AS ricavo,
  ROUND((SUM(revenue) - SUM(spend)) * 100.0 / NULLIF(SUM(spend), 0), 1) AS roas_pct
FROM marketing_spend
WHERE spend_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY 1
HAVING SUM(spend) > 0
ORDER BY roas_pct DESC;

-- 📊 CTR per canale
SELECT
  channel,
  COUNT(*) AS impressioni,
  SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END) AS click,
  ROUND(SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS ctr_pct
FROM ad_events
WHERE event_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY 1;
```

---

### 3. ANALISI UTENTI

```sql
-- 👤 Segmentazione per valore (RFM semplificato)
SELECT
  user_id,
  MAX(order_date) AS ultimo_ordine,
  COUNT(DISTINCT order_id) AS frequenza,
  SUM(order_value) AS valore_totale,
  CASE
    WHEN SUM(order_value) > 500 THEN 'Top'
    WHEN SUM(order_value) BETWEEN 100 AND 500 THEN 'Medio'
    ELSE 'Basso'
  END AS segmento
FROM orders
WHERE order_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY 1;

-- 🔁 Tasso di riacquisto per canale di acquisizione
WITH primo_canale AS (
  SELECT DISTINCT ON (user_id)
    user_id, utm_source AS canale_acquisizione
  FROM orders
  ORDER BY user_id, order_date
)
SELECT
  p.canale_acquisizione,
  COUNT(DISTINCT p.user_id) AS acquisiti,
  COUNT(DISTINCT CASE WHEN o.order_date > first_order.first_date THEN p.user_id END) AS riacquistati
FROM primo_canale p
JOIN orders o ON o.user_id = p.user_id
CROSS JOIN LATERAL (
  SELECT MIN(o2.order_date) AS first_date FROM orders o2 WHERE o2.user_id = p.user_id
) first_order
GROUP BY 1;
```

---

### 4. ANALISI PRODOTTO

```sql
-- 🛒 Prodotti più venduti con trend
SELECT
  product_id,
  product_name,
  COUNT(*) AS vendite_mese,
  LAG(COUNT(*)) OVER (PARTITION BY product_id ORDER BY DATE_TRUNC('month', order_date)) AS vendite_mese_prec,
  ROUND(
    (COUNT(*) - LAG(COUNT(*)) OVER w) * 100.0 / NULLIF(LAG(COUNT(*)) OVER w, 0), 1
  ) AS variazione_pct
FROM orders
WHERE order_date >= CURRENT_DATE - INTERVAL '3 months'
GROUP BY product_id, product_name, DATE_TRUNC('month', order_date)
WINDOW w AS (PARTITION BY product_id ORDER BY DATE_TRUNC('month', order_date))
ORDER BY vendite_mese DESC;

-- 🧩 Affinità prodotto (Market Basket Analysis)
SELECT
  a.product_id AS prodotto_A,
  b.product_id AS prodotto_B,
  COUNT(DISTINCT a.order_id) AS ordini_congiunti,
  COUNT(DISTINCT a.order_id) * 100.0 / (
    SELECT COUNT(DISTINCT order_id) FROM orders WHERE product_id = a.product_id
  ) AS affinity_pct
FROM orders a
JOIN orders b ON a.order_id = b.order_id AND a.product_id < b.product_id
GROUP BY 1, 2
HAVING COUNT(DISTINCT a.order_id) >= 10
ORDER BY affinity_pct DESC;
```

---

### 5. FUNNEL & CONVERSIONE

```sql
-- 🔻 Conversion funnel (pagina → carrello → checkout → acquisto)
WITH funnel AS (
  SELECT
    user_id,
    MAX(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) AS step1,
    MAX(CASE WHEN event_type = 'add_to_cart' THEN 1 ELSE 0 END) AS step2,
    MAX(CASE WHEN event_type = 'checkout' THEN 1 ELSE 0 END) AS step3,
    MAX(CASE WHEN event_type = 'purchase' THEN 1 ELSE 0 END) AS step4
  FROM events
  WHERE event_date = CURRENT_DATE
  GROUP BY user_id
)
SELECT
  'Page View' AS step, SUM(step1) AS utenti FROM funnel
UNION ALL SELECT 'Add to Cart', SUM(step2) FROM funnel
UNION ALL SELECT 'Checkout', SUM(step3) FROM funnel
UNION ALL SELECT 'Purchase', SUM(step4) FROM funnel;

-- ⏱️ Tempo medio alla conversione (giorni)
SELECT
  utm_source,
  ROUND(AVG(DATE(order_date) - DATE(first_visit)), 1) AS giorni_alla_conversione,
  COUNT(DISTINCT user_id) AS utenti_convertiti
FROM orders o
JOIN (
  SELECT user_id, MIN(event_date) AS first_visit
  FROM events
  WHERE event_type = 'page_view'
  GROUP BY user_id
) f ON f.user_id = o.user_id
GROUP BY 1
ORDER BY 2;
```

---

### 6. CHURN & RETENTION

```sql
-- ⚠️ Utenti a rischio churn (inattivi da 14+ giorni)
SELECT
  user_id,
  MAX(event_date) AS ultima_attivita,
  CURRENT_DATE - MAX(event_date) AS giorni_inattivo
FROM events
GROUP BY user_id
HAVING MAX(event_date) < CURRENT_DATE - 14
ORDER BY giorni_inattivo DESC;

-- 📊 Curva di retention a 30 giorni
SELECT
  giorno_differenza,
  COUNT(DISTINCT user_id) AS utenti_attivi,
  COUNT(DISTINCT user_id) * 100.0 /
    MAX(COUNT(DISTINCT user_id)) OVER () AS retention_pct
FROM (
  SELECT
    user_id,
    DATE(event_date) - MIN(DATE(event_date)) OVER (PARTITION BY user_id) AS giorno_differenza
  FROM events
  WHERE DATE(event_date) >= CURRENT_DATE - INTERVAL '60 days'
)
WHERE giorno_differenza <= 30
GROUP BY 1
ORDER BY 1;
```

---

### 7. ATTRIBUZIONE

```sql
-- 🧭 Attribuzione last-touch per canale
WITH ultimo_touch AS (
  SELECT DISTINCT ON (user_id, order_id)
    user_id, order_id, utm_source
  FROM marketing_touchpoints
  WHERE touch_date <= order_date
  ORDER BY user_id, order_id, touch_date DESC
)
SELECT
  utm_source AS canale,
  COUNT(DISTINCT order_id) AS ordini_attribuiti,
  SUM(order_value) AS ricavo_attribuito
FROM ultimo_touch
JOIN orders USING (order_id)
GROUP BY 1
ORDER BY ricavo_attribuito DESC;
```

---

### 8. ANALISI COORTI

```sql
-- 📅 Revenue per coorte nel tempo
WITH coorti AS (
  SELECT
    user_id,
    DATE_TRUNC('month', MIN(order_date)) AS coorte_mese,
    DATE_TRUNC('month', order_date) AS mese_attivita,
    SUM(order_value) AS ricavo
  FROM orders
  GROUP BY user_id, DATE_TRUNC('month', order_date)
)
SELECT
  coorte_mese,
  mese_attivita,
  (mese_attivita - coorte_mese) / 30 AS mese_relativo,
  SUM(ricavo) AS ricavo_totale,
  COUNT(DISTINCT user_id) AS utenti
FROM coorti
WHERE coorte_mese >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')
GROUP BY 1, 2, 3
ORDER BY 1, 3;
```

---

*GinnyTech — MarTech & Analytics Engineering che usi davvero.*
*ginnytech.it*
