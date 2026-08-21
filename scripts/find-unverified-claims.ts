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

const CLAIM_INDICATORS = [
    /secondo\s+(?:un'?|una\s+)/i,
    /dat[i|e]\s+(?:recenti|ufficiali|pubblicate)/i,
    /stime?\s+(?:recenti|ufficiali)/i,
    /si stima/i,
    /rapporto\s+(?:di|tra)/i,
    /indagine\s+(?:di|su)/i,
    /ricerca\s+(?:di|su|condotta)/i,
    /studio\s+(?:di|su|condotto)/i,
    /prevision[ei]\s+(?:di|per)/i,
];

function hasIndicator(line: string): boolean {
    return CLAIM_INDICATORS.some(p => p.test(line));
}

function isClaimLine(line: string, lineNum: number): boolean {
    if (line.trim().startsWith("## ") || line.trim().startsWith("# ") || line.trim().startsWith("```")) return false;
    if (line.trim().startsWith("<!-- ") || line.trim().startsWith("// ") || line.trim().startsWith("* ") || line.trim().startsWith("- ")) return false;
    if (line.trim().startsWith("![") || line.trim().startsWith("1. ") || line.trim().startsWith("2. ") || line.trim().startsWith("3. ") || line.trim().startsWith("4. ")) return false;
    if (line.trim().startsWith("> ")) return false;
    if (line.includes("<!-- GEO:") || line.includes("[fonte:") || line.includes("(fonte:")) return false;
    if (line.length < 30) return false;

    for (const pattern of CLAIM_PATTERNS) {
        if (pattern.test(line)) return true;
    }
    return false;
}

function findClaimLines(content: string): { line: string; lineNum: number }[] {
    const lines = content.split(/\r?\n/);
    const claims: { line: string; lineNum: number }[] = [];

    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (isClaimLine(trimmed, i + 1)) {
            claims.push({ line: trimmed, lineNum: i + 1 });
        }
    }
    return claims;
}

async function main() {
    const blogRoot = "src/content/blog";
    const files = await glob("**/*.mdx", { cwd: blogRoot, nodir: true, absolute: true });

    let totalClaims = 0;
    const report: { file: string; lineNum: number; line: string }[] = [];

    for (const file of files) {
        const raw = await fs.readFile(file, "utf-8");
        const { content } = matter(raw);
        const claims = findClaimLines(content);

        if (claims.length === 0) continue;

        totalClaims += claims.length;
        const rel = path.relative(process.cwd(), file);

        for (const claim of claims) {
            report.push({ file: rel, lineNum: claim.lineNum, line: claim.line });
        }
    }

    console.log(`Found ${totalClaims} potential claims needing sources across ${report.length > 0 ? new Set(report.map(r => r.file)).size : 0} articles\n`);
    console.log("All findings:\n");
    report.forEach(r => console.log(`${r.file}:${r.lineNum} — ${r.line.slice(0, 100)}`));
}

main().catch(console.error);
