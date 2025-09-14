import { useEffect, useReducer } from 'react'
import type { NewTaskInput, Task, TaskPatch, Priority } from './types'
import { safeParseJSON } from '../../lib/safeParseJSON'
import { makeId } from '../../lib/id'
import { tasksClient } from './tasksClient'

const STORAGE_KEY = 'app.tasks'
const SCHEMA_VERSION = 1
const IS_MOCK = import.meta.env.VITE_USE_MOCK_TASKS === 'true'

interface PersistShape {
    v: number
    tasks: Task[]
}

const nowISO = () => new Date().toISOString()

function createTask(input: NewTaskInput): Task {
    const ts = nowISO()
    return {
        id: makeId(),
        title: input.title.trim(),
        description: input.description?.trim() || undefined,
        due: input.due || undefined,
        priority: input.priority || 'low',
        completed: false,
        createdAt: ts,
        updatedAt: ts,
    }
}

function migrate(data: any): PersistShape {
    const parsed = safeParseJSON<PersistShape>(JSON.stringify(data))
    if (!parsed) return { v: SCHEMA_VERSION, tasks: [] }
    return { v: SCHEMA_VERSION, tasks: parsed.tasks ?? [] }
}

type Action =
    | { type: 'add', input: NewTaskInput }
    | { type: 'update', id: string, patch: Partial<Omit<Task, 'id'>> }
    | { type: 'toggle', id: string }
    | { type: 'delete', id: string }
    | { type: 'replace', tasks: Task[] }
    | { type: 'clearCompleted' }

function reducer(state: Task[], action: Action): Task[] {
    switch (action.type) {
        case 'add': {
            const t = createTask(action.input)
            return [t, ...state]
        }
        case 'update': {
            return state.map(t => t.id === action.id ? { ...t, ...action.patch, updatedAt: nowISO() } : t)
        }
        case 'toggle': {
            return state.map(t => t.id === action.id ? { ...t, completed: !t.completed, updatedAt: nowISO() } : t)
        }
        case 'delete': {
            return state.filter(t => t.id !== action.id)
        }
        case 'replace': {
            return action.tasks
        }
        case 'clearCompleted': {
            return state.filter(t => !t.completed)
        }
        default:
            return state
    }
}

function loadInitial(): Task[] {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    try {
        const data = JSON.parse(raw)
        const migrated = migrate(data)
        return migrated.tasks
    } catch {
        return []
    }
}

// export function useTasks() {
//     const [state, dispatch] = useReducer(reducer, [], loadInitial)

//     useEffect(() => {
//         const payload: PersistShape = { v: SCHEMA_VERSION, tasks: state }
//         localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
//     }, [state])

//     return {
//         tasks: state,
//         addTask: (input: NewTaskInput) => {
//             const next = reducer(state, { type: 'add', input })
//             dispatch({ type: 'replace', tasks: next })
//             return next[0]
//         },
//         updateTask: (id: string, patch: Partial<Omit<Task, 'id'>>) => dispatch({ type: 'update', id, patch }),
//         toggleTask: (id: string) => dispatch({ type: 'toggle', id }),
//         deleteTask: (id: string) => dispatch({ type: 'delete', id }),
//         clearCompleted: () => dispatch({ type: 'clearCompleted' }),
//         replaceAll: (tasks: Task[]) => dispatch({ type: 'replace', tasks }),
//         snoozeTask: (id: string) => {
//             const today = new Date().toISOString().slice(0, 10)
//             dispatch({ type: 'update', id, patch: { due: today } })
//         }
//     }
// }
export function useTasks() {
    const [state, dispatch] = useReducer(reducer, [], () => (IS_MOCK ? loadInitial() : []))
    const isMock = IS_MOCK

    // ---- persist local (mock mode) ----
    useEffect(() => {
        if (isMock) {
            const payload = { v: SCHEMA_VERSION, tasks: state }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
        }
    }, [state, isMock])

    // ---- real mode: load from BE on mount ----
    useEffect(() => {
        if (!isMock) {
            tasksClient.list().then(tasks => dispatch({ type: "replace", tasks }))
        }
    }, [isMock])

    return {
        tasks: state,

        addTask: async (input: NewTaskInput) => {
            if (isMock) {
                const next = reducer(state, { type: "add", input })
                dispatch({ type: "replace", tasks: next })
                return next[0]
            }
            const t = await tasksClient.create(input)
            dispatch({ type: "replace", tasks: [t, ...state] })
            return t
        },

        updateTask: async (id: string, patch: TaskPatch) => {
            if (isMock) {
                dispatch({ type: "update", id, patch })
            } else {
                const t = await tasksClient.patch(id, patch)
                dispatch({ type: "update", id, patch: t })
            }
        },

        toggleTask: async (id: string) => {
            if (isMock) {
                dispatch({ type: "toggle", id })
            } else {
                const target = state.find(t => t.id === id)
                if (!target) return
                const t = await tasksClient.patch(id, { completed: !target.completed })
                dispatch({ type: "update", id, patch: t })
            }
        },

        deleteTask: async (id: string) => {
            if (isMock) {
                dispatch({ type: "delete", id })
            } else {
                await tasksClient.remove(id)
                dispatch({ type: "delete", id })
            }
        },

        clearCompleted: () => dispatch({ type: "clearCompleted" }),

        replaceAll: (tasks: Task[]) => dispatch({ type: "replace", tasks }),

        snoozeTask: async (id: string) => {
            const today = new Date().toISOString().slice(0, 10)
            if (isMock) {
                dispatch({ type: "update", id, patch: { due: today } })
            } else {
                const t = await tasksClient.patch(id, { due: today })
                dispatch({ type: "update", id, patch: t })
            }
        },
    }
}

export function priBadge(p?: Priority) {
    const priCl =
        p === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            : p === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    return priCl;
}
