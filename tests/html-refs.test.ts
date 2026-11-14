import { describe, expect, test } from "vitest";
import { extractAttributeRefs, stripCodeContent } from "../scripts/lib/html-refs";

describe("extractAttributeRefs", () => {
    test("raccoglie href, src e srcset reali", () => {
        const html =
            '<a href="/course/x/">x</a><img src="/img/a.webp" srcset="/img/a.webp 1x, /img/b.webp 2x">';
        expect(extractAttributeRefs(html)).toEqual([
            { attr: "href", value: "/course/x/" },
            { attr: "src", value: "/img/a.webp" },
            { attr: "srcset", value: "/img/a.webp" },
            { attr: "srcset", value: "/img/b.webp" },
        ]);
    });

    test("ignora gli href mostrati come esempio dentro <code> inline", () => {
        const html =
            '<p>un link <code>&#x3C;a href="/checkout"></code> e un <a href="/course/">vero</a></p>';
        expect(extractAttributeRefs(html)).toEqual([{ attr: "href", value: "/course/" }]);
    });

    test("ignora gli href dentro i blocchi <pre>", () => {
        const html =
            '<pre class="x"><code>&#x3C;a href="/checkout">pay&#x3C;/a></code></pre><a href="/ok">ok</a>';
        expect(extractAttributeRefs(html)).toEqual([{ attr: "href", value: "/ok" }]);
    });

    test("stripCodeContent rimuove solo code e pre", () => {
        expect(stripCodeContent('<p>a<code>b</code>c<pre>d</pre>e</p>')).toBe("<p>ace</p>");
    });
});
