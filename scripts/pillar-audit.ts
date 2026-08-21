import { promises as fs } from "fs";
import matter from "gray-matter";
import path from "path";

const pillars = [
    "growth-engineering-ipotesi-buone",
    "growth-engineering-randomizzazione",
    "growth-engineering-triggering-test",
    "esperimenti-prodotti-agentici",
    "agenti-ai-non-sono-chatbot",
    "growth-engineering-agenti-workflow",
    "valutare-output-agenti-ai",
    "rag-growth-engineering-agenti-ai",
    "growth-engineering-osservabilita-prodotto",
    "growth-engineering-pipeline-dati-growth",
    "growth-engineering-dashboard-che-decidono",
    "growth-engineering-eventi-che-contano",
    "growth-engineering-scorecard",
    "growth-engineering-retrospettive",
    "growth-engineering-ruolo-ingegnere-prodotto",
    "growth-engineering-team-cross-funzionale",
    "growth-engineering-human-in-the-loop",
    "growth-engineering-fake-door-etici",
];

const FIRST_PERSON = /\b(ho|abbiamo|nel nostro|la mia|il mio|la nostra|il nostro|mi sono|ci siamo|ho visto|ho testato|ho lavorato|ho costruito|ho usato|ho applicato)\b/i;
const EXTERNAL_LINK = /\[[^\]]+\]\(https?:\/\//i;

for (const slug of pillars) {
    const raw = await fs.readFile(path.join("src/content/blog", `${slug}.mdx`), "utf-8");
    const { content } = matter(raw);
    const firstPerson = FIRST_PERSON.test(content);
    const hasLink = EXTERNAL_LINK.test(content);
    const hasFaq = content.includes("## Domande frequenti");
    const wordCount = content.split(/\s+/).length;
    console.log(`${slug}: ${wordCount}w | primaPersona=${firstPerson} | linkEsterni=${hasLink} | faq=${hasFaq}`);
}
