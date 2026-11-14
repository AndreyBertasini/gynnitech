/**
 * Rileva le formule LaTeX corrotte da escape interpretati.
 *
 * Quando un testo con LaTeX passa per una stringa non raw (Python/JS/PowerShell, heredoc con
 * eval, JSON mal decodificato) le sequenze `\t \f \a \b \n \r` diventano caratteri di controllo:
 * `\text` -> TAB+"ext", `\frac` -> FF+"rac", `\approx` -> BEL+"pprox", `\beta` -> BS+"eta",
 * `\neg` -> a capo+"eg". Il file compila lo stesso, ma KaTeX rende male la formula.
 */

// C0 senza TAB (0x09), LF (0x0A), CR (0x0D), più DEL.
export const CONTROL_CHARS = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/;
// Formula inline `$...$` su una sola riga (esclude `$$` e `\$`).
const INLINE_MATH = /(?<!\\)\$(?!\$)((?:\\.|[^$\\\n])+)\$/g;

export type ControlCharIssue = { line: number; reason: string; excerpt: string };

export function showControlChars(text: string): string {
    return text
        .replace(/\t/g, "<TAB>")
        .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, (c) => `<0x${c.charCodeAt(0).toString(16).padStart(2, "0")}>`)
        .slice(0, 140);
}

/**
 * Restituisce una voce per ogni riga con un carattere di controllo o con un TAB dentro una formula
 * (`$...$` su una riga, oppure blocco `$$...$$` anche su più righe), fuori dai fence di codice.
 */
export function findControlCharIssues(text: string): ControlCharIssue[] {
    const issues: ControlCharIssue[] = [];
    let inFence = false;
    let inDisplay = false;
    text.split("\n").forEach((line, index) => {
        if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
        if (CONTROL_CHARS.test(line)) {
            issues.push({ line: index + 1, reason: "carattere di controllo", excerpt: showControlChars(line) });
            return;
        }
        if (inFence) return;
        // Blocchi `$$`: ogni `$$` commuta lo stato; un TAB nei segmenti "dentro" è dentro la formula.
        let state = inDisplay;
        const parts = line.split("$$");
        let tabInDisplay = false;
        parts.forEach((part, i) => {
            if (state && part.includes("\t")) tabInDisplay = true;
            if (i < parts.length - 1) state = !state;
        });
        inDisplay = state;
        if (tabInDisplay) {
            issues.push({ line: index + 1, reason: "TAB dentro una formula", excerpt: showControlChars(line) });
            return;
        }
        if (!line.includes("\t")) return;
        for (const match of line.matchAll(INLINE_MATH)) {
            if (match[1].includes("\t")) {
                issues.push({ line: index + 1, reason: "TAB dentro una formula", excerpt: showControlChars(match[0]) });
            }
        }
    });
    return issues;
}
