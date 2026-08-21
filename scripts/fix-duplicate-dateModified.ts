import { promises as fs } from "fs";
import path from "path";

const blogRoot = "src/content/blog";
const files = await fs.readdir(blogRoot);

let corrupted = 0;
let fixed = 0;

for (const f of files) {
    const fp = path.join(blogRoot, f);
    let raw = await fs.readFile(fp, "utf-8");
    const lines = raw.split(/\r?\n/);
    const newLines: string[] = [];
    let skipNext = false;

    for (let i = 0; i < lines.length; i++) {
        if (skipNext) { skipNext = false; continue; }
        const l = lines[i];
        if (l.match(/^dateModified:\s*['"]/)) {
            if (i > 0 && newLines[newLines.length - 1].match(/^dateModified:\s*['"]/)) {
                skipNext = true;
                corrupted++;
                continue;
            }
        }
        newLines.push(l);
    }

    const newRaw = newLines.join("\r\n");
    if (raw !== newRaw) {
        await fs.writeFile(fp, newRaw, "utf-8");
        fixed++;
        console.log(`Fixed: ${f}`);
    }
}

console.log(`\nTotal corrupted: ${corrupted}, fixed files: ${fixed}`);
