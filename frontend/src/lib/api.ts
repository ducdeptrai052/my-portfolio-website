import { getAuthToken, logout } from "@/lib/auth";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface ApiResponse<T> {
  status: string;
  message?: string;
  data?: T;
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;
    const body = await res.json();
    const token = body?.data?.token;
    if (token) {
      // avoid circular import by requiring here
      const { setStorageItem, STORAGE_KEYS } = await import("@/lib/storage");
      setStorageItem(STORAGE_KEYS.AUTH, token);
      return token;
    }
    return null;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  _retry = false
): Promise<ApiResponse<T>> {
  let token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };
  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  let body: ApiResponse<T> | undefined;
  try {
    body = await res.json();
  } catch {
    body = undefined;
  }

  if (res.status === 401 && !_retry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetch(path, options, true);
    }
    logout();
    throw new Error(body?.message || "Unauthorized");
  }

  if (!res.ok) {
    throw new Error(body?.message || "Request failed");
  }

  return body as ApiResponse<T>;
}
