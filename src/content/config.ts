import { defineCollection, z } from 'astro:content';

// NOTE: 'docs' collection is managed internally by Starlight (Content Layer API).
// Do NOT define it here — doing so overrides Starlight's loader with an empty
// legacy collection, breaking getCollection('docs') and all lesson pages.

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const collections = {
  blog: defineCollection({
    schema: z.object({
      title: z.string().trim().min(3, 'title is required'),
      description: z.string().trim().min(10, 'description is required'),
      date: z.coerce.date(),
      category: z.string().trim().min(2, 'category is required'),
      author: z.string().trim().min(2).optional(),
      image: z.string().trim().url('image must be a valid URL').optional(),
      slug: z.string().trim().regex(slugPattern, 'slug must use kebab-case').optional(),
    }),
  }),
};
