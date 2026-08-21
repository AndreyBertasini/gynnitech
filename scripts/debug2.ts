import { promises as fs } from "fs";
import matter from "gray-matter";
import path from "path";

const blogRoot = "src/content/blog";
const raw = await fs.readFile(path.join(blogRoot, "growth-engineering-ipotesi-buone.mdx"), "utf-8");
console.log("File starts with:", JSON.stringify(raw.slice(0, 30)));
const m = matter(raw);
console.log("data.dateModified:", m.data.dateModified, "type:", typeof m.data.dateModified);
console.log("Boolean check:", !m.data.dateModified);
