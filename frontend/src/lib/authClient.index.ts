export type AuthResult = {
    ok: boolean;
    message?: string;
    token?: string;
    user?: { id: string; name?: string; email?: string };
};

export type LoginInput = { email: string; password: string };
export type SignupInput = { name: string; email: string; password: string };

const base = import.meta.env.VITE_API_BASE as string;

export interface AuthClient {
    login(input: LoginInput): Promise<AuthResult>;
    signup(input: SignupInput): Promise<AuthResult>;
    forgot(input: { email: string }): Promise<AuthResult>;
    loginWithGoogle(): Promise<AuthResult>;
}

export const authClient: AuthClient = {
    async login({ email, password }) {
        const r = await fetch(`${base}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!r.ok) return { ok: false, message: await r.text() };
        const data = await r.json();
        return { ok: true, token: data.access_token, user: data.user };
    },

    async signup({ name, email, password }) {
        const r = await fetch(`${base}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        if (!r.ok) return { ok: false, message: await r.text() };
        const data = await r.json();
        return { ok: true, token: data.access_token, user: data.user };
    },

    async forgot({ email }) {
        const r = await fetch(`${base}/auth/forgot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await r.json().catch(() => ({}));
        return { ok: r.ok, message: data?.message || '' };
    },

    async loginWithGoogle() {
        // Chưa cấu hình OAuth => trả về cùng kiểu
        return { ok: false, message: 'Google OAuth not configured' };
    },
};