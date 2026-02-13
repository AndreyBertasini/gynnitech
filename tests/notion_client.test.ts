import { describe, expect, test, beforeEach, afterEach, mock } from "bun:test";
import { getFormattedDatabaseId, getNotionClient } from "../src/lib/notion/client";

// Mock environment variables
const ORIGINAL_ENV = process.env;

describe("Notion Client Utils", () => {
    beforeEach(() => {
        process.env = { ...ORIGINAL_ENV };
    });

    afterEach(() => {
        process.env = ORIGINAL_ENV;
    });

    describe("getFormattedDatabaseId", () => {
        test("should throw error if NOTION_DATABASE_ID is missing", () => {
            delete process.env.NOTION_DATABASE_ID;
            expect(() => getFormattedDatabaseId()).toThrow("Missing NOTION_DATABASE_ID");
        });

        test("should return formatted UUID when length is 32", () => {
            process.env.NOTION_DATABASE_ID = "12345678123412341234123456789012";
            const expected = "12345678-1234-1234-1234-123456789012";
            expect(getFormattedDatabaseId()).toBe(expected);
        });

        test("should return ID as is when length is not 32", () => {
            process.env.NOTION_DATABASE_ID = "already-formatted-id";
            expect(getFormattedDatabaseId()).toBe("already-formatted-id");
        });
    });

    describe("getNotionClient", () => {
        test("should throw error if NOTION_TOKEN is missing", () => {
            delete process.env.NOTION_TOKEN;
            expect(() => getNotionClient()).toThrow("Missing NOTION_TOKEN");
        });

        test("should return a Client instance when token is present", () => {
            process.env.NOTION_TOKEN = "secret_testtoken";
            const client = getNotionClient();
            expect(client).toBeDefined();
            // Verify it has methods expected on Client
            expect(typeof client.request).toBe("function");
        });
    });
});
