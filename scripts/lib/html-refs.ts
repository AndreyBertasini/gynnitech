/**
 * Estrazione dei riferimenti locali (href/src/srcset...) da una pagina HTML renderizzata.
 *
 * Il testo dentro `<code>`/`<pre>` non contiene riferimenti reali: una lezione che mostra
 * `<a href="/checkout">` come esempio genera nell'HTML `&#x3C;a href="/checkout">`, che una
 * regex sul markup scambierebbe per un link a una pagina inesistente.
 */

export type AttrRef = {
    attr: string;
    value: string;
};

export function stripCodeContent(html: string): string {
    return html
        .replace(/<pre\b[\s\S]*?<\/pre>/gi, "")
        .replace(/<code\b[\s\S]*?<\/code>/gi, "");
}

export function extractAttributeRefs(html: string): AttrRef[] {
    const markup = stripCodeContent(html);
    const refs: AttrRef[] = [];
    const attrPattern =
        /\s(href|src|content|component-url|renderer-url|before-hydration-url)=["']([^"']+)["']/gi;
    const srcsetPattern = /\ssrcset=["']([^"']+)["']/gi;

    for (const match of markup.matchAll(attrPattern)) {
        refs.push({ attr: match[1].toLowerCase(), value: match[2] });
    }

    for (const match of markup.matchAll(srcsetPattern)) {
        for (const candidate of match[1].split(",")) {
            const url = candidate.trim().split(/\s+/)[0];
            if (url) {
                refs.push({ attr: "srcset", value: url });
            }
        }
    }

    return refs;
}
