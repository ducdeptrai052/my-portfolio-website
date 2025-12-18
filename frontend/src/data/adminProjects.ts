export interface AdminProject {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  tags: string[];
  thumbnailUrl: string;
  links: {
    github?: string;
    demo?: string;
  };
  featured?: boolean;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

import { apiFetch } from "@/lib/api";
import { uploadAvatar } from "./siteSettings";

type ProjectApi = {
  id: string;
  title?: string;
  slug?: string;
  shortDescription?: string;
  fullDescription?: string;
  tags?: string[];
  thumbnailUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  links?: {
    github?: string;
    demo?: string;
  };
  featured?: boolean;
  status?: "draft" | "published";
  createdAt?: string;
  updatedAt?: string;
};

const mapProject = (p: ProjectApi): AdminProject => ({
  id: p.id,
  title: p.title ?? "",
  slug: p.slug ?? "",
  shortDescription: p.shortDescription ?? "",
  fullDescription: p.fullDescription ?? "",
  tags: p.tags ?? [],
  thumbnailUrl: p.thumbnailUrl ?? "",
  links: {
    github: p.links?.github ?? p.githubUrl ?? "",
    demo: p.links?.demo ?? p.demoUrl ?? "",
  },
  featured: p.featured ?? false,
  status: p.status ?? "draft",
  createdAt: p.createdAt ?? new Date().toISOString(),
  updatedAt: p.updatedAt ?? new Date().toISOString(),
});

export async function fetchProjects(): Promise<AdminProject[]> {
  const res = await apiFetch<AdminProject[]>("/api/projects");
  return (res.data ?? []).map(mapProject);
}

export async function fetchProjectById(id: string): Promise<AdminProject | null> {
  if (!id) return null;
  const res = await apiFetch<AdminProject>(`/api/projects/${id}`);
  return res.data ? mapProject(res.data) : null;
}

export async function createProject(project: AdminProject): Promise<AdminProject> {
  const res = await apiFetch<AdminProject>("/api/projects", {
    method: "POST",
    body: JSON.stringify(project),
  });
  return res.data ? mapProject(res.data) : project;
}

export async function updateProject(project: AdminProject): Promise<AdminProject> {
  const res = await apiFetch<AdminProject>(`/api/projects/${project.id}`, {
    method: "PUT",
    body: JSON.stringify(project),
  });
  return res.data ? mapProject(res.data) : project;
}

export async function deleteProject(id: string): Promise<void> {
  await apiFetch(`/api/projects/${id}`, { method: "DELETE" });
}

export async function uploadProjectImage(file: File, oldUrl?: string): Promise<string> {
  // Reuse avatar upload endpoint for project thumbnails
  return uploadAvatar(file, oldUrl);
}
