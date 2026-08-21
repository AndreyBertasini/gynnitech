import { promises as fs } from "fs";
import path from "path";
import { glob } from "glob";

const corsoRoot = "src/content/corso";
const files = await glob("**/*.mdx", { cwd: corsoRoot, nodir: true, absolute: true });

let withPlaceholder = 0;
let withTodo = 0;
let withGeneric = 0;
const placeholderFiles: string[] = [];

for (const file of files) {
    const raw = await fs.readFile(file, "utf-8");
    const rel = path.relative(process.cwd(), file);
    const hasPlaceholder = raw.includes("placeholder generici") || raw.includes("Sostituisci con contenuto specifico");
    const hasTodo = raw.includes("TODO");
    const hasGeneric = raw.includes("Questo concetto si applica quando");

    if (hasPlaceholder) { withPlaceholder++; placeholderFiles.push(rel); }
    if (hasTodo) withTodo++;
    if (hasGeneric) withGeneric++;
}

console.log(`Total files: ${files.length}`);
console.log(`With 'placeholder generici' marker: ${withPlaceholder}`);
console.log(`With 'TODO': ${withTodo}`);
console.log(`With 'Questo concetto si applica quando': ${withGeneric}`);
console.log(`\nFiles with placeholder marker (${placeholderFiles.length}):`);
placeholderFiles.slice(0, 20).forEach(f => console.log(`  ${f}`));
