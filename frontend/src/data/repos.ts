import { apiFetch } from "@/lib/api";

export interface Repo {
  id: string;
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  url: string;
  createdAt?: string;
  updatedAt?: string;
}

const mapRepo = (r: Partial<Repo>): Repo => ({
  id: r.id || "",
  name: r.name ?? "",
  description: r.description ?? "",
  language: r.language ?? "",
  stars: r.stars ?? 0,
  forks: r.forks ?? 0,
  url: r.url ?? "",
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
});

let cachedRepos: Repo[] | null = null;
let inflight: Promise<Repo[]> | null = null;

export async function fetchReposPublic(force = false): Promise<Repo[]> {
  if (cachedRepos && !force) return cachedRepos;
  if (inflight && !force) return inflight;

  inflight = (async () => {
    try {
      const res = await apiFetch<Repo[]>("/public/repos");
      cachedRepos = (res.data ?? []).map(mapRepo);
      return cachedRepos;
    } catch {
      cachedRepos = [];
      return [];
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export async function getTopRepos(limit: number = 4): Promise<Repo[]> {
  const data = await fetchReposPublic();
  return [...data].sort((a, b) => (b.stars || 0) - (a.stars || 0)).slice(0, limit);
}
