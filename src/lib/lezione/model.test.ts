import { describe, expect, test } from 'vitest';
import {
  cellMark,
  extractPassi,
  highlightTableRows,
  maxDataValore,
  parseEvidenzia,
  parseRighe,
  type LezioneContext,
} from './model';

const ctx: LezioneContext = {
  sezioni: ['Righe e colonne', 'Leggere poco', 'MergeTree'],
  obiettivi: ['Spiegare', 'Scegliere', 'Verificare'],
  numero: 2,
  totale: 9,
  moduloTitolo: 'Real-time analytics con ClickHouse',
};

const cols = ['order_id', 'user_id', 'amount', 'status'];

describe('parseEvidenzia', () => {
  test('legge colonne con passo e righe', () => {
    expect(parseEvidenzia('col:amount@3;row:2', cols)).toEqual([
      { tipo: 'col', colonna: 'amount', passo: 3 },
      { tipo: 'row', riga: 2 },
    ]);
  });

  test('legge una cella', () => {
    expect(parseEvidenzia('cell:2,order_id', cols)).toEqual([{ tipo: 'cell', riga: 2, colonna: 'order_id' }]);
  });

  test('lancia su una colonna sconosciuta', () => {
    expect(() => parseEvidenzia('col:prezzo', cols)).toThrow();
  });

  test('lancia su una voce malformata', () => {
    expect(() => parseEvidenzia('riga:2', cols)).toThrow();
  });

  test('senza specifica non evidenzia nulla', () => {
    expect(parseEvidenzia(undefined, cols)).toEqual([]);
  });
});

describe('cellMark', () => {
  const evidenze = parseEvidenzia('col:amount@3;cell:2,order_id', cols);

  test('una voce senza passo rende la cella statica', () => {
    expect(cellMark(evidenze, 2, 'order_id')).toEqual({ statico: true });
  });

  test('una voce con passo restituisce il passo', () => {
    expect(cellMark(evidenze, 1, 'amount')).toEqual({ statico: false, passo: 3 });
  });

  test('una cella non coperta resta normale', () => {
    expect(cellMark(evidenze, 1, 'status')).toEqual({ statico: false });
  });
});

describe('highlightTableRows', () => {
  const html = '<table><thead><tr><th>a</th></tr></thead><tbody><tr><td>1</td></tr><tr class="x"><td>2</td></tr></tbody></table>';

  test('marca in accento le righe richieste del corpo della tabella', () => {
    expect(highlightTableRows(html, [1])).toContain('<tbody><tr class="lz-accento"><td>1</td>');
  });

  test('aggiunge la classe a una riga che ne ha già una', () => {
    expect(highlightTableRows(html, [2])).toContain('<tr class="x lz-accento"><td>2</td>');
  });

  test("non tocca l'intestazione", () => {
    expect(highlightTableRows(html, [1])).toContain('<thead><tr><th>a</th>');
  });

  test('lancia se la riga non esiste', () => {
    expect(() => highlightTableRows(html, [3])).toThrow();
  });
});

describe('extractPassi', () => {
  const html =
    '<span class="lz-passo-dato" hidden>I dati sono in una tabella.</span>\n<span class="lz-passo-dato" hidden>Ogni colonna è un file &amp; basta.</span><div class="lz-minitab">x</div>';

  test('raccoglie i testi dei passi nell’ordine', () => {
    expect(extractPassi(html).passi).toEqual(['I dati sono in una tabella.', 'Ogni colonna è un file &amp; basta.']);
  });

  test('toglie i marcatori dal disegno', () => {
    expect(extractPassi(html).disegno.trim()).toBe('<div class="lz-minitab">x</div>');
  });
});

describe('maxDataValore', () => {
  test('restituisce il valore massimo tra gli attributi data-valore', () => {
    expect(maxDataValore('<div data-valore="12"></div><div data-valore="100"></div><div data-valore="3.5"></div>')).toBe(100);
  });

  test('lancia se non ci sono barre', () => {
    expect(() => maxDataValore('<div></div>')).toThrow();
  });
});

describe('parseRighe', () => {
  test('legge un elenco di righe', () => {
    expect(parseRighe('2,4')).toEqual([2, 4]);
  });

  test('senza specifica restituisce un elenco vuoto', () => {
    expect(parseRighe(undefined)).toEqual([]);
  });
});
