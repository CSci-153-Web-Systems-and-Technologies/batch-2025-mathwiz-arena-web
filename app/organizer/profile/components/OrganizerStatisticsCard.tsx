"use client";

interface OrganizerStatisticsCardProps {
    stats: {
        totalCompetitions: number;
        publishedCompetitions: number;
        draftCompetitions: number;
        endedCompetitions: number;
        totalParticipants: number;
        averageRating: number | null;
        topRatedCompetition: { name: string; rating: number } | null;
        mostPopularCompetition: { name: string; participants: number } | null;
        totalRatings: number;
    };
}

export default function OrganizerStatisticsCard({ stats }: OrganizerStatisticsCardProps) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden h-full transition-colors">
            <div className="p-3 sm:p-4">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">Statistics</h2>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    {/* Total Competitions */}
                    <div className="bg-[#f49700]/5 dark:bg-[#f49700]/10 rounded-xl p-3 sm:p-4 text-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#f49700]/10 dark:bg-[#f49700]/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-[#f49700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.totalCompetitions}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Total Competitions</p>
                    </div>

                    {/* Published */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 sm:p-4 text-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.publishedCompetitions}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Published</p>
                    </div>

                    {/* Total Participants */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 sm:p-4 text-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.totalParticipants}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Total Participants</p>
                    </div>

                    {/* Average Rating */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 sm:p-4 text-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                            {stats.averageRating !== null ? stats.averageRating : "—"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Avg. Rating</p>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    {/* Competition Status Breakdown */}
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 sm:p-4">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3">Competition Status</h3>
                        <div className="space-y-1.5 sm:space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Drafts</span>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{stats.draftCompetitions}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Completed</span>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{stats.endedCompetitions}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Total Ratings</span>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{stats.totalRatings}</span>
                            </div>
                        </div>
                    </div>

                    {/* Highlights */}
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 sm:p-4">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3">Highlights</h3>
                        <div className="space-y-2 sm:space-y-3">
                            {stats.topRatedCompetition ? (
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Top Rated</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                        {stats.topRatedCompetition.name}
                                    </p>
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                        {stats.topRatedCompetition.rating}
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Top Rated</p>
                                    <p className="text-sm text-slate-400 dark:text-slate-500 italic">No ratings yet</p>
                                </div>
                            )}

                            {stats.mostPopularCompetition ? (
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Most Popular</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                        {stats.mostPopularCompetition.name}
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        {stats.mostPopularCompetition.participants} participants
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Most Popular</p>
                                    <p className="text-sm text-slate-400 dark:text-slate-500 italic">No participants yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Empty State for new organizers */}
                {stats.totalCompetitions === 0 && (
                    <div className="text-center py-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#f49700]/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-[#f49700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">No competitions yet</h3>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 px-4">
                            Create your first competition to start building your organizer profile!
                        </p>
                        <a
                            href="/organizer/competition/create"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#f49700] text-white font-medium rounded-lg hover:bg-[#d68400] transition-colors text-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Competition
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
