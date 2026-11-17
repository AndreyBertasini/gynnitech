import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { V2_MODULE_PROFILES } from "../scripts/lezioni-v2-rules";

const courseRoot = path.resolve("src/content/corso");
const courseCatalogPath = path.resolve(".codex/skills/course-editorial-system/scripts/course_catalog.py");

export const CONCEPTUAL_FOLDERS = new Set(
    Object.entries(V2_MODULE_PROFILES)
        .filter(([, profile]) => profile === "conceptual")
        .map(([folder]) => folder),
);

export const ANALYTICAL_FOLDERS = new Set(
    Object.entries(V2_MODULE_PROFILES)
        .filter(([, profile]) => profile === "analytical")
        .map(([folder]) => folder),
);

export const TECHNICAL_FOLDERS = new Set(
    Object.entries(V2_MODULE_PROFILES)
        .filter(([, profile]) => profile === "technical")
        .map(([folder]) => folder),
);

export const THEORETICAL_CATEGORIES = new Set([
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

const expectedConceptualFolders = Object.entries(V2_MODULE_PROFILES)
    .filter(([, profile]) => profile === "conceptual")
    .map(([folder]) => folder)
    .sort();

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
    const normalized = raw.replace(/\r\n/g, "\n");
    if (!normalized.startsWith("---")) {
        return { frontmatter: "", body: normalized };
    }

    // Il delimitatore di chiusura è una riga composta solo da "---".
    // split("---", 3) era sbagliato: troncava il body alle righe separatore
    // delle tabelle markdown (| --- |), falsando i risultati del test.
    const lines = normalized.split("\n");
    for (let i = 1; i < lines.length; i += 1) {
        if (lines[i].trim() === "---") {
            return {
                frontmatter: lines.slice(1, i).join("\n"),
                body: lines.slice(i + 1).join("\n"),
            };
        }
    }

    return { frontmatter: "", body: normalized };
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

export function evaluateTheoreticalCleanliness(folder: string, raw: string): {
    enforced: boolean;
    disallowedBlocks: number;
    formato: string;
    category: string;
    senzaCodice: boolean;
} {
    const { frontmatter, body } = splitFrontmatter(raw);
    const formato = extractField(frontmatter, "formato");
    const category = extractField(frontmatter, "category");
    const senzaCodice = extractField(frontmatter, "senzaCodice").toLowerCase() === "true";
    const enforced = senzaCodice || (CONCEPTUAL_FOLDERS.has(folder) && THEORETICAL_CATEGORIES.has(category));
    const disallowedBlocks = enforced ? countDisallowedFencedBlocks(body) : 0;

    return {
        enforced,
        disallowedBlocks,
        formato,
        category,
        senzaCodice,
    };
}

function makeFixture(
    fields: {
        formato?: string;
        category?: string;
        senzaCodice?: boolean;
    },
    body: string,
): string {
    const lines = ["---", 'title: "Fixture Lesson"'];
    if (fields.formato !== undefined) {
        lines.push(`formato: "${fields.formato}"`);
    }
    if (fields.category !== undefined) {
        lines.push(`category: "${fields.category}"`);
    }
    if (fields.senzaCodice !== undefined) {
        lines.push(`senzaCodice: ${fields.senzaCodice}`);
    }
    lines.push("---", "", body);
    return lines.join("\n");
}

function parsePythonStringSet(source: string, constantName: string): string[] {
    const match = source.match(new RegExp(`${constantName}\\s*=\\s*\\{([\\s\\S]*?)\\}`));
    if (!match) {
        return [];
    }
    return [...match[1].matchAll(/["']([^"']+)["']/g)].map((entry) => entry[1]);
}

describe("Theoretical lessons cleanliness", () => {
    const lessonFiles = walkMdxFiles(courseRoot).filter((filePath) => path.dirname(filePath) !== courseRoot);

    test("CONCEPTUAL_FOLDERS aligns with V2_MODULE_PROFILES and excludes analytical/technical modules", () => {
        expect([...CONCEPTUAL_FOLDERS].sort()).toEqual(expectedConceptualFolders);
        expect(CONCEPTUAL_FOLDERS.has("marketing-data-science")).toBe(false);
        expect(CONCEPTUAL_FOLDERS.has("analisi-marketing")).toBe(false);
        expect(CONCEPTUAL_FOLDERS.has("ai-data-workflows")).toBe(false);
        expect(CONCEPTUAL_FOLDERS.has("agentic-ai-data-workflows")).toBe(false);
    });

    test("course_catalog.py CONCEPTUAL_FOLDERS and THEORETICAL_CATEGORIES align with V2 rules", () => {
        const catalogSource = readFileSync(courseCatalogPath, "utf8");
        const pyConceptual = parsePythonStringSet(catalogSource, "CONCEPTUAL_FOLDERS").sort();
        const pyTheoretical = parsePythonStringSet(catalogSource, "THEORETICAL_CATEGORIES").sort();

        expect(pyConceptual).toEqual(expectedConceptualFolders);
        expect(pyTheoretical).toEqual([...THEORETICAL_CATEGORIES].sort());
        expect(catalogSource).toContain("didattica-v2");
        expect(catalogSource).toContain("senzaCodice");
    });

    test("didattica-v2 conceptual lessons with theoretical categories forbid non-mermaid code blocks", () => {
        for (const folder of expectedConceptualFolders) {
            const withPython = makeFixture(
                { formato: "didattica-v2", category: "Fondamenti" },
                "Testo.\n\n```python\nx = 1\n```\n",
            );
            const withMermaidOnly = makeFixture(
                { formato: "didattica-v2", category: "Fondamenti" },
                "Testo.\n\n```mermaid\nflowchart LR\nA --> B\n```\n",
            );

            const pythonResult = evaluateTheoreticalCleanliness(folder, withPython);
            expect(pythonResult.enforced).toBe(true);
            expect(pythonResult.disallowedBlocks).toBe(1);

            const mermaidResult = evaluateTheoreticalCleanliness(folder, withMermaidOnly);
            expect(mermaidResult.enforced).toBe(true);
            expect(mermaidResult.disallowedBlocks).toBe(0);
        }
    });

    test("didattica-v2 lessons with senzaCodice: true forbid non-mermaid code blocks regardless of module or category", () => {
        const cases = [
            { folder: "gestione-data-driven", category: "Decisione" },
            { folder: "marketing-data-science", category: "Analisi" },
            { folder: "metriche-fondamenti", category: "Metriche" },
        ];

        for (const { folder, category } of cases) {
            const withSql = makeFixture(
                { formato: "didattica-v2", category, senzaCodice: true },
                "Testo.\n\n```sql\nSELECT 1;\n```\n",
            );
            const withMermaidOnly = makeFixture(
                { formato: "didattica-v2", category, senzaCodice: true },
                "Testo.\n\n```mermaid\ngraph TD\nA --> B\n```\n",
            );

            const sqlResult = evaluateTheoreticalCleanliness(folder, withSql);
            expect(sqlResult.enforced).toBe(true);
            expect(sqlResult.disallowedBlocks).toBe(1);

            const mermaidResult = evaluateTheoreticalCleanliness(folder, withMermaidOnly);
            expect(mermaidResult.enforced).toBe(true);
            expect(mermaidResult.disallowedBlocks).toBe(0);
        }
    });

    test("ai-data-workflows, agentic-ai-data-workflows, and marketing-data-science allow Python/SQL for didattica-v2 when senzaCodice !== true", () => {
        for (const folder of ["ai-data-workflows", "agentic-ai-data-workflows", "marketing-data-science"]) {
            const withPythonAndSql = makeFixture(
                { formato: "didattica-v2", category: "Fondamenti" },
                "Testo.\n\n```python\nimport pandas as pd\n```\n\n```sql\nSELECT COUNT(*) FROM events;\n```\n",
            );
            const result = evaluateTheoreticalCleanliness(folder, withPythonAndSql);
            expect(result.enforced).toBe(false);
            expect(result.disallowedBlocks).toBe(0);
        }
    });

    test("preserves backwards compatibility for legacy and articolo lessons", () => {
        const legacyConceptual = makeFixture(
            { category: "Fondamenti" },
            "Testo.\n\n```python\nx = 1\n```\n",
        );
        expect(evaluateTheoreticalCleanliness("filosofia-analisi-dati", legacyConceptual).disallowedBlocks).toBe(1);

        const articoloSenzaCodice = makeFixture(
            { formato: "articolo", category: "Decisione", senzaCodice: true },
            "Testo.\n\n```mermaid\nflowchart TD\nA --> B\n```\n",
        );
        expect(evaluateTheoreticalCleanliness("gestione-data-driven", articoloSenzaCodice)).toMatchObject({
            enforced: true,
            disallowedBlocks: 0,
        });

        const articoloQuantitative = makeFixture(
            { formato: "articolo", category: "Fondamenti" },
            "Testo.\n\n```python\nimport numpy as np\n```\n",
        );
        expect(evaluateTheoreticalCleanliness("marketing-data-science", articoloQuantitative)).toMatchObject({
            enforced: false,
            disallowedBlocks: 0,
        });
    });

    test.each(lessonFiles)(
        "%s should not contain disallowed fenced blocks when it is conceptual or senzaCodice",
        (filePath) => {
            const folder = path.basename(path.dirname(filePath));
            const raw = readFileSync(filePath, "utf8");
            const result = evaluateTheoreticalCleanliness(folder, raw);

            if (!result.enforced) {
                expect(true).toBe(true);
                return;
            }

            expect(result.disallowedBlocks).toBe(0);
        },
    );
});
