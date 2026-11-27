import type { TermBody } from '../../../lib/glossary';

export const bodies02: Record<string, TermBody> = {
  cac: {
    why: `Un'azienda può crescere velocemente e perdere denaro a ogni nuovo cliente senza accorgersene, se guarda solo il numero di iscritti. Il costo di acquisizione cliente mette accanto ciò che si spende per ottenere un cliente e ciò che quel cliente rende nel tempo. Da solo dice poco; confrontato con il valore del cliente nel tempo decide se un canale si può scalare o va spento, ed è la cifra che un investitore chiede per prima.`,
    how: `Si sommano i costi di acquisizione del periodo: media a pagamento, stipendi e strumenti di marketing e vendite, agenzie, eventi. Si divide per il numero di clienti nuovi acquisiti nello stesso periodo. Conviene calcolare due versioni: il CAC "blended", su tutti i clienti nuovi, e quello "paid", che divide la sola spesa pubblicitaria per i clienti attribuiti ai canali a pagamento. Per decidere il budget si segue per canale e si confronta con il periodo di recupero, cioè quanti mesi di margine servono per ripagarlo.`,
    example: `In un trimestre una società di software spende 60.000 euro in pubblicità, 30.000 in stipendi del team marketing e 10.000 in strumenti, per un totale di 100.000 euro, e acquisisce 250 clienti nuovi: il CAC blended è 400 euro. Ogni cliente porta 50 euro di margine lordo al mese, quindi il recupero richiede otto mesi. Se la sola ricerca a pagamento costa 55 euro per lead con una conversione del 10% in cliente, il suo CAC è 550 euro, più alto della media: da verificare prima di aumentare il budget.`,
    formula: `CAC = costi di vendita e marketing del periodo / nuovi clienti acquisiti nel periodo`,
    pitfalls: `L'errore più diffuso è escludere gli stipendi e contare solo la pubblicità, ottenendo un CAC bello e irrealistico. Un secondo errore è misurare il periodo sbagliato: se il ciclo di vendita dura tre mesi, la spesa di questo mese produce i clienti del trimestre prossimo, e dividere nello stesso mese distorce il rapporto. Infine, un CAC medio nasconde i canali: un canale economico ma con clienti che se ne vanno presto è meno conveniente di uno più caro con clienti fedeli.`,
    related: ['ltv', 'unit-economics', 'roas', 'churn-rate', 'attribution-models'],
  },

  'card-sorting': {
    why: `I menu di navigazione vengono spesso progettati con la logica interna dell'azienda: le sezioni rispecchiano i reparti, non i modi in cui gli utenti cercano le cose. Il card sorting porta il punto di vista dell'utente prima di costruire la struttura, ed è un metodo economico: bastano carte, un foglio di calcolo o un semplice strumento online. Serve a evitare di scoprire dopo il lancio che nessuno trova dove sta la pagina dei resi.`,
    how: `Si preparano da trenta a sessanta carte, ognuna con il nome di un contenuto o di una funzione. Nel card sorting aperto i partecipanti raggruppano le carte e danno un nome ai gruppi; in quello chiuso le assegnano a categorie già definite. Bastano da quindici a venti partecipanti per ottenere schemi stabili. Si analizzano i raggruppamenti con una matrice di similarità: le carte spesso insieme vanno nella stessa sezione, quelle sempre separate no. Il passo successivo è un tree test per verificare che la struttura scelta permetta di trovare i contenuti.`,
    example: `Un negozio di articoli sportivi prepara quaranta carte tra cui "taglie", "resi", "guida alla scelta delle scarpe" e "buoni regalo". Su venti partecipanti, diciotto mettono "taglie" e "guida alla scelta" nello stesso gruppo, che battezzano "Aiuto all'acquisto", mentre l'azienda aveva diviso i due contenuti in "Assistenza" e "Blog". Dopo la riorganizzazione, un tree test su quindici compiti mostra che il compito "trovare la politica dei resi" passa dal 52% al 87% di successo.`,
    pitfalls: `Un errore comune è proporre carte con parole che suggeriscono già la categoria, come "Assistenza resi", spingendo tutti nello stesso gruppo. Un altro è fidarsi di pochi partecipanti non rappresentativi: gli utenti esperti raggruppano diversamente dai nuovi. Infine, il card sorting indica come le persone organizzano le idee, non come cercano: per decidere l'etichetta di un menu serve poi un test di navigazione, altrimenti si ottiene una struttura elegante e difficile da usare.`,
    related: ['ux-research', 'usability-testing', 'sus', 'heatmap'],
  },

  cdc: {
    why: `Copiare ogni notte un intero database nel warehouse è lento, costoso e fa lavorare con dati vecchi di ore. Il Change Data Capture sposta soltanto le modifiche, mentre avvengono, e ha un effetto collaterale prezioso: conserva la storia di ciò che è cambiato, informazione che un'istantanea periodica perde. È la base per tenere sincronizzati sistemi operativi e analitici senza caricare il database di produzione con query pesanti.`,
    how: `Il metodo più affidabile legge il registro delle transazioni del database (il log in cui è scritta ogni modifica) e trasforma ogni inserimento, aggiornamento e cancellazione in un evento. Alternative più semplici sono i trigger sulle tabelle o una colonna "aggiornato il" interrogata a intervalli, che però non vede le cancellazioni. Gli eventi vengono pubblicati su uno stream, per esempio Kafka, e consumati dal warehouse, che applica le modifiche in ordine. Strumenti come Debezium automatizzano la lettura del log.`,
    example: `Una tabella ordini ha 8 milioni di righe e ogni giorno ne cambiano circa 40.000. Il caricamento notturno completo trasferisce 8 milioni di righe e il warehouse mostra i dati con undici ore di ritardo medio. Con il CDC si trasferiscono solo le 40.000 modifiche giornaliere, in pochi secondi dopo ciascuna. Inoltre l'evento di cancellazione di un ordine, che il caricamento completo trattava come una riga sparita senza traccia, ora è registrato con data e ora.`,
    pitfalls: `Si sottovalutano i cambi di schema: se una colonna viene rinominata a monte, il flusso può interrompersi o perdere dati finché non lo si adegua. Un secondo problema è l'ordine degli eventi: applicare un aggiornamento prima dell'inserimento corrispondente produce errori, quindi servono chiavi di partizione corrette. Infine, il log del database va conservato abbastanza a lungo: se il lettore resta fermo più della retention del log, il flusso va ricostruito partendo da una nuova istantanea completa.`,
    related: ['debezium', 'kafka-connect', 'etl', 'elt', 'idempotenza'],
  },

  cdp: {
    why: `Lo stesso cliente compare come un indirizzo email nel sistema di newsletter, un identificativo di cookie nell'analytics e un codice nel CRM, e nessuno sa che è la stessa persona. Una piattaforma di dati dei clienti riunisce questi frammenti in un profilo unico che le altre funzioni possono usare per segmentare, personalizzare e misurare. Senza di essa, ogni team lavora con una vista parziale e le comunicazioni si contraddicono.`,
    how: `Una CDP raccoglie dati da sito, app, CRM, email e punti vendita; li collega tramite identificativi (email, telefono, codice cliente) in un profilo unificato; li arricchisce con attributi calcolati, come il valore del cliente o l'ultimo acquisto; e li rende disponibili come segmenti verso gli strumenti di attivazione (email, pubblicità, personalizzazione del sito). Il consenso all'uso dei dati va registrato con il profilo e rispettato in ogni attivazione. In alcune architetture lo stesso ruolo lo svolge il data warehouse con uno strato di attivazione.`,
    example: `Un rivenditore ha 300.000 contatti nel CRM, 500.000 profili di navigazione e 220.000 iscritti alla newsletter. Il collegamento tramite email e identificativo di accesso riconosce 410.000 persone distinte, con 90.000 presenti in tutte e tre le fonti. Il segmento "ha guardato scarpe da corsa negli ultimi 14 giorni e non ha acquistato" ora comprende 6.200 persone e ottiene un tasso di acquisto del 3,1% dopo un'email dedicata, contro l'1,2% dell'email generica.`,
    pitfalls: `Si compra uno strumento prima di definire quali decisioni deve supportare, e il profilo unico resta una scatola piena di dati inutilizzati. Un errore tecnico è unire profili sulla base di identificativi deboli, per esempio un computer condiviso: due persone diverse diventano una sola. Dal lato legale, collegare i dati non è lecito per il solo fatto di essere possibile: servono base giuridica e consenso adeguati, e va garantita la cancellazione su richiesta.`,
    related: ['first-party-data', 'segmentazione', 'pii', 'gdpr', 'server-side-tracking'],
  },

  'churn-rate': {
    why: `Un abbonamento che perde clienti è un secchio bucato: finché i clienti nuovi superano quelli persi la crescita nasconde il problema, poi si ferma. Il tasso di abbandono quantifica la perdita e determina quasi da solo il valore di un cliente nel tempo, perché la durata media della relazione è il suo inverso. Ridurlo di un punto percentuale vale spesso più di acquisire un altro punto di clienti.`,
    how: `Si conta quanti clienti attivi a inizio periodo hanno smesso di esserlo entro la fine dello stesso periodo e si divide per i clienti iniziali. Non si includono i nuovi arrivati del periodo nel denominatore. Esiste anche il churn dei ricavi, più utile per i contratti di valore diverso, che somma gli importi persi. Si legge per coorte di acquisizione e per segmento, perché i clienti appena arrivati e quelli storici si comportano in modo molto diverso, e si accompagna con i motivi di cancellazione raccolti.`,
    example: `A inizio mese un servizio ha 5.000 clienti e 175 disdicono entro fine mese: il churn mensile è 3,5%. La durata media attesa di un cliente è circa 1 / 0,035, cioè 28,6 mesi. Se il team riduce il churn al 2,5% con un'offerta di pausa dell'abbonamento, la durata attesa sale a 40 mesi: lo stesso cliente vale circa il 40% in più, senza cambiare il prezzo.`,
    formula: `churn mensile = clienti persi nel mese / clienti attivi a inizio mese`,
    sql: `SELECT
    m AS month,
    countIf(started_at < m AND (churned_at IS NULL OR churned_at >= m)) AS active_at_start,
    countIf(started_at < m AND churned_at >= m AND churned_at < addMonths(m, 1)) AS churned,
    round(churned / active_at_start * 100, 2) AS churn_pct
FROM customers
ARRAY JOIN arrayMap(i -> addMonths(toDate('2026-01-01'), i), range(12)) AS m
GROUP BY m
ORDER BY m;`,
    pitfalls: `Dividere i clienti persi per il totale di fine periodo, includendo i nuovi arrivati, abbassa artificialmente il valore. Un altro errore è confrontare il churn mensile con quello annuale come se fossero la stessa grandezza: un 3% mensile equivale a circa il 31% annuo, non al 36%. Infine, il tasso medio nasconde il momento della perdita: se la maggior parte dei clienti se ne va nelle prime quattro settimane, il problema è l'onboarding, non la soddisfazione di lungo periodo.`,
    related: ['retention-rate', 'ltv', 'cohort-analysis', 'mrr', 'cac'],
  },

  clickhouse: {
    why: `Un database pensato per registrare ordini fatica quando si chiede di sommare cento milioni di righe di eventi per capire quale canale rende di più. ClickHouse è nato per questo secondo tipo di lavoro: risponde a domande aggregative su grandi volumi in frazioni di secondo, anche su hardware modesto. Per un team di analytics significa poter interrogare gli eventi grezzi invece di sintetizzarli in anticipo e perdere dettaglio.`,
    how: `ClickHouse salva i dati per colonna, li comprime in modo molto efficiente e li ordina secondo la chiave scelta in fase di creazione della tabella, in genere con il motore MergeTree. Una query legge solo le colonne richieste e salta i blocchi che la chiave di ordinamento e gli indici escludono. I dati si caricano in grandi blocchi, non riga per riga, e si trasformano al volo con viste materializzate. Per scegliere la chiave di ordinamento si guardano i filtri più frequenti, mettendo per prima la colonna più selettiva.`,
    example: `Una tabella di eventi contiene 2 miliardi di righe con 40 colonne. La domanda "quanti utenti unici per paese ieri" tocca tre colonne: data, paese e identificativo utente. Con l'ordinamento per data, ClickHouse legge solo la partizione di ieri e le colonne coinvolte, circa 4 GB invece dei 600 GB complessivi, e risponde in meno di un secondo. Lo stesso calcolo in un database a righe leggerebbe quasi tutta la tabella.`,
    sql: `CREATE TABLE events
(
    event_date Date,
    event_time DateTime,
    user_id UInt64,
    event_name LowCardinality(String),
    country LowCardinality(String)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_name, event_date, user_id);

SELECT country, uniqExact(user_id) AS users
FROM events
WHERE event_date = yesterday()
GROUP BY country
ORDER BY users DESC;`,
    pitfalls: `Si usa ClickHouse come database transazionale, aggiornando e cancellando singole righe di frequente: non è il suo mestiere e le operazioni costano molto. Un errore tipico è inserire pochi record alla volta, creando troppi piccoli blocchi da fondere in seguito. Un altro è scegliere la chiave di ordinamento senza guardare le query reali, perdendo il principale vantaggio. Infine, i join tra tabelle enormi richiedono attenzione: spesso conviene denormalizzare o usare dizionari per le dimensioni piccole.`,
    related: ['mergetree', 'columnar-storage', 'materialized-view', 'olap', 'partitioning'],
  },

  'cohort-analysis': {
    why: `Una media complessiva mescola utenti arrivati in momenti diversi e con esperienze diverse: se il prodotto migliora, i vecchi utenti peggiori tirano giù i numeri e nascondono il progresso. L'analisi per coorti confronta gruppi di utenti con la stessa data di partenza, così si vede se chi arriva oggi si comporta meglio di chi arrivava sei mesi fa. È lo strumento di base per misurare retention e per valutare l'effetto di un cambiamento nel tempo.`,
    how: `Si definisce l'evento che fa nascere la coorte, per esempio la prima registrazione, e un'unità di tempo, come la settimana. Ogni riga della tabella è una coorte e ogni colonna è il periodo trascorso dalla nascita: nella cella si riporta la quota di utenti della coorte che compie l'azione di ritorno in quel periodo. Si legge in orizzontale, per vedere come decade una coorte, e in verticale, per confrontare coorti diverse nello stesso punto della loro vita.`,
    example: `La coorte di gennaio ha 1.000 utenti: 400 tornano nella settimana 1 (40%), 280 nella settimana 4 (28%). La coorte di aprile, dopo un nuovo onboarding, ha 1.200 utenti: 540 tornano nella settimana 1 (45%) e 372 nella settimana 4 (31%). La media complessiva dei ritorni nel mese di maggio potrebbe invece risultare invariata a causa di un afflusso di utenti nuovi: solo la tabella per coorti mostra il miglioramento reale.`,
    sql: `SELECT
    toStartOfWeek(first_seen) AS cohort_week,
    dateDiff('week', toStartOfWeek(first_seen), toStartOfWeek(event_date)) AS weeks_since,
    uniqExact(user_id) AS active_users
FROM (
    SELECT user_id, event_date, min(event_date) OVER (PARTITION BY user_id) AS first_seen
    FROM events
)
GROUP BY cohort_week, weeks_since
ORDER BY cohort_week, weeks_since;`,
    pitfalls: `Si scelgono coorti troppo piccole, e le variazioni casuali sembrano tendenze. Un errore frequente è confrontare coorti incomplete: l'ultima riga ha meno periodi osservati e non va letta accanto alle altre senza segnalarlo. Mescolare nella stessa coorte utenti di canali molto diversi nasconde le differenze tra loro. Infine, definire il ritorno in modo troppo generoso, per esempio una qualsiasi visita, gonfia i valori: l'azione di ritorno deve rappresentare il valore del prodotto.`,
    related: ['retention-rate', 'churn-rate', 'ltv', 'funnel-analysis', 'segmentazione'],
  },

  'columnar-storage': {
    why: `Nelle analisi si chiede quasi sempre di leggere poche colonne su moltissime righe: il totale dei ricavi, il numero di utenti per paese. Un archivio a righe è costretto a leggere anche i campi non richiesti, mentre uno a colonne no. Questa differenza di organizzazione fisica è la ragione principale per cui i database analitici sono molto più veloci e più compatti di quelli transazionali con gli stessi dati.`,
    how: `In un formato a colonne i valori di una stessa colonna sono memorizzati uno accanto all'altro. Questo porta tre vantaggi. Si leggono solo le colonne necessarie alla query. I valori simili e contigui si comprimono molto bene, con codifiche come il dizionario o la differenza dal valore precedente. Le operazioni si possono eseguire su blocchi di valori insieme, sfruttando la vettorizzazione delle CPU. Parquet e ORC sono formati su file, mentre ClickHouse o BigQuery applicano lo stesso principio nei loro motori.`,
    example: `Una tabella di 500 milioni di righe ha 30 colonne e occupa 400 GB in formato a righe. La query "somma dei ricavi per mese" usa due colonne. In un archivio a righe legge tutti i 400 GB; in uno a colonne legge le due colonne, che compresse valgono circa 6 GB. Anche l'occupazione totale scende: con la compressione tipica da 5 a 10 volte la stessa tabella occupa 40-80 GB, e meno dati da leggere significa risposte più rapide e costi minori.`,
    pitfalls: `Il formato a colonne non è adatto a leggere o scrivere singole righe intere, come in un'applicazione che mostra l'ordine di un cliente: lì il formato a righe è più efficiente. Un errore comune è selezionare tutte le colonne con SELECT *, perdendo il vantaggio principale. Inoltre, scritture frequenti di pochi record frammentano i file; si preferisce accumulare e scrivere a blocchi. Infine, l'ordinamento dei dati conta: ordinare per la colonna filtrata più spesso migliora molto la compressione e la lettura selettiva.`,
    related: ['parquet', 'clickhouse', 'olap', 'oltp', 'data-warehouse'],
  },

  'consumer-group-kafka': {
    why: `Un solo programma che legge un topic con milioni di messaggi all'ora presto non riesce a stare al passo, ma aggiungere lettori in modo disordinato produrrebbe messaggi elaborati due volte o saltati. Il gruppo di consumatori risolve il problema distribuendo il lavoro: più istanze della stessa applicazione si dividono le partizioni, ognuna leggendone una parte senza sovrapposizioni. Si ottengono scalabilità e tolleranza ai guasti con una semplice configurazione.`,
    how: `Ogni consumatore dichiara un identificativo di gruppo. Kafka assegna ogni partizione del topic a un solo consumatore del gruppo; se ne entra o ne esce uno, riassegna le partizioni (il cosiddetto rebalance). Il gruppo registra fino a quale posizione ha letto ogni partizione, chiamata offset, così dopo un riavvio riparte dal punto giusto. Gruppi diversi leggono lo stesso topic in modo indipendente: un gruppo può alimentare il warehouse e un altro un sistema di allarmi, ciascuno con la propria posizione.`,
    example: `Un topic ha 12 partizioni. Con 3 consumatori nel gruppo ogni istanza ne legge 4; aggiungendone altri 3, ciascuna ne legge 2 e la capacità di lettura raddoppia. Con 15 consumatori, però, 3 resterebbero inattivi, perché il numero di partizioni è il limite massimo del parallelismo. Se un'istanza cade, le sue 4 partizioni passano alle altre in pochi secondi e la lettura prosegue dall'ultimo offset confermato.`,
    pitfalls: `L'errore classico è pensare che più consumatori rendano sempre più veloce la lettura: oltre il numero di partizioni non cambia nulla. Un secondo problema sono i rebalance frequenti, causati da elaborazioni lente che superano il tempo massimo tra due richieste: il gruppo si ferma e riparte di continuo. Infine, confermare l'offset prima di aver completato l'elaborazione può far perdere messaggi in caso di crash; confermarlo dopo può causare duplicati, quindi servono operazioni idempotenti.`,
    related: ['topic-kafka', 'broker-kafka', 'backpressure', 'exactly-once-semantics', 'idempotenza'],
  },

  'conversion-rate': {
    why: `Portare più visitatori sul sito costa; far completare l'azione desiderata a una quota maggiore di quelli che già ci sono costa molto meno. Il tasso di conversione misura quanta parte del traffico arriva all'obiettivo e per questo è il punto di partenza di quasi ogni lavoro di ottimizzazione. Un aumento da 2% a 2,5% equivale ad avere il 25% di traffico in più, senza pagarlo.`,
    how: `Si divide il numero di conversioni per il numero di unità che avrebbero potuto convertire, scegliendo con cura sia il numeratore sia il denominatore: sessioni, utenti o visitatori unici? Un acquisto o un lead qualificato? La scelta cambia il valore anche di molto, quindi va fissata e documentata. Si calcola per canale, dispositivo e pagina di ingresso, dove le differenze sono grandi, e si segue nel tempo con intervalli di confidenza, perché con poche conversioni le oscillazioni sono casuali.`,
    example: `Un sito ha 80.000 sessioni al mese e 1.600 ordini: il tasso di conversione è 2,0%. Dal telefono provengono 56.000 sessioni con 840 ordini (1,5%), dal computer 24.000 sessioni con 760 ordini (3,2%). La media del 2,0% nasconde una differenza che indica dove lavorare: portare il telefono al 2% darebbe 280 ordini in più al mese, con lo stesso traffico e lo stesso budget.`,
    formula: `tasso di conversione = conversioni / sessioni (o utenti) nello stesso periodo`,
    sql: `SELECT
    device_category,
    count() AS sessions,
    countIf(has_purchase) AS orders,
    round(orders / sessions * 100, 2) AS cr_pct
FROM sessions
WHERE session_date >= today() - 30
GROUP BY device_category
ORDER BY sessions DESC;`,
    pitfalls: `Confrontare tassi con denominatori diversi, per esempio sessioni di un mese e utenti di un altro, produce differenze apparenti. Un secondo errore è ottimizzare solo il tasso a scapito del valore: abbassare il prezzo aumenta le conversioni e può ridurre i ricavi complessivi. Va considerato anche il tempo: se l'acquisto richiede giorni, il tasso calcolato troppo presto sottostima il risultato reale. Infine, un aumento osservato senza un test controllato può essere dovuto a un cambio nel mix di traffico.`,
    related: ['funnel-analysis', 'a-b-testing', 'bounce-rate', 'attribution-models', 'activation-rate'],
  },

  'data-contract': {
    why: `Un team di prodotto rinomina una colonna del proprio database senza avvertire nessuno e il giorno dopo la dashboard dei ricavi mostra zero. Succede perché chi produce i dati e chi li usa non hanno un accordo scritto. Il contratto sui dati stabilisce cosa si promette: struttura, significato, qualità e tempi, con un responsabile per ciascuno. Sposta l'attenzione dal rimediare ai guasti in dashboard al prevenirli alla fonte.`,
    how: `Un contratto descrive in un formato leggibile da macchina lo schema (campi e tipi), la semantica (cosa significa ogni campo e in quali unità), le regole di qualità (percentuale massima di valori nulli, unicità delle chiavi), gli obiettivi di servizio (freschezza dei dati, disponibilità) e le regole di evoluzione, come la compatibilità all'indietro. Si verifica in modo automatico nella pipeline: una modifica che viola il contratto fa fallire il controllo prima della messa in produzione. A ogni contratto si associa un proprietario che risponde delle violazioni.`,
    example: `Il team ordini pubblica una tabella con il contratto: order_id unico e non nullo, importo in euro con due decimali, aggiornamento entro quindici minuti dall'evento. Un giorno una modifica porta l'importo in centesimi. Il controllo automatico rileva che il valore massimo passa da 4.000 a 400.000 e blocca il rilascio. Senza contratto l'errore sarebbe arrivato fino ai report, con ricavi sovrastimati di cento volte e una decina di persone a cercarne la causa.`,
    pitfalls: `Un contratto scritto e mai verificato in automatico diventa presto documentazione obsoleta. Un altro errore è definirlo solo dal lato tecnico, dimenticando il significato: "cliente attivo" ha senso solo se la definizione è unica e condivisa. Capita anche di imporre il contratto dall'alto senza il consenso dei produttori, che lo aggirano. Infine, contratti troppo rigidi bloccano ogni modifica; servono regole di evoluzione chiare e un percorso per cambiare in sicurezza.`,
    related: ['schema-registry', 'backward-compatibility', 'sla', 'tracking-plan', 'observability'],
  },

  'data-lake': {
    why: `Non sempre si sa in anticipo quali domande verranno poste ai dati: oggi servono le vendite, domani i log dell'app, dopodomani le immagini. Un data lake conserva tutto nel formato originale e a basso costo, rimandando la struttura al momento dell'uso. Questa flessibilità permette di riutilizzare gli stessi dati per scopi nuovi, dall'analisi al machine learning, senza ricaricarli ogni volta da fonti che potrebbero non conservarli più.`,
    how: `I dati arrivano da molte fonti in uno storage di oggetti, per esempio S3, organizzati in zone: grezza (i dati come arrivano), pulita (validata, in formato a colonne come Parquet) e curata (aggregata e pronta per l'analisi). Un catalogo descrive tabelle e schemi, il partizionamento per data accelera le letture e i permessi di accesso si governano per zona. Motori SQL come Athena, Trino o Spark leggono i file direttamente. Formati di tabella come Iceberg aggiungono transazioni e aggiornamenti.`,
    example: `Una piattaforma raccoglie ogni giorno 200 GB di eventi dell'app in JSON, esporti del CRM in CSV e immagini dei prodotti. Salvarli in un data lake costa circa 23 dollari al mese per ogni 1.000 GB nello storage standard, molto meno di un warehouse per lo stesso volume. Quando il team data science chiede di riesaminare l'ultimo anno di eventi con un nuovo schema, i dati grezzi sono ancora lì e si ricostruisce la zona pulita senza chiedere nulla alle fonti.`,
    pitfalls: `Senza governance il lago diventa una palude: file senza descrizione, duplicati, nessuno sa quale cartella contiene la versione corretta. Un errore ricorrente è saltare la zona pulita e far interrogare ai report i dati grezzi, con risultati incoerenti tra team. Altri problemi sono i troppi file piccoli, che rallentano le letture, e la mancanza di controlli di accesso su dati personali. Infine, un lake non sostituisce il warehouse per le metriche ufficiali: le due cose si completano.`,
    related: ['data-warehouse', 's3', 'parquet', 'iceberg', 'glue'],
  },
};
