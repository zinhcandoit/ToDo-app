import type { ChangeEvent } from 'react'
import type { Priority } from '../types'

export type FiltersState = {
    q: string; status: 'all' | 'active' | 'completed'; priority: 'all' | Priority;
    sortBy: 'created-desc' | 'created-asc' | 'due-asc' | 'due-desc' | 'priority-desc'
}

export function FiltersBar({ value, onChange }: { value: FiltersState; onChange: (v: FiltersState) => void }) {
    const onInput = (e: ChangeEvent<HTMLInputElement>) => onChange({ ...value, q: e.target.value })
    return (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div className="flex-1">
                <label className="block text-sm font-medium mb-1" htmlFor="search-input">Search</label>
                <input id="search-input" value={value.q} onChange={onInput}
                    placeholder="Search title/description (Ctrl+K)"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={value.status} onChange={e => onChange({ ...value, status: e.target.value as any })}
                    className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2">
                    <option value="all">All</option><option value="active">Active</option><option value="completed">Completed</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select value={value.priority} onChange={e => onChange({ ...value, priority: e.target.value as any })}
                    className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2">
                    <option value="all">All</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Sort</label>
                <select value={value.sortBy} onChange={e => onChange({ ...value, sortBy: e.target.value as any })}
                    className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2">
                    <option value="created-desc">Newest</option><option value="created-asc">Oldest</option>
                    <option value="due-asc">Due ↑</option><option value="due-desc">Due ↓</option>
                    <option value="priority-desc">Priority</option>
                </select>
            </div>
        </div>
    )
}
