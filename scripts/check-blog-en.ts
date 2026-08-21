import { promises as fs } from "fs";

const dir = "src/content/blog-en";
const files = await fs.readdir(dir);
console.log(`${files.length} files`);

const firstRaw = await fs.readFile(`${dir}/${files[0]}`, "utf-8");
console.log("\nFirst file frontmatter:");
console.log(firstRaw.slice(0, 300));
