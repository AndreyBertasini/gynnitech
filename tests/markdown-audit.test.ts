import { describe, expect, test } from "vitest";
import { auditMarkdownTwin } from "../scripts/lib/markdown-audit";

const FRONTMATTER = [
    "---",
    'title: "Titolo"',
    'url: "https://ginnytech.it/blog/x/"',
    'author_url: "https://ginnytech.it/about"',
    "---",
].join("\n");

const doc = (body: string) => `${FRONTMATTER}\n\n# Titolo\n\n${body}\n`;

describe("auditMarkdownTwin", () => {
    test("accepts a document with frontmatter and a substantial body", () => {
        expect(auditMarkdownTwin(doc("Testo. ".repeat(400)))).toEqual([]);
    });

    test("rejects a document that is only frontmatter and the H1", () => {
        const errors = auditMarkdownTwin(doc(""));
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain("body");
    });

    test("does not count the H1 or the frontmatter as body", () => {
        expect(auditMarkdownTwin(doc("breve"), 1500)).toHaveLength(1);
    });

    test("honours a custom minimum", () => {
        expect(auditMarkdownTwin(doc("Testo. ".repeat(100)), 500)).toEqual([]);
    });

    test("rejects a document without frontmatter", () => {
        const errors = auditMarkdownTwin("# Titolo\n\n" + "Testo. ".repeat(400));
        expect(errors.some((e) => e.includes("frontmatter"))).toBe(true);
    });

    test("rejects frontmatter missing url or author_url", () => {
        const text = `---\ntitle: "T"\n---\n\n# T\n\n${"Testo. ".repeat(400)}`;
        const errors = auditMarkdownTwin(text);
        expect(errors.some((e) => e.includes("url"))).toBe(true);
        expect(errors.some((e) => e.includes("author_url"))).toBe(true);
    });
});
