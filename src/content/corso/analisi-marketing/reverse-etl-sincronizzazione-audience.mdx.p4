## Frequenze, volumi e costi di una sincronizzazione sana

Il costo di un sync ha tre componenti e solo una è evidente. La prima è il **compute del warehouse**: ogni esecuzione lancia query sulla sorgente e sulla tabella di stato del delta. Con segmenti da poche centinaia di migliaia di righe e sync orari, su warehouse moderni si parla di cifre gestibili; ma dieci segmenti con full refresh orario su tabelle non partizionate trasformano il Reverse ETL nella voce di costo che nessuno sa spiegare al CFO. Partizionare per data di aggiornamento, materializzare gli intermedi con dbt e preferire il delta dove la stabilità lo consente tengono il conto sotto controllo.

La seconda componente sono i **limiti delle API di destinazione**. Meta, Google e TikTok impongono rate limit e quote su aggiunte, rimozioni e dimensione delle audience; superarli significa sync parziali che sembrano riusciti nei log interni ma arrivano monchi. Le contromisure sono standard ma vanno implementate davvero: batch dimensionati secondo la documentazione di ciascuna API, backoff esponenziale con jitter sui 429, coda con priorità che favorisce soppressioni e segmenti a scadenza breve, e un full refresh di riconciliazione quando il contatore degli errori supera una soglia. Il codice di invio, anche quando delegato a uno strumento come Hightouch, Census o il connettore nativo, merita un test su audience sandbox prima di toccare quelle che spendono.

La terza componente è il **costo opportunità del budget**: un segmento stantio che trattiene acquirenti già convertiti brucia impressioni a CPM pieni. Quantificarlo rende il sync difendibile in riunione: se il 12% delle impressioni di una campagna da 50.000 euro mensili colpisce utenti che andavano esclusi, il sync orario che riduce quella quota al 3% vale 4.500 euro al mese prima ancora di migliorare il targeting. Questo è il calcolo che giustifica l'investimento in frequenze alte dove contano — soppressioni ed esclusioni — e frequenze basse dove bastano.

```python
# Stima del budget sprecato per esclusioni stantie
# Tutti i valori sono mensili e vanno letti come ordini di grandezza

spend_mensile = 50_000          # euro spesi sulla campagna
quota_stantia = 0.12            # frazione di impression su utenti da escludere
quota_residua = 0.03            # quota attesa con sync orario delle soppressioni

spreco_attuale = spend_mensile * quota_stantia   # 6.000 euro/mese
spreco_residuo = spend_mensile * quota_residua   # 1.500 euro/mese
risparmio = spreco_attuale - spreco_residuo      # 4.500 euro/mese

print(f"Risparmio stimato: {risparmio:,.0f} euro/mese")
```

## Quando il sync si rompe: diagnosi e monitoraggio

I sync si rompono in modi ripetitivi, e riconoscerli dal sintomo dimezza il tempo di riparazione. Il **crollo improvviso della dimensione** — segmento da 200.000 a 20.000 righe in un'esecuzione — punta quasi sempre a monte: una tabella sorgente non aggiornata dall'ingestion, un filtro data che esclude tutto dopo un cambio di fuso, una join contro una dimensione ricaricata a metà. Il **drift lento** — calo del 2% al giorno per due settimane — suggerisce un criterio che decade: finestra mobile su eventi con retention limitata, consenso che scade per coorti storiche, cookie che muoiono senza rinnovo. Il **match rate che crolla** a segmento stabile indica un problema di identificatori: nuova sorgente di email non normalizzate, cambio di formato dei telefoni dopo una migrazione CRM, piattaforma che ha stretto le policy. Le **uscite mancate** — utenti che comprano e continuano a vedere retargeting — denunciano quasi sempre latenza: ingestion giornaliera del gestionale ordini contro sync orario che gira a vuoto su dati vecchi.

Il monitoraggio minimo che intercetta tutti e quattro i casi sta in cinque controlli per sync: dimensione del segmento con bande di variazione attesa, churn ingressi-uscite, tasso di errore delle API per codice, match rate riportato dalla piattaforma, ritardo tra evento sorgente e conferma di scrittura. Ognuno con soglia e owner, ognuno con runbook di una pagina: dove guardare prima, quale query lanciare, quando fermare il sync invece di lasciarlo spedire dati sospetti. La regola aurea: un sync fermo con alert è un incidente gestito; un sync che spedisce spazzatura in silenzio è un danno — di budget, di reputazione, di conformità.

Un accorgimento che ripaga sempre è il **gate di qualità pre-invio**: prima di chiamare le API, il job verifica che la dimensione rientri nelle bande, che la quota di righe senza identificatori validi sia sotto soglia e che il timestamp di freschezza delle tabelle sorgente sia recente. Se un controllo fallisce, il sync salta l'esecuzione, registra il motivo e avvisa. Meglio una destinazione ferma di sei ore su dati di ieri che una destinazione aggiornata con 3.000 righe corrotte che impiegheranno giorni a essere riassorbite — soprattutto sulle piattaforme dove le rimozioni hanno limiti giornalieri più stretti delle aggiunte.
