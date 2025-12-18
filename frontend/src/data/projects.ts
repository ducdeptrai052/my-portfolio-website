export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  tags: string[];
  thumbnail: string;
  links: {
    live?: string;
    github?: string;
    demo?: string;
  };
  featured?: boolean;
  year?: string;
}

import { apiFetch } from "@/lib/api";

type ProjectApi = {
  id: string;
  title?: string;
  shortDescription?: string;
  fullDescription?: string;
  tags?: string[];
  thumbnailUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  links?: {
    demo?: string;
    github?: string;
  };
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

let cachedProjects: Project[] | null = null;
let inflight: Promise<Project[]> | null = null;

const mapFromApi = (item: ProjectApi): Project => ({
  id: item.id,
  title: item.title ?? "",
  description: item.shortDescription ?? "",
  longDescription: item.fullDescription ?? "",
  tags: item.tags ?? [],
  thumbnail: item.thumbnailUrl ?? "",
  links: {
    live: item.demoUrl ?? item.links?.demo,
    github: item.githubUrl ?? item.links?.github,
    demo: item.demoUrl ?? item.links?.demo,
  },
  featured: item.featured === true || (item.tags ?? []).includes("featured"),
  year: new Date(item.createdAt || Date.now()).getFullYear().toString(),
});

export async function fetchProjectsPublic(force = false): Promise<Project[]> {
  if (cachedProjects && !force) return cachedProjects;
  if (inflight && !force) return inflight;

  inflight = (async () => {
    try {
      const res = await apiFetch<ProjectApi[]>("/public/projects");
      cachedProjects = (res.data ?? []).map(mapFromApi);
      return cachedProjects;
    } catch {
      cachedProjects = [];
      return [];
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export const getAllTags = (projects: Project[]): string[] => {
  const tags = new Set<string>();
  projects.forEach((project) => {
    project.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
};

export const getFeaturedProjects = (projects: Project[]): Project[] => {
  const featured = projects.filter((project) => project.featured);
  if (featured.length > 0) return featured;
  return projects;
};
