import { describe, expect, test } from "vitest";
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
                 expect(result.data.author).toBe("Andrii Dyshkantiuk");
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

        test("coerces date strings correctly", () => {
            const valid = {
                title: "Test Post",
                description: "Test Description",
                date: "2023-01-01T10:00:00Z",
                category: "Test Category",
            };
            const result = blogSchema.safeParse(valid);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.date).toBeInstanceOf(Date);
                expect(result.data.date.toISOString()).toBe("2023-01-01T10:00:00.000Z");
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
                const errorFields = new Set(result.error.issues.map((issue) => issue.path[0]));
                expect(errorFields.has("description")).toBe(true);
                expect(errorFields.has("date")).toBe(true);
                expect(errorFields.has("category")).toBe(true);
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

        test("validates valid corso item with category", () => {
            const valid = {
                title: "Lesson 1",
                description: "Intro",
                category: "Fondamenti"
            };
            const result = corsoSchema.safeParse(valid);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.category).toBe("Fondamenti");
            }
        });

        test("validates valid corso item without order and category", () => {
             const valid = {
                title: "Lesson 1",
                description: "Intro"
            };
            const result = corsoSchema.safeParse(valid);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.order).toBeUndefined();
                expect(result.data.category).toBeUndefined();
            }
        });

        test("validates corso item with extended learning metadata", () => {
            const valid = {
                title: "Lesson 1",
                description: "Intro",
                module: "Modulo 1",
                category: "Fondamenti",
                prerequisites: ["data-collection/introduction"],
                duration: "35 min",
                difficulty: "intermediate",
                learningObjectives: [
                    "Capire i concetti base",
                    "Applicare il metodo su un caso reale",
                ],
            };
            const result = corsoSchema.safeParse(valid);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.prerequisites?.[0]).toBe("data-collection/introduction");
                expect(result.data.difficulty).toBe("intermediate");
                expect(result.data.learningObjectives?.length).toBe(2);
            }
        });

        test("invalidates unsupported difficulty values", () => {
            const invalid = {
                title: "Lesson 1",
                description: "Intro",
                difficulty: "expert",
            };
            const result = corsoSchema.safeParse(invalid);
            expect(result.success).toBe(false);
        });

        test("invalidates missing fields", () => {
             const invalid = {
                title: "Lesson 1"
            };
            const result = corsoSchema.safeParse(invalid);
            expect(result.success).toBe(false);
        });

        test("accetta formato \"articolo\"", () => {
                    const result = corsoSchema.safeParse({ title: "Lesson 1", description: "Intro", formato: "articolo" });
                    expect(result.success).toBe(true);
                    if (result.success) {
                        expect(result.data.formato).toBe("articolo");
                    }
                });

                test("accetta senzaCodice: true e rifiuta un valore che non è booleano", () => {
                    const base = { title: "Lesson 1", description: "Intro", formato: "articolo" };
                    const ok = corsoSchema.safeParse({ ...base, senzaCodice: true });
                    expect(ok.success).toBe(true);
                    if (ok.success) expect(ok.data.senzaCodice).toBe(true);
                    expect(corsoSchema.safeParse({ ...base, senzaCodice: "si" }).success).toBe(false);
                });

                test("rifiuta formato \"3s\"", () => {
                    expect(corsoSchema.safeParse({ title: "Lesson 1", description: "Intro", formato: "3s" }).success).toBe(false);
                });

                test("rifiuta formato \"slide\"", () => {
                    expect(corsoSchema.safeParse({ title: "Lesson 1", description: "Intro", formato: "slide" }).success).toBe(false);
                });
    });

    describe("productsSchema", () => {
         test("validates valid product with ISO datetime", () => {
            const valid = {
                id: "p1",
                name: "Product 1",
                processedAt: "2023-01-01T00:00:00Z"
            };
            const result = productsSchema.safeParse(valid);
            expect(result.success).toBe(true);
        });

        test("invalidates invalid datetime string", () => {
            const invalid = {
                id: "p1",
                name: "Product 1",
                processedAt: "2023-01-01" // Not a full ISO datetime (requires time part for strict datetime usually?)
            };
            // z.string().datetime() expects ISO 8601 with time
            const result = productsSchema.safeParse(invalid);
            expect(result.success).toBe(false);
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
