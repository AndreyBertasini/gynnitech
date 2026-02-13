import { Client } from "@notionhq/client";
import { markdownToBlocks } from "@tryfabric/martian";
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import dotenv from "dotenv";
import { glob } from "glob";
import { SITE_URL } from "../src/consts";

dotenv.config();

// Retry Helper
async function withRetry<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
        return await operation();
    } catch (error: any) {
        if (retries <= 0) throw error;
        if (error.status === 429 || (error.status >= 500 && error.status < 600)) {
            const waitTime = error.headers?.["retry-after"] ? parseInt(error.headers["retry-after"]) * 1000 : delay;
            console.log(`Retrying in ${waitTime}ms... (${retries} left)`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return withRetry(operation, retries - 1, delay * 2);
        }
        throw error;
    }
}

async function push() {
    const token = process.env.NOTION_TOKEN;
    const dbId = process.env.NOTION_DATABASE_ID;

    if (!token || !dbId) {
        console.error("Missing NOTION_TOKEN or NOTION_DATABASE_ID");
        process.exit(1);
    }

    // Format DB ID
    const formattedDbId = dbId.length === 32 
        ? `${dbId.slice(0, 8)}-${dbId.slice(8, 12)}-${dbId.slice(12, 16)}-${dbId.slice(16, 20)}-${dbId.slice(20)}`
        : dbId;

    const client = new Client({ auth: token });
    console.log(`Pushing FULL content to Notion Database: ${formattedDbId}`);

    // 0. Ensure 'Live URL' property exists in the database
    try {
        await withRetry(() => client.databases.update({
            database_id: formattedDbId,
            properties: {
                "Live URL": {
                    url: {},
                },
            },
        }));
        console.log("Verified 'Live URL' property in database schema.");
    } catch (e) {
        console.warn("Could not update database schema (might already exist or permissions issue):", e);
    }

    // 1. Get existing pages to avoid duplicates and map Slug -> PageID
    const existingPages = new Map();
    let cursor = undefined;
    do {
        const response: any = await withRetry(() => client.databases.query({
            database_id: formattedDbId,
            start_cursor: cursor,
        }));
        
        for (const page of response.results) {
            if ('properties' in page) {
                // @ts-ignore
                const slug = page.properties.Slug?.rich_text[0]?.plain_text;
                if (slug) existingPages.set(slug, page.id);
            }
        }
        cursor = response.next_cursor;
    } while (cursor);

    console.log(`Found ${existingPages.size} existing pages in Notion.`);

    // 2. Find local MDX files
    const files = await glob("src/content/**/*.mdx");
    console.log(`Found ${files.length} local MDX files.`);

    for (const file of files) {
        const content = await fs.readFile(file, "utf-8");
        const { data: frontmatter, content: markdownBody } = matter(content);
        
        // Determine Slug from filename or frontmatter
        const filename = path.basename(file, ".mdx");
        const slug = frontmatter.slug || filename;
        
        // Determine Type based on folder
        let type = "Page";
        let urlPrefix = "docs"; // Default for generic pages
        
        // Normalize file path to forward slashes for consistent handling
        const normalizedFile = file.replace(/\\/g, '/');

        if (normalizedFile.includes("src/content/blog")) {
            type = "Blog";
            urlPrefix = "blog";
        }
        if (normalizedFile.includes("src/content/corso")) {
            type = "Course";
            urlPrefix = "corso"; // Based on sidebar config, course items are under /corso/category/slug? 
            // Actually, let's look at the file path to be precise.
            // file: src/content/corso/marketing/brand.mdx -> /corso/marketing/brand
            // But sidebar says: /corso/data-collection/event-tracking/
            // So we need to preserve the subdirectory structure for courses.
        }

        // Construct Live URL
        const baseUrl = SITE_URL;
        let livePath = "";
        
        // normalizedFile is already available here
        
        if (type === "Course") {
            // src/content/corso/marketing/brand.mdx -> marketing/brand
            // We want to capture the part AFTER src/content/corso/
            const match = normalizedFile.match(/src\/content\/corso\/(.*)\.mdx$/);
            if (match) {
                 livePath = `/corso/${match[1]}`;
            } else {
                 livePath = `/corso/${slug}`;
            }
        } else if (type === "Blog") {
            livePath = `/blog/${slug}`;
        } else {
            // Docs
            // src/content/docs/docs/guides/text-generation.mdx -> docs/guides/text-generation
            const match = normalizedFile.match(/src\/content\/docs\/(.*)\.mdx$/);
            if (match) {
                // Starlight maps src/content/docs/X -> /X
                // If match[1] is "docs/guides/text-generation", we want /docs/guides/text-generation
                // Wait, starlight config says src/content/docs -> /
                // So src/content/docs/index.mdx -> /
                // src/content/docs/guides/foo.mdx -> /guides/foo
                // My previous logic had relative path logic.
                livePath = `/${match[1]}`;
            } else {
                livePath = `/${slug}`;
            }
        }

        // Clean up double slashes just in case
        livePath = livePath.replace(/\/+/g, '/');
        const liveUrl = `${baseUrl}${livePath}`;

        console.log(`Processing: ${slug} (${type}) -> ${liveUrl}`);

        // Convert Markdown to Notion Blocks
        // Martian handles most MD syntax. We need to be careful with MDX components.
        // We'll treat MDX components as code blocks or plain text for now to avoid errors.
        const blocks = markdownToBlocks(markdownBody);

        // Helper to batch blocks (Notion allows max 100 blocks per request)
        const batchBlocks = (blocks: any[], size: number) => {
            const chunks = [];
            for (let i = 0; i < blocks.length; i += size) {
                chunks.push(blocks.slice(i, i + size));
            }
            return chunks;
        };

        const blockChunks = batchBlocks(blocks, 90); // Safe limit 90

        if (existingPages.has(slug)) {
            const pageId = existingPages.get(slug);
            console.log(`  -> Page exists (${pageId}). Updating metadata (Live URL)...`);
            
            // Update Live URL even if page exists
            try {
                await withRetry(() => client.pages.update({
                    page_id: pageId,
                    properties: {
                        "Live URL": {
                            url: liveUrl,
                        },
                    },
                }));
            } catch (e) {
                 console.error(`  -> Failed to update Live URL:`, e);
            }

            console.log(`  -> Metadata updated.`);
            continue;
        }

        // Create new page with content if it doesn't exist
        console.log(`  -> Creating new page...`);
        try {
            // Create page with first chunk
            const firstChunk = blockChunks[0] || [];
            
            const properties: any = {
                Name: { title: [{ text: { content: frontmatter.title || slug } }] },
                Slug: { rich_text: [{ text: { content: slug } }] },
                Type: { select: { name: type } },
                Status: { status: { name: "Published" } },
                "Live URL": { url: liveUrl },
            };
            if (frontmatter.description) properties.Summary = { rich_text: [{ text: { content: frontmatter.description } }] };
            if (frontmatter.date) properties.Date = { date: { start: new Date(frontmatter.date).toISOString() } };

            const response = await withRetry(() => client.pages.create({
                parent: { database_id: formattedDbId },
                properties: properties,
                children: firstChunk,
            }));

            // Append remaining chunks
            for (let i = 1; i < blockChunks.length; i++) {
                await withRetry(() => client.blocks.children.append({
                    block_id: response.id,
                    children: blockChunks[i],
                }));
            }
            console.log(`  -> Created successfully!`);
        } catch (e) {
            console.error(`  -> Failed to create:`, e);
        }
    }
}

push().catch(console.error);
