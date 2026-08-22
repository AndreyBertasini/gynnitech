import { promises as fs } from "fs";
import matter from "gray-matter";
import path from "path";
import { glob } from "glob";

const blogRoot = "src/content/blog";
const files = await glob("**/*.mdx", { cwd: blogRoot, nodir: true, absolute: true });

let withFaq = 0;
let withoutFaq: string[] = [];

for (const file of files) {
    const raw = await fs.readFile(file, "utf-8");
    const { content } = matter(raw);
    const slug = path.basename(file, ".mdx");
    if (content.includes("## Domande frequenti")) {
        withFaq++;
    } else {
        withoutFaq.push(slug);
    }
}

console.log(`With FAQ: ${withFaq}`);
console.log(`Without FAQ: ${withoutFaq.length}`);
console.log("\nTop articles without FAQ (by word count):");
// Sort by word count descending
const withWords: { slug: string; words: number }[] = [];
for (const slug of withoutFaq) {
    const raw = await fs.readFile(path.join(blogRoot, `${slug}.mdx`), "utf-8");
    const { content } = matter(raw);
    withWords.push({ slug, words: content.split(/\s+/).length });
}
withWords.sort((a, b) => b.words - a.words);
withWords.slice(0, 20).forEach(w => console.log(`  ${w.slug}: ${w.words}w`));
