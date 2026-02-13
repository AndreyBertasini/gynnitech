import { describe, expect, test } from "bun:test";
import { NotionParser } from "../src/lib/notion/parser";
import type { Client } from "@notionhq/client";

// Mock client
const mockClient = {} as unknown as Client;
const parser = new NotionParser(mockClient);

describe("NotionParser Metadata Extraction", () => {

    test("should extract full metadata correctly", () => {
        const mockPage = {
            id: "page-id-123",
            last_edited_time: "2023-10-27T10:00:00.000Z",
            properties: {
                Name: { title: [{ plain_text: "My Page Title" }] },
                Slug: { rich_text: [{ plain_text: "my-page-slug" }] },
                Type: { select: { name: "Page" } },
                Status: { status: { name: "Published" } },
                Date: { date: { start: "2023-10-27" } },
                Summary: { rich_text: [{ plain_text: "A short summary." }] },
                Category: { select: { name: "Tech" } },
                Tags: { multi_select: [{ name: "tag1" }, { name: "tag2" }] },
                Author: { people: [{ name: "John Doe" }] },
                Image: { files: [{ file: { url: "https://example.com/image.png" } }] },
                MenuVisibility: { checkbox: true },
                Order: { number: 5 }
            }
        };

        const result = parser.extractMetadata(mockPage);

        expect(result).toEqual({
            title: "My Page Title",
            slug: "my-page-slug",
            type: "Page",
            status: "Published",
            date: "2023-10-27",
            description: "A short summary.",
            category: "Tech",
            tags: ["tag1", "tag2"],
            author: "John Doe",
            image: "https://example.com/image.png",
            inMenu: true,
            order: 5,
            notionId: "page-id-123",
            lastEdited: "2023-10-27T10:00:00.000Z"
        });
    });

    test("should fallback to defaults when properties are missing", () => {
        const mockPage = {
            id: "page-id-456",
            last_edited_time: "2023-10-28T10:00:00.000Z",
            properties: {
                // Empty or missing properties
            }
        };

        const result = parser.extractMetadata(mockPage);

        expect(result.title).toBe("Untitled");
        expect(result.slug).toBe("page-id-456"); // Fallback to ID
        expect(result.author).toBe("GynniTech Team"); // Default author
        expect(result.inMenu).toBe(false); // Default checkbox
        expect(result.order).toBe(0); // Default number
        expect(result.tags).toEqual([]); // Default empty array
        expect(result.category).toBeUndefined();
        expect(result.image).toBeUndefined();
        // Date fallback is dynamic (new Date().toISOString()), so we check type or existence
        expect(result.date).toBeDefined();
    });

    test("should extract author from rich_text if people property is empty", () => {
        const mockPage = {
            id: "page-id-789",
            last_edited_time: "2023-10-29T10:00:00.000Z",
            properties: {
                Author: { rich_text: [{ plain_text: "Jane Smith" }] }
            }
        };

        const result = parser.extractMetadata(mockPage);
        expect(result.author).toBe("Jane Smith");
    });

    test("should prefer status property over select property for Status", () => {
        const mockPage = {
            id: "page-id-101",
            last_edited_time: "2023-10-30T10:00:00.000Z",
            properties: {
                Status: {
                    status: { name: "Published" },
                    select: { name: "Draft" } // Should be ignored if status is present
                }
            }
        };

        const result = parser.extractMetadata(mockPage);
        expect(result.status).toBe("Published");
    });

    test("should fallback to select property for Status if status property is missing", () => {
        const mockPage = {
            id: "page-id-102",
            last_edited_time: "2023-10-31T10:00:00.000Z",
            properties: {
                Status: {
                    select: { name: "Draft" }
                }
            }
        };

        const result = parser.extractMetadata(mockPage);
        expect(result.status).toBe("Draft");
    });

    test("should extract image from external URL", () => {
        const mockPage = {
            id: "page-id-103",
            last_edited_time: "2023-11-01T10:00:00.000Z",
            properties: {
                Image: {
                    files: [{ external: { url: "https://external.com/image.jpg" } }]
                }
            }
        };

        const result = parser.extractMetadata(mockPage);
        expect(result.image).toBe("https://external.com/image.jpg");
    });
});
