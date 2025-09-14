import { http } from "../../lib/http";
import type { Task, NewTaskInput, TaskPatch } from "./types";

export const tasksClient = {
    list: () => http<Task[]>("/tasks"),
    create: (b: NewTaskInput) =>
        http<Task>("/tasks", { method: "POST", body: JSON.stringify(b) }),
    patch: (id: string, patch: TaskPatch | { completed: boolean }) =>
        http<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
    remove: (id: string) =>
        http<void>(`/tasks/${id}`, { method: "DELETE" }),
};