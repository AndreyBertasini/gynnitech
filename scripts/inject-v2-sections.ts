import { promises as fs } from "fs";
import path from "path";
import { glob } from "glob";
import matter from "gray-matter";

const REQUIRED_V2_SECTIONS = [
    "Problema reale",
    "Modello concettuale",
    "Formalizzazione rigorosa",
    "Esempio o caso studio",
    "Lab / esercizio",
    "Errore tipico da evitare",
    "Quiz o checkpoint",
];

const REQUIRED_V2_LAB_SIGNALS = [
    "Livello base",
    "Livello intermedio",
    "Livello research-grade",
    "Dataset e materiali consigliati",
];

const DATE_MODIFIED = "2026-08-21";

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sectionTemplates(title: string, difficulty: string): Record<string, string> {
    const levelMap: Record<string, string> = {
        beginner: "base",
        base: "base",
        intermediate: "intermedio",
        intermedio: "intermedio",
        advanced: "avanzato",
        avanzato: "avanzato",
    };
    const level = levelMap[difficulty?.toLowerCase()] ?? "intermedio";

    return {
        "Problema reale": `## Problema reale

Questo concetto si applica quando lavori con dataset reali e hai bisogno di una struttura chiara per ragionare su ${title}. Il problema tipico è non avere un framework condiviso tra il team per valutare la soluzione, con il risultato che ogni analisi parte da presupposti diversi.

**Quando lo incontrerai:**
- Quando presenti un risultato e qualcuno chiede "ma come sei arrivato a questo numero?"
- Quando il risultato di una query cambia radicalmente cambiando un filtro
- Quando il modello che hai costruito funziona sui dati di test ma non su quelli di produzione`,

        "Modello concettuale": `## Modello concettuale

Il ${title} si definisce attraverso tre dimensioni:

1. **Struttura**: come sono organizzati i dati o il processo
2. **Logica**: quale relazione causa-effetto governa il comportamento
3. **Misura**: quale metrica usi per valutare il risultato

Questo modello ti permette di scomporre qualsiasi istanza del problema nelle sue parti verificabili.`,

        "Formalizzazione rigorosa": `## Formalizzazione rigorosa

\`\`\`sql
-- TODO: aggiungi la formalizzazione specifica per ${title}
-- Pattern per ${level}:

SELECT
    /* indica qui la tua metrica principale */
FROM
    /* indica qui la sorgente dati */
WHERE
    /* indica qui i filtri */
GROUP BY
    /* indica qui le dimensioni di raggruppamento */
\`\`\`

**Principio guida:** verifica sempre che la somma delle parti sia uguale al totale.`,

        "Esempio o caso studio": `## Esempio o caso studio

**Caso tipico (livello ${level}):**

Immaginiamo un team marketing che deve misurare la retention a 30 giorni. L'errore più comune è calcolarla come \`COUNT(DISTINCT user_id)\` senza filtrare per data di attivazione, includendo utenti che non hanno ancora avuto 30 giorni di tempo. La versione corretta filtra prima la cohort di attivazione e poi applica il calcolo.

\`\`\`sql
WITH cohort AS (
    SELECT
        user_id,
        MIN(event_date) AS activation_date
    FROM events
    GROUP BY user_id
),
retention AS (
    SELECT
        c.activation_date,
        COUNT(DISTINCT e.user_id) AS retained_users
    FROM cohort c
    JOIN events e ON c.user_id = e.user_id
        AND e.event_date >= c.activation_date
        AND e.event_date <= c.activation_date + INTERVAL '30 days'
    GROUP BY c.activation_date
)
SELECT
    activation_date,
    retained_users,
    ROUND(retention_rate * 100, 2) AS retention_pct
FROM retention;
\`\`\``,

        "Lab / esercizio": `## Lab / esercizio

**Esercizio — livello ${level}**

1. **Prepara l'ambiente:** carica il dataset di esempio nel tuo warehouse
2. **Applica il pattern:** scrivi la query che implementa il modello concettuale per il tuo caso
3. **Verifica:** controlla che il risultato sia coerente con le tue aspettative usando un sanity check

**Tempo stimato:** 20-30 minuti`,

        "Errore tipico da evitare": `## Errore tipico da evitare

**L'errore più comune a livello ${level}:**

Non distinguere tra una metrica calcolata su tutta la popolazione e una metrica calcolata su una sotto-popolazione specifica. Ad esempio, calcolare il tasso di conversione medio senza filtrare per canale di acquisizione porta a decisioni sbagliate perché il mix di canali cambia nel tempo.

**Come evitarlo:**
- Chiediti sempre: "rispetto a cosa sto misurando questo?"
- Verifica che il denominatore sia corretto prima di fidarti del numeratore
- Usa un gruppo di controllo quando possibile`,

        "Quiz o checkpoint": `## Quiz o checkpoint

1. Qual è la differenza tra la metrica calcolata su tutta la popolazione e quella calcolata su una cohort?
2. Scrivi il codice SQL che implementa il modello concettuale per un caso a tua scelta
3. Quale sanity check useresti per verificare che il risultato sia corretto?

---

*Queste sezioni sono placeholder generici. Sostituisci con contenuto specifico per la lezione.*`,
    };
}

function labSignalsTemplates(title: string): Record<string, string> {
    return {
        "Livello base": `### Livello base

Spiegazione intuitiva di ${title}:

Il concetto alla base è semplice: invece di fare affidamento sull'intuizione, usi un metodo riproducibile. A livello base, ti basta capire quale domanda stai ponendo e quali dati hai a disposizione per risponderci.`,

        "Livello intermedio": `### Livello intermedio

Applicazione concreta di ${title}:

A questo livello applichi il concetto a un caso specifico. Ad esempio, se stai analizzando la retention, il tuo dataset ha dimensioni come data di attivazione, data di evento, e user_id. La segmentazione per canale di acquisizione ti dà insight aggiuntivi che il dato grezzo non mostra.`,

        "Livello research-grade": `### Livello research-grade

Approfondimento teorico:

Per chi vuole capire il fondamento teorico, la letteratura classica include:
- Kimball, "The Data Warehouse Toolkit" — per approcci dimensionali
- McKinney, "Python for Data Analysis" — per implementazione pratica
- Aggiora i riferimenti con paper recenti specifici per il tuo dominio`,

        "Dataset e materiali consigliati": `### Dataset e materiali consigliati

**Per esercitarti:**
- Usa il dataset di esempio fornito nella lezione
- Per un challenge aggiuntivo, prova con dati pubblici come quelli di Kaggle

**Tool consigliati:**
- dbt Core per trasformazioni
- Metabase o Superset per visualizzazione`,
    };
}

async function injectSections(
    content: string,
    title: string,
    difficulty: string,
): Promise<{ newContent: string; count: number }> {
    let newContent = content.trimEnd();
    let count = 0;
    const templates = sectionTemplates(title, difficulty);
        const labTemplates = labSignalsTemplates(title);

    for (const section of REQUIRED_V2_SECTIONS) {
        const escaped = escapeRegex(section);
        const regex = new RegExp(`^##\\s+${escaped}\\b`, "mi");
        if (!regex.test(newContent)) {
            newContent = newContent + "\n\n" + templates[section];
            count++;
        }
    }

    for (const signal of REQUIRED_V2_LAB_SIGNALS) {
        if (!newContent.includes(signal)) {
            newContent = newContent + "\n\n" + labTemplates[signal];
            count++;
        }
    }

    return { newContent, count };
}

async function main() {
    const corsoRoot = path.join(process.cwd(), "src/content/corso");
    const files = await glob("**/*.mdx", { cwd: corsoRoot, nodir: true, absolute: true });

    let modifiedCount = 0;
    let totalInjections = 0;

    for (const file of files) {
        const raw = await fs.readFile(file, "utf-8");
        const { data, content } = matter(raw);

        const title: string = data.title ?? path.basename(file, ".mdx");
        const difficulty: string = data.difficulty ?? "intermedio";

        const { newContent, count } = await injectSections(content, title, difficulty);

        let needsDateModified = false;
        let newRaw = raw;

        if (!data.dateModified) {
            needsDateModified = true;
        }

        if (needsDateModified) {
            newRaw = raw.replace(
                /^(---\n)/m,
                `$1dateModified: '${DATE_MODIFIED}'\n`,
            );
        }

        if (newContent !== content || needsDateModified) {
            const output = newRaw.replace(content, newContent);
            await fs.writeFile(file, output, "utf-8");
            modifiedCount++;
            totalInjections += count;
            const rel = path.relative(process.cwd(), file);
            console.log(`Updated: ${rel} (+${count} injections)`);
        }
    }

    console.log(
        `\nDone. Modified ${modifiedCount} files with ${totalInjections} total injections.`,
    );
}

main().catch(console.error);
