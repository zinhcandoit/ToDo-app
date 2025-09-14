export type Priority = 'low' | 'medium' | 'high'

export interface Task {
    id: string
    title: string
    description?: string
    due?: string        // ISO YYYY-MM-DD (hoặc datetime)
    priority?: Priority
    completed: boolean
    createdAt: string   // ISO
    updatedAt: string   // ISO
}

export interface NewTaskInput {
    title: string
    description?: string
    due?: string
    priority?: Priority
}

// Editable subset used by the TaskEditModal
export type TaskEditableFields = Pick<Task, 'title' | 'description' | 'due' | 'priority'>


// Minimal payload for PATCH /tasks/:id
export type TaskPatch = Partial<TaskEditableFields>