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
    // Title completo del tag <title> (≤ 60 caratteri). Se manca si usa `${title} | Articoli GinnyTech`.
    seoTitle: z.string().max(60).optional(),
    // noindex,follow: articolo corto (<800 parole) e quasi duplicato di un altro (vedi docs/seo/fase-2-*.csv).
    // Si toglie quando l'articolo viene ampliato o fuso con quello simile.
    noindex: z.boolean().optional(),
    // Solo blog-en: slug inglese pubblico e stato della revisione umana. Finché
    // translationReviewed non è true l'articolo non viene pubblicato: /en/blog/<slug-it>/
    // risponde 301 verso la versione italiana (vedi src/lib/i18n-pages.ts).
    enSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    translationReviewed: z.boolean().default(false),
    reviewedBy: z.string().optional(),
    reviewedAt: z.coerce.date().optional(),
});

export const corsoSchema = z.object({
    title: z.string(),
    description: z.string(),
    binario: z.enum(['ml-tabellare', 'sistemi-llm']).optional(),
    draft: z.boolean().optional(),
    noindex: z.boolean().optional(),
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
