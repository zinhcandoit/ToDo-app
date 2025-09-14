import type { Priority, Task as allTask } from '../features/tasks/types'

export type Task = allTask & {
    durationMinutes?: number
}

// ---- Date helpers (TZ-safe-ish, using local time) ----
export const toDate = (iso?: string): Date | undefined => {
    if (!iso) return undefined
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return new Date(`${iso}T00:00:00`)
    const d = new Date(iso)
    return isNaN(d.getTime()) ? undefined : d
}

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
export const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
export const isSameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime()
export const daysBetween = (a: Date, b: Date) => Math.floor((startOfDay(b).getTime() - startOfDay(a).getTime()) / (24 * 60 * 60 * 1000))

export const today = () => startOfDay(new Date())
export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))

export const formatShortDate = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
export const minutesToHhMm = (m?: number) => {
    if (!m && m !== 0) return ''
    const h = Math.floor(m / 60)
    const mm = m % 60
    return h ? `${h}h ${mm}m` : `${mm}m`
}

// ---- Domain helpers ----
export const isOverdue = (t: Task, ref = new Date()) => {
    if (t.completed) return false
    const due = toDate(t.due)
    return !!due && due < startOfDay(ref)
}

export const isDueWithin = (t: Task, days: number, ref = new Date()) => {
    if (t.completed) return false
    const due = toDate(t.due)
    if (!due) return false
    const delta = daysBetween(startOfDay(ref), startOfDay(due))
    return delta >= 0 && delta <= days
}

export const priorityOf = (t: Task): Priority => t.priority ?? 'medium'

export const range = (n: number) => Array.from({ length: n }, (_, i) => i)

export function groupBy<T, K extends string | number>(arr: T[], keyFn: (x: T) => K): Record<K, T[]> {
    return arr.reduce((acc, item) => {
        const k = keyFn(item)
            ; (acc[k] ||= []).push(item)
        return acc
    }, {} as Record<K, T[]>)
}

// ---- KPI calculations ----
export function computeKpis(tasks: Task[], daysWindow = 7) {
    const now = new Date()
    const windowStart = startOfDay(addDays(now, -daysWindow + 1))

    const withinWindow = tasks.filter(t => toDate(t.createdAt)! >= windowStart)

    const total = tasks.length
    const completed = tasks.filter(t => t.completed).length
    const active = total - completed

    const byPriority = { high: 0, medium: 0, low: 0 } as Record<Priority, number>
    tasks.forEach(t => { byPriority[priorityOf(t)]++ })

    const due7 = tasks.filter(t => isDueWithin(t, 7, now)).length
    const overdue = tasks.filter(t => isOverdue(t, now)).length

    // Streak: consecutive days (backwards from today) with >=1 completed task
    const completedByDay: Record<string, number> = {}
    tasks.filter(t => t.completed).forEach(t => {
        const d = toDate(t.updatedAt) || toDate(t.createdAt) || new Date()
        const key = startOfDay(d).toISOString()
        completedByDay[key] = (completedByDay[key] || 0) + 1
    })
    let streak = 0
    for (let i = 0; ; i++) {
        const day = startOfDay(addDays(now, -i)).toISOString()
        if (completedByDay[day] && completedByDay[day] > 0) streak++
        else break
    }

    // Carry-over rate: unfinished tasks whose due date is in the past
    const carryOver = tasks.filter(t => isOverdue(t, now)).length
    const carryOverRate = total ? carryOver / total : 0

    // Small wins: tasks with duration <= 25m (completed or active)
    const smallWinsTotal = tasks.filter(t => (t.durationMinutes ?? 0) > 0 && (t.durationMinutes ?? 0) <= 25).length
    const smallWinsDone = tasks.filter(t => t.completed && (t.durationMinutes ?? 0) > 0 && (t.durationMinutes ?? 0) <= 25).length

    return {
        total, completed, active,
        byPriority, due7, overdue,
        streak, carryOverRate,
        smallWins: { total: smallWinsTotal, done: smallWinsDone },
        withinWindow
    }
}

export function completionByLastNDays(tasks: Task[], n = 7) {
    const now = new Date()
    return range(n).map(offset => {
        const day = startOfDay(addDays(now, - (n - 1 - offset)))
        const count = tasks.filter(t => t.completed && isSameDay(toDate(t.updatedAt) || new Date(t.updatedAt), day)).length
        return { day, label: formatShortDate(day), value: count }
    })
}

export function priorityData(byPriority: Record<Priority, number>) {
    return [
        { name: 'High', value: byPriority.high },
        { name: 'Medium', value: byPriority.medium },
        { name: 'Low', value: byPriority.low },
    ]
}

export function bestHourOfDay(tasks: Task[]) {
    const hours = Array(24).fill(0)
    tasks.filter(t => t.completed).forEach(t => {
        const d = toDate(t.updatedAt)
        if (!d) return
        hours[d.getHours()]++
    })
    const max = Math.max(...hours)
    const idx = Math.max(0, hours.findIndex(v => v === max))
    return { hour: idx, count: max, series: hours }
}

export function hourWeekdayMatrix(tasks: Task[]) {
    const m = Array.from({ length: 7 }, () => Array(24).fill(0))
    tasks.filter(t => t.completed).forEach(t => {
        const d = toDate(t.updatedAt)
        if (!d) return
        const w = d.getDay()
        const h = d.getHours()
        m[w][h]++
    })
    return m
}