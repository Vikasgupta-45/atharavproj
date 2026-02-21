"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, Heart, HelpCircle, RefreshCcw, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitGameAnswer, getDynamicPrompt, refillHearts, getUserStats } from "@/lib/api";
import {
    REDUNDANCY_PROMPTS,
    SENTENCE_BUILDER_PROMPTS,
    SENTENCE_RECONSTRUCTOR_PROMPTS,
    PLOT_HOLE_PROMPTS,
    TONE_SWITCHER_PROMPTS,
    WORD_CHOICE_PROMPTS,
} from "@/lib/gameData";

export default function GameSession() {
    const params = useParams();
    const router = useRouter();
    const gameId = params.game as string;

    const [progress, setProgress] = useState(0);
    const [hearts, setHearts] = useState(5);
    const [currentPrompt, setCurrentPrompt] = useState<any>(null);
    const [hint, setHint] = useState<string | null>(null);
    const [showHint, setShowHint] = useState(false);
    const [hintUsed, setHintUsed] = useState(false);
    const [userInput, setUserInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ success: boolean; reason: string; earned: number; mastery: number } | null>(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isHintConfirmOpen, setIsHintConfirmOpen] = useState(false);

    useEffect(() => {
        const init = async () => {
            const stats = await getUserStats();
            setHearts(stats.hearts);
            loadNextPrompt();
        };
        init();
    }, [gameId]);

    const getBackendName = (id: string) => {
        const names: Record<string, string> = {
            "redundancy": "Redundancy Eraser",
            "sentence-builder": "Sentence Builder",
            "reconstructor": "Sentence Reconstructor",
            "plot-hole": "Plot Hole Hunter",
            "tone-switcher": "Tone Switcher",
            "word-choice": "Word Choice Duel"
        };
        return names[id] || id;
    };

    const loadNextPrompt = async () => {
        setFeedback(null);
        setUserInput("");
        setCurrentPrompt(null);
        setHint(null);
        setShowHint(false);
        setHintUsed(false);

        try {
            const data = await getDynamicPrompt(getBackendName(gameId));
            setCurrentPrompt(data.promptData);
            setHint(data.hint);
        } catch (error) {
            console.error("Failed to fetch dynamic prompt:", error);
            // Fallback to local data if server fails
            switch (gameId) {
                case "redundancy":
                    setCurrentPrompt(REDUNDANCY_PROMPTS[Math.floor(Math.random() * REDUNDANCY_PROMPTS.length)]);
                    break;
                case "sentence-builder":
                    setCurrentPrompt(SENTENCE_BUILDER_PROMPTS[Math.floor(Math.random() * SENTENCE_BUILDER_PROMPTS.length)]);
                    break;
                case "reconstructor":
                    setCurrentPrompt(SENTENCE_RECONSTRUCTOR_PROMPTS[Math.floor(Math.random() * SENTENCE_RECONSTRUCTOR_PROMPTS.length)]);
                    break;
                case "plot-hole":
                    setCurrentPrompt(PLOT_HOLE_PROMPTS[Math.floor(Math.random() * PLOT_HOLE_PROMPTS.length)]);
                    break;
                case "tone-switcher":
                    setCurrentPrompt({
                        original: TONE_SWITCHER_PROMPTS[Math.floor(Math.random() * TONE_SWITCHER_PROMPTS.length)],
                        tone: ["happy", "sad", "angry", "mysterious", "romantic"][Math.floor(Math.random() * 5)]
                    });
                    break;
                case "word-choice":
                    setCurrentPrompt({
                        original: WORD_CHOICE_PROMPTS[Math.floor(Math.random() * WORD_CHOICE_PROMPTS.length)]
                    });
                    break;
                default:
                    router.push("/");
            }
        }
    };

    const handleHintClick = () => {
        if (showHint) {
            setShowHint(false);
            return;
        }
        setIsHintConfirmOpen(true);
    };

    const handleConfirmHint = () => {
        setIsHintConfirmOpen(false);
        setShowHint(true);
        setHintUsed(true);
    };

    const handleCancelHint = () => {
        setIsHintConfirmOpen(false);
    };

    const handleRefill = async () => {
        const res = await refillHearts();
        setHearts(res.hearts);
        setIsGameOver(false);
        loadNextPrompt();
    };

    const getGameConfig = () => {
        switch (gameId) {
            case "redundancy":
                return { title: "Redundancy Eraser", backendName: "Redundancy Eraser", getContext: () => ({ original: currentPrompt?.bad }), getInstruction: () => `Remove redundant words from: "${currentPrompt?.bad}"` };
            case "sentence-builder":
                return { title: "Sentence Builder", backendName: "Sentence Builder", getContext: () => ({ target_sentence: currentPrompt?.target }), getInstruction: () => `Unscramble: ${(currentPrompt?.words || []).join(", ")}` };
            case "reconstructor":
                return { title: "Sentence Reconstructor", backendName: "Sentence Reconstructor", getContext: () => ({ original: currentPrompt?.original }), getInstruction: () => `Make this sound more ${currentPrompt?.tone}: "${currentPrompt?.original}"` };
            case "plot-hole":
                return { title: "Plot Hole Hunter", backendName: "Plot Hole Hunter", getContext: () => ({ original: currentPrompt?.story }), getInstruction: () => `Identify the plot hole in: "${currentPrompt?.story}"` };
            case "tone-switcher":
                return { title: "Tone Switcher", backendName: "Tone Switcher", getContext: () => ({ target_tone: currentPrompt?.tone }), getInstruction: () => `Rewrite this to sound ${currentPrompt?.tone}: "${currentPrompt?.original}"` };
            case "word-choice":
                return { title: "Word Choice Duel", backendName: "Word Choice Duel", getContext: () => ({ original_word: currentPrompt?.original_word || currentPrompt?.original }), getInstruction: () => `Provide a synonym for: "${currentPrompt?.original_word || currentPrompt?.original}"` };
            default:
                return { title: "Unknown Game", backendName: "Unknown", getContext: () => ({}), getInstruction: () => "Unknown" };
        }
    };

    const config = getGameConfig();

    const handleCheck = async () => {
        if (!userInput.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await submitGameAnswer(config.backendName, userInput, config.getContext(), hintUsed);
            setFeedback({
                success: res.success,
                reason: res.reason,
                earned: res.xp_reward,
                mastery: res.mastery_level || 0
            });

            setHearts(res.current_hearts);

            if (res.success) {
                setProgress((prev) => Math.min(prev + 20, 100)); // advance progress bar 20%
            } else if (res.current_hearts <= 0) {
                setIsGameOver(true);
            }
        } catch (error) {
            console.error(error);
            setFeedback({ success: false, reason: "Server Error. Is the backend running?", earned: 0, mastery: 0 });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (progress >= 100) {
            router.push("/");
        } else if (isGameOver) {
            // Wait for refill
        } else {
            loadNextPrompt();
        }
    };

    if (!currentPrompt && !isGameOver) return <div className="p-10 font-bold">Loading Engine...</div>;

    return (
        <div className="flex flex-col h-full bg-surface">
            {/* Top Bar with Progress & Hearts */}
            <div className="flex items-center gap-6 p-6 border-b border-gray-100">
                <button onClick={() => router.push("/")} className="text-gray-400 hover:text-gray-800 transition">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-brand-dark rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>
                <div className="flex items-center gap-2 text-red-500 font-bold text-xl">
                    <Heart size={28} fill="currentColor" />
                    <span>{hearts}</span>
                </div>
            </div>

            {/* Main Game Interface */}
            <div className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto flex flex-col items-center justify-start p-6 pb-40 mt-10">
                <div className="w-full text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8">{config.title}</h2>

                    <div className="mb-6 p-6 bg-brand-light border-2 border-brand rounded-2xl relative">
                        <p className="text-2xl font-medium text-gray-700 leading-relaxed">
                            {config.getInstruction()}
                        </p>
                        {hint && (
                            <button
                                onClick={handleHintClick}
                                className={`absolute -top-3 -right-3 border-2 p-2 rounded-full transition shadow-sm ${showHint ? 'bg-brand text-white border-brand' : 'bg-white text-brand border-brand hover:bg-brand-light'}`}
                            >
                                <HelpCircle size={20} />
                            </button>
                        )}
                    </div>

                    <AnimatePresence>
                        {showHint && hint && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-left flex gap-3 italic"
                            >
                                <Info size={20} className="shrink-0 mt-1" />
                                <div>
                                    <span className="font-bold text-yellow-900 block mb-1">XP Penalty Active (50% Off)</span>
                                    <span>{hint}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        disabled={feedback !== null || isSubmitting || isGameOver}
                        placeholder="Type your answer here..."
                        className="w-full h-32 p-4 text-xl border-2 border-gray-200 rounded-2xl focus:border-brand-dark focus:ring-0 resize-none transition-colors outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    />
                </div>
            </div>

            {/* Bottom Sticky Action Area */}
            <div className="mt-auto border-t border-gray-200 relative overflow-hidden h-32">
                {/* Animated Feedback Drawer */}
                <AnimatePresence>
                    {feedback && (
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className={`absolute inset-0 flex items-center justify-between px-10 py-6 z-10 ${feedback.success ? 'bg-brand' : 'bg-red-100'}`}
                        >
                            <div className="flex items-center gap-4">
                                {feedback.success ? (
                                    <div className="bg-white p-2 rounded-full"><CheckCircle2 className="text-brand-dark" size={32} /></div>
                                ) : (
                                    <div className="bg-white p-2 rounded-full"><XCircle className="text-red-500" size={32} /></div>
                                )}
                                <div>
                                    <h3 className={`text-2xl font-bold ${feedback.success ? 'text-brand-dark' : 'text-red-600'}`}>
                                        {feedback.success ? "Correct!" : "Uh oh!"}
                                    </h3>
                                    <div className="flex flex-col">
                                        <p className={`text-lg ${feedback.success ? 'text-gray-700' : 'text-red-500'}`}>
                                            {feedback.reason} {feedback.success && (
                                                <span className="font-bold">
                                                    +{feedback.earned} XP {hintUsed && <span className="text-sm font-normal opacity-70 ml-1">(Hint Used)</span>}
                                                </span>
                                            )}
                                        </p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-xs uppercase font-bold tracking-wider text-gray-500">Mastery</span>
                                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-brand-dark" style={{ width: `${feedback.mastery * 100}%` }}></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-600">{Math.round(feedback.mastery * 100)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleNext}
                                disabled={isGameOver}
                                className={`px-8 py-4 rounded-xl text-xl font-bold text-white transition-opacity hover:opacity-90 ${feedback.success ? 'bg-brand-dark' : 'bg-red-500'} disabled:opacity-50`}
                            >
                                {progress >= 100 ? "Finish Lesson" : "Continue"}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="px-10 py-6 max-w-2xl mx-auto flex justify-end bg-surface">
                    <button
                        onClick={handleCheck}
                        disabled={!userInput.trim() || feedback !== null || isSubmitting || isGameOver}
                        className="px-10 py-4 bg-gray-800 text-white rounded-xl text-xl font-bold hover:bg-gray-900 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? "Checking..." : "Check"}
                    </button>
                </div>
            </div>

            {/* Game Over Overlay */}
            <AnimatePresence>
                {isGameOver && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-10 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 10 }}
                            className="bg-red-100 p-8 rounded-full mb-8"
                        >
                            <Heart size={80} className="text-red-500" fill="currentColor" />
                        </motion.div>
                        <h2 className="text-4xl font-bold text-gray-800 mb-4">Out of Hearts!</h2>
                        <p className="text-xl text-gray-500 mb-10 max-w-md">
                            You've lost all your lives. Take a break or refill your hearts to keep learning!
                        </p>
                        <div className="flex flex-col gap-4 w-full max-w-sm">
                            <button
                                onClick={handleRefill}
                                className="w-full py-4 bg-brand-dark text-white rounded-2xl text-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
                            >
                                <RefreshCcw size={24} />
                                Refill Hearts (Free)
                            </button>
                            <button
                                onClick={() => router.push("/")}
                                className="w-full py-4 border-2 border-gray-200 text-gray-500 rounded-2xl text-xl font-bold hover:bg-gray-50 transition"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Hint Confirmation Modal */}
            <AnimatePresence>
                {isHintConfirmOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCancelHint}
                            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center"
                        >
                            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                <HelpCircle size={32} className="text-yellow-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Need a Hint?</h3>
                            <p className="text-gray-500 mb-8 leading-relaxed">
                                Revealing a hint will reduce your XP reward for this turn by <span className="font-bold text-orange-500">50%</span>. Proceed?
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleConfirmHint}
                                    className="w-full py-4 bg-brand-dark text-white rounded-2xl text-lg font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-brand/20"
                                >
                                    Reveal Hint
                                </button>
                                <button
                                    onClick={handleCancelHint}
                                    className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl text-lg font-bold hover:bg-gray-100 transition-colors"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
