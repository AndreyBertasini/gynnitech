import { promises as fs } from "fs";

const f = "src/content/blog/abbandono-universitario.mdx";
const raw = await fs.readFile(f, "utf-8");

const frontmatterEndIdx = raw.indexOf("---", 3);
const afterFm = raw.slice(frontmatterEndIdx + 3);

// Find ISTAT in body
const idx = afterFm.indexOf("ISTAT");
console.log("=== ISTAT in body ===");
console.log(afterFm.slice(Math.max(0, idx - 200), idx + 300));
