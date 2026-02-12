export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: "writing" | "tech";
  coverImage: string;
  readTime: string;
}

import { fetchPostsPublic } from "./adminPosts";

export const posts: Post[] = [];

type PostApi = {
  slug: string;
  title?: string;
  excerpt?: string;
  content?: string;
  updatedAt?: string;
  createdAt?: string;
  category?: Post["category"];
  coverImageUrl?: string;
};

let cachedPosts: Post[] | null = null;
let inflight: Promise<Post[]> | null = null;

type EditorNode = {
  text?: string;
  content?: EditorNode[];
};

const extractText = (node: EditorNode | EditorNode[] | null): string => {
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractText).join(" ");
  const parts: string[] = [];
  if (node.text) parts.push(node.text);
  if (node.content) parts.push(extractText(node.content));
  return parts.join(" ");
};

const computeReadTime = (content: string) => {
  let text = content || "";
  try {
    const parsed = JSON.parse(content) as EditorNode | { content?: EditorNode[] };
    text = extractText(Array.isArray(parsed) ? parsed : parsed?.content ?? parsed) || text;
  } catch {
    // fall back to raw content when JSON parse fails
  }
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
};

const mapPost = (p: PostApi): Post => ({
  slug: p.slug,
  title: p.title ?? "",
  excerpt: p.excerpt ?? "",
  content: p.content ?? "",
  date: p.updatedAt || p.createdAt || new Date().toISOString(),
  category: p.category ?? "tech",
  coverImage: p.coverImageUrl ?? "",
  readTime: computeReadTime(p.content ?? ""),
});

export async function loadPosts(force = false): Promise<Post[]> {
  if (cachedPosts && !force) return cachedPosts;
  if (inflight && !force) return inflight;

  inflight = (async () => {
    try {
      const data = await fetchPostsPublic();
      cachedPosts = (data ?? []).map(mapPost);
      return cachedPosts;
    } catch {
      cachedPosts = [];
      return [];
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export const getPostBySlug = async (slug: string): Promise<Post | undefined> => {
  const data = await loadPosts();
  return data.find((post) => post.slug === slug);
};

export const getRelatedPosts = async (currentSlug: string, limit: number = 3): Promise<Post[]> => {
  const data = await loadPosts();
  return data.filter((post) => post.slug !== currentSlug).slice(0, limit);
};
