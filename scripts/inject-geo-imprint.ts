import { promises as fs } from "fs";
import path from "path";
import { glob } from "glob";
import matter from "gray-matter";

const GEO_PATTERNS = [
    { pattern: /\b(ISTAT|Anvur|Ministero|Corte dei Conti|Banca d'Italia|AGCOM|AGCM)\b/gi, label: "contesto:Italia" },
    { pattern: /\b(italiano|italiana|italiani|italiane|in Italia|al mondo|nel mondo|globale|internazionale)\b/gi, label: "contesto:geografico" },
    { pattern: /\b(UE|Unione Europea|Europa|Europeo|Europea|Americano|Stati Uniti|Chinese|Cinese|britannico|UK|germanico|francese|spagnolo)\b/gi, label: "contesto:geografico" },
    { pattern: /\b(euro|€|eur)\b/gi, label: "contesto:valuta" },
    { pattern: /\b(McKinsey|Gartner|Forrester|IDC|Bain|Mercer|Deloitte|PwC|EY|KPMG|Harvard Business Review|MIT Sloan)\b/gi, label: "contesto:ricerca" },
    { pattern: /\b(GA4|Google Analytics|Amazon AWS|Azure|GCP|Facebook|Instagram|Meta|Apple|Netflix|Zalando|Amazon)\b/gi, label: "contesto:piattaforma" },
    { pattern: /\b(SaaS|b2b|B2B|b2c|B2C|SMB|enterprise|scaleup|startup)\b/gi, label: "contesto:modello" },
    { pattern: /\b(GDPR|CCPA|Cookie Law|normativa|regolamento)\b/gi, label: "contesto:regolatorio" },
];

function isMarkable(line: string): boolean {
    if (line.trim().startsWith("## ") || line.trim().startsWith("# ") || line.trim().startsWith("```")) return false;
    if (line.trim().startsWith("<!-- ") || line.trim().startsWith("// ") || line.trim().startsWith("| ")) return false;
    if (line.trim().startsWith("1. ") || line.trim().startsWith("2. ") || line.trim().startsWith("3. ") || line.trim().startsWith("4. ")) return false;
    if (line.includes("<!-- geo-imprint:") || line.includes("<!-- GEO:")) return false;
    if (line.trim().length < 20) return false;
    return true;
}

async function main() {
    const blogRoot = "src/content/blog";
    const files = await glob("**/*.mdx", { cwd: blogRoot, nodir: true, absolute: true });

    let totalModified = 0;

    for (const file of files) {
        const raw = await fs.readFile(file, "utf-8");
        const frontmatterEndIdx = raw.indexOf("---", 3);
        if (frontmatterEndIdx === -1) continue;
        const afterFrontmatter = raw.slice(frontmatterEndIdx + 3);

        const lines = afterFrontmatter.split(/\r?\n/);
        let newAfterFm = afterFrontmatter;
        let changed = false;
        let geoTags = new Set<string>();

        for (const line of lines) {
            const trimmed = line.trim();
            if (!isMarkable(trimmed)) continue;

            for (const { pattern, label } of GEO_PATTERNS) {
                if (pattern.test(trimmed)) {
                    geoTags.add(label);
                    pattern.lastIndex = 0;
                }
            }
        }

        if (geoTags.size > 0) {
            const geoNote = `<!-- geo-imprint: ${[...geoTags].join(", ")} -->`;
            if (!newAfterFm.includes("<!-- geo-imprint:")) {
                newAfterFm = geoNote + "\n\n" + newAfterFm;
                changed = true;
            }
        }

        if (changed) {
            const newRaw = raw.slice(0, frontmatterEndIdx + 3) + newAfterFm;
            await fs.writeFile(file, newRaw, "utf-8");
            totalModified++;
            const rel = path.relative(process.cwd(), file);
            console.log(`Updated: ${rel} (${[...geoTags].join(", ")})`);
        }
    }

    console.log(`\nDone. Added geo-imprint to ${totalModified} articles.`);
}

main().catch(console.error);
