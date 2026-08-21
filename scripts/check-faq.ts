import { promises as fs } from "fs";
import matter from "gray-matter";

const raw = await fs.readFile("src/content/blog/growth-engineering-ipotesi-buone.mdx", "utf-8");
const m = matter(raw);
const hasFaqSection = m.content.includes("Domande frequenti");
const faqIdx = m.content.indexOf("Domande frequenti");
console.log("Has FAQ section:", hasFaqSection);
console.log("FAQ index:", faqIdx);
console.log("Content around FAQ:", JSON.stringify(m.content.slice(faqIdx - 20, faqIdx + 100)));
