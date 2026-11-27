/**
 * Verifica che i blocchi di codice delle pagine siano davvero renderizzati:
 * Expressive Code per il codice, Mermaid per i diagrammi, KaTeX per le formule.
 * Il confronto è per pagina: sorgente (MDX) contro HTML generato.
 */
export interface RenderedCodeAudit {
  /** Linguaggi dei blocchi rimasti `<pre><code class="language-*">` senza evidenziatore. */
  plainCode: string[];
  /** Blocchi `mermaid` rimasti testo. */
  plainMermaid: number;
  ec: number;
  mermaid: number;
  katex: number;
  katexDisplay: number;
  katexError: number;
}

export interface SourceExpectation {
  code: number;
  mermaid: number;
  /** Il sorgente ha formule `$$ … $$` (in riga singola o a blocco). */
  doubleDollarMath: boolean;
}

const count = (html: string, re: RegExp) => html.match(re)?.length ?? 0;

export function auditRenderedHtml(html: string): RenderedCodeAudit {
  const plainCode: string[] = [];
  let plainMermaid = 0;
  for (const m of html.matchAll(/<pre(?:\s[^>]*)?>\s*<code[^>]*class="[^"]*\blanguage-([\w+-]+)/g)) {
    const lang = m[1];
    if (lang === 'math') continue;
    if (lang === 'mermaid') plainMermaid += 1;
    else plainCode.push(lang);
  }
  return {
    plainCode,
    plainMermaid,
    ec: count(html, /class="expressive-code\b/g),
    mermaid: count(html, /<pre class="mermaid\b/g),
    katex: count(html, /class="katex"/g),
    katexDisplay: count(html, /class="katex-display"/g),
    katexError: count(html, /class="katex-error"/g),
  };
}

/**
 * Separa un sorgente Markdown in prosa e blocchi recintati, come CommonMark:
 * un fence si chiude solo con lo stesso carattere (` o ~) e con almeno la stessa lunghezza
 * dell'apertura; dentro un fence una riga con info string è contenuto, non un nuovo blocco.
 */
export function splitFences(source: string): { prose: string; langs: string[] } {
  const prose: string[] = [];
  const langs: string[] = [];
  let open: { char: string; len: number } | null = null;
  for (const line of source.split('\n')) {
    const m = line.match(/^\s*(`{3,}|~{3,})\s*([^\s`]*)/);
    if (open) {
      if (m && m[1][0] === open.char && m[1].length >= open.len && line.trim() === m[1]) open = null;
      continue;
    }
    if (m) {
      open = { char: m[1][0], len: m[1].length };
      langs.push(m[2]);
      continue;
    }
    prose.push(line);
  }
  return { prose: prose.join('\n'), langs };
}

/** Conta i blocchi recintati di un sorgente MDX, separando i diagrammi mermaid dal resto. */
export function countSourceFences(source: string): { code: number; mermaid: number } {
  const { langs } = splitFences(source);
  const mermaid = langs.filter((l) => l === 'mermaid').length;
  return { code: langs.length - mermaid, mermaid };
}

/** Vero se la prosa (fuori dai fence) contiene una formula `$$ … $$`. */
export function hasDoubleDollarMath(source: string): boolean {
  return /\$\$[\s\S]+?\$\$/.test(splitFences(source).prose);
}

export function sourceExpectation(source: string): SourceExpectation {
  return { ...countSourceFences(source), doubleDollarMath: hasDoubleDollarMath(source) };
}

/** Errori di una pagina: confronto esatto tra cosa promette il sorgente e cosa c'è nell'HTML. */
export function pageErrors(expected: SourceExpectation, r: RenderedCodeAudit): string[] {
  const errors: string[] = [];
  if (r.plainCode.length) {
    errors.push(`${r.plainCode.length} blocchi di codice non evidenziati (${[...new Set(r.plainCode)].join(', ')})`);
  }
  if (r.plainMermaid) errors.push(`${r.plainMermaid} diagrammi Mermaid non disegnati`);
  if (r.ec !== expected.code) errors.push(`Expressive Code: ${r.ec} blocchi, attesi ${expected.code}`);
  if (r.mermaid !== expected.mermaid) errors.push(`Mermaid: ${r.mermaid} diagrammi, attesi ${expected.mermaid}`);
  if (r.katexError) errors.push(`KaTeX: ${r.katexError} formule in errore`);
  // `$$x$$` su una riga sola esce come formula inline (`katex`), non come `katex-display`: basta che sia stata processata.
  if (expected.doubleDollarMath && r.katex === 0) {
    errors.push('KaTeX: il sorgente ha formule $$ ma la pagina non ha formule KaTeX');
  }
  return errors;
}
