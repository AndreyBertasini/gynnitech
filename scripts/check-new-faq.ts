import { promises as fs } from "fs";

// Verify a new FAQ article
const f = "src/content/blog/pricing-matematico.mdx";
const raw = await fs.readFile(f, "utf-8");
const firstFmEnd = raw.indexOf("---", 3);
const secondFmEnd = raw.indexOf("---", firstFmEnd + 3);
console.log("Two frontmatter markers:", secondFmEnd > firstFmEnd);

// Check content
if (secondFmEnd > firstFmEnd) {
    console.log("ERROR: double frontmatter!");
    console.log(raw.slice(0, secondFmEnd + 100));
} else {
    console.log("OK: single frontmatter");
}

const hasFaq = raw.includes("## Domande frequenti");
console.log("Has FAQ section:", hasFaq);
