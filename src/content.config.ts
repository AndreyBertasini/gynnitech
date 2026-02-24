import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { blogSchema, productsSchema } from './lib/schemas';

export const collections = {
    // Starlight docs — MUST use docsLoader() in Astro 5 Content Layer API.
    // All lessons live in src/content/docs/course/[module]/[slug].mdx
    docs: defineCollection({
        loader: docsLoader(),
        schema: docsSchema(),
    }),

    blog: defineCollection({
        loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
        schema: blogSchema,
    }),

    products: defineCollection({
        loader: file('src/data/products.json', {
            parser: async (text) => {
                const products = JSON.parse(text);
                return await Promise.all(products.map(async (p: any) => ({
                    ...p,
                    processedAt: new Date().toISOString()
                })));
            }
        }),
        schema: productsSchema
    })
};
