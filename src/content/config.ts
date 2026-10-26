import { defineCollection, z } from 'astro:content';

// Frontmatter contract for every post in src/content/posts/*.md.
// See src/content/posts/_template.md for a copy-paste starter.
const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
