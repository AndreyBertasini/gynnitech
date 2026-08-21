import { promises as fs } from "fs";
import matter from "gray-matter";

const raw = await fs.readFile("src/content/blog/ab-test-agenti-ai.mdx", "utf-8");
const first50 = JSON.stringify(raw.slice(0, 50));
const last50 = JSON.stringify(raw.slice(-50));
console.log("First 50 chars:", first50);
console.log("Last 50 chars:", last50);
console.log("Starts with ---\\n:", raw.startsWith("---\n"));
console.log("Index of ---:", raw.indexOf("---"));
const m = matter(raw);
console.log("data keys:", Object.keys(m.data));
