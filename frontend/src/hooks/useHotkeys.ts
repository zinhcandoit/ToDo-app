import { useEffect } from 'react'

export function useHotkeys(list: { combo: string, handler: (e: KeyboardEvent) => void | boolean, description?: string }[]) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const combo = [e.ctrlKey || e.metaKey ? 'ctrl' : '', e.shiftKey ? 'shift' : '', e.altKey ? 'alt' : '', e.key.toLowerCase()]
                .filter(Boolean).join('+')
            const item = list.find(x => x.combo === combo)
            if (item) {
                const res = item.handler(e)
                if (res !== false) {
                    e.preventDefault()
                    e.stopPropagation()
                }
            }
        }
        window.addEventListener('keydown', onKey, { capture: true })
        return () => window.removeEventListener('keydown', onKey, { capture: true })
    }, [JSON.stringify(list)])
}
