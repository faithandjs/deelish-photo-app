// src/lib/api.ts

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:30000";

// ---------- Core fetch wrapper ----------
export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
  token?: string | null,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data.data as T;
}

// ---------- Token store ----------
// Swap this out for your auth context/zustand store if you have one
let _token: string | null = null;
export const authStore = {
  getToken: () => _token,
  setToken: (t: string | null) => {
    _token = t;
  },
};
