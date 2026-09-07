
Il passaggio al tracciamento server-side con API di conversione (Conversions API, Enhanced Conversions) non è un optional tecnico: recupera una parte del segnale perso lato browser e, soprattutto, permette di inviare conversioni qualificate dal CRM — lead diventati opportunità, opportunità diventate clienti. L'ordine di priorità è chiaro: prima gli eventi di acquisto o lead qualificato con identificatori consistenti (email hashata, ID click, valore), poi gli eventi di funnel intermedio, per ultimi i micro-eventi. Meglio tre eventi affidabili che quindici rumorosi: ogni evento debole aggiunto al training dell'algoritmo di bidding è rumore che peggiora l'ottimizzazione.

Per rendere tutto questo analizzabile, serve una vista di controllo che unisca spesa, conversioni di piattaforma e verità di backend per settimana, canale e segmento. La query seguente costruisce lo scheletro — adattala ai nomi reali delle tue tabelle:

```sql
-- Vista settimanale di controllo: unisce spesa ads e ordini di backend
-- per confrontare CPA di piattaforma e CPA reale sullo stesso grano
WITH spese AS (
  SELECT
    DATE_TRUNC('week', giorno) AS settimana,  -- grano settimanale: stabile e leggibile
    canale,                                    -- es. 'google_search', 'meta_prospecting'
    COALESCE(segmento, 'unknown') AS segmento, -- mai lasciare NULL nei raggruppamenti
    SUM(spesa_eur) AS spesa,                   -- costo sostenuto nel periodo
    SUM(conversioni_piattaforma) AS conv_piattaforma
  FROM ads_spend_daily
  WHERE giorno >= CURRENT_DATE - INTERVAL '180 days'
  GROUP BY 1, 2, 3
),
ordini AS (
  SELECT
    DATE_TRUNC('week', data_ordine) AS settimana,
    COALESCE(canale_ultimo_click, 'unknown') AS canale,
    COALESCE(segmento, 'unknown') AS segmento,
    COUNT(*) AS ordini_backend,                 -- verita interna: ordini reali, non pixel
    SUM(margine_eur) AS margine_totale         -- margine, non ricavo: decide la sostenibilita
  FROM ordini
  WHERE data_ordine >= CURRENT_DATE - INTERVAL '180 days'
  GROUP BY 1, 2, 3
)
SELECT
  s.settimana, s.canale, s.segmento, s.spesa,
  s.conv_piattaforma,
  COALESCE(o.ordini_backend, 0) AS ordini_backend,
  CASE WHEN s.conv_piattaforma > 0
    THEN ROUND(s.spesa / s.conv_piattaforma, 2) END AS cpa_piattaforma,
  CASE WHEN COALESCE(o.ordini_backend, 0) > 0
    THEN ROUND(s.spesa / o.ordini_backend, 2) END AS cpa_reale,
  CASE WHEN s.spesa > 0
    THEN ROUND(COALESCE(o.margine_totale, 0) / s.spesa, 2) END AS margine_per_euro
FROM spese s
LEFT JOIN ordini o
  ON s.settimana = o.settimana AND s.canale = o.canale AND s.segmento = o.segmento
ORDER BY s.settimana, s.canale, s.segmento;
```

Leggila così: se `cpa_piattaforma` e `cpa_reale` divergono improvvisamente, il problema è di misurazione; se salgono insieme con `margine_per_euro` in calo, il problema è di efficienza reale. E se un canale mostra un CPA di piattaforma eccellente ma un `margine_per_euro` sotto 1, sta comprando ricavi in perdita.

## Il sistema operativo settimanale: leggere, decidere, testare

L'analisi rende solo se diventa routine. Un ciclo settimanale efficace dura un'ora e segue sempre lo stesso copione: salute del dato, efficienza marginale, qualità delle coorti, una decisione. Saltare il primo passo invalida tutti gli altri — decidere su dati rotti è peggio che non decidere.

Il controllo inizia dai volumi: spesa erogata contro budget, quota di impression perse per budget o per ranking, CTR e CPC per intercettare fatica creativa o picchi d'asta. Poi l'efficienza: CPA reale e margine per euro per canale e segmento, confrontati con i target differenziati, non con la media storica. Poi la qualità: tasso di qualificazione dei lead o riacquisto precoce delle coorti recenti contro coorti comparabili. Chiudi con una sola decisione scritta — scala, riduci, sposta, testa — con soglia di successo e data di verifica. "Aumentiamo prospecting del 25% per due settimane; successo se il CPA marginale resta sotto 65€; verifica il lunedì 18" è una decisione; "ottimizziamo le campagne" non lo è.

Il monitoraggio delle anomalie evita reazioni impulsive ai rumori settimanali. Una metrica va approfondita solo quando esce dalla sua banda di oscillazione normale, stimata su una finestra mobile di 4-8 settimane. Lo script seguente segnala i movimenti che meritano attenzione:
