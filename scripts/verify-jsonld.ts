import { promises as fs } from "fs";

const html = await fs.readFile("dist/blog/growth-engineering-ipotesi-buone/index.html", "utf-8");
const blocks = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g) || [];
console.log("JSON-LD blocks found:", blocks.length);

for (const block of blocks) {
    const jsonStr = block.replace(/^<script type="application\/ld\+json"[^>]*>/, "").replace(/<\/script>$/, "").trim();
    try {
        const j = JSON.parse(jsonStr);
        const types = (j["@graph"] || [j]).map((x: any) => x["@type"]);
        console.log("Block types:", types.join(", "));
        if (types.includes("Article")) {
            const art = (j["@graph"] || [j]).find((x: any) => x["@type"] === "Article");
            console.log("  dateModified:", art.dateModified);
            console.log("  inLanguage:", art.inLanguage);
        }
        if (types.includes("FAQPage")) {
            const faq = (j["@graph"] || [j]).find((x: any) => x["@type"] === "FAQPage");
            console.log("  FAQPage mainEntity:", faq.mainEntity.length);
        }
    } catch (e) {
        console.log("  (parse error)");
    }
}
