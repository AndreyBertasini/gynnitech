import { expect, test, describe } from "bun:test";
import { getLiveUrlInfo } from "../scripts/push-utils";
import { SITE_URL } from "../src/consts";

describe("getLiveUrlInfo", () => {
    test("returns correct URL for Course content", () => {
        const file = "src/content/corso/marketing/brand.mdx";
        const slug = "brand";
        const { url, type } = getLiveUrlInfo(file, slug);

        expect(type).toBe("Course");
        expect(url).toBe(`${SITE_URL}/course/marketing/brand`);
    });

    test("returns correct URL for Blog content", () => {
        const file = "src/content/blog/my-post.mdx";
        const slug = "my-post";
        const { url, type } = getLiveUrlInfo(file, slug);

        expect(type).toBe("Blog");
        expect(url).toBe(`${SITE_URL}/blog/my-post`);
    });

    test("returns correct URL for Docs content", () => {
        const file = "src/content/docs/guides/text-generation.mdx";
        const slug = "text-generation";
        const { url, type } = getLiveUrlInfo(file, slug);

        // Docs type is implied as default "Page" but logic in push-utils handles it
        // The default type in push-utils is "Page", but logic checks for matches.
        // Wait, push-utils sets type="Page" initially.
        // And checks normalizedFile.includes("src/content/blog") -> Blog
        // checks normalizedFile.includes("src/content/corso") -> Course
        // Otherwise it stays "Page".

        expect(type).toBe("Page");
        // And logic:
        // else { match docs... livePath = /match[1] }
        expect(url).toBe(`${SITE_URL}/guides/text-generation`);
    });
});
