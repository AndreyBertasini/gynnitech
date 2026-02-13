import path from "path";

/**
 * Validates that a relative path resolves to a location within the base directory.
 * @param baseDir The trusted base directory.
 * @param relativePath The untrusted relative path segment.
 * @returns The resolved absolute path if valid.
 * @throws Error if the path attempts to traverse outside the base directory.
 */
export function validatePath(baseDir: string, relativePath: string): string {
    const resolvedBase = path.resolve(baseDir);
    const resolvedPath = path.resolve(baseDir, relativePath);

    // Ensure the path starts with the base directory and a separator
    // This prevents partial matches like /base/dir-evil being valid for /base/dir
    if (!resolvedPath.startsWith(resolvedBase + path.sep)) {
        throw new Error(`Invalid path: ${relativePath} resolves to ${resolvedPath}, which is outside of ${resolvedBase}`);
    }

    return resolvedPath;
}
