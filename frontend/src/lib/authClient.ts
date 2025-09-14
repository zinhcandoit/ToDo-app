// src/lib/authClient.ts
export type LoginInput = { email: string; password: string };
export type SignupInput = { name: string; email: string; password: string };
export type ForgotInput = { email: string };

export type AuthResult = {
    ok: boolean;
    message?: string;
    token?: string;
    user?: { id: string; name: string; email: string };
};

export interface AuthClient {
    login(input: LoginInput): Promise<AuthResult>;
    signup(input: SignupInput): Promise<AuthResult>;
    forgot(input: ForgotInput): Promise<AuthResult>;
    loginWithGoogle(): Promise<AuthResult>;
}

// Mock in-memory: chỉ để test UI, KHÔNG gọi backend.
export const mockAuthClient: AuthClient = {
    login: async ({ email, password }) => {
        await wait(700);
        if (email === "test@example.com" && password === "password") {
            return {
                ok: true,
                token: "mock-token",
                user: { id: "1", name: "Test User", email },
            };
        }
        return { ok: false, message: "Invalid credentials" };
    },
    signup: async ({ name, email }) => {
        await wait(800);
        return {
            ok: true,
            token: "mock-token",
            user: { id: "2", name, email },
        };
    },
    forgot: async ({ email }) => {
        await wait(500);
        return { ok: true, message: `Reset link sent to ${email}` };
    },
    loginWithGoogle: async () => {
        await wait(600);
        return {
            ok: true,
            token: "mock-google",
            user: { id: "g1", name: "Google User", email: "you@gmail.com" },
        };
    },
};

function wait(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}


//import type { AuthClient, AuthResult, LoginInput, SignupInput, ForgotInput } from "./authClient";
import { http } from "./http";
export const realAuthClient: AuthClient = {
    login: (b: LoginInput) => http<AuthResult>("/auth/login", { method: "POST", body: JSON.stringify(b) }),
    signup: (b: SignupInput) => http<AuthResult>("/auth/signup", { method: "POST", body: JSON.stringify(b) }),
    forgot: (b: ForgotInput) => http<AuthResult>("/auth/forgot", { method: "POST", body: JSON.stringify(b) }),
    loginWithGoogle: () => http<AuthResult>("/auth/google/start", { method: "POST" }),
};