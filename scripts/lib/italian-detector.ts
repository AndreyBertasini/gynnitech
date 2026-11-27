/**
 * Segnale "testo italiano" per le pagine /en/: parole funzionali tipicamente italiane che
 * non esistono in inglese (niente "come", "con", "per", "non", "data": falsi positivi).
 */
const STRONG = new Set([
  'il', 'lo', 'gli', 'della', 'delle', 'degli', 'dello', 'dell', 'nella', 'nelle', 'negli', 'nello',
  'alla', 'alle', 'agli', 'allo', 'dalla', 'dalle', 'dagli', 'sulla', 'sulle', 'sugli',
  'questo', 'questa', 'questi', 'queste', 'quello', 'quella', 'quindi', 'perché', 'perchè', 'anche',
  'sono', 'essere', 'viene', 'vengono', 'hanno', 'però', 'più', 'già', 'cioè', 'ogni', 'molto',
  'quando', 'dove', 'mentre', 'oppure', 'senza', 'tra', 'fra', 'cosa', 'ancora', 'sempre', 'dati',
  'lezione', 'lezioni', 'esempio', 'corso', 'modulo', 'articolo', 'articoli', 'riepilogo', 'ipotesi',
  'azione', 'decisione', 'risultato', 'utenti', 'cliente', 'clienti', 'vendite', 'scopri', 'leggi',
]);

export const italianSignals = (text: string) => {
  const words = text.toLowerCase().match(/[\p{L}’']+/gu) ?? [];
  const strong = words.filter((w) => STRONG.has(w.replace(/[’']$/, '')));
  return { strong, ratio: words.length ? strong.length / words.length : 0 };
};
