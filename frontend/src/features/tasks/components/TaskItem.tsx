// import { useState, useRef, useEffect, type KeyboardEventHandler } from "react";
// import type { Task, TaskPatch } from "../types";
// import { TaskEditModal } from "./TaskEdit";
// import { priBadge } from "../state"
// import { playTick } from '../../../utils/tickSound'

// interface Props {
//     task: Task;
//     onToggle: (id: string) => void;
//     onDelete: (task: Task) => void;
//     onEdit: (id: string, patch: Partial<Omit<Task, 'id'>>) => void
// }

// export default function TaskItem({ task, onToggle, onDelete, onEdit }: Props) {
//     const [isEditing, setIsEditing] = useState(false);
//     //const liRef = useRef<HTMLLIElement | null>(null);
//     const pri = task.priority ?? "low";

//     // Handlers đặt tên rõ ràng giúp trace log dễ
//     const openEdit = () => setIsEditing(true);
//     const closeEdit = () => setIsEditing(false);
//     const saveEdit = (patch: TaskPatch) => {
//         // Không đổi gì thì đóng luôn
//         if (Object.keys(patch).length === 0) {
//             closeEdit();
//             return;
//         }
//         onEdit(task.id, patch);   // ví dụ: cập nhật trong state/BE
//         closeEdit();
//     };
//     const handleKeyDown: KeyboardEventHandler<HTMLLIElement> = (e) => {
//         if (e.key === "Enter" || e.key === "NumpadEnter") {
//             if (e.currentTarget === e.target) {
//                 e.preventDefault();
//                 openEdit();           // => setIsEditing(true)
//             }
//         }
//     };

//     // useEffect(() => {
//     //     const el = liRef.current;
//     //     if (!el) return;
//     //     const handler = () => setIsEditing(true);
//     //     el.addEventListener("open-edit", handler as EventListener);
//     //     return () => el.removeEventListener("open-edit", handler as EventListener);
//     // }, []);

//     return (
//         <>
//             <li /*ref={liRef}*/ className="group grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-800 p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
//                 tabIndex={0}
//                 role="button"
//                 aria-label={`Open ${task.title} in Focus Mode`}
//                 onKeyDown={handleKeyDown}
//                 onClick={openEdit}
//             >
//                 <input
//                     type="checkbox"
//                     checked={task.completed}
//                     onChange={(e) => { onToggle(task.id); if (e.target.checked) playTick() }}
//                     aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
//                     className="mt-1 h-5 w-5 rounded border-gray-300 dark:border-gray-700"
//                     data-testid="task-toggle"
//                 />

//                 <div className="min-w-0">
//                     <div className="flex items-center gap-2">
//                         <p
//                             className={`truncate font-medium ${task.completed ? "line-through text-gray-400" : ""
//                                 }`}
//                         >
//                             {task.title}
//                         </p>
//                         <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${priBadge(pri)}`}>
//                             {pri}
//                         </span>
//                         {task.due && (
//                             <span className="shrink-0 rounded-full px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
//                                 {task.due}
//                             </span>
//                         )}
//                     </div>

//                     {task.description && (
//                         <p
//                             className={`text-sm mt-1 overflow-hidden text-ellipsis whitespace-nowrap ${task.completed
//                                 ? "line-through text-gray-400"
//                                 : "text-gray-600 dark:text-gray-300"
//                                 }`}
//                         >
//                             {task.description}
//                         </p>
//                     )}
//                 </div>

//                 {/* Actions (hiện khi hover) */}
//                 <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                     <button
//                         className="kb-focus rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
//                         onClick={openEdit}
//                         data-testid="task-edit-btn"
//                     >
//                         Focus
//                     </button>
//                     <button
//                         className="kb-focus rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
//                         onClick={() => onDelete(task)}
//                         data-testid="task-delete-btn"
//                     >
//                         Delete
//                     </button>
//                 </div>
//             </li>
//             {/* Focusing Mode */}
//             <TaskEditModal
//                 isOpen={isEditing}
//                 task={task}
//                 onCancel={closeEdit}
//                 onSave={saveEdit}
//             />
//         </>
//     );
// }

import { useState, type KeyboardEventHandler } from "react";
import type { Task, TaskPatch } from "../types";
import { TaskEditModal } from "./TaskEdit";
import { priBadge } from "../state";
import { playTick } from "../../../utils/tickSound";
import { isOverdue } from "../../../utils/analytics"

interface Props {
    task: Task;
    onToggle: (id: string) => void;
    onDelete: (task: Task) => void;
    onEdit: (id: string, patch: Partial<Omit<Task, "id">>) => void;
}

export default function TaskItem({ task, onToggle, onDelete, onEdit }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const pri = task.priority ?? "low";

    const overdue = isOverdue(task);

    // Handlers
    const openEdit = () => setIsEditing(true);
    const closeEdit = () => setIsEditing(false);
    const saveEdit = (patch: TaskPatch) => {
        if (Object.keys(patch).length === 0) {
            closeEdit();
            return;
        }
        onEdit(task.id, patch);
        closeEdit();
    };

    const handleKeyDown: KeyboardEventHandler<HTMLLIElement> = (e) => {
        if (e.key === "Enter" || e.key === "NumpadEnter") {
            if (e.currentTarget === e.target) {
                e.preventDefault();
                openEdit();
            }
        }
    };

    return (
        <>
            <li
                className={`group grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-xl p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
                ${overdue ? "bg-red-50 border border-red-300" : "border border-transparent hover:border-gray-200 dark:hover:border-gray-800"}`}
                tabIndex={0}
                role="button"
                aria-label={`Open ${task.title} in Focus Mode`}
                onKeyDown={handleKeyDown}
                onClick={openEdit}
            >
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => {
                        onToggle(task.id);
                        if (e.target.checked) playTick();
                    }}
                    aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                    className="mt-1 h-5 w-5 rounded border-gray-300 dark:border-gray-700"
                    data-testid="task-toggle"
                />

                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <p
                            className={`truncate font-medium ${task.completed ? "line-through text-gray-400" : ""
                                }`}
                        >
                            {task.title}
                        </p>
                        <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${priBadge(
                                pri
                            )}`}
                        >
                            {pri}
                        </span>
                        {task.due && (
                            <span className="shrink-0 rounded-full px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                {task.due}
                            </span>
                        )}
                        {overdue && (
                            <span className="shrink-0 rounded-full px-2 py-0.5 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                Overdue
                            </span>
                        )}
                    </div>

                    {task.description && (
                        <p
                            className={`text-sm mt-1 overflow-hidden text-ellipsis whitespace-nowrap ${task.completed
                                ? "line-through text-gray-400"
                                : "text-gray-600 dark:text-gray-300"
                                }`}
                        >
                            {task.description}
                        </p>
                    )}
                </div>

                {/* Actions (hiện khi hover) */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        className="kb-focus rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={openEdit}
                        data-testid="task-edit-btn"
                    >
                        Focus
                    </button>
                    {overdue && (
                        <button
                            className="kb-focus rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1 text-sm text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(task.id, {
                                    due: new Date().toISOString().slice(0, 10),
                                });
                            }}
                        >
                            Snooze
                        </button>
                    )}
                    <button
                        className="kb-focus rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(task);
                        }}
                        data-testid="task-delete-btn"
                    >
                        Delete
                    </button>
                </div>
            </li>

            {/* Focusing Mode */}
            <TaskEditModal
                isOpen={isEditing}
                task={task}
                onCancel={closeEdit}
                onSave={saveEdit}
            />
        </>
    );
}
