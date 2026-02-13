import { describe, it, expect } from "bun:test";
import { NotionParser } from "./parser";
import type { NotionPageProperties } from "./types";

describe("NotionParser", () => {
    // Mock client is not used by extractMetadata, so we can cast an empty object
    const parser = new NotionParser({} as any);

    const createMockPage = (properties: Partial<NotionPageProperties> = {}, id = "test-id") => ({
        id,
        last_edited_time: "2023-01-01T00:00:00.000Z",
        properties: {
            Name: { title: [{ plain_text: "Test Page" }] },
            Slug: { rich_text: [{ plain_text: "test-slug" }] },
            Type: { select: { name: "Page" } },
            Status: { select: { name: "Draft" } }, // Default mock uses select to match current implementation
            Date: { date: { start: "2023-01-01" } },
            Summary: { rich_text: [{ plain_text: "Test Summary" }] },
            Category: { select: { name: "Test Category" } },
            Tags: { multi_select: [{ name: "Tag1" }, { name: "Tag2" }] },
            Author: { people: [{ name: "Test Author" }] },
            Image: { files: [] },
            MenuVisibility: { checkbox: false },
            Order: { number: 1 },
            ...properties,
        },
    });

    describe("extractMetadata", () => {
        it("should extract standard metadata correctly", () => {
            const mockPage = createMockPage();
            const metadata = parser.extractMetadata(mockPage);

            expect(metadata).toEqual({
                title: "Test Page",
                slug: "test-slug",
                type: "Page",
                status: "Draft",
                date: "2023-01-01",
                description: "Test Summary",
                category: "Test Category",
                tags: ["Tag1", "Tag2"],
                author: "Test Author",
                image: undefined,
                inMenu: false,
                order: 1,
                notionId: "test-id",
                lastEdited: "2023-01-01T00:00:00.000Z",
            });
        });

        it("should handle missing slug by falling back to ID", () => {
            const mockPage = createMockPage({
                Slug: { rich_text: [] }
            });
            const metadata = parser.extractMetadata(mockPage);
            expect(metadata.slug).toBe("test-id");
        });

        it("should handle missing optional fields with defaults", () => {
            const mockPage = {
                id: "test-id",
                last_edited_time: "2023-01-01T00:00:00.000Z",
                properties: {
                    Name: { title: [] }, // Untitled
                    // Missing Slug -> ID
                    // Missing Type -> Page
                    // Missing Status -> Draft
                    // Missing Date -> Current Date (mocked?) or just check it's a string
                    // Missing Summary -> ""
                    // Missing Category -> undefined
                    // Missing Tags -> []
                    // Missing Author -> GynniTech Team
                    // Missing Image -> undefined
                    // Missing MenuVisibility -> false
                    // Missing Order -> 0
                }
            };

            const metadata = parser.extractMetadata(mockPage);

            expect(metadata.title).toBe("Untitled");
            expect(metadata.slug).toBe("test-id");
            expect(metadata.type).toBe("Page"); // default
            expect(metadata.status).toBe("Draft"); // default
            expect(metadata.description).toBe("");
            expect(metadata.category).toBeUndefined();
            expect(metadata.tags).toEqual([]);
            expect(metadata.author).toBe("GynniTech Team");
            expect(metadata.inMenu).toBe(false);
            expect(metadata.order).toBe(0);
        });

        it("should extract Author from people array", () => {
            const mockPage = createMockPage({
                Author: { people: [{ name: "Person Author" }] }
            });
            expect(parser.extractMetadata(mockPage).author).toBe("Person Author");
        });

        it("should extract Author from rich_text fallback", () => {
            const mockPage = createMockPage({
                Author: { rich_text: [{ plain_text: "Text Author" }] } as any // verify fallback handling
            });
            expect(parser.extractMetadata(mockPage).author).toBe("Text Author");
        });

        it("should extract Image from file url", () => {
            const mockPage = createMockPage({
                Image: { files: [{ file: { url: "https://example.com/image.png" } }] } as any
            });
            expect(parser.extractMetadata(mockPage).image).toBe("https://example.com/image.png");
        });

        it("should extract Image from external url", () => {
            const mockPage = createMockPage({
                Image: { files: [{ external: { url: "https://example.com/external.png" } }] } as any
            });
            expect(parser.extractMetadata(mockPage).image).toBe("https://example.com/external.png");
        });

        it("should correctly extract Status from 'status' property (Notion API standard)", () => {
            const mockPage = createMockPage({
                Status: { status: { name: "Published" } } as any
            });
            expect(parser.extractMetadata(mockPage).status).toBe("Published");
        });

        it("should correctly extract Status from 'select' property (Legacy/Alternative)", () => {
            const mockPage = createMockPage({
                Status: { select: { name: "Scheduled" } } as any
            });
            expect(parser.extractMetadata(mockPage).status).toBe("Scheduled");
        });
    });
});
