// Contenuto di <pre>, <code>, <script>, <style> e <textarea> è testo, non markup:
// un `href="/x"` scritto in un esempio di codice non è un link del sito.
const textRegion = /<(pre|code|script|style|textarea)\b[^>]*>[\s\S]*?<\/\1>/gi;

/** Applica `transform` solo al markup, lasciando intatte le regioni di testo/codice. */
export function mapMarkupOutsideTextRegions(html: string, transform: (markup: string) => string): string {
  let out = '';
  let last = 0;
  for (const match of html.matchAll(textRegion)) {
    const start = match.index ?? 0;
    // Il tag di apertura è markup (può avere attributi), il contenuto no.
    const openTagEnd = match[0].indexOf('>') + 1;
    out += transform(html.slice(last, start) + match[0].slice(0, openTagEnd));
    out += match[0].slice(openTagEnd);
    last = start + match[0].length;
  }
  return out + transform(html.slice(last));
}

/** Rimuove il contenuto delle regioni di testo/codice, per analisi che cercano solo nel markup. */
export function stripTextRegions(html: string): string {
  return html.replace(textRegion, (_whole, tag: string) => `<${tag}></${tag}>`);
}
