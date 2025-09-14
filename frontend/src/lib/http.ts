export const API_BASE = import.meta.env.VITE_API_BASE!;
const tokenKey = "auth_token";
export const tokenStore = {
    get: () => localStorage.getItem(tokenKey),
    set: (t: string) => localStorage.setItem(tokenKey, t),
    clear: () => localStorage.removeItem(tokenKey),
};

export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
    const h: Record<string, string> = { "Content-Type": "application/json", ...(init.headers as any) };
    const t = tokenStore.get(); if (t) h.Authorization = `Bearer ${t}`;
    const res = await fetch(API_BASE + path, { ...init, headers: h, credentials: "include" });
    if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
    return res.json() as Promise<T>;
}