import { promises as fs } from "fs";
import path from "path";
import { glob } from "glob";
import matter from "gray-matter";

const CLAIM_PATTERNS = [
    /\b\d+%\b/i,
    /\b\d+\s+volte\b/i,
    /\b(nel|nel[l'])\s+\d{4}\b/i,
    /\bmaggior\s+parte\b/i,
    /\btop\s+\d+\b/i,
    /\b(share|quota)\s+di\s+mercato\b/i,
    /\bmarket\s+size\b/i,
    /\bTAM\b|\bSAM\b|\bSOM\b/i,
    /\bLTV\b.*\bCAC\b|\bCAC\b.*\bLTV\b/i,
    /\bARR\b|\bMRR\b/i,
    /\b(miliard|miliardi)\b/i,
    /\bcresce|crescita\s+del\s+\d+%|cala\s+del\s+\d+%|aumento\s+del\s+\d+%/i,
    /\b(percentuale|tasso|rapporto)\s+(di|del|tra)\b/i,
    /\b(ha|avere|ha\s+avuto)\s+(un|a|di)\s+\d+%\b/i,
    /\b(superiore|inferiore|pari)\s+(al|alla|a|di|del)\s+\d+%\b/i,
    /\bprim[ao|e|i]\s+(al mondo|in Italia|in Europa)\b/i,
    /\b(negli|nei|dagli|dai)\s+\d+\s+anni?\b/i,
    /\bclassifica\b.*\b\d+\b/,
    /\bcentesimi\s+di\s+miliardo\b/i,
    /\bwearable\b.*\b\d+%/i,
    /\bnegozi\s+fisici\b.*\bdati\b/i,
    /\b(dati|ufficio|stime)\s+(ISTAT|OECD|ISTAT|Eurostat|McKinsey|Gartner|Forrester|IDC|Bain|Mercer)/i,
    /\bspesa\s+pubblicitaria\b.*\b\euro\b/i,
    /\b\d+\s+(euro|EUR|€)\b/i,
    /\bnumero\s+di\s+\w+\s+in\s+italia\b/i,
    /\bfacebook\b.*\b\d+%|instagram\b.*\b\d+%/i,
    /\bgoogle\b.*\b\d+%|amazon\b.*\b\d+%/i,
];

function isClaimLine(line: string): boolean {
    if (line.trim().startsWith("## ") || line.trim().startsWith("# ") || line.trim().startsWith("```")) return false;
    if (line.trim().startsWith("<!-- ") || line.trim().startsWith("// ") || line.trim().startsWith("* ") || line.trim().startsWith("- ")) return false;
    if (line.trim().startsWith("![") || line.trim().startsWith("1. ") || line.trim().startsWith("2. ") || line.trim().startsWith("3. ") || line.trim().startsWith("4. ") || line.trim().startsWith("5. ")) return false;
    if (line.trim().startsWith("> ")) return false;
    if (line.includes("<!-- GEO:") || line.includes("[fonte:") || line.includes("(fonte:")) return false;
    if (line.trim().length < 30) return false;

    for (const pattern of CLAIM_PATTERNS) {
        if (pattern.test(line)) return true;
    }
    return false;
}

async function main() {
    const blogRoot = "src/content/blog";
    const files = await glob("**/*.mdx", { cwd: blogRoot, nodir: true, absolute: true });

    let totalModified = 0;
    let totalMarkersAdded = 0;

    for (const file of files) {
        const raw = await fs.readFile(file, "utf-8");
        const { content } = matter(raw);

        const frontmatterEndIdx = raw.indexOf("---", 3);
        if (frontmatterEndIdx === -1) continue;
        const afterFrontmatter = raw.slice(frontmatterEndIdx + 3);

        const lines = afterFrontmatter.split(/\r?\n/);
        let newAfterFm = afterFrontmatter;
        let changed = false;
        let markersInFile = 0;

        for (const line of lines) {
            const trimmed = line.trim();
            if (isClaimLine(trimmed) && !trimmed.includes("<!-- GEO:")) {
                const lineIdx = newAfterFm.indexOf(line);
                if (lineIdx !== -1 && !newAfterFm.slice(0, lineIdx).includes("<!-- GEO:")) {
                    newAfterFm = newAfterFm.replace(
                        line,
                        line + " <!-- GEO: claim senza fonte -->",
                    );
                    changed = true;
                    markersInFile++;
                }
            }
        }

        if (changed) {
            const newRaw = raw.slice(0, frontmatterEndIdx + 3) + newAfterFm;
            await fs.writeFile(file, newRaw, "utf-8");
            totalModified++;
            totalMarkersAdded += markersInFile;
            const rel = path.relative(process.cwd(), file);
            console.log(`Updated: ${rel} (+${markersInFile} markers)`);
        }
    }

    console.log(`\nDone. Modified ${totalModified} files. Added ${totalMarkersAdded} GEO markers.`);
}

main().catch(console.error);
