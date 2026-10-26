import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export const base = import.meta.env.BASE_URL.replace(/\/$/, '');

// Published posts, newest first. Drafts are visible only in `astro dev`.
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

// "C++" -> "cpp", "Game Mechanics" -> "game-mechanics"
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\+/g, 'p')
    .replace(/#/g, 'sharp')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

// Groups posts by a label (category or tag), keeping the first spelling seen.
export function groupBy(posts: Post[], labels: (post: Post) => string[]) {
  const groups = new Map<string, { name: string; posts: Post[] }>();
  for (const post of posts) {
    for (const label of labels(post)) {
      const slug = slugify(label);
      if (!groups.has(slug)) groups.set(slug, { name: label, posts: [] });
      groups.get(slug)!.posts.push(post);
    }
  }
  return groups;
}

export const formatDate = (date: Date) => date.toISOString().slice(0, 10);

export function readingMinutes(body: string): number {
  const words = body.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export const postUrl = (post: Post) => `${base}/posts/${post.slug}`;
export const categoryUrl = (name: string) => `${base}/categories/${slugify(name)}`;
export const tagUrl = (name: string) => `${base}/tags/${slugify(name)}`;
