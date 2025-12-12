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
            blue: "from-blue-400 to-blue-600 shadow-blue-200",
            green: "from-green-400 to-green-600 shadow-green-200",
            purple: "from-purple-400 to-purple-600 shadow-purple-200",
            gold: "from-yellow-400 to-amber-500 shadow-amber-200",
            orange: "from-orange-400 to-orange-600 shadow-orange-200",
            teal: "from-teal-400 to-teal-600 shadow-teal-200",
        };
        return colors[color] || colors.blue;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Achievements</h2>
                <span className="text-sm text-slate-500">
                    {achievements.length} / {totalAvailable} earned
                </span>
            </div>

            <div className="p-6">
                {achievements.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {achievements.map((achievement) => (
                            <div
                                key={achievement.id}
                                className="group relative p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer"
                            >
                                {/* Badge Icon */}
                                <div
                                    className={`w-14 h-14 mx-auto rounded-full bg-gradient-to-br ${getBadgeColorClasses(achievement.badge_color)} flex items-center justify-center shadow-lg mb-3`}
                                >
                                    <span className="text-2xl">{achievement.icon}</span>
                                </div>

                                {/* Badge Info */}
                                <div className="text-center">
                                    <h3 className="font-semibold text-slate-800 text-sm">{achievement.name}</h3>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{achievement.description}</p>
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
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl opacity-50">🏅</span>
                        </div>
                        <p className="text-slate-600 font-medium">No achievements yet</p>
                        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                            Complete competitions and hit milestones to earn badges!
                        </p>

                        {/* Preview of available achievements */}
                        <div className="mt-6 flex justify-center gap-2 flex-wrap">
                            <div className="px-3 py-1.5 bg-slate-100 rounded-full text-xs text-slate-500 flex items-center gap-1">
                                <span>🎯</span> First Steps
                            </div>
                            <div className="px-3 py-1.5 bg-slate-100 rounded-full text-xs text-slate-500 flex items-center gap-1">
                                <span>⭐</span> Rising Star
                            </div>
                            <div className="px-3 py-1.5 bg-slate-100 rounded-full text-xs text-slate-500 flex items-center gap-1">
                                <span>🏆</span> Winner
                            </div>
                            <div className="px-3 py-1.5 bg-slate-100 rounded-full text-xs text-slate-500 flex items-center gap-1">
                                <span>💯</span> Perfect Score
                            </div>
                        </div>
                    </div>
                )}

                {/* Progress to Next Achievement */}
                {achievements.length > 0 && achievements.length < totalAvailable && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Achievement Progress</span>
                            <span className="text-sm text-slate-500">
                                {Math.round((achievements.length / totalAvailable) * 100)}%
                            </span>
                        </div>
                        <div className="h-2 bg-white rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                                style={{ width: `${(achievements.length / totalAvailable) * 100}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            {totalAvailable - achievements.length} more achievements to unlock!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
