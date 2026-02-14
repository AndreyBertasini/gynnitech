import { markdownToBlocks } from "@tryfabric/martian";
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { glob } from "glob";
import { getFormattedDatabaseId, getNotionClient } from "../src/lib/notion/client";
import { getLiveUrlInfo } from "./push-utils";


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
    let client;
    let formattedDbId;

    try {
        client = getNotionClient();
        formattedDbId = getFormattedDatabaseId();
    } catch (e: any) {
        console.error(e.message);
        process.exit(1);
    }

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
    let cursor: string | undefined = undefined;
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

        // Get Type and Live URL using shared utility
        const { type, url: liveUrl } = getLiveUrlInfo(file, slug);

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
                    block_id: (response as any).id,
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
