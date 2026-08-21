import { promises as fs } from "fs";
import matter from "gray-matter";
import path from "path";
import { glob } from "glob";

const CLAIM_PATTERN = /\{\/\*\s*GEO:\s*claim senza fonte\s*\*\/}/;

const blogRoot = "src/content/blog";
const files = await glob("**/*.mdx", { cwd: blogRoot, nodir: true, absolute: true });

const counts: { file: string; count: number; hasFaq: boolean; wordCount: number }[] = [];

for (const file of files) {
    const raw = await fs.readFile(file, "utf-8");
    const { data, content } = matter(raw);
    const matches = content.match(new RegExp(CLAIM_PATTERN, "g")) || [];
    if (matches.length > 0) {
        const rel = path.relative(process.cwd(), file).replace("src\\content\\blog\\", "");
        counts.push({
            file: rel,
            count: matches.length,
            hasFaq: content.includes("## Domande frequenti"),
            wordCount: content.split(/\s+/).length,
        });
    }
}

counts.sort((a, b) => b.count - a.count);
console.log("Article | Claims | HasFAQ | Words");
counts.forEach(c => console.log(`${c.file} | ${c.count} | ${c.hasFaq ? "yes" : "no"} | ${c.wordCount}w`));
