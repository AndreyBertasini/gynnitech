import { z } from "astro/zod";

export const faqSchemaEntry = z.object({
    question: z.string(),
    answer: z.string(),
});

export const blogSchema = z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    dateModified: z.coerce.date().optional(),
    category: z.string(),
    author: z.string().default('Andrii Dyshkantiuk'),
    image: z.string().optional(),
    faqSchema: z.array(faqSchemaEntry).optional(),
});

export const corsoSchema = z.object({
    title: z.string(),
    description: z.string(),
    binario: z.enum(['ml-tabellare', 'sistemi-llm']).optional(),
    draft: z.boolean().optional(),
    autore: z.string().optional(),
    controllatoDa: z.string().optional(),
    autorizzatoDa: z.string().optional(),
    module: z.string().optional(),
    order: z.number().optional(),
    category: z.string().optional(),
    dateModified: z.coerce.date().optional(),
    headerImage: z.string().optional(),
    headerImageAlt: z.string().optional(),
    prerequisites: z.array(z.string()).optional(),
    duration: z.string().optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'base', 'intermedio', 'avanzato']).optional(),
    learningObjectives: z.array(z.string()).optional(),
    formato: z.enum(['articolo', 'didattica-v2']).optional(),
        senzaCodice: z.boolean().optional(),
});

export const productsSchema = z.object({
    id: z.string(),
    name: z.string(),
    processedAt: z.iso.datetime()
});
