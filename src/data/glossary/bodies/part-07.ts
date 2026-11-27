import type { TermBody } from '../../../lib/glossary';

export const bodies07: Record<string, TermBody> = {
  'product-analytics': {
    why: `Le analisi di sito e di marketing dicono da dove arrivano le persone; l'analisi di prodotto dice cosa fanno una volta dentro. È la disciplina che trasforma le azioni degli utenti in decisioni su cosa costruire, migliorare o togliere: quali funzioni vengono usate davvero, dove ci si blocca, cosa distingue chi resta da chi se ne va. Senza di essa le priorità del prodotto si decidono con le opinioni di chi parla più forte nella riunione.`,
    how: `Si traccia un insieme limitato di eventi legati alle azioni di valore, con le proprietà per segmentarli e un identificativo utente stabile. Le analisi di base sono quattro: funnel (dove si perde chi avanza in un percorso), retention per coorte (chi torna e quando), percorsi (cosa fanno gli utenti tra un'azione e l'altra) e adozione delle funzioni (quanti la usano e con che frequenza). Si collegano i comportamenti ai risultati, come attivazione e ricavi, e si verificano le ipotesi con esperimenti. I risultati vanno in revisioni regolari con il team di prodotto.`,
    example: `Un'app di gestione progetti ha 12 funzioni principali. L'analisi mostra che 3 sono usate dall'85% degli utenti attivi e 4 da meno del 3%. Chi usa la funzione "attività ricorrenti" entro la prima settimana ha una retention a 60 giorni del 61%, contro il 33% degli altri, ma solo il 9% la scopre. Il team la rende visibile nell'avvio e la quota di scoperta sale al 27%. Le quattro funzioni quasi ignorate vengono semplificate o rimosse, riducendo la manutenzione.`,
    sql: `SELECT
    feature,
    uniqExact(user_id) AS users,
    round(users / (SELECT uniqExact(user_id) FROM events WHERE event_date >= today() - 28) * 100, 1) AS adoption_pct
FROM events
WHERE event_date >= today() - 28
  AND event_name = 'feature_used'
GROUP BY feature
ORDER BY users DESC;`,
    pitfalls: `L'errore principale è contare quanto si usa una funzione senza chiedersi se produce valore: un uso elevato può indicare un percorso confuso. Un altro è analizzare senza una domanda, esplorando i dati finché compare un modello casuale. Si confonde correlazione e causa: chi usa una funzione può essere già più motivato, e solo un esperimento lo chiarisce. Infine, i dati quantitativi dicono cosa succede, non perché: vanno affiancati da interviste e sessioni osservate per capire le ragioni dei comportamenti.`,
    related: ['funnel-analysis', 'cohort-analysis', 'retention-rate', 'activation-rate', 'tracking-plan'],
  },

  'retention-rate': {
    why: `Acquisire utenti che poi spariscono è come riempire una vasca con il tappo aperto. Il tasso di retention misura quanti utenti continuano a usare il prodotto dopo un certo tempo ed è considerato il segnale più affidabile di valore reale: nessuna campagna fa tornare a lungo persone a cui il prodotto non serve. Una curva che si appiattisce indica che esiste un gruppo di clienti fedeli su cui costruire, una che scende fino a zero indica un problema di fondo.`,
    how: `Si definiscono l'evento di partenza (per esempio la registrazione), l'evento che conta come ritorno (un'azione di valore, non una semplice apertura) e il periodo. Per ogni coorte si calcola la quota di utenti che compie l'azione di ritorno nel giorno o nella settimana N dopo la partenza. Si usa la retention "classica" (attivo esattamente al giorno N) o quella "a intervallo" (attivo in qualsiasi momento dal giorno N in poi), secondo il tipo di prodotto. Si confrontano le curve di coorti diverse e si osserva dove la curva si stabilizza.`,
    example: `Di 2.000 utenti registrati in una settimana, 760 tornano nella settimana 1 (38%), 540 nella settimana 4 (27%) e 500 nella settimana 12 (25%). La curva si appiattisce attorno al 25%: esiste un nucleo stabile. Una coorte successiva, dopo il miglioramento dell'avvio, ha il 45% alla settimana 1 e il 31% alla settimana 12. Questo spostamento di sei punti nel nucleo fedele pesa molto più del miglioramento del 7% a una settimana, perché determina il valore nel lungo periodo.`,
    formula: `retention al giorno N = utenti della coorte attivi al giorno N / utenti della coorte`,
    sql: `SELECT
    dateDiff('week', cohort_week, activity_week) AS week_n,
    uniqExact(user_id) AS retained
FROM (
    SELECT user_id,
           toStartOfWeek(min(event_date) OVER (PARTITION BY user_id)) AS cohort_week,
           toStartOfWeek(event_date) AS activity_week
    FROM events
    WHERE event_name = 'key_action'
)
GROUP BY cohort_week, week_n
ORDER BY cohort_week, week_n;`,
    pitfalls: `Scegliere un evento di ritorno troppo facile gonfia la curva senza collegarla a un valore. Un altro errore è confrontare coorti con età diverse: l'ultima coorte non ha ancora vissuto le settimane successive. Si usa una media che mescola utenti molto diversi e nasconde il segmento che funziona. Si confonde la retention con la frequenza d'uso: un cliente può restare ma usare poco. Infine, la retention di un prodotto ad abbonamento e quella di uno a uso occasionale non sono confrontabili: la soglia buona dipende dalla frequenza naturale d'uso.`,
    related: ['cohort-analysis', 'churn-rate', 'activation-rate', 'dau-mau-ratio', 'ltv'],
  },

  roas: {
    why: `Una campagna pubblicitaria che genera 10.000 euro di vendite sembra un successo finché non si scopre che ne è costati 9.000. Il ritorno sulla spesa pubblicitaria mette in rapporto i ricavi attribuiti a una campagna con quanto è stato speso per realizzarla, e permette di confrontare canali e annunci in modo uniforme. È la metrica operativa del marketing a pagamento, utile per decidere quali campagne ampliare e quali interrompere, a patto di leggerla con attenzione ai suoi limiti.`,
    how: `Si divide il ricavo attribuito alla campagna per la spesa pubblicitaria, nello stesso periodo e con lo stesso modello di attribuzione. Il risultato si esprime come multiplo: 4 significa quattro euro di ricavi per un euro speso. Per decidere se è sufficiente si calcola il valore di pareggio: se il margine lordo è del 40%, serve un ROAS di almeno 2,5 solo per coprire i costi del prodotto, prima di ogni altro costo. Si analizza per campagna, pubblico e creatività, tenendo conto della finestra di attribuzione e dei tempi di conversione.`,
    example: `Una campagna spende 8.000 euro e la piattaforma attribuisce 36.000 euro di ricavi: ROAS 4,5. Il margine lordo del prodotto è del 35%, quindi il margine generato è 12.600 euro, a fronte di 8.000 di spesa: resta un contributo di 4.600 euro. Una seconda campagna ha ROAS 3,0 con 5.000 euro di spesa: genera 15.000 euro di ricavi e 5.250 di margine, appena sopra la spesa. Il ROAS pareggio è 1 / 0,35 = 2,86: la seconda campagna è sulla soglia e va riesaminata.`,
    formula: `ROAS = ricavi attribuiti alla campagna / spesa pubblicitaria`,
    pitfalls: `Il ROAS di piattaforma tende a sovrastimare, perché attribuisce alla campagna anche vendite che sarebbero avvenute comunque, specie sui pubblici già clienti o sulle ricerche di marca. Un secondo errore è ignorare il margine: lo stesso ROAS è un successo con un margine del 70% e una perdita con uno del 25%. Si confrontano campagne con finestre di attribuzione diverse. Infine, ottimizzare solo il ROAS può ridurre la crescita, perché spinge a puntare sul pubblico più facile; serve guardare anche i ricavi incrementali.`,
    related: ['roi', 'cac', 'attribution-models', 'conversion-rate', 'unit-economics'],
  },

  roi: {
    why: `Prima di investire in un progetto, un'attività o uno strumento, occorre sapere se ciò che si ottiene supera ciò che si spende. Il ritorno sull'investimento esprime questo confronto in percentuale ed è la metrica più generale e conosciuta per valutare la convenienza economica. La sua forza è la semplicità, che è anche il suo limite: da sola non considera i tempi, il rischio né ciò che si sarebbe ottenuto comunque, quindi va accompagnata da altre misure.`,
    how: `Si sottrae il costo dell'investimento dal guadagno che ne deriva e si divide per il costo. Il guadagno va misurato in modo omogeneo, di solito come margine o beneficio netto incrementale, cioè ciò che si ottiene in più rispetto allo scenario senza investimento. Si includono tutti i costi, compresi personale, strumenti e tempo. Per progetti di durata superiore all'anno si valutano anche il periodo di recupero e il valore attuale netto, che tengono conto del momento in cui arrivano i flussi. Si dichiarano le ipotesi e un intervallo di incertezza.`,
    example: `Un'azienda investe 40.000 euro in un sistema di raccomandazioni: 30.000 di sviluppo e 10.000 di costi di gestione del primo anno. Un test controllato mostra un aumento del margine di 70.000 euro nello stesso periodo. Il ROI è (70.000 - 40.000) / 40.000 = 75%. Il periodo di recupero è di circa sette mesi. Se il test avesse misurato 52.000 euro, il ROI sarebbe 30%: ancora positivo, ma meno convincente rispetto ad altri progetti con rischio minore.`,
    formula: `ROI = (guadagno netto dell'investimento - costo dell'investimento) / costo dell'investimento`,
    pitfalls: `Attribuire all'investimento tutto l'aumento osservato, anche quello che sarebbe comunque arrivato: senza un confronto con un gruppo di controllo il guadagno è sovrastimato. Un altro errore è dimenticare costi indiretti, come il tempo del team. Si confrontano ROI di progetti con durate diverse, favorendo quelli brevi. Si usa il ricavo al posto del margine, mostrando risultati migliori di quelli reali. Infine, il ROI massimo non sempre coincide con la scelta migliore: un progetto piccolo con ROI alto può valere meno di uno grande con ROI più basso.`,
    related: ['roas', 'unit-economics', 'cac', 'ltv', 'a-b-testing'],
  },

  s3: {
    why: `Conservare dati in un server con un disco richiede di prevedere in anticipo lo spazio, gestire i guasti e pagare per capacità inutilizzata. Amazon S3 è uno storage a oggetti con capacità praticamente illimitata, costi per gigabyte molto bassi e una durabilità dichiarata del 99,999999999% (undici nove) sull'archivio standard. Per questo è la base della maggior parte dei data lake: i dati restano qui, a basso costo, e i motori di calcolo li leggono quando servono.`,
    how: `I dati sono organizzati in bucket, contenitori con un nome unico a livello globale, e dentro ogni bucket in oggetti identificati da una chiave che somiglia a un percorso. Si controllano gli accessi con policy e ruoli, si cifrano i dati a riposo, si abilita il versionamento per recuperare modifiche e cancellazioni accidentali. Si scelgono classi di archiviazione in base alla frequenza di accesso: standard per i dati usati, classi a basso costo per quelli rari, archivio profondo per la conservazione. Regole di ciclo di vita spostano o cancellano gli oggetti con il passare del tempo.`,
    example: `Un team conserva 50 TB di eventi. Nella classe standard il costo è circa 1.150 dollari al mese (0,023 dollari per GB). Con una regola di ciclo di vita, dopo 90 giorni i dati passano a una classe per accessi infrequenti (circa 0,0125 dollari per GB): se 40 TB sono più vecchi di 90 giorni, la spesa mensile scende a circa 730 dollari (500 per i 40 TB e 230 per i 10 TB recenti), e con una classe di archivio dopo un anno scenderebbe ancora. I dati recenti restano nella classe veloce e quelli vecchi si conservano a un costo ridotto.`,
    pitfalls: `Lasciare un bucket accessibile pubblicamente per errore è la causa di molte violazioni di dati: va bloccato l'accesso pubblico di default. Un secondo errore sono i costi nascosti: richieste, uscita dei dati verso Internet o altre regioni e recupero dalle classi di archivio possono superare il costo di archiviazione. Si caricano troppi file piccoli, che rallentano le query. Infine, S3 non è un file system: non esistono vere cartelle né modifiche parziali di un oggetto, e questo influenza il modo di scrivere e aggiornare i dati.`,
    related: ['data-lake', 'athena', 'glue', 'parquet', 'hive-style-partitioning'],
  },

  'schema-registry': {
    why: `In un sistema in cui decine di servizi scrivono e leggono eventi su Kafka, nessuno può ricordare quale struttura abbia ogni messaggio, e un cambiamento non comunicato rompe i consumatori. Il registro degli schemi è un servizio centrale che conserva le versioni degli schemi e le regole con cui possono cambiare. Garantisce che chi legge e chi scrive si intendano, e rende l'evoluzione dei dati un processo controllato invece che una fonte di incidenti notturni.`,
    how: `Ogni schema, in formato Avro, Protobuf o JSON Schema, è registrato con un nome (di solito collegato al topic) e riceve un numero di versione. I produttori includono nel messaggio solo l'identificativo dello schema, non lo schema stesso, riducendo il peso. I consumatori usano l'identificativo per recuperare lo schema dal registro e decodificare il messaggio. Il registro verifica, a ogni nuova versione, la compatibilità con la precedente secondo la regola scelta (all'indietro, in avanti, completa) e rifiuta le modifiche che la violano.`,
    example: `Un topic "ordini" ha lo schema versione 1 con id e importo. Un team propone la versione 2 che aggiunge il campo "valuta" con default "EUR". Il registro, con regola di compatibilità all'indietro, accetta: i consumatori aggiornati leggono sia i vecchi sia i nuovi messaggi. Un altro team propone di rinominare "importo" in "totale": il registro rifiuta la pubblicazione, perché i consumatori esistenti non troverebbero più il campo, e il problema si risolve prima di arrivare in produzione.`,
    pitfalls: `Usare la compatibilità "nessuna" per comodità: significa rinunciare alla protezione che è lo scopo del registro. Un altro errore è non gestire il registro come servizio critico: se non è raggiungibile, produttori e consumatori nuovi non riescono ad avviarsi, quindi servono alta disponibilità e cache. Si registrano schemi senza descrizioni dei campi e senza responsabile, perdendo significato. Infine, la compatibilità sintattica non garantisce quella semantica: cambiare l'unità di misura di un campo non viene intercettato.`,
    related: ['backward-compatibility', 'data-contract', 'topic-kafka', 'kafka-connect', 'debezium'],
  },

  segmentazione: {
    why: `Un messaggio uguale per tutti funziona per pochi e lascia indifferenti gli altri, e una media su tutta la base nasconde sia i clienti più preziosi sia quelli a rischio. La segmentazione divide una popolazione in gruppi con caratteristiche o comportamenti simili, in modo da trattarli in modo diverso e da leggere i dati con più precisione. Ha senso solo se i gruppi sono distinti tra loro, abbastanza grandi da contare e raggiungibili con azioni diverse.`,
    how: `Si può segmentare in tre modi principali: per caratteristiche (paese, età, dimensione dell'azienda), per comportamento (frequenza d'acquisto, funzioni usate, recenza) o per bisogno (il lavoro che il cliente vuole svolgere). Un metodo classico per i clienti è l'analisi RFM, che combina recenza, frequenza e valore monetario. Metodi statistici, come il clustering, trovano gruppi dai dati. Per ciascun segmento si definiscono dimensione, valore e azioni specifiche, e si verifica con un test che il trattamento differenziato porti un miglioramento.`,
    example: `Un negozio divide i clienti con RFM in quattro gruppi: fedeli (9% della base, 41% dei ricavi), occasionali (35%, 33%), dormienti (38%, 14%) e nuovi (18%, 12%). Un'email di riattivazione con sconto ai dormienti ottiene l'1,8% di acquisti, mentre la stessa offerta ai fedeli produce solo cannibalizzazione di acquisti già previsti. Per i fedeli, un accesso anticipato alle novità porta un aumento del 6% della spesa media. Lo stesso budget, indirizzato per segmento, rende circa il doppio.`,
    sql: `SELECT
    customer_id,
    dateDiff('day', max(order_date), today()) AS recency_days,
    count() AS frequency,
    sum(amount_eur) AS monetary,
    ntile(4) OVER (ORDER BY recency_days DESC) AS r_score
FROM orders
GROUP BY customer_id;`,
    pitfalls: `Creare troppi segmenti, ciascuno troppo piccolo per essere misurato o per giustificare un'azione dedicata. Un altro errore è basare i gruppi su caratteristiche demografiche che non cambiano il comportamento: due clienti con la stessa età possono avere bisogni opposti. Si dimentica che i segmenti cambiano: un cliente fedele può diventare dormiente, quindi vanno ricalcolati. Infine, studiare molti segmenti dopo un esperimento per trovare dove funziona l'effetto produce falsi positivi: i sottogruppi vanno stabiliti prima.`,
    related: ['dimensioni', 'cohort-analysis', 'jtbd', 'cdp', 'a-b-testing'],
  },

  'server-side-tracking': {
    why: `Il tracciamento dal browser perde dati: i blocchi di pubblicità e di tracciamento, le restrizioni dei browser sui cookie e le connessioni interrotte riducono gli eventi registrati, fino a un quarto in alcuni segmenti. Inviare gli eventi dal server dell'azienda a quello della piattaforma di analytics aumenta l'affidabilità e il controllo: l'azienda decide cosa viene trasmesso e a chi, e gli eventi più importanti, come un pagamento, si registrano quando accadono davvero.`,
    how: `Il sito o l'app invia gli eventi a un endpoint controllato dall'azienda, su un dominio proprio, che li valida, li arricchisce con dati affidabili e li inoltra agli strumenti di analytics e di pubblicità. Gli acquisti si possono inviare direttamente dal sistema di gestione degli ordini, con importi corretti e senza duplicati. Si usano identificativi per deduplicare quando lo stesso evento arriva anche dal browser. Il consenso dell'utente resta necessario e va applicato anche dal lato server, insieme all'eliminazione dei dati non necessari prima dell'invio.`,
    example: `Un e-commerce confronta gli ordini della piattaforma con quelli registrati dal browser: 1.000 ordini reali, 810 tracciati lato browser. Aggiungendo l'invio dal server al momento della conferma dell'ordine, con un identificativo per evitare doppi conteggi, si arriva a 985 su 1.000 ordini tracciati (98,5%), e gli importi coincidono con la contabilità. Le piattaforme pubblicitarie, ricevendo più conversioni, ottimizzano meglio le campagne, e il costo per acquisto stimato diminuisce del 12%.`,
    pitfalls: `Considerarlo un modo di aggirare il consenso: il tracciamento lato server è comunque trattamento di dati personali, e senza base giuridica è illecito. Un altro errore è inviare tutto al server: occorre filtrare e minimizzare i dati prima di trasmetterli. Se non si deduplicano gli eventi inviati sia dal browser sia dal server, le conversioni si contano due volte. Infine, l'infrastruttura va gestita: un server di tracciamento che si ferma fa perdere eventi, quindi servono monitoraggio, dimensionamento e un piano di recupero.`,
    related: ['precision-tracking', 'tracking-plan', 'gdpr', 'first-party-data', 'attribution-models'],
  },

  sla: {
    why: `Quando un servizio è lento o fermo, senza un impegno scritto la discussione si riduce a "secondo me dovrebbe essere più veloce". Un accordo sul livello di servizio fissa in termini misurabili cosa il fornitore si impegna a garantire, e cosa succede se non lo fa. Vale tra aziende e cliente, ma anche tra team interni: se il team dati promette che il report di vendita sarà pronto entro le 7:00, gli altri possono costruirci sopra le proprie decisioni.`,
    how: `Si definiscono uno o più indicatori di livello di servizio, per esempio disponibilità, tempo di risposta, freschezza dei dati, e per ciascuno un obiettivo misurabile e il periodo di misura. Si stabilisce come si misura, chi lo misura e come si comunicano i risultati. Si descrivono le conseguenze del mancato rispetto: crediti, escalation, piano di rimedio. All'interno, si usano obiettivi di servizio interni più stretti, che lasciano un margine rispetto all'impegno verso l'esterno. Si calcola il budget di errore, cioè il tempo di indisponibilità tollerato nel periodo.`,
    example: `Il team dati si impegna a rendere disponibile la tabella ordini aggiornata entro le 7:00 nel 99% dei giorni lavorativi. In un trimestre di 63 giorni lavorativi, il budget di errore è 0,63 giorni: al massimo un ritardo. A metà trimestre un guasto causa due ritardi e il team, avendo superato il budget, sospende per alcune settimane le nuove funzionalità e lavora sull'affidabilità. A fine periodo l'indicatore è 61 giorni su 63, cioè 96,8%, sotto l'obiettivo, e il team presenta un piano di recupero.`,
    pitfalls: `Fissare obiettivi irrealistici, come il 100% di disponibilità, che non è raggiungibile e porta a non rispettarli mai. Un altro errore è misurare ciò che è facile, per esempio il tempo di attività del server, e non ciò che interessa all'utente, come la freschezza dei dati. Un impegno senza misurazione automatica non è verificabile: le dispute diventano questioni di opinione. Infine, un SLA senza conseguenze concordate o senza un responsabile non cambia nulla nei comportamenti delle persone coinvolte.`,
    related: ['monitoring', 'observability', 'data-contract', 'dead-letter-queue', 'backpressure'],
  },

  'snowflake-schema': {
    why: `Nel modello a stella, una dimensione come il prodotto contiene in un'unica tabella anche categoria e reparto, ripetendo gli stessi valori migliaia di volte. Lo schema a fiocco di neve normalizza queste ripetizioni dividendo la dimensione in tabelle collegate. Riduce la ridondanza e semplifica la manutenzione, quando un attributo come il nome di una categoria cambia, ma aggiunge join alle query. È una scelta di compromesso, utile quando le gerarchie sono ampie e cambiano spesso.`,
    how: `Si parte da una tabella dei fatti con le misure (importi, quantità) e le chiavi verso le dimensioni. A differenza della stella, le dimensioni sono normalizzate in più livelli: il prodotto rimanda a una tabella categoria, che rimanda a una tabella reparto. Le query attraversano la catena con più join per riportare gli attributi. Si controlla che le chiavi siano uniche e che non ci siano riferimenti orfani. I motori moderni gestiscono bene i join, ma per ridurne il costo si possono materializzare viste appiattite per le analisi più frequenti.`,
    example: `Un catalogo ha 200.000 prodotti, 400 categorie e 12 reparti. In una dimensione denormalizzata ogni prodotto ripete nome di categoria e reparto: per rinominare una categoria si aggiornano in media 500 righe. Nello schema a fiocco di neve il nome sta in una sola riga della tabella categorie, e il cambiamento è immediato e coerente. Il costo è un join in più nelle query: su 480 milioni di ordini aggiunge circa 0,3 secondi, accettabile per una dimensione che cambia spesso.`,
    sql: `SELECT d.department_name, c.category_name, sum(f.amount_eur) AS revenue
FROM fact_sales f
JOIN dim_product p ON p.product_id = f.product_id
JOIN dim_category c ON c.category_id = p.category_id
JOIN dim_department d ON d.department_id = c.department_id
GROUP BY d.department_name, c.category_name
ORDER BY revenue DESC;`,
    pitfalls: `Normalizzare per principio, senza vantaggi reali, rende le query più lunghe e più lente: nei warehouse a colonne lo spazio risparmiato è minimo. Un altro errore è creare catene di dimensioni profonde che gli analisti non riescono a usare senza aiuto. Si dimentica che i join aumentano il rischio di duplicare righe se le chiavi non sono uniche. Infine, la scelta tra stella e fiocco di neve non va considerata definitiva: molti team partono dalla stella e normalizzano solo le dimensioni che lo richiedono.`,
    related: ['star-schema', 'dimensioni', 'data-warehouse', 'granularity', 'olap'],
  },

  'star-schema': {
    why: `Gli analisti vogliono rispondere a domande di business senza dover capire la struttura interna dei sistemi operativi. Lo schema a stella è il modello più semplice e diffuso per questo scopo: una tabella dei fatti al centro, con le misure, circondata da tabelle delle dimensioni, con il contesto. La struttura è facile da capire, le query sono brevi e veloci, e si può esplorare lo stesso dato da molti punti di vista senza riscrivere nulla.`,
    how: `La tabella dei fatti contiene una riga per evento di business a una granularità dichiarata (per esempio una riga d'ordine), le chiavi verso le dimensioni e le misure numeriche additive, come quantità e importo. Le dimensioni (cliente, prodotto, data, canale) sono tabelle denormalizzate con molti attributi descrittivi, ciascuna con una chiave unica. Le query uniscono i fatti alle dimensioni necessarie e aggregano. Si prepara una dimensione data con attributi come settimana, mese e festività. Si decide come trattare le dimensioni che cambiano nel tempo, conservando o no la storia.`,
    example: `Un negozio ha una tabella dei fatti con 480 milioni di righe d'ordine e quattro dimensioni: data, prodotto, cliente, canale. La domanda "ricavi per categoria e canale nel quarto trimestre, solo clienti nuovi" richiede un join con tre dimensioni e un filtro, una query di una decina di righe che risponde in mezzo secondo. Aggiungere la dimensione "promozione" a un fatto già esistente è un'operazione semplice: una nuova chiave nel fatto e una nuova tabella, senza toccare le altre.`,
    sql: `SELECT
    p.category,
    ch.channel_name,
    sum(f.amount_eur) AS revenue
FROM fact_order_lines f
JOIN dim_product p ON p.product_id = f.product_id
JOIN dim_channel ch ON ch.channel_id = f.channel_id
JOIN dim_date d ON d.date_id = f.date_id
WHERE d.quarter = 4 AND d.year = 2025
GROUP BY p.category, ch.channel_name
ORDER BY revenue DESC;`,
    pitfalls: `Mescolare in una sola tabella dei fatti eventi a granularità diverse, come ordini e righe d'ordine, porta a somme errate. Un altro errore è sommare misure non additive, per esempio un prezzo unitario o una percentuale, che vanno ricalcolate dai componenti. Si trascura la dimensione data, calcolando settimane e festività con funzioni diverse in ogni report. Infine, si lascia che i fatti contengano chiavi senza corrispondenza nelle dimensioni: le righe scompaiono nei join e i totali non tornano. Servono test di integrità referenziale.`,
    related: ['snowflake-schema', 'dimensioni', 'granularity', 'data-warehouse', 'olap'],
  },

  'streaming-processing': {
    why: `Scoprire una frode il giorno dopo vuol dire averla già pagata, e accorgersi alle nove del mattino che il sito era fermo dalle sei è un'occasione persa. L'elaborazione in streaming tratta i dati mentre arrivano, evento per evento o in piccole finestre, invece di aspettare il caricamento periodico. Serve quando il valore del dato decade in fretta: allarmi, personalizzazione, prezzi dinamici, monitoraggio operativo. Ha un costo di complessità che va giustificato dal beneficio della rapidità.`,
    how: `Gli eventi sono pubblicati su un sistema di messaggistica come Kafka e letti da un motore di elaborazione (Kafka Streams, Flink, Spark Structured Streaming) che applica trasformazioni, aggregazioni su finestre temporali e unioni tra flussi. Il motore gestisce lo stato, per esempio i conteggi parziali, e lo salva con punti di controllo per riprendere dopo un guasto. Si distinguono il tempo dell'evento da quello di arrivo, e si usano soglie di ritardo tollerato per gestire eventi in arrivo tardi. I risultati finiscono in un database analitico o in un altro topic.`,
    example: `Una piattaforma di pagamenti riceve 3.000 transazioni al secondo. Un'elaborazione in streaming calcola per ciascuna carta il numero di transazioni negli ultimi cinque minuti e blocca quelle sopra otto operazioni. La latenza media è di 120 millisecondi e le frodi individuate prima dell'autorizzazione passano da circa il 20% al 63% del totale, con un risparmio stimato di 180.000 euro al mese. Con un'elaborazione notturna lo stesso controllo avrebbe intercettato le frodi solo dopo il pagamento.`,
    pitfalls: `Adottare lo streaming quando basta un aggiornamento orario: aumenta i costi e la complessità di gestione senza vantaggi. Un altro errore è trascurare gli eventi in ritardo e fuori ordine, che falsano le aggregazioni se non gestiti con finestre e soglie adeguate. Si sottovalutano la gestione dello stato e il suo recupero dopo un guasto. Infine, i risultati in tempo reale sono spesso provvisori: per un report ufficiale conviene riconciliarli con un calcolo completo a posteriori.`,
    related: ['windowing', 'topic-kafka', 'backpressure', 'exactly-once-semantics', 'consumer-group-kafka'],
  },
};
