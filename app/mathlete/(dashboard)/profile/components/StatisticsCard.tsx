"use client";

interface StatisticsCardProps {
    stats: {
        competitionsCompleted: number;
        totalScore: number;
        averageScore: number;
        bestScore: number;
        bestCompetition: string | null;
        wins: number;
        topThree: number;
        perfectScores: number;
        winRate: number;
    };
}

export default function StatisticsCard({ stats }: StatisticsCardProps) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden h-full">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Statistics</h2>
                <span className="text-sm text-slate-500 dark:text-slate-400">All-time performance</span>
            </div>

            <div className="p-4">
                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                        <p className="text-2xl font-bold text-[#25346A]">{stats.competitionsCompleted}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Completed</p>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                        <p className="text-2xl font-bold text-[#F49700]">{stats.totalScore}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Total Points</p>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                        <p className="text-2xl font-bold text-green-600">{stats.averageScore.toFixed(1)}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Avg Score</p>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                        <p className="text-2xl font-bold text-purple-600">{stats.bestScore}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Best Score</p>
                    </div>
                </div>

                {/* Best Performance */}
                {stats.bestCompetition && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-xl border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🏆</span>
                            <div>
                                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Best Performance</p>
                                <p className="text-slate-800 dark:text-slate-200 font-semibold text-sm">{stats.bestCompetition}</p>
                            </div>
                            <div className="ml-auto text-right">
                                <p className="text-xl font-bold text-amber-600">{stats.bestScore}</p>
                                <p className="text-xs text-amber-600">points</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Win/Performance Stats */}
                <div className="grid grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-center">
                        <span className="text-lg">🥇</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">1st Places</p>
                        <p className="text-xl font-bold text-slate-800 dark:text-white">{stats.wins}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-center">
                        <span className="text-lg">🥈</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Top 3</p>
                        <p className="text-xl font-bold text-slate-800 dark:text-white">{stats.topThree}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-center">
                        <span className="text-lg">⭐</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Perfect</p>
                        <p className="text-xl font-bold text-slate-800 dark:text-white">{stats.perfectScores}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-center">
                        <span className="text-lg">📈</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Win Rate</p>
                        <p className="text-xl font-bold text-slate-800 dark:text-white">{stats.winRate.toFixed(1)}%</p>
                    </div>
                </div>

                {/* No Data State */}
                {stats.competitionsCompleted === 0 && (
                    <div className="text-center py-6">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-xl">📊</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 font-medium text-sm">No competitions completed yet</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Join a competition to start building your stats!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
