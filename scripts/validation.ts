import { promises as fs } from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { glob } from "glob";
import matter from "gray-matter";
import { COURSE_MODULES, COURSE_PHASES, COURSE_TRACKS } from "../src/data/course-program";

const CONTENT_ROOT = path.join(process.cwd(), "src/content");
const PUBLIC_ROOT = path.join(process.cwd(), "public");
const FRONTMATTER_REQUIRED_FIELDS: Record<"blog" | "corso", string[]> = {
    blog: ["title", "description", "date", "category"],
    corso: ["title", "description"],
};
const MIN_CORSO_BODY_CHARACTERS = 1200;
const MIN_CORSO_H2_HEADINGS = 3;
const MIN_CORSO_INTRO_CHARACTERS = 120;
const SUMMARY_SECTION_REGEX = /(^##\s+(?:\d+\.\s*)?(Riepilogo|Riepilogo operativo|Conclusioni|Sintesi)\b)/mi;
const EXAMPLE_SIGNAL_REGEX = /```|\|[-]+\||\bEsempio\b|\bCaso pratico\b|\bTemplate\b/mi;
const DURATION_FORMAT_REGEX = /^\d{1,3}\s*(min|minuti|h|ore)$/i;
const ALLOWED_DIFFICULTY_VALUES = new Set(["beginner", "intermediate", "advanced", "base", "intermedio", "avanzato"]);
// Pipeline generator → critic → gate (Hermes → Argo → Giano): rubrica a 6 regole.
const BINARIO_VALUES = new Set(["ml-tabellare", "sistemi-llm"]);
const PIPELINE_TECHNIQUE_PATTERNS: RegExp[] = [/CauCoT/, /\bToT\b/, /Structural CoT/i, /Chain of Thought/i];
const PIPELINE_CUSHION_PATTERNS: RegExp[] = [/non sono un esperto/i, /potrei sbagliarmi/i, /in generale si può dire/i];
const PIPELINE_VERIFIABLE_UNIT = /(utenti|ordini|sessioni|eventi|query|tabelle|euro|€|milion|miliard|punt|tasso|coort|mese|mesi|giorn|settiman|ann[oi]|client|fatturato|conversion|retention|churn|modell|test|esperiment|dashboard|campagn|budget|ricavi|costi|spesa|roas|cac|ltv|nps|click|visite|lead|acquisti|vendite|righe|riga|record|celle|campione|interviste|pipeline|report|metriche|kpi)/i;
const REMOTE_IMAGE_REGEX = /^https?:\/\//i;

/**
 * Validates that a relative path resolves to a location within the base directory.
 * @param baseDir The trusted base directory.
 * @param relativePath The untrusted relative path segment.
 * @returns The resolved absolute path if valid.
 * @throws Error if the path attempts to traverse outside the base directory.
 */
export function validatePath(baseDir: string, relativePath: string): string {
    const resolvedBase = path.resolve(baseDir);
    const resolvedPath = path.resolve(baseDir, relativePath);

    if (!resolvedPath.startsWith(resolvedBase + path.sep)) {
        throw new Error(`Invalid path: ${relativePath} resolves to ${resolvedPath}, which is outside of ${resolvedBase}`);
    }

    return resolvedPath;
}

type ValidationMessage = {
    file: string;
    field: string;
    message: string;
};

type ValidationResult = {
    errors: ValidationMessage[];
    warnings: ValidationMessage[];
};

function buildMessage(file: string, field: string, message: string): ValidationMessage {
    return {
        file: path.relative(process.cwd(), file),
        field,
        message,
    };
}

function toSlug(relativeFilePath: string, frontmatterSlug: unknown): string {
    if (typeof frontmatterSlug === "string" && frontmatterSlug.trim() !== "") {
        return frontmatterSlug.trim();
    }

    const withoutExtension = relativeFilePath.slice(0, -path.extname(relativeFilePath).length);
    return withoutExtension.split(path.sep).join("/");
}

function isValidSlug(slug: string): boolean {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/.test(slug);
}

function pushEditorialIssue(result: ValidationResult, file: string, field: string, message: string): void {
    const built = buildMessage(file, field, message);

    if (process.env.STRICT_EDITORIAL === "1") {
        result.errors.push(built);
        return;
    }

    result.warnings.push(built);
}

function extractH2Titles(markdownBody: string): string[] {
    const titles: string[] = [];
    for (const match of markdownBody.matchAll(/^##\s+(.+?)\s*$/gm)) {
        titles.push(match[1].trim());
    }
    return titles;
}

function extractH2Section(markdownBody: string, heading: string): string {
    const want = heading.trim().toLowerCase();
    const lines = markdownBody.split("\n");
    let start = -1;
    let end = lines.length;
    for (let i = 0; i < lines.length; i += 1) {
        const match = lines[i].match(/^##\s+(.+?)\s*$/);
        if (!match) continue;
        if (start === -1 && (match[1] ?? "").trim().toLowerCase() === want) {
            start = i + 1;
        } else if (start !== -1) {
            end = i;
            break;
        }
    }
    if (start === -1) return "";
    return lines.slice(start, end).join("\n").trim();
}

function countSentences(text: string): number {
    const sentences = text.replace(/\s+/g, " ").trim().split(/[.!?…]+/).map((s) => s.trim()).filter((s) => s.length > 0);
    return sentences.length;
}

function countNumberedQuestions(sectionText: string): number {
    const matches = sectionText.match(/^\s*\d+[.)]\s+.+\?\s*$/gm);
    return matches ? matches.length : 0;
}

export type PipelineRuleResult = { regola: string; esito: "PASS" | "FAIL"; nota: string };

/**
 * Argo in forma pura: applica la rubrica a 6 regole a un singolo testo.
 * Le regole 1, 2 e 5 verificano i CONCETTI (definizione, passi, esempio,
 * autoverifica) con titoli liberi e naturali: nessuna intestazione fissa.
 * Usata sia da validate:content sia dalla pipeline batch (single source of truth).
 */
export function checkLessonPipeline(body: string, frontmatterBinario: unknown, formato?: unknown): PipelineRuleResult[] {
    const tre = formato === "3s";
    const articolo = formato === "articolo";
    const results: PipelineRuleResult[] = [];
    const h2Titles = extractH2Titles(body);
    const lowerTitles = h2Titles.map((t) => t.toLowerCase());
    const sections = h2Titles.map((title, i) => ({
        title,
        text: extractH2Section(body, title),
    }));

    // Regola 1 — concetto/calcolo separati (titoli liberi).
    // Una sezione definisce il concetto (senza formule, poche frasi);
    // un'altra è un passo-passo.
    const definitionSection = sections.find(
        (s) => s.text.length > 0 && countSentences(s.text) <= 4 && !/\$|\\\(|\\\[|\\frac|\\log|\\sum/.test(s.text),
    );
    const stepsSection = sections.find((s) => /^\s*(1[.)]|[-*]\s+)/m.test(s.text));
    // Formato 3s: il concetto sta nelle figure (<Slide>), il passo-passo negli schemi (<Schema>).
    // Formato articolo: il principio è la riga in grassetto, il passo-passo l'elenco numerato dei criteri.
    const regola1 = tre
        ? /<Slide\b/.test(body) && /<Schema\b/.test(body)
        : articolo
            ? /^\*\*[^*\n]+\*\*\s*$/m.test(body.replace(/`[^`\n]*`/g, "x")) && /^\s*1[.)]\s/m.test(body)
            : Boolean(definitionSection && stepsSection && definitionSection.title !== stepsSection.title);
    if (regola1) {
        results.push({ regola: "regola_1_concetto_calcolo", esito: "PASS", nota: "" });
    } else {
        results.push({
            regola: "regola_1_concetto_calcolo",
            esito: "FAIL",
            nota: "servono due sezioni distinte: una che definisce il concetto (senza formule) e una passo-passo",
        });
    }

    // Regola 2 — autoverifica in chiusura (titolo libero).
    const lastSection = sections.length > 0 ? sections[sections.length - 1] : undefined;
    const questionCount = lastSection ? countNumberedQuestions(lastSection.text) : 0;
    // Formato 3s: l'autoverifica finale è il QuizExercise del Riepilogo.
    const quizCount = lastSection && /<QuizExercise\b/.test(lastSection.text) ? (lastSection.text.match(/\bcorrectIndex\s*:/g) ?? []).length : 0;
    const regola2 = tre ? quizCount >= 3 && quizCount <= 5 : Boolean(lastSection && questionCount >= 3 && questionCount <= 5);
    if (regola2) {
        results.push({ regola: "regola_2_retrieval_attivo", esito: "PASS", nota: "" });
    } else {
        results.push({
            regola: "regola_2_retrieval_attivo",
            esito: "FAIL",
            nota: `l'ultima sezione deve contenere 3-5 domande di autoverifica numerate (trovate: ${questionCount})`,
        });
    }

    // Regola 3 — binario dichiarato.
    if (typeof frontmatterBinario !== "string" || !BINARIO_VALUES.has(frontmatterBinario.trim())) {
        results.push({ regola: "regola_3_binario_dichiarato", esito: "FAIL", nota: "campo 'binario' mancante o invalido (ammessi: ml-tabellare, sistemi-llm)" });
    } else {
        results.push({ regola: "regola_3_binario_dichiarato", esito: "PASS", nota: "" });
    }

    // Regola 4 — profondità proporzionale, nessuna tecnica citata.
    const citedTechnique = PIPELINE_TECHNIQUE_PATTERNS.some((pattern) => pattern.test(body));
    if (citedTechnique) {
        results.push({ regola: "regola_4_profondita_proporzionale", esito: "FAIL", nota: "il testo cita una tecnica di ragionamento (vietato: CauCoT, ToT, Structural CoT, Chain of Thought)" });
    } else {
        results.push({ regola: "regola_4_profondita_proporzionale", esito: "PASS", nota: "" });
    }

    // Regola 5 — esempio verificabile (titolo libero).
    const exampleSection = sections.find((s) => {
        const hasYearOrPercent = /(\b(1[0-9]|20)\d{2}\b|\d+\s?%)/.test(s.text);
        const hasNumber = /\d[\d.,]*/.test(s.text);
        const hasProperNoun = /[A-ZÀ-Þ][a-zà-ÿ']{2,}/.test(s.text);
        const hasUnit = PIPELINE_VERIFIABLE_UNIT.test(s.text);
        return hasProperNoun && (hasYearOrPercent || (hasNumber && hasUnit));
    });
    if (exampleSection) {
        results.push({ regola: "regola_5_esempio_verificabile", esito: "PASS", nota: "" });
    } else {
        results.push({
            regola: "regola_5_esempio_verificabile",
            esito: "FAIL",
            nota: "manca una sezione con un esempio concreto e verificabile (nome + data/fonte/numero)",
        });
    }

    // Regola 6 — diretto, senza disclaimer.
    const cushionFound = PIPELINE_CUSHION_PATTERNS.some((pattern) => pattern.test(body));
    if (cushionFound) {
        results.push({ regola: "regola_6_diretto_no_disclaimer", esito: "FAIL", nota: "il testo contiene frasi cuscinetto vietate" });
    } else {
        results.push({ regola: "regola_6_diretto_no_disclaimer", esito: "PASS", nota: "" });
    }

    return results;
}

/**
 * Argo — applica meccanicamente la rubrica a 6 regole della pipeline.
 * Ogni regola è PASS/FAIL; il verdetto è PASS solo se tutte sono PASS.
 */
function validatePipelineRubric(result: ValidationResult, file: string, body: string, frontmatterBinario: unknown, formato: unknown): void {
    for (const rule of checkLessonPipeline(body, frontmatterBinario, formato)) {
        if (rule.esito === "FAIL") {
            result.errors.push(buildMessage(file, `pipeline-${rule.regola}`, rule.nota));
        }
    }
}

async function validateCollection(collection: "blog" | "corso"): Promise<ValidationResult> {
    const collectionRoot = validatePath(CONTENT_ROOT, collection);
    const files = await glob("**/*.mdx", { cwd: collectionRoot, nodir: true, absolute: true });

    const result: ValidationResult = {
        errors: [],
        warnings: [],
    };
    const slugToFile = new Map<string, string>();
    const pendingPrerequisiteChecks: Array<{ file: string; prerequisite: string }> = [];
    const orderTracker = new Map<string, Map<number, string[]>>();
    const coreLessonsByModule = new Map<string, number>();
    let totalCoreLessons = 0;

    for (const file of files) {
        const raw = await fs.readFile(file, "utf-8");
        const { data, content } = matter(raw);

        for (const requiredField of FRONTMATTER_REQUIRED_FIELDS[collection]) {
            if (data[requiredField] === undefined || data[requiredField] === null || String(data[requiredField]).trim() === "") {
                result.errors.push(buildMessage(file, requiredField, "missing required field"));
            }
        }

        const relativePath = path.relative(collectionRoot, file);
        const slug = toSlug(relativePath, data.slug);

        if (!isValidSlug(slug)) {
            result.errors.push(buildMessage(file, "slug", `invalid slug "${slug}" (expected kebab-case)`));
        }

        const existing = slugToFile.get(slug);
        if (existing) {
            result.errors.push(
                buildMessage(file, "slug", `duplicate slug "${slug}" already used in ${path.relative(process.cwd(), existing)}`),
            );
        } else {
            slugToFile.set(slug, file);
        }

        if (collection !== "corso") {
            continue;
        }

        const isLessonFile = path.dirname(relativePath) !== ".";
        const rawOrder = data.order;
        const moduleFolder = path.dirname(relativePath).split(path.sep)[0];
        const isCoreLesson = isLessonFile && rawOrder !== undefined;

        if (rawOrder !== undefined && (typeof rawOrder !== "number" || !Number.isInteger(rawOrder))) {
            result.errors.push(buildMessage(file, "order", `order must be an integer number (received: ${JSON.stringify(rawOrder)})`));
        }

        if (isCoreLesson && typeof rawOrder === "number" && Number.isInteger(rawOrder)) {
            const moduleOrders = orderTracker.get(moduleFolder) ?? new Map<number, string[]>();
            const sameOrder = moduleOrders.get(rawOrder) ?? [];
            sameOrder.push(file);
            moduleOrders.set(rawOrder, sameOrder);
            orderTracker.set(moduleFolder, moduleOrders);
            totalCoreLessons += 1;
            coreLessonsByModule.set(moduleFolder, (coreLessonsByModule.get(moduleFolder) || 0) + 1);
        }

        if (isLessonFile) {
            const rawModule = data.module;
            if (rawModule === undefined || rawModule === null || String(rawModule).trim() === "") {
                result.errors.push(buildMessage(file, "module", "missing required field"));
            }
        }

        if (isLessonFile && (data.category === undefined || data.category === null || String(data.category).trim() === "")) {
            pushEditorialIssue(
                result,
                file,
                "editorial",
                "missing category in frontmatter; add one to improve grouping and navigation",
            );
        }

        const rawPrerequisites = data.prerequisites;
        if (isLessonFile && rawPrerequisites === undefined) {
            result.errors.push(buildMessage(file, "prerequisites", "missing required field"));
        } else if (rawPrerequisites !== undefined) {
            if (!Array.isArray(rawPrerequisites)) {
                result.errors.push(buildMessage(file, "prerequisites", "prerequisites must be an array of lesson slugs"));
            } else {
                for (const prerequisite of rawPrerequisites) {
                    if (typeof prerequisite !== "string" || prerequisite.trim() === "") {
                        result.errors.push(
                            buildMessage(file, "prerequisites", `invalid prerequisite entry ${JSON.stringify(prerequisite)}`),
                        );
                        continue;
                    }

                    pendingPrerequisiteChecks.push({
                        file,
                        prerequisite: prerequisite.trim(),
                    });
                }
            }
        }

        const rawDuration = data.duration;
        if (isLessonFile && rawDuration === undefined) {
            result.errors.push(buildMessage(file, "duration", "missing required field"));
        } else if (rawDuration !== undefined && (typeof rawDuration !== "string" || !DURATION_FORMAT_REGEX.test(rawDuration.trim()))) {
            pushEditorialIssue(
                result,
                file,
                "editorial",
                `duration should follow a readable format like "35 min" or "2 h" (received: ${JSON.stringify(rawDuration)})`,
            );
        }

        const rawDifficulty = data.difficulty;
        if (isLessonFile && rawDifficulty === undefined) {
            result.errors.push(buildMessage(file, "difficulty", "missing required field"));
        } else if (
            rawDifficulty !== undefined
            && (typeof rawDifficulty !== "string" || !ALLOWED_DIFFICULTY_VALUES.has(rawDifficulty.trim().toLowerCase()))
        ) {
            result.errors.push(
                buildMessage(
                    file,
                    "difficulty",
                    `difficulty must be one of: ${Array.from(ALLOWED_DIFFICULTY_VALUES).join(", ")}`,
                ),
            );
        }

        const rawObjectives = data.learningObjectives;
        if (isLessonFile && rawObjectives === undefined) {
            result.errors.push(buildMessage(file, "learningObjectives", "missing required field"));
        } else if (rawObjectives !== undefined) {
            if (!Array.isArray(rawObjectives)) {
                result.errors.push(buildMessage(file, "learningObjectives", "learningObjectives must be an array of strings"));
            } else {
                const invalidObjective = rawObjectives.find((objective) => typeof objective !== "string" || objective.trim() === "");
                if (invalidObjective !== undefined) {
                    result.errors.push(
                        buildMessage(file, "learningObjectives", `invalid learning objective ${JSON.stringify(invalidObjective)}`),
                    );
                }

                if (rawObjectives.length > 0 && rawObjectives.length < 2) {
                    pushEditorialIssue(
                        result,
                        file,
                        "editorial",
                        "learningObjectives should contain at least 2 items for clearer outcomes",
                    );
                }
            }
        }

        const rawHeaderImage = data.headerImage;
        if (isLessonFile && rawHeaderImage !== undefined) {
            if (typeof rawHeaderImage !== "string" || rawHeaderImage.trim() === "") {
                result.errors.push(buildMessage(file, "headerImage", "headerImage must be a non-empty string when present"));
            } else {
                const headerImage = rawHeaderImage.trim();
                if (headerImage.startsWith("/")) {
                    const publicImagePath = validatePath(PUBLIC_ROOT, headerImage.replace(/^\/+/, ""));
                    try {
                        await fs.access(publicImagePath);
                    } catch {
                        result.errors.push(
                            buildMessage(file, "headerImage", `referenced public image does not exist: ${headerImage}`),
                        );
                    }
                } else if (!REMOTE_IMAGE_REGEX.test(headerImage)) {
                    pushEditorialIssue(
                        result,
                        file,
                        "headerImage",
                        `headerImage should be an absolute public path or remote URL (received: ${JSON.stringify(headerImage)})`,
                    );
                }

                const rawHeaderImageAlt = data.headerImageAlt;
                if (typeof rawHeaderImageAlt !== "string" || rawHeaderImageAlt.trim() === "") {
                    result.errors.push(buildMessage(file, "headerImageAlt", "missing alt text for headerImage"));
                } else if (rawHeaderImageAlt.trim().length < 20) {
                    pushEditorialIssue(result, file, "headerImageAlt", "header image alt text is very short");
                }
            }
        }

        if (isLessonFile) {
            validatePipelineRubric(result, file, content, data.binario, data.formato);
            // Gate di Giano: si pubblica solo con draft booleano esplicito (false = pubblicato).
            if (typeof data.draft !== "boolean") {
                result.errors.push(
                    buildMessage(file, "draft", "campo 'draft' mancante o non booleano: Giano pubblica solo con draft:false esplicito"),
                );
            }
            // Anti-regressione: i template editoriali non devono ricomparire.
            const rawDescription = String(data.description ?? "");
            if (/Lezione (core|narrativa) del modulo/i.test(rawDescription)) {
                pushEditorialIssue(result, file, "editorial", "description con boilerplate 'Lezione core/narrativa del modulo': scrivi una description specifica");
            }
            const genericObjectives = Array.isArray(data.learningObjectives)
                ? data.learningObjectives.filter((o) => typeof o === "string" && /Comprendere il problema analitico e il contesto decisionale|Applicare esempi, metriche e controlli a casi reali/.test(o))
                : [];
            if (genericObjectives.length > 0) {
                pushEditorialIssue(result, file, "editorial", "learningObjectives generici da template: scrivi obiettivi specifici per la lezione");
            }
            const firstParagraph = content.replace(/^\s*import[\s\S]*?\n\n/, "").replace(/^#.*?\n\n/, "").split(/\n\s*\n/)[0] ?? "";
            if (/^Questa lezione appartiene/i.test(firstParagraph.trim())) {
                pushEditorialIssue(result, file, "editorial", "apertura con template 'Questa lezione appartiene al binario': scrivi un incipit naturale");
            }
        }

        if (!isLessonFile) {
            continue;
        }

        const trimmedContent = content.trim();
        const h2Count = (trimmedContent.match(/^##\s+/gm) || []).length;
        const firstH2Index = trimmedContent.search(/^##\s+/m);
        const intro = (firstH2Index === -1 ? trimmedContent : trimmedContent.slice(0, firstH2Index)).trim();
        const hasSummarySection = SUMMARY_SECTION_REGEX.test(trimmedContent);
        const hasExampleSignal = EXAMPLE_SIGNAL_REGEX.test(trimmedContent);

        if (trimmedContent.length < MIN_CORSO_BODY_CHARACTERS) {
            result.errors.push(
                buildMessage(
                    file,
                    "content",
                    `lesson body must contain at least ${MIN_CORSO_BODY_CHARACTERS} characters (received: ${trimmedContent.length})`,
                ),
            );
        }

        if (h2Count < MIN_CORSO_H2_HEADINGS) {
            result.errors.push(
                buildMessage(
                    file,
                    "content",
                    `lesson should include at least ${MIN_CORSO_H2_HEADINGS} level-2 headings for basic structure (received: ${h2Count})`,
                ),
            );
        }

        if (intro.length < MIN_CORSO_INTRO_CHARACTERS) {
            pushEditorialIssue(
                result,
                file,
                "editorial",
                `intro before the first section is short (${intro.length} chars); expand the opening to improve clarity`,
            );
        }

        // Il formato articolo vieta il riassunto finale: l'avviso non si applica.
        if (!hasSummarySection && data.formato !== "articolo") {
            pushEditorialIssue(
                result,
                file,
                "editorial",
                "missing a final summary section such as 'Riepilogo' or 'Conclusioni'",
            );
        }

        if (!hasExampleSignal) {
            pushEditorialIssue(
                result,
                file,
                "editorial",
                "missing concrete example signals (code block, table, 'Esempio', 'Caso pratico' or 'Template')",
            );
        }
    }

    if (collection === "corso") {
        for (const check of pendingPrerequisiteChecks) {
            if (!slugToFile.has(check.prerequisite)) {
                result.errors.push(
                    buildMessage(
                        check.file,
                        "prerequisites",
                        `unknown prerequisite slug "${check.prerequisite}"`,
                    ),
                );
            }
        }

        for (const [moduleFolder, moduleOrders] of orderTracker.entries()) {
            for (const [order, filesForOrder] of moduleOrders.entries()) {
                if (filesForOrder.length > 1) {
                    const relativeFiles = filesForOrder.map((targetFile) => path.relative(process.cwd(), targetFile));
                    result.errors.push(
                        buildMessage(
                            filesForOrder[0],
                            "order",
                            `duplicate order ${order} in module "${moduleFolder}": ${relativeFiles.join(", ")}`,
                        ),
                    );
                }
            }
        }

        const expectedCoreLessonCount = COURSE_MODULES.reduce((sum, module) => sum + module.coreLessons.length, 0);
        if (COURSE_MODULES.length !== 21) {
            result.errors.push(buildMessage(path.join(process.cwd(), "src/data/course-program.ts"), "course-program", "expected exactly 21 modules"));
        }
        if (COURSE_PHASES.length !== 5) {
            result.errors.push(buildMessage(path.join(process.cwd(), "src/data/course-program.ts"), "course-program", "expected exactly 5 phases"));
        }
        if (COURSE_TRACKS.length !== 3) {
            result.errors.push(buildMessage(path.join(process.cwd(), "src/data/course-program.ts"), "course-program", "expected exactly 3 final tracks"));
        }
        if (expectedCoreLessonCount !== 236) {
            result.errors.push(buildMessage(path.join(process.cwd(), "src/data/course-program.ts"), "course-program", `expected V2 blueprint to define 236 core lessons (received: ${expectedCoreLessonCount})`));
        }
        if (totalCoreLessons !== expectedCoreLessonCount) {
            pushEditorialIssue(result, path.join(process.cwd(), "src/content/corso"), "core-lessons", `expected ${expectedCoreLessonCount} ordered core lessons, found ${totalCoreLessons}`);
        }

        for (const module of COURSE_MODULES) {
            const counted = coreLessonsByModule.get(module.id) || 0;
            if (counted !== module.coreLessons.length) {
                pushEditorialIssue(
                    result,
                    path.join(process.cwd(), "src/content/corso", module.id),
                    "core-lessons",
                    `expected ${module.coreLessons.length} core lessons for module "${module.id}", found ${counted}`,
                );
            }

            if (!module.objective || module.prerequisites.length === 0 && module.id !== "panoramica") {
                result.errors.push(
                    buildMessage(
                        path.join(process.cwd(), "src/data/course-program.ts"),
                        "course-program",
                        `module "${module.id}" is missing objective or prerequisites`,
                    ),
                );
            }
        }
    }

    return result;
}

export async function validateContent(): Promise<ValidationResult> {
    const blogResult = await validateCollection("blog");
    const corsoResult = await validateCollection("corso");

    return {
        errors: [...blogResult.errors, ...corsoResult.errors],
        warnings: [...blogResult.warnings, ...corsoResult.warnings],
    };
}

async function runValidationCli(): Promise<void> {
    const { errors, warnings } = await validateContent();

    if (errors.length === 0) {
        const strictLabel = process.env.STRICT_EDITORIAL === "1" ? " (strict editorial mode)" : "";
        console.log(`Content validation passed${strictLabel}.`);

        if (warnings.length > 0) {
            console.warn(`Editorial warnings: ${warnings.length}`);
            for (const warning of warnings) {
                console.warn(`- ${warning.file} -> ${warning.field}: ${warning.message}`);
            }
        }

        return;
    }

    console.error(`Content validation failed with ${errors.length} error(s):`);
    for (const error of errors) {
        console.error(`- ${error.file} -> ${error.field}: ${error.message}`);
    }

    if (warnings.length > 0) {
        console.warn(`Editorial warnings: ${warnings.length}`);
        for (const warning of warnings) {
            console.warn(`- ${warning.file} -> ${warning.field}: ${warning.message}`);
        }
    }

    process.exitCode = 1;
}

const entryScriptUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";

if (import.meta.url === entryScriptUrl) {
    runValidationCli().catch((error) => {
        console.error("Unexpected validation error:", error);
        process.exit(1);
    });
}
