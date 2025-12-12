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
            return "from-slate-300 to-slate-400 shadow-slate-200";
        }
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
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">All Achievements</h2>
                        <p className="text-slate-500 mt-1">
                            Complete milestones to earn badges and show off your accomplishments
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-[#25346A]">{earnedAchievements.length}</p>
                        <p className="text-sm text-slate-500">of {allAchievements.length} earned</p>
                    </div>
                </div>

                {/* Progress Bar */}
                {allAchievements.length > 0 && (
                    <div className="mt-4">
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
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
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="text-xl">🏆</span>
                        Earned Badges ({earnedAchievements.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allAchievements.filter(a => earnedIds.has(a.id)).map((achievement) => (
                            <div
                                key={achievement.id}
                                className="p-4 rounded-xl border-2 border-green-200 bg-green-50 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`w-14 h-14 flex-shrink-0 rounded-full bg-gradient-to-br ${getBadgeColorClasses(achievement.badge_color, true)} flex items-center justify-center shadow-lg`}
                                    >
                                        <span className="text-2xl">{achievement.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <h4 className="font-semibold text-slate-900">{achievement.name}</h4>
                                            <span className="text-green-600 text-lg">✓</span>
                                        </div>
                                        <p className="text-sm text-slate-600 mt-1">{achievement.description}</p>
                                        <p className="text-xs text-green-600 mt-2 font-medium">
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
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="text-xl">🔒</span>
                        Locked Badges ({allAchievements.filter(a => !earnedIds.has(a.id)).length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allAchievements.filter(a => !earnedIds.has(a.id)).map((achievement) => (
                            <div
                                key={achievement.id}
                                className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`w-14 h-14 flex-shrink-0 rounded-full bg-gradient-to-br ${getBadgeColorClasses(achievement.badge_color, false)} flex items-center justify-center shadow-lg opacity-50`}
                                    >
                                        <span className="text-2xl grayscale">{achievement.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-slate-700">{achievement.name}</h4>
                                        <p className="text-sm text-slate-500 mt-1">{achievement.description}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-200 text-xs text-slate-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                {getRequirementText(achievement.requirement_type, achievement.requirement_value)}
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
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">🏅</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">No achievements available yet</h3>
                    <p className="text-slate-500 mt-2 max-w-md mx-auto">
                        Achievements will be added soon. Keep competing and check back later!
                    </p>
                </div>
            )}
        </div>
    );
}
