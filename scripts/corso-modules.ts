import { promises as fs } from "fs";
import path from "path";

const corsoRoot = "src/content/corso";
const modules = await fs.readdir(corsoRoot);

for (const mod of modules) {
    const modPath = path.join(corsoRoot, mod);
    const stat = await fs.stat(modPath);
    if (!stat.isDirectory()) continue;
    const lessons = (await fs.readdir(modPath)).filter(f => f.endsWith(".mdx"));
    if (lessons.length > 0) {
        console.log(`${lessons.length} ${mod}`);
    }
}
