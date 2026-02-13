import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { blogSchema, corsoSchema, productsSchema } from './lib/schemas';

export const collections = {

    blog: defineCollection({
        loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog", retainBody: false }),
        schema: blogSchema,
    }),
    corso: defineCollection({
        loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/corso", retainBody: false }),
        schema: corsoSchema,
    }),
    // Example of async parser usage
    products: defineCollection({
        loader: file('src/data/products.json', {
            parser: async (text) => {
                const products = JSON.parse(text);
                // Simulate async processing
                return await Promise.all(products.map(async (p: any) => ({
                    ...p,
                    processedAt: new Date().toISOString()
                })));
            }
        }),
        schema: productsSchema
    })
};
