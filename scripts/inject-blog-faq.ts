import { promises as fs } from "fs";
import matter from "gray-matter";
import path from "path";

const PILLAR_ARTICLES = [
    { slug: "growth-engineering-ipotesi-buone", faqs: [
        { question: "Cos'è un'ipotesi di growth ben scritta?", answer: "Un'ipotesi di growth è una dichiarazione verificabile che collega un'azione specifica a un risultato misurabile, con una rationale che spiega il meccanismo causale ipotizzato." },
        { question: "Perché le ipotesi di growth sono importanti?", answer: "Un'ipotesi ben fatta rende il test decifrabile: se il test fallisce, si capisce perché; se funziona, si sa cosa ha funzionato e cosa replicare." },
        { question: "Come si scrive un'ipotesi di growth?", answer: "Tre componenti: (1) azione specifica che il team implementerà, (2) risultato metrico misurabile e atteso, (3) rationale che spiega il meccanismo causale. Formula: 'Crediamo che [azione] causi [risultato] perché [meccanismo]." },
        { question: "Qual è la differenza tra ipotesi e desiderio?", answer: "Un desiderio è 'vogliamo più conversioni'. Un'ipotesi è 'crediamo che aggiungere una barra di progresso al checkout aumenti il tasso di completamento del 5% perché riduce l'ansia da incertezza'." },
    ]},
    { slug: "growth-engineering-randomizzazione", faqs: [
        { question: "Cos'è la randomizzazione in un esperimento?", answer: "La randomizzazione è il processo con cui ogni unità (utente, sessione, device) viene assegnata casualmente a una variante, garantendo che le differenze osservate siano dovute al trattamento e non a fattori preesistenti." },
        { question: "Perché la randomizzazione è importante?", answer: "Senza randomizzazione valida, non si può stabilire causalità. Differenze tra varianti potrebbero esistere già prima del test, rendendo i risultati non interpretabili." },
        { question: "Cosa è un SRM (Sample Ratio Mismatch)?", answer: "Un SRM si verifica quando le proporzioni di unità assegnate a ogni variante divergono significativamente dalle proporzioni attese (es. 50/50 per un A/A test). È un sintomo di un problema nel sistema di randomizzazione." },
        { question: "Come si verifica la qualità della randomizzazione?", answer: "Con un A/A test: si assegnano tutte le unità alla variante di controllo e si verifica che le metriche non mostrino differenze significative. Se il A/A test segnala differenze, il sistema di randomizzazione ha un problema." },
    ]},
    { slug: "growth-engineering-triggering-test", faqs: [
        { question: "Cosa significa triggering in un esperimento?", answer: "Il triggering definisce quali unità sono effettivamente esposte al trattamento. Solo le unità che hanno la possibilità di ricevere il trattamento dovrebbero essere incluse nell'analisi." },
        { question: "Perché il triggering è cruciale?", answer: "Se nel gruppo di analisi finiscono utenti che non potevano essere esposti al trattamento, si diluisce l'effetto misurato e si rischia di non vedere un risultato reale, o di vederne uno spurio." },
        { question: "Come si definisce il triggering?", answer: "Il triggering si definisce identificando il punto nel flusso utente in cui il trattamento appare. Esempio: per un test su un agente di onboarding, il triggering è 'utente che arriva alla schermata di setup'." },
        { question: "Cosa succede se il triggering è troppo largo?", answer: "Un triggering troppo largo include utenti che non potevano vedere il trattamento, diluendo l'effetto misurato e riducendo la sensibilità del test." },
    ]},
    { slug: "esperimenti-prodotti-agentici", faqs: [
        { question: "Cosa cambia negli esperimenti con agenti AI?", answer: "Gli agenti AI introducono non determinismo: la stessa azione può produrre output diversi. Questo richiede una metrica di outcome che cattura il valore finale, non solo l'interazione intermedia." },
        { question: "Come si testa un agente AI?", answer: "Si definisce prima l'outcome verificabile che l'agente deve produrre, poi si misura la percentuale di volte in cui l'agente lo raggiunge, distinguendo tra interazione (facile da misurare) e outcome (difficile ma più rilevante)." },
        { question: "Quali metriche usare per agenti AI?", answer: "Servono metriche di outcome (il risultato finale per l'utente), metriche di guardrail (effetti collaterali da evitare), e metriche di qualità dell'output dell'agente." },
        { question: "Perché le metriche di vanity non funzionano per gli agenti AI?", answer: "Metriche come 'numero di interazioni' o 'tempo sulla pagina' non catturano se l'agente ha effettivamente risolto il problema dell'utente. Più interazioni possono significare che l'agente non è stato chiaro." },
    ]},
    { slug: "agenti-ai-non-sono-chatbot", faqs: [
        { question: "Qual è la differenza tra un agente AI e un chatbot?", answer: "Un chatbot risponde a una domanda specifica in una conversazione. Un agente AI ha un obiettivo a lungo termine, usa strumenti per compiere azioni, mantiene memoria del contesto, e decide autonomamente quando completare un task o chiedere conferma." },
        { question: "Cosa rende un agente AI diverso da un'automazione tradizionale?", answer: "Un'automazione tradizionale segue regole fisse. Un agente AI può gestire input non previsti, fare inferenze contestuali, e adattare il suo comportamento basandosi su ciò che apprende durante l'esecuzione." },
        { question: "Quando ha senso costruire un agente AI invece di un chatbot?", answer: "Quando serve completare task multi-step che richiedono l'uso di strumenti (database, API, filesystem), mantenere memoria trasversale, o gestire casi d'uso che non si prestano a script predefiniti." },
        { question: "Quali sono i rischi specifici degli agenti AI?", answer: "I rischi includono: azioni irreversibili eseguite senza conferma, degradazione progressiva della qualità, sfruttamento di istruzioni permissive, e accumulo di stato che crea dipendenze non documentate." },
    ]},
    { slug: "growth-engineering-agenti-workflow", faqs: [
        { question: "Perché gli agenti AI funzionano meglio come workflow che come chat?", answer: "Un workflow definisce input attesi, sequenze di azioni, condizioni di successo e punti di verifica. Una chat lascia l'utente libero di dire qualsiasi cosa, senza garanzia che l'agente riceva le informazioni necessarie per completare il task." },
        { question: "Come si progetta un workflow per un agente AI?", answer: "Si definiscono: (1) obiettivo finale verificabile, (2) sequenza di passi che l'agente deve seguire, (3) strumenti a disposizione per ogni passo, (4) punti di validazione in cui una persona verifica l'output prima di procedere." },
        { question: "Cosa significa 'agentic workflow' in pratica?", answer: "Un agentic workflow è un processo in cui l'agente non si limita a rispondere, ma compie azioni: legge dati, chiama API, scrive file, invia notifiche, con un obiettivo dichiarato e criteri di completamento espliciti." },
    ]},
    { slug: "valutare-output-agenti-ai", faqs: [
        { question: "Come si valuta la correttezza di un output di un agente AI?", answer: "La correttezza si valida rispetto a un ground truth verificabile: il risultato è funzionalmente corretto? L'agente ha usato fonti corrette? L'output rispetta i vincoli di formato e contenuto richiesti?" },
        { question: "Cosa sono le metriche guardrail per agenti AI?", answer: "Le metriche guardrail misurano gli effetti collaterali che non si vuole che l'agente produca: tasso di risposte inappropriate, uso di fonti obsolete, escalation sbagliate, o azioni irreversibili eseguite senza conferma." },
        { question: "Come si misura l'utilità di un agente AI?", answer: "L'utilità si misura dal punto di vista dell'utente: il task che l'utente voleva completare è stato completato? Quanto tempo ha risparmiato l'utente? L'utente dovrebbe ricorrere all'agente di nuovo?" },
        { question: "Perché la sicurezza è una metrica di output per agenti AI?", answer: "La sicurezza misura se l'agente produce output che violano policy aziendali, espongono dati sensibili, o compiono azioni dannose. È una metrica binaria (safe/unsafe) che deve essere verificata sistematicamente." },
    ]},
    { slug: "rag-growth-engineering-agenti-ai", faqs: [
        { question: "Cos'è RAG e perché è rilevante per il growth engineering?", answer: "RAG (Retrieval-Augmented Generation) combina un modello linguistico con una base di conoscenza retrievata. Per il growth engineering, permette di dare agli agenti AI accesso a dati proprietari (metriche, documentazione, storico) per produrre output contestualmente accurati." },
        { question: "Come si costruisce una strategia RAG efficace?", answer: "Una strategia RAG efficace richiede: (1) fonti di verità identificate e aggiornate, (2) chunking strategy che preserva il contesto semantico, (3) embedding model adatto al dominio, (4) retrieval evaluation continua per verificare che le fonti giuste vengano recuperate." },
        { question: "Qual è il rischio principale del RAG?", answer: "Il rischio principale è che l'agente recuperi fonti outdated o non rilevanti e le presenti come verità. Senza valutazione sistematica della qualità delle fonti recuperate, il RAG può produrre output più persuasivi ma meno accurati." },
    ]},
    { slug: "growth-engineering-osservabilita-prodotto", faqs: [
        { question: "Cos'è l'osservabilità di prodotto?", answer: "L'osservabilità di prodotto è la capacità di inferire lo stato interno del sistema dalle sue outputs esterne. In pratica: dati sugli eventi utente, metriche di performance, e log che permettono di capire cosa succede senza dover riprodurre il bug." },
        { question: "Perché l'osservabilità è importante per il growth?", answer: "Senza osservabilità, il team growth non può distinguere tra 'le cose funzionano' e 'le cose sembrano funzionare'. L'osservabilità è prerequisito per sperimentazione significativa e per diagnosticare i motivi dietro i risultati di un test." },
        { question: "Quali sono i tre pilastri dell'osservabilità?", answer: "I tre pilastri sono: (1) metriche (aggregati che mostrano trend), (2) trace (record individuali di singoli eventi o sessioni), (3) log (eventi discreti che catturano transizioni di stato). Insieme permettono di andare dal 'cosa' al 'perché'." },
    ]},
    { slug: "growth-engineering-pipeline-dati-growth", faqs: [
        { question: "Cos'è un pipeline dati per il growth?", answer: "Un pipeline dati per il growth è una sequenza di trasformazioni che portano i dati grezzi (click, eventi, transazioni) a insight azionabili (metriche, segmenti, sperimentazione)." },
        { question: "Qual è la differenza tra pipeline ETL e pipeline streaming?", answer: "ETL (Extract-Transform-Load) processa dati in batch a intervalli definiti. Pipeline streaming processa dati evento per evento in tempo reale. Per il growth engineering, la scelta dipende dalla frequenza con cui le decisioni devono essere prese." },
        { question: "Perché la qualità del dato è fondamentale per il growth?", answer: "Se i dati sono sporchi (duplicati, missing, inconsistenti), le metriche mentono. Decisioni prese su dati di bassa qualità portano a sperimentazione inefficace e a strategie di growth basate su correlazioni spurie." },
    ]},
    { slug: "growth-engineering-dashboard-che-decidono", faqs: [
        { question: "Cos'è una dashboard che decide?", answer: "Una dashboard che decide non mostra solo numeri, ma suggerisce azioni basate sui dati. Non è uno strumento di monitoraggio passivo, ma un'interfaccia che collega ogni insight a una decisione e a un'azione specifica." },
        { question: "Perché la maggior parte delle dashboard non vengono usate?", answer: "Le dashboard vengono ignorate quando presentano troppe metriche senza priorità, quando non è chiaro cosa fare con i dati mostrati, o quando i dati sono troppo obsoleti per supportare decisioni tempestive." },
        { question: "Come si progetta una dashboard action-oriented?", answer: "Si parte dalla decisione che la dashboard deve supportare, poi si identificano le metriche strettamente necessarie per prendere quella decisione, poi si organizzano in flusso che guida l'occhio verso l'azione." },
    ]},
    { slug: "growth-engineering-eventi-che-contano", faqs: [
        { question: "Come si scelgono gli eventi da tracciare?", answer: "Si scelgono eventi che corrispondono a azioni utente associate a outcome di business. Non ogni click merita un evento: solo le azioni che contribuiscono a definire se l'utente sta ottenendo valore dal prodotto." },
        { question: "Cos'è la telemetria minima?", answer: "La telemetria minima è l'insieme più piccolo di eventi che permette di rispondere alle domande di business più importanti. Si riduce la superficie di tracciamento al minimo necessario per prendere le decisioni chiave." },
        { question: "Quanti eventi dovrebbe avere un piano di tracciamento?", answer: "Meno è meglio. Ogni evento in più è technical debt. Si punta a 20-50 eventi ben scelti piuttosto che centinaia di eventi non correlati. Si aggiungono eventi solo quando una domanda di business specifica non può essere risposta con quelli esistenti." },
    ]},
    { slug: "growth-engineering-scorecard", faqs: [
        { question: "Cos'è una scorecard di growth?", answer: "Una scorecard di growth è una pagina che riassume lo stato corrente del funnel di crescita: acquisizione, attivazione, retention, referral, e revenue. È uno strumento di decisione, non di report." },
        { question: "A chi serve una scorecard di growth?", answer: "A tutti: al team growth per sapere dove concentrare l'attenzione, al leadership per valutare la salute del business, agli investitori per vedere progressi. Deve essere leggibile in 30 secondi e sufficientemente profonda per supportare decisioni." },
        { question: "Come si evita che una scorecard diventi vanity?", answer: "Una scorecard diventa vanity quando le metriche non portano ad azioni. Ogni metrica sulla scorecard deve avere una soglia che, se superata, attiva un workstream specifico. Se la metrica non ha implicazioni per le decisioni, non dovrebbe essere sulla scorecard." },
    ]},
    { slug: "growth-engineering-retrospettive", faqs: [
        { question: "Cos'è una retrospettiva di esperimento?", answer: "Una retrospettiva di esperimento è una sessione strutturata che segue ogni esperimento (sia esso risultato positivo, negativo o inconclusivo) per estrarre conoscenza che migliori i prossimi esperimenti." },
        { question: "Quando si fa una retrospettiva?", answer: "Si fa una retrospettiva entro una settimana dalla chiusura dell'esperimento, quando i risultati sono ancora freschi nella memoria del team. Per esperimenti lunghi, si può fare una retrospettiva intermedia durante l'esecuzione." },
        { question: "Cosa si documenta in una retrospettiva?", answer: "Si documenta: l'ipotesi originale, il risultato effettivo, l'interpretazione di cosa è successo, le implicazioni per i prossimi esperimenti, e le domande aperte che l'esperimento ha generato." },
        { question: "Perché le retrospettive sono importanti?", answer: "Senza retrospettive, il team ripete gli stessi errori. Con retrospettive disciplinate, ogni esperimento — anche quelli falliti — genera apprendimento netto positivo che accelera i test futuri." },
    ]},
    { slug: "growth-engineering-ruolo-ingegnere-prodotto", faqs: [
        { question: "Cosa fa un growth engineer?", answer: "Un growth engineer è un ingegnere con mentalità di prodotto che costruisce sistemi per generare e testare ipotesi di crescita: infrastruttura di sperimentazione, pipeline dati, dashboard, strumenti di analytics, e feature di crescita." },
        { question: "Qual è la differenza tra growth engineer e full stack?", answer: "Un full stack costruisce qualsiasi feature richiesta. Un growth engineer è focalizzato su sistemi che accelerano il ciclo ideare→testare→imparare, con una visione trasversale che connette analytics, infrastruttura, e prodotto." },
        { question: "Quali competenze servono per growth engineering?", answer: "Ingegneria del software (back-end e data), mentalità statistica per interpretare esperimenti, prodotto per identificare le leve giuste, e comunicazione per tradurre i risultati in decisioni di business." },
    ]},
    { slug: "growth-engineering-team-cross-funzionale", faqs: [
        { question: "Perché il team growth deve essere cross-funzionale?", answer: "Il ciclo di growth (ipotesi→test→apprendimento) attraversa prodotto, engineering, data, e design. Se questi team lavorano in silos, il ciclo rallenta: ogni hand-off aggiunge latenza e perdita di contesto." },
        { question: "Quali ruoli sono essenziali in un team growth?", answer: "Minimamente: un ingegnere con mentalità growth, un data analyst o scientist, un product manager che definisca priorità, e un designer per le UI experiments. In aziende più grandi, questi ruoli si specializzano." },
        { question: "Come si organizza un team growth cross-funzionale?", answer: "Si organizza intorno a una metrica nord star e a un insieme di ipotesi priorizzate. Il team lavora in cicli brevi (1-2 settimane) con demo a fine ciclo che mostrano risultati e prossimi passi." },
    ]},
    { slug: "growth-engineering-human-in-the-loop", faqs: [
        { question: "Cosa significa human-in-the-loop per agenti AI?", answer: "Human-in-the-loop (HITL) significa che l'agente AI non compie azioni irreversibili senza supervisione umana. L'umano rimane nel loop per approvare, correggere, o fermare l'agente in punti critici del processo." },
        { question: "Quando è necessario l'HITL?", answer: "HITL è necessario quando: (1) l'azione ha conseguenze irreversibili, (2) il costo dell'errore è alto, (3) l'agente opera in un dominio con policy complesse, (4) la decisione richiede giudizio contestuale che l'agente non può avere." },
        { question: "Come si progetta un sistema HITL efficace?", answer: "Si identificano i punti critici dove l'agente deve chiedere conferma, si definiscono criteri chiari per quando l'umano deve intervenire, e si costruisce un'interfaccia che permetta revisioni rapide senza creare colli di bottiglia." },
    ]},
    { slug: "growth-engineering-fake-door-etici", faqs: [
        { question: "Cos'è un fake door test?", answer: "Un fake door test è una tecnica in cui si presenta agli utenti un'opzione che sembra disponibile ma che in realtà non esiste ancora, per misurare la domanda prima di investire nella costruzione." },
        { question: "Il fake door test è etico?", answer: "Il fake door test è etico se: (1) l'utente non paga nulla, (2) non vengono raccolti dati personali sensibili, (3) l'utente riceve una risposta onesta quando prova ad accedere, (4) non viene creata un'esperienza frustrante deliberatamente." },
        { question: "Quando usare un fake door test?", answer: "Si usa un fake door test quando il costo di costruire e testare è alto, quando si vuole validare la domanda prima di investire, e quando l'outcome misurabile è semplice (click, signup senza acquisto)." },
    ]},
];

const DATE_MODIFIED = "2026-08-21";

function escapeYaml(str: string): string {
    return str.replace(/"/g, '\\"');
}

function buildFrontmatter(data: Record<string, unknown>, faqs: {question: string, answer: string}[], addDateModified: boolean): string {
    const lines: string[] = ["---"];
    if (addDateModified) {
        lines.push(`dateModified: '${DATE_MODIFIED}'`);
    }
    for (const [key, value] of Object.entries(data)) {
        if (key === "faqSchema") continue;
        if (key === "dateModified" && addDateModified) continue;
        if (typeof value === "string") {
            lines.push(`${key}: "${value}"`);
        } else if (Array.isArray(value) && value.length > 0) {
            if (typeof value[0] === "object" && "question" in (value[0] as object)) {
                lines.push("faqSchema:");
                for (const f of faqs) {
                    lines.push(`  - question: "${escapeYaml(f.question)}"`);
                    lines.push(`    answer: "${escapeYaml(f.answer)}"`);
                }
            } else {
                lines.push(`${key}:`);
                for (const v of value) lines.push(`  - ${JSON.stringify(v)}`);
            }
        } else {
            lines.push(`${key}: ${JSON.stringify(value)}`);
        }
    }
    if (faqs.length > 0) {
        lines.push("faqSchema:");
        for (const f of faqs) {
            lines.push(`  - question: "${escapeYaml(f.question)}"`);
            lines.push(`    answer: "${escapeYaml(f.answer)}"`);
        }
    }
    lines.push("---");
    return lines.join("\n");
}

async function main() {
    const blogRoot = "src/content/blog";

    for (const pillar of PILLAR_ARTICLES) {
        const filePath = path.join(blogRoot, `${pillar.slug}.mdx`);
        const raw = await fs.readFile(filePath, "utf-8");
        const { data, content } = matter(raw);

        if (data.faqSchema) {
            console.log(`SKIP  ${pillar.slug}: already has faqSchema`);
            continue;
        }

        const faqMarkdown = `\n\n## Domande frequenti\n\n${pillar.faqs.map((f, i) => `${i + 1}. **${f.question}**\n${f.answer}`).join("\n\n")}\n`;

        const newContent = content.trimEnd() + faqMarkdown;
        const hasDateModified = !!data.dateModified;

        const newFrontmatter = buildFrontmatter(data as Record<string, unknown>, pillar.faqs, !hasDateModified);
        const newRaw = newFrontmatter + "\n" + newContent;

        await fs.writeFile(filePath, newRaw, "utf-8");

        const verify = matter(newRaw);
        if (!verify.data.faqSchema) {
            console.log(`FAIL  ${pillar.slug}: faqSchema not added`);
        } else {
            console.log(`OK    ${pillar.slug}: ${pillar.faqs.length} FAQs added`);
        }
    }
}

main().catch(console.error);
