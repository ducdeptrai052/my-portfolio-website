import { apiFetch } from "@/lib/api";
import { Repo } from "./repos";

export interface AdminRepo extends Repo {}

const mapRepo = (r: any): AdminRepo => ({
  id: r.id,
  name: r.name ?? "",
  description: r.description ?? "",
  language: r.language ?? "",
  stars: r.stars ?? 0,
  forks: r.forks ?? 0,
  url: r.url ?? "",
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
});

export async function fetchRepos(): Promise<AdminRepo[]> {
  const res = await apiFetch<AdminRepo[]>("/api/repos");
  return (res.data ?? []).map(mapRepo);
}

export async function fetchRepoById(id: string): Promise<AdminRepo | null> {
  if (!id) return null;
  const res = await apiFetch<AdminRepo>(`/api/repos/${id}`);
  return res.data ? mapRepo(res.data) : null;
}

export async function createRepo(repo: AdminRepo): Promise<AdminRepo> {
  const res = await apiFetch<AdminRepo>("/api/repos", {
    method: "POST",
    body: JSON.stringify(repo),
  });
  return res.data ? mapRepo(res.data) : repo;
}

export async function updateRepo(repo: AdminRepo): Promise<AdminRepo> {
  const res = await apiFetch<AdminRepo>(`/api/repos/${repo.id}`, {
    method: "PUT",
    body: JSON.stringify(repo),
  });
  return res.data ? mapRepo(res.data) : repo;
}

export async function deleteRepo(id: string): Promise<void> {
  await apiFetch(`/api/repos/${id}`, { method: "DELETE" });
}
