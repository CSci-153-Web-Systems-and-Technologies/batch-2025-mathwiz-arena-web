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
            <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Statistics</h2>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">All-time performance</span>
            </div>

            <div className="p-3 sm:p-4">
                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                        <p className="text-lg sm:text-2xl font-bold text-[#25346A]">{stats.competitionsCompleted}</p>
                        <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5">Completed</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                        <p className="text-lg sm:text-2xl font-bold text-[#F49700]">{stats.totalScore}</p>
                        <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5">Total Points</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                        <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.averageScore.toFixed(1)}</p>
                        <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5">Avg Score</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                        <p className="text-lg sm:text-2xl font-bold text-purple-600">{stats.bestScore}</p>
                        <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5">Best Score</p>
                    </div>
                </div>

                {/* Best Performance */}
                {stats.bestCompetition && (
                    <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-xl border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-xl sm:text-2xl">🏆</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] sm:text-xs text-amber-700 dark:text-amber-400 font-medium">Best Performance</p>
                                <p className="text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm truncate">{stats.bestCompetition}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-lg sm:text-xl font-bold text-amber-600">{stats.bestScore}</p>
                                <p className="text-[10px] sm:text-xs text-amber-600">points</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Win/Performance Stats */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
                    <div className="p-2 sm:p-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-center">
                        <span className="text-base sm:text-lg">🥇</span>
                        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">1st</p>
                        <p className="text-base sm:text-xl font-bold text-slate-800 dark:text-white">{stats.wins}</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-center">
                        <span className="text-base sm:text-lg">🥈</span>
                        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">Top 3</p>
                        <p className="text-base sm:text-xl font-bold text-slate-800 dark:text-white">{stats.topThree}</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-center">
                        <span className="text-base sm:text-lg">⭐</span>
                        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">Perfect</p>
                        <p className="text-base sm:text-xl font-bold text-slate-800 dark:text-white">{stats.perfectScores}</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-center">
                        <span className="text-base sm:text-lg">📈</span>
                        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">Win %</p>
                        <p className="text-base sm:text-xl font-bold text-slate-800 dark:text-white">{stats.winRate.toFixed(0)}%</p>
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
