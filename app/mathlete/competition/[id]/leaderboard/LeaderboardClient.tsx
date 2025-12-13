"use client";

import { useState } from "react";
import Link from "next/link";

interface LeaderboardEntry {
    rank: number;
    mathlete_id: string;
    display_name: string;
    best_score: number;
    best_percentage: number;
    attempts_count: number;
    is_current_user: boolean;
    is_team?: boolean;
    team_members?: string[];
}

interface LeaderboardClientProps {
    competitionId: string;
    competitionName: string;
    totalPossiblePoints: number;
    userId: string;
    attemptId?: string;
    initialLeaderboard: LeaderboardEntry[];
    isTeamCompetition?: boolean;
}

export default function LeaderboardClient({
    competitionId,
    competitionName,
    totalPossiblePoints,
    userId,
    attemptId,
    initialLeaderboard,
    isTeamCompetition = false
}: LeaderboardClientProps) {
    const [leaderboard] = useState<LeaderboardEntry[]>(initialLeaderboard);
    const [loading] = useState(false);

    const getRankStyle = (rank: number) => {
        if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white";
        if (rank === 2) return "bg-gradient-to-r from-slate-300 to-slate-400 text-white";
        if (rank === 3) return "bg-gradient-to-r from-orange-400 to-orange-500 text-white";
        return "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300";
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return "🥇";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return null;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-4 sm:py-8 px-3 sm:px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#25346A]"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-4 sm:py-8 px-3 sm:px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-5 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#25346A] dark:text-white mb-1 sm:mb-2">
                        🏆 Leaderboard
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 px-4 truncate">{competitionName}</p>
                </div>

                {/* Leaderboard Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-5 sm:mb-8">
                    {/* Top 3 Podium */}
                    {leaderboard.length >= 3 && (
                        <div className="bg-gradient-to-br from-[#25346A] to-[#1e2a54] p-4 sm:p-8">
                            <div className="flex justify-center items-end gap-2 sm:gap-4">
                                {/* 2nd Place */}
                                <div className="text-center flex-1 max-w-[100px] sm:max-w-none">
                                    <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center text-xl sm:text-3xl mb-1 sm:mb-2 shadow-lg">
                                        🥈
                                    </div>
                                    <p className="text-white font-semibold text-xs sm:text-sm truncate px-1">
                                        {leaderboard[1]?.display_name}
                                    </p>
                                    <p className="text-slate-300 text-[10px] sm:text-xs">
                                        {leaderboard[1]?.best_score} pts
                                    </p>
                                </div>

                                {/* 1st Place */}
                                <div className="text-center flex-1 max-w-[120px] sm:max-w-none -mt-2 sm:-mt-4">
                                    <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-2xl sm:text-4xl mb-1 sm:mb-2 shadow-lg ring-2 sm:ring-4 ring-yellow-300">
                                        🥇
                                    </div>
                                    <p className="text-white font-bold text-xs sm:text-base truncate px-1">
                                        {leaderboard[0]?.display_name}
                                    </p>
                                    <p className="text-yellow-300 text-xs sm:text-sm font-semibold">
                                        {leaderboard[0]?.best_score} pts
                                    </p>
                                </div>

                                {/* 3rd Place */}
                                <div className="text-center flex-1 max-w-[100px] sm:max-w-none">
                                    <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-xl sm:text-3xl mb-1 sm:mb-2 shadow-lg">
                                        🥉
                                    </div>
                                    <p className="text-white font-semibold text-xs sm:text-sm truncate px-1">
                                        {leaderboard[2]?.display_name}
                                    </p>
                                    <p className="text-slate-300 text-[10px] sm:text-xs">
                                        {leaderboard[2]?.best_score} pts
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Full Leaderboard List */}
                    <div className="p-3 sm:p-6">
                        <div className="space-y-1.5 sm:space-y-2">
                            {leaderboard.map((entry) => (
                                <div
                                    key={entry.mathlete_id}
                                    className={`flex items-center gap-2.5 sm:gap-4 p-2.5 sm:p-4 rounded-lg sm:rounded-xl transition-all ${entry.is_current_user
                                        ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800"
                                        : "bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                                        }`}
                                >
                                    {/* Rank */}
                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 ${getRankStyle(entry.rank)}`}>
                                        {getRankIcon(entry.rank) || entry.rank}
                                    </div>

                                    {/* Name */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-semibold text-sm sm:text-base truncate ${entry.is_current_user ? "text-[#25346A] dark:text-blue-400" : "text-slate-800 dark:text-slate-200"}`}>
                                            {entry.display_name}
                                            {entry.is_current_user && <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-blue-600 dark:text-blue-400">(You)</span>}
                                        </p>
                                        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                                            {entry.attempts_count} attempt{entry.attempts_count > 1 ? 's' : ''}
                                        </p>
                                    </div>

                                    {/* Score */}
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-bold text-sm sm:text-base text-[#25346A] dark:text-white">{entry.best_score} pts</p>
                                        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">{entry.best_percentage}%</p>
                                    </div>
                                </div>
                            ))}

                            {leaderboard.length === 0 && (
                                <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-slate-500 dark:text-slate-400 px-4">
                                    No participants yet. Be the first to complete this competition!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 px-2 sm:px-0">
                    <Link
                        href="/mathlete"
                        className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-center text-sm sm:text-base"
                    >
                        Back to Dashboard
                    </Link>
                    {attemptId && (
                        <Link
                            href={`/mathlete/competition/${competitionId}/results?attemptId=${attemptId}`}
                            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-[#25346A] dark:bg-blue-600 text-white rounded-lg hover:bg-[#1e2a54] dark:hover:bg-blue-700 transition-colors font-semibold text-center text-sm sm:text-base"
                        >
                            View Answers
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
