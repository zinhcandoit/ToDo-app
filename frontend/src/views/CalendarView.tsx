import React, { useMemo, useState, useCallback } from 'react'
import type { Task } from '../features/tasks/types'
import { priBadge } from '../features/tasks/state'
import { DayDrawer } from '../components/DayDrawer'
import { playTick } from '../utils/tickSound'

type Props = {
    tasks: Task[]
    onToggle?: (id: string) => void
    onEdit?: (id: string, patch: Partial<Omit<Task, 'id'>>) => void
    onRequestEdit?: (id: string) => void
}

export function CalendarView({ tasks, onToggle, onEdit, onRequestEdit }: Props) {
    const today = new Date()
    const y = today.getFullYear()
    const m = today.getMonth()
    const monthLabel = new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(today)
    const dayLabel = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(today)
    // --- helpers for dates ---
    const toISO = (d: Date) => {
        const yy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        return `${yy}-${mm}-${dd}`
    }
    const addDays = (d: Date, n: number) => {
        const x = new Date(d); x.setDate(x.getDate() + n); return x
    }
    const startOfWeek = (d: Date) => { // CN → T7
        const x = new Date(d); x.setDate(x.getDate() - x.getDay()); return x
    }

    // --- mode: calendar / today / week ---
    const [mode, setMode] = useState<'calendar' | 'today' | 'week'>('today')

    // --- build month grid ---
    const start = new Date(y, m, 1)
    const end = new Date(y, m + 1, 0)
    const firstDay = start.getDay()
    const daysInMonth = end.getDate()

    const byDate = useMemo(() => {
        const map = new Map<string, Task[]>()
        tasks.forEach(t => {
            if (!t.due) return
            map.set(t.due, [...(map.get(t.due) || []), t])
        })
        return map
    }, [tasks])

    const cellsMonth: { dayNum?: number; dateStr?: string }[] = []
    for (let i = 0; i < firstDay; i++) cellsMonth.push({})
    for (let d = 1; d <= daysInMonth; d++) {
        const ds = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        cellsMonth.push({ dayNum: d, dateStr: ds })
    }
    while (cellsMonth.length % 7 !== 0) cellsMonth.push({})

    // --- week grid: đúng 7 ô, giống Month ---
    const sow = startOfWeek(today)
    const cellsWeek: { dayNum: number; dateStr: string }[] = Array.from({ length: 7 }, (_, i) => {
        const d = addDays(sow, i)
        return { dayNum: d.getDate(), dateStr: toISO(d) }
    })

    const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    const isoToday = toISO(today)
    const isToday = (ds?: string) => !!ds && ds === isoToday
    const isoTomorrow = toISO(addDays(today, 1))

    // --- Drawer state ---
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)
    const openDrawer = useCallback((ds: string) => { setSelectedDate(ds); setDrawerOpen(true) }, [])
    const closeDrawer = useCallback(() => setDrawerOpen(false), [])

    // --- Heatmap density (green 3 levels) ---
    // Ưu tiên: (1) Ngày mai có task → đậm nhất
    //         (2) Có task High → đậm nhì
    //         (3) Có task bất kỳ → nhạt (gốc)
    const dayHeatClass = (dateStr?: string, items?: Task[]) => {
        if (!dateStr || !items || items.length === 0) return ''
        if (dateStr === isoTomorrow) return 'bg-red-300 dark:bg-red-900/60'      // level 3 (đậm nhất)
        if (items.some(t => (t.priority ?? 'low') === 'high')) return 'bg-red-200 dark:bg-red-900/40' // level 2
        return 'bg-red-100 dark:bg-red-900/30'                                   // level 1
    }

    // --- simple TaskRow reused in Today/Week (nếu cần) ---
    const TaskRow: React.FC<{ t: Task }> = ({ t }) => (
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 p-3 flex items-start justify-between gap-2">
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <p className={`truncate font-medium ${t.completed ? 'line-through text-gray-400' : ''}`}
                        onClick={() => onRequestEdit?.(t.id)}
                        role="button"
                        tabIndex={0}
                    >
                        {t.title}
                    </p>
                    <span className={'shrink-0 rounded-full px-2 py-0.5 text-xs ' + priBadge(t.priority)}>
                        {t.priority ?? 'low'}
                    </span>
                    {t.due && <span className="text-[11px] text-gray-500">{t.due}</span>}
                </div>
                {t.description && (
                    <p className={`text-sm mt-1 ${t.completed ? 'line-through text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
                        {t.description}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={(e) => { onToggle?.(t.id); if (e.target.checked) playTick() }}
                    className="mt-1 h-5 w-5 rounded border-gray-300 dark:border-gray-700"
                    title="Complete"
                />
                <button
                    onClick={() => onRequestEdit?.(t.id)}
                    className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800"
                >
                    Edit
                </button>
            </div>
        </div>
    )

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight capitalize">{mode === 'today' ? dayLabel : monthLabel}</h2>
                <div className="inline-flex rounded-xl bg-gray-100 dark:bg-neutral-800 p-1">
                    {(['calendar', 'today', 'week'] as const).map(k => (
                        <button
                            key={k}
                            onClick={() => setMode(k)}
                            className={`px-3 py-1.5 text-sm rounded-lg ${mode === k ? 'bg-white dark:bg-neutral-900 shadow text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'
                                }`}
                        >
                            {k === 'calendar' ? 'Calendar' : (k === 'today' ? 'Today' : 'This week')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Day name header for grid modes */}
            {(mode === 'calendar' || mode === 'week') && (
                <div className="grid grid-cols-7 gap-2 text-xs text-gray-500 dark:text-gray-400">
                    {dayName.map(d => <div key={d} className="text-center font-medium">{d}</div>)}
                </div>
            )}

            {/* Calendar month grid */}
            {mode === 'calendar' && (
                <>
                    <div className="grid grid-cols-7 gap-2">
                        {cellsMonth.map((c, i) => {
                            const items = (c.dateStr ? byDate.get(c.dateStr) : undefined) || []
                            const todayCell = isToday(c.dateStr)
                            const heat = dayHeatClass(c.dateStr, items)
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => c.dateStr && openDrawer(c.dateStr)}
                                    className={
                                        "text-left min-h-[110px] rounded-xl border p-2 overflow-hidden transition-shadow focus:outline-none " +
                                        (todayCell
                                            ? "border-indigo-500 shadow-[0_0_0_2px_rgba(99,102,241,.18)]"
                                            : "border-gray-200 dark:border-gray-800 hover:shadow-sm") +
                                        (heat ? ` ${heat}` : '')
                                    }
                                >
                                    <div className="flex items-center justify-between mb-1 text-xs">
                                        <span className={"font-semibold " + (todayCell ? "inline-grid place-items-center w-6 h-6 rounded-full bg-indigo-600 text-white" : "")}>
                                            {c.dayNum ?? ''}
                                        </span>
                                        {items.length > 0 && <span className="text-[10px] text-gray-600">{items.length} task</span>}
                                    </div>

                                    <div className="space-y-1">
                                        {items.slice(0, 3).map(t => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); onRequestEdit?.(t.id) }}
                                                className="w-full truncate text-left text-xs flex items-center gap-1 hover:underline focus:outline-none"
                                                title="Open Focus mode"
                                            >
                                                <span className={"shrink-0 rounded-full px-1.5 py-0.5 " + priBadge(t.priority)}>
                                                    {t.priority ?? 'low'}
                                                </span>
                                                <span className={t.completed ? 'line-through text-gray-400' : ''}>
                                                    {t.title}
                                                </span>
                                            </button>
                                        ))}
                                        {items.length > 3 && <div className="text-[10px] text-gray-500">+{items.length - 3} more…</div>}
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    <DayDrawer
                        open={drawerOpen}
                        dateStr={selectedDate}
                        tasks={selectedDate ? (byDate.get(selectedDate) || []) : []}
                        onClose={closeDrawer}
                        onToggle={onToggle}
                        onEdit={onEdit}
                        onRequestEdit={onRequestEdit}
                    />
                </>
            )}

            {/* Today (simple list, giữ nguyên) */}
            {mode === 'today' && (
                <div className="space-y-2">
                    <div className="text-sm text-gray-500">Tasks cho hôm nay</div>
                    {tasks.filter(t => t.due === isoToday).length === 0
                        ? <div className="text-sm text-gray-500">Không có task hôm nay.</div>
                        : tasks.filter(t => t.due === isoToday).map(t => <TaskRow key={t.id} t={t} />)
                    }
                </div>
            )}

            {/* This week: 7 ô ngày, giống Month */}
            {mode === 'week' && (
                <>
                    <div className="grid grid-cols-7 gap-2">
                        {cellsWeek.map(({ dayNum, dateStr }, i) => {
                            const items = byDate.get(dateStr) || []
                            const todayCell = isToday(dateStr)
                            const heat = dayHeatClass(dateStr, items)
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => openDrawer(dateStr)}
                                    className={
                                        "text-left min-h-[110px] rounded-xl border p-2 overflow-hidden transition-shadow focus:outline-none " +
                                        (todayCell
                                            ? "border-indigo-500 shadow-[0_0_0_2px_rgba(99,102,241,.18)]"
                                            : "border-gray-200 dark:border-gray-800 hover:shadow-sm") +
                                        (heat ? ` ${heat}` : '')
                                    }
                                >
                                    <div className="flex items-center justify-between mb-1 text-xs">
                                        <span className={"font-semibold " + (todayCell ? "inline-grid place-items-center w-6 h-6 rounded-full bg-indigo-600 text-white" : "")}>
                                            {dayNum}
                                        </span>
                                        {items.length > 0 && <span className="text-[10px] text-gray-600">{items.length} task</span>}
                                    </div>

                                    <div className="space-y-1">
                                        {items.slice(0, 3).map(t => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); onRequestEdit?.(t.id) }}
                                                className="w-full truncate text-left text-xs flex items-center gap-1 hover:underline focus:outline-none"
                                                title="Open Focus mode"
                                            >
                                                <span className={"shrink-0 rounded-full px-1.5 py-0.5 " + priBadge(t.priority)}>
                                                    {t.priority ?? 'low'}
                                                </span>
                                                <span className={t.completed ? 'line-through text-gray-400' : ''}>
                                                    {t.title}
                                                </span>
                                            </button>
                                        ))}
                                        {items.length > 3 && <div className="text-[10px] text-gray-500">+{items.length - 3} more…</div>}
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    <DayDrawer
                        open={drawerOpen}
                        dateStr={selectedDate}
                        tasks={selectedDate ? (byDate.get(selectedDate) || []) : []}
                        onClose={closeDrawer}
                        onToggle={onToggle}
                        onEdit={onEdit}
                        onRequestEdit={onRequestEdit}
                    />
                </>
            )}

            {/* (optional) phần "Không có due date" – chỉ hiện ở Month như cũ */}
            {mode === 'calendar' && tasks.some(t => !t.due) && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3">
                    <p className="text-sm font-medium mb-2">Không có ngày hạn</p>
                    <div className="flex flex-wrap gap-2">
                        {tasks.filter(t => !t.due).map(t => (
                            <span key={t.id}
                                className={"text-xs rounded-full px-2 py-1 border " +
                                    (t.completed ? "line-through text-gray-400 border-gray-300" : "border-gray-300")}
                                title={t.title}
                            >
                                {t.title}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
