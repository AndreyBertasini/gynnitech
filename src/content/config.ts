import { defineCollection, z } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({ schema: docsSchema() }),
  blog: defineCollection({
    schema: z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      category: z.string(),
      author: z.string().optional(),
      image: z.string().optional(),
    }),
  }),
  corso: defineCollection({
    schema: z.object({
      title: z.string(),
      description: z.string(),
      category: z.string().optional(),
      order: z.number().optional(),
      image: z.string().optional(), // Added for social sharing customization
    }),
  }),
};
