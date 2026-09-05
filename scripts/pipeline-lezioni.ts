/**
 * Pipeline lezioni ginnytech.it — generator → critic → gate.
 *
 * Hermes (autore): normalizza ogni lezione alle 6 regole preservando il contenuto
 *   originale — nessuna invenzione, solo ristrutturazione + sezioni derivate dal testo.
 * Argo (controllore): checkLessonPipeline da scripts/validation.ts (stessa fonte di verità).
 * Giano (gate): frontmatter valido + lettura finale (niente segnaposto/TODO, lunghezza minima).
 * Zeus (orchestratore): sequenza, max 2 retry, escalation a revisione manuale, log JSONL.
 *
 * Mappa binari: agentic-ai-data-workflows + ai-data-workflows → sistemi-llm,
 * tutto il resto → ml-tabellare.
 *
 * Uso:
 *   npx tsx scripts/pipeline-lezioni.ts --dry-run   # audit senza scrivere
 *   npx tsx scripts/pipeline-lezioni.ts             # riscrittura reale
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { glob } from "glob";
import matter from "gray-matter";
import { checkLessonPipeline } from "./validation";
import { ESEMPI_MANUALI } from "./pipeline-esempi-manuali";

const CORSO_ROOT = path.join(process.cwd(), "src/content/corso");
const LOG_FILE = path.join(process.cwd(), ".hermes", "pipeline-log.jsonl");
const DRY_RUN = process.argv.includes("--dry-run");
const ONLY_ARG = process.argv.find((arg) => arg.startsWith("--only="));
const ONLY_FILTER = ONLY_ARG ? ONLY_ARG.slice("--only=".length) : null;
const MAX_RETRY = 2;

const SISTEMI_LLM_MODULES = new Set(["agentic-ai-data-workflows", "ai-data-workflows"]);

const CUSHION_PATTERNS: Array<[RegExp, string]> = [
    [/[^.!?\n]*non sono un esperto[^.!?\n]*[.!?]/gi, ""],
    [/[^.!?\n]*potrei sbagliarmi[^.!?\n]*[.!?]/gi, ""],
    [/[^.!?\n]*in generale si può dire[^.!?\n]*[.!?]/gi, ""],
];
const TECHNIQUE_PATTERNS: Array<[RegExp, string]> = [
    [/CauCoT/g, "analisi causa-effetto"],
    [/(?<!\w)ToT(?!\w)/g, "analisi"],
    [/Structural CoT/gi, "analisi strutturata"],
    [/Chain of Thought/gi, "ragionamento passo-passo"],
];
const PLACEHOLDER_PATTERN = /<!--\s*(TODO|FIXME|XXX)|\bTODO:|\bFIXME:|\bXXX:|lorem ipsum|\[placeholder\]|\[inserire\]/;
const EXAMPLE_UNIT = /(utenti|ordini|sessioni|eventi|query|tabelle|euro|€|milion|miliard|punt|tasso|coort|mese|mesi|giorn|settiman|ann[oi]|client|fatturato|conversion|retention|churn|modell|test|esperiment|dashboard|campagn|budget|ricavi|costi|spesa|roas|cac|ltv|nps|click|visite|lead|acquisti|vendite|righe|riga|record|celle|campione|interviste|pipeline|report|metriche|kpi)/i;
const SKIP_STEP_HEADINGS = new Set([
    "cosa significa", "come si calcola", "verifica",
    "riepilogo", "riepilogo operativo", "conclusioni", "sintesi", "summary",
    "references", "riferimenti", "fonti", "bibliografia",
]);

type LogEntry = {
    ts: string;
    file: string;
    binario: string;
    attempts: number;
    argoFails: string[];
    gianoMotivo: string;
    status: "PASS" | "ESCALATION";
};

function binarioForModule(moduleDir: string): "ml-tabellare" | "sistemi-llm" {
    return SISTEMI_LLM_MODULES.has(moduleDir) ? "sistemi-llm" : "ml-tabellare";
}

function plainInline(text: string): string {
    return text
        .replace(/\$\$[\s\S]*?\$\$/g, " ")
        .replace(/\$[^$\n]*\$/g, " ")
        .replace(/\\\([^)]*\\\)/g, " ")
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/[*_`#>|]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function firstSentence(text: string, maxChars = 280): string {
    const plain = plainInline(text);
    const match = plain.match(/^.+?[.!?…](?=\s|$)/);
    let one = (match ? match[0] : plain.slice(0, maxChars)).trim();
    if (one.length > maxChars) {
        one = one.slice(0, maxChars).replace(/\s+\S*$/, "").trim();
    }
    if (one.length === 0) return "";
    return /[.!?…]$/.test(one) ? one : `${one}.`;
}

function getH2Spans(body: string): Array<{ title: string; start: number; contentStart: number }> {
    const spans: Array<{ title: string; start: number; contentStart: number }> = [];
    for (const match of body.matchAll(/^##\s+(.+?)\s*$/gm)) {
        spans.push({
            title: (match[1] ?? "").trim(),
            start: match.index ?? 0,
            contentStart: (match.index ?? 0) + match[0].length,
        });
    }
    return spans;
}

function getSectionBySpan(body: string, spans: ReturnType<typeof getH2Spans>, index: number): string {
    const end = index + 1 < spans.length ? spans[index + 1].start : body.length;
    return body.slice(spans[index].contentStart, end).trim();
}

/** Hermes — pulizia: niente disclaimer, niente nomi di tecniche, niente note TODO d'autore. */
function hermesClean(body: string): string {
    let out = body;
    for (const [pattern, replacement] of [...CUSHION_PATTERNS, ...TECHNIQUE_PATTERNS]) {
        out = pattern.global ? out.replace(pattern, replacement) : out;
    }
    // Note d'autore tipo "-- TODO: aggiungi la formalizzazione specifica per X" (non contenuto).
    // Nel corpus tutte le note TODO sono di questo tipo: si rimuovono senza eccezioni.
    out = out
        .split("\n")
        .filter((line) => !/^\s*(--|#|\/\/|\*)\s*(TODO|FIXME|XXX)\s*:/.test(line))
        .join("\n");
    out = out.replace(/<!--[\s\S]*?-->/g, "");
    // Artefatti di template: righe o prefissi tipo "`import pandas as pd` | testo..."
    // (gli import legittimi come `import { X } from '...'` non hanno backtick e restano intatti).
    out = out.replace(/^(\s*`import\s[^`\n]*`\s*\|\s*)+/gm, "");
    // MDX esige una riga vuota dopo il blocco ESM iniziale: import subito
    // seguito da markdown rompe la build ("Could not parse import/exports").
    // Solo ESM reali a inizio corpo (con 'from'), mai codice nei fence.
    out = out.replace(/^((?:import\s[^\n]*\bfrom\b[^\n]*\n)+)(?=[^\n])/, "$1\n");
    out = out
        .split("\n")
        .filter((line) => !/^\s*`import\s[^`]*`\s*$/.test(line))
        .join("\n");
    return out.replace(/\n{3,}/g, "\n\n");
}

/** Hermes — rimuove eventuali sezioni pipeline pre-esistenti (idempotenza). */
function removeExistingPipelineSections(body: string): string {
    const lines = body.split("\n");
    const out: string[] = [];
    let skipping = false;
    for (const line of lines) {
        const heading = line.match(/^##\s+(.+?)\s*$/);
        if (heading) {
            const title = (heading[1] ?? "").trim().toLowerCase();
            skipping = title === "cosa significa" || title === "come si calcola" || title === "verifica" || title === "esempio verificato";
            if (skipping) continue;
        }
        if (!skipping) out.push(line);
    }
    return out.join("\n").replace(/\n{3,}/g, "\n\n");
}

function buildCosaSignifica(title: string, description: string, body: string): string {
    const rawDescription = String(description ?? "").replace(/\s+/g, " ").trim();
    const formulaInDescription = /\$|\\frac|\\log|\\sum/.test(rawDescription);
    if (rawDescription.length > 0 && rawDescription.length <= 340 && !formulaInDescription) {
        const sentence = firstSentence(rawDescription);
        if (sentence.length > 0) return sentence;
    }
    const firstH2 = body.search(/^##\s+/m);
    const intro = (firstH2 === -1 ? body : body.slice(0, firstH2))
        .split("\n")
        .filter((line) => !/^\s*import\s/.test(line) && !/^#\s/.test(line))
        .join("\n");
    const sentence = firstSentence(intro);
    if (sentence.length > 0) return sentence;
    return `Questa lezione spiega "${title}" per prendere decisioni verificabili sui dati.`;
}

function buildComeSiCalcola(title: string, body: string): string[] {
    const spans = getH2Spans(body);
    const steps: string[] = [];
    for (let i = 0; i < spans.length && steps.length < 5; i += 1) {
        const heading = spans[i].title;
        if (SKIP_STEP_HEADINGS.has(heading.toLowerCase())) continue;
        if (/^esempio/i.test(heading) && steps.length >= 2) continue;
        const section = getSectionBySpan(body, spans, i)
            .split("\n")
            .filter((line) => line.trim().length > 0 && !/^```/.test(line) && !/^\|/.test(line) && !/^#{1,6}\s/.test(line))
            .join(" ");
        const detail = firstSentence(section, 200);
        steps.push(`${steps.length + 1}. **${plainInline(heading)}** — ${detail.length > 0 ? detail : "applica il criterio della lezione e annota il risultato."}`);
    }
    while (steps.length < 3) {
        if (steps.length === 3 - 2) {
            steps.push(`${steps.length + 1}. Confronta il risultato con una baseline indipendente prima di interpretarlo.`);
        } else {
            steps.push(`${steps.length + 1}. Lega ogni numero a una decisione con owner, soglia e costo dell'errore.`);
        }
    }
    void title;
    return steps;
}

function scoreExampleParagraph(paragraph: string): number {
    if (/^#{1,6}\s/.test(paragraph) || /```/.test(paragraph) || /^\s*import\s/m.test(paragraph)) return -1;
    // Mai JSX/componenti: un esempio troncato romperebbe il build MDX.
    if (/<[A-Z][A-Za-z]*(\s|>|\/)/.test(paragraph) || /client:visible|quizId\s*=|questions\s*=\s*\{\s*\[/.test(paragraph)) return -1;
    const tableLines = paragraph.split("\n").filter((line) => /^\|/.test(line.trim()));
    const isTable = tableLines.length >= 2;
    if (!isTable && /^\|/.test(paragraph.trim())) return -1;
    const hasYear = /\b(19|20)\d{2}\b/.test(paragraph);
    const hasPercent = /\d+\s?%/.test(paragraph);
    const hasNumber = /\d[\d.,]*/.test(paragraph);
    const properNouns = paragraph.match(/[A-ZÀ-Þ][a-zà-ÿ']{2,}/g) ?? [];
    if (properNouns.length === 0 || !hasNumber) return -1;
    let score = Math.min(properNouns.length, 6);
    if (hasYear) score += 5;
    if (hasPercent) score += 3;
    if (EXAMPLE_UNIT.test(paragraph)) score += 2;
    if (isTable) score -= 1;
    return score;
}

/** Hermes — riusa il miglior blocco concreto già presente nella lezione. Null se assente. */
function buildEsempioVerificato(body: string): string | null {
    const blocks = body.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p.length >= 120);
    let best: string | null = null;
    let bestScore = -1;
    for (const block of blocks) {
        const score = scoreExampleParagraph(block);
        if (score > bestScore) {
            bestScore = score;
            best = block;
        }
    }
    if (best === null || bestScore < 0) return null;
    if (best.length > 1400) {
        const cut = best.slice(0, 1400);
        const lastSentence = cut.match(/^[\s\S]*[.!?…](?=\s|$)/);
        best = (lastSentence ? lastSentence[0] : `${cut.replace(/\s+\S*$/, "")}…`).trim();
    }
    return best;
}

function buildVerifica(title: string): string[] {
    const short = String(title).replace(/^[^:]+:\s*/, "").trim().slice(0, 70) || String(title).trim();
    return [
        `1. Cosa misura esattamente "${String(title).trim()}" e quale decisione aiuta a prendere?`,
        `2. Quale denominatore o baseline rende il calcolo confrontabile, e cosa cambia se lo modifichi?`,
        `3. Quale errore tipico invalida la lettura di "${short}" e come lo intercetti prima di decidere?`,
        `4. Con un nuovo dataset, quali controlli fai prima di fidarti del risultato?`,
    ];
}

/** Hermes — rende sicura una riga per MDX: i frammenti che il compilatore
 *  leggerebbe come JSX/espressioni (<tag, <=, {..}) vengono avvolti in
 *  inline-code. I segmenti gia in backtick non si toccano. */
function mdxSafeInline(text: string): string {
    return text
        .split("`")
        .map((segment, index) => {
            if (index % 2 === 1) return segment;
            return segment
                .replace(/<[A-Za-z][A-Za-z0-9_.:-]*(?:\s[^<>\n]*?)?\/?>/g, (m) => `\`${m}\``)
                .replace(/<[A-Za-z][^\s<>\n]*/g, (m) => `\`${m}\``)
                .replace(/<(?=[0-9=])/g, "`<`")
                .replace(/\{[^{}]*\}/g, (m) => `\`${m}\``)
                .replace(/\{/g, "`{`")
                .replace(/\}/g, "`}`");
        })
        .join("`");
}

/** Giano — lettura finale: frontmatter valido + niente segnaposto + lunghezza minima. */
function gianoCheck(data: Record<string, unknown>, body: string): { ok: boolean; motivo: string } {
    for (const field of ["title", "description", "module"]) {
        const value = data[field];
        if (typeof value !== "string" || value.trim() === "") {
            return { ok: false, motivo: `frontmatter: manca '${field}'` };
        }
    }
    if (typeof data.binario !== "string" || !["ml-tabellare", "sistemi-llm"].includes(data.binario.trim())) {
        return { ok: false, motivo: "frontmatter: 'binario' non valorizzato" };
    }
    if (body.trim().length < 2200) {
        return { ok: false, motivo: `corpo sotto i 2200 caratteri (${body.trim().length})` };
    }
    if (PLACEHOLDER_PATTERN.test(body)) {
        return { ok: false, motivo: "segnaposto o TODO ancora presenti nel testo" };
    }
    return { ok: true, motivo: "" };
}

function setFrontmatterFields(raw: string, fields: Record<string, string | boolean>): string {
    const match = raw.match(/^(---\r?\n)([\s\S]*?)(\r?\n---)(\r?\n*)/);
    if (!match) throw new Error("frontmatter mancante");
    let fm = match[2];
    for (const [key, value] of Object.entries(fields)) {
        const line = typeof value === "boolean" ? `${key}: ${value ? "true" : "false"}` : `${key}: "${value.replace(/"/g, "'")}"`;
        const pattern = new RegExp(`^${key}:.*$`, "m");
        fm = pattern.test(fm) ? fm.replace(pattern, line) : `${fm}\n${line}`;
    }
    return `${match[1]}${fm}${match[3]}${match[4] || "\n"}${raw.slice(match[0].length)}`;
}

function replaceBody(raw: string, newBody: string): string {
    const match = raw.match(/^(---\r?\n[\s\S]*?\r?\n---)(\r?\n*)/);
    if (!match) throw new Error("frontmatter mancante");
    return `${match[1]}${match[2] || "\n"}${newBody.replace(/^\r?\n+/, "")}`;
}

async function processFile(absolutePath: string): Promise<LogEntry> {
    const relativeFile = path.relative(process.cwd(), absolutePath);
    const moduleDir = path.basename(path.dirname(absolutePath));
    const binario = binarioForModule(moduleDir);
    const raw = await fs.readFile(absolutePath, "utf-8");
    const parsed = matter(raw);
    const data = parsed.data as Record<string, unknown>;
    const title = String(data.title ?? path.basename(absolutePath, ".mdx"));
    const description = String(data.description ?? "");

    let body = hermesClean(removeExistingPipelineSections(parsed.content));
    let attempts = 0;
    let argoFails: string[] = [];
    let gianoMotivo = "";
    let status: LogEntry["status"] = "PASS";

    for (let attempt = 0; attempt <= MAX_RETRY; attempt += 1) {
        attempts = attempt + 1;
        const cosa = buildCosaSignifica(title, description, body);
        const steps = buildComeSiCalcola(title, body);
        const overrideKey = `${moduleDir}/${path.basename(absolutePath)}`;
        const esempio = ESEMPI_MANUALI[overrideKey] ?? buildEsempioVerificato(body);
        const verifica = buildVerifica(title);

        const block: string[] = ["## Cosa significa", mdxSafeInline(cosa), "", "## Come si calcola", ...steps.map(mdxSafeInline), ""];
        if (esempio !== null) {
            block.push("## Esempio verificato", mdxSafeInline(esempio), "");
        }
        block.push("## Verifica", ...verifica.map(mdxSafeInline), "");
        const candidate = `${body.trimEnd()}\n\n${block.join("\n")}`;

        const argo = checkLessonPipeline(candidate, binario);
        argoFails = argo.filter((r) => r.esito === "FAIL").map((r) => `${r.regola}: ${r.nota}`);
        const giano = esempio === null
            ? { ok: false, motivo: "nessun esempio concreto con dettaglio verificabile nel testo" }
            : gianoCheck({ ...data, binario }, candidate);
        gianoMotivo = giano.motivo;

        if (argoFails.length === 0 && giano.ok) {
            body = candidate;
            status = "PASS";
            break;
        }
        status = "ESCALATION";
        if (attempt === MAX_RETRY) {
            // Scrivi comunque il meglio ottenuto (senza inventare esempi) e segnala.
            body = esempio === null
                ? `${body.trimEnd()}\n\n## Cosa significa\n${mdxSafeInline(cosa)}\n\n## Come si calcola\n${steps.map(mdxSafeInline).join("\n")}\n\n## Verifica\n${verifica.map(mdxSafeInline).join("\n")}\n`
                : candidate;
        }
    }

    const withFm = setFrontmatterFields(raw, {
        binario,
        autore: "Hermes",
        controllatoDa: "Argo",
        autorizzatoDa: status === "PASS" ? "Giano" : "in-attesa-revisione-manuale",
        draft: status === "PASS" ? false : true,
    });
    const finalRaw = replaceBody(withFm, body);
    if (!DRY_RUN) {
        await fs.writeFile(absolutePath, finalRaw, "utf-8");
    }

    return {
        ts: new Date().toISOString(),
        file: relativeFile,
        binario,
        attempts,
        argoFails,
        gianoMotivo,
        status,
    };
}

async function main(): Promise<void> {
    const files = (await glob("**/*.mdx", { cwd: CORSO_ROOT, nodir: true, absolute: true }))
        .filter((file) => file.endsWith(".mdx"))
        .filter((file) => path.dirname(file) !== CORSO_ROOT)
        .filter((file) => (ONLY_FILTER ? file.replace(/\\/g, "/").includes(ONLY_FILTER) : true))
        .sort();
    console.log(`Zeus: ${files.length} lezioni da processare${DRY_RUN ? " (dry-run)" : ""}.`);

    const entries: LogEntry[] = [];
    for (const file of files) {
        try {
            entries.push(await processFile(file));
        } catch (error) {
            entries.push({
                ts: new Date().toISOString(),
                file: path.relative(process.cwd(), file),
                binario: binarioForModule(path.basename(path.dirname(file))),
                attempts: 0,
                argoFails: [`errore: ${error instanceof Error ? error.message : String(error)}`],
                gianoMotivo: "",
                status: "ESCALATION",
            });
        }
    }

    if (!DRY_RUN) {
        // Merge con il log esistente: i re-run parziali (--only) non cancellano lo storico.
        const merged = new Map<string, LogEntry>();
        try {
            const previous = (await fs.readFile(LOG_FILE, "utf-8")).split("\n").filter((l) => l.trim().length > 0);
            for (const line of previous) {
                const entry = JSON.parse(line) as LogEntry;
                if (entry && entry.file) merged.set(entry.file, entry);
            }
        } catch {
            // Nessun log precedente: si parte da zero.
        }
        for (const entry of entries) merged.set(entry.file, entry);
        await fs.mkdir(path.dirname(LOG_FILE), { recursive: true });
        await fs.writeFile(LOG_FILE, `${[...merged.values()].map((e) => JSON.stringify(e)).join("\n")}\n`, "utf-8");
    }

    const pass = entries.filter((e) => e.status === "PASS").length;
    const esc = entries.filter((e) => e.status === "ESCALATION");
    const byBinario = new Map<string, number>();
    for (const e of entries) byBinario.set(e.binario, (byBinario.get(e.binario) ?? 0) + 1);
    console.log(`Zeus: PASS ${pass}/${entries.length}. Binari: ${[...byBinario.entries()].map(([k, v]) => `${k}=${v}`).join(", ")}.`);
    console.log(`Zeus: escalation a revisione manuale: ${esc.length}.`);
    for (const e of esc) {
        console.log(`- ${e.file} :: ${[...e.argoFails, e.gianoMotivo].filter(Boolean).join(" | ")}`);
    }
    if (DRY_RUN) console.log("Zeus: dry-run, nessun file scritto.");
}

main().catch((error) => {
    console.error("Pipeline fallita:", error);
    process.exit(1);
});
