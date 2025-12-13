"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteCompetitionButton from "./DeleteCompetitionButton";

interface Competition {
    id: string;
    name: string;
    description: string | null;
    start_datetime: string;
    duration_minutes: number;
    participation_type: string;
    max_participants: number | null;
    max_teams: number | null;
    status: string;
    created_at: string;
    competition_problems: { count: number }[];
}

interface CompetitionsListProps {
    competitions: Competition[];
}

type FilterType = "all" | "published" | "draft";

export default function CompetitionsList({ competitions }: CompetitionsListProps) {
    const [filter, setFilter] = useState<FilterType>("all");

    const filteredCompetitions = competitions.filter((competition) => {
        if (filter === "all") return true;
        return competition.status === filter;
    });

    const statusColors = {
        draft: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
        published: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
        ongoing: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
        completed: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400",
    };

    const filterCounts = {
        all: competitions.length,
        published: competitions.filter(c => c.status === "published").length,
        draft: competitions.filter(c => c.status === "draft").length,
    };

    return (
        <div className="overflow-x-hidden">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
                <span className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mr-2 flex-shrink-0">Filter:</span>
                <button
                    onClick={() => setFilter("all")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${filter === "all"
                        ? "bg-[#f49700] text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }`}
                >
                    All ({filterCounts.all})
                </button>
                <button
                    onClick={() => setFilter("published")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${filter === "published"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }`}
                >
                    Published ({filterCounts.published})
                </button>
                <button
                    onClick={() => setFilter("draft")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${filter === "draft"
                        ? "bg-slate-600 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }`}
                >
                    Draft ({filterCounts.draft})
                </button>
            </div>

            {/* Competition List */}
            {filteredCompetitions.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        No {filter === "all" ? "" : filter} competitions found
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                        {filter !== "all" && "Try selecting a different filter or "}
                        <Link href="/organizer/competition/create" className="text-[#f49700] hover:underline">
                            create a new competition
                        </Link>
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredCompetitions.map((competition) => {
                        const statusColor = statusColors[competition.status as keyof typeof statusColors] || statusColors.draft;
                        const problemCount = competition.competition_problems?.[0]?.count || 0;
                        const startDate = new Date(competition.start_datetime);
                        // Short format for mobile, longer for desktop
                        const formattedDateShort = startDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        });
                        const formattedDateLong = startDate.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        });

                        return (
                            <div
                                key={competition.id}
                                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow relative group overflow-hidden"
                            >
                                <Link
                                    href={`/organizer/competition/${competition.id}`}
                                    className="absolute inset-0 z-0"
                                >
                                    <span className="sr-only">View Details</span>
                                </Link>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <h3 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-white truncate max-w-full">
                                                {competition.name}
                                            </h3>
                                            <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-medium flex-shrink-0 ${statusColor}`}>
                                                {competition.status.charAt(0).toUpperCase() + competition.status.slice(1)}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-2">
                                            {competition.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
                                    <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600 dark:text-slate-400 min-w-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="truncate md:hidden">{formattedDateShort}</span>
                                        <span className="truncate hidden md:block">{formattedDateLong}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{competition.duration_minutes} mins</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span className="capitalize">{competition.participation_type}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>{problemCount} problems</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5 md:gap-2 pt-4 border-t border-slate-200 dark:border-slate-700 w-full relative z-10">
                                    <Link
                                        href={`/organizer/competition/${competition.id}`}
                                        className="inline-flex items-center justify-center flex-1 min-w-[60px] gap-1 px-2 py-2 text-xs font-medium text-white bg-[#f49700] rounded-lg hover:bg-[#d68400] transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <span>View</span>
                                    </Link>
                                    {(competition.status === "draft" || competition.status === "published") && (
                                        <Link
                                            href={`/organizer/competition/create?edit=${competition.id}`}
                                            className="inline-flex items-center justify-center flex-1 min-w-[50px] gap-1 px-2 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            <span>Edit</span>
                                        </Link>
                                    )}
                                    <DeleteCompetitionButton
                                        competitionId={competition.id}
                                        competitionName={competition.name}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
