/** Regole del formato «articolo tecnico» (docs/lezioni/prompt-articolo-tecnico.md): solo per le lezioni con formato: "articolo". */
import matter from 'gray-matter';
import { TAG_LEZIONE, type Esito } from './lezioni-3s-rules';

export const PAROLE_MIN = 1300;
export const PAROLE_MAX = 1900;
export const FRASI_VIETATE = [
  'in questo articolo vedremo',
  'nel mondo di oggi',
  'sempre più',
  'approfondiamo',
  'in conclusione',
  'è importante sottolineare',
  'scopriamo insieme',
  'non è altro che',
  'negli ultimi anni',
] as const;

const SEZIONI_ATTESE = 6;
const DOMANDE_ATTESE = 3 + 2;
const RIGA_IN_GRASSETTO = /^\*\*[^*\n]+\*\*\s*$/;
const DOMANDA_NUMERATA = /^\s*\d+[.)]\s+.+\?\s*$/;
const ELENCO_PUNTATO = /^\s*[-*]\s+/;
const DICHIARAZIONE_ESEMPIO = /caso ricostruito|esempio costruito|numeri di esempio|scenario costruito/i;
const LINK_ESTERNO = /\]\(https?:\/\//;
const SECONDA_PERSONA = /(?<![\p{L}\p{N}_])(tu|ti|te|tuo|tua|tuoi|tue|puoi|devi|hai|vuoi|sai)(?![\p{L}\p{N}_])/iu;
const EMOJI = /\p{Extended_Pictographic}/u;
const RESTO_3S = new RegExp(`<(${TAG_LEZIONE.join('|')})\\b|QuizExercise|^\\s*import\\s`);

type Riga = { testo: string; codice: boolean; lingua: string };
type Sezione = { titolo: string; righe: Riga[] };

/** Marca ogni riga come codice o prosa e ricorda il linguaggio del blocco. */
function leggiRighe(body: string): Riga[] {
  let fence: string | null = null;
  let lingua = '';
  return body.replace(/\r\n/g, '\n').split('\n').map((testo) => {
    const apertura = /^\s*(`{3,}|~{3,})\s*([\w-]*)/.exec(testo);
    if (fence) {
      if (apertura && apertura[1][0] === fence[0] && apertura[1].length >= fence.length && !apertura[2]) fence = null;
      return { testo, codice: true, lingua };
    }
    if (apertura) {
      fence = apertura[1];
      lingua = apertura[2].toLowerCase();
      return { testo, codice: true, lingua };
    }
    return { testo, codice: false, lingua: '' };
  });
}

function dividiInSezioni(righe: Riga[]): { intro: Riga[]; sezioni: Sezione[] } {
  const intro: Riga[] = [];
  const sezioni: Sezione[] = [];
  for (const riga of righe) {
    const h2 = !riga.codice && /^## (.+)$/.exec(riga.testo);
    if (h2) sezioni.push({ titolo: h2[1].trim(), righe: [riga] });
    else (sezioni.at(-1)?.righe ?? intro).push(riga);
  }
  return { intro, sezioni };
}

/** Righe di prosa: fuori dai blocchi di codice e senza codice inline. */
const prosa = (righe: Riga[]): string[] => righe.filter((r) => !r.codice).map((r) => r.testo.replace(/`[^`]*`/g, ' '));

const haSql = (righe: Riga[]) => righe.some((r) => r.codice && r.lingua === 'sql');

export function checkLezioneArticolo(raw: string, rel: string): Esito {
  const errors: string[] = [];
  const warnings: string[] = [];
  const errore = (regola: string, testo: string) => errors.push(`${rel}: ${regola}: ${testo}`);

  const { intro, sezioni } = dividiInSezioni(leggiRighe(matter(raw).content));
  const testoProsa = [intro, ...sezioni.map((s) => s.righe)].flatMap(prosa);

  if (sezioni.length !== SEZIONI_ATTESE) {
    errore('R1', `servono ${SEZIONI_ATTESE} sezioni H2 (caso, meccanismo, errore, soluzione, caso difficile, checklist); trovate ${sezioni.length}`);
  }

  const parole = testoProsa.join(' ').split(/\s+/).filter(Boolean).length;
  if (parole < PAROLE_MIN || parole > PAROLE_MAX) {
    errore('R2', `${parole} parole di prosa (codice escluso); ammesse ${PAROLE_MIN}–${PAROLE_MAX}`);
  }

  if (sezioni.length === SEZIONI_ATTESE) {
    if (!prosa(sezioni[1].righe).some((riga) => RIGA_IN_GRASSETTO.test(riga.trim()))) {
      errore('R3', 'la sezione 2 (meccanismo) non ha la riga in grassetto che condensa il principio');
    }

    const terzi = prosa(sezioni[2].righe).filter((riga) => /^### /.test(riga)).length;
    if (terzi !== 3) errore('R4', `la sezione 3 deve nominare tre errori con tre titoli ### (trovati ${terzi})`);
    if (!haSql(sezioni[2].righe)) errore('R4', 'la sezione 3 non ha il blocco sql con lo schema sbagliato');
    if (!haSql(sezioni[3].righe)) errore('R4', 'la sezione 4 non ha il blocco sql con lo schema giusto');

    const sezione1 = prosa(sezioni[0].righe).join('\n');
    if (!LINK_ESTERNO.test(sezione1) && !DICHIARAZIONE_ESEMPIO.test(sezione1)) {
      errore('R9', 'la sezione 1 non ha un link a una fonte né la dichiarazione «caso ricostruito» / «numeri di esempio»');
    }

    sezioni.slice(0, -1).forEach((sezione, i) => {
      if (prosa(sezione.righe).some((riga) => ELENCO_PUNTATO.test(riga))) {
        warnings.push(`${rel}: R11: elenco puntato nella sezione ${i + 1}: lì va la prosa`);
      }
    });
  }

  const ultima = sezioni.at(-1);
  if (ultima) {
    const domande = prosa(ultima.righe).filter((riga) => DOMANDA_NUMERATA.test(riga)).length;
    if (domande !== DOMANDE_ATTESE) errore('R5', `l'ultima sezione deve avere ${DOMANDE_ATTESE} domande numerate che finiscono con ? (trovate ${domande})`);
  }

  const minuscolo = testoProsa.join('\n').toLowerCase();
  for (const frase of FRASI_VIETATE) {
    if (minuscolo.includes(frase)) errore('R6', `frase vietata «${frase}»`);
  }

  const senzaImmagini = testoProsa.join('\n').replace(/!\[/g, '[');
  if (senzaImmagini.includes('!')) errore('R7', 'punto esclamativo nella prosa');
  if (EMOJI.test(senzaImmagini)) errore('R7', 'emoji nella prosa');

  const tu = SECONDA_PERSONA.exec(testoProsa.join('\n'));
  if (tu) errore('R8', `seconda persona singolare («${tu[1]}»): si dà del voi`);

  const resto = [intro, ...sezioni.map((s) => s.righe)].flatMap((righe) => righe.filter((r) => !r.codice)).find((r) => RESTO_3S.test(r.testo));
  if (resto) errore('R10', `resto del formato «3 secondi»: ${resto.testo.trim().slice(0, 60)}`);

  return { errors, warnings };
}
