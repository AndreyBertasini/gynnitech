import { promises as fs } from "fs";

const f = "src/content/blog/pricing-matematico.mdx";
const raw = await fs.readFile(f, "utf-8");
const lines = raw.split("\n");

// Find the second --- (end of frontmatter)
let secondFm = -1;
for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
        secondFm = i;
        break;
    }
}
console.log("Frontmatter ends at line:", secondFm);

// Show lines around the table
console.log("\nLines around line 55 (table):");
for (let i = 50; i < 65; i++) {
    console.log(i + ": " + JSON.stringify(lines[i]));
}
