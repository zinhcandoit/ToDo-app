import { tokenStore } from './tokenStore';

type JsonInit = Omit<RequestInit, 'body'> & { body?: any };

export async function http<T>(path: string, init: JsonInit = {}): Promise<T> {
    const base = (import.meta.env.VITE_API_BASE as string || '').replace(/\/+$/, '');
    const url = base + (path.startsWith('/') ? path : `/${path}`);

    const headers = new Headers(init.headers || {});
    if (!headers.has('Accept')) headers.set('Accept', 'application/json');

    let body = init.body;
    const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
    if (body && !isForm && typeof body !== 'string' && !(body instanceof Blob)) {
        if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
        body = JSON.stringify(body);
    }

    const t = tokenStore.get();
    if (t) headers.set('Authorization', `Bearer ${t}`);

    const res = await fetch(url, { ...init, headers, body, credentials: init.credentials ?? 'same-origin' });

    if (res.status === 204) return undefined as unknown as T;
    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

    if (!res.ok) {
        if (res.status === 401 || res.status === 403) tokenStore.clear();
        throw new Error(typeof data === 'string' ? data : data?.detail || res.statusText);
    }
    return data as T;
}