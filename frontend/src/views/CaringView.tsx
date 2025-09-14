import React, { useEffect, useMemo, useRef, useState } from "react";

type Step = "ask" | "yes" | "no" | "submitted";

type Option = {
    id: string;
    label: string;
};

const DEFAULT_OPTIONS: Option[] = [
    { id: "study", label: "Học tập / Bài tập" },
    { id: "deadline", label: "Quá tải deadline" },
    { id: "motivation", label: "Thiếu động lực" },
    { id: "schedule", label: "Lịch học trùng / Quản lý thời gian" },
    { id: "work", label: "Công việc làm thêm" },
    { id: "finance", label: "Tài chính" },
    { id: "health", label: "Sức khỏe" },
    { id: "family", label: "Gia đình" },
    { id: "friends", label: "Bạn bè / Quan hệ" },
    { id: "other", label: "Khác (ghi rõ)" },
];

type Props = {
    /** Nhạc nền – nếu không truyền, component sẽ tìm `/music.mp3` trong public */
    musicSrc?: string;
    /** Bật/tắt tự phát khi vào view (một số trình duyệt cần user click mới phát được) */
    autoplay?: boolean;
};

export default function CaringView({ musicSrc, autoplay = true }: Props) {
    const [step, setStep] = useState<Step>("ask");
    const [choice, setChoice] = useState<"yes" | "no" | "">("");
    const [selected, setSelected] = useState<string[]>([]);
    const [otherText, setOtherText] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const src = musicSrc || "/music.mp3"; // đặt file vào public/music.mp3

    // Auto play/pause theo vòng đời view
    useEffect(() => {
        const el = audioRef.current;
        if (!el) return;
        if (autoplay) {
            el.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
        return () => {
            el.pause();
            el.currentTime = 0;
            setIsPlaying(false);
        };
    }, [autoplay]);

    const togglePlay = async () => {
        const el = audioRef.current;
        if (!el) return;
        if (isPlaying) {
            el.pause();
            setIsPlaying(false);
        } else {
            try {
                await el.play();
                setIsPlaying(true);
            } catch {
                setIsPlaying(false);
            }
        }
    };

    // Helpers
    const isOtherChecked = selected.includes("other");
    const canSubmitNo = useMemo(() => {
        if (selected.length === 0) return false;
        if (isOtherChecked && !otherText.trim()) return false;
        return true;
    }, [selected, isOtherChecked, otherText]);

    const resetAll = () => {
        setStep("ask");
        setChoice("");
        setSelected([]);
        setOtherText("");
    };

    const toggleOption = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    return (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 bg-white/80 dark:bg-gray-900/70 shadow-md backdrop-blur">

            {/* Header kiểu Google Form */}
            <div className="rounded-xl overflow-hidden mb-5">
                <div className="h-16 bg-gradient-to-r from-purple-600 to-indigo-600" />
                <div className="bg-white dark:bg-gray-900 px-4 py-3 border-x border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg sm:text-xl font-semibold">Caring Form</h2>
                            <p className="text-xs text-gray-500">Cảm ơn bạn đã dành thời gian chia sẻ 💚</p>
                        </div>

                        {/* Music control */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={togglePlay}
                                className={
                                    "relative inline-flex items-center justify-center h-9 w-9 rounded-full border transition-colors " +
                                    (isPlaying
                                        ? "border-indigo-400 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-700"
                                        : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800")
                                }
                                aria-pressed={isPlaying}
                                aria-label={isPlaying ? "Tạm dừng nhạc" : "Phát nhạc"}
                                title={isPlaying ? "Tạm dừng nhạc" : "Phát nhạc"}
                            >
                                <span aria-hidden="true" className="text-base leading-none">♪</span>
                                {/* chấm báo hiệu đang phát */}
                                {isPlaying && (
                                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                                )}
                            </button>

                            {/* audio element giữ nguyên */}
                            <audio ref={audioRef} loop preload="auto">
                                <source src={src} />
                            </audio>
                        </div>
                    </div>
                </div>
            </div>

            {/* Nội dung câu hỏi / form */}
            {step === "ask" && (
                <section className="space-y-4">
                    <h3 className="text-lg font-medium">Bạn đang gặp khó khăn à?</h3>

                    <div className="mt-2 space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name="q1"
                                className="h-4 w-4"
                                checked={choice === "yes"}
                                onChange={() => {
                                    setChoice("yes");
                                    setStep("yes");
                                }}
                            />
                            <span>Yes</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name="q1"
                                className="h-4 w-4"
                                checked={choice === "no"}
                                onChange={() => {
                                    setChoice("no");
                                    setStep("no");
                                }}
                            />
                            <span>No</span>
                        </label>
                    </div>
                </section>
            )}

            {step === "no" && (
                <section className="text-center py-10">
                    <p className="text-xl font-semibold text-emerald-600">
                        Thanks for caring me! Enjoy your moment ✨
                    </p>
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={resetAll}
                            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            Trở lại câu hỏi
                        </button>
                    </div>
                </section>
            )}

            {step === "yes" && (
                <form
                    className="space-y-6"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!canSubmitNo) return;
                        setStep("submitted");
                    }}
                >
                    <h3 className="text-lg font-medium">Hãy nói cho tôi về vấn đề của bạn</h3>

                    {/* Checklist kiểu Google Forms */}
                    <ul className="space-y-2">
                        {DEFAULT_OPTIONS.map((opt) => (
                            <li key={opt.id} className="flex items-start gap-3">
                                <input
                                    id={`opt_${opt.id}`}
                                    type="checkbox"
                                    className="mt-0.5 h-4 w-4"
                                    checked={selected.includes(opt.id)}
                                    onChange={() => toggleOption(opt.id)}
                                />
                                <label htmlFor={`opt_${opt.id}`} className="select-none cursor-pointer">
                                    {opt.label}
                                </label>
                                {/* Ô Khác */}
                                {opt.id === "other" && isOtherChecked && (
                                    <input
                                        className="ml-2 flex-1 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1 text-sm bg-white dark:bg-gray-900"
                                        placeholder="Mô tả ngắn gọn…"
                                        value={otherText}
                                        onChange={(e) => setOtherText(e.target.value)}
                                    />
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-2">
                        <button
                            type="button"
                            onClick={resetAll}
                            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            Quay lại
                        </button>

                        <button
                            type="submit"
                            disabled={!canSubmitNo}
                            className={
                                "px-4 py-2 rounded-lg text-sm font-semibold " +
                                (canSubmitNo
                                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                    : "bg-gray-300 text-gray-600 cursor-not-allowed")
                            }
                        >
                            Gửi
                        </button>
                    </div>
                </form>
            )}

            {step === "submitted" && (
                <section className="space-y-4">
                    <h3 className="text-lg font-semibold">Đã ghi nhận 💜</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Cảm ơn bạn đã chia sẻ. Chúc bạn sớm vượt qua khó khăn!
                    </p>
                    <div className="mt-4">
                        <button
                            onClick={resetAll}
                            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            Trả lời lại
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
}

