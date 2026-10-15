/** Contesto di una lezione «3 secondi», messo in Astro.locals dal template della lezione. */
export type LezioneContext = {
  sezioni: string[];
  numero: number;
  totale: number;
  moduloTitolo: string;
};

export type Evidenza = {
  tipo: 'col' | 'row' | 'cell';
  colonna?: string;
  riga?: number;
  passo?: number;
};

/** «2 · Leggere poco». Lancia se la sezione non esiste: la build deve fallire, non mostrare un'etichetta sbagliata. */
export function sectionLabel(ctx: LezioneContext | undefined, sezione: number): string {
  if (!ctx) throw new Error('Componente «3 secondi» fuori da una lezione con formato: "3s".');
  const nome = ctx.sezioni[sezione - 1];
  if (!Number.isInteger(sezione) || !nome) {
    throw new Error(`Sezione ${sezione} inesistente: la lezione ne dichiara ${ctx.sezioni.length}.`);
  }
  return `${sezione} · ${nome}`;
}

export function progressSegments(totale: number, attiva: number): boolean[] {
  return Array.from({ length: totale }, (_, i) => i === attiva - 1);
}

const toRiga = (value: string, voce: string): number => {
  const riga = Number(value);
  if (!Number.isInteger(riga) || riga < 1) throw new Error(`Riga non valida in «${voce}».`);
  return riga;
};

/** Legge «col:amount@3;row:2;cell:2,order_id». Lancia su voce malformata o colonna sconosciuta. */
export function parseEvidenzia(spec: string | undefined, colonne: string[]): Evidenza[] {
  if (!spec?.trim()) return [];
  return spec.split(';').map((raw) => {
    const voce = raw.trim();
    const match = /^(col|row|cell):([^@]+)(?:@(\d+))?$/.exec(voce);
    if (!match) throw new Error(`Evidenziazione non valida: «${voce}».`);
    const [, tipo, valore, passo] = match;
    const evidenza: Evidenza = { tipo: tipo as Evidenza['tipo'] };
    const colonna = (nome: string) => {
      if (!colonne.includes(nome)) throw new Error(`Colonna sconosciuta «${nome}» in «${voce}».`);
      return nome;
    };
    if (tipo === 'col') evidenza.colonna = colonna(valore.trim());
    if (tipo === 'row') evidenza.riga = toRiga(valore.trim(), voce);
    if (tipo === 'cell') {
      const [riga, nome] = valore.split(',').map((s) => s.trim());
      evidenza.riga = toRiga(riga, voce);
      evidenza.colonna = colonna(nome ?? '');
    }
    if (passo) evidenza.passo = Number(passo);
    return evidenza;
  });
}

const covers = (e: Evidenza, riga: number, colonna: string): boolean =>
  (e.tipo === 'col' && e.colonna === colonna) ||
  (e.tipo === 'row' && e.riga === riga) ||
  (e.tipo === 'cell' && e.riga === riga && e.colonna === colonna);

/** Stato di una cella: statica se una voce senza passo la copre, altrimenti il primo passo che la accende. */
export function cellMark(evidenze: Evidenza[], riga: number, colonna: string): { statico: boolean; passo?: number } {
  const coperture = evidenze.filter((e) => covers(e, riga, colonna));
  if (coperture.some((e) => e.passo === undefined)) return { statico: true };
  const passi = coperture.map((e) => e.passo as number);
  return passi.length > 0 ? { statico: false, passo: Math.min(...passi) } : { statico: false };
}

/** «2,4» → [2, 4] per TabellaDati. */
export function parseRighe(spec: string | undefined): number[] {
  if (!spec?.trim()) return [];
  return spec.split(',').map((s) => toRiga(s.trim(), spec));
}
