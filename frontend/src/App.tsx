import { useState, useRef } from 'react'
import { TaskForm } from './features/tasks/components/TaskForm'
import { TaskList } from './features/tasks/components/TaskList'
import { TaskEditModal } from './features/tasks/components/TaskEdit'
import { FiltersBar, type FiltersState } from './features/tasks/components/FiltersBar'
import { useTasks } from './features/tasks/state'
import type { NewTaskInput } from './features/tasks/types'
import { Toaster, useToast } from './components/Toast'
import AuthOverlay from "./components/Authentication"
import { toast } from "./lib/toast"
import { ViewTabs, type ViewKey } from './views/ViewTabs'
import { CalendarView } from './views/CalendarView'
import AnalyticsView from './views/AnalyticsView'
import CaringView from './views/CaringView'

import { useVisibleTasks } from './hooks/useVisibleTasks'
import { useTaskTitle } from './hooks/useTaskTitle'
import { useTaskHotkeys } from './hooks/useTaskHotkeys'

// --- ViewRenderer ---
function ViewRenderer({
    view,
    tasks,
    visible,
    filters,
    setFilters,
    newButtonRef,
    onAdd,
    onToggle,
    onEdit,
    onDelete,
    onRequestEdit,
}: {
    view: ViewKey
    tasks: ReturnType<typeof useTasks>["tasks"]
    visible: typeof tasks
    filters: FiltersState
    setFilters: (f: FiltersState) => void
    newButtonRef?: React.RefObject<HTMLButtonElement | null>
    onAdd: (input: any) => void
    onToggle: (id: string) => void
    onEdit: (id: string, patch: any) => void
    onDelete: (t: any) => void
    onRequestEdit: (id: string) => void
}) {
    switch (view) {
        case 'list':
            return (
                <>
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 bg-white/70 dark:bg-gray-900/60 shadow-sm backdrop-blur">
                        <FiltersBar value={filters} onChange={setFilters} />
                    </div>
                    <section className="rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 bg-white/80 dark:bg-gray-900/70 shadow-md backdrop-blur">
                        <TaskForm onCreate={onAdd} newButtonRef={newButtonRef} />
                        <TaskList tasks={visible} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
                    </section>
                </>
            )
        case 'calendar':
            return (
                <section className="rounded-2xl border border-gray-200 dark:border-gray-800 p-5 bg-white/80 dark:bg-gray-900/70 shadow-md backdrop-blur">
                    <CalendarView tasks={tasks} onToggle={onToggle} onEdit={onEdit} onRequestEdit={onRequestEdit} />
                </section>
            )
        case 'analytics':
            return (
                <section className="rounded-2xl border border-gray-200 dark:border-gray-800 p-5 bg-white/80 dark:bg-gray-900/70 shadow-md backdrop-blur">
                    <AnalyticsView tasks={tasks} />
                </section>
            )
        case 'caring':
            return (
                <section className="rounded-2xl border border-gray-200 dark:border-gray-800 p-5 bg-white/80 dark:bg-gray-900/70 shadow-md backdrop-blur">
                    <CaringView musicSrc="/music.mp3" />
                </section>
            )
        default:
            return null
    }
}

// --- App ---
export default function App() {
    const { tasks, addTask, updateTask, toggleTask, deleteTask, clearCompleted } = useTasks()
    const { pushToast } = useToast()

    const [authOpen, setAuthOpen] = useState(false)
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
    const [filters, setFilters] = useState<FiltersState>({
        q: '',
        status: 'all',
        priority: 'all',
        sortBy: 'created-desc',
    })
    const [view, setView] = useState<ViewKey>('list')

    const visible = useVisibleTasks(tasks, filters)
    const newButtonRef = useRef<HTMLButtonElement | null>(null)

    const total = tasks.length
    const done = tasks.filter(t => t.completed).length

    useTaskTitle(done, total)
    useTaskHotkeys(tasks, clearCompleted, pushToast)

    // const handleAdd = (input: any) => {
    //     const t = addTask(input)
    //     pushToast({ title: 'Task added', description: t.title })
    // }
    const handleAdd = (input: NewTaskInput) => {
        addTask(input).then((t) => {
            pushToast({ title: 'Task added', description: t.title })
        });
    };

    const handleDelete = (task: any) => {
        const snapshot = [...tasks]
        deleteTask(task.id)
        pushToast({
            title: 'Task deleted',
            description: task.title,
            action: {
                label: 'Undo',
                onClick: () => {
                    localStorage.setItem('app.tasks', JSON.stringify({ v: 1, tasks: snapshot }))
                    location.reload()
                },
            },
        })
    }

    return (
        <div className="min-h-full py-8">
            <header className="container-prose mb-6 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl stroke-2 stroke-black font-bold tracking-tight">Student Time Manager</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {done}/{total} completed
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            toast.info("Welcome! Click sign in to try overlay.")
                            setAuthOpen(true)
                        }}
                        className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
                    >
                        Sign in/Sign up
                    </button>
                </div>
            </header>

            <main className="container-prose space-y-6">
                <div className="flex items-center justify-between">
                    <ViewTabs value={view} onChange={setView} />
                </div>

                <ViewRenderer
                    view={view}
                    tasks={tasks}
                    visible={visible}
                    filters={filters}
                    setFilters={setFilters}
                    newButtonRef={newButtonRef}
                    onAdd={handleAdd}
                    onToggle={toggleTask}
                    onEdit={updateTask}
                    onDelete={handleDelete}
                    onRequestEdit={setEditingTaskId}
                />
            </main>

            <AuthOverlay open={authOpen} onClose={() => setAuthOpen(false)} />

            {editingTaskId && (
                <TaskEditModal
                    isOpen
                    task={tasks.find(t => t.id === editingTaskId)!}
                    onCancel={() => setEditingTaskId(null)}
                    onSave={(patch) => {
                        updateTask(editingTaskId, patch)
                        setEditingTaskId(null)
                    }}
                />
            )}

            <Toaster />
        </div>
    )
}

