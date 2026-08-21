import { promises as fs } from "fs";
import path from "path";
import { glob } from "glob";

// Map of RESEARCH/STATISTICS source names to their official URLs (real, verifiable primary sources)
const SOURCE_LINKS: Record<string, string> = {
    "ISTAT": "https://www.istat.it",
    "Anvur": "https://www.anvur.it",
    "McKinsey": "https://www.mckinsey.com",
    "Bain": "https://www.bain.com",
    "Gartner": "https://www.gartner.com",
    "Forrester": "https://www.forrester.com",
    "IDC": "https://www.idc.com",
    "Eurostat": "https://ec.europa.eu/eurostat",
    "OECD": "https://www.oecd.org",
    "Harvard Business Review": "https://hbr.org",
    "GDPR": "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
    "EU AI Act": "https://artificialintelligenceact.eu",
};

async function main() {
    const blogRoot = "src/content/blog";
    const files = await glob("**/*.mdx", { cwd: blogRoot, nodir: true, absolute: true });

    let totalLinked = 0;

    for (const file of files) {
        const raw = await fs.readFile(file, "utf-8");
        const frontmatterEndIdx = raw.indexOf("---", 3);
        if (frontmatterEndIdx === -1) continue;
        const afterFm = raw.slice(frontmatterEndIdx + 3);

        // Work only on body content (after frontmatter)
        const bodyStart = afterFm.indexOf("\n");
        const body = afterFm.slice(bodyStart);
        const frontmatter = afterFm.slice(0, bodyStart);

        let newBody = body;
        let changed = false;
        let linkedInFile = 0;

        for (const [source, url] of Object.entries(SOURCE_LINKS)) {
            const regex = new RegExp(`\\b${escapeRegex(source)}\\b(?!\\])`, "gs");
            if (regex.test(newBody)) {
                const newText = newBody.replace(regex, `[${source}](${url})`);
                if (newText !== newBody) {
                    newBody = newText;
                    changed = true;
                    linkedInFile++;
                }
            }
        }

        if (changed) {
            const newRaw = raw.slice(0, frontmatterEndIdx + 3) + frontmatter + newBody;
            await fs.writeFile(file, newRaw, "utf-8");
            totalLinked += linkedInFile;
            const rel = path.relative(process.cwd(), file);
            console.log(`OK ${rel}: linked ${linkedInFile} sources`);
        }
    }

    console.log(`\nDone. Total sources linked inline: ${totalLinked}`);
}

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]]/g, "\\$&");
}

main().catch(console.error);
