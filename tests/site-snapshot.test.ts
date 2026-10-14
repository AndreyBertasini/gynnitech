import { describe, expect, test } from "vitest";
import {
    comparePages,
    extractPage,
    normalizeText,
    renderReport,
    type Snapshot,
} from "../scripts/lib/site-snapshot";

const FULL_PAGE =
    '<html><head><title>T</title><meta name="description" content="D">' +
    '<link rel="canonical" href="/x/"></head><body><h1>Uno</h1>' +
    '<p>a<strong>b</strong></p><span class="katex"></span>' +
    '<span class="katex-display"></span><a href="/c/">c</a>' +
    '<a href="https://e.it">e</a></body></html>';

describe("normalizeText", () => {
    test("collapses whitespace runs to a single space", () => {
        expect(normalizeText("percorso.\n  Lezioni")).toBe("percorso. Lezioni");
    });

    test("never inserts or removes a space", () => {
        expect(normalizeText("percorso.Lezioni")).toBe("percorso.Lezioni");
    });

    test("masks the content hash of /_astro assets", () => {
        expect(normalizeText("/_astro/index.AbC123xy.css")).toBe("/_astro/index.css");
    });

    test("masks full ISO timestamps", () => {
        expect(normalizeText("built 2026-10-14T10:20:30.123Z ok")).toBe("built <ISO_DATE> ok");
    });
});

describe("extractPage", () => {
    test("extracts metadata, headings, counts and internal links", () => {
        const page = extractPage(FULL_PAGE);
        expect(page).not.toBeNull();
        expect(page!.title).toBe("T");
        expect(page!.metaDescription).toBe("D");
        expect(page!.canonical).toBe("/x/");
        expect(page!.headings).toEqual([{ level: 1, text: "Uno" }]);
        expect(page!.counts.katex).toBe(1);
        expect(page!.counts.katexDisplay).toBe(1);
        expect(page!.internalLinks).toEqual(["/c/"]);
    });

    test("keeps adjacent inline elements attached in text", () => {
        expect(extractPage(FULL_PAGE)!.text).toContain("ab");
    });

    test("returns null for redirect-only pages", () => {
        const html =
            '<html><head><meta http-equiv="refresh" content="0;url=/x/"></head><body></body></html>';
        expect(extractPage(html)).toBeNull();
    });

    test("does not throw on a fragment without head, title or body", () => {
        const page = extractPage("<p>solo frammento</p>");
        expect(page).not.toBeNull();
        expect(page!.title).toBe("");
    });

    test("a hidden br does not hide a whitespace difference after it", () => {
        const withSpace = '<html><body><p>percorso.<br class="hidden"> Lezioni</p></body></html>';
        const withoutSpace = '<html><body><p>percorso.<br class="hidden">Lezioni</p></body></html>';
        expect(extractPage(withSpace)!.text).toBe("percorso. Lezioni");
        expect(extractPage(withoutSpace)!.text).toBe("percorso.Lezioni");
    });

    test("separates block elements without whitespace between them", () => {
        const html = "<html><body><p>uno</p><p>due</p></body></html>";
        expect(extractPage(html)!.text).toBe("uno due");
    });

    test("ignores script, style, noscript and template content", () => {
        const html =
            "<html><body><p>visibile</p><script>nascosto1</script><style>nascosto2</style>" +
            "<noscript>nascosto3</noscript><template>nascosto4</template></body></html>";
        const text = extractPage(html)!.text;
        expect(text).toContain("visibile");
        expect(text).not.toMatch(/nascosto/);
    });
});

describe("comparePages", () => {
    const base = (): Snapshot => ({ "a/index.html": extractPage(FULL_PAGE)! });

    test("identical snapshots produce no differences", () => {
        const result = comparePages(base(), base());
        expect(result.added).toEqual([]);
        expect(result.removed).toEqual([]);
        expect(result.changed).toEqual([]);
    });

    test("detects a lost space in text", () => {
        const a = base();
        const b = base();
        a["a/index.html"].text = "stesso percorso. Lezioni pratiche";
        b["a/index.html"].text = "stesso percorso.Lezioni pratiche";
        const result = comparePages(a, b);
        expect(result.changed).toHaveLength(1);
        expect(result.changed[0].fields).toContain("text");
        expect(result.changed[0].textDiff!.count).toBeGreaterThanOrEqual(1);
    });

    test("reports added and removed pages", () => {
        const a = base();
        const b: Snapshot = { "b/index.html": a["a/index.html"] };
        const result = comparePages(a, b);
        expect(result.removed).toEqual(["a/index.html"]);
        expect(result.added).toEqual(["b/index.html"]);
    });
});

describe("renderReport", () => {
    test("states that there are no differences", () => {
        const report = renderReport({ added: [], removed: [], changed: [] });
        expect(report).toContain("Nessuna differenza");
    });
});
