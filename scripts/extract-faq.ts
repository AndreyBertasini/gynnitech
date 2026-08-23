import { promises as fs } from "fs";
import { glob } from "glob";

async function main() {
    const files = await glob("src/content/blog/*.mdx");
    const out: Record<string, { question: string; answer: string }[]> = {};

    for (const file of files) {
        const raw = await fs.readFile(file, "utf-8");
        if (!raw.includes("faqSchema:")) continue;

        const slug = file.replace(/^src\/content\/blog\//, "").replace(/\.mdx$/, "");
        const lines = raw.split("\n");

        // Find faqSchema block: from "faqSchema:" line until the closing "---"
        const startIdx = lines.findIndex((l) => l.trim() === "faqSchema:");
        if (startIdx === -1) continue;

        const faqs: { question: string; answer: string }[] = [];
        let current: { question: string; answer: string } | null = null;

        for (let i = startIdx + 1; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            if (trimmed === "---") break; // end of frontmatter

            const qMatch = trimmed.match(/^-\s*question:\s*"?(.*?)"?$/);
            const aMatch = trimmed.match(/^answer:\s*"?(.*?)"?$/);

            if (qMatch) {
                if (current) faqs.push(current);
                current = { question: qMatch[1], answer: "" };
            } else if (aMatch && current) {
                current.answer = aMatch[1];
            }
        }
        if (current) faqs.push(current);

        out[slug] = faqs;
    }

    await fs.writeFile("_reports/faq-it.json", JSON.stringify(out, null, 2), "utf-8");
    const total = Object.values(out).reduce((acc, f) => acc + f.length, 0);
    console.log(`Extracted ${Object.keys(out).length} articles, ${total} FAQs`);
}

main().catch(console.error);
