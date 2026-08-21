import { promises as fs } from "fs";
import matter from "gray-matter";
import path from "path";

const NEW_FAQ_ARTICLES: Record<string, { question: string; answer: string }[]> = {
    "ecommerce-analytics": [
        { question: "Cos'è il Cart Abandonment Rate (CAR)?", answer: "Il CAR è la percentuale di carrelli che non si trasformano in ordini. Si riduce con ottimizzazione del checkout, riduzione dei campi obbligatori e trasparenza sui costi di spedizione fin da subito." },
        { question: "Come si calcola il LTV/CAC ratio?", answer: "LTV diviso CAC. Un rapporto sano è 3:1. Se è inferiore, il modello di business non scala. Se è superiore, stai investendo troppo poco nel growth." },
        { question: "Cos'è il payback period?", answer: "Il tempo necessario per recuperare il CAC attraverso i margini. Per un e-commerce sano dovrebbe stare sotto i 12 mesi. Più lungo è, più cash serve per crescere." },
        { question: "Come si legge una dashboard di e-commerce analytics?", answer: "Guarda tre livelli: revenue (totale e per canale), margine (lordo e per ordine), e rischio (tasso di reso, cart abandonment, stock). Ogni metrica deve portare a una decisione specifica." },
    ],
    "unit-economics": [
        { question: "Cos'è il CAC?", answer: "CAC (Customer Acquisition Cost) è il costo totale di acquisizione diviso per i nuovi clienti acquisiti. Include marketing, pubblicità e costi di vendita diretti." },
        { question: "Cos'è il LTV?", answer: "LTV (Lifetime Value) è il margine che un cliente genera durante tutta la sua vita. Si calcola come margine medio per ordine × frequenza di acquisto × durata di vita del cliente." },
        { question: "Quando il LTV/CAC è troppo basso?", answer: "Quando è sotto 3:1. Significa che ogni euro speso per acquisire un cliente restituisce meno di tre euro di margine nel lungo periodo. Sotto questo livello, il modello non scala senza bruciare cassa." },
        { question: "Come si riduce il payback period?", answer: "Si riduce aumentando il margine per transazione, aumentando la frequenza di acquisto, o riducendo il CAC. La combinazione più potente è aumentare il margine mantenendo il CAC stabile." },
    ],
    "ai-marketing-2026": [
        { question: "Quali sono le aree di applicazione dell'AI nel marketing?", answer: "Cinque aree: attribution modeling (data-driven), audience targeting (predictive), personalizzazione (recommendation), content generation (produzione), e ottimizzazione di campagne (bidding, budget, channel mix)." },
        { question: "L'AI nel marketing sostituisce il marketing analyst?", answer: "No, lo potenzia. L'AI automatizza la parte meccanica (dati, report, targeting base) ma non sostituisce il giudizio strategico: capire il business, interpretare i risultati in contesto, e decidere cosa fare dopo." },
        { question: "Come si valuta se un'AI per il marketing funziona?", answer: "Si confronta la performance con e senza AI: CPA (cost per acquisition), ROAS (return on ad spend), e tempo necessario per produrre un campaign. Se l'AI non migliora questi numeri, non sta portando valore." },
    ],
    "forecast-vendite": [
        { question: "Cos'è una previsione di vendita accurata?", answer: "Una previsione accurata ha un errore medio basso (MAPE basso) e un bias controllato (non è sistematicamente troppo ottimistica o pessimistica). Si valuta sempre su un holdout: dati che il modello non ha mai visto." },
        { question: "Quali metodi si usano per il forecast di vendita?", answer: "Tre famiglie: modelli statistici classici (regressione, media mobile, exponential smoothing), modelli stagionali (ARIMA, seasonal decomposition), e modelli machine learning (XGBoost, LSTM) quando c'è molto dato e pattern complessi." },
        { question: "Come si gestisce un forecast con dati irregolari?", answer: "Si identifica prima la fonte di irregolarità: se è rumore, si filtra; se è un evento (promo, festività), si modella come dummy variable. In caso di incertezza, si usa un intervallo di confidenza, non un punto stima singolo." },
    ],
    "sondaggi-online": [
        { question: "Qual è il problema principale dei sondaggi online?", answer: "Il campionamento non è casuale: chi risponde ai sondaggi online non rappresenta la popolazione. I risultati sono buoni per capire tendenze interne, non per generalizzare alla popolazione intera." },
        { question: "Come si migliora la qualità di un sondaggio online?", answer: "Si stratifica il campione (cercando di raggiungere tutti i segmenti), si calibra su dati census quando possibile, e si segnala chiaramente il margine d'errore." },
        { question: "Cosa significa 'margine d'errore calcolabile'?", answer: "Significa che puoi stimare quanto il risultato del sondaggio si discosta dal valore vero. Un margine del 3% significa che il valore reale sta tra il risultato meno 3% e il risultato più 3% (con un certo livello di confidenza)." },
    ],
    "ricerche-mercato-rock": [
        { question: "Cos'è una ricerca di mercato 'rock'?", answer: "Una ricerca che sfida le assunzioni convenzionali, raccoglie dati primari (osservazione, interviste) e produce insight che cambiano la strategia. Non un report generico, ma un'analisi che risponde a una domanda specifica." },
        { question: "Come si fa una ricerca di mercato low-cost?", answer: "Con osservazione diretta (guardare i clienti usare il prodotto), interviste profonde (5-10 utenti tipo), e analisi di dati pubblici (recensioni, social, prezzi). Costa tempo, non soldi, ma produce insight di qualità superiore." },
        { question: "Qual è l'errore più comune nelle ricerche di mercato?", answer: "Chiedere agli utenti cosa vogliono invece di osservare cosa fanno. Le persone non sanno sempre perché agiscono, e le risposte ai sondaggi riflettono più spesso ciò che pensano di voler apparire che ciò che fanno realmente." },
    ],
    "hadi-cycles": [
        { question: "Cos'è un ciclo HADI?", answer: "HADI sta per Hypothesis-Action-Data-Insight. È il ciclo di apprendimento del growth: formulare un'ipotesi, eseguire un'azione (test), raccogliere dati, estrarre insight, e riavviare il ciclo con una nuova ipotesi." },
        { question: "Come si differenzia un ciclo HADI da un A/B test tradizionale?", answer: "Un A/B test tradizionale si ferma alla risposta (vincitore vs perdente). Un ciclo HADI va oltre: usa il dato per aggiornare il modello mentale del team, non solo per decidere la prossima feature." },
        { question: "Qual è il rischio dei cicli HADI?", answer: "Il peeking (guardare i risultati prima della conferma) e il confirmation bias. Se guardi i dati prima di aver finito il test, rischi di fermare troppo presto o posticipare la fine quando non ti piace il risultato." },
    ],
    "dati-sport-ciclismo": [
        { question: "Cos'è il modello 'Moneyball' applicato al ciclismo?", answer: "È l'approccio di usare dati di performance (potenza watt/kg, VO2max, efficienza aerodinamica) per valutare tappezzanti e capitani, invece di fidarsi solo del ranking mondiale o della reputazione." },
        { question: "Quali dati contano nel ciclismo moderno?", answer: "Potenza erogata (watt), rapporto watt/kg (determina la velocità di salita), aerodinamica (drag area), e recovery index (fatica accumulata). Questi dati oggi provengono da sensori su bici e corpo." },
        { question: "Come si usa il dato in una squadra di ciclismo?", answer: "Per ottimizzare la formazione, gestire la fatica in gara (pacing), e identificare i punti di forza specifici di ogni corridore. Il dato non sostituisce il talento, lo amplifica." },
    ],
    "dashboard-che-nessuno-guarda": [
        { question: "Perché la maggior parte delle dashboard non vengono usate?", answer: "Perché mostrano troppe metriche senza priorità, non è chiaro cosa fare con i dati, o i dati sono troppo obsoleti per supportare decisioni tempestive. Si ignora ciò che non porta ad azione." },
        { question: "Cosa è una dashboard action-oriented?", answer: "Una dashboard progettata intorno a una decisione: mostra solo le metriche che servono per quella decisione, organizzate nell'ordine che guida l'occhio verso l'azione." },
        { question: "Come si progetta una dashboard che decide?", answer: "Parti dalla decisione che deve supportare, identifica le 3-5 metriche strettamente necessarie, definisci soglie che attivano azioni specifiche, e organizza in flusso chiaro. Se non porta a una decisione, è una decorazione." },
    ],
    "nps-critique": [
        { question: "Cos'è il Net Promoter Score (NPS)?", answer: "Una metrica che chiede 'quanto sei probabile di raccomandare questo prodotto a un amico o collega?' su scala 0-10. Promotori (9-10) meno detrattori (0-6) = NPS. È una metrica di advocacy, non di soddisfazione diretta." },
        { question: "Qual è il problema principale dell'NPS?", answer: "L'NPS misura intenzioni, non comportamenti. Molti promotori non raccomandano mai davvero, e molti detrattori restano fedeli per inerzia. Non predice il churn meglio di altre metriche, ed è sensibile al contesto culturale." },
        { question: "Come si usa l'NPS in modo utile?", answer: "Come screening iniziale per identificare detrattori da contattare, e come trend nel tempo (più che come singolo numero). Ma non come target principale di un team growth." },
    ],
};

const DATE_MODIFIED = "2026-08-21";

function escapeYaml(str: string): string {
    return str.replace(/"/g, '\\"');
}

async function main() {
    const blogRoot = "src/content/blog";

    for (const [slug, faqs] of Object.entries(NEW_FAQ_ARTICLES)) {
        const filePath = path.join(blogRoot, `${slug}.mdx`);
        const raw = await fs.readFile(filePath, "utf-8");
        const { data, content } = matter(raw);

        if (data.faqSchema) {
            console.log(`SKIP ${slug}: already has faqSchema`);
            continue;
        }

        const faqMarkdown = `\n\n## Domande frequenti\n\n${faqs.map((f, i) => `${i + 1}. **${f.question}**\n${f.answer}`).join("\n\n")}\n`;
        const newContent = content.trimEnd() + faqMarkdown;

        const faqYamlStr = `\nfaqSchema:\n${faqs.map(f => `  - question: "${escapeYaml(f.question)}"\n    answer: "${escapeYaml(f.answer)}"`).join("\n")}`;

        let newRaw = raw;

        if (!data.dateModified) {
            newRaw = newRaw.replace(
                /^(---\r?\n)/m,
                `$1dateModified: '${DATE_MODIFIED}'\n`,
            );
        }

        if (!data.faqSchema) {
            newRaw = newRaw.replace(
                /(\n---\r?\n)/,
                `${faqYamlStr}$1`,
            );
        }

        const newRawFinal = newRaw.slice(0, newRaw.indexOf("---", 3) + 3) +
            newRaw.slice(newRaw.indexOf("---", 3) + 3).replace(
                content,
                newContent,
            );

        await fs.writeFile(filePath, newRawFinal, "utf-8");
        console.log(`OK ${slug}: ${faqs.length} FAQs added`);
    }
}

main().catch(console.error);
