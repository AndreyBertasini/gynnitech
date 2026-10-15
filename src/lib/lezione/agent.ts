/** Versione Markdown per agenti dei componenti «3 secondi»: un tag per riga, solo attributi stringa. */

export type AgentState = { passo: number };

export function attr(tag: string, name: string): string | undefined {
  return new RegExp(`\\b${name}="([^"]*)"`).exec(tag)?.[1];
}

const SPARISCONO = /^(<\/(Slide|Confronto|Passi|Opzioni|Barre|NumeriGrandi|Relazioni|Schema|ErroreTipico|TabellaDati)>|<(Confronto|Passi|Opzioni|Barre|NumeriGrandi)>|<(Percorso|Obiettivi)\s*\/>|<TabellaDati\b[^>]*>)$/;

const leggibile = (voce: string): string => {
  const [corpo, passo] = voce.trim().split('@');
  const [tipo, valore] = corpo.split(':');
  const dalPasso = passo ? ` dal passo ${passo}` : '';
  if (tipo === 'col') return `colonna ${valore}${dalPasso}`;
  if (tipo === 'row') return `riga ${valore}${dalPasso}`;
  const [riga, colonna] = valore.split(',');
  return `cella riga ${riga} colonna ${colonna}${dalPasso}`;
};

/** Converte una riga che contiene un tag della lezione; null se la riga non è un tag della lezione. */
export function convertLezioneLine(line: string, state: AgentState): string | null {
  if (SPARISCONO.test(line)) return '';

  const tag = /^<([A-Z][A-Za-z]*)\b/.exec(line)?.[1];
  const a = (name: string) => attr(line, name) ?? '';

  switch (tag) {
    case 'Slide':
      return `**${a('titolo')}** — ★ ${a('messaggio')}`;
    case 'Schema':
      state.passo = 0;
      return `**${a('titolo')}**`;
    case 'Passo':
      state.passo += 1;
      return `${state.passo}. ${a('testo')}`;
    case 'Lato': {
      const esempio = attr(line, 'esempio');
      const scelta = attr(line, 'scelta');
      return `- **${a('nome')}**: ${a('sottotitolo')}${esempio ? ` (\`${esempio}\`)` : ''}${scelta ? ` ← ${scelta}` : ''}`;
    }
    case 'Criterio':
      return `- ${a('nome')}: ${a('a')} / ${a('b')}`;
    case 'Fase':
      return `- **${a('nome')}**: ${a('testo')}`;
    case 'Opzione':
      return `- ${a('verdetto') === 'si' ? '✓' : '✗'} **${a('nome')}**: ${a('testo')}`;
    case 'MiniTabella': {
      const colonne = a('colonne').split(',').map((c) => c.trim()).join(', ');
      const evidenzia = attr(line, 'evidenzia');
      const didascalia = attr(line, 'didascalia');
      return `Tabella: ${colonne} (${a('righe')} righe)${evidenzia ? `; evidenziato: ${evidenzia.split(';').map(leggibile).join(', ')}` : ''}${didascalia ? ` — ${didascalia}` : ''}`;
    }
    case 'Barra':
      return `- ${a('nome')}: ${attr(line, 'etichetta') ?? a('valore')}`;
    case 'Numero':
      return `- **${a('valore')}** ${a('testo')}`;
    case 'Relazioni':
      return `**${a('centro')}** è collegato a:`;
    case 'Nodo':
      return `- ${a('nome')}`;
    case 'Messaggio': {
      const testo = /^<Messaggio\b[^>]*>(.*)<\/Messaggio>$/.exec(line)?.[1] ?? '';
      const autore = attr(line, 'autore');
      return `> ★ ${testo}${autore ? ` — ${autore}` : ''}`;
    }
    case 'Domanda': {
      const testo = /^<Domanda\b[^>]*>(.*)<\/Domanda>$/.exec(line)?.[1] ?? '';
      return `**Domanda:** ${testo} — *Risposta:* ${a('risposta')}`;
    }
    case 'ErroreTipico':
      return `- ✗ ${a('sbagliato')}\n- ✓ ${a('giusto')}`;
    case 'Pattern':
      return `- ✓ Pattern: ${a('si')}\n- ✗ Anti-pattern: ${a('no')}`;
    default:
      return null;
  }
}
