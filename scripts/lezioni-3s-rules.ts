/** Regole del formato «3 secondi» (spec §8): solo per le lezioni con formato: "3s". */
import matter from 'gray-matter';

export type Esito = { errors: string[]; warnings: string[] };

export const TAG_LEZIONE = [
  'Slide', 'Percorso', 'Messaggio', 'Domanda', 'ErroreTipico', 'Confronto', 'Lato', 'Criterio', 'Passi', 'Fase',
  'Opzioni', 'Opzione', 'MiniTabella', 'TabellaDati', 'Barre', 'Barra', 'NumeriGrandi', 'Numero', 'Relazioni', 'Nodo',
  'Schema', 'Passo', 'Pattern', 'Obiettivi',
];
const TAG_APERTO = new RegExp(`<(${TAG_LEZIONE.join('|')})\\b([^>]*)(>?)`, 'g');
const ATTRIBUTI_VISIBILI = ['titolo', 'messaggio', 'didascalia', 'nome', 'sottotitolo', 'testo', 'a', 'b', 'etichetta'];
const H2_ESCLUSE = new Set(['Riepilogo', 'Pratica']);

const parole = (s: string) => s.split(/\s+/).filter(Boolean).length;
const attr = (tag: string, name: string) => new RegExp(`\\b${name}="([^"]*)"`).exec(tag)?.[1];

/** Righe del corpo con i blocchi di codice svuotati (le posizioni restano). */
function righeSenzaCodice(body: string): string[] {
  let fence: string | null = null;
  return body.replace(/\r\n/g, '\n').split('\n').map((riga) => {
    const apertura = /^\s*(`{3,}|~{3,})/.exec(riga);
    if (fence) {
      if (apertura && apertura[1][0] === fence[0] && apertura[1].length >= fence.length) fence = null;
      return '';
    }
    if (apertura) {
      fence = apertura[1];
      return '';
    }
    return riga;
  });
}

type Blocco = { titolo: string; righe: string[] };

function sezioniH2(righe: string[]): Blocco[] {
  const blocchi: Blocco[] = [];
  for (const riga of righe) {
    const h2 = /^## (.+)$/.exec(riga);
    if (h2) blocchi.push({ titolo: h2[1].trim(), righe: [] });
    else blocchi.at(-1)?.righe.push(riga);
  }
  return blocchi;
}

/** Righe tra l'apertura di un tag e la sua chiusura, per ogni occorrenza. */
function blocchiTag(righe: string[], tag: string): string[][] {
  const out: string[][] = [];
  let corrente: string[] | null = null;
  for (const riga of righe) {
    if (corrente === null && new RegExp(`^<${tag}\\b`).test(riga.trim())) corrente = [];
    if (corrente !== null) {
      corrente.push(riga);
      if (riga.trim() === `</${tag}>`) {
        out.push(corrente);
        corrente = null;
      }
    }
  }
  return out;
}

function accenti(blocco: string[]): number {
  let n = 0;
  for (const riga of blocco) {
    n += (riga.match(/\bscelta="/g) ?? []).length;
    n += (riga.match(/\bevidenzia="si"/g) ?? []).length;
    n += (riga.match(/\btipo="evidenzia"/g) ?? []).length;
    const tabella = /^<(MiniTabella|TabellaDati)\b/.exec(riga.trim())?.[1];
    const evidenzia = tabella ? attr(riga, 'evidenzia') : undefined;
    // MiniTabella separa le voci con «;» (una cella è «cell:2,a»), TabellaDati elenca righe con «,»
    if (evidenzia) n += evidenzia.split(tabella === 'MiniTabella' ? ';' : ',').filter((v) => v.trim()).length;
  }
  return n;
}

export function checkLezione3s(raw: string, rel: string): Esito {
  const errors: string[] = [];
  const warnings: string[] = [];
  const errore = (regola: string, testo: string) => errors.push(`${rel}: ${regola}: ${testo}`);

  const { data, content } = matter(raw);
  const righe = righeSenzaCodice(content);
  const sezioni: string[] = Array.isArray(data.sezioni) ? data.sezioni : [];

  // 1. sezioni e H2
  if (sezioni.length < 3 || sezioni.length > 6) errore('sezioni', `servono da 3 a 6 voci, trovate ${sezioni.length}`);
  const blocchi = sezioniH2(righe);
  const h2 = blocchi.map((b) => b.titolo).filter((t) => !H2_ESCLUSE.has(t));
  if (h2.join('\n') !== sezioni.join('\n')) {
    errore('sezioni', `le H2 (${h2.join(' | ')}) non coincidono con sezioni (${sezioni.join(' | ')})`);
  }

  // 2. obiettivi
  const obiettivi = Array.isArray(data.learningObjectives) ? data.learningObjectives : [];
  if (obiettivi.length !== 3) errore('learningObjectives', `servono esattamente 3 obiettivi, trovati ${obiettivi.length}`);

  // 3. un tag per riga, solo attributi stringa
  righe.forEach((riga, i) => {
    for (const m of riga.matchAll(TAG_APERTO)) {
      if (m[3] !== '>') errore('tag', `riga ${i + 1}: <${m[1]}> deve stare su una riga`);
      if (/=\s*\{/.test(m[2])) errore('tag', `riga ${i + 1}: <${m[1]}> usa {…}: servono attributi stringa`);
    }
  });

  // 4. slide
  for (const blocco of blocchiTag(righe, 'Slide')) {
    const apertura = blocco[0];
    const titolo = attr(apertura, 'titolo') ?? '';
    const messaggio = attr(apertura, 'messaggio') ?? '';
    if (parole(titolo) > 6) errore('slide', `titolo «${titolo}» oltre 6 parole`);
    if (parole(messaggio) > 12) errore('slide', `messaggio «${messaggio}» oltre 12 parole`);
    const visibili = blocco
      .flatMap((riga) => ATTRIBUTI_VISIBILI.map((nome) => attr(riga, nome) ?? ''))
      .reduce((tot, valore) => tot + parole(valore), 0);
    if (visibili > 30) errore('slide', `«${titolo}»: ${visibili} parole visibili, massimo 30`);
    const n = accenti(blocco);
    if (n > 2) errore('slide', `«${titolo}»: ${n} elementi in accento, massimo 2`);
  }

  // 5. schemi
  const schemi = blocchiTag(righe, 'Schema');
  if (schemi.length < 2 || schemi.length > 3) errore('Schema', `servono da 2 a 3 <Schema>, trovati ${schemi.length}`);
  for (const blocco of blocchi) {
    let dentro = false;
    let passi = 0;
    let titolo = '';
    let dopo: string[] | null = null;
    const chiudi = () => {
      if (dopo === null) return;
      const resto = dopo.join('\n');
      if (!/<Messaggio\b/.test(resto) || !/<Domanda\b/.test(resto)) {
        errore('Schema', `«${titolo}»: dopo lo schema, prima della H2 successiva, servono un <Messaggio> e una <Domanda>`);
      }
      dopo = null;
    };
    for (const riga of blocco.righe) {
      const t = riga.trim();
      if (/^<Schema\b/.test(t)) {
        chiudi();
        dentro = true;
        passi = 0;
        titolo = attr(t, 'titolo') ?? '';
        continue;
      }
      if (dentro && /^<Passo\b/.test(t)) passi += 1;
      if (dentro && t === '</Schema>') {
        dentro = false;
        if (passi < 3 || passi > 6) errore('Schema', `«${titolo}»: servono da 3 a 6 <Passo>, trovati ${passi}`);
        dopo = [];
        continue;
      }
      if (dopo !== null) dopo.push(riga);
    }
    chiudi();
  }

  // 6. ogni sezione finisce con una domanda
  for (const blocco of blocchi.filter((b) => sezioni.includes(b.titolo))) {
    const ultima = [...blocco.righe].reverse().find((r) => r.trim() !== '');
    if (!ultima || !/^<Domanda\b/.test(ultima.trim())) errore('Domanda', `la sezione «${blocco.titolo}» deve finire con una <Domanda>`);
  }

  // 7. riepilogo e quiz
  const riepilogo = blocchi.find((b) => b.titolo === 'Riepilogo');
  if (!riepilogo) {
    errore('Riepilogo', 'manca la H2 «Riepilogo»');
  } else {
    const messaggi = riepilogo.righe.filter((r) => /^<Messaggio\b/.test(r.trim())).length;
    if (messaggi !== 3) errore('Riepilogo', `servono esattamente 3 <Messaggio>, trovati ${messaggi}`);
    const testo = content.slice(content.indexOf('## Riepilogo'));
    if (!/<QuizExercise\b/.test(testo)) errore('Riepilogo', 'manca il QuizExercise');
    else {
      const domande = (testo.match(/\bcorrectIndex\s*:/g) ?? []).length;
      if (domande !== 5) errore('Riepilogo', `il quiz deve avere 5 domande, trovate ${domande}`);
    }
  }

  // 8. obiettivi nel corpo; ogni figura con spiegazione scritta e pattern / anti-pattern
  const primaH2 = righe.findIndex((r) => /^## /.test(r));
  const apertura = primaH2 === -1 ? righe : righe.slice(0, primaH2);
  if (!apertura.some((r) => /^<Obiettivi\s*\/>$/.test(r.trim()))) errore('Obiettivi', 'manca <Obiettivi /> prima della prima H2');
  let figura: string | null = null;
  righe.forEach((riga, i) => {
    const t = riga.trim();
    if (/^<(Slide|Schema)\b/.test(t)) figura = attr(t, 'titolo') ?? '';
    if ((t === '</Slide>' || t === '</Schema>') && figura !== null) {
      const titolo = figura;
      figura = null;
      const dopo: string[] = [];
      for (const r of righe.slice(i + 1)) {
        const s = r.trim();
        if (/^## /.test(s) || /^<(Slide|Schema)\b/.test(s)) break;
        dopo.push(s);
      }
      const prosa = dopo.some((s) => s !== '' && !/^(<|\||#)/.test(s));
      if (!prosa) errore('figura', `«${titolo}»: manca la spiegazione scritta dopo il disegno`);
      if (!dopo.some((s) => /^<(Pattern|ErroreTipico)\b/.test(s))) errore('figura', `«${titolo}»: manca <Pattern> (o <ErroreTipico>) dopo il disegno`);
    }
  });

  // avviso: frasi di prosa troppo lunghe
  for (const riga of righe) {
    const t = riga.trim();
    if (t === '' || /^(<|\||#|import\b|export\b|\{|\]|\}|---)/.test(t) || /^\s{2,}\S/.test(riga)) continue;
    for (const frase of t.split(/(?<=[.!?])\s+/)) {
      if (parole(frase) > 20) warnings.push(`${rel}: frase di ${parole(frase)} parole: «${frase.slice(0, 60)}…»`);
    }
  }

  return { errors, warnings };
}
