import { ORGANIZATION_ID, PERSON_ID } from "../../src/lib/entity";

const JSON_LD_PATTERN = /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
const ORGANIZATION_TYPES = new Set(["Organization", "EducationalOrganization"]);
const CONTENT_TYPES = new Set(["Article", "BlogPosting", "LearningResource"]);

type JsonObject = Record<string, unknown>;

function typesOf(node: JsonObject): string[] {
    const type = node["@type"];
    return (Array.isArray(type) ? type : [type]).filter((t): t is string => typeof t === "string");
}

function walk(value: unknown, visit: (node: JsonObject) => void): void {
    if (Array.isArray(value)) {
        value.forEach((item) => walk(item, visit));
    } else if (value && typeof value === "object") {
        visit(value as JsonObject);
        Object.values(value as JsonObject).forEach((item) => walk(item, visit));
    }
}

function hasAuthorLink(html: string): boolean {
    for (const [tag] of html.matchAll(/<a\b[^>]*>/gi)) {
        const rel = /\brel="([^"]*)"/i.exec(tag)?.[1] ?? "";
        const href = /\bhref="([^"]*)"/i.exec(tag)?.[1] ?? "";
        if (rel.split(/\s+/).includes("author") && /(^|\/\/ginnytech\.it)\/about\/?$/.test(href)) {
            return true;
        }
    }
    return false;
}

/** Controlla che il JSON-LD di una pagina usi le entità canoniche; restituisce i messaggi di errore. */
export function auditEntityGraph(html: string): string[] {
    const errors: string[] = [];
    let hasContentNode = false;

    for (const match of html.matchAll(JSON_LD_PATTERN)) {
        let data: unknown;
        try {
            data = JSON.parse(match[1]);
        } catch {
            errors.push("invalid JSON-LD");
            continue;
        }

        walk(data, (node) => {
            const types = typesOf(node);
            if (types.includes("Person") && node["@id"] !== PERSON_ID) {
                errors.push(`Person must have @id ${PERSON_ID} (found ${String(node["@id"])})`);
            }
            if (types.some((t) => ORGANIZATION_TYPES.has(t)) && node.name === "GinnyTech" && node["@id"] !== ORGANIZATION_ID) {
                errors.push(`Organization GinnyTech must have @id ${ORGANIZATION_ID} (found ${String(node["@id"])})`);
            }
            if (types.includes("WebSite")) {
                const actions = ([] as unknown[]).concat(node.potentialAction ?? []);
                if (actions.some((a) => a && typeof a === "object" && typesOf(a as JsonObject).includes("SearchAction"))) {
                    errors.push("WebSite must not declare a SearchAction the site cannot serve");
                }
            }
            if (types.some((t) => CONTENT_TYPES.has(t))) {
                hasContentNode = true;
            }
        });
    }

    if (hasContentNode && !hasAuthorLink(html)) {
        errors.push('content page must link its author with <a rel="author" href="/about/">');
    }
    return errors;
}
