import { describe, expect, test } from 'vitest';
import { convertLezioneLine, type AgentState } from './agent';

const nuovo = (): AgentState => ({ passo: 0 });

describe('convertLezioneLine', () => {
  test('una riga che non è un tag della lezione resta fuori', () => {
    expect(convertLezioneLine('Testo normale', nuovo())).toBeNull();
    expect(convertLezioneLine('<Aside title="x">', nuovo())).toBeNull();
  });

  test('Slide diventa titolo in grassetto con la stella', () => {
    expect(convertLezioneLine('<Slide sezione="1" titolo="Righe contro colonne" messaggio="OLTP legge una riga.">', nuovo())).toBe(
      '**Righe contro colonne** — ★ OLTP legge una riga.',
    );
  });

  test('i tag contenitore e di chiusura spariscono', () => {
    for (const tag of ['</Slide>', '<Confronto>', '</Confronto>', '<Passi>', '</Passi>', '<Opzioni>', '</Opzioni>', '<Barre>', '</Barre>', '<NumeriGrandi>', '</NumeriGrandi>', '</Relazioni>', '</Schema>', '</ErroreTipico>', '<Percorso />', '<TabellaDati evidenzia="2">', '</TabellaDati>']) {
      expect(convertLezioneLine(tag, nuovo())).toBe('');
    }
  });

  test('Schema e Passo diventano un elenco numerato', () => {
    const state = nuovo();
    expect(convertLezioneLine('<Schema sezione="2" titolo="Perché leggiamo solo alcune colonne">', state)).toBe('**Perché leggiamo solo alcune colonne**');
    expect(convertLezioneLine('<Passo testo="I dati sono in una tabella." />', state)).toBe('1. I dati sono in una tabella.');
    expect(convertLezioneLine('<Passo testo="Ogni colonna è un file a parte." />', state)).toBe('2. Ogni colonna è un file a parte.');
    expect(convertLezioneLine('<Passo testo="Leggiamo circa l\'1% dei dati." />', state)).toBe("3. Leggiamo circa l'1% dei dati.");
  });

  test('Lato con esempio e scelta', () => {
    expect(convertLezioneLine('<Lato nome="OLAP" sottotitolo="molte righe, poche colonne" esempio="SELECT avg(importo)" scelta="ClickHouse punta qui" />', nuovo())).toBe(
      '- **OLAP**: molte righe, poche colonne (`SELECT avg(importo)`) ← ClickHouse punta qui',
    );
  });

  test('Lato senza esempio né scelta', () => {
    expect(convertLezioneLine('<Lato nome="OLTP" sottotitolo="una riga, tante volte" />', nuovo())).toBe('- **OLTP**: una riga, tante volte');
  });

  test('Criterio, Fase, Opzione, Barra, Numero, Nodo', () => {
    expect(convertLezioneLine('<Criterio nome="Scrittura" a="righe singole" b="insert in batch" />', nuovo())).toBe('- Scrittura: righe singole / insert in batch');
    expect(convertLezioneLine('<Fase nome="Motore" testo="MergeTree con partizioni" evidenzia="si" />', nuovo())).toBe('- **Motore**: MergeTree con partizioni');
    expect(convertLezioneLine('<Opzione nome="ClickHouse" testo="Molte righe" verdetto="si" />', nuovo())).toBe('- ✓ **ClickHouse**: Molte righe');
    expect(convertLezioneLine('<Opzione nome="PostgreSQL" testo="Miliardi di righe" verdetto="no" />', nuovo())).toBe('- ✗ **PostgreSQL**: Miliardi di righe');
    expect(convertLezioneLine('<Barra nome="Righe" valore="100" etichetta="100×" tipo="normale" />', nuovo())).toBe('- Righe: 100×');
    expect(convertLezioneLine('<Barra nome="Colonne" valore="1" />', nuovo())).toBe('- Colonne: 1');
    expect(convertLezioneLine('<Numero valore="1%" testo="dei dati letti" />', nuovo())).toBe('- **1%** dei dati letti');
    expect(convertLezioneLine('<Nodo nome="ORDER BY" />', nuovo())).toBe('- ORDER BY');
  });

  test('MiniTabella con evidenziazioni leggibili e didascalia', () => {
    expect(
      convertLezioneLine('<MiniTabella colonne="order_id,user_id,amount" righe="4" evidenzia="col:amount@3;row:2;cell:1,order_id" didascalia="Una colonna su tre" />', nuovo()),
    ).toBe('Tabella: order_id, user_id, amount (4 righe); evidenziato: colonna amount dal passo 3, riga 2, cella riga 1 colonna order_id — Una colonna su tre');
  });

  test('MiniTabella senza evidenziazioni', () => {
    expect(convertLezioneLine('<MiniTabella colonne="a,b" righe="3" />', nuovo())).toBe('Tabella: a, b (3 righe)');
  });

  test('Relazioni', () => {
    expect(convertLezioneLine('<Relazioni centro="MergeTree">', nuovo())).toBe('**MergeTree** è collegato a:');
  });

  test('Messaggio, anche come citazione', () => {
    expect(convertLezioneLine('<Messaggio>Leggiamo solo le colonne della query.</Messaggio>', nuovo())).toBe('> ★ Leggiamo solo le colonne della query.');
    expect(convertLezioneLine('<Messaggio autore="Ralph Kimball">«Una frase»</Messaggio>', nuovo())).toBe('> ★ «Una frase» — Ralph Kimball');
  });

  test('Domanda con risposta', () => {
    expect(convertLezioneLine('<Domanda risposta="3">Una query usa 3 colonne su 50. Quante ne leggiamo?</Domanda>', nuovo())).toBe(
      '**Domanda:** Una query usa 3 colonne su 50. Quante ne leggiamo? — *Risposta:* 3',
    );
  });

  test('ErroreTipico, chiuso o con slot', () => {
    const atteso = '- ✗ SELECT * legge tutto\n- ✓ Solo le colonne che servono';
    expect(convertLezioneLine('<ErroreTipico sbagliato="SELECT * legge tutto" giusto="Solo le colonne che servono" />', nuovo())).toBe(atteso);
    expect(convertLezioneLine('<ErroreTipico sbagliato="SELECT * legge tutto" giusto="Solo le colonne che servono">', nuovo())).toBe(atteso);
  });
});
