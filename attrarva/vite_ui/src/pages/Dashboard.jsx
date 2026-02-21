import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Repeat2, BookOpenCheck, Eraser, Puzzle, RefreshCw, Search, Sparkles, ArrowRight } from 'lucide-react';

const games = [
    { id: 'tone-switcher', title: 'Tone Switcher', desc: 'Rewrite sentences to convey different emotions and moods.', icon: Repeat2, gradient: 'from-[#0D9488] to-[#5EEAD4]', emoji: '🎭' },
    { id: 'word-choice', title: 'Word Choice Duel', desc: 'Find the perfect synonym and expand your vocabulary power.', icon: BookOpenCheck, gradient: 'from-[#0F766E] to-[#14B8A6]', emoji: '⚔️' },
    { id: 'redundancy', title: 'Redundancy Eraser', desc: 'Spot and remove unnecessary words to sharpen your writing.', icon: Eraser, gradient: 'from-[#115E59] to-[#0D9488]', emoji: '✂️' },
    { id: 'sentence-builder', title: 'Sentence Builder', desc: 'Assemble scrambled words into grammatically perfect sentences.', icon: Puzzle, gradient: 'from-[#14B8A6] to-[#5EEAD4]', emoji: '🧩' },
    { id: 'reconstructor', title: 'Sentence Reconstructor', desc: 'Rewrite sentences without changing the original meaning.', icon: RefreshCw, gradient: 'from-[#0D9488] to-[#2DD4BF]', emoji: '🔄' },
    { id: 'plot-hole', title: 'Plot Hole Hunter', desc: 'Find hidden logical contradictions in short stories.', icon: Search, gradient: 'from-[#134E4A] to-[#0F766E]', emoji: '🕵️' },
];

const containerVariants = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.08 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 40, rotateX: 8 },
    show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function Dashboard() {
    return (
        <div className="p-8 md:p-12 max-w-6xl mx-auto">
            {/* Hero Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="mb-12"
            >
                <div className="flex items-center gap-3 mb-4">
                    <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                    >
                        <Sparkles className="text-[#0D9488]" size={28} />
                    </motion.div>
                    <span className="inline-flex rounded-full border border-[#5EEAD4] bg-[#F0FDFA] px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#0D9488]">
                        Writing Games
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900 mb-3">
                    Level up your <span className="text-gradient">writing skills</span>
                </h1>
                <p className="text-gray-500 text-lg max-w-2xl leading-relaxed">
                    Choose a game below and sharpen your grammar, vocabulary, and creative writing through interactive AI-powered challenges.
                </p>

                {/* Stats pills */}
                <div className="flex flex-wrap gap-3 mt-6">
                    {[
                        { label: '6 Game Modes', icon: '🎮' },
                        { label: 'AI-Powered', icon: '🤖' },
                        { label: 'XP & Streaks', icon: '🔥' },
                    ].map((s) => (
                        <motion.div
                            key={s.label}
                            whileHover={{ scale: 1.05, y: -2 }}
                            className="flex items-center gap-2 rounded-full bg-white border border-[#CCFBF1] px-4 py-2 shadow-card"
                        >
                            <span>{s.icon}</span>
                            <span className="text-sm font-semibold text-gray-600">{s.label}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.header>

            {/* Game cards grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-1000"
            >
                {games.map((game) => {
                    const Icon = game.icon;
                    return (
                        <motion.div key={game.id} variants={cardVariants}>
                            <Link to={`/play/${game.id}`} className="block group">
                                <motion.div
                                    whileHover={{ y: -8, rotateY: 2, rotateX: -2 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                    className="relative overflow-hidden bg-white rounded-3xl border border-[#CCFBF1] shadow-card hover:shadow-card-hover transition-shadow duration-300 h-full"
                                >
                                    {/* Card gradient header */}
                                    <div className={`bg-gradient-to-br ${game.gradient} p-6 relative overflow-hidden`}>
                                        {/* Background decoration */}
                                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-sm" />
                                        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full blur-sm" />

                                        <div className="relative flex items-center justify-between">
                                            <motion.div
                                                whileHover={{ rotate: 12, scale: 1.1 }}
                                                className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl"
                                            >
                                                <Icon size={28} className="text-white" />
                                            </motion.div>
                                            <span className="text-3xl">{game.emoji}</span>
                                        </div>
                                    </div>

                                    {/* Card body */}
                                    <div className="p-6">
                                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#0D9488] transition-colors">
                                            {game.title}
                                        </h3>
                                        <p className="text-gray-500 text-sm leading-relaxed mb-4">{game.desc}</p>

                                        <div className="flex items-center gap-2 text-[#0D9488] font-semibold text-sm">
                                            <span>Play Now</span>
                                            <motion.div
                                                animate={{ x: [0, 4, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >
                                                <ArrowRight size={16} />
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Glow effect on hover */}
                                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border-2 border-[#5EEAD4]/40" />
                                </motion.div>
                            </Link>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}
