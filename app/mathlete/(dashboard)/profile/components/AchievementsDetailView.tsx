"use client";

interface EarnedAchievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    badge_color: string;
    earned_at: string;
}

interface AllAchievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    badge_color: string;
    requirement_type: string;
    requirement_value: number;
    is_active: boolean;
}

interface AchievementsDetailViewProps {
    earnedAchievements: EarnedAchievement[];
    allAchievements: AllAchievement[];
}

export default function AchievementsDetailView({
    earnedAchievements,
    allAchievements,
}: AchievementsDetailViewProps) {
    const earnedIds = new Set(earnedAchievements.map(a => a.id));

    const getBadgeColorClasses = (color: string, earned: boolean) => {
        if (!earned) {
            return "from-slate-300 to-slate-400 shadow-slate-200/50 dark:shadow-slate-900/30";
        }
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

    const getRequirementText = (type: string, value: number) => {
        switch (type) {
            case "competitions_completed":
                return `Complete ${value} competition${value > 1 ? 's' : ''}`;
            case "total_score":
                return `Earn ${value} total points`;
            case "competitions_won":
                return `Win ${value} competition${value > 1 ? 's' : ''} (1st place)`;
            case "top_three":
                return `Finish in top 3 in ${value} competition${value > 1 ? 's' : ''}`;
            case "perfect_scores":
                return `Get ${value} perfect score${value > 1 ? 's' : ''}`;
            case "teams_joined":
                return `Join ${value} team${value > 1 ? 's' : ''}`;
            case "streak":
                return `Complete ${value} competitions in a row`;
            default:
                return `Reach ${value} ${type.replace(/_/g, ' ')}`;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const getEarnedDate = (id: string) => {
        const earned = earnedAchievements.find(a => a.id === id);
        return earned ? earned.earned_at : null;
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4">
                    <div className="text-center sm:text-left">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">All Achievements</h2>
                        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
                            Complete milestones to earn badges
                        </p>
                    </div>
                    <div className="text-center sm:text-right">
                        <p className="text-2xl sm:text-3xl font-bold text-[#25346A] dark:text-blue-400">{earnedAchievements.length}</p>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">of {allAchievements.length} earned</p>
                    </div>
                </div>

                {/* Progress Bar */}
                {allAchievements.length > 0 && (
                    <div className="mt-3 sm:mt-4">
                        <div className="h-2 sm:h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#4F46E5] to-[#A855F7] rounded-full transition-all duration-500"
                                style={{ width: `${(earnedAchievements.length / allAchievements.length) * 100}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Earned Achievements */}
            {earnedAchievements.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                        <span className="text-lg sm:text-xl">🏆</span>
                        Earned Badges ({earnedAchievements.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {allAchievements.filter(a => earnedIds.has(a.id)).map((achievement) => (
                            <div
                                key={achievement.id}
                                className="p-3 sm:p-4 rounded-xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div
                                        className={`w-10 h-10 sm:w-14 sm:h-14 flex-shrink-0 rounded-full bg-gradient-to-br ${getBadgeColorClasses(achievement.badge_color, true)} flex items-center justify-center shadow-md`}
                                    >
                                        <span className="text-lg sm:text-2xl">{achievement.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">{achievement.name}</h4>
                                            <span className="text-green-600 dark:text-green-400 text-base sm:text-lg flex-shrink-0">✓</span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{achievement.description}</p>
                                        <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 mt-1.5 sm:mt-2 font-medium">
                                            Earned {formatDate(getEarnedDate(achievement.id)!)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Locked Achievements */}
            {allAchievements.filter(a => !earnedIds.has(a.id)).length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                        <span className="text-lg sm:text-xl">🔒</span>
                        Locked Badges ({allAchievements.filter(a => !earnedIds.has(a.id)).length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {allAchievements.filter(a => !earnedIds.has(a.id)).map((achievement) => (
                            <div
                                key={achievement.id}
                                className="p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div
                                        className={`w-10 h-10 sm:w-14 sm:h-14 flex-shrink-0 rounded-full bg-gradient-to-br ${getBadgeColorClasses(achievement.badge_color, false)} flex items-center justify-center shadow-md opacity-50`}
                                    >
                                        <span className="text-lg sm:text-2xl grayscale">{achievement.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm sm:text-base">{achievement.name}</h4>
                                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{achievement.description}</p>
                                        <div className="mt-1.5 sm:mt-2 flex items-center gap-2">
                                            <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-slate-200 dark:bg-slate-600 text-[10px] sm:text-xs text-slate-600 dark:text-slate-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                <span className="truncate">{getRequirementText(achievement.requirement_type, achievement.requirement_value)}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State - No achievements defined */}
            {allAchievements.length === 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8 sm:p-12 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <span className="text-3xl sm:text-4xl">🏅</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white">No achievements available yet</h3>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto px-4">
                        Achievements will be added soon. Keep competing and check back later!
                    </p>
                </div>
            )}
        </div>
    );
}
