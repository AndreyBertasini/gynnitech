import { promises as fs } from "fs";
import path from "path";
import { glob } from "glob";

async function main() {
    const blogRoot = "src/content/blog";
    const files = await glob("**/*.mdx", { cwd: blogRoot, nodir: true, absolute: true });

    let totalFixed = 0;

    for (const file of files) {
        const raw = await fs.readFile(file, "utf-8");
        const lines = raw.split(/\r?\n/);
        const newLines: string[] = [];
        let changed = false;

        for (const line of lines) {
            // Case 1: marker inline at end of a content line
            // "text... <!-- GEO: claim senza fonte -->"
            const inlineMatch = line.match(/^(.*?)\s*<!--\s*(GEO:[^>]*?|geo-imprint:[^>]*?)\s*-->\s*$/);
            if (inlineMatch && inlineMatch[1].trim().length > 0) {
                newLines.push(inlineMatch[1].trimEnd());
                newLines.push(`{/* ${inlineMatch[2]} */}`);
                changed = true;
                continue;
            }
            // Case 2: marker on its own line
            // "<!-- GEO: claim senza fonte -->"
            const ownLineMatch = line.match(/^\s*<!--\s*(GEO:[^>]*?|geo-imprint:[^>]*?)\s*-->\s*$/);
            if (ownLineMatch) {
                newLines.push(`{/* ${ownLineMatch[1]} */}`);
                changed = true;
                continue;
            }
            newLines.push(line);
        }

        if (changed) {
            const newRaw = newLines.join("\r\n");
            await fs.writeFile(file, newRaw, "utf-8");
            totalFixed++;
            const rel = path.relative(process.cwd(), file);
            console.log(`Fixed: ${rel}`);
        }
    }

    console.log(`\nDone. Fixed ${totalFixed} files.`);
}

main().catch(console.error);
