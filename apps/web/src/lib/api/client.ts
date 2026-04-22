const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const TOKEN_KEY = 'librarian_access_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(init.body != null ? { 'Content-Type': 'application/json' } : {}),
    ...(init.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`API error ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}
