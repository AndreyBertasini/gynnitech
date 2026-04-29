import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { COURSE_MODULES } from "../src/data/course-program";

const courseRoot = path.resolve("src/content/corso");

const canonicalModules: Record<string, string> = Object.fromEntries(
    COURSE_MODULES.map((module, index) => [module.id, `Modulo ${index + 1}: ${module.title}`]),
);

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
    if (!match) return "";

    const value = match[1].trim();
    if (value.length >= 2 && (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'"))) {
        return value.slice(1, -1).trim();
    }

    return value;
}

function hasListField(frontmatter: string, field: string): boolean {
    return (
        new RegExp(`^${field}:\\s*(?:\\[\\]|$)`, "m").test(frontmatter) ||
        new RegExp(`^${field}:\\s*\\n(?:\\s*-\\s*.+\\n?)*`, "m").test(frontmatter)
    );
}

function hasOrder(frontmatter: string): boolean {
    return /^order:\s*\d+\s*$/m.test(frontmatter);
}

describe("Course catalog governance", () => {
    const lessonFiles = walkMdxFiles(courseRoot).filter((filePath) => path.dirname(filePath) !== courseRoot);
    const coreLessonFiles = lessonFiles.filter((filePath) => {
        const raw = readFileSync(filePath, "utf8");
        const { frontmatter } = splitFrontmatter(raw);
        return hasOrder(frontmatter);
    });

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
        const lessonCount = coreLessonFiles.length;

        expect(learningPath).toContain(`${moduleCount} moduli`);
        expect(learningPath).toContain(`${lessonCount} lezioni`);
    });

    test("concept map should reflect the current module taxonomy", () => {
        const conceptMap = readFileSync(path.join(courseRoot, "panoramica", "mappe-concettuali.mdx"), "utf8");
        const moduleCount = Object.keys(canonicalModules).length;
        const lessonCount = coreLessonFiles.length;

        expect(conceptMap).toContain(`${moduleCount} moduli`);
        expect(conceptMap).toContain(`${lessonCount} lezioni`);
        expect(conceptMap).toContain("Direzioni in Analitica");
        expect(conceptMap).toContain("Fondamenti Filosofici dell Analisi dei Dati");
    });
});
