"use client";

import { useEffect, useState } from "react";
import { User, Target, Zap, Award } from "lucide-react";
import { getUserStats } from "@/lib/api";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from "recharts";

export default function ProfilePage() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        async function loadStats() {
            try {
                const data = await getUserStats();
                setStats(data);
            } catch (e) {
                console.error(e);
            }
        }
        loadStats();
    }, []);

    if (!stats) return <div className="p-10 font-bold">Loading Profile...</div>;

    const radarData = Object.keys(stats.spider_chart_data).map((key) => ({
        skill: key,
        A: stats.spider_chart_data[key],
        fullMark: 100,
    }));

    return (
        <div className="p-10 max-w-5xl mx-auto h-full overflow-y-auto">
            <header className="mb-10 flex items-center gap-6">
                <div className="bg-brand-dark p-6 rounded-3xl shrink-0 shadow-sm border border-brand-dark/20">
                    <User size={48} className="text-white" />
                </div>
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">My Profile</h1>
                    <p className="text-gray-500 text-lg flex items-center gap-2">
                        Level {stats.level} Writer <Award size={18} className="text-brand-dark" />
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-surface p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl">
                        <Zap className="text-blue-500" size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Total XP</p>
                        <p className="text-2xl font-black text-gray-900">{stats.xp.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="bg-orange-100 p-3 rounded-xl">
                        <Target className="text-orange-500" size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Current Streak</p>
                        <p className="text-2xl font-black text-gray-900">{stats.streak} Days</p>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-xl">
                        <Award className="text-green-500" size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Games Won</p>
                        <p className="text-2xl font-black text-gray-900">{stats.games_won} / {stats.games_played}</p>
                    </div>
                </div>
            </div>

            <div className="bg-surface p-8 border border-gray-100 rounded-3xl shadow-sm mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Skill Proficiency</h2>
                <div className="w-full h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis dataKey="skill" tick={{ fill: '#4b5563', fontSize: 14, fontWeight: 600 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9ca3af' }} />
                            <Radar
                                name="Proficiency"
                                dataKey="A"
                                stroke="#B3B3D9"
                                fill="#E6E6FA"
                                fillOpacity={0.7}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
