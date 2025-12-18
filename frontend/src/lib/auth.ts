import { STORAGE_KEYS, getStorageItem, setStorageItem, removeStorageItem } from '@/lib/storage';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function getAuthToken(): string | null {
  return getStorageItem<string | null>(STORAGE_KEYS.AUTH, null);
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Invalid credentials');
  }

  const body = await res.json();
  const token = body?.data?.token;
  if (!token) {
    throw new Error('Login response missing token');
  }

  setStorageItem(STORAGE_KEYS.AUTH, token);
  return body?.data?.user;
}

export async function fetchCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;

  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });

  if (!res.ok) {
    logout();
    return null;
  }

  const body = await res.json();
  return body?.data?.user ?? null;
}

export function logout(): void {
  removeStorageItem(STORAGE_KEYS.AUTH);
  // best-effort call to backend to revoke refresh token
  fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
}
