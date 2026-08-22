import { promises as fs } from "fs";
import matter from "gray-matter";
import path from "path";

const FAQS: Record<string, { question: string; answer: string }[]> = {
    "pricing-matematico": [
        { question: "Cos'è l'elasticità del prezzo?", answer: "L'elasticità misura quanto cambia la domanda quando cambi il prezzo. Si calcola come variazione % del volume / variazione % del prezzo. Se è maggiore di 1, il volume scende più del proporzionale al prezzo; se è minore di 1, hai spazio per aumentare i prezzi." },
        { question: "Come si trova il prezzo ottimale?", answer: "Il prezzo ottimale massimizza il margine totale, non il volume. Si trova testando prezzi diversi su segmenti omogenei e misurando l'elasticità locale, non applicando una formula teorica." },
        { question: "Quando ha senso alzare i prezzi?", answer: "Quando l'elasticità è bassa (i clienti non fuggono), quando hai margine per assorbire il volume perso, e quando il valore percepito supera il costo. Se i clienti sono sensibili al prezzo, alzare i prezzi distrugge il volume ma migliora il margine." },
        { question: "Come si testa un nuovo prezzo?", answer: "Con un A/B test su segmenti omogenei, misurando non solo il tasso di conversione ma anche il churn successivo e il LTV. Un prezzo più alto che riduce il churn può essere superiore anche se riduce le vendite iniziali." },
    ],
    "ab-test-errori": [
        { question: "Qual è l'errore più comune negli A/B test?", answer: "Fermare il test troppo presto quando si vede un risultato. La significatività statistica richiede tempo: fermarsi a metà porta a risultati casuali che si vanificano nel lungo periodo." },
        { question: "Cos'è il 'peeking'?", answer: "Il peeking è guardare i risultati prima della conclusione del test. Distorsiona la significatività e porta a false conclusioni. Il modo corretto è fissare la durata prima di iniziare e non guardare fino a quando non finisce." },
        { question: "Quante varianti si possono testare contemporaneamente?", answer: "Dipende dalla varianza della metrica e dalla potenza del test. Con tante varianti servono più dati per mantenere la potenza statistica. Come regola, più varianti = più tempo o più traffico per avere risultati affidabili." },
        { question: "Cosa è il MDE?", answer: "MDE (Minimum Detectable Effect) è la dimensione minima dell'effetto che il test riesce a rilevare con la potenza statistica impostata. Se il MDE è 5% e il vero effetto è 2%, il test non lo vedrà." },
    ],
    "sql-per-marketing": [
        { question: "Perché imparare SQL per il marketing?", answer: "Perché i dati di marketing sono in database relazionali. SQL è il linguaggio per interrogarli direttamente, senza intermediari. Chi sa SQL non dipende da developer per rispondere a domande sui dati." },
        { question: "Quali sono le query SQL più utili per il marketing?", answer: "Le query che contano: funnel conversion (da page view a ordine), cohort analysis (utenti per data di primo acquisto), e segmentazione (per canale, dispositivo, e comportamento). Con queste tre copri il 80% delle domande di marketing." },
        { question: "SQL vs Excel: qual è la differenza?", answer: "Excel va bene per analisi su dati statici. SQL è necessario quando i dati cambiano continuamente, sono voluminosi, o richiedono join tra tabelle. Per un e-commerce, SQL è spesso l'unica via." },
        { question: "Che skill marketing richiede SQL nel 2026?", answer: "La maggior parte dei ruoli di growth, analytics e performance marketing. Non serve essere programmatori: serve saper leggere, modificare e scrivere query semplici per estrarre insight." },
    ],
    "capire-boxplot": [
        { question: "Quando usare un boxplot?", answer: "Quando vuoi capire la distribuzione di una variabile: mediana, spread, outliers. È più informativo della media perché mostra se i dati sono simmetrici, skewed, o con valori estremi." },
        { question: "Come si legge un boxplot?", answer: "La scatola mostra il 50% centrale dei dati (Q1 a Q3). La linea interna è la mediana. I baffi si estendono ai valori non-outlier. I punti esterni sono outlier da investigare." },
        { question: "Qual è l'errore più comune con i boxplot?", answer: "Interpretare la mediana come media. In un boxplot skewed, mediana e media divergono. Se i dati sono asimmetrici, la media è spesso fuorviante." },
        { question: "Boxplot vs histogram: quando uno e quando l'altro?", answer: "Histogram: per vedere la forma della distribuzione. Boxplot: per confrontare rapidamente la distribuzione tra gruppi (es. vendite per canale). Spesso si usano insieme." },
    ],
    "incrementality-marketing": [
        { question: "Cos'è l'incrementality nel marketing?", answer: "L'incrementality misura quanto valore aggiunto il marketing genera sopra la baseline organica. Dice 'quanto vendi con la campagna meno quanto vendi senza', non 'quanto vendi con la campagna'." },
        { question: "Perché l'incrementality è difficile da misurare?", answer: "Perché non puoi vedere il controfattuale: quanto avresti venduto senza la campagna. Serve un gruppo di controllo (es. holdout geografico o temporale) per stimarlo." },
        { question: "Come si testa l'incrementality?", answer: "Con un test geografico o temporale: la campagna va in alcune regioni (test) ma non in altre (controllo). Il confronto tra le due aree stima l'impatto incrementale." },
        { question: "Qual è l'errore più comune?", answer: "Confondere l'attribuzione con l'incrementality. Attribution dice 'questa campagna ha preceduto l'ordine'. Incrementality dice 'questa campagna ha causato l'ordine'. Sono domande diverse." },
    ],
    "data-driven-italia": [
        { question: "Perché l'Italia è indietro nel data-driven decision making?", answer: "Per una combinazione di cultura (fiducia nell'esperienza più che nei dati), infrastrutture (dati sparsi e di bassa qualità), e mercato del lavoro (pochi ruoli data analyst ben pagati). Non è solo tecnologia." },
        { question: "Quali settori italiani sono più avanzati?", answer: "E-commerce, gaming, e servizi finanziari sono più avanzati perché i dati sono sempre stati centrali. Manifattura e retail tradizionale sono più indietro perché i dati erano secondari fino a poco fa." },
        { question: "Qual è il primo passo per un'azienda italiana?", answer: "Partire da un caso d'uso concreto con dati già disponibili, dimostrare un risultato misurabile, e costruire la cultura da lì. Non partire dall'infrastruttura perfetta." },
        { question: "Il data-driven in Italia è un vantaggio competitivo?", answer: "Sì, perché pochi lo fanno bene. Se riesci a essere data-driven quando la concorrenza non lo è, guadagni un margine di decisione che la concorrenza non ha." },
    ],
    "analytic-traps": [
        { question: "Cos'è un trap analitico?", answer: "Un pattern che sembra un insight ma è un artefatto del metodo di misurazione. Esempi: correlazione confusa con causalità, sopravvivenza bias, campionamento distorto, outliers che distorcono la media." },
        { question: "Come si evita il survivorship bias?", answer: "Includendo i casi falliti nell'analisi, non solo i successi. Se studi solo i clienti rimasti, non vedi quanti se ne sono andati e perché. Il dataset completo include chi è uscito." },
        { question: "Cos'è l'outlier bias?", answer: "Il bias che si genera quando un outlier (un cliente molto grande, un evento atipico) distorce la media. La mediana è più robusta della media in presenza di outlier." },
        { question: "Come si verifica se un pattern è reale?", answer: "Con un controllo temporale: il pattern è stabile su più periodi? Con un controllo geografico: è presente in più segmenti? Se il pattern compare solo in un sottoinsieme piccolo, è probabilmente noise." },
    ],
    "mappe-percettive": [
        { question: "Cos'è una mappa percettiva?", answer: "Uno strumento per posizionare i brand in base a due dimensioni rilevanti per i clienti (es. prezzo vs qualità, innovazione vs tradizione). Serve per capire dove sei percepito e dove vuoi essere." },
        { question: "Come si costruisce una mappa percettiva?", answer: "Identifichi le due dimensioni chiave, raccogli dati sulla percezione dei clienti per brand su quelle dimensioni, e ploti i brand su uno scatter. Le dimensioni devono essere ortogonali e significative per il buyer." },
        { question: "Qual è l'errore più comune?", answer: "Scegliere dimensioni che non interessano ai clienti o che sono correlate (es. prezzo e valore percepito). Una mappa percettiva funziona solo se le dimensioni sono davvero indipendenti e contano per la decisione." },
        { question: "A cosa serve una mappa percettiva?", answer: "Per identificare il posizionamento vuoto (spazi non occupati), per capire come i competitor ti vedono, e per testare se la tua strategia di posizionamento sta funzionando." },
    ],
    "innovazione-ateneo": [
        { question: "Perché le università italiane fanno fatica a innovare?", answer: "Per incentivi (cattedra prima della ricerca applicata), finanziamenti (poco per l'impact), e struttura (poca collaborazione con il privato). Il PNRR ha stanziato 3 miliardi, ma la cultura cambia lenta." },
        { question: "Cosa possono imparare le università dai data team aziendali?", answer: "Adottare una cultura di misurazione: outcome chiari, metriche di successo, iterazioni rapide. Le università tendono a misurare input (papers, citationi), aziende misurano output (business value)." },
        { question: "Come si misura l'impact della ricerca?", answer: "Non solo citations o papers. Impact = problemi reali risolti, tecnologie trasferite, startup nate, politiche influenzate. Il PNRR ha stanziato fondi con target di impact, non solo di output." },
    ],
    "privacy-first-analytics": [
        { question: "Cos'è la privacy-first analytics?", answer: "Un approccio che raccoglie solo i dati necessari, con consenso esplicito, e li usa solo per lo scopo dichiarato. Dopo GDPR e iOS 14.5, non è più un'opzione: è un requisito." },
        { question: "Quali dati non servono in analytics?", answer: "IP, fingerprint, device ID. Per la maggior parte delle analisi bastano eventi di navigazione e scelte utente, senza identificare la persona. L'anonimizzazione completa è possibile e spesso obbligatoria." },
        { question: "Come si misura se i dati sono stati raccolti in modo privacy-compliant?", answer: "Audit del consenso (hai il consenso per ogni dato raccolto?), test del dato (puoi dimostrare che il dato è anonimo?), e documentazione del data flow (chi ha accesso, per cosa)." },
    ],
    "abbandono-universitario": [
        { question: "Qual è il tasso di abbandono in Italia?", answer: "Il 15-20% degli studenti abbandona dopo il primo anno. I dati ISTAT e Anvur mostrano forti differenze geografiche e per tipo di ateneo. Il costo stimato è centinaia di milioni di euro l'anno in tasse perse e risorse non utilizzate." },
        { question: "Quali sono i fattori predittivi dell'abbandono?", answer: "I CFU del primo semestre sono il predittore più forte: meno CFU → più probabilità di abbandono. Ma anche il tasso di superamento esami, la distanza casa-università, e il background socioeconomico contano." },
        { question: "Come si riduce l'abbandono?", answer: "Con interventi proattivi sui segnali deboli: meno CFU del previsto nel primo semestre, frequentanza bassa, voti in calo. Il modello è 'alert precoce + supporto mirato', non 'attesa che lo studente chieda aiuto'." },
    ],
    "cluster-analysis": [
        { question: "Cos'è il clustering?", answer: "Il clustering raggruppa elementi simili tra loro senza conoscere le etichette a priori. Per esempio, raggruppa i clienti per comportamento (frequenza, valore, canale) per identificare segmenti naturali." },
        { question: "Come si sceglie il numero di cluster K?", answer: "Con l'Elbow Method (calo dell'inerzia), con la Silhouette Score (coerenza dei gruppi), o con il domain knowledge. Non esiste un numero 'giusto' — esiste il numero che risponde meglio alla domanda." },
        { question: "Qual è l'errore più comune?", answer: "Non standardizzare le variabili. Se una variabile ha scala da 0 a 1000 e un'altra da 0 a 1, la prima domina la distanza. Le variabili vanno scalate prima del clustering." },
        { question: "Cosa si fa dopo il clustering?", answer: "Si assegna un nome descrittivo a ogni cluster (es. 'high-value loyalists'), si calcola la dimensione e il valore di ogni gruppo, e si decide la strategia per ciascuno. Il clustering non è il fine: è l'inizio della strategia." },
    ],
};

const DATE_MODIFIED = "2026-08-21";

function escapeYaml(str: string): string {
    return str.replace(/"/g, '\\"');
}

async function main() {
    const blogRoot = "src/content/blog";

    for (const [slug, faqs] of Object.entries(FAQS)) {
        const filePath = path.join(blogRoot, `${slug}.mdx`);
        const raw = await fs.readFile(filePath, "utf-8");
        const { data, content } = matter(raw);

        if (data.faqSchema) {
            console.log(`SKIP ${slug}`);
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

        // Replace content: find content part in raw and swap
        const contentStartIdx = raw.indexOf("---", 3);
        const rawAfterFm = raw.slice(0, contentStartIdx + 3);
        const rawContent = raw.slice(contentStartIdx + 3);
        const newContentStartIdx = newRaw.indexOf("---", 3);
        const newRawAfterFm = newRaw.slice(0, newContentStartIdx + 3);
        const finalRaw = newRawAfterFm + newContent;

        await fs.writeFile(filePath, finalRaw, "utf-8");
        console.log(`OK ${slug}: ${faqs.length} FAQs`);
    }
}

main().catch(console.error);
