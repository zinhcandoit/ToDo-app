// components/DayDrawer.tsx
import React, { useEffect } from 'react'
import type { Task } from '../features/tasks/types'
import { priBadge } from '../features/tasks/state'
import { playTick } from '../utils/tickSound'

type Props = {
    open: boolean
    dateStr?: string // YYYY-MM-DD
    tasks: Task[]
    onClose: () => void
    onToggle?: (id: string) => void
    onEdit?: (id: string, patch: Partial<Omit<Task, 'id'>>) => void
    onRequestEdit?: (id: string) => void // để mở Focus mode ở nơi khác (TaskItem/App)
}

const toISO = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

function nextSunday(from = new Date()) {
    const d = new Date(from)
    const add = (7 - d.getDay()) % 7
    d.setDate(d.getDate() + (add || 7)) // luôn tới CN kế tiếp
    return d
}

function addDays(d: Date, n: number) {
    const x = new Date(d)
    x.setDate(x.getDate() + n)
    return x
}

export const DayDrawer: React.FC<Props> = ({
    open, dateStr, tasks, onClose, onToggle, onEdit, onRequestEdit
}) => {
    // ESC để đóng
    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open, onClose])

    if (!open) return null

    const label = dateStr
        ? new Date(dateStr + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
        : ''

    const snoozeTo = (t: Task, kind: 'tomorrow' | 'sunday' | 'nextweek' | 'none') => {
        if (!onEdit) return
        const today = new Date()
        let due: string | undefined
        if (kind === 'tomorrow') due = toISO(addDays(today, 1))
        else if (kind === 'sunday') due = toISO(nextSunday(today))
        else if (kind === 'nextweek') due = toISO(addDays(today, 7))
        else due = undefined
        onEdit(t.id, { due })
    }

    return (
        <>
            {/* overlay */}
            <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40" onClick={onClose} />
            {/* panel phải */}
            <aside
                className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 bg-white dark:bg-neutral-900 border-l border-gray-200 dark:border-neutral-800 shadow-xl
                   flex flex-col"
                role="dialog" aria-modal="true" aria-label="Day details"
            >
                <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
                    <div>
                        <div className="text-xs uppercase text-gray-500">Chi tiết ngày</div>
                        <div className="text-lg font-semibold">{label}</div>
                    </div>
                    <button
                        className="rounded-lg border px-2.5 py-1 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800"
                        onClick={onClose}
                    >
                        Đóng
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-1 space-y-3">
                    {tasks.length === 0 ? (
                        <div className="text-sm text-gray-500">Không có task cho ngày này.</div>
                    ) : tasks.map(t => (
                        <div key={t.id} className="rounded-xl border border-gray-200 dark:border-neutral-800 p-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 cursor-pointer"
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => onRequestEdit?.(t.id)}
                                >
                                    <div className="flex items-center gap-2">
                                        <p className={`truncate font-medium ${t.completed ? 'line-through text-gray-400' : ''}`}>
                                            {t.title}
                                        </p>
                                        <span className={'shrink-0 rounded-full px-2 py-0.5 text-xs ' + priBadge(t.priority)}>
                                            {t.priority ?? 'low'}
                                        </span>
                                    </div>
                                    {t.description && (
                                        <p className={`text-sm mt-1 ${t.completed ? 'line-through text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
                                            {t.description}
                                        </p>
                                    )}
                                </div>

                                <input
                                    type="checkbox"
                                    className="mt-1 h-5 w-5 rounded border-gray-300 dark:border-gray-700"
                                    checked={t.completed}
                                    onChange={(e) => { onToggle?.(t.id); if (e.target.checked) playTick() }}
                                    title="Complete"
                                />
                            </div>

                            {/* Quick actions */}
                            <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                    className="rounded-lg border px-2.5 py-1 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800"
                                    onClick={() => onRequestEdit?.(t.id)}
                                >
                                    Edit
                                </button>
                                <div className="inline-flex gap-1">
                                    <button className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-neutral-800"
                                        onClick={() => snoozeTo(t, 'tomorrow')}>
                                        Snooze: Tomorrow
                                    </button>
                                    <button className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-neutral-800"
                                        onClick={() => snoozeTo(t, 'sunday')}>
                                        Snooze: Sunday
                                    </button>
                                    <button className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-neutral-800"
                                        onClick={() => snoozeTo(t, 'nextweek')}>
                                        +1 tuần
                                    </button>
                                    <button className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-neutral-800"
                                        onClick={() => snoozeTo(t, 'none')}>
                                        Bỏ due
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
        </>
    )
}
