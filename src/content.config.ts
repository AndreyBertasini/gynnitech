import { defineCollection, z } from 'astro:content';

import { glob, file } from 'astro/loaders';

export const collections = {

    blog: defineCollection({
        loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog", retainBody: false }),
        schema: z.object({
            title: z.string(),
            description: z.string(),
            date: z.coerce.date(),
            category: z.string(),
            author: z.string().default('GynniTech Team'),
            image: z.string().optional(),
        }),
    }),
    corso: defineCollection({
        loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/corso", retainBody: false }),
        schema: z.object({
            title: z.string(),
            description: z.string(),
            order: z.number().optional(),
        }),
    }),
    // Example of async parser usage
    products: defineCollection({
        loader: file('src/data/products.json', {
            parser: async (text) => {
                const products = JSON.parse(text);
                // Simulate async processing
                return await Promise.all(products.map(async (p) => ({
                    ...p,
                    processedAt: new Date().toISOString()
                })));
            }
        }),
        schema: z.object({
            id: z.string(),
            name: z.string(),
            processedAt: z.string()
        })
    })
};
