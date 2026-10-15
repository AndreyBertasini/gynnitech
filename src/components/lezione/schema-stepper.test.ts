import { describe, expect, test } from 'vitest';
import { nextStep, stepFromKey } from './schema-stepper';

describe('nextStep', () => {
  test('non scende sotto il primo passo', () => {
    expect(nextStep(1, -1, 4)).toBe(1);
  });

  test("non supera l'ultimo passo (niente giro)", () => {
    expect(nextStep(4, 1, 4)).toBe(4);
  });

  test('avanza di un passo', () => {
    expect(nextStep(2, 1, 4)).toBe(3);
  });
});

describe('stepFromKey', () => {
  test('freccia destra avanza', () => {
    expect(stepFromKey('ArrowRight')).toBe(1);
  });

  test('freccia sinistra torna indietro', () => {
    expect(stepFromKey('ArrowLeft')).toBe(-1);
  });

  test('gli altri tasti non muovono lo schema', () => {
    expect(stepFromKey('Enter')).toBe(0);
  });
});
