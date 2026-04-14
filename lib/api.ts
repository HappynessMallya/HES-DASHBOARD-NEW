// In production (Vercel), API calls go through /api/proxy to avoid mixed-content.
// Locally, calls go directly to the backend.
const IS_SERVER = typeof window === "undefined";
const DIRECT_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getApiBase(): string {
  // On the client in production, use the proxy
  if (!IS_SERVER && window.location.protocol === "https:") {
    return "/api/proxy";
  }
  // Locally or server-side, call the backend directly
  return DIRECT_URL;
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const base = getApiBase();
  const res = await fetch(`${base}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function getWsUrl(meterId: string): string {
  // WebSocket can't go through the proxy — needs direct backend access.
  // If backend supports wss://, use that. Otherwise fall back to ws://.
  const wsBase = process.env.NEXT_PUBLIC_WS_URL || DIRECT_URL.replace(/^http/, "ws");
  return `${wsBase}/ws/meters/${meterId}/live`;
}
