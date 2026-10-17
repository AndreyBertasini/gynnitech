import { describe, expect, test } from 'vitest';
import { checkLezioneArticolo, FRASI_VIETATE } from './lezioni-articolo-rules';

const parole = (n: number) => Array.from({ length: n }, (_, i) => (i % 12 === 11 ? 'dato.' : 'dato')).join(' ');
const sql = (testo = 'SELECT 1;') => ['```sql', testo, '```'].join('\n');
const domande = (n: number, fine = '?') =>
  Array.from({ length: n }, (_, i) => `${i + 1}. Domanda numero ${i + 1} verificabile${fine}`).join('\n');

type Parti = Record<'s1' | 's2' | 's3' | 's4' | 's5' | 's6', string>;
const ORDINE: (keyof Parti)[] = ['s1', 's2', 's3', 's4', 's5', 's6'];

const parti = (): Parti => ({
  s1: `## Il caso\n\n${parole(250)}\n\nFonte: [documentazione](https://clickhouse.com/docs).`,
  s2: `## Il meccanismo\n\n${parole(250)}\n\n**Ogni insert crea una parte.**`,
  s3: `## L'errore tipico\n\n${sql('CREATE TABLE a (x UInt8) ENGINE = Memory;')}\n\n### Primo\n\n${parole(100)}\n\n### Secondo\n\n${parole(100)}\n\n### Terzo\n\n${parole(100)}`,
  s4: `## La soluzione\n\n${parole(300)}\n\n${sql('SELECT 2;')}`,
  s5: `## Il caso difficile\n\n${parole(400)}`,
  s6: `## Checklist\n\n${domande(5)}`,
});

const render = (p: Parti, formato = 'articolo') =>
  [`---\ntitle: "Prova"\ndescription: "Lezione di prova."\nformato: "${formato}"\n---`, '# Prova', ...ORDINE.map((k) => p[k])].join('\n\n');

const con = (k: keyof Parti, extra: string): Parti => ({ ...parti(), [k]: `${parti()[k]}\n\n${extra}` });
const errori = (p: Parti) => checkLezioneArticolo(render(p), 'prova.mdx').errors.join('\n');

describe('checkLezioneArticolo', () => {
  test('una lezione valida non ha errori né avvisi', () => {
    expect(checkLezioneArticolo(render(parti()), 'prova.mdx')).toEqual({ errors: [], warnings: [] });
  });

  test('R1: cinque H2 e sette H2 sono errori', () => {
    const cinque = { ...parti(), s5: '' };
    expect(errori(cinque)).toMatch(/R1/);
    expect(errori(con('s6', `## Una in più\n\n${parole(20)}`))).toMatch(/R1/);
  });

  test('R2: 1.200 e 2.100 parole sono errori, il codice non conta', () => {
    expect(errori({ ...parti(), s5: `## Il caso difficile\n\n${parole(60)}` })).toMatch(/R2/);
    expect(errori({ ...parti(), s5: `## Il caso difficile\n\n${parole(900)}` })).toMatch(/R2/);
    expect(errori(con('s4', sql(parole(800))))).not.toMatch(/R2/);
  });

  test('R3: senza riga in grassetto in sezione 2', () => {
    expect(errori({ ...parti(), s2: `## Il meccanismo\n\n${parole(250)}\n\nOgni insert crea una parte.` })).toMatch(/R3/);
  });

  test('R4: due ### in sezione 3 e nessun blocco sql in sezione 4', () => {
    expect(errori({ ...parti(), s3: parti().s3.replace('### Terzo', 'Terzo') })).toMatch(/R4/);
    expect(errori({ ...parti(), s4: `## La soluzione\n\n${parole(300)}` })).toMatch(/R4/);
    expect(errori({ ...parti(), s3: parti().s3.replace(sql('CREATE TABLE a (x UInt8) ENGINE = Memory;'), '') })).toMatch(/R4/);
  });

  test('R5: quattro domande, o cinque senza punto interrogativo', () => {
    expect(errori({ ...parti(), s6: `## Checklist\n\n${domande(4)}` })).toMatch(/R5/);
    expect(errori({ ...parti(), s6: `## Checklist\n\n${domande(5, '.')}` })).toMatch(/R5/);
  });

  test.each(FRASI_VIETATE)('R6: la frase vietata «%s» è un errore anche con la maiuscola', (frase) => {
    const maiuscola = frase[0].toUpperCase() + frase.slice(1);
    expect(errori(con('s2', `${maiuscola}, poi il resto.`))).toMatch(/R6/);
  });

  test('R6: la stessa frase dentro un blocco di codice non conta', () => {
    expect(errori(con('s4', sql('-- in conclusione\nSELECT 3;')))).not.toMatch(/R6/);
  });

  test('R7: «!» e un\'emoji nella prosa sono errori, «!» nel codice no', () => {
    expect(errori(con('s2', 'Funziona!'))).toMatch(/R7/);
    expect(errori(con('s2', 'Funziona 🚀 davvero.'))).toMatch(/R7/);
    expect(errori(con('s4', sql("SELECT 'ciao!';")))).not.toMatch(/R7/);
  });

  test('R8: «puoi» e «il tuo» sono errori, «sei sezioni» no', () => {
    expect(errori(con('s2', 'Puoi controllare.'))).toMatch(/R8/);
    expect(errori(con('s2', 'Il tuo schema è sbagliato.'))).toMatch(/R8/);
    expect(errori(con('s2', 'L\'articolo ha sei sezioni.'))).not.toMatch(/R8/);
  });

  test('R9: sezione 1 senza link né dichiarazione è un errore; con un link o con «caso ricostruito» no', () => {
    const senza = { ...parti(), s1: `## Il caso\n\n${parole(250)}` };
    expect(errori(senza)).toMatch(/R9/);
    expect(errori({ ...senza, s1: `${senza.s1}\n\nCaso ricostruito: i numeri sono quelli del runner.` })).not.toMatch(/R9/);
    expect(errori({ ...senza, s1: `${senza.s1}\n\nVedi [la fonte](https://example.com/caso).` })).not.toMatch(/R9/);
  });

  test('R10: un <Slide> o un <Percorso /> rimasti sono errori', () => {
    expect(errori(con('s2', '<Slide sezione="1" titolo="x" messaggio="y">'))).toMatch(/R10/);
    expect(errori(con('s2', '<Percorso />'))).toMatch(/R10/);
  });

  test('R11: un elenco puntato in sezione 4 è un avviso, in sezione 6 no', () => {
    const esito4 = checkLezioneArticolo(render(con('s4', '- elemento uno\n- elemento due')), 'prova.mdx');
    expect(esito4.errors).toEqual([]);
    expect(esito4.warnings.join('\n')).toMatch(/R11/);
    const esito6 = checkLezioneArticolo(render(con('s6', '- elemento da spuntare')), 'prova.mdx');
    expect(esito6.warnings).toEqual([]);
  });
});

describe('checkLezioneArticolo, variante senzaCodice', () => {
  const tabella = ['| Campo | Valore |', '| --- | --- |', '| Responsabile | Marta |'].join('\n');
  const citazione = ['> Verbale della riunione.', '> Si decide di procedere.', '> Dati a supporto in allegato.'].join('\n');
  const terzi = `### Primo\n\n${parole(100)}\n\n### Secondo\n\n${parole(100)}\n\n### Terzo\n\n${parole(100)}`;
  const partiSC = (): Parti => ({
    ...parti(),
    s3: `## L'errore tipico\n\n${tabella}\n\n${terzi}`,
    s4: `## La soluzione\n\n${parole(300)}\n\n${citazione}`,
  });
  const renderSC = (p: Parti, flag = 'senzaCodice: true') =>
    [`---\ntitle: "Prova"\ndescription: "Lezione di prova."\nformato: "articolo"\n${flag}\n---`, '# Prova', ...ORDINE.map((k) => p[k])].join('\n\n');
  const erroriSC = (p: Parti) => checkLezioneArticolo(renderSC(p), 'prova.mdx').errors.join('\n');

  test('una tabella in sezione 3 e una citazione in sezione 4 bastano: nessun errore', () => {
    expect(checkLezioneArticolo(renderSC(partiSC()), 'prova.mdx')).toEqual({ errors: [], warnings: [] });
  });

  test('R4: la sezione 4 senza tabella né citazione non ha il documento giusto', () => {
    expect(erroriSC({ ...partiSC(), s4: `## La soluzione\n\n${parole(300)}` })).toMatch(/R4: .*documento giusto/);
  });

  test('R4: due righe di citazione non bastano come documento', () => {
    const due = '> Prima riga.\n> Seconda riga.';
    expect(erroriSC({ ...partiSC(), s4: `## La soluzione\n\n${parole(300)}\n\n${due}` })).toMatch(/R4: .*documento giusto/);
  });

  test('R4: la sezione 3 senza tabella né citazione non ha il documento sbagliato', () => {
    expect(erroriSC({ ...partiSC(), s3: `## L'errore tipico\n\n${terzi}` })).toMatch(/R4: .*documento sbagliato/);
  });

  test('R12: un blocco di codice è un errore', () => {
    expect(erroriSC({ ...partiSC(), s4: `${partiSC().s4}\n\n${sql()}` })).toMatch(/R12/);
  });

  test('senza il flag, la sezione 3 senza blocco sql continua a fallire', () => {
    expect(checkLezioneArticolo(render(partiSC()), 'prova.mdx').errors.join('\n')).toMatch(/R4: .*blocco sql/);
  });

  test('senzaCodice: false vale come assente', () => {
    expect(checkLezioneArticolo(renderSC(partiSC(), 'senzaCodice: false'), 'prova.mdx').errors.join('\n')).toMatch(/R4: .*blocco sql/);
  });
});
