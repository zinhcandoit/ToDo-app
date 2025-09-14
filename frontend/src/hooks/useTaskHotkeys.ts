import { useHotkeys } from "./useHotkeys"
import type { Task } from "../features/tasks/types"

export function useTaskHotkeys(
    tasks: Task[],
    clearCompleted: () => void,
    pushToast: (options: any) => void
) {
    useHotkeys([
        {
            combo: "n",
            handler: () => {
                const newBtn = document.querySelector<HTMLButtonElement>("#new-task-btn")
                newBtn?.click()
            },
        },
        {
            combo: "ctrl+k",
            handler: () => {
                (document.getElementById("search-input") as HTMLInputElement | null)?.focus()
            },
        },
        {
            combo: "shift+d",
            handler: () => {
                if (!tasks.some(t => t.completed)) return
                const count = tasks.filter(t => t.completed).length
                const snapshot = [...tasks]
                clearCompleted()
                pushToast({
                    title: `Cleared ${count} completed task${count > 1 ? "s" : ""}`,
                    action: {
                        label: "Undo",
                        onClick: () => {
                            localStorage.setItem("app.tasks", JSON.stringify({ v: 1, tasks: snapshot }))
                            location.reload()
                        },
                    },
                })
            },
        },
    ])
}
