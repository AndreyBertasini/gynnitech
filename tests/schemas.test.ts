import { describe, test, expect } from "bun:test";
import { blogSchema, corsoSchema, productsSchema } from "../src/lib/schemas";

describe("Content Schemas", () => {
    describe("blogSchema", () => {
        test("validates valid blog post", () => {
            const valid = {
                title: "Test Post",
                description: "Test Description",
                date: "2023-01-01",
                category: "Test Category",
            };
            const result = blogSchema.safeParse(valid);
            expect(result.success).toBe(true);
            if (result.success) {
                 expect(result.data.author).toBe("GynniTech Team");
                 expect(result.data.date).toBeInstanceOf(Date);
            }
        });

        test("validates valid blog post with all fields", () => {
             const valid = {
                title: "Test Post",
                description: "Test Description",
                date: new Date(),
                category: "Test Category",
                author: "Custom Author",
                image: "/path/to/image.png"
            };
            const result = blogSchema.safeParse(valid);
            expect(result.success).toBe(true);
            if (result.success) {
                 expect(result.data.author).toBe("Custom Author");
                 expect(result.data.image).toBe("/path/to/image.png");
            }
        });

        test("invalidates missing required fields", () => {
            const invalid = {
                title: "Test Post",
                // Missing description, date, category
            };
            const result = blogSchema.safeParse(invalid);
            expect(result.success).toBe(false);
            if (!result.success) {
                const errors = result.error.flatten().fieldErrors;
                expect(errors.description).toBeDefined();
                expect(errors.date).toBeDefined();
                expect(errors.category).toBeDefined();
            }
        });

        test("invalidates wrong types", () => {
            const invalid = {
                title: 123,
                description: "Desc",
                date: "not-a-date",
                category: "Cat"
            };
             const result = blogSchema.safeParse(invalid);
             expect(result.success).toBe(false);
        });
    });

    describe("corsoSchema", () => {
        test("validates valid corso item", () => {
            const valid = {
                title: "Lesson 1",
                description: "Intro",
                order: 1
            };
            const result = corsoSchema.safeParse(valid);
            expect(result.success).toBe(true);
        });

        test("validates valid corso item without order", () => {
             const valid = {
                title: "Lesson 1",
                description: "Intro"
            };
            const result = corsoSchema.safeParse(valid);
            expect(result.success).toBe(true);
        });

        test("invalidates missing fields", () => {
             const invalid = {
                title: "Lesson 1"
            };
            const result = corsoSchema.safeParse(invalid);
            expect(result.success).toBe(false);
        });
    });

    describe("productsSchema", () => {
         test("validates valid product", () => {
            const valid = {
                id: "p1",
                name: "Product 1",
                processedAt: "2023-01-01T00:00:00Z"
            };
            const result = productsSchema.safeParse(valid);
            expect(result.success).toBe(true);
        });

        test("invalidates missing fields", () => {
             const invalid = {
                id: "p1"
            };
            const result = productsSchema.safeParse(invalid);
            expect(result.success).toBe(false);
        });
    });
});
