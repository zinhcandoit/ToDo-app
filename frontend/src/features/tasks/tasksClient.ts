import type { Task, NewTaskInput, TaskPatch } from "./types";
import { http } from "../../lib/http"

export interface TasksClient {
    list(): Promise<Task[]>;
    create(input: NewTaskInput): Promise<Task>;
    patch(id: string, patch: TaskPatch | { completed: boolean }): Promise<Task>;
    remove(id: string): Promise<void>;
}

export const tasksClient: TasksClient = {
    list: () => http<Task[]>("/tasks"),
    create: (b) => http<Task>("/tasks", { method: "POST", body: JSON.stringify(b) }),
    patch: (id, b) => http<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(b) }),
    remove: (id) => http(`/tasks/${id}`, { method: "DELETE" }).then(() => { }),
};