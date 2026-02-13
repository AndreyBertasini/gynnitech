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

export const getFormattedDatabaseId = () => {
    const dbId = getDatabaseId();
    return dbId.length === 32
        ? `${dbId.slice(0, 8)}-${dbId.slice(8, 12)}-${dbId.slice(12, 16)}-${dbId.slice(16, 20)}-${dbId.slice(20)}`
        : dbId;
};
