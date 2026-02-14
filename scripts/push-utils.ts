import { SITE_URL } from "../src/consts";

export function getLiveUrlInfo(file: string, slug: string): { url: string; type: string } {
    // Determine Type based on folder
    let type = "Page";

    // Normalize file path to forward slashes for consistent handling
    const normalizedFile = file.replace(/\\/g, '/');

    if (normalizedFile.includes("src/content/blog")) {
        type = "Blog";
    }
    if (normalizedFile.includes("src/content/corso")) {
        type = "Course";
    }

    // Construct Live URL
    const baseUrl = SITE_URL;
    let livePath = "";

    if (type === "Course") {
        // src/content/corso/marketing/brand.mdx -> marketing/brand
        // We want to capture the part AFTER src/content/corso/
        const match = normalizedFile.match(/src\/content\/corso\/(.*)\.mdx$/);
        if (match) {
             // Correct URL prefix is /course/ based on sidebar config
             livePath = `/course/${match[1]}`;
        } else {
             livePath = `/course/${slug}`;
        }
    } else if (type === "Blog") {
        livePath = `/blog/${slug}`;
    } else {
        // Docs
        // src/content/docs/docs/guides/text-generation.mdx -> docs/guides/text-generation
        const match = normalizedFile.match(/src\/content\/docs\/(.*)\.mdx$/);
        if (match) {
            livePath = `/${match[1]}`;
        } else {
            livePath = `/${slug}`;
        }
    }

    // Clean up double slashes just in case
    livePath = livePath.replace(/\/+/g, '/');
    const url = `${baseUrl}${livePath}`;

    return { url, type };
}
