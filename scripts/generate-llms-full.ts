import { promises as fs } from "fs";
import { glob } from "glob";
import matter from "gray-matter";

const SITE_URL = "https://ginnytech.it";

async function main() {
    const sections: string[] = [];

    sections.push("# GinnyTech — Full Content (llms-full.txt)");
    sections.push("");
    sections.push("> This file contains the full text of the primary content on ginnytech.it,");
    sections.push("> for LLM crawlers that want the complete corpus rather than the index in llms.txt.");
    sections.push("> License: CC BY 4.0 — cite the source and link the original page.");
    sections.push("> Author: Andrii Dyshkantiuk (https://ginnytech.it/about).");
    sections.push("> Each article and lesson also has a Markdown twin: its URL plus .md (see the Markdown line).");
    sections.push("");

    // Blog (Italian)
    const blogFiles = (await glob("src/content/blog/*.mdx")).map(toPosix).sort();
    sections.push(`## Blog articles (${blogFiles.length})`);
    sections.push("");
    for (const file of blogFiles) {
        const raw = await fs.readFile(file, "utf-8");
        const { data, content } = matter(raw);
        const slug = file.replace(/^src\/content\/blog\//, "").replace(/\.mdx$/, "");
        sections.push(`### ${data.title}`);
        sections.push(`URL: ${SITE_URL}/blog/${slug}`);
        sections.push(`Markdown: ${SITE_URL}/blog/${slug}.md`);
        sections.push(`Date: ${data.date ?? ""}`);
        sections.push("");
        sections.push(stripMarkdown(content));
        sections.push("");
    }

    // Course lessons (Italian)
    const corsoFiles = (await glob("src/content/corso/**/*.mdx")).map(toPosix).sort();
    sections.push(`## Course lessons (${corsoFiles.length})`);
    sections.push("");
    for (const file of corsoFiles) {
        const raw = await fs.readFile(file, "utf-8");
        const { data, content } = matter(raw);
        const rel = file.replace(/^src\/content\/corso\//, "").replace(/\.mdx$/, "");
        const [module, slug] = rel.split("/");
        sections.push(`### ${data.title}`);
        if (slug) {
            sections.push(`URL: ${SITE_URL}/course/${module}/${slug}`);
            sections.push(`Markdown: ${SITE_URL}/course/${module}/${slug}.md`);
        } else {
            sections.push(`URL: ${SITE_URL}/course/${module}`);
        }
        sections.push("");
        sections.push(stripMarkdown(content));
        sections.push("");
    }

    await fs.writeFile("public/llms-full.txt", sections.join("\n"), "utf-8");
    console.log(`Wrote public/llms-full.txt (${sections.length} lines)`);
}

// glob returns backslash paths on Windows; every path logic below assumes "/".
function toPosix(file: string): string {
    return file.replace(/\\/g, "/");
}

function stripMarkdown(md: string): string {
    return md
        .replace(/\{\/\*[\s\S]*?\*\/\}/g, "") // MDX comments (internal editorial markers)
        .replace(/```[\s\S]*?```/g, "") // code blocks
        .replace(/`([^`]+)`/g, "$1") // inline code
        .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links -> text
        .replace(/^#{1,6}\s+/gm, "") // headings
        .replace(/^\s*[-*+]\s+/gm, "- ") // list bullets
        .replace(/^\s*\d+\.\s+/gm, "") // ordered list
        .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
        .replace(/\*([^*]+)\*/g, "$1") // italic
        .replace(/\|/g, " ") // table pipes
        .replace(/^\s*[-=]{3,}\s*$/gm, "") // hr
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

main().catch(console.error);
