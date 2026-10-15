import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { blogSchema, corsoSchema, productsSchema } from './lib/schemas';

type ProductInput = {
    id: string;
    name: string;
};

const isProductInputArray = (value: unknown): value is ProductInput[] =>
    Array.isArray(value) &&
    value.every((product) =>
        typeof product === 'object' &&
        product !== null &&
        typeof (product as ProductInput).id === 'string' &&
        typeof (product as ProductInput).name === 'string'
    );

export const collections = {
    docs: defineCollection({
        loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/_starlight" }),
        schema: docsSchema(),
    }),

    blog: defineCollection({
        loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog", retainBody: true }),
        schema: blogSchema,
    }),
    blogEn: defineCollection({
        loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog-en", retainBody: true }),
        schema: blogSchema,
    }),
    corso: defineCollection({
        loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/corso", retainBody: true }),
        schema: corsoSchema,
    }),
    // Validate raw JSON before adding runtime metadata.
    products: defineCollection({
        loader: file('src/data/products.json', {
            parser: (text) => {
                const products = JSON.parse(text) as unknown;
                if (!isProductInputArray(products)) {
                    throw new Error('src/data/products.json must contain an array of products with id and name.');
                }

                return products.map((product) => ({
                    ...product,
                    processedAt: new Date().toISOString()
                }));
            }
        }),
        schema: productsSchema
    })
};
