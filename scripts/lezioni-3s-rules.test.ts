import { describe, expect, test } from 'vitest';
import { checkLezione3s } from './lezioni-3s-rules';

const domandaQuiz = (n: number) => `  { id: "q${n}", text: "Domanda ${n}", options: ["si", "no"], correctIndex: 0, explanation: "Perché." },`;
const quiz = (n: number) => ['<QuizExercise client:visible quizId="prova" questions={[', ...Array.from({ length: n }, (_, i) => domandaQuiz(i + 1)), ']} />'].join('\n');

const lezione = (o: Partial<Record<'obiettivi' | 'percorso' | 'slideTitolo' | 'slideApertura' | 'lati' | 'dopoSlide' | 'schema2' | 'tre' | 'riepilogo' | 'quiz', string>> = {}) => `---
title: "Prova"
description: "Lezione di prova."
formato: "3s"
sezioni: ["Uno", "Due", "Tre"]
learningObjectives:
${o.obiettivi ?? '  - Spiegare uno\n  - Scegliere due\n  - Calcolare tre'}
---

${o.percorso ?? '<Percorso />\n\n<Obiettivi />'}

Un gancio breve. Una frase sola.

## Uno

${o.slideApertura ?? `<Slide sezione="1" titolo="${o.slideTitolo ?? 'Titolo breve'}" messaggio="Messaggio breve.">`}
<Confronto>
${o.lati ?? '<Lato nome="A" sottotitolo="primo lato" scelta="A punta qui" />\n<Lato nome="B" sottotitolo="secondo lato" />'}
</Confronto>
</Slide>

${o.dopoSlide ?? 'A sinistra vediamo A, a destra B. Scegliamo A quando serve.\n\n<Pattern si="Usiamo A per leggere" no="Usiamo B per leggere" />'}

<Schema sezione="1" titolo="Primo schema">
<Passo testo="Uno." />
<Passo testo="Due." />
<Passo testo="Tre." />
<MiniTabella colonne="a,b" righe="2" evidenzia="col:a@3" />
</Schema>

Lo schema mostra la colonna a che si accende al terzo passo.

<ErroreTipico sbagliato="Leggiamo tutto" giusto="Leggiamo solo a" />

<Messaggio>Frase uno.</Messaggio>

<Domanda risposta="si">Domanda uno?</Domanda>

## Due

${o.schema2 ?? `<Schema sezione="2" titolo="Secondo schema">
<Passo testo="Uno." />
<Passo testo="Due." />
<Passo testo="Tre." />
<Passi>
<Fase nome="A" testo="primo" passo="1" />
<Fase nome="B" testo="secondo" passo="2" />
<Fase nome="C" testo="terzo" passo="3" />
</Passi>
</Schema>

Ogni fase arriva dopo la precedente. Nessuna salta il turno.

<Pattern si="Seguiamo l'ordine A, B, C" no="Partiamo da C" />

<Messaggio>Frase due.</Messaggio>`}

<Domanda risposta="si">Domanda due?</Domanda>

## Tre

${o.tre ?? 'Testo breve della sezione.\n\n<Domanda risposta="si">Domanda tre?</Domanda>'}

## Riepilogo

${o.riepilogo ?? '<Messaggio>Uno.</Messaggio>\n\n<Messaggio>Due.</Messaggio>\n\n<Messaggio>Tre.</Messaggio>'}

${o.quiz ?? quiz(5)}
`;

const errori = (raw: string) => checkLezione3s(raw, 'prova.mdx').errors;

describe('checkLezione3s', () => {
  test('una lezione minima valida non ha errori né avvisi', () => {
    expect(checkLezione3s(lezione(), 'prova.mdx')).toEqual({ errors: [], warnings: [] });
  });

  test('regola 1: le H2 devono coincidere con sezioni', () => {
    const raw = lezione().replace('## Tre', '## Quattro');
    expect(errori(raw).join('\n')).toMatch(/sezioni/);
  });

  test('regola 2: servono esattamente 3 obiettivi', () => {
    expect(errori(lezione({ obiettivi: '  - Spiegare uno\n  - Scegliere due' })).join('\n')).toMatch(/learningObjectives/);
  });

  test('regola 3: un tag spezzato su due righe è un errore', () => {
    const raw = lezione({ slideApertura: '<Slide sezione="1" titolo="Titolo breve"\n  messaggio="Messaggio breve.">' });
    expect(errori(raw).join('\n')).toMatch(/una riga/);
  });

  test('regola 3: un attributo con {…} è un errore', () => {
    const raw = lezione({ slideApertura: '<Slide sezione={1} titolo="Titolo breve" messaggio="Messaggio breve.">' });
    expect(errori(raw).join('\n')).toMatch(/attributi stringa/);
  });

  test('regola 4: titolo oltre 6 parole', () => {
    expect(errori(lezione({ slideTitolo: 'Un titolo davvero troppo lungo per una slide' })).join('\n')).toMatch(/titolo/);
  });

  test('regola 4: più di 2 elementi in accento in una slide', () => {
    const lati = '<Lato nome="A" sottotitolo="primo lato" scelta="A punta qui" />\n<Lato nome="B" sottotitolo="secondo lato" scelta="B punta qui" />\n<Criterio nome="C" a="x" b="y" />';
    const raw = lezione({ lati }).replace('<Criterio nome="C" a="x" b="y" />', '<Lato nome="D" sottotitolo="terzo" scelta="D punta qui" />');
    expect(errori(raw).join('\n')).toMatch(/accento/);
  });

  test('regola 4: una cella di MiniTabella conta come un solo accento', () => {
    const raw = lezione().replace(
      '<Lato nome="B" sottotitolo="secondo lato" />',
      '<Lato nome="B" sottotitolo="secondo lato" />\n</Confronto>\n<MiniTabella colonne="a,b" righe="2" evidenzia="cell:2,a" />\n<Confronto>',
    );
    expect(errori(raw)).toEqual([]);
  });

  test('regola 5: servono da 2 a 3 Schema', () => {
    expect(errori(lezione({ schema2: '<Messaggio>Frase due.</Messaggio>' })).join('\n')).toMatch(/Schema/);
  });

  test('regola 5: uno Schema con 2 Passo è un errore', () => {
    const raw = lezione().replace('<Passo testo="Tre." />\n<MiniTabella', '<MiniTabella');
    expect(errori(raw).join('\n')).toMatch(/Passo/);
  });

  test('regola 6: una sezione deve finire con una Domanda', () => {
    expect(errori(lezione({ tre: '<Domanda risposta="si">Domanda tre?</Domanda>\n\nTesto dopo la domanda.' })).join('\n')).toMatch(/Domanda/);
  });

  test('regola 7: il Riepilogo vuole 3 Messaggio', () => {
    expect(errori(lezione({ riepilogo: '<Messaggio>Uno.</Messaggio>\n\n<Messaggio>Due.</Messaggio>' })).join('\n')).toMatch(/Riepilogo/);
  });

  test('regola 7: il quiz vuole 5 domande', () => {
    expect(errori(lezione({ quiz: quiz(4) })).join('\n')).toMatch(/quiz/i);
  });

  test('regola 8: gli obiettivi stanno nel corpo con <Obiettivi />', () => {
    expect(errori(lezione({ percorso: '<Percorso />' })).join('\n')).toMatch(/Obiettivi/);
  });

  test('regola 8: ogni figura ha una spiegazione scritta', () => {
    expect(errori(lezione({ dopoSlide: '<Pattern si="Usiamo A" no="Usiamo B" />' })).join('\n')).toMatch(/spiegazione/);
  });

  test('regola 8: ogni figura ha pattern e anti-pattern', () => {
    expect(errori(lezione({ dopoSlide: 'A sinistra vediamo A, a destra B.' })).join('\n')).toMatch(/Pattern/);
  });

  test('avviso: una frase di prosa oltre 20 parole', () => {
    const lunga = 'Questa frase di prova contiene volutamente molte parole perché vogliamo controllare che il validatore segnali le frasi troppo lunghe da leggere con calma.';
    const { errors, warnings } = checkLezione3s(lezione({ tre: `${lunga}\n\n<Domanda risposta="si">Domanda tre?</Domanda>` }), 'prova.mdx');
    expect(errors).toEqual([]);
    expect(warnings.join('\n')).toMatch(/frase/);
  });
});
