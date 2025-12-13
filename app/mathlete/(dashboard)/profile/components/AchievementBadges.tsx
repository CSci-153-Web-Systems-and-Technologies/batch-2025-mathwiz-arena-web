"use client";

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    badge_color: string;
    earned_at: string;
}

interface AchievementBadgesProps {
    achievements: Achievement[];
    totalAvailable: number;
}

export default function AchievementBadges({ achievements, totalAvailable }: AchievementBadgesProps) {
    const getBadgeColorClasses = (color: string) => {
        const colors: Record<string, string> = {
            blue: "from-blue-400 to-blue-600 shadow-blue-200/50 dark:shadow-blue-900/30",
            green: "from-green-400 to-green-600 shadow-green-200/50 dark:shadow-green-900/30",
            purple: "from-purple-400 to-purple-600 shadow-purple-200/50 dark:shadow-purple-900/30",
            gold: "from-yellow-400 to-amber-500 shadow-amber-200/50 dark:shadow-amber-900/30",
            orange: "from-orange-400 to-orange-600 shadow-orange-200/50 dark:shadow-orange-900/30",
            teal: "from-teal-400 to-teal-600 shadow-teal-200/50 dark:shadow-teal-900/30",
        };
        return colors[color] || colors.blue;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white">Achievements</h2>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {achievements.length} / {totalAvailable} earned
                </span>
            </div>

            <div className="p-4 sm:p-6">
                {achievements.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {achievements.map((achievement) => (
                            <div
                                key={achievement.id}
                                className="group relative p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-slate-800"
                            >
                                {/* Badge Icon */}
                                <div
                                    className={`w-10 h-10 sm:w-14 sm:h-14 mx-auto rounded-full bg-gradient-to-br ${getBadgeColorClasses(achievement.badge_color)} flex items-center justify-center shadow-md mb-2 sm:mb-3`}
                                >
                                    <span className="text-lg sm:text-2xl">{achievement.icon}</span>
                                </div>

                                {/* Badge Info */}
                                <div className="text-center">
                                    <h3 className="font-semibold text-slate-800 dark:text-white text-xs sm:text-sm">{achievement.name}</h3>
                                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{achievement.description}</p>
                                </div>

                                {/* Earned Date Tooltip */}
                                <div className="absolute inset-x-0 bottom-0 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity z-10 pt-2">
                                    <div className="bg-slate-800 text-white text-xs py-1 px-2 rounded text-center">
                                        Earned {formatDate(achievement.earned_at)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="text-center py-6 sm:py-8">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                            <span className="text-3xl sm:text-4xl opacity-50">🏅</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 font-medium text-sm sm:text-base">No achievements yet</p>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto px-4">
                            Complete competitions and hit milestones to earn badges!
                        </p>

                        {/* Preview of available achievements */}
                        <div className="mt-6 flex justify-center gap-2 flex-wrap">
                            <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-full text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <span>🎯</span> First Steps
                            </div>
                            <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-full text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <span>⭐</span> Rising Star
                            </div>
                            <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-full text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <span>🏆</span> Winner
                            </div>
                            <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-full text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <span>💯</span> Perfect Score
                            </div>
                        </div>
                    </div>
                )}

                {/* Progress to Next Achievement */}
                {achievements.length > 0 && achievements.length < totalAvailable && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl border border-blue-100 dark:border-blue-800">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Achievement Progress</span>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                {Math.round((achievements.length / totalAvailable) * 100)}%
                            </span>
                        </div>
                        <div className="h-2 bg-white dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                                style={{ width: `${(achievements.length / totalAvailable) * 100}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            {totalAvailable - achievements.length} more achievements to unlock!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
