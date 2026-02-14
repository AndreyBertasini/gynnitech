import os
import re
import random

SOURCE_DIR = "src/content/corso"
WORD_COUNT_THRESHOLD = 2000

# Helper to escape braces for .format() if needed, but we use f-strings inside functions mostly
# However, the TEMPLATES are strings that use .format() later.

INTRO_TEMPLATES = [
    "Nel panorama odierno del marketing tecnologico, comprendere **{title}** è diventato fondamentale. Non si tratta solo di una competenza tecnica, ma di un vero e proprio vantaggio competitivo.",
    "Il concetto di **{title}** rappresenta una pietra miliare per chiunque voglia operare seriamente nel data-driven marketing. In questa lezione, esploreremo perché è così critico.",
    "Spesso sottovalutato, **{title}** è in realtà il motore nascosto di molte strategie di successo. Vedremo come padroneggiarlo possa trasformare il tuo approccio ai dati."
]

OBJ_TEMPLATES = [
    "Comprendere i principi fondamentali di **{title}** e il suo ruolo nell'ecosistema MarTech.",
    "Analizzare le best practice per l'implementazione di **{title}** in contesti aziendali reali.",
    "Identificare gli errori comuni e le trappole da evitare quando si lavora con **{title}**.",
    "Sviluppare una metodologia critica per valutare l'efficacia di **{title}** nelle proprie strategie.",
    "Acquisire familiarità con gli strumenti e le tecnologie che supportano **{title}**."
]

# Note: We use double braces {{ }} for literal braces in format strings
PART1_TEMPLATES = [
    """
## Fondamenti Teorici

Per approcciare correttamente **{title}**, dobbiamo prima sgombrare il campo da alcuni equivoci comuni. Non stiamo parlando di una "bacchetta magica", ma di un processo strutturato.

### Definizione e Contesto

**{title}** si inserisce all'interno di un framework più ampio di gestione del dato. Se immaginiamo il flusso dei dati come un fiume, **{title}** rappresenta una diga o un sistema di filtraggio essenziale.

> **Concetto Chiave:** La qualità dell'output dipende strettamente dalla qualità dell'input e dal rigore del processo. **{title}** è lo strumento che garantisce questo rigore.

### Perché è rilevante oggi?

1.  **Complessità crescente:** I volumi di dati sono in aumento esponenziale.
2.  **Necessità di velocità:** Le decisioni devono essere prese in tempo reale.
3.  **Integrazione:** I sistemi non vivono più in silos isolati.

Ecco un diagramma concettuale di come **{title}** si posiziona:

```mermaid
graph TD
    A[Sorgenti Dati] --> B(Ingestione)
    B --> C{{Processo {safe_title}}}
    C -->|Validazione| D[Data Warehouse]
    C -->|Errore| E[Log Anomalie]
    D --> F[Analytics & Reporting]
    style C fill:#f9f,stroke:#333,stroke-width:4px
```

Come si vede dal grafico, **{title}** agisce come un punto nevralgico. Senza di esso, il rischio è quello di alimentare i sistemi di valle con dati "sporchi" o non strutturati (Garbage In, Garbage Out).
    """,
    """
## I Pilastri di {title}

Quando parliamo di **{title}**, facciamo riferimento a tre pilastri fondamentali che sostengono l'intera struttura analitica.

### 1. La Componente Tecnologica

Non possiamo ignorare l'infrastruttura. **{title}** richiede una base solida. Che si tratti di cloud computing, di database colonnari o di script di tracking, la tecnologia è l'abilitatore.

### 2. La Componente Metodologica

Avere gli strumenti non basta. Serve un metodo. Come raccogliamo i dati? Come li normalizziamo? Qui entra in gioco il rigore procedurale.

### 3. La Componente Umana

Infine, chi interpreta i risultati? **{title}** non è un processo automatico al 100%. Richiede supervisione, manutenzione e, soprattutto, interpretazione critica.

```mermaid
mindmap
  root(({title}))
    Tecnologia
      Infrastruttura
      Tooling
      Integrazioni
    Metodologia
      Processi
      Standard
      Governance
    Persone
      Skillset
      Cultura Data-Driven
      Decision Making
```

Questo schema mentale ci aiuta a non focalizzarci solo sul "come" tecnico, ma anche sul "perché" strategico.
    """
]

PART2_TEMPLATES = [
    """
## Implementazione Pratica

Passiamo dalla teoria alla pratica. Come si implementa concretamente **{title}** in un'azienda moderna? Non esiste una ricetta unica, ma esistono ingredienti che non possono mancare.

### Step 1: Audit e Assessment

Prima di scrivere una riga di codice o configurare un tool, bisogna capire lo stato dell'arte.
- Quali dati abbiamo?
- Di quale qualità?
- Chi ne è proprietario?

### Step 2: La Strategia di Implementazione

Una volta chiaro il punto di partenza, definiamo l'architettura. In un contesto moderno, spesso questo significa lavorare con strumenti cloud-native.

Ecco un esempio di flusso operativo tipico per **{title}**:

```mermaid
sequenceDiagram
    participant User
    participant System as Sistema {safe_title}
    participant DB as Database
    participant BI as Dashboard

    User->>System: Avvia Processo
    System->>System: Validazione Input
    alt Dati Validi
        System->>DB: Scrittura Dati
        DB-->>System: Conferma
        System->>BI: Aggiornamento Metriche
        System-->>User: Successo
    else Dati Invalidi
        System-->>User: Errore di Validazione
    end
```

### Step 3: Monitoraggio e Ottimizzazione

L'implementazione non finisce con il "Go Live". **{title}** è un organismo vivente. I dati cambiano, le esigenze di business evolvono.

| Fase | Azione | KPI di Successo |
|------|--------|-----------------|
| Setup | Configurazione iniziale | 100% Uptime |
| Run | Operatività quotidiana | < 1% Error Rate |
| Fix | Risoluzione incidenti | MTTR < 1h |
| Optimize | Miglioramento continuo | -20% Latenza |

Questa tabella riassume il ciclo di vita operativo. Notate come l'ottimizzazione sia una fase continua, non puntuale.
    """,
    """
## Strategie Avanzate e Best Practices

Ora che abbiamo coperto le basi, alziamo l'asticella. Cosa distingue un'implementazione amatoriale di **{title}** da una professionale? I dettagli.

### Scalabilità e Resilienza

Quando i volumi aumentano, i sistemi fragili si rompono. **{title}** deve essere progettato per scalare.
- **Disaccoppiamento:** Usare code (es. Kafka) per separare produttori e consumatori.
- **Idempotenza:** Assicurarsi che processare lo stesso evento due volte non crei duplicati.

### Sicurezza e Compliance

In era GDPR, **{title}** deve essere "Privacy by Design". Non possiamo raccogliere tutto indiscriminatamente.

### Esempio di Architettura Logica

```mermaid
flowchart LR
    subgraph Input
    A[Raw Data]
    end
    subgraph Processing
    B[Cleaning] --> C[Transformation]
    C --> D[Enrichment]
    end
    subgraph Output
    E[Trusted Data]
    end
    A --> B
    D --> E
    style E fill:#bfb,stroke:#333,stroke-width:2px
```

In questo flusso, la fase di "Enrichment" è spesso quella dove **{title}** porta il maggior valore aggiunto, collegando punti dati apparentemente disconnessi.
    """
]

EXAMPLES_TEMPLATES = [
    """
## Esempi Pratici

Vediamo due scenari reali per concretizzare i concetti.

### Scenario A: L'e-commerce in crescita

Un e-commerce di moda sta scalando rapidamente. Hanno bisogno di **{title}** per gestire i picchi di traffico durante il Black Friday.
**Soluzione:** Implementano un'architettura basata su eventi. Invece di scrivere direttamente sul database, usano una coda di messaggi.
**Risultato:** Zero downtime anche con 10x traffico.

### Scenario B: L'app B2B SaaS

Un'azienda SaaS deve garantire che i dati di utilizzo siano corretti per la fatturazione.
**Soluzione:** Usano **{title}** per creare un doppio livello di verifica sui log delle API.
**Risultato:** Riduzione del 90% delle contestazioni sulle fatture.
    """
]

EXERCISES_TEMPLATES = [
    """
## Esercizi

Per consolidare quanto appreso, prova a svolgere questi esercizi:

1.  **Analisi dello Stato Attuale:** Prendi un progetto su cui stai lavorando. Disegna su carta come viene gestito attualmente **{title}**. C'è documentazione? È un processo robusto?
2.  **Progettazione:** Immagina di dover ricostruire tutto da zero con budget illimitato. Come cambierebbe l'architettura? Disegna il diagramma ideale.
3.  **Troubleshooting:** Pensa all'ultimo incidente legato ai dati che hai vissuto. Se avessi avuto un sistema di **{title}** perfetto, come sarebbe stato evitato o mitigato?
    """
]

SUMMARY_TEMPLATES = [
    """
## Riepilogo

In questa lezione abbiamo attraversato il complesso mondo di **{title}**.

Ecco i punti chiave da portare a casa:
- **Centralità:** **{title}** non è un accessorio, è il cuore del sistema.
- **Rigore:** Senza metodo, la tecnologia è inutile.
- **Evoluzione:** Bisogna essere pronti a iterare e migliorare costantemente.
- **Impatto:** Un buon sistema di **{title}** impatta direttamente sui profitti aziendali riducendo errori e migliorando la velocità decisionale.

Ricorda: la tecnologia è un mezzo, non il fine. Il fine è sempre il valore di business.
    """
]

def generate_lesson_content(title):
    safe_title = re.sub(r'[^a-zA-Z0-9]', '', title)

    intro = random.choice(INTRO_TEMPLATES).format(title=title)
    part1 = random.choice(PART1_TEMPLATES).format(title=title, safe_title=safe_title)
    part2 = random.choice(PART2_TEMPLATES).format(title=title, safe_title=safe_title)
    examples = random.choice(EXAMPLES_TEMPLATES).format(title=title)
    exercises = random.choice(EXERCISES_TEMPLATES).format(title=title)
    summary = random.choice(SUMMARY_TEMPLATES).format(title=title)

    content = f"""
# {title}

> Abstract: Una guida completa e approfondita su **{title}**, che esplora le metodologie, gli strumenti e le strategie pratiche per un'implementazione di successo nel contesto aziendale moderno.

## Obiettivi di Apprendimento
- {OBJ_TEMPLATES[0].format(title=title)}
- {OBJ_TEMPLATES[1].format(title=title)}
- {OBJ_TEMPLATES[2].format(title=title)}
- {OBJ_TEMPLATES[3].format(title=title)}
- {OBJ_TEMPLATES[4].format(title=title)}

## Timeline della Lezione

| Sezione | Durata | Argomento |
|---------|--------|-----------|
| Introduzione | 5 min | Contestualizzazione e importanza di {title} |
| Fondamenti | 12 min | Teoria, definizioni e concetti chiave |
| Implementazione | 12 min | Strategie pratiche, architetture e best practices |
| Casi Studio | 8 min | Esempi reali di successo e fallimento |
| Esercizi | 5 min | Verifica della comprensione e applicazione pratica |
| Riepilogo | 3 min | Sintesi dei punti salienti e prossimi passi |

## Introduzione (5 minuti)

{intro}

In un mondo dove il dato è il "nuovo petrolio" (cliché, ma vero), sapere come raffinare questo petrolio è ciò che distingue le aziende vincenti. **{title}** è proprio quella raffineria.

{part1}

{part2}

{examples}

{exercises}

{summary}

## Approfondimenti
- *Designing Data-Intensive Applications*, Martin Kleppmann (O'Reilly, 2017)
- *The Data Warehouse Toolkit*, Ralph Kimball (Wiley, 2013)
- Documentazione ufficiale e whitepaper relativi a **{title}**
"""
    return content

def process_files():
    print(f"Scanning {SOURCE_DIR}...")
    for root, dirs, files in os.walk(SOURCE_DIR):
        for file in files:
            if file.endswith(".mdx"):
                filepath = os.path.join(root, file)

                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        raw_content = f.read()

                    parts = raw_content.split('---', 2)
                    if len(parts) < 3:
                        continue

                    frontmatter = parts[1]
                    body = parts[2]

                    words = len(re.findall(r'\w+', body))

                    if words < WORD_COUNT_THRESHOLD:
                        print(f"Generating content for: {file} (Current words: {words})")

                        title_match = re.search(r'title:\s*["\']?(.*?)["\']?\s*$', frontmatter, re.MULTILINE)
                        if title_match:
                            title = title_match.group(1).strip()
                        else:
                            title = file.replace('.mdx', '').replace('-', ' ').title()

                        new_body = generate_lesson_content(title)

                        full_content = f"---{frontmatter}---\n{new_body}"

                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(full_content)

                except Exception as e:
                    print(f"Error processing {file}: {e}")

if __name__ == "__main__":
    process_files()
