import { useEffect, useMemo, useRef, useState } from "react";
import { authClient } from "../lib/authClient.index";
import { toast } from "../lib/toast";
import { tokenStore } from "../lib/tokenStore"

type Mode = "login" | "signup" | "forgot";

interface Props {
    open: boolean;
    onClose: () => void;
    auth?: typeof authClient; // truyền realAuthClient sau này; mặc định mock để test UI
}

export default function Authentication({ open, onClose, auth = authClient }: Props) {
    const [mode, setMode] = useState<Mode>("login");
    const [loading, setLoading] = useState(false);

    // form state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const [pw2, setPw2] = useState("");

    const firstInputRef = useRef<HTMLInputElement>(null);

    // khóa scroll + esc để đóng + auto focus khi mở
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const t = setTimeout(() => firstInputRef.current?.focus(), 0);
        const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onEsc);
        return () => {
            document.body.style.overflow = prev;
            clearTimeout(t);
            document.removeEventListener("keydown", onEsc);
        };
    }, [open, onClose, mode]);

    // reset message khi đổi mode
    useEffect(() => {
        // giữ state input nếu muốn; ở đây chỉ đảm bảo confirm pw hợp lệ
        if (mode !== "signup") setPw2("");
    }, [mode]);

    const canSubmit = useMemo(() => {
        if (loading) return false;
        if (mode === "login") return email.trim() && pw.length >= 6;
        if (mode === "signup") return name.trim() && email.trim() && pw.length >= 6 && pw === pw2;
        if (mode === "forgot") return email.trim();
        return false;
    }, [mode, email, pw, pw2, name, loading]);

    function resetForm() {
        setName("");
        setEmail("");
        setPw("");
        setPw2("");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!canSubmit) return;

        setLoading(true);
        try {
            if (mode === "login") {
                const res = await auth.login({ email, password: pw });
                if (!res.ok) throw new Error(res.message || "Login failed");
                tokenStore.set(res.token!);
                toast.success(`Welcome back${res.user?.name ? `, ${res.user.name}` : ""}!`);
                onClose();
                resetForm();
            } else if (mode === "signup") {
                const res = await auth.signup({ name, email, password: pw });
                if (!res.ok) throw new Error(res.message || "Signup failed");
                tokenStore.set(res.token!);
                toast.success("Account created. You can sign in now.");
                // Chuyển về login cho mượt
                setMode("login");
                setPw("");
                setPw2("");
            } else {
                const res = await auth.forgot({ email });
                if (!res.ok) throw new Error(res.message || "Request failed");
                toast.info(res.message || `Reset link sent to ${email}`);
                // Ở lại màn hình forgot hay quay về login tùy bạn:
                setMode("login");
            }
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogle() {
        setLoading(true);
        try {
            const res = await auth.loginWithGoogle();
            if (!res.ok) throw new Error(res.message || "Google sign-in failed");
            tokenStore.set(res.token!);
            toast.success(`Signed in with Google${res.user?.email ? `: ${res.user.email}` : ""}`);
            onClose();
            resetForm();
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            {/* overlay nền */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* card */}
            <div
                className="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-black/5 dark:border-white/10 p-6 sm:p-8"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    aria-label="Close"
                    onClick={() => {
                        onClose();
                        // OPTIONAL: reset để lần sau mở mới tinh
                        resetForm();
                        setMode("login");
                    }}
                    className="absolute right-3 top-3 rounded-full p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                    ✕
                </button>

                <h2 id="auth-title" className="text-2xl font-semibold mb-2 text-center">
                    {mode === "login" && "Welcome back"}
                    {mode === "signup" && "Create account"}
                    {mode === "forgot" && "Forgot password"}
                </h2>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                    {mode === "login" && "Sign in to continue"}
                    {mode === "signup" && "Join to get started"}
                    {mode === "forgot" && "We’ll email you a reset link"}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === "signup" && (
                        <div>
                            <label className="block text-sm mb-1">Name</label>
                            <input
                                ref={firstInputRef}
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Your name"
                                autoComplete="name"
                            />
                        </div>
                    )}

                    {mode !== "signup" && (
                        <div>
                            <label className="block text-sm mb-1">Email</label>
                            <input
                                ref={firstInputRef}
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="you@example.com"
                                autoComplete="email"
                            />
                        </div>
                    )}

                    {mode === "signup" && (
                        <div>
                            <label className="block text-sm mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="you@example.com"
                                autoComplete="email"
                            />
                        </div>
                    )}

                    {mode !== "forgot" && (
                        <div>
                            <label className="block text-sm mb-1">Password</label>
                            <input
                                type="password"
                                value={pw}
                                onChange={(e) => setPw(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                                autoComplete={mode === "login" ? "current-password" : "new-password"}
                                minLength={6}
                            />
                        </div>
                    )}

                    {mode === "signup" && (
                        <div>
                            <label className="block text-sm mb-1">Confirm password</label>
                            <input
                                type="password"
                                value={pw2}
                                onChange={(e) => setPw2(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                                autoComplete="new-password"
                                minLength={6}
                            />
                            {pw && pw2 && pw !== pw2 && (
                                <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="w-full rounded-lg bg-blue-600 text-white py-2.5 font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors"
                    >
                        {loading
                            ? "Please wait..."
                            : mode === "login"
                                ? "Sign in"
                                : mode === "signup"
                                    ? "Create account"
                                    : "Send reset link"}
                    </button>

                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                        or
                        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogle}
                        disabled={loading}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 font-medium hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors flex items-center justify-center gap-2"
                    >
                        <GoogleIcon />
                        Continue with Google
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    {mode === "login" && (
                        <div className="space-x-2">
                            <button onClick={() => setMode("forgot")} className="underline underline-offset-4">
                                Forgot password?
                            </button>
                            <span>·</span>
                            <button onClick={() => setMode("signup")} className="underline underline-offset-4">
                                Create account
                            </button>
                        </div>
                    )}
                    {mode === "signup" && (
                        <button onClick={() => setMode("login")} className="underline underline-offset-4">
                            Already have an account? Sign in
                        </button>
                    )}
                    {mode === "forgot" && (
                        <button onClick={() => setMode("login")} className="underline underline-offset-4">
                            Back to sign in
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3A12 12 0 1 1 24 12a11.9 11.9 0 0 1 8.4 3.3l5.7-5.7A20 20 0 1 0 44 24c0-.9-.1-1.8-.4-2.7z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3.2 0 6.1 1.2 8.4 3.3l5.7-5.7A20 20 0 0 0 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44a20 20 0 0 0 13.4-5l-6.2-5.3A12 12 0 0 1 12.9 29l-6.6 5A19.9 19.9 0 0 0 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.7l6.2 5.3A19.9 19.9 0 0 0 44 24c0-.9-.1-1.8-.4-2.7z" />
        </svg>
    );
}
