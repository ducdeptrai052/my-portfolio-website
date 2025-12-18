import { apiFetch } from "@/lib/api";

export async function uploadMedia(file: File, oldUrl?: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const query = oldUrl ? `?oldUrl=${encodeURIComponent(oldUrl)}` : "";
  const res = await apiFetch<{ url: string }>(`/upload/media${query}`, {
    method: "POST",
    body: formData,
  });
  return res.data?.url ?? "";
}
