import { http } from "../../lib/http";
import type { Task, NewTaskInput, TaskPatch } from "./types";

export const tasksClient = {
    list: () => http<Task[]>("/tasks"),

    create: (body: NewTaskInput) =>
        http<Task>("/tasks", { method: "POST", body }),

    patch: (id: string, body: TaskPatch | { completed: boolean }) =>
        http<Task>(`/tasks/${id}`, { method: "PATCH", body }),

    remove: (id: string) =>
        http<void>(`/tasks/${id}`, { method: "DELETE" }),
};
