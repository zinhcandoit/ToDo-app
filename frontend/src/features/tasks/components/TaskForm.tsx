import { useRef, useState } from 'react'
import type { NewTaskInput, Priority } from '../types'

interface Props {
    onCreate: (input: NewTaskInput) => void;
    newButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

export const TaskForm = ({ onCreate, newButtonRef }: Props) => {
    const [title, setTitle] = useState(''); const [description, setDescription] = useState(''); const [due, setDue] = useState(''); const [priority, setPriority] = useState<Priority>('medium')
    const inputRef = useRef<HTMLInputElement | null>(null)

    const submit = () => {
        if (!title.trim()) return;
        onCreate({ title, description: description.trim() || undefined, due: due || undefined, priority });
        setTitle('');
        setDescription('');
        setDue('');
        setPriority('medium');
        inputRef.current?.focus()
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[220px]">
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input ref={inputRef} value={title} onChange={e => setTitle(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit() }}
                        placeholder="e.g. Finish hackathon demo"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="min-w-[160px]">
                    <label className="block text-sm font-medium mb-1">Due date</label>
                    <input
                        type="date"
                        value={due}
                        onChange={e => setDue(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}   // yyyy-mm-dd của hôm nay
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
                    />
                </div>
                <div className="min-w-[160px]">
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <select value={priority} onChange={e => setPriority(e.target.value as Priority)}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2">
                        <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                    </select>
                </div>
                <button ref={newButtonRef as any} onClick={submit}
                    className="kb-focus inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 bg-indigo-600 text-white hover:bg-indigo-700">
                    Add
                </button>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Optional notes…"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 min-h-[80px]" />
            </div>
        </div>
    )
}
