import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { Client } = require("@notionhq/client");

import { NotionParser } from "../src/lib/notion/parser";
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import dotenv from "dotenv";

dotenv.config();

// Retry Helper
async function withRetry<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
        return await operation();
    } catch (error: any) {
        if (retries <= 0) throw error;
        
        // Check for rate limit (429) or temporary server errors (5xx)
        if (error.status === 429 || (error.status >= 500 && error.status < 600)) {
            const waitTime = error.headers?.["retry-after"] 
                ? parseInt(error.headers["retry-after"]) * 1000 
                : delay;
            
            console.log(`Rate limited or server error. Retrying in ${waitTime}ms... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return withRetry(operation, retries - 1, delay * 2); // Exponential backoff
        }
        
        throw error;
    }
}

async function sync() {
    const token = process.env.NOTION_TOKEN;
    const dbId = process.env.NOTION_DATABASE_ID;

    if (!token || !dbId) {
        console.error("Missing NOTION_TOKEN or NOTION_DATABASE_ID");
        process.exit(1);
    }

    // Format DB ID to UUID if it's not already (insert dashes)
    const formattedDbId = dbId.length === 32 
        ? `${dbId.slice(0, 8)}-${dbId.slice(8, 12)}-${dbId.slice(12, 16)}-${dbId.slice(16, 20)}-${dbId.slice(20)}`
        : dbId;

    // Direct instantiation with imported Class
    const client = new Client({ auth: token });
    
    const parser = new NotionParser(client);

    console.log(`Syncing from Notion Database: ${formattedDbId}`);

    // Verify client connection
    try {
        const me = await client.users.me({});
        console.log("Notion Connected as:", me.bot ? "Bot" : "User");
    } catch (e) {
        console.error("Failed to authenticate with Notion:", e);
        process.exit(1);
    }

    // Use client.request directly because databases.query seems missing in this version
    
    // First, try to retrieve the database to verify ID and permissions
    try {
        const db = await client.databases.retrieve({ database_id: formattedDbId });
        console.log(`Database retrieved successfully: ${db.title[0]?.plain_text || "Untitled"}`);
    } catch (e) {
        console.error("Failed to retrieve database. Please check ID and permissions.", e);
        process.exit(1);
    }

    // Use standard client.databases.query (should be available in v2.2.15)
    console.log("Querying database...");
    const response = await withRetry(() => client.databases.query({
        database_id: formattedDbId,
        filter: {
            property: "Status",
            status: {
                equals: "Published",
            },
        },
    }));

    console.log(`Found ${response.results.length} published items.`);

    const menuItems: any[] = [];

    for (const page of response.results) {
        // Use retry for content fetching too (fetching children blocks can hit rate limits)
        const metadata = parser.extractMetadata(page);
        const content = await withRetry(() => parser.getPageContent(page.id));
        
        // Frontmatter construction
        const frontmatter: any = {
            title: metadata.title,
            description: metadata.description,
            date: metadata.date,
        };

        if (metadata.author) frontmatter.author = metadata.author;
        if (metadata.image) frontmatter.image = metadata.image;
        if (metadata.category) frontmatter.category = metadata.category;
        if (metadata.tags && metadata.tags.length > 0) frontmatter.tags = metadata.tags;
        if (metadata.order) frontmatter.order = metadata.order;
        
        // Notion ID for back-sync reference
        frontmatter.notionId = metadata.notionId;

        const fileContent = matter.stringify(content, frontmatter);

        // Determine path
        let outDir = "";
        let collection = "";
        let moduleDir = "";
        
        switch (metadata.type) {
            case "Blog":
                outDir = "src/content/blog";
                collection = "blog";
                break;
            case "Course":
                // Determine module from category
                moduleDir = "data-collection"; // Default
                if (metadata.category) {
                    const norm = metadata.category.toLowerCase().trim();
                    if (norm.includes('marketing') || norm.includes('strategia')) moduleDir = 'marketing-data-science';
                    else if (norm.includes('infrastructure') || norm.includes('ops')) moduleDir = 'infrastructure-ops';
                    else if (norm.includes('warehousing') || norm.includes('sql') || norm.includes('db')) moduleDir = 'data-warehousing';
                    else if (norm.includes('real-time') || norm.includes('streaming')) moduleDir = 'real-time-analytics';
                    else if (norm.includes('engineering') || norm.includes('analytics')) moduleDir = 'analytics-engineering';
                    else if (norm.includes('collection') || norm.includes('tracking') || norm.includes('getting started')) moduleDir = 'data-collection';
                }
                
                outDir = `src/content/corso/${moduleDir}`;
                collection = "corso";
                break;
            default: // Page
                outDir = "src/content/docs";
                collection = "docs";
                break;
        }

        // Ensure directory exists (handling nested slugs)
        const fullPath = path.join(process.cwd(), outDir, `${metadata.slug}.mdx`);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        
        await fs.writeFile(fullPath, fileContent);
        console.log(`Synced: ${metadata.title} -> ${fullPath}`);

        // Sidebar logic
        if (metadata.inMenu) {
            // Remove leading slash from slug if present to avoid double slashes
            const cleanSlug = metadata.slug.startsWith('/') ? metadata.slug.substring(1) : metadata.slug;
            
            let link = `/${collection}/${cleanSlug}`;
            if (collection === 'corso') {
                link = `/course/${moduleDir}/${cleanSlug}`;
            }

            menuItems.push({
                label: metadata.title,
                link: link, 
                order: metadata.order || 99,
            });
        }
    }

    // Sort and write sidebar
    menuItems.sort((a, b) => a.order - b.order);
    const sidebarPath = path.join(process.cwd(), "src/data/sidebar-generated.json");
    await fs.mkdir(path.dirname(sidebarPath), { recursive: true });
    
    // We only write the items array. The config will wrap it if needed.
    await fs.writeFile(sidebarPath, JSON.stringify(menuItems, null, 2));
    console.log(`Sidebar updated: ${sidebarPath}`);
}

sync().catch(console.error);
