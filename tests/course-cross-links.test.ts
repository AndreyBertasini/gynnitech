import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, test } from "vitest";
import { COURSE_MODULES } from "../src/data/course-program";
import { buildCourseGraph, type CourseGraphSourceEntry } from "../src/lib/course-graph";
import { buildLessonCrossLinks, buildModuleCrossLinks } from "../src/lib/course-cross-links";

const courseRoot = path.resolve("src/content/corso");

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

function loadCourseEntries(): CourseGraphSourceEntry[] {
    return walkMdxFiles(courseRoot)
        .filter((filePath) => path.dirname(filePath) !== courseRoot)
        .map((filePath) => {
            const raw = readFileSync(filePath, "utf8");
            const parsed = matter(raw);
            const relativeId = path.relative(courseRoot, filePath).split(path.sep).join("/");

            return {
                id: relativeId,
                data: {
                    title: String(parsed.data.title || ""),
                    description: String(parsed.data.description || ""),
                    order: typeof parsed.data.order === "number" ? parsed.data.order : undefined,
                    category: typeof parsed.data.category === "string" ? parsed.data.category : undefined,
                    duration: typeof parsed.data.duration === "string" ? parsed.data.duration : undefined,
                    difficulty: typeof parsed.data.difficulty === "string" ? parsed.data.difficulty : undefined,
                    prerequisites: Array.isArray(parsed.data.prerequisites) ? parsed.data.prerequisites : [],
                },
            };
        });
}

describe("Course SEO cross-links", () => {
    const graph = buildCourseGraph(loadCourseEntries());

    test.each(graph.lessons)("lesson %s should expose cross-module recommendations", (lesson) => {
        const links = buildLessonCrossLinks(graph, lesson.id, { maxLinks: 6 });
        const hrefs = new Set(links.map((link) => link.href));
        const linkedModules = new Set(links.map((link) => link.moduleId));

        expect(links.length).toBeGreaterThanOrEqual(4);
        expect(linkedModules.size).toBeGreaterThanOrEqual(3);
        expect(hrefs.size).toBe(links.length);
        expect(links.every((link) => link.href.startsWith("/course/"))).toBe(true);
        expect(links.every((link) => link.moduleId !== lesson.moduleId)).toBe(true);
        expect(links.every((link) => link.title.trim() !== "" && link.description.trim() !== "")).toBe(true);
    });

    test.each(COURSE_MODULES)("module %s should expose related module links", (module) => {
        const links = buildModuleCrossLinks(graph, module.id, { maxLinks: 6 });
        const hrefs = new Set(links.map((link) => link.href));

        expect(links.length).toBeGreaterThanOrEqual(3);
        expect(hrefs.size).toBe(links.length);
        expect(links.every((link) => link.href.startsWith("/course/"))).toBe(true);
        expect(links.every((link) => link.href !== `/course/${module.id}/`)).toBe(true);
        expect(links.every((link) => link.title.trim() !== "" && link.description.trim() !== "")).toBe(true);
    });
});
