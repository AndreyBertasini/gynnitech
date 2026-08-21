import { promises as fs } from "fs";

const samples = [
    "growth-engineering-ipotesi-buone",
    "ab-test-agenti-ai",
    "unit-economics",
    "agenti-ai-non-sono-chatbot",
    "ecommerce-analytics",
];

console.log("=== Verifica Batch 4: JSON-LD in 5 articoli campione ===\n");

for (const slug of samples) {
    const html = await fs.readFile(`dist/blog/${slug}/index.html`, "utf-8");
    const blocks = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g) || [];

    let found = false;
    for (const block of blocks) {
        const jsonStr = block.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "").trim();
        try {
            const j = JSON.parse(jsonStr);
            const graph = j["@graph"] || [j];
            const article = graph.find((x: any) => x["@type"] === "Article");
            const faq = graph.find((x: any) => x["@type"] === "FAQPage");
            if (article) {
                found = true;
                const hasDM = article.dateModified ? "✅" : "❌";
                const hasLang = article.inLanguage ? "✅" : "❌";
                const faqCount = faq ? faq.mainEntity.length : 0;
                console.log(`${slug}:`);
                console.log(`  dateModified: ${hasDM} ${article.dateModified || "missing"}`);
                console.log(`  inLanguage: ${hasLang} ${article.inLanguage || "missing"}`);
                console.log(`  FAQPage: ${faqCount > 0 ? `✅ ${faqCount} questions` : "— no FAQ"}`);
                break;
            }
        } catch {}
    }
    if (!found) console.log(`${slug}: ❌ No Article schema found`);
}
