import { z } from "zod";

export const blogSchema = z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.string(),
    author: z.string().default('Andrii Dyshkantiuk'),
    image: z.string().optional(),
});

export const corsoSchema = z.object({
    title: z.string(),
    description: z.string(),
    module: z.string().optional(),
    order: z.number().optional(),
    category: z.string().optional(),
    prerequisites: z.array(z.string()).optional(),
    duration: z.string().optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'base', 'intermedio', 'avanzato']).optional(),
    learningObjectives: z.array(z.string()).optional(),
});

export const productsSchema = z.object({
    id: z.string(),
    name: z.string(),
    processedAt: z.string().datetime()
});
