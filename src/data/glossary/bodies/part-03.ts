import type { TermBody } from '../../../lib/glossary';

export const bodies03: Record<string, TermBody> = {
  'data-warehouse': {
    why: `Quando il marketing dice che i clienti nuovi sono 1.200 e la finanza ne conta 1.050, la discussione sui numeri consuma più tempo dell'analisi. Un data warehouse risolve il problema alla radice: raccoglie in un solo posto dati provenienti da sistemi diversi, applica definizioni condivise e li conserva in una forma pensata per rispondere a domande. Diventa così la fonte unica da cui partono dashboard, report e analisi, e l'unico luogo in cui "cliente attivo" ha un solo significato.`,
    how: `I dati arrivano dai sistemi operativi tramite pipeline di caricamento, vengono ripuliti e modellati in tabelle dei fatti (eventi misurabili, come gli ordini) e tabelle delle dimensioni (contesto, come cliente e prodotto), spesso con uno schema a stella. Le trasformazioni si scrivono in SQL e si versionano, per esempio con dbt, con test su chiavi e valori. Gli utenti non interrogano le tabelle grezze ma i modelli finali. Si controllano i permessi per ruolo e si monitorano freschezza e qualità dei dati caricati.`,
    example: `Un'azienda con tre fonti, e-commerce, CRM e piattaforma pubblicitaria, carica ogni notte ordini, clienti e spesa. Nel warehouse la tabella "ordini" contiene 480.000 righe, collegata alla dimensione "clienti" con chiave unica e alla dimensione "canali". La domanda "quanto rende per euro speso ciascun canale nell'ultimo trimestre" richiede una query di una dozzina di righe, e il risultato coincide per tutti, perché la definizione di ricavo netto è scritta una sola volta nel modello.`,
    sql: `SELECT
    c.channel_name,
    r.revenue,
    sp.spend,
    round(r.revenue / sp.spend, 2) AS roas
FROM (SELECT channel_id, sum(net_revenue_eur) AS revenue
      FROM fact_orders WHERE order_date >= '2026-07-01' GROUP BY channel_id) r
JOIN (SELECT channel_id, sum(spend_eur) AS spend
      FROM fact_spend WHERE date >= '2026-07-01' GROUP BY channel_id) sp USING (channel_id)
JOIN dim_channel c USING (channel_id)
ORDER BY roas DESC;`,
    pitfalls: `Si costruisce un warehouse enorme prima di sapere quali decisioni deve supportare, e dopo un anno nessuno si fida dei dati. Un errore frequente è lasciare le definizioni nei fogli di calcolo dei singoli team, ricreando il problema che il warehouse doveva risolvere. Un altro è caricare tutto senza controlli di qualità: una colonna che cambia significato rompe i report senza avvisare. Infine, serve un responsabile per ogni modello, altrimenti nessuno lo corregge quando la fonte cambia.`,
    related: ['data-lake', 'etl', 'elt', 'star-schema', 'olap'],
  },

  'dau-mau-ratio': {
    why: `Avere un milione di utenti attivi al mese è meno impressionante se ognuno apre l'app una volta sola. Il rapporto tra utenti attivi giornalieri e mensili misura la frequenza d'uso, cioè quanta parte della base mensile torna ogni giorno. Un prodotto con alto rapporto è entrato nelle abitudini; uno con rapporto basso è consultato solo quando serve, e questo cambia come lo si deve monetizzare e quali obiettivi di crescita ha senso porsi.`,
    how: `Si prende il numero medio di utenti attivi giornalieri in un mese e lo si divide per gli utenti attivi mensili dello stesso mese, con la stessa definizione di "attivo" (un'azione che porta valore, non la semplice apertura). Il risultato si legge come la quota di giorni, in media, in cui un utente mensile è presente: 20% equivale a circa sei giorni su trenta. Si calcola per segmento e per coorte e si accompagna con la distribuzione dei giorni attivi per utente, che dice più della media.`,
    example: `Un'app di meditazione ha 400.000 utenti attivi mensili e una media di 100.000 attivi al giorno: il rapporto è 25%, circa sette giorni attivi al mese per utente. Un'app di messaggistica con 400.000 mensili e 280.000 giornalieri arriva al 70%. Per la prima, un obiettivo sensato è portare il rapporto da 25% a 30% con promemoria e serie di giorni consecutivi; per la seconda il rapporto è già vicino al massimo e la crescita dipende dall'aumento degli utenti.`,
    formula: `DAU/MAU = media degli utenti attivi giornalieri nel mese / utenti attivi mensili`,
    sql: `SELECT
    d.month,
    m.mau,
    round(avg(d.dau)) AS avg_dau,
    round(avg(d.dau) / m.mau * 100, 1) AS dau_mau_pct
FROM (
    SELECT toStartOfMonth(event_date) AS month, event_date, uniqExact(user_id) AS dau
    FROM events WHERE event_name = 'key_action'
    GROUP BY month, event_date
) d
JOIN (
    SELECT toStartOfMonth(event_date) AS month, uniqExact(user_id) AS mau
    FROM events WHERE event_name = 'key_action'
    GROUP BY month
) m USING (month)
GROUP BY d.month, m.mau
ORDER BY d.month;`,
    pitfalls: `Scegliere un evento di attività troppo facile, come l'apertura dell'app generata da una notifica, gonfia il rapporto senza indicare un uso reale. Un altro errore è confrontare prodotti con frequenza d'uso naturalmente diversa: un servizio per la dichiarazione dei redditi non avrà mai un rapporto alto, e non per questo è sbagliato. Infine, la media nasconde la polarizzazione: il 25% può derivare da pochi utenti molto assidui e una grande maggioranza che passa una volta sola.`,
    related: ['retention-rate', 'product-analytics', 'kpi', 'north-star-metric', 'activation-rate'],
  },

  'dead-letter-queue': {
    why: `In una pipeline di eventi un solo messaggio malformato può bloccare tutto il flusso: il consumatore tenta di elaborarlo, fallisce, riprova all'infinito e dietro di lui si accumulano migliaia di messaggi sani. Una coda dei messaggi non elaborabili isola il problema: il messaggio difettoso viene spostato in un posto a parte e il flusso prosegue. L'errore resta visibile e recuperabile invece di sparire o di fermare il sistema.`,
    how: `Si definisce una politica di tentativi, per esempio tre prove con attesa crescente, e si decide quali errori sono temporanei (un database momentaneamente non raggiungibile, da riprovare) e quali permanenti (un campo obbligatorio mancante, da isolare subito). I messaggi che falliscono vengono scritti in un topic o una coda separata insieme ai metadati dell'errore: motivo, data, applicazione, posizione originale. Si imposta un allarme sul numero di messaggi in coda e si prevede una procedura per correggere e rielaborare.`,
    example: `Una pipeline riceve 2 milioni di eventi al giorno. Un'integrazione invia per errore 340 eventi senza identificativo utente. Senza DLQ la pipeline si blocca sul primo e per quattro ore non entra nulla nel warehouse. Con la DLQ i 340 eventi vengono spostati in pochi secondi, i restanti 1.999.660 sono elaborati normalmente e l'allarme scatta sulla coda. Il giorno dopo, corretta l'integrazione, si rielaborano i 340 eventi e nessun dato è perso.`,
    pitfalls: `Una DLQ che nessuno guarda è una discarica: i messaggi si accumulano e il problema non viene mai risolto. Serve un allarme e un responsabile. Un secondo errore è mandare in DLQ anche gli errori temporanei, perdendo la possibilità di un nuovo tentativo automatico. Infine, i messaggi vanno conservati con il contesto originale e senza modifiche, altrimenti la rielaborazione non è possibile; se contengono dati personali, vanno protetti e cancellati secondo le stesse regole del flusso principale.`,
    related: ['backpressure', 'topic-kafka', 'idempotenza', 'monitoring', 'kafka-connect'],
  },

  debezium: {
    why: `Leggere ogni pochi minuti l'intera tabella di un database di produzione per sapere cosa è cambiato è inefficiente e rischia di rallentare l'applicazione. Debezium sfrutta ciò che il database già scrive per la propria sicurezza, il registro delle transazioni, per trasformare ogni modifica in un evento senza interrogare le tabelle. È uno degli strumenti più usati per portare dati operativi verso il warehouse con bassa latenza e senza toccare il codice dell'applicazione.`,
    how: `Debezium gira come connettore dentro Kafka Connect. Si configura indicando il database sorgente, le tabelle da seguire e il formato degli eventi. Alla prima esecuzione esegue un'istantanea iniziale delle tabelle, poi legge in continuo il registro e pubblica un evento per ogni inserimento, aggiornamento e cancellazione, con i valori prima e dopo la modifica. Gli eventi finiscono in topic Kafka, uno per tabella, e da lì vengono consumati dal warehouse o da altri servizi. Il database deve avere il registro logico abilitato.`,
    example: `Un negozio online ha una tabella clienti in PostgreSQL. Debezium pubblica sul topic "shop.public.clienti" un evento con il record prima e dopo la modifica quando un cliente cambia indirizzo. Il warehouse riceve l'evento entro un paio di secondi e aggiorna la dimensione corrispondente, mentre un secondo consumatore invia la modifica al sistema di spedizione. Il carico aggiuntivo sul database è modesto, perché si legge un registro già scritto, invece di eseguire query ripetute sulle tabelle.`,
    pitfalls: `Se il connettore resta fermo più a lungo di quanto il database conserva il registro, perde la posizione e occorre ripartire con una nuova istantanea completa. Un altro problema è l'evoluzione dello schema: una colonna rinominata o un tipo cambiato può rompere i consumatori, per cui servono uno schema registry e regole di compatibilità. Infine, la cancellazione fisica di un record genera un evento speciale e un messaggio "tombstone" che i consumatori devono saper gestire, altrimenti il dato cancellato rimane a valle.`,
    related: ['cdc', 'kafka-connect', 'schema-registry', 'topic-kafka', 'etl'],
  },

  dimensioni: {
    why: `Un numero senza contesto, "ricavi: 480.000 euro", non guida nessuna azione. Le dimensioni sono gli attributi che permettono di scomporre il numero e capire dove nasce: per paese, canale, prodotto, dispositivo, mese. La stessa metrica, guardata attraverso la dimensione giusta, rivela il canale che rende poco o il paese che cresce. Scegliere e definire bene le dimensioni è metà del lavoro di modellazione dei dati.`,
    how: `In un modello dati le dimensioni sono le colonne qualitative per cui si raggruppa e si filtra, contrapposte alle metriche, che sono numeri da aggregare. Nel warehouse stanno in tabelle dedicate con una chiave unica e attributi descrittivi, collegate ai fatti. Per i valori che cambiano nel tempo, come il piano di abbonamento di un cliente, si decide se mantenere solo l'ultimo valore o conservare la storia con date di validità. Una dimensione ben progettata ha pochi valori distinti per i filtri e una gerarchia chiara, per esempio paese, regione, città.`,
    example: `Gli ordini di ottobre valgono 480.000 euro. Scomposti per canale: ricerca a pagamento 190.000, email 120.000, diretto 110.000, social 60.000. Per dispositivo: computer 300.000, telefono 180.000. Incrociando le due dimensioni si scopre che il telefono pesa solo il 12% dei ricavi della ricerca a pagamento, contro il 55% dei social: il budget sulla ricerca da telefono ha probabilmente un problema nel percorso di acquisto, che la media totale non avrebbe mostrato.`,
    pitfalls: `Troppe dimensioni nello stesso report producono celle con pochi dati e conclusioni casuali. Un errore comune è usare dimensioni con troppi valori distinti, come l'identificativo utente, dove si dovrebbe raggruppare. Altri problemi nascono quando lo stesso attributo ha nomi diversi in sistemi diversi, "UK", "Regno Unito" e "GB", e le somme si spezzano. Infine, una dimensione che cambia nel tempo, come il responsabile di un cliente, va gestita con date di validità, altrimenti i dati storici vengono riassegnati.`,
    related: ['segmentazione', 'star-schema', 'granularity', 'metrica', 'data-warehouse'],
  },

  elt: {
    why: `Nel modello tradizionale i dati venivano trasformati su un server intermedio prima del caricamento, perché il database di destinazione era costoso e poco potente. Oggi i warehouse nel cloud calcolano velocemente e a costo contenuto, quindi conviene invertire l'ordine: caricare subito i dati grezzi e trasformarli dentro il warehouse. Il vantaggio è pratico: se una regola di business cambia, si ricalcola dai dati originali senza riestrarli dalle fonti.`,
    how: `Il processo ha tre passaggi. Estrazione: un connettore legge i dati dalle fonti (database, applicazioni, file). Caricamento: i dati arrivano nel warehouse senza modifiche significative, in un'area "grezza". Trasformazione: modelli SQL, di solito gestiti con uno strumento come dbt, producono le tabelle pulite e aggregate, con test e documentazione. La storia delle trasformazioni sta nel controllo di versione. Le fasi di pulizia, di integrazione e di calcolo delle metriche diventano così codice rivedibile, invece di logica nascosta dentro uno strumento grafico.`,
    example: `Una società estrae gli ordini da un'applicazione e li carica nel warehouse come tabella grezza di 3 milioni di righe. Un modello SQL calcola poi il ricavo netto sottraendo resi e sconti. Quando la finanza decide di escludere le spese di spedizione dal ricavo, si modifica una riga del modello e si rigenera la tabella in pochi minuti, anche per tutti i mesi passati. Con una trasformazione precedente al caricamento avrebbe richiesto di riestrarre tre anni di ordini.`,
    sql: `CREATE TABLE marts.orders_clean
ENGINE = MergeTree
ORDER BY order_id AS
SELECT
    order_id,
    customer_id,
    order_date,
    gross_amount - discount_amount - refund_amount AS net_revenue_eur
FROM raw.orders
WHERE status != 'cancelled';`,
    pitfalls: `Caricare tutto senza criterio porta con sé dati personali che non servono e crea costi di archiviazione e rischi di conformità; la minimizzazione va applicata già all'estrazione. Un altro errore è lasciare gli analisti a interrogare l'area grezza, dove i dati contengono duplicati e valori anomali. Infine, ELT non è sempre migliore: quando i dati sensibili vanno pseudonimizzati prima di uscire dal sistema di origine, una trasformazione preventiva (ETL) può essere richiesta dalla normativa.`,
    related: ['etl', 'data-warehouse', 'data-lake', 'cdc', 'data-contract'],
  },

  embeddings: {
    why: `Un motore di ricerca che confronta solo le parole non capisce che "scarpe da corsa" e "calzature per il running" parlano della stessa cosa. Gli embedding rappresentano testi, immagini o prodotti come punti in uno spazio numerico dove la vicinanza indica somiglianza di significato. Questo permette ricerca semantica, raccomandazioni e raggruppamenti senza costruire a mano un elenco di sinonimi, ed è alla base del recupero di documenti nei sistemi di AI generativa.`,
    how: `Un modello addestrato trasforma ogni elemento in un vettore di centinaia o migliaia di numeri. Si calcolano i vettori di tutti i documenti e si salvano in un indice. Alla query si calcola il vettore della domanda e si cercano i più vicini, di solito con la similarità del coseno, che misura l'angolo tra due vettori e va da -1 a 1. Per grandi quantità si usano indici approssimati, che trovano i vicini in modo molto veloce a costo di una piccola perdita di precisione. Il modello usato per i documenti e per la query deve essere lo stesso.`,
    example: `Un negozio ha 40.000 descrizioni di prodotto. Un cliente cerca "giacca impermeabile leggera per la bici". Una ricerca per parole trova solo le schede che contengono quei termini. Con gli embedding, il vettore della frase è vicino a quello di "k-way antipioggia traspirante da ciclismo", anche senza parole in comune. Il test su 200 ricerche reali mostra che il prodotto giusto compare nei primi cinque risultati nel 71% dei casi, contro il 54% della ricerca testuale.`,
    sql: `SELECT product_id, title,
       cosineDistance(embedding, [0.12, -0.03, 0.44]) AS distance
FROM product_embeddings
ORDER BY distance ASC
LIMIT 5;`,
    pitfalls: `Cambiare il modello di embedding rende i vettori già salvati incompatibili con quelli nuovi, per cui tutto l'indice va ricalcolato. Un altro errore è fidarsi della vicinanza senza valutarla: due testi vicini non sono necessariamente corretti per la domanda, e serve un insieme di prove con risposte attese per misurare la qualità. Infine, gli embedding ereditano i pregiudizi dei dati di addestramento e possono rivelare informazioni sensibili contenute nei testi; i dati personali vanno trattati con le stesse regole dei testi originali.`,
    related: ['product-analytics', 'segmentazione', 'columnar-storage', 'clickhouse'],
  },

  etl: {
    why: `Prima dei warehouse nel cloud i database analitici erano costosi e rigidi, quindi si trasformavano i dati con cura prima di caricarli, per occupare poco spazio e calcolo. Quella logica è ancora presente in molte aziende e in molti contesti regolati, quindi conoscere ETL serve per leggere i sistemi esistenti e per sapere quando è la scelta giusta. Capire la differenza con ELT evita di rifare tutto o di mantenere processi che non servono più.`,
    how: `Il processo si articola in tre fasi nell'ordine che dà il nome. Estrazione dalle fonti operative; trasformazione su un server intermedio, dove i dati vengono puliti, uniti, convertiti di formato e aggregati; caricamento del risultato nel warehouse. La logica si scrive in uno strumento dedicato o in script, e i lavori vengono pianificati con un orchestratore. Si registra ogni esecuzione e si controllano le quantità: righe lette, scartate, caricate. Un caricamento incrementale, che porta solo ciò che è cambiato dall'ultima esecuzione, riduce tempi e costi.`,
    example: `Ogni notte un lavoro legge 1,2 milioni di righe di vendite da tre punti vendita, converte le valute in euro, unifica i codici prodotto e scarta le righe con prezzo nullo, 340 in media. Carica nel warehouse 1.199.660 righe ordinate per prodotto. Il lavoro dura 45 minuti e di mattina i report sono pronti. Se un negozio invia i file in ritardo, il lavoro attende o salta quel negozio, e il report segnala la mancanza invece di mostrare un totale incompleto.`,
    pitfalls: `La trasformazione prima del caricamento perde il dato originale: se una regola era sbagliata, per correggere bisogna riestrarre dalle fonti, che potrebbero non conservare più la storia. Un altro difetto è la logica sparsa in strumenti grafici poco versionabili, che nessuno riesce a rivedere. Infine, i lavori notturni senza monitoraggio falliscono in silenzio e il problema emerge solo quando qualcuno nota un report vuoto; servono allarmi sull'esito e sul numero di righe caricate.`,
    related: ['elt', 'data-warehouse', 'cdc', 'idempotenza', 'monitoring'],
  },

  'event-properties': {
    why: `Sapere che un utente ha comprato qualcosa dice poco: per decidere servono prezzo, prodotto, categoria, codice sconto. Le proprietà dell'evento sono i dettagli che accompagnano l'azione tracciata e sono ciò che consente di scomporla in segmenti utili. Un evento senza proprietà è una conta; con le proprietà giuste diventa una fonte di domande a cui rispondere mesi dopo, senza ripetere il tracciamento.`,
    how: `Per ogni evento il piano di tracciamento elenca nome, quando scatta e proprietà: nome, tipo di dato, valori ammessi, obbligatoria o no. Si usano nomi coerenti in tutto il prodotto e tipi rigorosi: il prezzo è un numero con valuta in un campo separato, non una stringa come "12,50 €". Si distinguono le proprietà dell'evento, valide per quella singola azione, da quelle dell'utente, che descrivono chi la compie. Si convalidano in fase di sviluppo, rifiutando valori fuori dall'elenco.`,
    example: `L'evento "Purchase" porta le proprietà order_id, total_amount (numero), currency ("EUR"), product_category, coupon_code (opzionale) e payment_method. Con queste si risponde a domande che prima richiedevano un'analisi ad hoc: il valore medio dell'ordine è 64 euro, sale a 91 euro quando c'è un codice sconto del 10%, e il 38% degli acquisti con carta supera i 100 euro. Senza "payment_method" nessuno potrebbe stimare il costo delle commissioni per metodo.`,
    pitfalls: `Il problema più frequente è l'incoerenza: "product_id" in un evento e "productId" in un altro rendono impossibile unire i dati. Un altro è registrare dati personali come proprietà libere, per esempio l'email nel nome di una pagina, creando rischi legali. Si abusa anche di proprietà con valori quasi unici, come l'URL completo con parametri, che rendono inutili i raggruppamenti. Infine, aggiungere proprietà senza aggiornare il piano di tracciamento fa perdere il significato dei dati dopo pochi mesi. Una buona abitudine è rivedere ogni trimestre le proprietà realmente interrogate e rimuovere quelle che nessuno usa, riducendo costi di archiviazione e rischi sui dati personali.`,
    related: ['tracking-plan', 'user-properties', 'precision-tracking', 'dimensioni', 'server-side-tracking'],
  },

  'exactly-once-semantics': {
    why: `In un sistema distribuito una rete può cadere nel momento sbagliato: un messaggio viene inviato, la conferma si perde e il mittente lo reinvia. Il risultato è un pagamento registrato due volte o un evento contato doppio. La garanzia di elaborazione esattamente una volta promette che ogni messaggio produce il suo effetto una e una sola volta, anche con guasti. Per dati finanziari e metriche di ricavo è spesso un requisito, non un lusso.`,
    how: `Non è magia: nasce dalla combinazione di tre elementi. Produttori idempotenti, che numerano i messaggi in modo che Kafka scarti i duplicati di un reinvio. Transazioni, che rendono atomici la lettura dei messaggi, l'elaborazione e la scrittura del risultato con la conferma dell'offset. Consumatori che leggono solo i messaggi confermati. Questa garanzia vale entro il sistema; verso un database esterno bisogna rendere idempotente la scrittura, per esempio con una chiave unica che trasforma una seconda scrittura in un aggiornamento.`,
    example: `Un flusso conta i pagamenti per ora. Un guasto di rete costringe il produttore a reinviare 1.000 eventi. Con semantica "almeno una volta" il conteggio dell'ora risulta superiore di 1.000 unità: su 25.000 pagamenti reali è un 4% in più, e il ricavo dichiarato è gonfiato dello stesso 4%. Con produttore idempotente Kafka riconosce i numeri di sequenza e scarta i duplicati: il conteggio resta corretto. Per la scrittura sul warehouse si usa la chiave payment_id: una seconda consegna dello stesso pagamento sovrascrive la riga identica, senza raddoppiare l'importo.`,
    pitfalls: `Dare per scontato che la garanzia copra tutto il percorso: vale tra Kafka e le applicazioni che usano le sue transazioni, non per effetti esterni come l'invio di un'email, che non si può annullare. Un altro errore è pagare il costo in latenza e complessità dove basta l'idempotenza: spesso "almeno una volta" con scritture idempotenti dà lo stesso risultato in modo più semplice. Infine, senza test di guasto, simulando riavvii e perdite di rete, non si sa se la garanzia regge davvero.`,
    related: ['idempotenza', 'consumer-group-kafka', 'topic-kafka', 'streaming-processing', 'dead-letter-queue'],
  },

  'first-party-data': {
    why: `Con la fine dei cookie di terze parti e le norme sulla privacy, i dati comprati o raccolti da altri diventano meno disponibili e meno affidabili. I dati di prima parte sono quelli che l'azienda raccoglie direttamente dalle persone con cui ha una relazione: acquisti, iscrizioni, uso del prodotto. Sono più accurati, perché osservati e non dedotti, e più sicuri sul piano legale, perché il consenso è dato all'azienda stessa. Sono anche l'unico vantaggio che i concorrenti non possono copiare.`,
    how: `Si raccolgono con sito, app, punti vendita, programma fedeltà, CRM, richieste di assistenza. Per ogni fonte si definisce lo scopo, la base giuridica e il consenso necessario, e si informa la persona. Si costruisce valore dando qualcosa in cambio: un'esperienza migliore, un vantaggio, contenuti utili. I dati si uniscono con un identificativo comune, si arricchiscono con attributi calcolati e si attivano in canali propri, come email e personalizzazione, o in strumenti pubblicitari tramite liste di clienti consenzienti.`,
    example: `Un marchio di cosmetici ha 150.000 clienti con consenso al marketing. Usa lo storico acquisti per creare il segmento "ha comprato una crema viso più di 70 giorni fa", circa 11.000 persone, quando ne ha consumato la confezione. Un'email di riacquisto converte il 9,4% contro il 2,1% dell'email generica, e ogni acquisto ripetuto costa quasi nulla in pubblicità, rispetto ai 22 euro per cliente nuovo da campagne a pagamento.`,
    pitfalls: `Credere che siano dati lecitamente utilizzabili per qualsiasi scopo: raccolti per l'esecuzione di un contratto, non si possono riusare per il marketing senza una base giuridica adeguata. Un secondo errore è accumulare dati senza usarli, con rischi e costi senza benefici. Altri problemi sono la frammentazione tra sistemi, che impedisce un profilo unico, e la qualità bassa, con email false e doppioni. Infine, la dipendenza da un solo canale di raccolta rende fragile la strategia se cambia una regola di una piattaforma.`,
    related: ['cdp', 'gdpr', 'pii', 'privacy-by-design', 'server-side-tracking'],
  },

  'funnel-analysis': {
    why: `Un sito può avere un tasso di conversione del 2% e nessuno sa quale passaggio lo limiti: la pagina del prodotto, il carrello, il pagamento. L'analisi del funnel scompone il percorso verso l'obiettivo in passi e misura quanti utenti passano da uno al successivo, trasformando un numero complessivo in una mappa dei punti di perdita. È uno strumento per decidere dove concentrare gli esperimenti: migliorare il passo più debole ha il rendimento più alto.`,
    how: `Si definiscono i passi come eventi tracciati in un ordine, la popolazione di partenza (chi inizia il percorso) e la finestra di tempo entro cui completare ogni passo. Si calcola per ogni passo il numero di utenti e la percentuale rispetto al passo precedente e a quello iniziale. Si confrontano segmenti, per esempio dispositivi o canali, e si guarda il tempo medio tra un passo e l'altro. Un funnel rigido richiede l'ordine esatto; uno flessibile ammette passi in ordine diverso.`,
    example: `In una settimana 10.000 utenti vedono un prodotto; 3.200 lo aggiungono al carrello (32%); 1.440 iniziano il pagamento (45% del passo precedente); 960 completano l'ordine (67%). Il passo peggiore in assoluto è il primo, ma quello con più margine è il pagamento: da telefono il 62% dei 600 utenti che lo iniziano abbandona al modulo dell'indirizzo. Semplificare il modulo e portare l'abbandono al 50% darebbe circa 72 ordini in più a settimana.`,
    sql: `SELECT
    countIf(step >= 1) AS viewed,
    countIf(step >= 2) AS added_to_cart,
    countIf(step >= 3) AS started_checkout,
    countIf(step >= 4) AS purchased
FROM (
    SELECT user_id,
           windowFunnel(86400)(event_time,
               event_name = 'product_view',
               event_name = 'add_to_cart',
               event_name = 'begin_checkout',
               event_name = 'purchase') AS step
    FROM events
    WHERE event_date = yesterday()
    GROUP BY user_id
);`,
    pitfalls: `Misurare in assenza di una finestra temporale fa contare come conversioni utenti che tornano dopo mesi, o come abbandoni utenti che stanno ancora decidendo. Un errore ricorrente è considerare il funnel un percorso unico quando gli utenti ne fanno molti diversi: lo si legge meglio per segmento. Si confondono anche abbandono e perdita di tracciamento: un passo con cali improvvisi può essere un evento non più inviato. Infine, il funnel dice dove si perde, non perché: servono sessioni registrate e interviste.`,
    related: ['conversion-rate', 'bounce-rate', 'cohort-analysis', 'activation-rate', 'a-b-testing'],
  },
};
