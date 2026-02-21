import { useEffect, useState } from 'react';
import { Trophy, TrendingUp, Crown, Medal, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { getLeaderboard } from '../lib/api';

const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    show: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' } }),
};

export default function Leaderboard() {
    const [data, setData] = useState([]);

    useEffect(() => {
        getLeaderboard().then(setData).catch((e) => console.error('Failed to fetch leaderboard', e));
    }, []);

    return (
        <div className="p-8 md:p-12 max-w-5xl mx-auto h-full overflow-y-auto">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-10 flex items-center gap-4"
            >
                <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    className="bg-gradient-to-br from-amber-400 to-amber-500 p-3.5 rounded-2xl shadow-lg"
                >
                    <Trophy className="text-white" size={28} />
                </motion.div>
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900">Leaderboard</h1>
                    <p className="text-gray-500 text-lg">See how you stack up against the best writers.</p>
                </div>
            </motion.header>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="bg-white/80 backdrop-blur-lg border border-[#CCFBF1] rounded-3xl overflow-hidden shadow-card"
            >
                <table className="w-full text-left">
                    <thead className="bg-[#F0FDFA] text-gray-500 text-sm font-semibold border-b border-[#CCFBF1]">
                        <tr>
                            <th className="px-8 py-5">Rank</th>
                            <th className="px-8 py-5">Writer</th>
                            <th className="px-8 py-5 text-right">XP</th>
                            <th className="px-8 py-5 text-right">Streak</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0FDFA]">
                        {data.length > 0 ? (
                            data.map((user, i) => (
                                <motion.tr
                                    key={i}
                                    variants={rowVariants}
                                    initial="hidden"
                                    animate="show"
                                    custom={i}
                                    whileHover={{ backgroundColor: '#F0FDFA' }}
                                    className="transition-colors"
                                >
                                    <td className="px-8 py-6 font-bold text-gray-500">
                                        <span className="flex items-center gap-2">
                                            #{i + 1}
                                            {i === 0 && <Crown size={18} className="text-amber-500" />}
                                            {i === 1 && <Medal size={16} className="text-gray-400" />}
                                            {i === 2 && <Medal size={16} className="text-amber-600" />}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 font-semibold text-gray-800">{user.user_id}</td>
                                    <td className="px-8 py-6 text-right font-bold text-[#0D9488]">{user.xp.toLocaleString()} XP</td>
                                    <td className="px-8 py-6 text-right font-medium text-orange-500">
                                        <span className="inline-flex items-center gap-1">
                                            {user.streak} <TrendingUp size={16} />
                                        </span>
                                    </td>
                                </motion.tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-8 py-16 text-center text-gray-400">
                                    <Sparkles className="mx-auto mb-3 text-[#5EEAD4]" size={32} />
                                    No leaderboard data yet. Start playing to get ranked!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
}
