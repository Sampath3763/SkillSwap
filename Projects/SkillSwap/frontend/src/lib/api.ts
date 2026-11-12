const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const TOKEN_STORAGE_KEY = "skillswap_token";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function apiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalizedBase = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

const CLERK_USER_KEY = "skillswap_clerk_user_id";

export function getClerkUserId(): string | null {
  return localStorage.getItem(CLERK_USER_KEY);
}

export function setClerkUserId(id: string | null) {
  if (id) {
    localStorage.setItem(CLERK_USER_KEY, id);
  } else {
    localStorage.removeItem(CLERK_USER_KEY);
  }
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});
  const token = getAuthToken();
  const clerkUserId = getClerkUserId();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (clerkUserId) {
    headers.set("x-clerk-user-id", clerkUserId);
  }

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(apiUrl(path), {
    ...options,
    headers,
  });
}

export async function apiJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, options);
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function apiRequest(method: HttpMethod, path: string, data?: unknown): Promise<Response> {
  return apiFetch(path, {
    method,
    body: data ? JSON.stringify(data) : undefined,
  });
}
