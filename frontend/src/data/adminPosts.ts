export interface AdminPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: 'writing' | 'tech';
  coverImageUrl: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

import { apiFetch } from "@/lib/api";
import { Post } from "./posts";

export async function fetchPosts(): Promise<AdminPost[]> {
  const res = await apiFetch<AdminPost[]>("/api/posts");
  return res.data ?? [];
}

export async function fetchPostById(id: string): Promise<AdminPost | null> {
  if (!id) return null;
  const res = await apiFetch<AdminPost>(`/api/posts/${id}`);
  return res.data ?? null;
}

export async function createPost(post: AdminPost): Promise<AdminPost> {
  const res = await apiFetch<AdminPost>("/api/posts", {
    method: "POST",
    body: JSON.stringify(post),
  });
  return res.data ?? post;
}

export async function updatePost(post: AdminPost): Promise<AdminPost> {
  const res = await apiFetch<AdminPost>(`/api/posts/${post.id}`, {
    method: "PUT",
    body: JSON.stringify(post),
  });
  return res.data ?? post;
}

export async function deletePost(id: string): Promise<void> {
  await apiFetch(`/api/posts/${id}`, { method: "DELETE" });
}

export async function fetchPostsPublic(): Promise<Post[]> {
  try {
    const res = await apiFetch<Post[]>("/public/posts");
    return res.data ?? [];
  } catch {
    return [];
  }
}
