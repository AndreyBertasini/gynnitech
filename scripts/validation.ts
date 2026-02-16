import { promises as fs } from "fs";
import path from "path";
import { glob } from "glob";
import matter from "gray-matter";

const CONTENT_ROOT = path.join(process.cwd(), "src/content");
const FRONTMATTER_REQUIRED_FIELDS: Record<"blog" | "corso", string[]> = {
    blog: ["title", "description", "date", "category"],
    corso: ["title", "description"],
};

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

    if (!resolvedPath.startsWith(resolvedBase + path.sep)) {
        throw new Error(`Invalid path: ${relativePath} resolves to ${resolvedPath}, which is outside of ${resolvedBase}`);
    }

    return resolvedPath;
}

type ValidationError = {
    file: string;
    field: string;
    message: string;
};

function buildError(file: string, field: string, message: string): ValidationError {
    return {
        file: path.relative(process.cwd(), file),
        field,
        message,
    };
}

function toSlug(relativeFilePath: string, frontmatterSlug: unknown): string {
    if (typeof frontmatterSlug === "string" && frontmatterSlug.trim() !== "") {
        return frontmatterSlug.trim();
    }

    const withoutExtension = relativeFilePath.slice(0, -path.extname(relativeFilePath).length);
    return withoutExtension.split(path.sep).join("/");
}

function isValidSlug(slug: string): boolean {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/.test(slug);
}

async function validateCollection(collection: "blog" | "corso"): Promise<ValidationError[]> {
    const pattern = validatePath(CONTENT_ROOT, `${collection}/**/*.mdx`);
    const files = await glob(pattern, { nodir: true });

    const errors: ValidationError[] = [];
    const slugToFile = new Map<string, string>();

    for (const file of files) {
        const raw = await fs.readFile(file, "utf-8");
        const { data } = matter(raw);

        for (const requiredField of FRONTMATTER_REQUIRED_FIELDS[collection]) {
            if (data[requiredField] === undefined || data[requiredField] === null || String(data[requiredField]).trim() === "") {
                errors.push(buildError(file, requiredField, "missing required field"));
            }
        }

        const relativePath = path.relative(validatePath(CONTENT_ROOT, collection), file);
        const slug = toSlug(relativePath, data.slug);

        if (!isValidSlug(slug)) {
            errors.push(buildError(file, "slug", `invalid slug \"${slug}\" (expected kebab-case)`));
        }

        const existing = slugToFile.get(slug);
        if (existing) {
            errors.push(buildError(file, "slug", `duplicate slug \"${slug}\" already used in ${path.relative(process.cwd(), existing)}`));
        } else {
            slugToFile.set(slug, file);
        }

        if (collection === "corso") {
            const requiresOrder = path.dirname(relativePath) !== ".";
            const rawOrder = data.order;

            if (requiresOrder && rawOrder === undefined) {
                errors.push(buildError(file, "order", "missing required field"));
            }

            if (rawOrder !== undefined && (typeof rawOrder !== "number" || !Number.isInteger(rawOrder))) {
                errors.push(buildError(file, "order", `order must be an integer number (received: ${JSON.stringify(rawOrder)})`));
            }
        }
    }

    return errors;
}

export async function validateContent(): Promise<ValidationError[]> {
    const blogErrors = await validateCollection("blog");
    const corsoErrors = await validateCollection("corso");
    return [...blogErrors, ...corsoErrors];
}

async function runValidationCli(): Promise<void> {
    const errors = await validateContent();

    if (errors.length === 0) {
        console.log("✅ Content validation passed.");
        return;
    }

    console.error(`❌ Content validation failed with ${errors.length} error(s):`);
    for (const error of errors) {
        console.error(`- ${error.file} -> ${error.field}: ${error.message}`);
    }

    process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
    runValidationCli().catch((error) => {
        console.error("❌ Unexpected validation error:", error);
        process.exit(1);
    });
}
