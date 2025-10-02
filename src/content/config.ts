import { z, defineCollection } from "astro:content";

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    year: z.number(),
    tech: z.array(z.string()),
    summary: z.string(),
    repoUrl: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    highlights: z.array(z.string()).optional(),
  }),
});

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    publishedAt: z.string(),
    tags: z.array(z.string()).default([]),
    summary: z.string(),
    readingTime: z.number().optional(),
  }),
});

export const collections = { projects, blog };