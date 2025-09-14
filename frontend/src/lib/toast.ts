export type ToastVariant = "success" | "error" | "info";
export type ToastOptions = {
    title?: string;
    description?: string;
    variant?: ToastVariant;
    duration?: number; // ms
};

export type ToastPayload = Required<ToastOptions> & { id: string };

const emitter = new EventTarget();
const EVENT = "app:toast";

function uid() {
    return typeof crypto?.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
}

function show(opts: ToastOptions) {
    const payload: ToastPayload = {
        id: uid(),
        title: opts.title ?? "",
        description: opts.description ?? "",
        variant: opts.variant ?? "info",
        duration: opts.duration ?? 3500,
    };
    emitter.dispatchEvent(new CustomEvent<ToastPayload>(EVENT, { detail: payload }));
    return payload.id;
}

export const toast = Object.assign(show, {
    on(listener: (t: ToastPayload) => void) {
        const handler = (e: Event) => listener((e as CustomEvent<ToastPayload>).detail);
        emitter.addEventListener(EVENT, handler);
        return () => emitter.removeEventListener(EVENT, handler);
    },
    success: (msg: string, opts: Omit<ToastOptions, "variant"> = {}) =>
        show({ variant: "success", description: msg, ...opts }),
    error: (msg: string, opts: Omit<ToastOptions, "variant"> = {}) =>
        show({ variant: "error", description: msg, ...opts }),
    info: (msg: string, opts: Omit<ToastOptions, "variant"> = {}) =>
        show({ variant: "info", description: msg, ...opts }),
});
