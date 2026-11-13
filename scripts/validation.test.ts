import { describe, expect, test } from "vitest";
import path from "path";
import { checkLessonPipeline, validatePath } from "./validation";

describe("validatePath", () => {
    // Use a platform-agnostic base directory
    const baseDir = path.resolve("test-base");

    test("allows simple file paths", () => {
        const result = validatePath(baseDir, "file.txt");
        expect(result).toBe(path.join(baseDir, "file.txt"));
    });

    test("allows valid nested paths", () => {
        const result = validatePath(baseDir, "nested/file.txt");
        expect(result).toBe(path.join(baseDir, "nested/file.txt"));
    });

    test("allows paths with safe current directory references", () => {
        const result = validatePath(baseDir, "./file.txt");
        expect(result).toBe(path.join(baseDir, "file.txt"));
    });

    test("blocks simple parent directory traversal", () => {
        expect(() => validatePath(baseDir, "../outside.txt")).toThrow();
    });

    test("blocks complex traversal attempts", () => {
        expect(() => validatePath(baseDir, "nested/../../outside.txt")).toThrow();
    });

    test("blocks absolute paths pointing outside", () => {
        // path.resolve(base, '/etc/passwd') -> '/etc/passwd' on POSIX
        // This should throw because it doesn't start with baseDir
        // On Windows, absolute path logic is different but should still fail validation
        // if it points to a different drive or outside base.
        // We use a known absolute path for the platform if possible, or just a typical one.
        const absPath = path.resolve("/etc/passwd");
        // Make sure absPath is not inside baseDir (which is inside cwd)
        if (!absPath.startsWith(baseDir)) {
             expect(() => validatePath(baseDir, absPath)).toThrow();
        }
    });

    test("blocks partial path matches", () => {
        // This test ensures that we check for the separator
        // e.g. base: /tmp/test
        // target: /tmp/test-sibling

        const trickyBase = path.resolve("test-dir");
        const trickyTarget = "../test-dir-sibling/file.txt";

        expect(() => validatePath(trickyBase, trickyTarget)).toThrow();
    });
});

// (3s format support removed; tests for formato 3s removed)

describe("checkLessonPipeline — lezioni formato articolo", () => {
    const frasi = "Prima frase. Seconda frase. Terza frase. Quarta frase. Quinta frase.";
    const sezione = (titolo: string, extra = "") => [`## ${titolo}`, "", frasi, "", extra].join("\n");
    const domande = ["1. Quante parti crea ogni insert?", "2. Quale colonna apre l'ORDER BY?", "3. Quante granule legge la query?", "4. Il TTL è dichiarato?", "5. La riconciliazione torna?"].join("\n");
    const articolo = [
        sezione("Il caso"),
        sezione("Il meccanismo", "**Ogni insert crea una parte.**"),
        sezione("L'errore", "1. Primo criterio\n2. Secondo criterio"),
        sezione("La soluzione"),
        sezione("Il caso difficile"),
        ["## La checklist", "", domande].join("\n"),
    ].join("\n\n");
    const esito = (body: string, formato?: string) =>
        Object.fromEntries(checkLessonPipeline(body, "ml-tabellare", formato).map((r) => [r.regola, r.esito]));

    test("regola 1 passa con una riga in grassetto e un elenco numerato", () => {
        expect(esito(articolo, "articolo").regola_1_concetto_calcolo).toBe("PASS");
    });

    test("regola 1 fallisce senza la riga in grassetto", () => {
        const senzaGrassetto = articolo.replace("**Ogni insert crea una parte.**", "Ogni insert crea una parte.");
        expect(esito(senzaGrassetto, "articolo").regola_1_concetto_calcolo).toBe("FAIL");
    });

    test("regola 2 accetta cinque domande numerate in chiusura", () => {
        expect(esito(articolo, "articolo").regola_2_retrieval_attivo).toBe("PASS");
    });

    test("senza formato articolo la regola 1 resta quella di sempre", () => {
        expect(esito(articolo).regola_1_concetto_calcolo).toBe("FAIL");
    });

    test("regola 1 non si ferma su un asterisco dentro il codice inline", () => {
        const conCodice = articolo.replace("**Ogni insert crea una parte.**", "**Evitate `SELECT *` nelle viste.**");
        expect(esito(conCodice, "articolo").regola_1_concetto_calcolo).toBe("PASS");
    });
});
