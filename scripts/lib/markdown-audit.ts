const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;

/** Checks one generated `.md` twin: valid frontmatter and a body that is not empty or truncated. */
export function auditMarkdownTwin(text: string, minBodyChars = 1500): string[] {
    const errors: string[] = [];
    const match = FRONTMATTER.exec(text);
    if (!match) {
        return ["missing frontmatter"];
    }

    for (const key of ["url", "author_url"]) {
        if (!new RegExp(`^${key}: "`, "m").test(match[1])) {
            errors.push(`frontmatter is missing ${key}`);
        }
    }

    const body = text.slice(match[0].length).replace(/^\s*# .*\r?\n/, "").trim();
    if (body.length < minBodyChars) {
        errors.push(`body has ${body.length} characters (min ${minBodyChars}): empty or truncated Markdown`);
    }
    return errors;
}
