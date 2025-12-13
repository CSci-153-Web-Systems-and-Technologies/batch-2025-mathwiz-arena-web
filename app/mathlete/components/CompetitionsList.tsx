"use client";

import { useState, useMemo } from "react";
import JoinButton from "./JoinButton";

interface Competition {
    id: string;
    name: string;
    description: string | null;
    start_datetime: string | null;
    duration_minutes: number;
    participation_type: string;
    max_participants: number | null;
    max_team_members: number | null;
    require_full_team: boolean;
    status: string;
    competition_mode: string;
    max_attempts: number | null;
    is_active: boolean;
}

interface CompetitionsListProps {
    competitions: Competition[];
    registeredIds: string[];
}

export default function CompetitionsList({ competitions, registeredIds }: CompetitionsListProps) {
    const [searchQuery, setSearchQuery] = useState("");

    // Create a Set for quick lookup
    const registeredSet = useMemo(() => new Set(registeredIds), [registeredIds]);

    // Filter competitions based on search query
    const filteredCompetitions = useMemo(() => {
        if (!searchQuery.trim()) {
            return competitions;
        }

        const query = searchQuery.toLowerCase().trim();
        return competitions.filter(competition =>
            competition.name.toLowerCase().includes(query) ||
            (competition.description && competition.description.toLowerCase().includes(query))
        );
    }, [competitions, searchQuery]);

    return (
        <div>
            {/* Search Bar */}
            <div className="mb-4 sm:mb-6">
                <div className="relative">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search competitions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2A64d1] focus:border-transparent text-sm sm:text-base"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                            aria-label="Clear search"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-[#25346A] dark:text-white mb-4 sm:mb-6 uppercase tracking-wide">
                Join Competitions
                {searchQuery && (
                    <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
                        ({filteredCompetitions.length} result{filteredCompetitions.length !== 1 ? 's' : ''})
                    </span>
                )}
            </h2>

            <div className="space-y-3 sm:space-y-4">
                {filteredCompetitions.length > 0 ? (
                    filteredCompetitions.map((competition) => {
                        const isLiveCompetition = competition.competition_mode === "live";
                        const maxAttempts = competition.max_attempts;

                        // For scheduled competitions
                        const startTime = competition.start_datetime ? new Date(competition.start_datetime) : null;
                        const endTime = startTime ? new Date(startTime.getTime() + competition.duration_minutes * 60 * 1000) : null;
                        const now = new Date();

                        let timeText = "";
                        let statusBadge = null;
                        let isScheduledLive = false;
                        const isRegistered = registeredSet.has(competition.id);

                        if (isLiveCompetition) {
                            timeText = "Available anytime";
                            statusBadge = (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                    Live
                                </span>
                            );
                        } else if (startTime && endTime) {
                            const timeUntilStart = startTime.getTime() - now.getTime();
                            const timeUntilEnd = endTime.getTime() - now.getTime();
                            const hoursUntilStart = Math.floor(timeUntilStart / (1000 * 60 * 60));
                            const daysUntilStart = Math.floor(timeUntilStart / (1000 * 60 * 60 * 24));
                            const minutesUntilEnd = Math.floor(timeUntilEnd / (1000 * 60));
                            isScheduledLive = now >= startTime && now < endTime;

                            if (isScheduledLive) {
                                timeText = `Ends in ${minutesUntilEnd} minute${minutesUntilEnd !== 1 ? 's' : ''}`;
                                statusBadge = <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Live Now</span>;
                            } else if (daysUntilStart > 0) {
                                timeText = `Starts in ${daysUntilStart} day${daysUntilStart > 1 ? 's' : ''}`;
                            } else if (hoursUntilStart > 0) {
                                timeText = `Starts in ${hoursUntilStart} hour${hoursUntilStart > 1 ? 's' : ''}`;
                            } else {
                                timeText = startTime.toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit'
                                });
                            }
                        }

                        return (
                            <div key={competition.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all">
                                {/* Header with status badge */}
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <h3 className="text-base sm:text-lg font-semibold text-[#25346A] dark:text-white">{competition.name}</h3>
                                            {statusBadge}
                                            {isRegistered && !isScheduledLive && (
                                                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Registered</span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                                {competition.participation_type.charAt(0).toUpperCase() + competition.participation_type.slice(1)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {competition.duration_minutes} minutes{isLiveCompetition ? "/attempt" : ""}
                                            </span>
                                            {isLiveCompetition && (
                                                <span className="flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    {maxAttempts === null ? "Unlimited attempts" : `${maxAttempts} attempt${maxAttempts !== 1 ? 's' : ''}`}
                                                </span>
                                            )}
                                            {competition.max_participants && (
                                                <span className="flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    Max {competition.max_participants} participants
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                {competition.description && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 sm:mb-4 leading-relaxed line-clamp-2">{competition.description}</p>
                                )}

                                {/* Footer with time and action */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="font-medium">{timeText}</span>
                                    </div>
                                    <JoinButton
                                        competition={competition}
                                        isRegistered={isRegistered}
                                        isScheduledLive={isScheduledLive}
                                        isLiveCompetition={isLiveCompetition}
                                    />
                                </div>
                            </div>
                        );
                    })
                ) : searchQuery ? (
                    <div className="text-center py-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No competitions found</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try a different search term</p>
                        <button
                            onClick={() => setSearchQuery("")}
                            className="mt-4 text-sm text-[#2A64d1] hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                            Clear search
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-slate-500 dark:text-slate-400">No upcoming competitions at the moment</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Check back later for new challenges!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
