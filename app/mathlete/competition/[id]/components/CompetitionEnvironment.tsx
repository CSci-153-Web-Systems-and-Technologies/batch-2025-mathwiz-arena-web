"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { startCompetitionAttempt, submitAnswer, submitBatchAnswers, completeAttempt } from "../../actions";
import { MathRenderer, MathAnswerInput } from "@/components/ui/MathInput";

interface Problem {
    id: string;
    question: string;
    type: string;
    options: string[] | null;
    difficulty: string;
}

interface CompetitionProblem {
    id: string;
    points: number;
    order_index: number;
    problems: Problem;
}

interface Competition {
    id: string;
    name: string;
    description: string | null;
    duration_minutes: number;
    competition_mode: string | null;
    max_attempts: number | null;
    is_active: boolean;
    status: string;
    start_datetime: string | null;
    participation_type: string;
}

interface Attempt {
    id: string;
    attempt_number: number;
    started_at: string;
    ended_at: string | null;
    is_completed: boolean;
    total_score: number;
}

interface CompetitionEnvironmentProps {
    competition: Competition;
    problems: CompetitionProblem[];
    attempt: Attempt | null;
    existingAnswers: Record<string, { answer: string; is_correct: boolean | null }>;
    attemptCount: number;
    userId: string;
}

export default function CompetitionEnvironment({
    competition,
    problems,
    attempt: initialAttempt,
    existingAnswers: initialAnswers,
    attemptCount,
    userId
}: CompetitionEnvironmentProps) {
    const router = useRouter();
    const [attempt, setAttempt] = useState<Attempt | null>(initialAttempt);
    const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        Object.entries(initialAnswers).forEach(([problemId, data]) => {
            initial[problemId] = data.answer;
        });
        return initial;
    });
    const [savedAnswers, setSavedAnswers] = useState<Record<string, { is_correct: boolean | null }>>(
        () => {
            const initial: Record<string, { is_correct: boolean | null }> = {};
            Object.entries(initialAnswers).forEach(([problemId, data]) => {
                initial[problemId] = { is_correct: data.is_correct };
            });
            return initial;
        }
    );
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [startScreenTimeRemaining, setStartScreenTimeRemaining] = useState<number | null>(null);

    const isLiveCompetition = competition.competition_mode === 'live';
    const currentProblem = problems[currentProblemIndex];

    // Calculate time remaining
    // For Live competitions: based on attempt start time + duration
    // For Scheduled competitions: based on competition end time (all participants end together)
    useEffect(() => {
        if (!attempt || attempt.is_completed) return;

        const calculateTimeRemaining = () => {
            const now = new Date();
            let endTime: Date;

            if (isLiveCompetition) {
                // Live competition: timer based on when the attempt started
                const startTime = new Date(attempt.started_at);
                endTime = new Date(startTime.getTime() + competition.duration_minutes * 60 * 1000);
            } else {
                // Scheduled competition: timer based on competition end time
                if (competition.start_datetime) {
                    const competitionStart = new Date(competition.start_datetime);
                    endTime = new Date(competitionStart.getTime() + competition.duration_minutes * 60 * 1000);
                } else {
                    // Fallback to attempt-based timing if no start_datetime
                    const startTime = new Date(attempt.started_at);
                    endTime = new Date(startTime.getTime() + competition.duration_minutes * 60 * 1000);
                }
            }

            const remaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
            return remaining;
        };

        setTimeRemaining(calculateTimeRemaining());

        const interval = setInterval(() => {
            const remaining = calculateTimeRemaining();
            setTimeRemaining(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
                handleSubmitCompetition();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [attempt, competition.duration_minutes, competition.start_datetime, isLiveCompetition]);

    // Timer for start screen (Scheduled Competition)
    useEffect(() => {
        if (attempt || isLiveCompetition || !competition.start_datetime) return;

        const calculateStartScreenTimer = () => {
            const competitionStart = new Date(competition.start_datetime!);
            const competitionEnd = new Date(competitionStart.getTime() + competition.duration_minutes * 60 * 1000);
            const now = new Date();
            return Math.max(0, Math.floor((competitionEnd.getTime() - now.getTime()) / 1000));
        };

        setStartScreenTimeRemaining(calculateStartScreenTimer());

        const interval = setInterval(() => {
            setStartScreenTimeRemaining(calculateStartScreenTimer());
        }, 1000);

        return () => clearInterval(interval);
    }, [attempt, isLiveCompetition, competition.start_datetime, competition.duration_minutes]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartAttempt = async () => {
        console.log("[CompetitionEnvironment] Start button clicked, calling startCompetitionAttempt...");
        setIsLoading(true);
        setError(null);

        const result = await startCompetitionAttempt(competition.id);
        console.log("[CompetitionEnvironment] startCompetitionAttempt result:", result);

        if (result.success && result.attemptId) {
            console.log("[CompetitionEnvironment] Navigating to attempt:", result.attemptId);
            // Use window.location.href for a full page reload to ensure server re-renders with new data
            window.location.href = `/mathlete/competition/${competition.id}?attemptId=${result.attemptId}`;
        } else {
            console.log("[CompetitionEnvironment] Error:", result.error);
            setError(result.error || "Failed to start competition");
            setIsLoading(false);
        }
    };

    const handleAnswerChange = (problemId: string, answer: string) => {
        setAnswers(prev => ({
            ...prev,
            [problemId]: answer
        }));
    };

    const handleResetAnswer = () => {
        if (!currentProblem) return;
        setAnswers(prev => {
            const newAnswers = { ...prev };
            delete newAnswers[currentProblem.id];
            return newAnswers;
        });
        // Also clear the saved status
        setSavedAnswers(prev => {
            const newSaved = { ...prev };
            delete newSaved[currentProblem.id];
            return newSaved;
        });
    };

    const handleSaveAnswer = async () => {
        if (!attempt || !currentProblem) return;

        const answer = answers[currentProblem.id];
        if (!answer) return;

        setIsSaving(true);

        const result = await submitAnswer(attempt.id, currentProblem.id, answer);

        if (result.success) {
            setSavedAnswers(prev => ({
                ...prev,
                [currentProblem.id]: { is_correct: result.isCorrect ?? null }
            }));
        } else {
            setError(result.error || "Failed to save answer");
        }

        setIsSaving(false);
    };

    const handleSubmitCompetition = async () => {
        if (!attempt) return;

        setIsSubmitting(true);

        // Identify answers that need saving (filled but not yet saved)
        const unsavedProblemIds = Object.keys(answers).filter(problemId => !savedAnswers[problemId]);

        // Auto-save all unsaved answers before completing
        if (unsavedProblemIds.length > 0) {
            try {
                const batchPayload: Record<string, string> = {};
                unsavedProblemIds.forEach(id => {
                    if (answers[id]) {
                        batchPayload[id] = answers[id];
                    }
                });

                if (Object.keys(batchPayload).length > 0) {
                    await submitBatchAnswers(attempt.id, batchPayload);
                }
            } catch (err) {
                console.error("Error auto-saving answers:", err);
                // Continue with submission even if auto-save fails partially? 
                // Better to try to complete.
            }
        }

        const result = await completeAttempt(attempt.id);

        if (result.success) {
            router.push(`/mathlete/competition/${competition.id}/results?attemptId=${attempt.id}`);
        } else {
            setError(result.error || "Failed to submit competition");
            setIsSubmitting(false);
        }
    };

    const getTimeColor = () => {
        if (!timeRemaining) return "text-slate-600";
        if (timeRemaining <= 60) return "text-red-600 animate-pulse";
        if (timeRemaining <= 300) return "text-orange-600";
        return "text-slate-600";
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "easy": return "bg-green-100 text-green-700";
            case "average": return "bg-yellow-100 text-yellow-700";
            case "difficult": return "bg-red-100 text-red-700";
            default: return "bg-slate-100 text-slate-700";
        }
    };

    // Show start screen if no attempt
    if (!attempt) {
        // Calculate time remaining in scheduled competition
        // Moved to useEffect to prevent hydration mismatch


        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-3 sm:p-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-xl max-w-xl w-full p-5 sm:p-8 transition-colors">
                    <div className="text-center mb-5 sm:mb-8">
                        {isLiveCompetition ? (
                            <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 mb-3 sm:mb-4">
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                Live Competition
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 mb-3 sm:mb-4">
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></span>
                                Scheduled Competition
                            </span>
                        )}

                        <h1 className="text-xl sm:text-3xl font-bold text-[#25346A] dark:text-white mb-1 sm:mb-2 px-2">{competition.name}</h1>
                        {competition.description && (
                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 px-2">{competition.description}</p>
                        )}
                    </div>

                    <div className="space-y-2.5 sm:space-y-4 mb-5 sm:mb-8">
                        <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <span className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Duration</span>
                            <span className="font-semibold text-sm sm:text-base text-slate-800 dark:text-white">{competition.duration_minutes} min</span>
                        </div>
                        <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <span className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Problems</span>
                            <span className="font-semibold text-sm sm:text-base text-slate-800 dark:text-white">{problems.length} questions</span>
                        </div>
                        <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <span className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Total Points</span>
                            <span className="font-semibold text-sm sm:text-base text-slate-800 dark:text-white">
                                {problems.reduce((sum, p) => sum + p.points, 0)} pts
                            </span>
                        </div>
                        {isLiveCompetition && (
                            <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <span className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Attempts</span>
                                <span className="font-semibold text-sm sm:text-base text-slate-800 dark:text-white">
                                    {attemptCount} / {competition.max_attempts || '∞'}
                                </span>
                            </div>
                        )}
                        {!isLiveCompetition && startScreenTimeRemaining !== null && (
                            <div className="flex items-center justify-between p-3 sm:p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800">
                                <span className="text-sm sm:text-base text-orange-700 dark:text-orange-400">Ends In</span>
                                <span className="font-semibold text-sm sm:text-base text-orange-800 dark:text-orange-200">
                                    {formatTime(startScreenTimeRemaining)}
                                </span>
                            </div>
                        )}
                        {!isLiveCompetition && (
                            <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                                <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                                    <strong>Note:</strong> One attempt only. Make sure you're ready!
                                </p>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-xs sm:text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4">
                        <Link
                            href="/mathlete"
                            className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 text-center border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm sm:text-base"
                        >
                            Go Back
                        </Link>
                        <button
                            onClick={handleStartAttempt}
                            disabled={isLoading}
                            className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 bg-[#25346A] text-white rounded-lg hover:bg-[#1e2a54] transition-colors font-semibold disabled:opacity-50 text-sm sm:text-base"
                        >
                            {isLoading ? "Entering..." : "Enter"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Show completed screen
    if (attempt.is_completed) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-3 sm:p-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-xl max-w-xl w-full p-5 sm:p-8 text-center transition-colors">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-1 sm:mb-2">Attempt Completed!</h1>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">
                        You scored <span className="font-bold text-[#25346A] dark:text-blue-400">{attempt.total_score}</span> points
                    </p>
                    <Link
                        href="/mathlete"
                        className="inline-block w-full sm:w-auto py-2.5 sm:py-3 px-6 sm:px-8 bg-[#25346A] text-white rounded-lg hover:bg-[#1e2a54] transition-colors font-semibold text-sm sm:text-base"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // Calculate problem status counts
    const solvedCount = Object.keys(savedAnswers).length;
    const inProgressCount = Object.keys(answers).filter(id => !savedAnswers[id]).length;
    const blankCount = problems.length - solvedCount - inProgressCount;

    // Competition environment
    return (
        <div className="h-screen bg-[#f5f7fa] dark:bg-slate-900 flex flex-col overflow-hidden transition-colors">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                <div className="px-3 sm:px-6 py-2 sm:py-4 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2 min-w-0">
                        <img src="/icon.svg" alt="MathWiz Arena" className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" />
                        <span className="text-sm sm:text-xl font-bold text-[#25346A] dark:text-white truncate">{competition.name}</span>
                    </div>
                    {/* Mobile Timer in Header */}
                    <div className={`
                        md:hidden px-3 py-1 rounded-lg font-mono text-sm font-bold
                        bg-red-500 text-white
                    `}>
                        {timeRemaining !== null ? formatTime(timeRemaining) : "--:--"}
                    </div>
                </div>
            </header>

            {/* Mobile Problem Grid - Horizontal Scrollable */}
            <div className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-3 py-2 flex-shrink-0">
                <div className="overflow-x-auto scrollbar-hide">
                    <div className="flex gap-1.5 pb-1">
                        {problems.map((problem, index) => {
                            const hasAnswer = !!answers[problem.id];
                            const isSaved = !!savedAnswers[problem.id];
                            const isCurrent = index === currentProblemIndex;

                            return (
                                <button
                                    key={problem.id}
                                    onClick={() => setCurrentProblemIndex(index)}
                                    className={`
                                        w-8 h-8 rounded-lg font-semibold text-xs transition-all flex-shrink-0
                                        ${isCurrent
                                            ? 'bg-white dark:bg-slate-700 text-[#25346A] dark:text-white border-2 border-[#25346A] dark:border-blue-400'
                                            : isSaved
                                                ? 'bg-blue-100 dark:bg-blue-500 text-[#25346A] dark:text-white'
                                                : hasAnswer
                                                    ? 'bg-orange-100 dark:bg-orange-500 text-[#FFA726] dark:text-white'
                                                    : 'bg-[#E0E0E0] dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                        }
                                    `}
                                >
                                    {index + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Hidden on mobile */}
                <aside className="hidden md:flex w-[350px] bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-6 flex-col transition-colors">
                    {/* Problem Set Grid */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-6">
                        <h2 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">Problem Set</h2>
                        <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-5 gap-2">
                                {problems.map((problem, index) => {
                                    const hasAnswer = !!answers[problem.id];
                                    const isSaved = !!savedAnswers[problem.id];
                                    const isCurrent = index === currentProblemIndex;

                                    return (
                                        <button
                                            key={problem.id}
                                            onClick={() => {
                                                setCurrentProblemIndex(index);
                                            }}
                                            className={`
                                                w-10 h-10 rounded-lg font-semibold text-sm transition-all
                                                ${isCurrent
                                                    ? 'bg-white dark:bg-slate-700 text-[#25346A] dark:text-white border-2 border-[#25346A] dark:border-blue-400'
                                                    : isSaved
                                                        ? 'bg-blue-100 dark:bg-blue-500 text-[#25346A] dark:text-white border-0 hover:bg-blue-200 dark:hover:bg-blue-600'
                                                        : hasAnswer
                                                            ? 'bg-orange-100 dark:bg-orange-500 text-[#FFA726] dark:text-white border-0 hover:bg-orange-200 dark:hover:bg-orange-600'
                                                            : 'bg-[#E0E0E0] dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-0 hover:bg-[#BDBDBD] dark:hover:bg-slate-600'
                                                }
                                            `}
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Problem Info */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-6">
                        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-3">
                            Problem {currentProblemIndex + 1}
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Level</span>
                                <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">
                                    {currentProblem?.problems.difficulty || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Points</span>
                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                    {currentProblem?.points || 0} points
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Status</span>
                                <span className={`font-medium ${savedAnswers[currentProblem?.id]
                                    ? 'text-[#25346A] dark:text-blue-400'
                                    : answers[currentProblem?.id]
                                        ? 'text-yellow-600 dark:text-yellow-400'
                                        : 'text-slate-500 dark:text-slate-400'
                                    }`}>
                                    {savedAnswers[currentProblem?.id]
                                        ? 'Solved'
                                        : answers[currentProblem?.id]
                                            ? 'Filled'
                                            : 'Blank'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Legend with Counts */}
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-400"></div>
                            <span className="text-slate-600 dark:text-slate-400">Solved</span>
                            <span className="ml-auto font-semibold text-slate-800 dark:text-slate-200">{solvedCount}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded bg-orange-100 dark:bg-orange-400"></div>
                            <span className="text-slate-600 dark:text-slate-400">Filled</span>
                            <span className="ml-auto font-semibold text-slate-800 dark:text-slate-200">{inProgressCount}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded bg-[#E0E0E0] dark:bg-slate-700"></div>
                            <span className="text-slate-600 dark:text-slate-400">Blank</span>
                            <span className="ml-auto font-semibold text-slate-800 dark:text-slate-200">{blankCount}</span>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Timer - Center of Content Area (Desktop only) */}
                    <div className="hidden md:flex justify-center p-4 flex-shrink-0">
                        <div className={`
                            px-6 py-2 rounded-lg font-mono text-2xl font-bold
                            ${timeRemaining !== null && timeRemaining <= 300
                                ? 'bg-red-500 text-white'
                                : 'bg-red-500 text-white'
                            }
                        `}>
                            {timeRemaining !== null ? formatTime(timeRemaining) : "--:--"}
                        </div>
                    </div>

                    {/* Problem Content Card - Scrollable Area */}
                    <div className="flex-1 px-3 sm:px-8 pb-2 sm:pb-4 overflow-y-auto">
                        {problems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2">No Problems Found</h3>
                                <p className="text-sm sm:text-base text-slate-600 max-w-sm px-4">
                                    There are no problems active for this competition yet.
                                </p>
                            </div>
                        ) : currentProblem && (
                            <div className="bg-[#e8f4fc] dark:bg-slate-800 rounded-xl p-4 sm:p-8 min-h-[300px] sm:min-h-[400px] border border-transparent dark:border-slate-700">
                                {/* Problem Title with mobile info */}
                                <div className="flex items-start justify-between mb-4 sm:mb-6">
                                    <h2 className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-white">
                                        Problem {currentProblemIndex + 1}
                                    </h2>
                                    <div className="md:hidden text-right">
                                        <span className="text-xs text-slate-500 dark:text-slate-400">{currentProblem?.points} pts</span>
                                    </div>
                                </div>

                                {/* Question */}
                                <div className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-5 sm:mb-8 whitespace-pre-wrap">
                                    <MathRenderer text={currentProblem.problems.question} />
                                </div>

                                {/* Answer Section */}
                                <div>
                                    <h3 className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 sm:mb-3">Your Answer:</h3>

                                    {currentProblem.problems.type === "multiple_choice" && currentProblem.problems.options && (
                                        <div className="space-y-2 sm:space-y-3">
                                            {currentProblem.problems.options.map((option, idx) => (
                                                <label
                                                    key={idx}
                                                    className={`
                                                        flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all bg-white dark:bg-slate-700
                                                        ${answers[currentProblem.id] === option
                                                            ? 'border-[#25346A] dark:border-blue-400 bg-[#25346A]/5 dark:bg-blue-900/20'
                                                            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                                                        }
                                                    `}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`problem-${currentProblem.id}`}
                                                        value={option}
                                                        checked={answers[currentProblem.id] === option}
                                                        onChange={() => handleAnswerChange(currentProblem.id, option)}
                                                        className="w-4 h-4 text-[#25346A] dark:text-blue-400"
                                                    />
                                                    <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-200">
                                                        {String.fromCharCode(65 + idx)}
                                                    </span>
                                                    <span className="text-sm sm:text-base text-slate-800 dark:text-slate-200"><MathRenderer text={option} /></span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {currentProblem.problems.type === "true_false" && (
                                        <div className="flex gap-2 sm:gap-4">
                                            {["true", "false"].map((option) => (
                                                <label
                                                    key={option}
                                                    className={`
                                                        flex-1 flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all bg-white dark:bg-slate-700
                                                        ${answers[currentProblem.id] === option
                                                            ? 'border-[#25346A] dark:border-blue-400 bg-[#25346A]/5 dark:bg-blue-900/20'
                                                            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                                                        }
                                                    `}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`problem-${currentProblem.id}`}
                                                        value={option}
                                                        checked={answers[currentProblem.id] === option}
                                                        onChange={() => handleAnswerChange(currentProblem.id, option)}
                                                        className="w-4 h-4 text-[#25346A] dark:text-blue-400"
                                                    />
                                                    <span className="text-base sm:text-lg font-semibold capitalize text-slate-800 dark:text-slate-200">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {currentProblem.problems.type === "identification" && (
                                        <MathAnswerInput
                                            value={answers[currentProblem.id] || ""}
                                            onChange={(value) => handleAnswerChange(currentProblem.id, value)}
                                            placeholder="Type your answer here..."
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Action Bar - Fixed at bottom */}
                    <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-3 sm:px-8 py-2 sm:py-4 flex-shrink-0 transition-colors">
                        {/* Mobile Layout */}
                        <div className="md:hidden">
                            <div className="flex items-center justify-between gap-2">
                                {/* Navigation */}
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentProblemIndex(Math.max(0, currentProblemIndex - 1))}
                                        disabled={currentProblemIndex === 0}
                                        className="px-2 py-1.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium disabled:opacity-50"
                                    >
                                        ←
                                    </button>
                                    <button
                                        onClick={() => setCurrentProblemIndex(Math.min(problems.length - 1, currentProblemIndex + 1))}
                                        disabled={currentProblemIndex === problems.length - 1}
                                        className="px-2 py-1.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium disabled:opacity-50"
                                    >
                                        →
                                    </button>
                                </div>

                                {/* Solve/Reset */}
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={handleSaveAnswer}
                                        disabled={isSaving || !answers[currentProblem?.id]}
                                        className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium disabled:opacity-50"
                                    >
                                        {isSaving ? "..." : savedAnswers[currentProblem?.id] ? "✓ Solved" : "Solve"}
                                    </button>
                                    <button
                                        onClick={handleResetAnswer}
                                        disabled={!answers[currentProblem?.id] || (isLiveCompetition && !!savedAnswers[currentProblem?.id])}
                                        className="px-2 py-1.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium disabled:opacity-50"
                                    >
                                        ↺
                                    </button>
                                </div>

                                {/* Review */}
                                <button
                                    onClick={() => setShowReview(true)}
                                    className="px-3 py-1.5 bg-[#25346A] text-white rounded-lg text-xs font-semibold"
                                >
                                    Review
                                </button>
                            </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden md:flex items-center justify-between">
                            {/* Left: Navigation */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        setCurrentProblemIndex(Math.max(0, currentProblemIndex - 1));
                                    }}
                                    disabled={currentProblemIndex === 0}
                                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ← Previous
                                </button>
                                <button
                                    onClick={() => {
                                        setCurrentProblemIndex(Math.min(problems.length - 1, currentProblemIndex + 1));
                                    }}
                                    disabled={currentProblemIndex === problems.length - 1}
                                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next →
                                </button>
                            </div>

                            {/* Center: Solve Status */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleSaveAnswer}
                                    disabled={isSaving || !answers[currentProblem?.id]}
                                    className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium disabled:opacity-50"
                                >
                                    {isSaving ? "Marking..." : savedAnswers[currentProblem?.id] ? "Solved" : "Solve"}
                                </button>
                                <button
                                    onClick={handleResetAnswer}
                                    disabled={!answers[currentProblem?.id] || (isLiveCompetition && !!savedAnswers[currentProblem?.id])}
                                    className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 dark:disabled:border-slate-700 dark:disabled:text-slate-600"
                                >
                                    Reset
                                </button>
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    Mark as solved if you're<br />confident with your answer
                                </span>
                            </div>

                            {/* Right: Review/Submit */}
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    Review your answer<br />before submitting
                                </span>
                                <button
                                    onClick={() => setShowReview(true)}
                                    className="px-6 py-2.5 bg-[#25346A] text-white rounded-lg hover:bg-[#1e2a54] transition-colors font-semibold"
                                >
                                    Review
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Review Panel */}
            {showReview && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-3xl max-h-[85vh] sm:max-h-[90vh] flex flex-col border-t sm:border border-slate-200 dark:border-slate-700">
                        {/* Review Header */}
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                            {/* Mobile drag handle */}
                            <div className="sm:hidden flex justify-center mb-2">
                                <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                            </div>
                            <div className="flex items-center justify-between">
                                <h2 className="text-base sm:text-xl font-bold text-slate-800 dark:text-white">Review Answers</h2>
                                <button
                                    onClick={() => setShowReview(false)}
                                    className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="px-4 sm:px-6 py-2 sm:py-4 bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                            <div className="flex gap-3 sm:gap-6 justify-center sm:justify-start">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-blue-100 dark:bg-blue-400"></div>
                                    <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400"><span className="font-semibold text-slate-800 dark:text-slate-200">{solvedCount}</span></span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-orange-100 dark:bg-orange-400"></div>
                                    <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400"><span className="font-semibold text-slate-800 dark:text-slate-200">{inProgressCount}</span></span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-[#E0E0E0] dark:bg-slate-600"></div>
                                    <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400"><span className="font-semibold text-slate-800 dark:text-slate-200">{blankCount}</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Problems List */}
                        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4">
                            <div className="space-y-2 sm:space-y-3">
                                {problems.map((problem, index) => {
                                    const hasAnswer = !!answers[problem.id];
                                    const isSaved = !!savedAnswers[problem.id];
                                    const answer = answers[problem.id];

                                    return (
                                        <div
                                            key={problem.id}
                                            onClick={() => {
                                                setCurrentProblemIndex(index);
                                                setShowReview(false);
                                            }}
                                            className="flex items-center gap-2 sm:gap-4 p-2.5 sm:p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                                        >
                                            {/* Problem Number with Status */}
                                            <div className={`
                                                w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-semibold text-xs sm:text-sm flex-shrink-0
                                                ${isSaved
                                                    ? 'bg-blue-100 dark:bg-blue-500 text-[#25346A] dark:text-white'
                                                    : hasAnswer
                                                        ? 'bg-orange-100 dark:bg-orange-500 text-[#FFA726] dark:text-white'
                                                        : 'bg-[#E0E0E0] dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                                }
                                            `}>
                                                {index + 1}
                                            </div>

                                            {/* Problem Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium line-clamp-1">
                                                    <MathRenderer text={
                                                        problem.problems.question.length > 40
                                                            ? problem.problems.question.substring(0, 40) + '...'
                                                            : problem.problems.question
                                                    } />
                                                </div>
                                                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {problem.points} pts
                                                </p>
                                            </div>

                                            {/* Answer Status */}
                                            <div className="flex-shrink-0 text-right">
                                                {isSaved ? (
                                                    <span className="text-[10px] sm:text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded font-medium">
                                                        ✓
                                                    </span>
                                                ) : hasAnswer ? (
                                                    <span className="text-[10px] sm:text-xs px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded font-medium">
                                                        •
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">
                                                        —
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Review Footer with Submit */}
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                            {blankCount > 0 && (
                                <p className="text-orange-600 dark:text-orange-400 text-xs sm:text-sm mb-2 sm:mb-3">
                                    ⚠️ {blankCount} unanswered
                                </p>
                            )}
                            <div className="flex gap-2 sm:gap-3">
                                <button
                                    onClick={() => setShowReview(false)}
                                    className="flex-1 py-2 sm:py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => {
                                        setShowReview(false);
                                        setShowConfirmSubmit(true);
                                    }}
                                    className="flex-1 py-2 sm:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Confirm Submit Modal */}
            {showConfirmSubmit && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-md p-4 sm:p-6 border-t sm:border border-slate-200 dark:border-slate-700">
                        {/* Mobile drag handle */}
                        <div className="sm:hidden flex justify-center mb-3">
                            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-3 sm:mb-4">Submit Competition?</h2>
                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-2">
                            You have answered <span className="font-semibold text-slate-900 dark:text-white">{Object.keys(answers).length}</span> out of <span className="font-semibold text-slate-900 dark:text-white">{problems.length}</span> problems.
                        </p>
                        {Object.keys(answers).length < problems.length && (
                            <p className="text-orange-600 dark:text-orange-400 text-xs sm:text-sm mb-3 sm:mb-4">
                                ⚠️ Some problems are not answered.
                            </p>
                        )}
                        <div className="flex gap-2 sm:gap-3">
                            <button
                                onClick={() => setShowConfirmSubmit(false)}
                                className="flex-1 py-2 sm:py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmitCompetition}
                                disabled={isSubmitting}
                                className="flex-1 py-2 sm:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 text-sm"
                            >
                                {isSubmitting ? "..." : "Submit"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Toast */}
            {error && (
                <div className="fixed bottom-4 right-4 left-4 sm:left-auto bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-lg text-sm">
                    {error}
                    <button onClick={() => setError(null)} className="ml-3 sm:ml-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">×</button>
                </div>
            )}
        </div>
    );
}
