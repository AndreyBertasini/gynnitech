import { promises as fs } from "fs";
import path from "path";
import { glob } from "glob";
import matter from "gray-matter";

const DATE_MODIFIED = "2026-08-21";
const BLOG_ROOT = process.argv[2] || "src/content/blog";

async function main() {
    const files = await glob("**/*.mdx", { cwd: BLOG_ROOT, nodir: true, absolute: true });

    let modified = 0;

    for (const file of files) {
        const raw = await fs.readFile(file, "utf-8");
        const { data } = matter(raw);

        if (!data.dateModified) {
            const newRaw = raw.replace(
                /^(---\r?\n)/m,
                `$1dateModified: '${DATE_MODIFIED}'\n`,
            );
            await fs.writeFile(file, newRaw, "utf-8");
            const rel = path.relative(process.cwd(), file);
            console.log(`Updated: ${rel}`);
            modified++;
        }
    }

    console.log(`\nDone. Added dateModified to ${modified} articles in ${BLOG_ROOT}`);
}

main().catch(console.error);
