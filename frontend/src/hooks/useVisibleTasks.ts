import { useMemo } from "react"
import type { FiltersState } from "../features/tasks/components/FiltersBar"
import type { Task } from "../features/tasks/types"

const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 } as const

export function useVisibleTasks(tasks: Task[], filters: FiltersState) {
    return useMemo(() => {
        const q = filters.q.trim().toLowerCase()

        const arr = tasks.filter(t => {
            if (filters.status === "active" && t.completed) return false
            if (filters.status === "completed" && !t.completed) return false
            if (filters.priority !== "all" && (t.priority ?? "low") !== filters.priority) return false
            if (q && !(`${t.title} ${t.description ?? ""}`.toLowerCase().includes(q))) return false
            return true
        })

        arr.sort((a, b) => {
            switch (filters.sortBy) {
                case "created-desc":
                    return (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
                case "created-asc":
                    return (a.createdAt ?? "").localeCompare(b.createdAt ?? "")
                case "due-asc":
                    return (a.due ?? "").localeCompare(b.due ?? "")
                case "due-desc":
                    return (b.due ?? "").localeCompare(a.due ?? "")
                case "priority-desc":
                    return PRIORITY_ORDER[b.priority ?? "low"] - PRIORITY_ORDER[a.priority ?? "low"]
                default:
                    return 0
            }
        })

        return arr
    }, [tasks, filters])
}
