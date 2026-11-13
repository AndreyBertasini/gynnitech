/**
 * Regole del formato «articolo tecnico» (docs/lezioni/prompt-articolo-tecnico.md): solo per le lezioni con formato: "articolo".
 * Con `senzaCodice: true` nel frontmatter (modulo 4) R4 chiede un «documento» sbagliato e uno giusto al posto dei blocchi sql, e R12 vieta ogni blocco di codice.
 */
import matter from 'gray-matter';

export type Esito = { errors: string[]; warnings: string[] };

export const TAG_LEZIONE = [
  'Percorso',
  'Obiettivi',
  'Slide',
  'Schema',
  'Passo',
  'Confronto',
  'Lato',
  'Criterio',
  'Passi',
  'Fase',
  'Opzioni',
  'Opzione',
  'MiniTabella',
  'TabellaDati',
  'Barre',
  'Barra',
  'NumeriGrandi',
  'Numero',
  'Relazioni',
  'Nodo',
  'Pattern',
  'ErroreTipico',
  'Messaggio',
  'Domanda',
] as const;

export type ArticoloProfile = 'A' | 'B';

export const ARTICOLO_PROFILES: Record<
  ArticoloProfile,
  { minWords: number; maxWords: number; targetMinWords: number; targetMaxWords: number }
> = {
  A: { minWords: 1300, maxWords: 1900, targetMinWords: 1400, targetMaxWords: 1900 },
  B: { minWords: 1300, maxWords: 2400, targetMinWords: 1600, targetMaxWords: 2400 },
};

const PROFILE_B_MODULES = new Set([
  'sql',
  'sql-fondamenti',
  'advanced-sql',
  'python',
  'python-per-dati',
  'statistica',
  'significativita-statistica',
  'matematica-analisi-dati',
  'visualizzazione',
  'dashboard-visualizzazione',
  'ab-testing',
  'ab-testing-sperimentazione',
  'data-engineering',
  'data-engineering-pipeline',
  'data-warehousing',
  's3-data-lake',
  'infrastructure-ops',
  'machine-learning',
  'machine-learning-fondamenti',
  'marketing-data-science',
  'analytics-engineering',
  'kafka',
  'kafka-streaming',
  'real-time-analytics',
  'cloud',
  'cloud-data-platform',
  'docker',
  'docker-container',
  'ai',
  'ai-per-data-analytics',
  'ai-data-workflows',
  'agentic-ai-data-workflows',
]);

export function getArticoloProfile(moduleOrRel = ''): ArticoloProfile {
  const normalized = moduleOrRel.replace(/\\/g, '/').toLowerCase();
  const segments = normalized.split('/').filter(Boolean);
  for (const slug of PROFILE_B_MODULES) {
    if (normalized === slug || segments.includes(slug)) {
      return 'B';
    }
  }
  return 'A';
}

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
const RESTO_3S = new RegExp(`<(${TAG_LEZIONE.join('|')})\\b|QuizExercise|SqlExercise|una sessione,\\s*tre blocchi|^\\s*import\\s`, 'i');

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

const CITAZIONI_MINIME = 3;
const RIGA_CITAZIONE = /^\s*>(.*)$/;
const RECINTO_IN_CITAZIONE = /^\s*>\s*(`{3,}|~{3,})/;
const eSeparatoreDiTabella = (riga: string) => /^[\s|:-]+$/.test(riga) && riga.includes('|') && riga.includes('---');
const eRigaDiTabella = (riga: string | undefined) => riga !== undefined && riga.includes('|') && !eSeparatoreDiTabella(riga);

/**
 * Un «documento» è una tabella Markdown completa (intestazione, separatore e almeno una riga dati)
 * oppure una citazione con almeno 3 righe di testo: le righe di citazione vuote non contano.
 */
function haDocumento(righe: Riga[]): boolean {
  const testo = righe.filter((r) => !r.codice).map((r) => r.testo);
  if (testo.some((riga, i) => eSeparatoreDiTabella(riga) && eRigaDiTabella(testo[i - 1]) && eRigaDiTabella(testo[i + 1]))) return true;
  let righeDiTesto = 0;
  for (const riga of testo) {
    const citazione = RIGA_CITAZIONE.exec(riga);
    if (!citazione) {
      righeDiTesto = 0;
      continue;
    }
    if (citazione[1].trim()) righeDiTesto += 1;
    if (righeDiTesto >= CITAZIONI_MINIME) return true;
  }
  return false;
}

export function checkLezioneArticolo(raw: string, rel: string): Esito {
  const errors: string[] = [];
  const warnings: string[] = [];
  const errore = (regola: string, testo: string) => errors.push(`${rel}: ${regola}: ${testo}`);

  const { content, data } = matter(raw);
  const senzaCodice = data.senzaCodice === true;
  const { intro, sezioni } = dividiInSezioni(leggiRighe(content));
  const testoProsa = [intro, ...sezioni.map((s) => s.righe)].flatMap(prosa);

  if (sezioni.length !== SEZIONI_ATTESE) {
    errore('R1', `servono ${SEZIONI_ATTESE} sezioni H2 (caso, meccanismo, errore, soluzione, caso difficile, checklist); trovate ${sezioni.length}`);
  }

  const profile =
    getArticoloProfile(rel) === 'B' || (typeof data.module === 'string' && getArticoloProfile(data.module) === 'B')
      ? 'B'
      : 'A';
  const { minWords, maxWords } = ARTICOLO_PROFILES[profile];
  const parole = testoProsa.join(' ').split(/\s+/).filter(Boolean).length;
  if (parole < minWords || parole > maxWords) {
    errore('R2', `${parole} parole di prosa (codice escluso, profilo ${profile}); ammesse ${minWords}–${maxWords}`);
  }

  if (sezioni.length === SEZIONI_ATTESE) {
    if (!prosa(sezioni[1].righe).some((riga) => RIGA_IN_GRASSETTO.test(riga.trim()))) {
      errore('R3', 'la sezione 2 (meccanismo) non ha la riga in grassetto che condensa il principio');
    }

    const terzi = prosa(sezioni[2].righe).filter((riga) => /^### /.test(riga)).length;
    if (terzi !== 3) errore('R4', `la sezione 3 deve nominare tre errori con tre titoli ### (trovati ${terzi})`);
    if (senzaCodice) {
      if (!haDocumento(sezioni[2].righe)) errore('R4', 'la sezione 3 non ha il documento sbagliato (una tabella o una citazione di almeno 3 righe)');
      if (!haDocumento(sezioni[3].righe)) errore('R4', 'la sezione 4 non ha il documento giusto (una tabella o una citazione di almeno 3 righe)');
    } else {
      if (!haSql(sezioni[2].righe)) errore('R4', 'la sezione 3 non ha il blocco sql con lo schema sbagliato');
      if (!haSql(sezioni[3].righe)) errore('R4', 'la sezione 4 non ha il blocco sql con lo schema giusto');
    }

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

  if (senzaCodice && [intro, ...sezioni.map((s) => s.righe)].some((righe) => righe.some((r) => r.codice || RECINTO_IN_CITAZIONE.test(r.testo)))) {
    errore('R12', 'la lezione è senza codice: nessun blocco di codice recintato');
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
