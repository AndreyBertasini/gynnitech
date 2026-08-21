import { promises as fs } from "fs";
import path from "path";
import { glob } from "glob";
import matter from "gray-matter";

const DATE_MODIFIED = "2026-08-21";

const FAQ_HEADING_REGEX = /^##\s+(?:Domande\s+frequenti|FAQ|Domande\s+frequenti\s+\(?)Aggiornato/i;
const FAQ_QUESTION_REGEX = /^\d+\.\s+\*\*(.+?)\*\*/m;

function extractFaqQuestions(content: string): string[] {
    const lines = content.split("\n");
    const questions: string[] = [];
    let collecting = false;
    let currentQuestion = "";

    for (const line of lines) {
        const trimmed = line.trim();
        if (FAQ_HEADING_REGEX.test(trimmed)) {
            collecting = true;
            continue;
        }
        if (collecting && trimmed.startsWith("## ")) {
            break;
        }
        if (collecting && trimmed.match(/^\d+\.\s+\*\*/)) {
            if (currentQuestion) {
                questions.push(currentQuestion);
            }
            currentQuestion = trimmed.replace(/^\d+\.\s+\*\*([^*]+)\*\**/, "$1").replace(/\*\*/g, "");
        } else if (collecting && currentQuestion && trimmed === "") {
            questions.push(currentQuestion);
            currentQuestion = "";
        } else if (collecting && currentQuestion) {
            currentQuestion += " " + trimmed.replace(/\*\*/g, "");
        }
    }
    if (currentQuestion) questions.push(currentQuestion);
    return questions;
}

async function main() {
    const blogRoot = path.join(process.cwd(), "src/content/blog");
    const files = await glob("**/*.mdx", { cwd: blogRoot, nodir: true, absolute: true });

    let modifiedCount = 0;
    let faqAdded = 0;
    let dateModifiedAdded = 0;

    for (const file of files) {
        const raw = await fs.readFile(file, "utf-8");
        const { data, content } = matter(raw);

        let newRaw = raw;
        let changed = false;

        // 1. Add dateModified if missing
        if (!data.dateModified) {
            newRaw = newRaw.replace(
                /^(---\r?\n)/m,
                `$1dateModified: '${DATE_MODIFIED}'\n`,
            );
            changed = true;
            dateModifiedAdded++;
        }

        // 2. Detect FAQ section and generate FAQPage schema
        const faqHeadingMatch = content.match(FAQ_HEADING_REGEX);
        if (faqHeadingMatch) {
            const questions = extractFaqQuestions(content);
            if (questions.length > 0) {
                const faqSchema = questions.map((q) => ({
                    question: q.trim(),
                    answer: "Consulta la risposta completa nella sezione FAQ.",
                }));

                const schemaYaml = `\nfaqSchema:\n${faqSchema.map((f) => `  - question: "${f.question.replace(/"/g, '\\"')}"\n    answer: "${f.answer.replace(/"/g, '\\"')}"`).join("\n")}`;

                if (!data.faqSchema) {
                    newRaw = newRaw.replace(
                        /^(---\n)/m,
                        `$1dateModified: '${DATE_MODIFIED}'\n`,
                    );
                    newRaw = newRaw.replace(
                        /(\n---\n?)$/m,
                        `${schemaYaml}$1`,
                    );
                    changed = true;
                    faqAdded++;
                }
            }
        }

        if (changed) {
            await fs.writeFile(file, newRaw, "utf-8");
            modifiedCount++;
            const rel = path.relative(process.cwd(), file);
            console.log(`Updated: ${rel}`);
        }
    }

    console.log(
        `\nDone. Modified ${modifiedCount} blog articles. ` +
        `Added dateModified to ${dateModifiedAdded} articles. ` +
        `Added FAQ schema to ${faqAdded} articles.`,
    );
}

main().catch(console.error);
