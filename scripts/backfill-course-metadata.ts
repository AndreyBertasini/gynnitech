import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { glob } from "glob";
import { COURSE_MODULES } from "../src/data/course-modules";

const CONTENT_ROOT = path.join(process.cwd(), "src/content/corso");
const DURATION_FORMAT_REGEX = /^\d{1,3}\s*(min|minuti|h|ore)$/i;
const METADATA_KEY_ORDER = [
    "title",
    "description",
    "module",
    "order",
    "category",
    "difficulty",
    "duration",
    "prerequisites",
    "learningObjectives",
    "slug",
] as const;
const FOUNDATIONAL_PREREQUISITE = "panoramica/mappe-concettuali";

type LessonRecord = {
    file: string;
    relativePath: string;
    moduleId: string;
    slug: string;
    order: number;
    raw: string;
    content: string;
    data: Record<string, unknown>;
};

function fallbackDifficulty(moduleIndex: number): "beginner" | "intermediate" | "advanced" {
    if (moduleIndex < 5) return "beginner";
    if (moduleIndex < 10) return "intermediate";
    return "advanced";
}

function estimateDuration(content: string): string {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(8, Math.round(words / 180));
    return `${minutes} min`;
}

function sanitizeStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];

    const unique = new Set<string>();
    for (const item of value) {
        if (typeof item !== "string") continue;
        const trimmed = item.trim();
        if (trimmed === "") continue;
        unique.add(trimmed);
    }

    return Array.from(unique);
}

function objectivesFor(title: string, moduleTitle: string): string[] {
    return [
        `Comprendere i concetti chiave di "${title}".`,
        `Applicare la lezione in un caso pratico nel contesto ${moduleTitle.toLowerCase()}.`,
        "Valutare i risultati con metriche operative e criteri decisionali chiari.",
    ];
}

function orderFrontmatter(data: Record<string, unknown>): Record<string, unknown> {
    const ordered: Record<string, unknown> = {};
    const handled = new Set<string>();

    for (const key of METADATA_KEY_ORDER) {
        const value = data[key];
        if (value !== undefined) {
            ordered[key] = value;
            handled.add(key);
        }
    }

    for (const [key, value] of Object.entries(data)) {
        if (handled.has(key) || value === undefined) continue;
        ordered[key] = value;
    }

    return ordered;
}

async function loadLessons(): Promise<LessonRecord[]> {
    const files = await glob("**/*.{md,mdx}", {
        cwd: CONTENT_ROOT,
        absolute: true,
        nodir: true,
    });

    const lessons: LessonRecord[] = [];

    for (const file of files) {
        const relativePath = path.relative(CONTENT_ROOT, file).split(path.sep).join("/");
        if (!relativePath.includes("/")) continue;

        const [moduleId] = relativePath.split("/");
        const raw = await fs.readFile(file, "utf-8");
        const parsed = matter(raw);
        const slug = relativePath.replace(/\.(md|mdx)$/i, "");
        const order = typeof parsed.data.order === "number" ? parsed.data.order : Number.MAX_SAFE_INTEGER;

        lessons.push({
            file,
            relativePath,
            moduleId,
            slug,
            order,
            raw,
            content: parsed.content,
            data: parsed.data as Record<string, unknown>,
        });
    }

    return lessons;
}

async function run(): Promise<void> {
    const lessons = await loadLessons();

    const moduleIndexById = new Map<string, number>(
        COURSE_MODULES.map((module, index) => [module.id, index]),
    );
    const moduleTitleById = new Map<string, string>(
        COURSE_MODULES.map((module) => [module.id, module.title]),
    );

    const lessonsByModule = new Map<string, LessonRecord[]>();
    for (const lesson of lessons) {
        const list = lessonsByModule.get(lesson.moduleId) ?? [];
        list.push(lesson);
        lessonsByModule.set(lesson.moduleId, list);
    }

    for (const list of lessonsByModule.values()) {
        list.sort((a, b) => {
            if (a.order !== b.order) return a.order - b.order;
            return a.slug.localeCompare(b.slug);
        });
    }

    let updatedCount = 0;
    let addedDifficulty = 0;
    let addedDuration = 0;
    let addedObjectives = 0;
    let addedPrerequisites = 0;

    for (const [moduleId, moduleLessons] of lessonsByModule.entries()) {
        const moduleIndex = moduleIndexById.get(moduleId) ?? 0;
        const moduleTitle = moduleTitleById.get(moduleId) ?? moduleId;
        const difficulty = fallbackDifficulty(moduleIndex);

        for (let idx = 0; idx < moduleLessons.length; idx += 1) {
            const lesson = moduleLessons[idx];
            const data = { ...lesson.data };
            let changed = false;

            const rawDifficulty = data.difficulty;
            if (typeof rawDifficulty !== "string" || rawDifficulty.trim() === "") {
                data.difficulty = difficulty;
                addedDifficulty += 1;
                changed = true;
            }

            const rawDuration = data.duration;
            if (typeof rawDuration !== "string" || rawDuration.trim() === "") {
                data.duration = estimateDuration(lesson.content);
                addedDuration += 1;
                changed = true;
            } else {
                const normalizedDuration = rawDuration.trim().replace(/\s+/g, " ");
                if (!DURATION_FORMAT_REGEX.test(normalizedDuration)) {
                    data.duration = estimateDuration(lesson.content);
                    addedDuration += 1;
                    changed = true;
                } else if (normalizedDuration !== rawDuration) {
                    data.duration = normalizedDuration;
                    changed = true;
                }
            }

            const title = typeof data.title === "string" && data.title.trim() !== ""
                ? data.title.trim()
                : path.basename(lesson.slug);
            const objectives = sanitizeStringArray(data.learningObjectives);
            if (objectives.length < 2) {
                data.learningObjectives = objectivesFor(title, moduleTitle);
                addedObjectives += 1;
                changed = true;
            } else if (objectives.length !== (Array.isArray(data.learningObjectives) ? data.learningObjectives.length : 0)) {
                data.learningObjectives = objectives;
                changed = true;
            }

            const prerequisites = sanitizeStringArray(data.prerequisites);
            if (prerequisites.length === 0) {
                if (moduleId === "panoramica") {
                    data.prerequisites = [];
                } else {
                    const previousLesson = moduleLessons[idx - 1];
                    const fallback = previousLesson ? previousLesson.slug : FOUNDATIONAL_PREREQUISITE;
                    data.prerequisites = [fallback];
                }
                addedPrerequisites += 1;
                changed = true;
            } else if (prerequisites.length !== (Array.isArray(data.prerequisites) ? data.prerequisites.length : 0)) {
                data.prerequisites = prerequisites;
                changed = true;
            }

            if (!changed) continue;

            const orderedData = orderFrontmatter(data);
            const updatedRaw = matter.stringify(lesson.content, orderedData);

            if (updatedRaw !== lesson.raw) {
                await fs.writeFile(lesson.file, updatedRaw, "utf-8");
                updatedCount += 1;
            }
        }
    }

    console.log(`Updated lessons: ${updatedCount}`);
    console.log(`Added difficulty: ${addedDifficulty}`);
    console.log(`Added duration: ${addedDuration}`);
    console.log(`Added learningObjectives: ${addedObjectives}`);
    console.log(`Added prerequisites: ${addedPrerequisites}`);
}

run().catch((error) => {
    console.error("Failed to backfill course metadata:", error);
    process.exitCode = 1;
});
