import React, { useMemo, useState } from 'react'
import type { Task } from '../utils/analytics'
import { StatCard } from '../features/tasks/components/StatCard'
import { computeKpis, completionByLastNDays, priorityData, bestHourOfDay } from '../utils/analytics'

interface AnalyticsViewProps { tasks: Task[] }

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
        {children}
    </div>
)

const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => (
    <div className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-4 ${className}`}>
        {children}
    </div>
)

/** Priority bars – chiều cao theo % container (gọn) */
const SimpleBars: React.FC<{ data: { name: string; value: number }[] }> = ({ data }) => {
    const max = Math.max(1, ...data.map(d => d.value))
    return (
        <div className="h-32 flex items-end gap-4">
            {data.map(d => (
                <div key={d.name} className="flex-1 h-full flex flex-col items-center justify-end">
                    <div
                        className="w-8 bg-indigo-500/80 rounded-t-md transition-all"
                        style={{ height: `${(d.value / max) * 100}%` }}   // % giờ mới ăn theo h-32
                    />
                    <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">{d.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{d.value}</div>
                </div>
            ))}
        </div>
    )
}


/** Sparkline completions – SVG co giãn (gọn) */
const Sparkline: React.FC<{ data: number[] }> = ({ data }) => {
    const w = 600, h = 160, pad = 8
    const max = Math.max(1, ...data)
    const toX = (i: number) => pad + (i * (w - 2 * pad)) / Math.max(1, (data.length - 1))
    const toY = (v: number) => pad + (h - 2 * pad) * (1 - v / max)
    const line = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ')
    const area = `${line} L ${toX(data.length - 1)} ${h - pad} L ${toX(0)} ${h - pad} Z`
    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-36">
            <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
                </linearGradient>
            </defs>
            <path d={area} fill="url(#sg)" />
            <path d={line} fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
    )
}

export default function AnalyticsView({ tasks }: AnalyticsViewProps) {
    const [windowDays, setWindowDays] = useState<7 | 30 | 90 | 365>(7)

    const kpis = useMemo(() => computeKpis(tasks, windowDays), [tasks, windowDays])
    const daily = useMemo(() => completionByLastNDays(tasks, windowDays), [tasks, windowDays])
    const pData = useMemo(() => priorityData(kpis.byPriority), [kpis])
    const bestHour = useMemo(() => bestHourOfDay(tasks), [tasks])

    const suggestions = useMemo(
        () => buildSuggestions(kpis.streak, kpis.carryOverRate, bestHour.hour, bestHour.count),
        [kpis.streak, kpis.carryOverRate, bestHour]
    )

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Analytics</h1>
                <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                    {([7, 30, 90, 365] as const).map(n => (
                        <button
                            key={n}
                            onClick={() => setWindowDays(n)}
                            className={`px-3 py-1.5 text-sm rounded-lg ${windowDays === n
                                ? 'bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-slate-100'
                                : 'text-slate-600 dark:text-slate-300'}`}
                        >
                            {n === 365 ? 'All' : `Last ${n}d`}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI cards */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total" value={kpis.total} sub={`Active ${kpis.active} · Done ${kpis.completed}`} />
                <StatCard title="Due ≤ 7 days" value={kpis.due7} sub={`${kpis.overdue} overdue`} />
                <StatCard title="Streak" value={`${kpis.streak} day${kpis.streak === 1 ? '' : 's'}`} sub="Consecutive days ≥1 done" />
                <StatCard title="Carry-over" value={`${Math.round(kpis.carryOverRate * 100)}%`} sub="Tasks overdue" progress={kpis.carryOverRate} />
            </div>

            {/* Charts row (gọn) */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card>
                    <SectionTitle>Priority distribution</SectionTitle>
                    <SimpleBars data={pData} />
                </Card>

                <Card className="lg:col-span-2">
                    <SectionTitle>Completions (last {windowDays === 365 ? 'all' : windowDays} days)</SectionTitle>
                    <Sparkline data={daily.map(d => d.value)} />
                </Card>
            </div>

            {/* Best time + Suggestions (song song) */}
            <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                    <SectionTitle>Best time of day</SectionTitle>
                    <div className="mt-2 text-lg text-slate-700 dark:text-slate-200">
                        {bestHour.count > 0 ? `${String(bestHour.hour).padStart(2, '0')}:00` : '—'}
                    </div>
                    <div className="mt-6 h-1 w-full rounded-full bg-slate-200/70 dark:bg-slate-800 overflow-hidden">
                        <div
                            className="h-2 bg-emerald-500"
                            style={{ width: `${(bestHour.count ? (bestHour.count / Math.max(1, Math.max(...bestHour.series))) : 0) * 100}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        Khung giờ bạn hoàn thành nhiều nhất — đặt task khó vào khung giờ này.
                    </p>
                </Card>

                <Card>
                    <SectionTitle>Gợi ý hành động</SectionTitle>
                    <ul className="mt-2 grid grid-cols-1 gap-2 text-sm text-slate-700 dark:text-slate-200">
                        {suggestions.map((s, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span className="mt-1">•</span><span>{s}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    )
}

/* -------- helpers -------- */
function buildSuggestions(streak: number, carry: number, bestHour: number, bestHourCount: number) {
    const out: string[] = []
    if (bestHourCount > 0) out.push(`Đặt nhắc nhở lặp ngày vào ${String(bestHour).padStart(2, '0')}:00 cho 1 task khó.`)
    if (streak < 2) out.push('Khởi động streak bằng 1 task siêu nhỏ (≤10 phút) hôm nay.')
    else out.push(`Giữ streak ${streak} ngày: đừng bỏ ngày nào, dù chỉ hoàn thành 1 việc nhỏ.`)
    if (carry > 0.2) out.push('Tỷ lệ carry-over cao: dời các task quá hạn sang Today và chia nhỏ 3 bước.')
    else out.push('Carry-over thấp — có thể nâng độ khó của 1 task quan trọng trong tuần này.')
    return out
}