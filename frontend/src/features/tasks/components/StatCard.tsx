import React from 'react'

interface StatCardProps {
    title: string
    value: string | number
    sub?: string
    progress?: number // 0..1
    icon?: 'done' | 'trending' | 'activity'
}

const IconGlyph: React.FC<{ kind?: 'done' | 'trending' | 'activity' }> = ({ kind }) => {
    const common = 'h-5 w-5'
    // Simple inline SVGs (currentColor)
    if (kind === 'done') return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
    )
    if (kind === 'trending') return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></svg>
    )
    return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
    )
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, sub, progress, icon }) => {
    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                    <IconGlyph kind={icon} />
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</div>
            </div>
            <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{value}</div>
            {sub && <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</div>}
            {typeof progress === 'number' && (
                <div className="mt-3 h-2 w-full rounded-full bg-slate-200/70 dark:bg-slate-800">
                    <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${Math.round((progress || 0) * 100)}%` }} />
                </div>
            )}
        </div>
    )
}