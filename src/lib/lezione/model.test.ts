import { describe, expect, test } from 'vitest';
import { cellMark, parseEvidenzia, parseRighe, progressSegments, sectionLabel, type LezioneContext } from './model';

const ctx: LezioneContext = {
  sezioni: ['Righe e colonne', 'Leggere poco', 'MergeTree'],
  numero: 2,
  totale: 9,
  moduloTitolo: 'Real-time analytics con ClickHouse',
};

const cols = ['order_id', 'user_id', 'amount', 'status'];

describe('sectionLabel', () => {
  test('restituisce numero e nome della sezione', () => {
    expect(sectionLabel(ctx, 2)).toBe('2 · Leggere poco');
  });

  test('lancia se la sezione non esiste', () => {
    expect(() => sectionLabel(ctx, 4)).toThrow();
    expect(() => sectionLabel(ctx, 0)).toThrow();
  });

  test('lancia se manca il contesto della lezione', () => {
    expect(() => sectionLabel(undefined, 1)).toThrow();
  });
});

describe('progressSegments', () => {
  test('accende solo il segmento della sezione attiva', () => {
    expect(progressSegments(4, 2)).toEqual([false, true, false, false]);
  });
});

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

describe('parseRighe', () => {
  test('legge un elenco di righe', () => {
    expect(parseRighe('2,4')).toEqual([2, 4]);
  });

  test('senza specifica restituisce un elenco vuoto', () => {
    expect(parseRighe(undefined)).toEqual([]);
  });
});
