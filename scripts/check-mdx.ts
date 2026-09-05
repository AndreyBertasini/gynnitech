/**
 * Pre-check di build: compila tutti i contenuti MDX/MD con lo stesso
 * parser del sito (remark-math) e segnala gli errori in un colpo solo,
 * invece di scoprirli uno alla volta durante `astro build`.
 * Uso: npm run check:mdx
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { glob } from "glob";
import { compile } from "@mdx-js/mdx";
import remarkMath from "remark-math";

const root = path.join(process.cwd(), "src/content");
const files = await glob("**/*.md*", { cwd: root, nodir: true, absolute: true });
const failures: string[] = [];
for (const file of files) {
    const raw = await fs.readFile(file, "utf-8");
    try {
        await compile(raw, {
            remarkPlugins: [remarkMath],
            rehypePlugins: [],
            development: false,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message.split("\n").slice(0, 4).join(" | ") : String(error);
        failures.push(`${file} :: ${message.slice(0, 200)}`);
    }
}
if (failures.length > 0) {
    console.error(failures.join("\n"));
    console.error(`MDX check fallito: ${failures.length}/${files.length} file con errori.`);
    process.exit(1);
}
console.log(`MDX check passato: ${files.length} file compilano.`);
