import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Heart, HelpCircle, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { submitGameAnswer, getDynamicPrompt, refillHearts, getUserStats } from '../lib/api';
import {
    REDUNDANCY_PROMPTS, SENTENCE_BUILDER_PROMPTS, SENTENCE_RECONSTRUCTOR_PROMPTS,
    PLOT_HOLE_PROMPTS, TONE_SWITCHER_PROMPTS, WORD_CHOICE_PROMPTS,
    DIALOGUE_DETECTIVE_PROMPTS, CONTEXT_CLIMBER_PROMPTS,
    WORD_MASTER_PROMPTS
} from '../lib/gameData';

const Mascot = ({ className }) => (
    <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className={`relative w-16 h-16 ${className}`}
    >
        <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-full shadow-lg border-2 border-white" />
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full" />
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-white rounded-full" />
    </motion.div>
);

export default function GameSession() {
    const { game: gameId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const userId = user?.email || user?._id || 'guest_user';

    const [progress, setProgress] = useState(0);
    const [hearts, setHearts] = useState(5);
    const [currentPrompt, setCurrentPrompt] = useState(null);
    const [hint, setHint] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [hintUsed, setHintUsed] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isHintConfirmOpen, setIsHintConfirmOpen] = useState(false);

    useEffect(() => {
        const init = async () => {
            try { const stats = await getUserStats(userId); setHearts(stats.hearts); } catch (_) { }
            loadNextPrompt();
        };
        init();
    }, [gameId, userId]);

    const getBackendName = (id) => ({
        'redundancy': 'Redundancy Eraser', 'sentence-builder': 'Sentence Builder',
        'reconstructor': 'Sentence Reconstructor', 'plot-hole': 'Plot Hole Hunter',
        'tone-switcher': 'Tone Switcher', 'word-choice': 'Word Choice Duel',
        'dialogue-detective': 'Dialogue Detective', 'context-climber': 'Context Climber',
    }[id] || id);

    const loadNextPrompt = async () => {
        setFeedback(null); setUserInput(''); setCurrentPrompt(null);
        setHint(null); setShowHint(false); setHintUsed(false);
        try {
            const data = await getDynamicPrompt(getBackendName(gameId), userId);
            setCurrentPrompt(data.promptData); setHint(data.hint);
        } catch {
            const r = Math.floor;
            switch (gameId) {
                case 'redundancy': setCurrentPrompt(REDUNDANCY_PROMPTS[r(Math.random() * REDUNDANCY_PROMPTS.length)]); break;
                case 'sentence-builder': setCurrentPrompt(SENTENCE_BUILDER_PROMPTS[r(Math.random() * SENTENCE_BUILDER_PROMPTS.length)]); break;
                case 'reconstructor': setCurrentPrompt(SENTENCE_RECONSTRUCTOR_PROMPTS[r(Math.random() * SENTENCE_RECONSTRUCTOR_PROMPTS.length)]); break;
                case 'plot-hole': setCurrentPrompt(PLOT_HOLE_PROMPTS[r(Math.random() * PLOT_HOLE_PROMPTS.length)]); break;
                case 'tone-switcher': setCurrentPrompt({ original: TONE_SWITCHER_PROMPTS[r(Math.random() * TONE_SWITCHER_PROMPTS.length)], tone: ['happy', 'sad', 'angry', 'mysterious', 'romantic'][r(Math.random() * 5)] }); break;
                case 'word-choice': setCurrentPrompt({ original: WORD_CHOICE_PROMPTS[r(Math.random() * WORD_CHOICE_PROMPTS.length)] }); break;
                case 'dialogue-detective': setCurrentPrompt(DIALOGUE_DETECTIVE_PROMPTS[r(Math.random() * DIALOGUE_DETECTIVE_PROMPTS.length)]); break;
                case 'context-climber': setCurrentPrompt(CONTEXT_CLIMBER_PROMPTS[r(Math.random() * CONTEXT_CLIMBER_PROMPTS.length)]); break;
                case 'word-master': setCurrentPrompt(WORD_MASTER_PROMPTS[r(Math.random() * WORD_MASTER_PROMPTS.length)]); break;
                default: navigate('/');
            }
        }
    };

    const getGameConfig = () => {
        switch (gameId) {
            case 'redundancy': return { title: 'Redundancy Eraser', backendName: 'Redundancy Eraser', getContext: () => ({ original: currentPrompt?.bad }), getInstruction: () => `Remove redundant words from: "${currentPrompt?.bad}"` };
            case 'sentence-builder': return { title: 'Sentence Builder', backendName: 'Sentence Builder', getContext: () => ({ target_sentence: currentPrompt?.target }), getInstruction: () => `Unscramble: ${(currentPrompt?.words || []).join(', ')}` };
            case 'reconstructor': return { title: 'Sentence Reconstructor', backendName: 'Sentence Reconstructor', getContext: () => ({ original: currentPrompt?.original }), getInstruction: () => `Make this sound more ${currentPrompt?.tone}: "${currentPrompt?.original}"` };
            case 'plot-hole': return { title: 'Plot Hole Hunter', backendName: 'Plot Hole Hunter', getContext: () => ({ original: currentPrompt?.story }), getInstruction: () => `Identify the plot hole in: "${currentPrompt?.story}"` };
            case 'tone-switcher': return { title: 'Tone Switcher', backendName: 'Tone Switcher', getContext: () => ({ target_tone: currentPrompt?.tone }), getInstruction: () => `Rewrite this to sound ${currentPrompt?.tone}: "${currentPrompt?.original}"` };
            case 'word-choice': return { title: 'Word Choice Duel', backendName: 'Word Choice Duel', getContext: () => ({ original_word: currentPrompt?.original_word || currentPrompt?.original }), getInstruction: () => `Provide a synonym for: "${currentPrompt?.original_word || currentPrompt?.original}"` };
            case 'dialogue-detective': return { title: 'Dialogue Detective', backendName: 'Dialogue Detective', getContext: () => ({ dialogue: currentPrompt?.dialogue, suspicious_line_index: currentPrompt?.suspicious_line_index }), getInstruction: () => `Identify and correct the suspicious line in the dialogue below.` };
            case 'context-climber': return { title: 'Context Climber', backendName: 'Context Climber', getContext: () => ({ setup: currentPrompt?.setup, goal: currentPrompt?.goal }), getInstruction: () => `Goal: ${currentPrompt?.goal || 'Continue the story logicially.'}` };
            case 'word-master': return { title: 'Word Master', backendName: 'Word Master', getContext: () => ({ bad: currentPrompt?.bad }), getInstruction: () => `Fix the grammatical error in: "${currentPrompt?.bad}"` };
            default: return { title: 'Unknown', backendName: 'Unknown', getContext: () => ({}), getInstruction: () => '' };
        }
    };

    const config = getGameConfig();

    const handleCheck = async () => {
        if (!userInput.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await submitGameAnswer(config.backendName, userInput, config.getContext(), hintUsed, userId);
            setFeedback({
                success: res.success,
                reason: res.reason,
                earned: res.xp_reward,
                mastery: res.mastery_level || 0,
                score: res.score || Math.round((res.mastery_level || 0) * 100)
            });
            setHearts(res.current_hearts);
            if (res.success) setProgress((p) => Math.min(p + 20, 100));
            else if (res.current_hearts <= 0) setIsGameOver(true);
        } catch {
            setFeedback({ success: false, reason: 'Server Error. Is the backend running?', earned: 0, mastery: 0 });
        } finally { setIsSubmitting(false); }
    };

    const handleNext = () => { if (progress >= 100) navigate('/games'); else if (!isGameOver) loadNextPrompt(); };
    const handleRefill = async () => { const r = await refillHearts(userId); setHearts(r.hearts); setIsGameOver(false); loadNextPrompt(); };

    if (!currentPrompt && !isGameOver) return (
        <div className="p-10 flex items-center gap-3 text-[#0D9488]">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-5 h-5 border-2 border-[#5EEAD4] border-t-transparent rounded-full" />
            <span className="font-bold">Loading Engine...</span>
        </div>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-[#F0FDFA]">
            {/* Top bar */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-6 p-6 border-b border-[#CCFBF1] bg-white/80 backdrop-blur-lg"
            >
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => navigate('/games')} className="text-gray-400 hover:text-[#0D9488] transition">
                    <ArrowLeft size={24} />
                </motion.button>
                <div className="flex-1 h-3 bg-[#CCFBF1] rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[#0D9488] to-[#5EEAD4] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
                <div className="flex items-center gap-2 text-red-500 font-bold text-xl">
                    <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                        <Heart size={28} fill="currentColor" />
                    </motion.div>
                    <span>{hearts}</span>
                </div>
            </motion.div>

            {/* Game area */}
            <div className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto flex flex-col items-center justify-start p-6 pb-40 mt-10" data-lenis-prevent>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="w-full text-center"
                >
                    <h2 className="text-3xl font-bold text-gray-800 mb-8">{config.title}</h2>

                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="mb-8 p-6 bg-white border-2 border-[#5EEAD4] rounded-3xl relative shadow-card overflow-hidden"
                    >
                        {/* Game Specific Immersive UI */}
                        {gameId === 'dialogue-detective' && currentPrompt?.dialogue ? (
                            <div className="space-y-4 text-left">
                                {currentPrompt.dialogue.map((line, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: line.speaker === 'A' ? -20 : 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.3 }}
                                        className={`flex flex-col ${line.speaker === 'A' ? 'items-start' : 'items-end'}`}
                                    >
                                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium shadow-sm transition-all
                                            ${idx === currentPrompt.suspicious_line_index
                                                ? 'bg-red-50 border-2 border-red-200 text-red-700 animate-pulse'
                                                : line.speaker === 'A' ? 'bg-[#F0FDFA] text-[#0D9488]' : 'bg-gray-100 text-gray-700'}`}
                                        >
                                            <span className="text-[10px] font-black uppercase opacity-50 block mb-1">Suspect {line.speaker}</span>
                                            {line.text}
                                        </div>
                                    </motion.div>
                                ))}
                                <div className="mt-4 pt-4 border-t border-[#CCFBF1] text-center text-gray-500 italic text-sm">
                                    {config.getInstruction()}
                                </div>
                            </div>
                        ) : gameId === 'context-climber' && currentPrompt?.setup ? (
                            <div className="text-left space-y-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200"
                                >
                                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">The Setup</span>
                                    <p className="text-xl font-medium text-slate-800 leading-relaxed italic border-l-4 border-[#5EEAD4] pl-4">
                                        "{currentPrompt.setup}"
                                    </p>
                                </motion.div>
                                <div className="p-4 bg-[#F0FDFA] rounded-2xl border border-[#CCFBF1]">
                                    <span className="text-[10px] font-black uppercase text-[#0D9488] block mb-2">The Objective</span>
                                    <p className="text-lg font-bold text-[#0D9488]">{currentPrompt.goal}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 py-4">
                                {gameId === 'word-master' && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-black uppercase mb-4">
                                        Difficulty: {currentPrompt?.difficulty || 'Normal'}
                                    </div>
                                )}
                                <p className="text-2xl font-medium text-gray-700 leading-relaxed">{config.getInstruction()}</p>
                            </div>
                        )}

                        {hint && (
                            <motion.button
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => showHint ? setShowHint(false) : setIsHintConfirmOpen(true)}
                                className={`absolute -top-3 -right-3 border-2 p-2 rounded-full transition shadow-sm ${showHint ? 'bg-[#0D9488] text-white border-[#0D9488]' : 'bg-white text-[#0D9488] border-[#5EEAD4] hover:bg-[#F0FDFA]'}`}
                            >
                                <HelpCircle size={20} />
                            </motion.button>
                        )}
                    </motion.div>

                    <AnimatePresence>
                        {showHint && hint && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-left flex gap-3 italic">
                                <Info size={20} className="shrink-0 mt-1" />
                                <div><span className="font-bold text-yellow-900 block mb-1">XP Penalty Active (50% Off)</span><span>{hint}</span></div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Global Input Fallback (Hidden for MCQ and Spinner) */}
                    {!(gameId === 'logic-mcq' || gameId === 'visual-vocab' || gameId === 'story-spinner') && (
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            disabled={feedback !== null || isSubmitting || isGameOver}
                            placeholder="Type your answer here..."
                            className="w-full h-32 p-4 text-xl border-2 border-[#CCFBF1] rounded-2xl focus:border-[#0D9488] focus:ring-2 focus:ring-[#5EEAD4]/30 resize-none transition-all outline-none disabled:bg-gray-50 disabled:text-gray-500 bg-white"
                        />
                    )}
                </motion.div>
            </div>

            {/* Bottom Mascot */}
            <div className="fixed bottom-6 right-6 z-50">
                <Mascot />
            </div>

            {/* Bottom sticky */}
            <div className="mt-auto border-t border-[#CCFBF1] relative overflow-hidden h-32">
                <AnimatePresence>
                    {feedback && (
                        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className={`absolute inset-0 flex items-center justify-between px-10 py-6 z-10 ${feedback.success ? 'bg-gradient-to-r from-[#0D9488] to-[#14B8A6]' : 'bg-red-50 border-t-2 border-red-200'}`}>
                            <div className="flex items-center gap-4">
                                {feedback.success
                                    ? <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 8 }} className="bg-white p-2 rounded-full shadow-glow"><CheckCircle2 className="text-[#0D9488]" size={32} /></motion.div>
                                    : <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 8 }} className="bg-white p-2 rounded-full"><XCircle className="text-red-500" size={32} /></motion.div>
                                }
                                <div>
                                    <h3 className={`text-2xl font-bold ${feedback.success ? 'text-white' : 'text-red-600'}`}>{feedback.success ? 'Correct!' : 'Uh oh!'}</h3>
                                    <p className={`text-lg ${feedback.success ? 'text-white/90' : 'text-red-500'}`}>
                                        {feedback.reason}{feedback.success && <span className="font-bold"> +{feedback.earned} XP{hintUsed && <span className="text-sm font-normal opacity-70 ml-1">(Hint Used)</span>}</span>}
                                    </p>
                                    <div className="mt-3 flex items-center gap-6">
                                        <div className="flex flex-col">
                                            <span className={`text-[10px] uppercase font-black tracking-widest ${feedback.success ? 'text-white/60' : 'text-gray-400'}`}>Accuracy</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-2xl font-black ${feedback.success ? 'text-white' : 'text-red-600'}`}>{feedback.score}%</span>
                                                <div className="w-20 h-1.5 bg-black/10 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${feedback.score}%` }}
                                                        className={`h-full ${feedback.success ? 'bg-white' : 'bg-red-500'}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col border-l border-white/20 pl-6">
                                            <span className={`text-[10px] uppercase font-black tracking-widest ${feedback.success ? 'text-white/60' : 'text-gray-400'}`}>Mastery</span>
                                            <span className={`text-xl font-bold ${feedback.success ? 'text-white' : 'text-gray-700'}`}>{Math.round(feedback.mastery * 100)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <motion.button onClick={handleNext} disabled={isGameOver}
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                className={`px-8 py-4 rounded-xl text-xl font-bold transition-all ${feedback.success ? 'bg-white text-[#0D9488] shadow-glow hover:shadow-glow-lg' : 'bg-red-500 text-white'} disabled:opacity-50`}>
                                {progress >= 100 ? 'Finish Lesson' : 'Continue'}
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="px-10 py-6 max-w-2xl mx-auto flex justify-end bg-white/80 backdrop-blur-lg">
                    <motion.button onClick={handleCheck}
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        disabled={!userInput.trim() || feedback !== null || isSubmitting || isGameOver}
                        className="px-10 py-4 bg-gradient-to-r from-[#0D9488] to-[#14B8A6] text-white rounded-xl text-xl font-bold hover:shadow-glow disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none transition-all">
                        {isSubmitting ? 'Checking...' : 'Check'}
                    </motion.button>
                </div>
            </div>

            {/* Game Over */}
            <AnimatePresence>
                {isGameOver && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-10 text-center">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }} className="bg-red-100 p-8 rounded-full mb-8">
                            <Heart size={80} className="text-red-500" fill="currentColor" />
                        </motion.div>
                        <h2 className="text-4xl font-bold text-gray-800 mb-4">Out of Hearts!</h2>
                        <p className="text-xl text-gray-500 mb-10 max-w-md">You've lost all your lives. Take a break or refill your hearts to keep learning!</p>
                        <div className="flex flex-col gap-4 w-full max-w-sm">
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleRefill}
                                className="w-full py-4 bg-gradient-to-r from-[#0D9488] to-[#14B8A6] text-white rounded-2xl text-xl font-bold shadow-glow flex items-center justify-center gap-3">
                                <RefreshCcw size={24} /> Refill Hearts (Free)
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/games')}
                                className="w-full py-4 border-2 border-[#CCFBF1] text-gray-500 rounded-2xl text-xl font-bold hover:bg-[#F0FDFA] transition">
                                Back to Games
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hint Modal */}
            <AnimatePresence>
                {isHintConfirmOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsHintConfirmOpen(false)} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center border border-[#CCFBF1]">
                            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"><HelpCircle size={32} className="text-yellow-600" /></div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Need a Hint?</h3>
                            <p className="text-gray-500 mb-8 leading-relaxed">Revealing a hint will reduce your XP reward by <span className="font-bold text-orange-500">50%</span>. Proceed?</p>
                            <div className="flex flex-col gap-3">
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={() => { setIsHintConfirmOpen(false); setShowHint(true); setHintUsed(true); }}
                                    className="w-full py-4 bg-gradient-to-r from-[#0D9488] to-[#14B8A6] text-white rounded-2xl text-lg font-bold shadow-glow">
                                    Reveal Hint
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={() => setIsHintConfirmOpen(false)}
                                    className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl text-lg font-bold hover:bg-gray-100 transition-colors">
                                    Maybe Later
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
