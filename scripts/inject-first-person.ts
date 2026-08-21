import { promises as fs } from "fs";
import matter from "gray-matter";
import path from "path";

const INTROS: Record<string, string> = {
    "growth-engineering-ipotesi-buone": "Nel mio lavoro di growth engineer ho visto troppi team bruciare settimane su idee vaghe. La differenza tra chi impara e chi gira a vuoto non è il talento: è la capacità di trasformare un'intuizione in un'ipotesi che si può verificare. Ecco il metodo che uso e che insegno nel corso.",
    "growth-engineering-randomizzazione": "Quando ho iniziato a lavorare con gli esperimenti, pensavo che la parte difficile fosse scegliere la metrica. Ho scoperto che è la randomizzazione a decidere se un test vale qualcosa. In questo articolo condivido quello che ho imparato verificando la qualità dei sistemi di assegnazione.",
    "growth-engineering-triggering-test": "Uno degli errori che ho visto più spesso nei team di growth è misurare utenti che non potevano essere esposti al trattamento. Il triggering è la parte che sembra noiosa ma che decide se il risultato è reale. Ecco come lo imposto nei progetti a cui lavoro.",
    "esperimenti-prodotti-agentici": "Quando ho iniziato a testare agenti AI, ho capito subito che le metriche classiche non bastavano: più interazioni non significano più valore. Ho dovuto ripensare l'intero approccio alla sperimentazione. In questo articolo condivido il framework che uso oggi.",
    "agenti-ai-non-sono-chatbot": "Nel mio lavoro con prodotti AI ho visto molti team trattare gli agenti come chatbot più furbi, e fallire. La differenza è strutturale: un agente ha obiettivi, strumenti e memoria. Ecco come distinguo i due casi e perché la distinzione cambia tutto.",
    "growth-engineering-agenti-workflow": "Ho imparato a mie spese che un agente AI lasciato libero in una chat produce risultati imprevedibili. Quando ho iniziato a progettare workflow con input, passi e punti di verifica, tutto è cambiato. Questo articolo raccoglie quella lezione.",
    "valutare-output-agenti-ai": "Valutare un agente AI non è come valutare un modello: serve capire se l'output è corretto, utile e sicuro. Nel mio lavoro ho costruito sistemi di valutazione che misurano queste tre dimensioni. Ecco il metodo che uso.",
    "rag-growth-engineering-agenti-ai": "Quando ho integrato RAG nei sistemi di growth, ho scoperto che il problema non era generare risposte brillanti, ma dare agli agenti fonti affidabili. Senza fonti verificate, il RAG produce output più persuasivi ma meno accurati. Ecco come lo affronto.",
    "growth-engineering-osservabilita-prodotto": "Senza osservabilità, non puoi distinguere tra 'le cose funzionano' e 'le cose sembrano funzionare'. Nel mio lavoro ho visto team prendere decisioni su dati che non potevano verificare. Questo articolo spiega come costruire l'osservabilità che serve al growth.",
    "growth-engineering-pipeline-dati-growth": "Ho lavorato su pipeline dati per il growth in contesti molto diversi, e il problema è sempre lo stesso: dati sporchi che producono metriche che mentono. Ecco come costruisco pipeline che portano dal click alla decisione senza perdere la qualità.",
    "growth-engineering-dashboard-che-decidono": "La maggior parte delle dashboard che ho visto non vengono usate perché mostrano numeri senza dire cosa fare. Nel mio lavoro ho imparato a progettare dashboard che partono dalla decisione, non dalla metrica. Ecco il principio che guida il mio approccio.",
    "growth-engineering-eventi-che-contano": "Quando ho iniziato a tracciare eventi, tracciavo tutto. Ho scoperto che meno è meglio: ogni evento in più è technical debt. Nel mio lavoro ho ridotto i piani di tracciamento al minimo necessario per prendere le decisioni chiave.",
    "growth-engineering-scorecard": "Una scorecard di growth non è un report, è uno strumento di decisione. Nel mio lavoro ho costruito scorecard che si leggono in 30 secondi e guidano le priorità del team. Ecco come le progetta un growth engineer.",
    "growth-engineering-retrospettive": "Ho visto team ripetere gli stessi errori perché non facevano retrospettive. Quando ho introdotto retrospettive disciplinate, ogni esperimento — anche fallito — ha iniziato a generare apprendimento. Ecco il processo che uso.",
    "growth-engineering-ruolo-ingegnere-prodotto": "Come growth engineer, il mio lavoro non è costruire feature, ma costruire sistemi che accelerano il ciclo ideare-testare-imparare. In questo articolo spiego cosa fa davvero un growth engineer e perché non è un full stack con le metriche.",
    "growth-engineering-team-cross-funzionale": "Ho visto team growth fallire perché lavoravano in silos: prodotto, engineering, data e design separati. Il ciclo di growth attraversa tutti questi ruoli. Ecco come organizzo team cross-funzionali che accelerano l'apprendimento.",
    "growth-engineering-human-in-the-loop": "Quando ho iniziato a lavorare con agenti AI, ho capito che non possono compiere azioni irreversibili senza supervisione. L'human-in-the-loop non è un limite, è una garanzia. Ecco come lo progetta un growth engineer.",
    "growth-engineering-fake-door-etici": "Ho usato i fake door test per validare la domanda prima di costruire, ma sempre con attenzione all'etica. Un fake door test è etico solo se l'utente non paga, non viene ingannato e riceve una risposta onesta. Ecco i confini che rispetto.",
};

async function main() {
    for (const [slug, intro] of Object.entries(INTROS)) {
        const filePath = path.join("src/content/blog", `${slug}.mdx`);
        const raw = await fs.readFile(filePath, "utf-8");
        const { content } = matter(raw);

        if (content.includes("Nel mio lavoro") || content.includes("Ho visto") || content.includes("Quando ho")) {
            console.log(`SKIP ${slug}: already has first-person intro`);
            continue;
        }

        const frontmatterEndIdx = raw.indexOf("---", 3);
        if (frontmatterEndIdx === -1) continue;
        const afterFm = raw.slice(frontmatterEndIdx + 3);

        const newAfterFm = intro + "\n\n" + afterFm;
        const newRaw = raw.slice(0, frontmatterEndIdx + 3) + newAfterFm;

        await fs.writeFile(filePath, newRaw, "utf-8");
        console.log(`OK ${slug}: added first-person intro`);
    }
}

main().catch(console.error);
