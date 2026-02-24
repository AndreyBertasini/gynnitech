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

# === KAFKA-STREAMING ===
rewrite('kafka-streaming/caso-studio.mdx', '''
# Caso Studio — Architetture Streaming

> **Scenario:** Un marketplace online deve passare da batch processing (aggiornamento notturno) a streaming real-time per le dashboard marketing.

## 1. Il Problema
| Aspetto | Batch (prima) | Real-Time (dopo) |
|:---|:---|:---|
| Latenza dati | 24 ore | <5 secondi |
| Costo opportunità | Anomalie scoperte il giorno dopo | Alert immediato |
| User experience | Report del giorno prima | Dashboard live |

## 2. Architettura Implementata
```mermaid
graph LR
    A["Web App"] -->|eventi| B["Kafka"]
    C["Mobile App"] -->|eventi| B
    B -->|Kafka Connect| D["ClickHouse"]
    B -->|Kafka Connect| E["S3 Archive"]
    D --> F["Grafana<br>Dashboard Live"]
    D --> G["Metabase<br>Analytics"]
```

## 3. Configurazione Kafka
```properties
# Topic per eventi di tracking
num.partitions=6
replication.factor=3
retention.ms=604800000   # 7 giorni
cleanup.policy=delete
compression.type=lz4
```

```python
from confluent_kafka import Producer
producer = Producer({
    'bootstrap.servers': 'kafka:9092',
    'acks': 'all',
    'enable.idempotence': True,
    'compression.type': 'lz4',
    'batch.size': 16384,
    'linger.ms': 10
})
def send_event(topic, key, value):
    producer.produce(topic, key=key.encode(), value=json.dumps(value).encode())
    producer.flush()
```

## 4. Risultati
| Metrica | Prima | Dopo |
|:---|:---:|:---:|
| Latenza dati | 24h | 3s |
| Anomalie rilevate/giorno | 0.3 | 4.2 |
| Tempo di reazione | Giorno dopo | 10 minuti |
| Revenue salvato (trim.) | - | €85K |

## Lezioni
1. Kafka come buffer assorbe gli spike senza perdere eventi
2. Inizia con pochi topic ben partizionati, non decine
3. Il vero valore non è la velocità ma la capacità di reagire
''')

rewrite('kafka-streaming/cheat-sheet.mdx', '''
# Cheat Sheet — Kafka & Event Streaming

## Comandi CLI Essenziali
```bash
# Topic
kafka-topics --create --topic events --partitions 6 --replication-factor 3
kafka-topics --list --bootstrap-server localhost:9092
kafka-topics --describe --topic events

# Consumer
kafka-console-consumer --topic events --from-beginning --group test-group
kafka-consumer-groups --describe --group my-app --bootstrap-server localhost:9092

# Producer
echo '{"event":"test"}' | kafka-console-producer --topic events --bootstrap-server localhost:9092
```

## Configurazioni Chiave
| Config | Valore Consigliato | Perché |
|:---|:---|:---|
| `acks` | `all` | Nessuna perdita dati |
| `enable.idempotence` | `true` | No duplicati |
| `replication.factor` | `3` | Tolleranza a 1 broker down |
| `min.insync.replicas` | `2` | Garanzia di scrittura |
| `retention.ms` | 7 giorni | Sufficiente per replay |
| `compression.type` | `lz4` | Bilanciamento velocità/compressione |

## Pattern di Partitioning
| Strategia | Key | Uso |
|:---|:---|:---|
| Per utente | `user_id` | Ordine eventi per utente |
| Per entità | `order_id` | Ordine eventi per ordine |
| Random | `null` | Max throughput, nessun ordine |
| Per tenant | `tenant_id` | Multi-tenancy |

## Consumer Groups
```
Topic: events (6 partitions)
├── Consumer Group A (3 consumers) → 2 partizioni/consumer
├── Consumer Group B (6 consumers) → 1 partizione/consumer
└── Consumer Group C (1 consumer) → tutte le 6 partizioni
```

## Monitoring Metriche
| Metrica | Soglia Alert |
|:---|:---|
| Consumer Lag | > 10.000 messaggi |
| Under-replicated partitions | > 0 |
| Request latency p99 | > 100ms |
| Disk usage | > 80% |
| Active controllers | ≠ 1 |

## Schema Registry
```bash
# Registra schema Avro
curl -X POST -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  --data '{"schema": "{...}"}' \
  http://localhost:8081/subjects/events-value/versions
```
''')

rewrite('kafka-streaming/kafka-clickhouse.mdx', '''
# Kafka + ClickHouse: Pipeline Real-Time per Marketing Analytics

> **Obiettivo:** Costruire una pipeline end-to-end che ingerisce eventi da Kafka in ClickHouse per analytics in tempo reale.

## 1. L\'Architettura
```mermaid
graph LR
    A["App/Web"] -->|JSON events| B["Kafka Topic<br>marketing_events"]
    B -->|Kafka Engine| C["ClickHouse<br>kafka_queue"]
    C -->|MV| D["ClickHouse<br>events_raw"]
    D -->|MV| E["ClickHouse<br>events_hourly<br>(aggregazione)"]
```

## 2. Setup ClickHouse

```sql
-- 1. Tabella Kafka Engine (coda di ingestion)
CREATE TABLE kafka_marketing_events (
    event_id String,
    event_type String,
    user_id String,
    properties String,
    timestamp DateTime64(3)
) ENGINE = Kafka
SETTINGS
    kafka_broker_list = 'kafka:9092',
    kafka_topic_list = 'marketing_events',
    kafka_group_name = 'clickhouse_consumer',
    kafka_format = 'JSONEachRow',
    kafka_num_consumers = 3;

-- 2. Tabella di destinazione (storage ottimizzato)
CREATE TABLE events_raw (
    event_id String,
    event_type LowCardinality(String),
    user_id String,
    properties String,
    timestamp DateTime64(3),
    event_date Date DEFAULT toDate(timestamp)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_type, user_id, timestamp)
TTL event_date + INTERVAL 90 DAY;

-- 3. Materialized View (connettore automatico)
CREATE MATERIALIZED VIEW mv_kafka_to_raw TO events_raw AS
SELECT * FROM kafka_marketing_events;

-- 4. Aggregazione oraria per dashboard veloci
CREATE MATERIALIZED VIEW mv_events_hourly
ENGINE = SummingMergeTree()
ORDER BY (event_type, hour)
AS SELECT
    event_type,
    toStartOfHour(timestamp) AS hour,
    count() AS event_count,
    uniqExact(user_id) AS unique_users
FROM events_raw
GROUP BY event_type, hour;
```

## 3. Query per Dashboard Real-Time

```sql
-- Ultimi 60 minuti di eventi
SELECT
    event_type,
    count() AS events,
    uniqExact(user_id) AS users,
    round(count() / 60, 1) AS events_per_minute
FROM events_raw
WHERE timestamp >= now() - INTERVAL 60 MINUTE
GROUP BY event_type
ORDER BY events DESC;

-- Confronto ora corrente vs stessa ora ieri
SELECT
    event_type,
    countIf(timestamp >= now() - INTERVAL 1 HOUR) AS events_now,
    countIf(timestamp >= now() - INTERVAL 25 HOUR
        AND timestamp < now() - INTERVAL 24 HOUR) AS events_yesterday,
    round((events_now - events_yesterday) / events_yesterday * 100, 1) AS change_pct
FROM events_raw
WHERE timestamp >= now() - INTERVAL 25 HOUR
GROUP BY event_type;
```

## 4. Monitoring della Pipeline
```sql
-- Lag di ingestion
SELECT
    max(timestamp) AS latest_event,
    dateDiff('second', max(timestamp), now()) AS lag_seconds
FROM events_raw;
```

## Risorse
- **Doc:** ClickHouse Kafka Engine, Materialized Views
- **Best Practice:** Partition by month, TTL per cost control
''')

# === REAL-TIME-ANALYTICS ===
rewrite('real-time-analytics/caso-studio.mdx', '''
# Caso Studio — Real-Time Analytics

> **Scenario:** Un SaaS di e-commerce analytics deve fornire dashboard real-time ai propri clienti con latenza <10 secondi.

## 1. Requisiti
| Requisito | Specifica |
|:---|:---|
| Clienti | 200 tenant |
| Volume | 50M eventi/giorno totali |
| Latenza query | p95 < 3 secondi |
| Latenza ingestion | < 10 secondi |

## 2. Soluzione
```mermaid
graph LR
    A["Client SDK"] --> B["API Gateway"]
    B --> C["Kafka<br>(per tenant)"]
    C --> D["ClickHouse<br>(multi-tenant)"]
    D --> E["API REST"]
    E --> F["Dashboard<br>React"]
```

## 3. Ottimizzazione ClickHouse per Multi-Tenant
```sql
CREATE TABLE events (
    tenant_id UInt32,
    event_type LowCardinality(String),
    user_id String,
    timestamp DateTime64(3),
    properties Map(String, String)
) ENGINE = MergeTree()
PARTITION BY (tenant_id, toYYYYMM(timestamp))
ORDER BY (tenant_id, event_type, timestamp)
SETTINGS index_granularity = 8192;
```

## 4. Risultati
| Metrica | Target | Raggiunto |
|:---|:---:|:---:|
| Query p95 | <3s | 1.8s |
| Ingestion latency | <10s | 4s |
| Uptime | 99.9% | 99.97% |
| Costo per tenant | <€5/mese | €3.20/mese |
''')

rewrite('real-time-analytics/cdc-pattern.mdx', '''
# Change Data Capture (CDC) Patterns

> **Obiettivo:** Catturare le modifiche ai database in tempo reale per alimentare analytics senza impattare la produzione.

## 1. Cos\'è il CDC
Il CDC cattura ogni INSERT, UPDATE, DELETE su un database e lo trasforma in un evento stream.

```mermaid
graph LR
    A["PostgreSQL<br>(produzione)"] -->|CDC| B["Debezium"]
    B --> C["Kafka"]
    C --> D["ClickHouse<br>(analytics)"]
```

## 2. Debezium: Setup
```json
{
  "name": "pg-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "postgres",
    "database.port": "5432",
    "database.user": "debezium",
    "database.dbname": "production",
    "topic.prefix": "cdc",
    "table.include.list": "public.orders,public.users",
    "slot.name": "debezium_slot",
    "plugin.name": "pgoutput"
  }
}
```

## 3. Formato degli Eventi CDC
```json
{
  "before": {"id": 1, "status": "pending", "amount": 99.99},
  "after":  {"id": 1, "status": "paid", "amount": 99.99},
  "source": {"table": "orders", "ts_ms": 1708790400000},
  "op": "u"  // c=create, u=update, d=delete, r=read(snapshot)
}
```

## 4. Pattern di Consumo in ClickHouse
```sql
-- ReplacingMergeTree per gestire update
CREATE TABLE orders_cdc (
    id UInt64,
    status LowCardinality(String),
    amount Decimal(10,2),
    updated_at DateTime64(3),
    _version UInt64
) ENGINE = ReplacingMergeTree(_version)
ORDER BY id;
```

## 5. Quando Usare il CDC
| Use Case | Alternativa | Perché CDC |
|:---|:---|:---|
| Replica DB per analytics | Query dirette su prod | Zero impatto sulla produzione |
| Audit log | Trigger nel DB | Disaccoppiato, scalabile |
| Sincronizzazione sistemi | API polling | Tempo reale, nessun dato perso |
| Event sourcing | Custom events | Automatico, schema-aware |

## Risorse
- **Tool:** Debezium, Kafka Connect
- **Pattern:** Outbox Pattern per microservizi
''')

rewrite('real-time-analytics/cheat-sheet.mdx', '''
# Cheat Sheet — Real-Time Analytics

## ClickHouse Query Patterns
```sql
-- Ultimi N minuti
SELECT ... FROM events WHERE timestamp >= now() - INTERVAL 5 MINUTE;

-- Aggregazione per finestra temporale
SELECT toStartOfMinute(timestamp) AS minute, count() FROM events GROUP BY minute;

-- Uniq approssimato (veloce)
SELECT uniq(user_id) FROM events;  -- HyperLogLog, ~2% errore

-- Uniq esatto
SELECT uniqExact(user_id) FROM events;  -- Preciso ma più lento

-- Top N
SELECT event_type, count() AS c FROM events GROUP BY event_type ORDER BY c DESC LIMIT 10;
```

## Engine Selection
| Engine | Uso | Caratteristica |
|:---|:---|:---|
| MergeTree | Default, analytics | Ordinato, compresso |
| ReplacingMergeTree | CDC, upsert | Deduplica per version |
| SummingMergeTree | Aggregazioni pre-calcolate | Somma automatica |
| AggregatingMergeTree | Aggregazioni complesse | uniqState, quantileState |
| Kafka | Ingestion da Kafka | Consumer automatico |

## Monitoring Essenziale
```sql
-- Spazio occupato per tabella
SELECT table, formatReadableSize(sum(bytes_on_disk)) AS size, sum(rows) AS rows
FROM system.parts WHERE active GROUP BY table ORDER BY sum(bytes_on_disk) DESC;

-- Query più lente
SELECT query, query_duration_ms, read_rows, memory_usage
FROM system.query_log WHERE type = 'QueryFinish'
ORDER BY query_duration_ms DESC LIMIT 10;

-- Consumer lag Kafka
SELECT * FROM system.kafka_consumers;
```

## Kafka Quick Reference
| Concetto | Descrizione |
|:---|:---|
| Topic | Canale logico per i messaggi |
| Partition | Unità di parallelismo |
| Consumer Group | Gruppo di consumer che si dividono le partizioni |
| Offset | Posizione del consumer nella partizione |
| Replication Factor | Copie del dato (3 = standard) |
''')

rewrite('real-time-analytics/clickhouse-ottimizzazione.mdx', '''
# ClickHouse: Ottimizzazione e Best Practices

> **Obiettivo:** Ottimizzare query e schema ClickHouse per performance massime su grandi volumi di dati analytics.

## 1. Ottimizzazione dello Schema

### Tipi di Dato Efficienti
```sql
-- ❌ Inefficiente
CREATE TABLE events_bad (
    event_type String,         -- 40+ bytes per valore
    country String,            -- Meglio LowCardinality
    user_id String,            -- UUID? Usa UUID type
    timestamp String           -- Parser a ogni query!
);

-- ✅ Ottimizzato
CREATE TABLE events_good (
    event_type LowCardinality(String),  -- Dizionario, <1 byte
    country LowCardinality(String),     -- Max qualche centinaio di valori
    user_id UUID,                        -- 16 bytes fissi
    timestamp DateTime64(3)              -- Nativo, comparabile
);
```

## 2. Ottimizzazione delle Query

```sql
-- ❌ Lenta: scansiona tutto
SELECT count() FROM events WHERE toString(timestamp) LIKE '2026-02%';

-- ✅ Veloce: usa la partizione
SELECT count() FROM events WHERE timestamp >= '2026-02-01' AND timestamp < '2026-03-01';

-- ❌ Lenta: funzione applicata alla colonna nell\'ORDER BY
SELECT * FROM events WHERE lower(event_type) = 'purchase';

-- ✅ Veloce: LowCardinality + match diretto
SELECT * FROM events WHERE event_type = 'purchase';
```

## 3. Materialized Views per Pre-Aggregazione
```sql
-- Aggregazione in tempo reale per dashboard
CREATE MATERIALIZED VIEW mv_hourly_stats
ENGINE = SummingMergeTree() ORDER BY (event_type, hour) AS
SELECT
    event_type,
    toStartOfHour(timestamp) AS hour,
    count() AS events,
    uniqState(user_id) AS users_state  -- HyperLogLog state
FROM events GROUP BY event_type, hour;

-- Query sulla MV: 100x più veloce che sulla tabella raw
SELECT event_type, hour, events, uniqMerge(users_state) AS unique_users
FROM mv_hourly_stats WHERE hour >= now() - INTERVAL 24 HOUR
GROUP BY event_type, hour;
```

## 4. Partition e TTL
```sql
-- Partitioning mensile + TTL di 90 giorni
ALTER TABLE events
    MODIFY TTL timestamp + INTERVAL 90 DAY;

-- Verifica partizioni
SELECT partition, name, rows, formatReadableSize(bytes_on_disk)
FROM system.parts WHERE table = 'events' AND active
ORDER BY partition DESC;
```

## 5. Checklist Ottimizzazione
- [ ] `LowCardinality` per colonne con <10K valori unici
- [ ] `ORDER BY` allineato con le query più frequenti
- [ ] Partitioning per mese (`toYYYYMM`)
- [ ] TTL per eliminare dati vecchi automaticamente
- [ ] Materialized Views per dashboard real-time
- [ ] `PREWHERE` per filtrare prima della lettura
- [ ] Compression codec: `ZSTD(3)` per rapporto ottimale
''')

rewrite('real-time-analytics/clickhouse-rt.mdx', '''
# ClickHouse: Materialized Views e Aggregazioni Real-Time

> **Obiettivo:** Usare le Materialized Views per pre-calcolare aggregazioni e servire dashboard in tempo reale.

## 1. Il Pattern MV per Real-Time

```mermaid
graph LR
    A["INSERT eventi<br>(continuo)"] --> B["Tabella Raw<br>MergeTree"]
    B --> C["MV: Hourly Stats<br>SummingMergeTree"]
    B --> D["MV: Daily Users<br>AggregatingMergeTree"]
    C --> E["Dashboard<br>query veloci"]
    D --> E
```

## 2. SummingMergeTree per Contatori
```sql
CREATE TABLE events_hourly (
    event_type LowCardinality(String),
    hour DateTime,
    events UInt64,
    revenue Decimal(18,2)
) ENGINE = SummingMergeTree()
ORDER BY (event_type, hour);

CREATE MATERIALIZED VIEW mv_events_hourly TO events_hourly AS
SELECT
    event_type,
    toStartOfHour(timestamp) AS hour,
    count() AS events,
    sum(revenue) AS revenue
FROM events_raw GROUP BY event_type, hour;
```

## 3. AggregatingMergeTree per Uniq e Percentili
```sql
CREATE TABLE daily_uniq_users (
    date Date,
    event_type LowCardinality(String),
    users AggregateFunction(uniq, UUID),
    latency_p95 AggregateFunction(quantile(0.95), Float64)
) ENGINE = AggregatingMergeTree()
ORDER BY (date, event_type);

CREATE MATERIALIZED VIEW mv_daily_uniq TO daily_uniq_users AS
SELECT
    toDate(timestamp) AS date,
    event_type,
    uniqState(user_id) AS users,
    quantileState(0.95)(latency_ms) AS latency_p95
FROM events_raw GROUP BY date, event_type;

-- Query: merge degli stati
SELECT date, event_type,
    uniqMerge(users) AS unique_users,
    quantileMerge(0.95)(latency_p95) AS p95_latency
FROM daily_uniq_users
WHERE date >= today() - 30
GROUP BY date, event_type;
```

## 4. Performance: Raw vs MV
| Query | Tabella Raw | Materialized View | Speedup |
|:---|:---:|:---:|:---:|
| Conteggio orario ultimi 7gg | 2.3s | 12ms | **190x** |
| Unique users giornalieri | 4.1s | 25ms | **160x** |
| Revenue per canale (30gg) | 1.8s | 8ms | **225x** |

## Risorse
- **Doc:** ClickHouse MV documentation
- **Pattern:** Lambda architecture simplified con ClickHouse
''')

rewrite('real-time-analytics/dashboards.mdx', '''
# Dashboard Live e Alerting

> **Obiettivo:** Costruire dashboard real-time con auto-refresh e sistemi di alerting automatico per anomalie.

## 1. Dashboard Real-Time vs Batch

| Caratteristica | Batch | Real-Time |
|:---|:---|:---|
| Refresh | Ogni ora/giorno | 5-30 secondi |
| Latenza dati | Ore | Secondi |
| Uso | Report strategici | Monitoring operativo |
| Complessità | Bassa | Media-Alta |

## 2. Setup Grafana per Real-Time

```sql
-- Query ottimizzata per Grafana con auto-refresh 10s
SELECT
    $__timeInterval(timestamp, 1m) AS time,
    event_type,
    count() AS events,
    uniq(user_id) AS users
FROM events_raw
WHERE $__timeFilter(timestamp)
GROUP BY time, event_type
ORDER BY time;
```

## 3. Sistema di Alerting

```python
from dataclasses import dataclass

@dataclass
class AlertRule:
    name: str
    query: str
    threshold: float
    operator: str  # gt, lt, eq
    severity: str  # info, warning, critical
    cooldown_minutes: int = 30

alert_rules = [
    AlertRule(
        name="Revenue Drop",
        query="SELECT sum(revenue) FROM events_raw WHERE timestamp >= now() - INTERVAL 1 HOUR",
        threshold=1000,
        operator="lt",
        severity="critical"
    ),
    AlertRule(
        name="Error Rate Spike",
        query="""SELECT countIf(status >= 500) / count() * 100 
                 FROM events_raw WHERE timestamp >= now() - INTERVAL 5 MINUTE""",
        threshold=5.0,
        operator="gt",
        severity="warning"
    ),
    AlertRule(
        name="Zero Events",
        query="SELECT count() FROM events_raw WHERE timestamp >= now() - INTERVAL 5 MINUTE",
        threshold=0,
        operator="eq",
        severity="critical"
    )
]
```

## 4. Dashboard Executive Real-Time

KPI da mostrare:
| KPI | Refresh | Visualizzazione |
|:---|:---:|:---|
| Revenue last hour | 30s | Big number + sparkline |
| Active users now | 10s | Gauge |
| Conversion rate | 1min | Line chart rolling 24h |
| Error rate | 10s | Traffic light (verde/giallo/rosso) |
| Top events | 30s | Bar chart |

## 5. Best Practices
- **Auto-refresh:** 10-30s per monitoring, 5min per analytics
- **Time range:** Mostra sempre almeno 24h per contesto
- **Annotazioni:** Marca i deploy e gli incident sul grafico
- **Alerting:** severity-based, con cooldown per evitare spam
- **On-call:** Ruota le responsabilità di risposta agli alert

## Risorse
- **Tool:** Grafana, Metabase, Apache Superset
- **Alerting:** Grafana Alerts, PagerDuty, OpsGenie
''')

rewrite('real-time-analytics/streaming.mdx', '''
# Streaming Ingestion con Kafka

> **Obiettivo:** Implementare un sistema di ingestion streaming che raccoglie eventi in tempo reale e li rende disponibili per l\'analisi.

## 1. Architettura di Ingestion
```mermaid
graph LR
    A["SDK Web/Mobile"] -->|HTTPS| B["API Gateway"]
    B -->|produce| C["Kafka Cluster"]
    C -->|consume| D["ClickHouse"]
    C -->|consume| E["S3 Archive"]
    C -->|consume| F["Real-time Processing"]
```

## 2. Producer: Invio Eventi
```python
from confluent_kafka import Producer
import json, time

config = {
    'bootstrap.servers': 'kafka:9092',
    'acks': 'all',
    'enable.idempotence': True,
    'compression.type': 'lz4',
    'batch.size': 32768,
    'linger.ms': 20
}

producer = Producer(config)

def track_event(user_id: str, event_type: str, properties: dict):
    event = {
        "user_id": user_id,
        "event_type": event_type,
        "properties": properties,
        "timestamp": int(time.time() * 1000),
        "client_ip": "x.x.x.x"
    }
    producer.produce(
        topic='tracking_events',
        key=user_id.encode(),
        value=json.dumps(event).encode(),
        callback=lambda err, msg: print(f"Error: {err}") if err else None
    )
```

## 3. Consumer: Elaborazione
```python
from confluent_kafka import Consumer

consumer = Consumer({
    'bootstrap.servers': 'kafka:9092',
    'group.id': 'analytics-pipeline',
    'auto.offset.reset': 'earliest',
    'enable.auto.commit': False
})
consumer.subscribe(['tracking_events'])

batch = []
while True:
    msg = consumer.poll(1.0)
    if msg and not msg.error():
        batch.append(json.loads(msg.value()))
        if len(batch) >= 1000:
            insert_to_clickhouse(batch)
            consumer.commit()
            batch = []
```

## 4. Gestione degli Errori
| Errore | Pattern | Esempio |
|:---|:---|:---|
| Kafka down | Retry con backoff | SDK bufferizza localmente |
| Messaggio malformato | Dead Letter Queue | Topic separato per errori |
| Consumer crash | Auto-restart + commit manuale | Kubernetes liveness probe |
| Duplicati | Idempotenza | Dedup per event_id |

## Risorse
- **Libreria:** confluent-kafka-python, aiokafka
- **Pattern:** Exactly-once semantics, Dead Letter Queue
''')

# === DATA-COLLECTION (file rimanenti con template generico) ===
rewrite('data-collection/integrations.mdx', '''
# Integrazioni & ELT

> **Obiettivo:** Connettere le fonti dati aziendali (CRM, Ads, Analytics) in un unico data warehouse attraverso pipeline ELT.

## 1. Il Panorama delle Integrazioni

```mermaid
graph TD
    subgraph Fonti
        A["Google Ads"]
        B["Meta Ads"]
        C["GA4"]
        D["Shopify"]
        E["Mailchimp"]
        F["CRM"]
    end
    subgraph ELT
        G["Airbyte / Fivetran"]
    end
    subgraph Warehouse
        H["ClickHouse / BigQuery"]
    end
    A --> G
    B --> G
    C --> G
    D --> G
    E --> G
    F --> G
    G --> H
```

## 2. Tool di Integrazione

| Tool | Open Source | N. Connettori | Prezzo |
|:---|:---:|:---:|:---|
| **Airbyte** | ✅ | 350+ | Free (self-hosted) |
| **Fivetran** | ❌ | 500+ | Da $1/MAR |
| **Stitch** | ❌ | 100+ | Da $100/mese |
| **Meltano** | ✅ | 200+ | Free |

## 3. Configurazione Airbyte

```yaml
# Connettore Google Ads → ClickHouse
source:
  type: source-google-ads
  config:
    credentials:
      developer_token: "${GOOGLE_ADS_TOKEN}"
      client_id: "${GOOGLE_CLIENT_ID}"
    customer_id: "123-456-7890"
    start_date: "2025-01-01"

destination:
  type: destination-clickhouse
  config:
    host: clickhouse.example.com
    port: 8443
    database: marketing
    username: airbyte
    ssl: true

sync:
  schedule: "0 6 * * *"  # Ogni giorno alle 6:00
  mode: incremental
  cursor_field: date
```

## 4. Best Practices

| Practice | Perché |
|:---|:---|
| Incremental sync | Non ricaricare tutto ogni volta |
| Schema change alerts | Sapere quando le API cambiano |
| Data quality checks post-load | Verificare completezza e freshness |
| Staging layer | Non trasformare durante il load |
| Idempotenza | Poter rieseguire senza duplicati |

```sql
-- Check post-integrazione: dati freschi?
SELECT source, MAX(loaded_at) AS last_load,
    DATE_DIFF('hour', MAX(loaded_at), NOW()) AS hours_ago
FROM _airbyte_metadata
GROUP BY source
HAVING hours_ago > 24;  -- Alert se dati vecchi >24h
```

## 5. Pattern ELT con dbt

```sql
-- staging/stg_google_ads.sql
SELECT
    date AS ad_date,
    campaign_name,
    impressions,
    clicks,
    cost_micros / 1000000.0 AS cost,
    conversions
FROM {{ source('google_ads', 'campaign_performance') }}
WHERE date >= '2025-01-01'
```

## Risorse
- **Tool:** Airbyte (open source), Fivetran, dbt
- **Pattern:** ELT > ETL per data warehouse moderni
''')

rewrite('data-collection/privacy.mdx', '''
# Privacy, GDPR e Consent Mode

> **Obiettivo:** Implementare la raccolta dati nel rispetto di GDPR, ePrivacy e Consent Mode di Google, senza perdere insight fondamentali.

## 1. Il Framework Legale

| Normativa | Ambito | Requisiti Chiave |
|:---|:---|:---|
| **GDPR** | Dati personali EU | Consenso, diritto all\'oblio, DPO |
| **ePrivacy** | Cookie e tracking | Cookie banner, consent |
| **CCPA/CPRA** | Dati personali California | Opt-out, do not sell |
| **DMA** | Digital Markets Act | Interoperabilità, scelta |

## 2. Consent Mode v2 di Google

```javascript
// Configurazione Consent Mode v2
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

// Stato iniziale: tutto negato fino al consenso
gtag('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'functionality_storage': 'granted',
    'security_storage': 'granted',
    'wait_for_update': 500
});

// Dopo il consenso dell\'utente
function onConsentGranted(preferences) {
    gtag('consent', 'update', {
        'analytics_storage': preferences.analytics ? 'granted' : 'denied',
        'ad_storage': preferences.marketing ? 'granted' : 'denied',
        'ad_user_data': preferences.marketing ? 'granted' : 'denied',
        'ad_personalization': preferences.marketing ? 'granted' : 'denied'
    });
}
```

## 3. Tracking Server-Side per rispettare la Privacy

```mermaid
graph LR
    A["Browser"] -->|first-party request| B["Tuo Server<br>(server-side GTM)"]
    B -->|dati anonimi| C["GA4"]
    B -->|con consenso| D["Meta CAPI"]
    B -->|log| E["Data Warehouse"]
```

```python
# Server-side tracking: pseudonimizzazione
import hashlib

def pseudonymize_user(user_id: str, salt: str) -> str:
    """Genera un ID pseudonimizzato per analytics senza consenso."""
    return hashlib.sha256(f"{user_id}{salt}".encode()).hexdigest()[:16]

def track_event(event: dict, consent: dict) -> dict:
    """Applica le regole di privacy prima del tracking."""
    clean_event = {
        "event_type": event["event_type"],
        "timestamp": event["timestamp"],
        "page_url": event["page_url"]
    }
    
    if consent.get("analytics"):
        clean_event["user_id"] = pseudonymize_user(event["user_id"], DAILY_SALT)
        clean_event["session_id"] = event["session_id"]
    
    if consent.get("marketing"):
        clean_event["user_id_raw"] = event["user_id"]
        clean_event["utm_source"] = event.get("utm_source")
    
    # MAI senza consenso:
    # - IP address completo
    # - Email in chiaro
    # - Device fingerprint dettagliato
    
    return clean_event
```

## 4. Impatto sui Dati e Soluzioni

| Problema | Impatto | Soluzione |
|:---|:---|:---|
| 30-40% utenti rifiuta i cookie | Dati incompleti | Modelling statistico (GA4 lo fa) |
| No cross-site tracking | Attribution rotta | Server-side tracking + CAPI |
| Diritto all\'oblio | Cancellare dati utente | Privacy-by-design nello schema |
| Cookie wall illegale | Rischio sanzioni | Offri alternativa senza cookie |

## 5. Checklist GDPR per Data Collection

- [ ] Cookie banner con opt-in granulare (analytics, marketing, funzionali)
- [ ] Consent Mode v2 implementato
- [ ] Privacy policy aggiornata con lista completa dei tool
- [ ] DPA firmato con ogni fornitore (Google, Meta, ecc.)
- [ ] Processo di data deletion implementato
- [ ] Data retention policy definita (es. 25 mesi per GA4)
- [ ] Server-side tracking valutato se opt-in rate <50%

## Risorse
- **Framework:** Consent Mode v2, Google Tag Manager Server-Side
- **Tool:** Cookiebot, iubenda, OneTrust per consent management
- **Normativa:** Garante della Privacy italiano, EDPB guidelines
''')

print(f"\n=== BATCH FINALE completato ===")
print("Tutti i 42 file placeholder sono stati riscritti con contenuto reale!")
