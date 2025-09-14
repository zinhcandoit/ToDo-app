import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Toast = {
    id?: string
    title: string
    description?: string
    action?: { label: string, onClick: () => void }
    durationMs?: number
}

const Ctx = createContext<{ pushToast: (t: Toast) => void } | null>(null)

export function useToast() {
    const ctx = useContext(Ctx)
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
    return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const pushToast = (t: Toast) => {
        const id = crypto?.randomUUID?.() ?? String(Date.now())
        setToasts(prev => {
            const filtered = prev.filter(x => x.title !== t.title);
            return [...filtered, { id, durationMs: 4000, ...t }]
        }
        )
    }

    useEffect(() => {
        const timers = toasts.map(t => setTimeout(() => {
            setToasts(prev => prev.filter(x => x !== t))
        }, t.durationMs))
        return () => { timers.forEach(clearTimeout) }
    }, [toasts])

    return (
        <Ctx.Provider value={{ pushToast }}>
            {children}
            <Toaster toasts={toasts} />
        </Ctx.Provider>
    )
}

export function Toaster({ toasts }: { toasts?: Toast[] }) {
    if (!toasts?.length) return null
    return (
        <div className="pointer-events-none fixed bottom-4 left-1/2 -translate-x-1/2 z-50 space-y-2 w-[min(92vw,560px)]">
            {toasts.map(t => (
                <div key={t.id} className="pointer-events-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 shadow p-3">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="font-medium">{t.title}</p>
                            {t.description && <p className="text-sm text-gray-600 dark:text-gray-300">{t.description}</p>}
                        </div>
                        {t.action && (
                            <button
                                className="kb-focus rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                                onClick={t.action.onClick}
                            >{t.action.label}</button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
