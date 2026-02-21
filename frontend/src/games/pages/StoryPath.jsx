import React from 'react';
import { motion } from 'framer-motion';
import { Star, Trophy, Lock, Play, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PATH_STEPS = [
    { id: 'word-master-1', type: 'word-master', level: 1, title: 'Basics 1', color: 'bg-green-500' },
    { id: 'redundancy-1', type: 'redundancy', level: 1, title: 'Eraser Quest', color: 'bg-blue-500' },
    { id: 'chest-1', type: 'chest', title: 'Bonus XP', color: 'bg-yellow-500' },
    { id: 'tone-switcher-1', type: 'tone-switcher', level: 1, title: 'Mood Swings', color: 'bg-purple-500' },
    { id: 'reconstructor-1', type: 'reconstructor', level: 1, title: 'Rebuild Room', color: 'bg-pink-500' },
    { id: 'trophy-1', type: 'trophy', title: 'Unit 1 Wrap', color: 'bg-orange-500' },
];

const Mascot = ({ className }) => (
    <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className={`relative w-24 h-24 ${className}`}
    >
        {/* Body */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-full shadow-lg border-4 border-white" />
        {/* Eyes */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white rounded-full animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-white rounded-full animate-pulse" />
        {/* Digital Glow */}
        <div className="absolute inset-2 bg-white/10 rounded-full blur-sm" />
    </motion.div>
);

export default function StoryPath() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const currentLevel = user?.level || 1;

    return (
        <div className="min-h-screen bg-[#F0FDFA] pb-20 pt-10 px-4 relative flex flex-col items-center">
            <div className="max-w-md w-full relative">
                {/* Path Heading */}
                <div className="mb-12 text-center">
                    <h1 className="text-3xl font-black text-[#0D9488] uppercase tracking-tighter">Unit 1: The Beginning</h1>
                    <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-1">Master the basics of English flow</p>
                </div>

                {/* The Path */}
                <div className="flex flex-col items-center gap-12 relative">
                    {PATH_STEPS.map((step, idx) => {
                        const isUnlocked = idx <= (currentLevel - 1);
                        const isCurrent = idx === (currentLevel - 1);
                        const xOffset = Math.sin(idx * 1.5) * 60; // Create the winding effect

                        return (
                            <div
                                key={step.id}
                                className="relative flex items-center justify-center w-full"
                                style={{ transform: `translateX(${xOffset}px)` }}
                            >
                                {/* Connecting Line (except last) */}
                                {idx < PATH_STEPS.length - 1 && (
                                    <div className="absolute top-16 w-1 h-12 bg-gray-200 -z-10" />
                                )}

                                {/* The Node */}
                                <motion.button
                                    whileHover={isUnlocked ? { scale: 1.1 } : {}}
                                    whileTap={isUnlocked ? { scale: 0.95 } : {}}
                                    onClick={() => isUnlocked && navigate(`/games/play/${step.type}`)}
                                    className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-path
                    ${isUnlocked ? step.color + ' text-white' : 'bg-gray-200 text-gray-400'}
                    ${isCurrent ? 'ring-8 ring-white/50 ring-offset-4 ring-offset-[#F0FDFA]' : ''}
                  `}
                                >
                                    {isCurrent && (
                                        <div className="absolute -top-12 bg-white text-[#0D9488] px-3 py-1 rounded-xl text-[10px] font-black uppercase shadow-sm border border-gray-100 flex items-center gap-1">
                                            START <Play size={8} fill="currentColor" />
                                        </div>
                                    )}

                                    {step.type === 'chest' ? <Trophy size={32} /> :
                                        step.type === 'trophy' ? <Star size={32} fill="currentColor" /> :
                                            !isUnlocked ? <Lock size={28} /> :
                                                <div className="relative">
                                                    <span className="text-2xl font-black">{idx + 1}</span>
                                                    <motion.div
                                                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                        className="absolute -top-1 -right-1 text-white border-white"
                                                    >
                                                        <Sparkles size={12} fill="currentColor" />
                                                    </motion.div>
                                                </div>}

                                    {/* AI Badge for unlocked nodes */}
                                    {isUnlocked && step.type !== 'chest' && step.type !== 'trophy' && (
                                        <div className="absolute -bottom-2 bg-black/80 text-[8px] font-black text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm border border-white/20">
                                            Live AI
                                        </div>
                                    )}

                                    {/* Icon label */}
                                    <span className="absolute -right-24 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                        {step.title}
                                    </span>
                                </motion.button>

                                {/* Mascot at Current Node */}
                                {isCurrent && (
                                    <div className="absolute -left-28">
                                        <Mascot className="scale-75" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
