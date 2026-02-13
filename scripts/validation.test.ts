import { expect, test, describe } from "bun:test";
import path from "path";
import { validatePath } from "./validation";

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
