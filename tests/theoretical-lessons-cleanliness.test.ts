import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const courseRoot = path.resolve("src/content/corso");

const conceptualFolders = new Set([
    "panoramica",
    "data-collection",
    "metriche-fondamenti",
    "gestione-data-driven",
    "analisi-prodotto",
    "analisi-marketing",
    "dashboard-visualizzazione",
    "marketing-data-science",
    "direzioni-analitica",
]);

const theoreticalCategories = new Set([
    "Strategia",
    "Comunicazione",
    "Ricerca",
    "Ricerca Qualitativa",
    "Ricerca Quantitativa",
    "Fondamenti",
    "Metriche",
    "Metodologia",
    "Brand",
    "Management",
]);

function walkMdxFiles(dirPath: string): string[] {
    return readdirSync(dirPath).flatMap((entry) => {
        const fullPath = path.join(dirPath, entry);
        const stats = statSync(fullPath);

        if (stats.isDirectory()) {
            return walkMdxFiles(fullPath);
        }

        return fullPath.endsWith(".mdx") ? [fullPath] : [];
    });
}

function splitFrontmatter(raw: string): { frontmatter: string; body: string } {
    if (!raw.startsWith("---")) {
        return { frontmatter: "", body: raw };
    }

    const parts = raw.split("---", 3);
    if (parts.length < 3) {
        return { frontmatter: "", body: raw };
    }

    return { frontmatter: parts[1], body: parts[2] };
}

function extractField(frontmatter: string, field: string): string {
    const match = frontmatter.match(new RegExp(`^${field}:\\s*(.+)$`, "m"));
    return match ? match[1].trim().replace(/^['"]|['"]$/g, "") : "";
}

function countDisallowedFencedBlocks(body: string): number {
    const matches = body.matchAll(/```([^\n`]*)\n[\s\S]*?```/g);
    let count = 0;

    for (const match of matches) {
        const language = match[1].trim().toLowerCase();
        if (language !== "mermaid") {
            count += 1;
        }
    }

    return count;
}

describe("Theoretical lessons cleanliness", () => {
    const lessonFiles = walkMdxFiles(courseRoot).filter((filePath) => path.dirname(filePath) !== courseRoot);

    test.each(lessonFiles)(
        "%s should not contain disallowed fenced blocks when it is conceptual",
        (filePath) => {
            const folder = path.basename(path.dirname(filePath));
            const raw = readFileSync(filePath, "utf8");
            const { frontmatter, body } = splitFrontmatter(raw);
            const category = extractField(frontmatter, "category");

            if (!conceptualFolders.has(folder) || !theoreticalCategories.has(category)) {
                expect(true).toBe(true);
                return;
            }

            expect(countDisallowedFencedBlocks(body)).toBe(0);
        },
    );
});
