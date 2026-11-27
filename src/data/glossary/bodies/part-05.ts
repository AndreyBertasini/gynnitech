import type { TermBody } from '../../../lib/glossary';

export const bodies05: Record<string, TermBody> = {
  'key-result': {
    why: `Un obiettivo come "migliorare l'esperienza dei nuovi clienti" è bello da dire e impossibile da verificare: a fine trimestre ciascuno può sostenere di averlo raggiunto. I risultati chiave trasformano l'obiettivo in un numero con un valore di partenza e uno di arrivo, così a metà del periodo il team sa se è in linea e a fine periodo nessuno discute su cosa significhi essere riusciti. Servono a togliere l'ambiguità, non a compilare un modulo.`,
    how: `Ogni obiettivo ha da due a cinque risultati chiave. Ciascuno indica una metrica, il valore attuale e il valore da raggiungere entro una data: "portare l'attivazione a sette giorni dal 32% al 40% entro il 31 marzo". Deve descrivere un risultato e non un'attività: "lanciare la nuova guida" è un'azione, "ridurre del 20% le richieste di assistenza sull'avvio" è un risultato. Si assegna un responsabile, si aggiorna il punteggio ogni settimana con un valore da 0 a 1 e si valuta a fine periodo, con una nota su cosa si è imparato.`,
    example: `Obiettivo: "Far arrivare più nuovi utenti al primo valore". Risultato chiave 1: tasso di attivazione a sette giorni dal 32% al 40%. Risultato chiave 2: tempo mediano alla prima azione utile da 18 a 8 minuti. Risultato chiave 3: richieste all'assistenza nei primi sette giorni da 11 a 7 ogni 100 utenti nuovi. A fine trimestre i valori sono 38%, 9 minuti e 7,5 su 100: i punteggi, secondo l'interpolazione, sono 0,75, 0,9 e 0,88, e la media è circa 0,84, un risultato soddisfacente per un obiettivo ambizioso.`,
    pitfalls: `L'errore più comune è scrivere attività al posto di risultati, trasformando gli OKR in una lista di cose da fare. Un secondo errore è fissare obiettivi garantiti: se il team raggiunge sempre il 100%, le ambizioni sono troppo basse. Un terzo è scegliere metriche che si possono muovere senza migliorare il prodotto, per esempio contare iscrizioni gonfiate da un incentivo. Infine, collegare i risultati chiave direttamente ai bonus individuali spinge le persone a puntare basso e a nascondere le difficoltà.`,
    related: ['okr', 'objective', 'kpi', 'north-star-metric', 'actionable-metrics'],
  },

  kpi: {
    why: `Un'azienda monitora cento numeri e non ne sa interpretare nessuno: quando tutto è importante, nulla lo è. Un indicatore chiave di prestazione è una metrica scelta perché rappresenta un obiettivo di business e perché qualcuno si assume la responsabilità di muoverla. La differenza tra una metrica qualsiasi e un KPI non sta nel calcolo, ma nella decisione che accompagna il numero: se non cambia nulla quando sale o scende, non è un KPI.`,
    how: `Si parte dall'obiettivo strategico e si sceglie la metrica che meglio dice se lo si sta raggiungendo. Per ciascun KPI si documentano la formula, la fonte dei dati, il periodo, il valore obiettivo, la soglia di allarme e il responsabile. Si limita il numero: di solito da tre a sette per team. Si combinano indicatori di risultato e indicatori guida, e si fissano metriche di controllo che segnalano effetti collaterali, per esempio la soddisfazione quando si spinge sulle vendite. Si rivede ogni trimestre se il KPI è ancora quello giusto.`,
    example: `Un negozio online ha come obiettivo "crescere in modo redditizio". Sceglie tre KPI: ricavi netti mensili (obiettivo 500.000 euro), margine di contribuzione per ordine (almeno 18 euro) e tasso di riacquisto a 90 giorni (almeno 28%). Ogni KPI ha un responsabile e una soglia: sotto 16 euro di margine si sospendono gli sconti. A ottobre i ricavi sono 520.000 euro ma il margine scende a 15,4 euro: la crescita è stata comprata con sconti, e il team riduce le promozioni.`,
    pitfalls: `Scegliere i KPI perché sono facili da misurare e non perché sono importanti: le visite al sito sono semplici da contare e raramente guidano decisioni. Un altro errore è l'effetto della legge di Goodhart: quando una misura diventa un obiettivo, smette di essere una buona misura, perché le persone la ottimizzano a scapito del risultato reale. Si evita con metriche di controllo e con revisioni qualitative. Infine, un KPI senza definizione scritta cambia significato da un report all'altro e perde credibilità.`,
    related: ['metrica', 'north-star-metric', 'okr', 'vanity-metrics', 'actionable-metrics'],
  },

  'lagging-indicator': {
    why: `Il fatturato del mese scorso è un fatto: certifica che qualcosa è accaduto, ma nessuno può più cambiarlo. Gli indicatori di risultato, o in ritardo, misurano gli esiti finali e sono indispensabili per sapere se la strategia funziona, ma arrivano troppo tardi per correggere la rotta durante il periodo. Capire la differenza con gli indicatori anticipatori evita di guidare un'azienda guardando solo lo specchietto retrovisore.`,
    how: `Gli indicatori in ritardo misurano ciò che è già avvenuto: ricavi, profitto, abbandono dei clienti, soddisfazione dopo l'acquisto. Si usano per fissare l'obiettivo e per verificare, a intervalli regolari, se è stato raggiunto. Per renderli utili si associano a uno o più indicatori guida che si muovono prima e sono influenzabili dal team. Si verifica nel tempo la relazione tra i due: se le demo prenotate crescono e i ricavi no, o l'indicatore guida è sbagliato, o c'è un problema più avanti nel processo.`,
    example: `Un'azienda di software misura i ricavi ricorrenti, un indicatore in ritardo: a ottobre sono 310.000 euro, il 6% sotto l'obiettivo. Il dato arriva a metà novembre e non si può più recuperare ottobre. Guardando indietro si vede che già a settembre le demo prenotate erano scese del 22% rispetto al trimestre precedente: l'indicatore guida mostrava il problema con sei settimane di anticipo. Da allora il team controlla le demo ogni settimana, e interviene sui canali di acquisizione quando calano.`,
    pitfalls: `Gestire un team solo con indicatori in ritardo equivale a ricevere una pagella a fine anno: il giudizio è chiaro, ma il tempo per cambiare è finito. Un errore opposto è abbandonarli a favore di soli indicatori guida, che possono muoversi senza produrre risultati. Un altro problema è il ritardo variabile: nei contratti annuali, la disdetta compare nei ricavi molti mesi dopo il segnale di disaffezione. Infine, non vanno confusi con le metriche di vanità: un indicatore in ritardo può essere importante e valido.`,
    related: ['leading-indicator', 'kpi', 'okr', 'churn-rate', 'north-star-metric'],
  },

  'leading-indicator': {
    why: `Aspettare di vedere i ricavi per scoprire che qualcosa non va significa reagire con settimane di ritardo. Gli indicatori anticipatori, o guida, si muovono prima del risultato finale e, soprattutto, il team può influenzarli direttamente con le proprie azioni. Sono ciò che trasforma un obiettivo lontano in un lavoro settimanale: nessuno può "aumentare il fatturato" entro venerdì, ma può aumentare il numero di conversazioni con clienti qualificati.`,
    how: `Si cerca la relazione tra il risultato finale e le attività che lo precedono, partendo dalla storia dei dati: quali comportamenti, osservati presto, predicono l'esito? Si confrontano coorti di clienti che hanno avuto successo o abbandonato e si individuano le azioni che li distinguono. Si sceglie un indicatore che sia misurabile con frequenza (giornaliera o settimanale), controllabile dal team e correlato in modo stabile con il risultato. Si verifica periodicamente che la relazione regga, perché può indebolirsi quando il prodotto o il mercato cambiano.`,
    example: `Un servizio in abbonamento nota che i clienti che invitano almeno un collega entro 14 giorni hanno una retention a 90 giorni del 71%, contro il 29% degli altri. "Inviti inviati nelle prime due settimane" diventa l'indicatore guida: oggi il 18% dei nuovi clienti lo fa. Il team lavora per portarlo al 30% con un promemoria e un invito più semplice. Dopo due mesi la quota è al 27% e la retention a 90 giorni stimata passa dal 38% al 44%, prima ancora che i ricavi lo mostrino.`,
    pitfalls: `Si confonde la correlazione con la causa: chi invita colleghi potrebbe essere già un cliente motivato, e forzare gli inviti non produce lo stesso effetto. Si risolve con esperimenti. Un altro errore è scegliere un indicatore guida che il team può manipolare senza migliorare il risultato, come inviare inviti automatici a contatti casuali. Si rischia anche di moltiplicare gli indicatori: pochi, ben scelti, valgono più di dieci. Infine, una relazione valida in un periodo può non reggere in un altro: va riverificata.`,
    related: ['lagging-indicator', 'actionable-metrics', 'kpi', 'retention-rate', 'activation-rate'],
  },

  ltv: {
    why: `Sapere quanto costa acquisire un cliente non basta a decidere se conviene: serve sapere quanto vale nel tempo. Il valore del cliente nel tempo stima i ricavi, o meglio il margine, che un cliente genererà durante l'intera relazione, e permette di stabilire quanto è ragionevole spendere per ottenerlo. Il rapporto con il costo di acquisizione è il numero più usato per decidere se un canale o un'intera attività può crescere in modo sostenibile.`,
    how: `Il calcolo più semplice moltiplica il margine medio per cliente al mese per la durata media attesa, che è l'inverso del tasso di abbandono. Una versione più accurata somma i margini mensili di una coorte per tutta la sua storia osservata e stima la coda con un modello di decadimento. Si calcola per segmento di acquisizione e per piano, e si usa il margine lordo, non il ricavo, per non sovrastimare. Per decisioni di budget si sconta il valore futuro e ci si limita a un orizzonte realistico, per esempio 24 o 36 mesi.`,
    example: `Un servizio ha un ricavo medio di 30 euro al mese per cliente, un margine lordo del 70% (21 euro) e un abbandono mensile del 4%. La durata attesa è 1 / 0,04 = 25 mesi, quindi il LTV è 21 × 25 = 525 euro. Con un costo di acquisizione di 150 euro il rapporto LTV/CAC è 3,5: sano. Se il canale più veloce porta clienti con abbandono dell'8%, il LTV scende a 262 euro e il rapporto a 1,75, sotto la soglia che molti considerano prudente (3).`,
    formula: `LTV = margine mensile per cliente x (1 / tasso di abbandono mensile)`,
    pitfalls: `Usare il ricavo al posto del margine gonfia il valore e porta a spendere troppo per acquisire. Un altro errore è applicare un abbandono medio a clienti molto diversi: i primi mesi hanno abbandoni più alti e poi si stabilizzano. Proiettare dieci anni da sei mesi di dati è una stima fragile: meglio fermarsi all'orizzonte osservabile. Infine, il LTV di una coorte vecchia non dice nulla su quella di oggi se il prodotto, il prezzo o i canali sono cambiati: va ricalcolato per coorti recenti.`,
    related: ['cac', 'churn-rate', 'arpu', 'unit-economics', 'cohort-analysis'],
  },

  'materialized-view': {
    why: `Una dashboard che somma ogni mattina un miliardo di righe per mostrare i ricavi di ieri è lenta e costosa, e lo è per tutti quelli che la aprono. Una vista materializzata calcola la risposta in anticipo e la conserva, così la lettura costa quanto leggere una piccola tabella. In ClickHouse il meccanismo è ancora più utile: la vista si aggiorna a ogni inserimento di nuovi dati, quindi i risultati aggregati sono sempre freschi senza ricalcolare nulla.`,
    how: `In ClickHouse una vista materializzata è una query che si applica a ogni blocco di dati inserito nella tabella sorgente e scrive il risultato in una tabella di destinazione. Per le aggregazioni si usa un motore come AggregatingMergeTree o SummingMergeTree, che combina i risultati parziali in modo corretto. La tabella di destinazione contiene gli stati aggregati e si interroga con funzioni di fusione. La vista agisce solo sui nuovi dati: per includere quelli storici serve un riempimento una tantum.`,
    example: `Una tabella di eventi riceve 50 milioni di righe al giorno. La dashboard mostra utenti unici e conteggi per ora e paese. Interrogare la tabella grezza richiede 8 secondi e legge 90 GB. Con una vista materializzata che aggrega per ora e paese la tabella di destinazione cresce di circa 20.000 righe al giorno e la stessa dashboard risponde in 40 millisecondi, leggendo pochi megabyte, con valori aggiornati entro un secondo dall'arrivo degli eventi.`,
    sql: `CREATE TABLE events_hourly
(
    hour DateTime,
    country LowCardinality(String),
    events SimpleAggregateFunction(sum, UInt64)
)
ENGINE = AggregatingMergeTree
ORDER BY (hour, country);

CREATE MATERIALIZED VIEW events_hourly_mv TO events_hourly AS
SELECT toStartOfHour(event_time) AS hour, country, count() AS events
FROM events
GROUP BY hour, country;`,
    pitfalls: `La vista elabora solo i dati inseriti dopo la sua creazione: dimenticare il riempimento dello storico produce una tabella che sembra corretta e non lo è. Un errore frequente è leggere la tabella di destinazione con una semplice somma quando contiene stati parziali non ancora fusi, ottenendo valori sbagliati se non si usano le funzioni di fusione. Un altro problema: la vista non vede aggiornamenti o cancellazioni nella sorgente. Infine, troppe viste sulla stessa tabella rallentano ogni inserimento.`,
    related: ['clickhouse', 'mergetree', 'olap', 'columnar-storage', 'data-warehouse'],
  },

  mergetree: {
    why: `ClickHouse può inserire milioni di righe al secondo e rispondere in millisecondi a query su miliardi di righe, e gran parte di questa prestazione dipende da come MergeTree organizza i dati su disco. Chi capisce il suo funzionamento sceglie bene chiave di ordinamento e partizioni e ottiene risposte rapide; chi lo ignora ottiene una tabella lenta con lo stesso hardware. È il motore su cui si basano quasi tutte le tabelle di produzione.`,
    how: `Ogni inserimento crea una "parte" ordinata secondo la chiave ORDER BY, e un processo in background fonde le parti piccole in parti più grandi. L'indice è sparso: non registra ogni riga ma un valore ogni 8.192, quindi occupa poca memoria e permette di saltare blocchi che non contengono i valori filtrati. La chiave di ordinamento va scelta in base ai filtri più frequenti, mettendo prima le colonne con meno valori distinti. PARTITION BY divide i dati per intervalli, di solito mensili, e serve soprattutto alla gestione, come l'eliminazione di dati vecchi.`,
    example: `Una tabella di eventi ordinata per (user_id, event_time) risponde bene alle domande su un singolo utente, ma una query come "tutti gli eventi di acquisto di ieri" deve scorrere l'intera tabella: 11 secondi. Ricreata con ORDER BY (event_name, event_date, user_id), la stessa query salta quasi tutti i blocchi e risponde in 0,15 secondi. La scelta della chiave ha cambiato i tempi di circa settanta volte senza modificare i dati né l'hardware.`,
    sql: `CREATE TABLE events
(
    event_date Date,
    event_time DateTime,
    event_name LowCardinality(String),
    user_id UInt64
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_name, event_date, user_id)
TTL event_date + INTERVAL 24 MONTH;`,
    pitfalls: `Inserire poche righe alla volta crea moltissime parti piccole che la fusione non riesce a smaltire, con il rischio di errori sul numero di parti: meglio inserire in blocchi di decine di migliaia di righe. Partizionare per giorno o per un valore con molti elementi produce troppe partizioni e rallenta tutto. Un altro errore è pensare che la chiave primaria garantisca l'unicità: in MergeTree serve solo a ordinare e indicizzare, e righe duplicate possono coesistere. Per aggiornamenti e cancellazioni frequenti esistono motori diversi.`,
    related: ['clickhouse', 'materialized-view', 'partitioning', 'columnar-storage', 'olap'],
  },

  metrica: {
    why: `Un'organizzazione che non misura non sa se migliora, ma una che misura troppo si perde. Una metrica è una misura quantitativa di un aspetto del business: ricavi, utenti attivi, tempo di caricamento. È la base di ogni conversazione basata sui dati, e il suo valore dipende interamente da quanto è chiara la sua definizione: due team con la stessa parola e formule diverse producono discussioni inutili sui numeri invece che sulle decisioni.`,
    how: `Una metrica ben definita ha cinque elementi: nome, formula con numeratore e denominatore, unità di misura, periodo di aggregazione e fonte dei dati. Si documenta in un catalogo condiviso, o in un livello semantico, in modo che dashboard e analisi usino la stessa definizione. Si distingue tra metriche di base, calcolate direttamente (ordini), e derivate, composte da altre (ricavo medio per ordine). Si accompagna con le dimensioni per cui si può scomporre e con una descrizione di cosa significa un aumento.`,
    example: `"Utenti attivi" in un'azienda può voler dire accessi, sessioni con almeno un'azione o utenti con acquisto: tre definizioni, tre numeri (92.000, 61.000, 14.500). Il catalogo stabilisce: "utente attivo = utente con almeno una delle azioni chiave nei 28 giorni precedenti", elenca le azioni, la fonte e il responsabile. Da quel momento il report commerciale, la dashboard di prodotto e la presentazione agli investitori mostrano lo stesso valore, 61.000, e la discussione si sposta su cosa farne.`,
    pitfalls: `Si cambia la definizione senza avvisare e si rompe il confronto con il passato: ogni modifica va versionata e, quando possibile, ricalcolata sullo storico. Un altro errore è misurare ciò che è facile e non ciò che conta, riempiendo le dashboard di numeri senza decisioni collegate. Si confondono anche metriche e KPI: il KPI è una metrica scelta e legata a un obiettivo. Infine, i rapporti nascondono i volumi: un tasso di conversione al 10% su dieci visite è molto meno solido dello stesso valore su diecimila.`,
    related: ['kpi', 'dimensioni', 'actionable-metrics', 'vanity-metrics', 'north-star-metric'],
  },

  monitoring: {
    why: `Un servizio può essere rotto per ore senza che nessuno se ne accorga, finché un cliente telefona. Il monitoraggio raccoglie continuamente misure sullo stato dei sistemi, come carico, errori, tempi di risposta e ritardo dei dati, e avvisa quando qualcosa esce dai limiti. Per una pipeline di dati significa scoprire in cinque minuti che il caricamento notturno non è partito, invece di scoprirlo quando il direttore commerciale vede un report vuoto alle nove.`,
    how: `Si definiscono le metriche che descrivono la salute del sistema: disponibilità, tasso di errori, latenza, volume di dati caricati, freschezza (età dell'ultimo dato) e qualità (valori nulli, duplicati). Si raccolgono con un sistema di metriche e si visualizzano in pannelli. Si impostano allarmi su soglie con significato, preferendo quelle legate all'impatto sugli utenti, e si indirizzano a una persona o a un turno di reperibilità. Per ogni allarme si scrive una procedura di intervento breve. Si rivedono periodicamente gli allarmi che scattano inutilmente.`,
    example: `Una pipeline deve completare il caricamento entro le 6:30. Il monitoraggio misura la freschezza della tabella ordini: alle 6:45 l'ultimo dato risale alle 22:10 del giorno prima e scatta un allarme al responsabile, con un link alla procedura. Alle 7:05 si scopre che un'autenticazione è scaduta, la si rinnova e il caricamento si completa alle 7:40. Senza allarme, la causa sarebbe emersa alle 9:30 con il report vuoto, e la giornata di analisi sarebbe stata persa.`,
    sql: `SELECT
    table,
    max(updated_at) AS last_update,
    dateDiff('minute', max(updated_at), now()) AS minutes_stale
FROM monitoring.table_updates
GROUP BY table
HAVING minutes_stale > 60
ORDER BY minutes_stale DESC;`,
    pitfalls: `Il difetto più diffuso è l'eccesso di allarmi: quando suonano di continuo per cose irrilevanti, le persone smettono di rispondere e perdono quello importante. Un altro è monitorare risorse (CPU, memoria) e non risultati: il server è sano ma i dati sono vecchi. Si trascura il monitoraggio del monitoraggio, e quando lo strumento cade nessuno lo sa. Infine, un allarme senza responsabile e procedura produce notifiche ignorate. Va associato a una persona, a una soglia motivata e a un'azione.`,
    related: ['observability', 'sla', 'dead-letter-queue', 'backpressure', 'data-contract'],
  },

  mrr: {
    why: `Chi vende abbonamenti non ha un fatturato lineare, ma una base di ricavi che si ripete ogni mese e cambia per nuove vendite, upgrade, riduzioni e disdette. Il ricavo mensile ricorrente fotografa questa base in un unico numero normalizzato, confrontabile da un mese all'altro. È più utile del fatturato di cassa perché non risente di pagamenti anticipati o annuali, e perché la sua variazione si scompone in cause che richiedono azioni diverse.`,
    how: `Si sommano i ricavi mensili dei contratti attivi, convertendo gli abbonamenti annuali in dodicesimi e i trimestrali in terzi. Restano fuori consulenze, attivazioni una tantum e consumi non ricorrenti. Si registra la variazione mensile come somma di quattro componenti: nuovo MRR (clienti nuovi), espansione (upgrade), contrazione (downgrade) e perdita (cancellazioni). La somma delle quattro dà la variazione netta. Si segue anche il tasso di crescita mensile e, per i clienti esistenti, il tasso di mantenimento netto dei ricavi.`,
    example: `A inizio mese l'MRR è 80.000 euro. Durante il mese: nuovi clienti per 7.500 euro, upgrade per 2.400, downgrade per 900 e cancellazioni per 3.200. La variazione netta è 7.500 + 2.400 - 900 - 3.200 = 5.800 euro, e l'MRR finale è 85.800 euro, +7,25%. Il tasso di mantenimento netto dei ricavi dei clienti esistenti è (80.000 + 2.400 - 900 - 3.200) / 80.000 = 97,9%: la base esistente quasi si mantiene, e la crescita dipende dai clienti nuovi.`,
    formula: `MRR = somma dei ricavi mensili ricorrenti dei contratti attivi`,
    pitfalls: `Contare nell'MRR clienti in prova gratuita o contratti non ancora attivi lo gonfia. Un altro errore è includere importi non ricorrenti, come un progetto di avvio. Convertire in dodicesimi un abbonamento annuale con forte sconto introduttivo senza segnalarlo porta a sovrastimare il valore dopo il rinnovo. Infine, l'MRR non è il ricavo contabile e non coincide con la cassa: va riconciliato con la contabilità, che segue regole di competenza diverse.`,
    related: ['arr', 'churn-rate', 'arpu', 'ltv', 'unit-economics'],
  },

  'north-star-metric': {
    why: `Un'azienda con dieci obiettivi di pari importanza tira in dieci direzioni: marketing spinge i download, prodotto le funzioni nuove, vendite i contratti. La metrica guida, o North Star, è il singolo numero che meglio rappresenta il valore che il prodotto dà ai clienti e che, se cresce in modo sano, predice la crescita dei ricavi. Serve ad allineare le decisioni: in caso di conflitto tra due strade, vince quella che la muove di più.`,
    how: `Si cerca l'azione che misura il valore ricevuto dal cliente, non dall'azienda: per un servizio di streaming sono le ore guardate, non i ricavi. La buona metrica guida esprime valore per il cliente, è un indicatore anticipatore dei ricavi, è influenzabile dal team e si misura con frequenza. Si scompone in un albero di fattori (ampiezza, frequenza, profondità, efficienza) che i diversi team possono muovere. Si accompagna con metriche di controllo, per evitare di migliorarla a scapito della qualità.`,
    example: `Un'app di ricette sceglie come metrica guida "ricette cucinate e valutate ogni settimana", oggi 42.000. Perché non "download"? Perché non indicano valore. Si scompone in utenti attivi settimanali (28.000) per ricette medie per utente (1,5). Il team di acquisizione lavora sul primo fattore, quello di prodotto sul secondo con suggerimenti basati sulla dispensa. Dopo un trimestre, il valore è 51.000, con una crescita costante degli abbonamenti, a conferma della relazione con i ricavi.`,
    pitfalls: `Scegliere i ricavi come metrica guida: sono un risultato, non una misura di valore, e spingono a decisioni di breve periodo. Un secondo errore è sceglierne una che il team non può influenzare. Si cade anche nella trappola di ottimizzare solo quella, abbassando la qualità per far salire il numero, per esempio con notifiche invadenti. Infine, la metrica guida non è per sempre: quando il prodotto o il modello di business cambiano, va riesaminata, così come il suo legame con la crescita dei ricavi.`,
    related: ['kpi', 'metrica', 'okr', 'leading-indicator', 'actionable-metrics'],
  },

  nps: {
    why: `Chiedere ai clienti se sono soddisfatti produce risposte gentili e poco utili. Il Net Promoter Score pone una domanda più concreta, quanto consiglieresti questo prodotto a un amico o a un collega, e la trasforma in un numero seguibile nel tempo. Non spiega perché i clienti sono contenti o scontenti, ma è un buon segnale di fedeltà e un rapido termometro per accorgersi che qualcosa è cambiato, soprattutto se accompagnato dai commenti liberi.`,
    how: `Si chiede una valutazione da 0 a 10. Chi risponde 9 o 10 è un promotore, 7 o 8 è un passivo, da 0 a 6 un detrattore. L'indice è la percentuale di promotori meno la percentuale di detrattori, e va da -100 a +100. Si invia in momenti coerenti, per esempio dopo trenta giorni d'uso o dopo un'interazione con l'assistenza, e si aggiunge sempre una domanda aperta sul motivo. Si segue per segmento e si legge con l'intervallo di confidenza, perché con poche risposte il valore oscilla molto.`,
    example: `Su 400 risposte, 190 sono promotori (47,5%), 130 passivi e 80 detrattori (20%): NPS = 47,5 - 20 = +27,5. Il mese dopo, con 380 risposte, i promotori sono 175 (46,1%) e i detrattori 95 (25%): NPS = +21,1. Il calo è reale? Con questi campioni l'intervallo di confidenza di ciascuna misura è di circa ±8 punti, quindi la variazione non è conclusiva. I commenti, però, citano per un terzo dei detrattori lo stesso problema di fatturazione: ecco dove intervenire.`,
    formula: `NPS = % promotori (9-10) - % detrattori (0-6)`,
    pitfalls: `Confrontare l'NPS tra settori o paesi è fuorviante: le abitudini di risposta cambiano molto. Un secondo errore è il tasso di risposta basso e distorto: se rispondono soprattutto gli arrabbiati o i più entusiasti, il numero non rappresenta la base. Un terzo è perseguire il punteggio, per esempio chiedendo ai clienti di rispondere 10, invece di risolvere i problemi. Infine, come ogni misura di opinione, anticipa il comportamento ma non lo sostituisce: va confrontato con retention e riacquisto reali.`,
    related: ['sus', 'ux-research', 'retention-rate', 'churn-rate', 'pmf'],
  },
};
