const KEY = 'auth.token';
export const tokenStore = {
    get: () => localStorage.getItem(KEY),
    set: (t: string) => localStorage.setItem(KEY, t),
    clear: () => localStorage.removeItem(KEY),
    getAuthHeader: () => {
        const t = localStorage.getItem(KEY);
        return t ? `Bearer ${t}` : null;
    },
};
export const notifyAuthChanged = (token?: string) =>
    window.dispatchEvent(new CustomEvent('auth:changed', { detail: { token } }));