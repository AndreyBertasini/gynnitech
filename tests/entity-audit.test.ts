import { describe, expect, test } from "vitest";
import { auditEntityGraph } from "../scripts/lib/entity-audit";
import { ORGANIZATION_ID, PERSON_ID } from "../src/lib/entity";

const page = (graph: unknown, body = ""): string =>
    `<html><head><script type="application/ld+json">${JSON.stringify(graph)}</script></head><body>${body}</body></html>`;

const person = { "@type": "Person", "@id": PERSON_ID, name: "Andrii Dyshkantiuk" };
const AUTHOR_LINK = '<a href="/about/" rel="author">Andrii</a>';

describe("auditEntityGraph", () => {
    test("accepts an Article whose author is the canonical Person and links /about/ with rel=author", () => {
        const html = page({ "@graph": [{ "@type": "Article", author: person }] }, AUTHOR_LINK);
        expect(auditEntityGraph(html)).toEqual([]);
    });

    test("rejects a Person without @id", () => {
        const html = page({ "@graph": [{ "@type": "Article", author: { "@type": "Person", name: "Andrii" } }] }, AUTHOR_LINK);
        const errors = auditEntityGraph(html);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain("Person");
    });

    test("rejects the legacy home Person @id", () => {
        const legacy = { ...person, "@id": "https://ginnytech.it/#andrii-dyshkantiuk" };
        const errors = auditEntityGraph(page({ "@graph": [legacy] }));
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain("Person");
    });

    test("rejects a GinnyTech Organization without the canonical @id", () => {
        const org = { "@type": "Organization", name: "GinnyTech", url: "https://ginnytech.it" };
        const errors = auditEntityGraph(page({ "@graph": [org] }));
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain("Organization");
    });

    test("accepts a GinnyTech EducationalOrganization with the canonical @id", () => {
        const org = { "@type": "EducationalOrganization", "@id": ORGANIZATION_ID, name: "GinnyTech" };
        expect(auditEntityGraph(page({ "@graph": [org] }))).toEqual([]);
    });

    test("rejects a WebSite that declares a SearchAction", () => {
        const site = { "@type": "WebSite", potentialAction: { "@type": "SearchAction", target: "x" } };
        const errors = auditEntityGraph(page({ "@graph": [site] }));
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain("SearchAction");
    });

    test("rejects a LearningResource page without an author link", () => {
        const html = page({ "@graph": [{ "@type": "LearningResource", author: person }] });
        const errors = auditEntityGraph(html);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain("rel=\"author\"");
    });

    test("accepts the author link in any attribute order and with an absolute href", () => {
        const html = page(
            { "@type": "Article", author: person },
            '<a class="x" rel="author noopener" href="https://ginnytech.it/about">A</a>',
        );
        expect(auditEntityGraph(html)).toEqual([]);
    });

    test("accepts an English page with the same Person id", () => {
        const html = page({ "@graph": [{ "@type": "Article", inLanguage: "en-US", author: person }] }, AUTHOR_LINK);
        expect(auditEntityGraph(html)).toEqual([]);
    });

    test("ignores pages without JSON-LD", () => {
        expect(auditEntityGraph("<html><body>nulla</body></html>")).toEqual([]);
    });

    test("reports invalid JSON-LD", () => {
        const html = '<script type="application/ld+json">{bad</script>';
        expect(auditEntityGraph(html)).toEqual(["invalid JSON-LD"]);
    });
});
