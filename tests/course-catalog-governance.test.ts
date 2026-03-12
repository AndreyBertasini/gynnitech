import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const courseRoot = path.resolve("src/content/corso");

const canonicalModules: Record<string, string> = {
    panoramica: "Modulo 1: Panoramica del Corso",
    "data-collection": "Modulo 2: Data Collection & Tracking",
    "metriche-fondamenti": "Modulo 3: Metriche e Fondamenti Analitici",
    "gestione-data-driven": "Modulo 4: Gestione Data-Driven",
    "analisi-prodotto": "Modulo 5: Analisi di Prodotto",
    "analisi-marketing": "Modulo 6: Analisi di Marketing",
    "dashboard-visualizzazione": "Modulo 7: Dashboard & Data Visualization",
    "marketing-data-science": "Modulo 8: Marketing Data Science",
    "data-warehousing": "Modulo 9: Data Warehousing & Architecture",
    "s3-data-lake": "Modulo 10: S3 & Data Lake Architecture",
    "kafka-streaming": "Modulo 11: Kafka & Event Streaming",
    "real-time-analytics": "Modulo 12: Real-Time Analytics & ClickHouse",
    "infrastructure-ops": "Modulo 13: Infrastructure & Ops",
    "advanced-sql": "Modulo 14: Advanced SQL",
    "matematica-analisi-dati": "Modulo 15: Matematica per l'Analisi Dati",
    "analytics-engineering": "Modulo 16: Analytics Engineering",
    "significativita-statistica": "Modulo 17: Significativita' Statistica & A/B Testing",
    "direzioni-analitica": "Modulo 18: Direzioni in Analitica",
};

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

function hasListField(frontmatter: string, field: string): boolean {
    return (
        new RegExp(`^${field}:\\s*(?:\\[\\]|$)`, "m").test(frontmatter) ||
        new RegExp(`^${field}:\\s*\\n(?:\\s*-\\s*.+\\n?)*`, "m").test(frontmatter)
    );
}

describe("Course catalog governance", () => {
    const lessonFiles = walkMdxFiles(courseRoot).filter((filePath) => path.dirname(filePath) !== courseRoot);

    test.each(lessonFiles)("%s should use the canonical module label", (filePath) => {
        const folder = path.basename(path.dirname(filePath));
        const expectedModule = canonicalModules[folder];

        if (!expectedModule) {
            expect(true).toBe(true);
            return;
        }

        const raw = readFileSync(filePath, "utf8");
        const { frontmatter } = splitFrontmatter(raw);

        expect(extractField(frontmatter, "module")).toBe(expectedModule);
    });

    test.each(lessonFiles)("%s should keep the required ordered-lesson metadata", (filePath) => {
        const raw = readFileSync(filePath, "utf8");
        const { frontmatter } = splitFrontmatter(raw);

        expect(extractField(frontmatter, "duration")).not.toBe("");
        expect(extractField(frontmatter, "difficulty")).not.toBe("");
        expect(hasListField(frontmatter, "prerequisites")).toBe(true);
        expect(hasListField(frontmatter, "learningObjectives")).toBe(true);
    });

    test("learning path should reflect current module and lesson counts", () => {
        const learningPath = readFileSync(path.join(courseRoot, "learning-path.mdx"), "utf8");
        const moduleCount = Object.keys(canonicalModules).length;
        const lessonCount = lessonFiles.length;

        expect(learningPath).toContain(`${moduleCount} moduli`);
        expect(learningPath).toContain(`${lessonCount} lezioni`);
    });

    test("concept map should reflect the current module taxonomy", () => {
        const conceptMap = readFileSync(path.join(courseRoot, "panoramica", "mappe-concettuali.mdx"), "utf8");

        expect(conceptMap).toContain("18 moduli");
        expect(conceptMap.toLowerCase()).not.toContain("17 moduli");
        expect(conceptMap).toContain("Direzioni in Analitica");
    });
});
