import { promises as fs } from "fs";
import path from "path";
import { glob } from "glob";

const PLACEHOLDER_PATTERNS = [
    /Questo concetto si applica quando/i,
    /\[LAB\]/i,
    /Inserisci qui/i,
    /TODO/i,
    /Lorem ipsum/i,
    /placeholder/i,
    /\[inserire/i,
    /\[da completare/i,
    /\[esempio da/i,
    /\[link da inserire/i,
    /\[dataset da/i,
    /\[materiali da/i,
];

const corsoRoot = "src/content/corso";
const files = await glob("**/*.mdx", { cwd: corsoRoot, nodir: true, absolute: true });

let totalPlaceholders = 0;
const report: { file: string; pattern: string }[] = [];

for (const file of files) {
    const raw = await fs.readFile(file, "utf-8");
    for (const pattern of PLACEHOLDER_PATTERNS) {
        if (pattern.test(raw)) {
            const rel = path.relative(process.cwd(), file);
            report.push({ file: rel, pattern: pattern.source });
            totalPlaceholders++;
        }
    }
}

console.log(`Found ${totalPlaceholders} placeholder matches across ${new Set(report.map(r => r.file)).size} files\n`);
report.forEach(r => console.log(`${r.file} — ${r.pattern}`));
