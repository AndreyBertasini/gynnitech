import { describe, expect, test } from "vitest";
import { checkLessonPipeline } from "../scripts/validation";

const SIX_SENTENCES =
    "Prima frase di contesto operativo. Seconda frase che approfondisce il problema reale. Terza frase con un dettaglio tecnico preciso. Quarta frase sul compromesso architetturale. Quinta frase sulla verifica dei dati. Sesta frase che chiude il ragionamento.";

const V2_VALID_BODY = [
    "## Il collo di bottiglia sulle window function",
    "",
    "> **Idea chiave:** La clausola `PARTITION BY` determina sia la correttezza della metrica sia il consumo di memoria dell'ordinamento su disco.",
    "",
    "Nel caso ricostruito di una piattaforma e-commerce da 120 mila ordini mensili nel 2025, una query senza partizione esplicita ha saturato la memoria temporanea.",
    SIX_SENTENCES,
    "",
    "## Come scorre il calcolo partizionato",
    "",
    SIX_SENTENCES,
    "",
    "```mermaid",
    "flowchart LR",
    "  A[Eventi grezzi] --> B[Partizione utente]",
    "  B --> C[Finestra ordinata]",
    "```",
    "",
    "| Strategia | Latenza p95 (ms) | Memoria (MB) | Esito |",
    "|---|---:|---:|---|",
    "| Senza partizione | 4200 | 1800 | Rischio OOM |",
    "| Partizione per user_id | 310 | 140 | Sostenibile |",
    "| Indice + frame ROWS | 145 | 64 | Ottimale |",
    "",
    "## Esempio numerico su 1.500 ordini giornalieri",
    "",
    "Su 1.500 ordini al giorno registrati da Acme Retail nel 2025, il valore medio passa da 40 euro a 46 euro con una crescita del 15%.",
    SIX_SENTENCES,
    "",
    "## Scelta del frame e controlli operativi",
    "",
    SIX_SENTENCES,
    "",
    "1. Verifica la granularità della chiave prima della `PARTITION BY`.",
    "2. Misura il piano di esecuzione con `EXPLAIN ANALYZE`.",
    "3. Preferisci `ROWS BETWEEN` quando i timestamp possono avere duplicati.",
    "",
    "```sql",
    "-- Calcola il totale cumulativo per utente con frame esplicito",
    "SELECT user_id, order_date, SUM(amount) OVER (",
    "  PARTITION BY user_id ORDER BY order_date",
    "  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
    ") AS running_total",
    "FROM orders;",
    "```",
    "",
    "## Verifica pratica",
    "",
    "1. Perché `RANGE` può produrre valori identici su timestamp duplicati?",
    "",
    "<details>",
    "<summary>Mostra risposta</summary>",
    "",
    "Perché `RANGE` raggruppa tutte le righe con lo stesso valore nella colonna di ordinamento, includendole nello stesso frame.",
    "",
    "</details>",
    "",
    "2. Quale metrica osservi per capire se il sort sta andando su disco?",
    "",
    "<details>",
    "<summary>Mostra risposta</summary>",
    "",
    "Controlli i byte letti/scritti nei file temporanei o il nodo `Sort Method: external merge` nel piano di esecuzione.",
    "",
    "</details>",
    "",
    "3. Quando conviene materializzare una tabella intermedia invece di ricalcolare la window function?",
    "",
    "<details>",
    "<summary>Mostra risposta</summary>",
    "",
    "Quando la stessa finestra viene letta da più dashboard giornaliere e i dati storici non cambiano.",
    "",
    "</details>",
    "",
    "4. Che effetto ha una cardinalità molto alta sulla chiave di `PARTITION BY`?",
    "",
    "<details>",
    "<summary>Mostra risposta</summary>",
    "",
    "Distribuisce i gruppi su più chiavi riducendo la dimensione di ciascuna finestra in memoria, purché l'hash di partizione non frammenti troppo i batch.",
    "",
    "</details>",
].join("\n");

function ruleMap(body: string, binario: unknown = "ml-tabellare", formato?: unknown) {
    return Object.fromEntries(checkLessonPipeline(body, binario, formato).map((r) => [r.regola, r]));
}

describe("checkLessonPipeline — formato didattica-v2", () => {
    test("tutte e 6 le regole passano su una lezione didattica-v2 completa anche con sezioni >= 6 frasi", () => {
        const results = checkLessonPipeline(V2_VALID_BODY, "ml-tabellare", "didattica-v2");
        expect(results).toHaveLength(6);
        for (const rule of results) {
            expect(rule.esito, `Regola fallita: ${rule.regola} (${rule.nota})`).toBe("PASS");
        }
    });

    test("regola 1 accetta tesi isolata in grassetto + blocco codice commentato senza elenco o tabella", () => {
        const bodySoloTesiECodice = [
            "## Apertura operativa",
            "",
            "**Ogni finestra senza partizione forza un ordinamento globale in memoria.**",
            "",
            SIX_SENTENCES,
            "",
            "## Applicazione su ClickHouse",
            "",
            "Nel 2025 il team DataOps ha testato 500 mila righe di log.",
            SIX_SENTENCES,
            "",
            "```sql",
            "-- Partiziona per tenant prima di ordinare gli eventi",
            "SELECT tenant_id, count() FROM events GROUP BY tenant_id;",
            "```",
            "",
            "## Controllo finale",
            "",
            "1. Che cosa ordina la clausola OVER?",
            "2. Quando serve PARTITION BY?",
            "3. Come misuri lo spill su disco?",
        ].join("\n");

        const rules = ruleMap(bodySoloTesiECodice, "ml-tabellare", "didattica-v2");
        expect(rules.regola_1_concetto_calcolo.esito).toBe("PASS");
    });

    test("regola 1 fallisce in didattica-v2 se manca l'idea chiave o tesi in grassetto", () => {
        const withoutKeyIdea = V2_VALID_BODY.replace(
            "> **Idea chiave:** La clausola `PARTITION BY` determina sia la correttezza della metrica sia il consumo di memoria dell'ordinamento su disco.",
            "La clausola PARTITION BY determina la correttezza della metrica e il consumo di memoria.",
        );
        const rules = ruleMap(withoutKeyIdea, "ml-tabellare", "didattica-v2");
        expect(rules.regola_1_concetto_calcolo.esito).toBe("FAIL");
    });

    test("regola 1 fallisce in didattica-v2 se mancano passaggi strutturati (niente elenco, tabella o codice commentato)", () => {
        const proseOnlyV2 = [
            "## Modello mentale",
            "",
            "> **Idea chiave:** Misura sempre il costo prima di cambiare indice.",
            "",
            SIX_SENTENCES,
            "",
            "## Caso su dati reali",
            "",
            "Nel 2025 Acme ha analizzato 120 mila ordini mensili riducendo i tempi del 30%.",
            SIX_SENTENCES,
            "",
            "```sql",
            "SELECT 1;",
            "```",
            "",
            "## Verifica",
            "",
            "Prima domanda senza elenco?",
            "Seconda domanda senza elenco?",
        ].join("\n");

        const rules = ruleMap(proseOnlyV2, "ml-tabellare", "didattica-v2");
        expect(rules.regola_1_concetto_calcolo.esito).toBe("FAIL");
    });

    test("nessuna regressione su formato legacy (undefined) e articolo", () => {
        // Il body V2 ha tutte sezioni >= 6 frasi, quindi in modalità legacy deve fallire regola_1
        expect(ruleMap(V2_VALID_BODY, "ml-tabellare", undefined).regola_1_concetto_calcolo.esito).toBe("FAIL");

        // Un testo legacy classico (sezione definizione <= 4 frasi + sezione con passi) continua a passare
        const legacyBody = [
            "## Definizione del concetto",
            "",
            "Una metrica di coorte misura il comportamento di un gruppo nel tempo.",
            "",
            "## Passi di calcolo",
            "",
            "1. Raggruppa gli utenti per mese di acquisizione.",
            "2. Calcola gli utenti attivi nei mesi successivi.",
            "",
            "## Caso reale 2025",
            "",
            "Nel 2025 ShopItalia ha analizzato 40 mila utenti registrando una retention del 28%.",
            "",
            "## Verifica",
            "",
            "1. Che cos'è una coorte?",
            "2. Come si calcola la retention al mese 3?",
            "3. Perché non bisogna mescolare coorti diverse?",
        ].join("\n");
        expect(ruleMap(legacyBody, "ml-tabellare").regola_1_concetto_calcolo.esito).toBe("PASS");

        // Formato articolo continua a richiedere riga in grassetto + elenco numerato
        const articoloBody = [
            "## Il caso",
            "",
            SIX_SENTENCES,
            "",
            "**Ogni insert crea una nuova parte su disco.**",
            "",
            "## Criteri operativi",
            "",
            "1. Controlla la granularità dei batch.",
            "2. Evita insert riga per riga.",
            "",
            "## Esempio 2025",
            "",
            "Nel 2025 LogPlatform ha ridotto le parti del 70% su 10 milioni di eventi.",
            "",
            "## Checklist",
            "",
            "1. Quante parti al secondo vengono create?",
            "2. Il batch supera mille righe?",
            "3. I merge restano sotto soglia?",
        ].join("\n");
        expect(ruleMap(articoloBody, "ml-tabellare", "articolo").regola_1_concetto_calcolo.esito).toBe("PASS");
        expect(
            ruleMap(
                articoloBody.replace("**Ogni insert crea una nuova parte su disco.**", "Testo normale."),
                "ml-tabellare",
                "articolo",
            ).regola_1_concetto_calcolo.esito,
        ).toBe("FAIL");
    });
});
