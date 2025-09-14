import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Task, Priority, TaskEditableFields, TaskPatch } from "../types";

const DEFAULT_ALARM_SRC = "/bell.mp3";

type Mode = "focus" | "short" | "long";

type TaskEditModalProps = {
    isOpen: boolean;
    task: Task;
    onCancel: () => void;
    onSave: (patch: TaskPatch) => void;
    alarmSrc?: string;
};

export function TaskEditModal({ isOpen, task, onCancel, onSave, alarmSrc }: TaskEditModalProps) {
    const [draft, setDraft] = useState<TaskEditableFields>(() => ({
        title: task.title,
        description: task.description ?? "",
        due: task.due,
        priority: task.priority ?? "medium",
    }));

    useEffect(() => {
        if (!isOpen) return;
        setDraft({
            title: task.title,
            description: task.description ?? "",
            due: task.due,
            priority: task.priority ?? "medium",
        });
    }, [isOpen, task]);

    const setField = <K extends keyof TaskEditableFields,>(key: K) => (val: TaskEditableFields[K]) =>
        setDraft((prev) => ({ ...prev, [key]: val }));

    const firstFieldRef = useRef<HTMLInputElement | null>(null);
    useEffect(() => {
        if (!isOpen) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const focusTimer = setTimeout(() => firstFieldRef.current?.focus(), 0);

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = prevOverflow;
            clearTimeout(focusTimer);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [isOpen, onCancel]);

    // ===== Pomodoro state =====
    const [mode, setMode] = useState<Mode>("focus");
    const [isRunning, setIsRunning] = useState(false);
    const [focusMin, setFocusMin] = useState(25);
    const [shortMin, setShortMin] = useState(5);
    const [longMin, setLongMin] = useState(15);
    //const [customMin, setCustomMin] = useState(30);

    const activeMinutes = useMemo(() => {
        switch (mode) {
            case "focus": return focusMin;
            case "short": return shortMin;
            case "long": return longMin;
            // case "custom": return customMin;
            default: return 25;
        }
    }, [mode, focusMin, shortMin, longMin, /*customMin*/]);

    const [timeLeft, setTimeLeft] = useState<number>(activeMinutes * 60);
    useEffect(() => {
        setTimeLeft(activeMinutes * 60);
        setIsRunning(false);
    }, [activeMinutes]);

    useEffect(() => {
        if (!isOpen) return;
        if (!isRunning || timeLeft <= 0) return;
        const t = setTimeout(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
        return () => clearTimeout(t);
    }, [isRunning, timeLeft, isOpen]);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    useEffect(() => {
        if (timeLeft === 0 && isRunning) {
            setIsRunning(false);
            try { audioRef.current?.play(); } catch { }
        }
    }, [timeLeft, isRunning]);

    const mm = Math.floor(timeLeft / 60);
    const ss = timeLeft % 60;
    const timeText = `${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;

    const percent = useMemo(() => {
        const total = activeMinutes * 60;
        return total > 0 ? 1 - timeLeft / total : 0;
    }, [timeLeft, activeMinutes]);

    const R = 90;
    const CIRC = 2 * Math.PI * R;
    const dash = CIRC;
    const gap = CIRC * (1 - percent);

    const trimOrUndef = (s?: string) => (s?.trim() ? s.trim() : undefined);
    const buildPatch = (orig: Task, d: TaskEditableFields): TaskPatch => {
        const patch: TaskPatch = {};
        if (d.title.trim() !== orig.title) patch.title = d.title.trim();
        if (trimOrUndef(d.description) !== trimOrUndef(orig.description)) patch.description = trimOrUndef(d.description);
        if ((d.due ?? undefined) !== (orig.due ?? undefined)) patch.due = d.due || undefined;
        if ((d.priority ?? undefined) !== (orig.priority ?? undefined)) patch.priority = d.priority;
        return patch;
    };

    const onSaveClick = () => {
        if (!draft.title.trim()) return;
        onSave(buildPatch(task, draft));
    };

    const todayISO = new Date().toISOString().slice(0, 10);

    if (!isOpen) return null;

    const modal = (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onCancel} aria-hidden="true" />
            <div className="relative mx-4 w-full max-w-5xl rounded-2xl bg-white shadow-xl dark:bg-zinc-900">
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-lg sm:text-xl font-semibold">Edit Task & Focus</h2>
                    <button onClick={onCancel} className="rounded-lg px-3 py-1.5 text-sm bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700">Close</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input
                                ref={firstFieldRef}
                                value={draft.title}
                                onChange={(e) => setField("title")(e.target.value)}
                                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Task title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={draft.description}
                                onChange={(e) => setField("description")(e.target.value)}
                                rows={6}
                                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Details, notes, links…"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Due date</label>
                                <input
                                    type="date"
                                    min={todayISO}
                                    value={draft.due ?? ""}
                                    onChange={(e) => setField("due")(e.target.value || undefined)}
                                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Priority</label>
                                <div className="flex gap-2">
                                    {(["low", "medium", "high"] as const).map((p: Priority) => (
                                        <button
                                            key={p}
                                            onClick={() => setField("priority")(p)}
                                            className={
                                                "flex-1 rounded-xl border px-3 py-2 capitalize " +
                                                (draft.priority === p ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : "border-zinc-300 dark:border-zinc-700")
                                            }
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={onCancel} className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800">Cancel</button>
                            <button onClick={onSaveClick} disabled={!draft.title.trim()} className="rounded-xl bg-blue-600 px-4 py-2 text-white disabled:opacity-50">Save</button>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div className="inline-flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1">
                                {([
                                    { k: "focus", label: "Focus" },
                                    { k: "short", label: "Short Break" },
                                    { k: "long", label: "Long Break" },
                                    //{ k: "custom", label: "Custom" },
                                ] as const).map((opt) => (
                                    <button
                                        key={opt.k}
                                        onClick={() => setMode(opt.k)}
                                        className={
                                            "px-3 py-1.5 text-sm rounded-lg " +
                                            (mode === opt.k ? "bg-white dark:bg-zinc-900 shadow" : "text-zinc-600 dark:text-zinc-300")
                                        }
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                {mode === "focus" && <DurationInput label="min" value={focusMin} onChange={setFocusMin} />}
                                {mode === "short" && <DurationInput label="min" value={shortMin} onChange={setShortMin} />}
                                {mode === "long" && <DurationInput label="min" value={longMin} onChange={setLongMin} />}
                                {/* {mode === "custom" && <DurationInput label="min" value={customMin} onChange={setCustomMin} />} */}
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col items-center">
                            <div className="relative h-60 w-60">
                                <svg viewBox="0 0 200 200" className="h-full w-full">
                                    <circle cx="100" cy="100" r={90} strokeWidth="12" className="fill-none stroke-zinc-200 dark:stroke-zinc-700" />
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r={90}
                                        strokeWidth="12"
                                        strokeDasharray={dash}
                                        strokeDashoffset={gap}
                                        className="fill-none stroke-blue-600 transition-all duration-1000 [transform:rotate(90deg)_scaleX(-1)] [transform-origin:center]"
                                    />
                                    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="text-3xl font-semibold fill-current">
                                        {timeText}
                                    </text>
                                </svg>
                            </div>

                            <div className="mt-4 flex items-center gap-3">
                                {!isRunning ? (
                                    <button onClick={() => setIsRunning(true)} className="rounded-xl bg-blue-600 px-5 py-2 text-white">Start</button>
                                ) : (
                                    <button onClick={() => setIsRunning(false)} className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-5 py-2">Pause</button>
                                )}
                                <button
                                    onClick={() => {
                                        setIsRunning(false);
                                        setTimeLeft(activeMinutes * 60);
                                        if (audioRef.current) {
                                            audioRef.current.pause();
                                            audioRef.current.currentTime = 0;
                                        }
                                    }}
                                    className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-5 py-2"
                                >
                                    Reset
                                </button>
                            </div>

                            <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">The ring fills as time elapses. When it reaches 00:00, an alarm will play.</p>
                            <audio ref={audioRef} src={alarmSrc ?? DEFAULT_ALARM_SRC} preload="auto" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}

function DurationInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
    const clamp = (n: number) => Math.max(1, Math.min(180, Math.round(n)));
    return (
        <div className="flex items-center gap-1">
            <input
                type="number"
                min={1}
                max={180}
                value={value}
                onChange={(e) => onChange(clamp(Number(e.target.value)))}
                className="w-16 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1 text-right"
                aria-label={`Duration in ${label}`}
            />
            <span className="text-sm text-zinc-500">{label}</span>
        </div>
    );
}

export default TaskEditModal;

