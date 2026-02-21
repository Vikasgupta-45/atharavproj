import { Trophy, Star, TrendingUp } from "lucide-react";
import { getLeaderboard } from "@/lib/api";

export default async function LeaderboardPage() {
    let leaderboardData = [];
    try {
        leaderboardData = await getLeaderboard();
    } catch (error) {
        console.error("Failed to fetch leaderboard", error);
    }

    return (
        <div className="p-10 max-w-5xl mx-auto h-full overflow-y-auto">
            <header className="mb-10 flex items-center gap-4">
                <div className="bg-amber-100 p-3 rounded-2xl">
                    <Trophy className="text-amber-500" size={32} />
                </div>
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900">Leaderboard</h1>
                    <p className="text-gray-500 text-lg">See how you stack up against the best writers.</p>
                </div>
            </header>

            <div className="bg-surface border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-sm font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-5">Rank</th>
                            <th className="px-8 py-5">User</th>
                            <th className="px-8 py-5 text-right">XP</th>
                            <th className="px-8 py-5 text-right">Streak</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {leaderboardData.length > 0 ? (
                            leaderboardData.map((user: any, index: number) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-8 py-6 font-bold text-gray-500">
                                        #{index + 1}
                                        {index === 0 && <span className="ml-2 text-amber-500">👑</span>}
                                    </td>
                                    <td className="px-8 py-6 font-semibold text-gray-800">{user.user_id}</td>
                                    <td className="px-8 py-6 text-right font-bold text-brand-dark">
                                        {user.xp.toLocaleString()} XP
                                    </td>
                                    <td className="px-8 py-6 text-right font-medium text-orange-500 flex items-center justify-end gap-1">
                                        {user.streak} <TrendingUp size={16} />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-8 py-10 text-center text-gray-400">
                                    No leaderboard data available. Start playing to get ranked!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
