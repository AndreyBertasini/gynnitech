import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

// Load environment variables if running in Node (scripts)
if (typeof process !== 'undefined' && process.env) {
    dotenv.config();
}

export const getNotionClient = () => {
    const token = process.env.NOTION_TOKEN;
    if (!token) {
        throw new Error("Missing NOTION_TOKEN environment variable");
    }
    // Explicitly handle default export vs named export
    const NotionClient = (Client as any).Client || Client;
    return new NotionClient({ auth: token });
};

export const getDatabaseId = () => {
    const dbId = process.env.NOTION_DATABASE_ID;
    if (!dbId) {
        throw new Error("Missing NOTION_DATABASE_ID environment variable");
    }
    return dbId;
};
