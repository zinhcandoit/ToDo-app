import type { Task } from '../types'
import React, { useState, useRef, useEffect, Suspense } from "react"
const TaskItem = React.lazy(() => import("./TaskItem"))
import { FixedSizeList } from "react-window";
import type { ListChildComponentProps } from "react-window"
import { isOverdue } from '../../../utils/analytics'
import { useToast } from '../../../components/Toast'

interface Props {
    tasks: Task[]
    onToggle: (id: string) => void
    onDelete: (task: Task) => void
    onEdit: (id: string, patch: Partial<Omit<Task, 'id'>>) => void
}

export function TaskList({ tasks, onToggle, onDelete, onEdit }: Props) {
    if (!tasks.length) {
        return (
            <div className="text-center p-8 text-sm text-gray-500 dark:text-gray-400">
                Nothing here yet. Add your first task!
            </div>
        )
    }
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    //Overdue Task
    const sorted = [...tasks].sort((a, b) => {
        const ao = isOverdue(a) ? 1 : 0;
        const bo = isOverdue(b) ? 1 : 0;
        if (ao !== bo) return bo - ao; // overdue trước
        return 0;
    });
    const { pushToast } = useToast();
    useEffect(() => {
        const overdueTasks = tasks.filter((t) => isOverdue(t));
        if (overdueTasks.length > 0) {
            pushToast({
                title: `Bạn có ${overdueTasks.length} task quá hạn`,
                description: "Hãy xử lý hoặc Snooze sang hôm nay nhé.",
            });
        }
    }, [tasks]);

    useEffect(() => {
        if (focusedIndex >= 0) {
            itemRefs.current[focusedIndex]?.focus();
        }
    }, [focusedIndex]);


    const Row = ({ index, style }: ListChildComponentProps) => {
        const t = sorted[index];
        return (
            <div key={t.id}
                style={style}
                ref={(el: HTMLDivElement | null) => {
                    itemRefs.current[index] = el;
                }}
                tabIndex={-1}
                className="focus:outline focus:outline-2 focus:outline-blue-500 rounded"
            >
                <Suspense
                    fallback={
                        <div className="h-[60px] bg-gray-100 dark:bg-neutral-800 animate-pulse rounded-xl" />
                    }
                >
                    <TaskItem
                        task={t}
                        onToggle={onToggle}
                        onDelete={onDelete}
                        onEdit={onEdit}
                    />
                </Suspense>
            </div>
        )
    }
    return (
        <FixedSizeList
            height={tasks.length < 5 ? tasks.length * 60 : 300}       // chiều cao khung cuộn
            itemCount={tasks.length}
            itemSize={60}
            width="100%"
        >
            {Row}
        </FixedSizeList>
    )
}
