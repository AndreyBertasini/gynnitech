# Configurazione Notion per GinnyTech

Segui questi passaggi per collegare Notion al sito Astro.

## 1. Creare un'Integrazione Notion

1. Vai su [Notion My Integrations](https://www.notion.so/my-integrations).
2. Clicca su **"New integration"**.
3. Nome: `GinnyTech Sync`.
4. Workspace: Seleziona il tuo workspace.
5. Capabilities: Assicurati che "Read content" sia abilitato.
6. Clicca "Submit" e copia il **"Internal Integration Secret"** (inizia con `secret_`).
   - Salvalo come `NOTION_TOKEN` nel file `.env`.

## 2. Configurare il Database

Crea un nuovo Database in Notion (Full page) con le seguenti proprietà (rispetta maiuscole/minuscole):

| Proprietà | Tipo | Opzioni (Select/Status) |
| :--- | :--- | :--- |
| **Name** | Title | - |
| **Slug** | Text | Es: `my-post` (senza spazi) |
| **Type** | Select | `Blog`, `Course`, `Page` |
| **Status** | Status | `Published`, `Draft`, `Scheduled` |
| **Date** | Date | - |
| **Summary** | Text | Descrizione breve per SEO |
| **Category** | Select | Es: `Analytics`, `Engineering` |
| **Tags** | Multi-select | Es: `python`, `dbt` |
| **Author** | Person | (Opzionale) |
| **Image** | Files & Media | Immagine di copertina |
| **MenuVisibility** | Checkbox | Seleziona se vuoi che appaia nel menu |
| **Order** | Number | Ordine nel menu (1, 2, 3...) |

### Collegare l'Integrazione
1. Apri il database appena creato.
2. Clicca sui tre puntini `...` in alto a destra -> `Connect to` -> Seleziona `GinnyTech Sync`.

### Ottenere il Database ID
1. Copia l'URL del database.
2. L'ID è la parte di 32 caratteri tra lo slash `/` e il punto interrogativo `?`.
   - Esempio: `https://www.notion.so/myworkspace/a8aec43384f447ed84390e8e42c2e089?v=...`
   - ID: `a8aec43384f447ed84390e8e42c2e089`
3. Salvalo come `NOTION_DATABASE_ID` nel file `.env`.

## 3. GitHub Actions (Automazione)

Per abilitare il sync automatico su GitHub:

1. Vai nel tuo repository GitHub -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Aggiungi due "New repository secret":
   - `NOTION_TOKEN`: (Il tuo secret key)
   - `NOTION_DATABASE_ID`: (Il tuo database ID)
3. Il sync girerà automaticamente ogni ora. Puoi anche lanciarlo manualmente dalla tab **Actions**.

## 4. Eseguire in Locale

Per testare il sync sul tuo computer:

```bash
# Assicurati di aver configurato il file .env
npm run sync
```
