import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const collections = {
  docs: defineCollection({ schema: docsSchema() }),
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
  corso: defineCollection({
    schema: z.object({
      title: z.string().trim().min(3, 'title is required'),
      description: z.string().trim().min(10, 'description is required'),
      category: z.string().trim().min(2, 'category must not be empty').optional(),
      order: z.number().int().positive('order must be a positive integer').optional(),
      image: z.string().trim().url('image must be a valid URL').optional(),
      slug: z.string().trim().regex(slugPattern, 'slug must use kebab-case').optional(),
    }),
  }),
};
