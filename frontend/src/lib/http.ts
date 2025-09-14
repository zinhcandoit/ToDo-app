// cho phép truyền object
type JsonInit = Omit<RequestInit, 'body'> & { body?: any };

export async function http<T>(path: string, init: JsonInit = {}): Promise<T> {
    const url = (import.meta.env.VITE_API_BASE as string || '').replace(/\/+$/, '') +
        (path.startsWith('/') ? path : `/${path}`);

    const headers = new Headers(init.headers || {});
    if (!headers.has('Accept')) headers.set('Accept', 'application/json');

    // stringify nếu body là object (không phải FormData/Blob/string)
    let body = init.body;
    const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
    if (body && !isForm && typeof body !== 'string' && !(body instanceof Blob)) {
        if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
        body = JSON.stringify(body);
    }

    // auth
    const t = localStorage.getItem('auth_token');
    if (t) headers.set('Authorization', `Bearer ${t}`);

    const res = await fetch(url, { ...init, headers, body, credentials: init.credentials ?? 'same-origin' });

    if (res.status === 204) return undefined as unknown as T;
    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

    if (!res.ok) throw new Error(typeof data === 'string' ? data : data?.detail || res.statusText);
    return data as T;
}
