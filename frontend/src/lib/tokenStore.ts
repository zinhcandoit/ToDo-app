const STORAGE_KEY = "auth.token";

export const tokenStore = {
    set(token: string) {
        localStorage.setItem(STORAGE_KEY, token);
    },
    get(): string | null {
        return localStorage.getItem(STORAGE_KEY);
    },
    clear() {
        localStorage.removeItem(STORAGE_KEY);
    }
};