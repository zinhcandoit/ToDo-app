import { useEffect } from "react"

export function useTaskTitle(done: number, total: number) {
    useEffect(() => {
        const defaultTitle = document.title

        document.title = done
            ? `${done === total ? "😀" : "✅"} ${done}/${total} task${total > 1 ? "s" : ""}`
            : defaultTitle

        return () => {
            document.title = defaultTitle
        }
    }, [done, total])
}
