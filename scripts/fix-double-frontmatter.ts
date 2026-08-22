import { promises as fs } from "fs";

const filesToFix = [
    "pricing-matematico", "ab-test-errori", "sql-per-marketing", "capire-boxplot",
    "incrementality-marketing", "data-driven-italia", "analytic-traps", "mappe-percettive",
    "innovazione-ateneo", "privacy-first-analytics", "abbandono-universitario", "cluster-analysis",
];

async function main() {
    const blogRoot = "src/content/blog";

    for (const slug of filesToFix) {
        const filePath = `${blogRoot}/${slug}.mdx`;
        const raw = await fs.readFile(filePath, "utf-8");
        const lines = raw.split("\n");

        // Find the line with just "---" that is NOT at position 0 (frontmatter start)
        const firstFm = lines.indexOf("---");
        let secondFm = -1;
        for (let i = firstFm + 1; i < lines.length; i++) {
            if (lines[i] === "---") {
                secondFm = i;
                break;
            }
        }

        if (secondFm === -1) {
            console.log(`SKIP ${slug} (no --- found)`);
            continue;
        }

        // Check if the line before the --- has "answer:..." (means it's inside faqSchema)
        const lineBefore = lines[secondFm - 1];
        if (!lineBefore.includes("answer:")) {
            console.log(`SKIP ${slug} (--- is a table, not faqSchema)`);
            continue;
        }

        // Remove the --- line (it was the end of faqSchema YAML that confused the parser)
        // The content after --- is the real markdown content
        const fixedLines = [...lines.slice(0, secondFm), ...lines.slice(secondFm + 1)];
        await fs.writeFile(filePath, fixedLines.join("\n"), "utf-8");
        console.log(`FIXED ${slug}`);
    }
}

main().catch(console.error);
