/**
 * Verifica che i blocchi di codice delle lezioni siano davvero renderizzati:
 * Expressive Code per il codice, Mermaid per i diagrammi, KaTeX per le formule.
 */
export interface RenderedCodeAudit {
  /** Linguaggi dei blocchi rimasti `<pre><code class="language-*">` senza evidenziatore. */
  plainCode: string[];
  /** Blocchi `mermaid` rimasti testo. */
  plainMermaid: number;
  ec: number;
  mermaid: number;
  katex: number;
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
  };
}

/** Conta i blocchi recintati (```lang) di un sorgente MDX: apertura e chiusura alternate. */
export function countSourceFences(source: string): { code: number; mermaid: number } {
  let open = false;
  let code = 0;
  let mermaid = 0;
  for (const line of source.split('\n')) {
    const m = line.match(/^\s*```\s*([\w+-]*)/);
    if (!m) continue;
    if (!open) {
      if (m[1] === 'mermaid') mermaid += 1;
      else code += 1;
    }
    open = !open;
  }
  return { code, mermaid };
}
