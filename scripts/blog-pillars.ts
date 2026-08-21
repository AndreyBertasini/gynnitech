import { promises as fs } from "fs";
import matter from "gray-matter";
import path from "path";

const blogRoot = "src/content/blog";
const files = await fs.readdir(blogRoot);
const articles: { slug: string; title: string; category: string; date: string }[] = [];

for (const f of files) {
    const raw = await fs.readFile(path.join(blogRoot, f), "utf-8");
    const { data } = matter(raw);
    const slug = f.replace(/\.mdx$/, "");
    articles.push({ slug, title: data.title, category: data.category, date: data.date });
}

const topCats = ["Experimentation", "AI Agents", "Data Engineering", "Team", "Product Engineering", "Analytics"];
const pillar = articles.filter(a => topCats.includes(a.category));
pillar.sort((a, b) => {
    const catDiff = topCats.indexOf(a.category) - topCats.indexOf(b.category);
    if (catDiff !== 0) return catDiff;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
});

console.log("Pillar candidates (top categories):");
pillar.forEach(a => console.log(`[${a.category}] ${a.slug}: ${a.title}`));
