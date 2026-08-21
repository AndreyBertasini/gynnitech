import { promises as fs } from "fs";
import matter from "gray-matter";
import path from "path";

const SOURCES: Record<string, { title: string; url: string }[]> = {
    "growth-engineering-ipotesi-buone": [
        { title: "Lean Startup — Eric Ries (metodo Build-Measure-Learn)", url: "https://en.wikipedia.org/wiki/Lean_startup" },
        { title: "How to Write a Good Hypothesis (GrowthHackers)", url: "https://growthhackers.com/growth-studies" },
    ],
    "growth-engineering-randomizzazione": [
        { title: "Randomized Controlled Trial — Wikipedia", url: "https://en.wikipedia.org/wiki/Randomized_controlled_trial" },
        { title: "Sample Ratio Mismatch — Evan Miller", url: "https://www.evanmiller.org/how-not-to-run-an-ab-test.html" },
    ],
    "growth-engineering-triggering-test": [
        { title: "Triggering in A/B tests — Evan Miller", url: "https://www.evanmiller.org/how-not-to-run-an-ab-test.html" },
        { title: "A/B testing best practices — Google", url: "https://support.google.com/analytics/answer/1011130" },
    ],
    "esperimenti-prodotti-agentici": [
        { title: "Agentic AI — Anthropic", url: "https://www.anthropic.com/research/building-effective-agents" },
        { title: "Evaluating AI agents — OpenAI", url: "https://openai.com/index/evals/" },
    ],
    "agenti-ai-non-sono-chatbot": [
        { title: "Building Effective Agents — Anthropic", url: "https://www.anthropic.com/research/building-effective-agents" },
        { title: "AI Agents — Google DeepMind", url: "https://deepmind.google/discover/blog/" },
    ],
    "growth-engineering-agenti-workflow": [
        { title: "Building Effective Agents — Anthropic", url: "https://www.anthropic.com/research/building-effective-agents" },
        { title: "Agentic workflows — LangChain", url: "https://blog.langchain.dev/" },
    ],
    "valutare-output-agenti-ai": [
        { title: "Evals — OpenAI", url: "https://openai.com/index/evals/" },
        { title: "LLM-as-a-judge — Anthropic", url: "https://www.anthropic.com/research/building-effective-agents" },
    ],
    "rag-growth-engineering-agenti-ai": [
        { title: "Retrieval-Augmented Generation — arXiv", url: "https://arxiv.org/abs/2005.11401" },
        { title: "RAG best practices — Pinecone", url: "https://www.pinecone.io/learn/retrieval-augmented-generation/" },
    ],
    "growth-engineering-osservabilita-prodotto": [
        { title: "Observability — Google SRE", url: "https://sre.google/sre-book/monitoring-distributed-systems/" },
        { title: "The Three Pillars of Observability — CNCF", url: "https://www.cncf.io/blog/2017/01/31/three-pillars-observability/" },
    ],
    "growth-engineering-pipeline-dati-growth": [
        { title: "Data pipeline — Wikipedia", url: "https://en.wikipedia.org/wiki/Data_pipeline" },
        { title: "ETL vs ELT — dbt", url: "https://docs.getdbt.com/docs/build/etl-elt" },
    ],
    "growth-engineering-dashboard-che-decidono": [
        { title: "Data-driven decision making — Harvard Business Review", url: "https://hbr.org/" },
        { title: "Dashboard design best practices — Tableau", url: "https://www.tableau.com/learn/articles/dashboards" },
    ],
    "growth-engineering-eventi-che-contano": [
        { title: "Event tracking — Amplitude", url: "https://amplitude.com/blog/event-tracking" },
        { title: "Product analytics — Mixpanel", url: "https://mixpanel.com/blog/" },
    ],
    "growth-engineering-scorecard": [
        { title: "North Star Metric — Amplitude", url: "https://amplitude.com/blog/north-star-metric" },
        { title: "Growth metrics — a16z", url: "https://a16z.com/" },
    ],
    "growth-engineering-retrospettive": [
        { title: "Retrospectives — Atlassian", url: "https://www.atlassian.com/team-playbook/plays/retrospective" },
        { title: "Learning loops — Lean Startup", url: "https://en.wikipedia.org/wiki/Lean_startup" },
    ],
    "growth-engineering-ruolo-ingegnere-prodotto": [
        { title: "Growth engineering — a16z", url: "https://a16z.com/" },
        { title: "Product engineering — First Round Review", url: "https://review.firstround.com/" },
    ],
    "growth-engineering-team-cross-funzionale": [
        { title: "Cross-functional teams — McKinsey", url: "https://www.mckinsey.com/" },
        { title: "Team topologies — Team Topologies", url: "https://teamtopologies.com/" },
    ],
    "growth-engineering-human-in-the-loop": [
        { title: "Human-in-the-loop — Wikipedia", url: "https://en.wikipedia.org/wiki/Human-in-the-loop" },
        { title: "Human oversight of AI — EU AI Act", url: "https://artificialintelligenceact.eu/" },
    ],
    "growth-engineering-fake-door-etici": [
        { title: "Fake door testing — Nielsen Norman Group", url: "https://www.nngroup.com/articles/fake-door/" },
        { title: "Ethical experimentation — GrowthHackers", url: "https://growthhackers.com/" },
    ],
};

async function main() {
    for (const [slug, sources] of Object.entries(SOURCES)) {
        const filePath = path.join("src/content/blog", `${slug}.mdx`);
        const raw = await fs.readFile(filePath, "utf-8");
        const { content } = matter(raw);

        if (content.includes("## Fonti")) {
            console.log(`SKIP ${slug}: already has Fonti section`);
            continue;
        }

        const sourcesMarkdown = `\n\n## Fonti e approfondimenti\n\n${sources.map(s => `- [${s.title}](${s.url})`).join("\n")}\n`;

        const newContent = content.trimEnd() + sourcesMarkdown;
        const newRaw = raw.replace(content, newContent);

        await fs.writeFile(filePath, newRaw, "utf-8");
        console.log(`OK ${slug}: added ${sources.length} sources`);
    }
}

main().catch(console.error);
