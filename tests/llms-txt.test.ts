import { existsSync, readdirSync, readFileSync } from "fs";
import { describe, expect, test } from "vitest";
import { COURSE_MODULES } from "../src/data/course-modules";
import { PERSON_SAME_AS, PERSON_TOPICS } from "../src/lib/entity";

const llms = readFileSync("public/llms.txt", "utf-8").replace(/\r\n/g, "\n");

function section(heading: string): string {
    const start = llms.indexOf(`## ${heading}`);
    expect(start, `section "${heading}" is missing`).toBeGreaterThanOrEqual(0);
    const rest = llms.slice(start + heading.length + 3);
    const end = rest.indexOf("\n## ");
    return end === -1 ? rest : rest.slice(0, end);
}

describe("llms.txt course modules", () => {
    const listed = [...section("Course modules (https://ginnytech.it/course/<id>)").matchAll(/^- ([a-z0-9-]+) — /gm)].map(
        (m) => m[1],
    );

    test("lists every course module, in course order", () => {
        expect(listed).toEqual(COURSE_MODULES.map((m) => m.id));
    });
});

describe("llms.txt author section", () => {
    const author = section("Author");

    test("names the Markdown profile page and the topics the author works on", () => {
        expect(author).toContain("https://ginnytech.it/about.md");
        const topics = author.split(/\r?\n/).find((line) => line.startsWith("- Topics:")) ?? "";
        for (const topic of PERSON_TOPICS) {
            expect(topics, `topic "${topic.name}"`).toContain(topic.name);
        }
    });

    test("lists the public profiles", () => {
        for (const url of PERSON_SAME_AS) {
            expect(author).toContain(url);
        }
    });
});

describe("llms.txt Markdown convention", () => {
    test("explains how to reach the Markdown twin of a page", () => {
        expect(llms).toContain('append ".md"');
    });

    test("the example it gives points at a real article", () => {
        const example = /https:\/\/ginnytech\.it\/blog\/([a-z0-9-]+)\.md/.exec(llms.slice(llms.indexOf('append ".md"')));
        expect(example, "no .md example after the convention").not.toBeNull();
        expect(existsSync(`src/content/blog/${example![1]}.mdx`)).toBe(true);
    });
});

describe("llms-full.txt", () => {
    const full = readFileSync("public/llms-full.txt", "utf-8");
    const lines = full.split(/\r?\n/);

    const blogCount = readdirSync("src/content/blog").filter((f) => f.endsWith(".mdx")).length;
    const lessonCount = readdirSync("src/content/corso", { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .reduce((n, d) => n + readdirSync(`src/content/corso/${d.name}`).filter((f) => f.endsWith(".mdx")).length, 0);

    test("every URL line is a clean absolute ginnytech.it URL", () => {
        const urls = lines.filter((l) => l.startsWith("URL: "));
        expect(urls.length).toBeGreaterThan(0);
        for (const url of urls) {
            expect(url).toMatch(/^URL: https:\/\/ginnytech\.it\/(blog|course)\/[a-z0-9-]+(\/[a-z0-9-]+)?$/);
        }
    });

    test("every article and lesson links its Markdown twin right after its URL", () => {
        const markdown = lines.filter((l) => l.startsWith("Markdown: "));
        expect(markdown).toHaveLength(blogCount + lessonCount);
        lines.forEach((line, i) => {
            if (line.startsWith("Markdown: ")) {
                expect(lines[i - 1].startsWith("URL: ") || lines[i - 2]?.startsWith("URL: ")).toBe(true);
            }
        });
        const pairs = lines.flatMap((l, i) => (l.startsWith("Markdown: ") ? [[lines.slice(0, i).reverse().find((x) => x.startsWith("URL: "))!, l]] : []));
        for (const [url, md] of pairs) {
            expect(md).toBe(`Markdown: ${url.slice("URL: ".length)}.md`);
        }
    });

    test("does not leak internal MDX editorial comments", () => {
        expect(full).not.toContain("{/");
        expect(full).not.toContain("GEO: claim senza fonte");
        expect(full).not.toContain("geo-imprint");
    });

    test("header names the author and the .md convention", () => {
        expect(full.slice(0, 800)).toContain("Andrii Dyshkantiuk");
        expect(full.slice(0, 800)).toContain(".md");
    });
});
