# Scrivi Lezione GinnyTech

Sei incaricato di scrivere o riscrivere una lezione MDX per il corso GinnyTech (ginnytech.it).
Argomento/lezione: $ARGUMENTS

---

## REGOLE OBBLIGATORIE PER LEZIONI DI ALTA QUALITÀ

Analizza le lezioni migliori del corso (Ciclo-Deming-HADI, Framework-JTBD, Analisi-Coorte, Performance-Marketing) e applica questi standard:

### 1. STRUTTURA OBBLIGATORIA

Ogni lezione DEVE avere:
1. **Frontmatter completo**: `title`, `description`, `order`
2. **Hook iniziale**: perché questo argomento è importante (problema reale, non cliché come "il dato è il nuovo petrolio")
3. **Corpo con H2/H3 logici**: flusso coerente dalla teoria alla pratica
4. **Esempi concreti**: almeno 1 caso reale con numeri specifici
5. **Framework/template actionable**: qualcosa che lo studente può usare subito
6. **Recap o checklist finale**: consolidazione dei concetti chiave

### 2. PROFONDITÀ DEI CONTENUTI

**BUONO** (imita questi pattern):
- Citare fonti/ricercatori reali (Christensen, Kaplan, Binet/Field, Shewhart/Deming)
- Numeri specifici: "8.2M EUR potenziale", "75K waiting list", "marginal ROAS < 0.8x"
- Casi reali con nomi: McDonald's milkshake, Dropbox video MVP, Zappos scarpe
- Formule o algoritmi quando pertinenti (LTV, ICE score, Opportunity Score)
- Tabelle comparative tra framework/approcci diversi

**VIETATO** (questi sono segnali di bassa qualità):
- "In un mondo dove il dato è il nuovo petrolio..."
- "I Tre Pilastri Fondamentali" come struttura generica
- Scenari e-commerce + SaaS B2B identici copiati in ogni lezione
- Titolo che promette X ma contenuto che parla di Y
- Placeholder come "Componente Tecnologica / Metodologica / Umana" non riempiti
- Esercizi generici non correlati al topic della lezione

### 3. ESEMPI E CASI D'USO

Per ogni concetto teorico: **un esempio specifico e reale**.

Formato ideale:
```
Contesto → Problema → Insight/Soluzione → Risultato misurabile
```

Esempio eccellente (da Framework-JTBD):
> McDonald's stava cercando di aumentare le vendite di frullati.
> Scoprirono che la maggior parte veniva acquistata la mattina da pendolari.
> Il "job to be done" era tenere occupata la mano durante il tragitto, non saziarsi.
> Risultato: riformularono il frullato come prodotto da commute, +7% vendite.

### 4. COMPONENTI MDX DA USARE

```mdx
import { Aside, Steps, Tabs, TabItem } from '@astrojs/starlight/components'
```

- `<Aside type="tip">` — best practice o consiglio pratico
- `<Aside type="caution">` — errori comuni da evitare
- `<Aside type="note">` — approfondimenti o contesto aggiuntivo
- `<Steps>` — processi sequenziali (usa `1. passo` in lista numerata, NO code blocks dentro Steps)
- `<Tabs>/<TabItem>` — confronti tra approcci/tool alternativi
- Tabelle markdown — confronti framework, benchmark, metriche

### 5. FORMATI PER TIPO DI LEZIONE

**Lezione metodologica** (framework, processi):
- Contesto storico/origini del framework
- Teoria con schema visivo (mermaid se utile)
- Esempio passo-passo applicato
- Errori comuni + come evitarli
- Template/checklist usabile

**Lezione tecnica** (codice, tool):
- Perché questo strumento/approccio (vs alternative)
- Architettura/concetti chiave
- Codice funzionante con commenti esplicativi
- Considerazioni di produzione
- Troubleshooting o limitazioni note

**Lezione analitica** (metriche, statistiche):
- Problema che la tecnica risolve
- Formula/definizione precisa
- Come calcolarla / come interpretarla
- Trappole e bias comuni
- Benchmark di riferimento

### 6. LUNGHEZZA E DENSITÀ

- **Minimo**: 3.000 parole per lezione standard
- **Ottimale**: 5.000–9.000 parole per lezioni principali
- **Densità**: ogni paragrafo deve aggiungere valore — niente padding generico

### 7. CONTROLLO QUALITÀ FINALE

Prima di consegnare la lezione, verifica:
- [ ] Il titolo corrisponde esattamente al contenuto?
- [ ] C'è almeno 1 esempio con numeri reali?
- [ ] La lezione insegna qualcosa di specifico, non generico?
- [ ] Le frasi cliché sono state eliminate?
- [ ] Ogni sezione H2 ha contenuto sostanziale (>200 parole)?
- [ ] C'è un framework o template che lo studente può usare subito?
- [ ] Il tono è professionale ma accessibile (non accademico pesante)?

---

## LEZIONI DI RIFERIMENTO (studia questi file prima di scrivere)

I migliori esempi del corso:
- `src/content/corso/gestione-data-driven/framework-jtbd.mdx` — struttura e profondità
- `src/content/corso/analisi-prodotto/analisi-coorte.mdx` — rigore statistico + pedagogia
- `src/content/corso/analisi-marketing/performance-marketing.mdx` — profondità tecnica
- `src/content/corso/gestione-data-driven/ciclo-deming-hadi.mdx` — framework applicato
- `src/content/corso/gestione-data-driven/ricerca-quantitativa.mdx` — metodologia rigorosa

**Prima di scrivere**: leggi almeno 2 di questi file per calibrare il livello qualitativo atteso.
