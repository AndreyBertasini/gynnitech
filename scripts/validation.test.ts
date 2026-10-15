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

describe("checkLessonPipeline — lezioni formato 3s", () => {
    const corpo3s = [
        "## Righe e colonne",
        "",
        "<Slide titolo=\"Righe contro colonne\" messaggio=\"Righe per transazioni.\">",
        "</Slide>",
        "",
        "Testo della sezione. Seconda frase. Terza frase. Quarta frase. Quinta frase.",
        "",
        "## Leggere poco",
        "",
        "<Schema titolo=\"Perché leggiamo poco\">",
        "<Passo testo=\"Uno.\" />",
        "</Schema>",
        "",
        "Altro testo. Seconda. Terza. Quarta. Quinta.",
        "",
        "## Riepilogo",
        "",
        "<Messaggio>Uno.</Messaggio>",
        "",
        "<QuizExercise client:visible quizId=\"q\" questions={[",
        "  { id: \"1\", correctIndex: 0 },",
        "  { id: \"2\", correctIndex: 1 },",
        "  { id: \"3\", correctIndex: 0 },",
        "]} />",
    ].join("\n");
    const esito = (body: string, formato?: string) =>
        Object.fromEntries(checkLessonPipeline(body, "ml-tabellare", formato).map((r) => [r.regola, r.esito]));

    test("regola 1 passa con una figura e uno schema", () => {
        expect(esito(corpo3s, "3s").regola_1_concetto_calcolo).toBe("PASS");
    });

    test("regola 2 passa con un quiz da 3–5 domande nell'ultima sezione", () => {
        expect(esito(corpo3s, "3s").regola_2_retrieval_attivo).toBe("PASS");
    });

    test("regola 2 fallisce se l'ultima sezione non ha il quiz", () => {
        const senzaQuiz = corpo3s.slice(0, corpo3s.indexOf("<QuizExercise"));
        expect(esito(senzaQuiz, "3s").regola_2_retrieval_attivo).toBe("FAIL");
    });

    test("senza formato 3s le regole 1 e 2 restano quelle di sempre", () => {
        const r = esito(corpo3s);
        expect(r.regola_1_concetto_calcolo).toBe("FAIL");
        expect(r.regola_2_retrieval_attivo).toBe("FAIL");
    });
});
