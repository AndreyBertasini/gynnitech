# GinnyTech Sync System Guide

Questo documento descrive il funzionamento del sistema di sincronizzazione bidirezionale tra **GitHub** (Astro) e **Notion**.

## 🔄 Flusso di Lavoro

### 1. Notion -> GitHub (Download)
*   **Quando:** Ogni giorno alle 06:00 UTC (Automatico) o su richiesta manuale.
*   **Cosa fa:** 
    1. Scarica tutte le pagine con stato `Published` dal database Notion.
    2. Converte il contenuto in file `.mdx` dentro `src/content/`.
    3. Aggiorna `src/data/sidebar-generated.json` per il menu laterale.
    4. Esegue un Commit automatico sul repository GitHub.
*   **Trigger Manuale:** Vai su GitHub -> Actions -> "Notion to GitHub Sync" -> "Run workflow".

### 2. GitHub -> Notion (Upload)
*   **Quando:** Ogni volta che fai un `git push` sul branch `main` modificando file `.mdx`.
*   **Cosa fa:**
    1. Legge i file `.mdx` modificati.
    2. Cerca la pagina corrispondente su Notion (tramite Slug).
    3. Se esiste: Aggiorna i metadati (inclusa la **Live URL**).
    4. Se non esiste: Crea una nuova pagina su Notion.
    5. **Nota:** Attualmente l'upload del contenuto (body) avviene solo alla creazione o su richiesta esplicita, per evitare di sovrascrivere formattazioni complesse su Notion.

## 🛠 Configurazione

### Segreti GitHub
Per far funzionare le Actions, devi impostare i seguenti *Repository Secrets* su GitHub:
*   `NOTION_TOKEN`: Il token del tuo bot Notion (inizia con `secret_...`).
*   `NOTION_DATABASE_ID`: L'ID del database Notion.

### File Chiave
*   `scripts/sync.ts`: Logica di download (Notion -> Astro).
*   `scripts/push.ts`: Logica di upload (Astro -> Notion).
*   `.github/workflows/*.yml`: Configurazioni di automazione.

## ⚠️ Gestione Conflitti

Il sistema usa una strategia **"Last Write Wins"** (L'ultima modifica vince), ma con protezioni:
1.  **Loop Prevention:** I commit automatici del bot contengono `[skip ci]` per evitare che un download da Notion scateni un upload verso Notion in un ciclo infinito.
2.  **Best Practice:** 
    *   Usa Notion per l'editing dei contenuti testuali.
    *   Usa VS Code/GitHub per modifiche strutturali, componenti React o refactoring massivi.
    *   Se modifichi entrambi contemporaneamente, la sync delle 06:00 darà priorità a Notion.

## 🆘 Troubleshooting

### Errore "Invalid request URL"
Verifica che l'ID del database sia corretto e formattato con i trattini (UUID). Lo script prova a correggerlo automaticamente, ma assicurati che il segreto GitHub sia pulito.

### Pagine non visibili sul sito
1.  Controlla che lo `Status` su Notion sia **Published**.
2.  Verifica che lo `Slug` sia univoco.
3.  Controlla i log della Action "Notion to GitHub Sync".

### Pagine non aggiornate su Notion
1.  Hai pushato sul branch `main`?
2.  La Action "GitHub to Notion Sync" è partita? Controlla il tab Actions su GitHub.
