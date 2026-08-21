import { promises as fs } from "fs";
import matter from "gray-matter";
import path from "path";

const blogRoot = "src/content/blog";
const files = await fs.readdir(blogRoot);
const cats: Record<string, number> = {};

for (const f of files) {
    const raw = await fs.readFile(path.join(blogRoot, f), "utf-8");
    const { data } = matter(raw);
    if (data.category) {
        cats[data.category] = (cats[data.category] || 0) + 1;
    }
}

const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]);
console.log("Categories:");
sorted.forEach(([cat, count]) => console.log(`  ${count} ${cat}`));
console.log(`\nTotal: ${files.length}`);
