/**
 * Giano publisher — imposta draft:false sulle lezioni che Zeus ha marcato PASS.
 * Tocca SOLO il frontmatter (nessuna modifica al corpo). Idempotente.
 * Uso: npx tsx scripts/publish-pass.ts [--dry-run]
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const LOG_FILE = path.join(process.cwd(), ".hermes", "pipeline-log.jsonl");
const DRY_RUN = process.argv.includes("--dry-run");

type LogEntry = { file: string; status: "PASS" | "ESCALATION" };

function setDraftFalse(raw: string): { out: string; changed: boolean } {
    const match = raw.match(/^(---\r?\n)([\s\S]*?)(\r?\n---)(\r?\n*)/);
    if (!match) throw new Error("frontmatter mancante");
    let fm = match[2];
    const draftPattern = /^draft:.*$/m;
    if (draftPattern.test(fm)) {
        if (/^draft:\s*false\s*$/m.test(fm)) return { out: raw, changed: false };
        fm = fm.replace(draftPattern, "draft: false");
    } else {
        fm = `${fm}\ndraft: false`;
    }
    return { out: `${match[1]}${fm}${match[3]}${match[4] || "\n"}${raw.slice(match[0].length)}`, changed: true };
}

async function main(): Promise<void> {
    const lines = (await fs.readFile(LOG_FILE, "utf-8")).split("\n").filter((l) => l.trim().length > 0);
    let published = 0;
    let already = 0;
    let skipped = 0;
    for (const line of lines) {
        const entry = JSON.parse(line) as LogEntry;
        if (entry.status !== "PASS") {
            skipped += 1;
            continue;
        }
        const absolute = path.join(process.cwd(), entry.file);
        const raw = await fs.readFile(absolute, "utf-8");
        const { out, changed } = setDraftFalse(raw);
        if (changed && !DRY_RUN) await fs.writeFile(absolute, out, "utf-8");
        if (changed) published += 1;
        else already += 1;
    }
    console.log(`Giano publisher${DRY_RUN ? " (dry-run)" : ""}: pubblicate ${published}, gia draft:false ${already}, escalation saltate ${skipped}.`);
}

main().catch((error) => {
    console.error("Publish fallita:", error);
    process.exit(1);
});
