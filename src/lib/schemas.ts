import { z } from "zod";

export const blogSchema = z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.string(),
    author: z.string().default('GynniTech Team'),
    image: z.string().optional(),
});

export const corsoSchema = z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().optional(),
    category: z.string().optional(),
});

export const productsSchema = z.object({
    id: z.string(),
    name: z.string(),
    processedAt: z.string().datetime()
});
