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
        // Hardcoded "hardcore" values for the demo
        const demoData = [
            { user_id: 'Sarthak (AI)', xp: 7500, streak: 21 },
            { user_id: 'Arjun_Pro', xp: 6200, streak: 12 },
            { user_id: 'Neha_Writer', xp: 5100, streak: 15 },
            { user_id: 'Rahul_Grammar', xp: 4800, streak: 9 },
            { user_id: 'Priya_Lit', xp: 4200, streak: 18 },
            { user_id: 'Vikram_Bot', xp: 3600, streak: 25 },
            { user_id: 'Aisha_Pen', xp: 3100, streak: 11 },
            { user_id: 'Kabir_Lyrics', xp: 2600, streak: 7 },
            { user_id: 'Sarthak (You)', xp: 2000, streak: 5 },
            { user_id: 'Rohan_Scribe', xp: 1200, streak: 3 },
            { user_id: 'Zoya_Auth', xp: 800, streak: 2 },
            { user_id: 'Dev_Writer', xp: 450, streak: 6 },
        ];

        setData(demoData);
        // Fallback to API if available, but demoData will take precedence for now
        getLeaderboard().then(apiData => {
            if (apiData && apiData.length > 5) setData(apiData);
        }).catch((e) => console.error('Failed to fetch leaderboard', e));
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
                                    className={`transition-colors ${user.user_id === 'Sarthak (You)' ? 'bg-orange-50/50 ring-inset ring-1 ring-orange-200' : ''}`}
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
