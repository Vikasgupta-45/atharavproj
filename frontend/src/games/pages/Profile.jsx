import { useEffect, useState } from 'react';
import { User, Target, Zap, Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { getUserStats } from '../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const statVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: (i) => ({ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] } }),
};

export default function Profile() {
    const { credits, redeemCredits } = useAuth();
    const [stats, setStats] = useState(null);
    const [redeeming, setRedeeming] = useState(false);

    useEffect(() => {
        getUserStats().then(data => {
            // HARDCODED XP FOR DEMO
            setStats({ ...data, xp: 2000 });
        }).catch(console.error);
    }, []);

    const handleRedeem = async () => {
        if (!stats) return;
        if (stats.xp < 100) {
            alert("You need at least 100 XP to redeem credits.");
            return;
        }
        setRedeeming(true);
        const res = await redeemCredits(100);
        if (res.success) {
            setStats(prev => ({ ...prev, xp: res.newXP }));
        } else {
            alert(res.message);
        }
        setRedeeming(false);
    };

    if (!stats) return (
        <div className="p-10 flex items-center gap-3 text-[#0D9488]">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-5 h-5 border-2 border-[#5EEAD4] border-t-transparent rounded-full" />
            <span className="font-bold">Loading Profile...</span>
        </div>
    );

    const radarData = Object.keys(stats.spider_chart_data).map((key) => ({
        skill: key,
        A: stats.spider_chart_data[key],
        fullMark: 100,
    }));

    const statCards = [
        { label: 'Total XP', value: stats.xp.toLocaleString(), icon: Zap, color: 'bg-gradient-to-br from-[#0D9488] to-[#14B8A6]', iconBg: 'bg-[#F0FDFA]', iconColor: 'text-[#0D9488]' },
        { label: 'Credits', value: `$${credits.toFixed(2)}`, icon: Award, color: 'bg-gradient-to-br from-orange-400 to-amber-500', iconBg: 'bg-orange-50', iconColor: 'text-orange-500' },
        { label: 'Potential Off', value: `$${((stats.xp / 100) * 0.4).toFixed(2)}`, icon: Sparkles, color: 'bg-gradient-to-br from-purple-500 to-indigo-500', iconBg: 'bg-purple-50', iconColor: 'text-purple-500' },
    ];

    return (
        <div className="p-8 md:p-12 max-w-5xl mx-auto h-full overflow-y-auto">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-10 flex items-center gap-6"
            >
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-[#0D9488] to-[#5EEAD4] p-6 rounded-3xl shrink-0 shadow-glow-lg"
                >
                    <User size={48} className="text-white" />
                </motion.div>
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">My Profile</h1>
                    <div className="flex items-center gap-4">
                        <p className="text-gray-500 text-lg flex items-center gap-2">
                            Level {stats.level} Writer <Award size={18} className="text-[#0D9488]" />
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRedeem}
                            disabled={redeeming || stats.xp < 100}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${stats.xp >= 100
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <Sparkles size={14} className={redeeming ? 'animate-spin' : ''} />
                            {redeeming ? 'Redeeming...' : 'Redeem 100 XP'}
                        </motion.button>
                    </div>
                </div>
            </motion.header>

            {/* Stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {statCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={card.label}
                            variants={statVariants}
                            initial="hidden"
                            animate="show"
                            custom={i}
                            whileHover={{ y: -6, scale: 1.02 }}
                            className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl border border-[#CCFBF1] shadow-card hover:shadow-card-hover transition-shadow flex items-center gap-4"
                        >
                            <div className={`${card.iconBg} p-3 rounded-xl`}>
                                <Icon className={card.iconColor} size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">{card.label}</p>
                                <p className="text-2xl font-black text-gray-900">{card.value}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Radar chart */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white/80 backdrop-blur-lg p-8 border border-[#CCFBF1] rounded-3xl shadow-card mb-10"
            >
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Skill Proficiency</h2>
                <div className="w-full h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="#CCFBF1" />
                            <PolarAngleAxis dataKey="skill" tick={{ fill: '#4b5563', fontSize: 14, fontWeight: 600 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9ca3af' }} />
                            <Radar name="Proficiency" dataKey="A" stroke="#0D9488" fill="#5EEAD4" fillOpacity={0.35} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
}
