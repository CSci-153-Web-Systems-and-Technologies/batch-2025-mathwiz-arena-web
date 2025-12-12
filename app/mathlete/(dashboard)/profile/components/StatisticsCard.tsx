"use client";

interface StatisticsCardProps {
    stats: {
        competitionsCompleted: number;
        totalScore: number;
        averageScore: number;
        bestScore: number;
        bestCompetition: string | null;
        wins: number; // 1st place finishes
        topThree: number; // Top 3 finishes
        perfectScores: number;
        winRate: number;
    };
}

export default function StatisticsCard({ stats }: StatisticsCardProps) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Statistics</h2>
                <span className="text-sm text-slate-500">All-time performance</span>
            </div>

            <div className="p-6">
                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                        <p className="text-3xl font-bold text-[#25346A]">{stats.competitionsCompleted}</p>
                        <p className="text-sm text-slate-600 mt-1">Completed</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                        <p className="text-3xl font-bold text-[#F49700]">{stats.totalScore}</p>
                        <p className="text-sm text-slate-600 mt-1">Total Points</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                        <p className="text-3xl font-bold text-green-600">{stats.averageScore.toFixed(1)}</p>
                        <p className="text-sm text-slate-600 mt-1">Avg Score</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                        <p className="text-3xl font-bold text-purple-600">{stats.bestScore}</p>
                        <p className="text-sm text-slate-600 mt-1">Best Score</p>
                    </div>
                </div>

                {/* Best Performance */}
                {stats.bestCompetition && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                <span className="text-xl">🏆</span>
                            </div>
                            <div>
                                <p className="text-sm text-amber-700 font-medium">Best Performance</p>
                                <p className="text-slate-800 font-semibold">{stats.bestCompetition}</p>
                            </div>
                            <div className="ml-auto text-right">
                                <p className="text-2xl font-bold text-amber-600">{stats.bestScore}</p>
                                <p className="text-xs text-amber-600">points</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Win/Performance Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Wins */}
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">🥇</span>
                            <span className="text-sm text-slate-600">1st Places</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{stats.wins}</p>
                    </div>

                    {/* Top 3 */}
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">🎖️</span>
                            <span className="text-sm text-slate-600">Top 3</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{stats.topThree}</p>
                    </div>

                    {/* Perfect Scores */}
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">💯</span>
                            <span className="text-sm text-slate-600">Perfect</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{stats.perfectScores}</p>
                    </div>

                    {/* Win Rate */}
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">📊</span>
                            <span className="text-sm text-slate-600">Win Rate</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{stats.winRate.toFixed(1)}%</p>
                    </div>
                </div>

                {/* No Data State */}
                {stats.competitionsCompleted === 0 && (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <p className="text-slate-600 font-medium">No competitions completed yet</p>
                        <p className="text-sm text-slate-500 mt-1">Join a competition to start building your stats!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
