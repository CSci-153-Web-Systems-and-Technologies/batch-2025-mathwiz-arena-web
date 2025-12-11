"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { startCompetitionAttempt, submitAnswer, completeAttempt } from "../../actions";
import { MathRenderer } from "@/components/ui/MathInput";

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
                // Use Promise.all to save concurrently
                await Promise.all(unsavedProblemIds.map(async (problemId) => {
                    const answer = answers[problemId];
                    if (answer) {
                        await submitAnswer(attempt.id, problemId, answer);
                    }
                }));
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-8">
                    <div className="text-center mb-8">
                        {isLiveCompetition ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-emerald-100 text-emerald-800 mb-4">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                Live Competition
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 mb-4">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                Scheduled Competition
                            </span>
                        )}
                        <h1 className="text-3xl font-bold text-[#25346A] mb-2">{competition.name}</h1>
                        {competition.description && (
                            <p className="text-slate-600">{competition.description}</p>
                        )}
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <span className="text-slate-600">Duration</span>
                            <span className="font-semibold text-slate-800">{competition.duration_minutes} minutes</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <span className="text-slate-600">Problems</span>
                            <span className="font-semibold text-slate-800">{problems.length} questions</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <span className="text-slate-600">Total Points</span>
                            <span className="font-semibold text-slate-800">
                                {problems.reduce((sum, p) => sum + p.points, 0)} points
                            </span>
                        </div>
                        {isLiveCompetition && (
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                <span className="text-slate-600">Attempts</span>
                                <span className="font-semibold text-slate-800">
                                    {attemptCount} / {competition.max_attempts || '∞'}
                                </span>
                            </div>
                        )}
                        {!isLiveCompetition && startScreenTimeRemaining !== null && (
                            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <span className="text-orange-700">Competition Ends In</span>
                                <span className="font-semibold text-orange-800">
                                    {formatTime(startScreenTimeRemaining)}
                                </span>
                            </div>
                        )}
                        {!isLiveCompetition && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> Scheduled competitions allow only one attempt. Make sure you're ready before starting!
                                </p>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <Link
                            href="/mathlete"
                            className="flex-1 py-3 px-6 text-center border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                        >
                            Go Back
                        </Link>
                        <button
                            onClick={handleStartAttempt}
                            disabled={isLoading}
                            className="flex-1 py-3 px-6 bg-[#25346A] text-white rounded-lg hover:bg-[#1e2a54] transition-colors font-semibold disabled:opacity-50"
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Attempt Completed!</h1>
                    <p className="text-slate-600 mb-6">
                        You scored <span className="font-bold text-[#25346A]">{attempt.total_score}</span> points
                    </p>
                    <Link
                        href="/mathlete"
                        className="inline-block py-3 px-8 bg-[#25346A] text-white rounded-lg hover:bg-[#1e2a54] transition-colors font-semibold"
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
        <div className="h-screen bg-[#f5f7fa] flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 flex-shrink-0">
                <div className="px-6 py-4 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <img src="/icon.svg" alt="MathWiz Arena" className="w-10 h-10" />
                        <div>
                            <span className="text-xl font-bold text-[#25346A]">{competition.name}</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar */}
                <aside className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col">
                    {/* Problem Set Grid */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
                        <h2 className="text-sm font-medium text-slate-600 mb-4">Problem Set</h2>
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
                                            w-10 h-10 rounded-lg font-semibold text-sm transition-all border-2
                                            ${isCurrent
                                                ? 'bg-white text-[#25346A] border-[#25346A]'
                                                : isSaved
                                                    ? 'bg-white text-[#4CAF50] border-[#4CAF50] hover:bg-green-50'
                                                    : hasAnswer
                                                        ? 'bg-white text-[#FFA726] border-[#FFA726] hover:bg-orange-50'
                                                        : 'bg-[#E0E0E0] text-slate-600 border-[#E0E0E0] hover:bg-[#BDBDBD]'
                                            }
                                        `}
                                    >
                                        {index + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Problem Info */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
                        <h3 className="text-base font-semibold text-slate-800 mb-3">
                            Problem {currentProblemIndex + 1}
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Level</span>
                                <span className="font-medium text-slate-800 capitalize">
                                    {currentProblem?.problems.difficulty || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Points</span>
                                <span className="font-medium text-slate-800">
                                    {currentProblem?.points || 0} points
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Status</span>
                                <span className={`font-medium ${savedAnswers[currentProblem?.id]
                                    ? 'text-green-600'
                                    : answers[currentProblem?.id]
                                        ? 'text-yellow-600'
                                        : 'text-slate-500'
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
                            <div className="w-4 h-4 rounded border-2 border-[#4CAF50] bg-white"></div>
                            <span className="text-slate-600">Solved</span>
                            <span className="ml-auto font-semibold text-slate-800">{solvedCount}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded border-2 border-[#FFA726] bg-white"></div>
                            <span className="text-slate-600">Filled</span>
                            <span className="ml-auto font-semibold text-slate-800">{inProgressCount}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded bg-[#E0E0E0]"></div>
                            <span className="text-slate-600">Blank</span>
                            <span className="ml-auto font-semibold text-slate-800">{blankCount}</span>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Timer - Center of Content Area */}
                    <div className="flex justify-center p-4 flex-shrink-0">
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
                    <div className="flex-1 px-8 pb-4 overflow-y-auto">
                        {problems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800 mb-2">No Problems Found</h3>
                                <p className="text-slate-600 max-w-sm">
                                    There are no problems active for this competition yet. Please contact the administrator or try refreshing the page.
                                </p>
                            </div>
                        ) : currentProblem && (
                            <div className="bg-[#e8f4fc] rounded-xl p-8 min-h-[400px]">
                                {/* Problem Title */}
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                                    Problem {currentProblemIndex + 1}
                                </h2>

                                {/* Question */}
                                <div className="text-lg text-slate-700 leading-relaxed mb-8 whitespace-pre-wrap">
                                    <MathRenderer text={currentProblem.problems.question} />
                                </div>

                                {/* Answer Section */}
                                <div>
                                    <h3 className="text-sm font-medium text-slate-600 mb-3">Your Answer:</h3>

                                    {currentProblem.problems.type === "multiple_choice" && currentProblem.problems.options && (
                                        <div className="space-y-3">
                                            {currentProblem.problems.options.map((option, idx) => (
                                                <label
                                                    key={idx}
                                                    className={`
                                                        flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all bg-white
                                                        ${answers[currentProblem.id] === option
                                                            ? 'border-[#25346A] bg-[#25346A]/5'
                                                            : 'border-slate-200 hover:border-slate-300'
                                                        }
                                                    `}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`problem-${currentProblem.id}`}
                                                        value={option}
                                                        checked={answers[currentProblem.id] === option}
                                                        onChange={() => handleAnswerChange(currentProblem.id, option)}
                                                        className="w-4 h-4 text-[#25346A]"
                                                    />
                                                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600">
                                                        {String.fromCharCode(65 + idx)}
                                                    </span>
                                                    <span className="text-slate-800">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {currentProblem.problems.type === "true_false" && (
                                        <div className="flex gap-4">
                                            {["true", "false"].map((option) => (
                                                <label
                                                    key={option}
                                                    className={`
                                                        flex-1 flex items-center justify-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all bg-white
                                                        ${answers[currentProblem.id] === option
                                                            ? 'border-[#25346A] bg-[#25346A]/5'
                                                            : 'border-slate-200 hover:border-slate-300'
                                                        }
                                                    `}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`problem-${currentProblem.id}`}
                                                        value={option}
                                                        checked={answers[currentProblem.id] === option}
                                                        onChange={() => handleAnswerChange(currentProblem.id, option)}
                                                        className="w-4 h-4 text-[#25346A]"
                                                    />
                                                    <span className="text-lg font-semibold capitalize text-slate-800">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {currentProblem.problems.type === "identification" && (
                                        <input
                                            type="text"
                                            value={answers[currentProblem.id] || ""}
                                            onChange={(e) => handleAnswerChange(currentProblem.id, e.target.value)}
                                            placeholder="Type your answer here..."
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-[#25346A] text-lg bg-white"
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Action Bar - Fixed at bottom */}
                    <div className="bg-white border-t border-slate-200 px-8 py-4 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            {/* Left: Navigation */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        setCurrentProblemIndex(Math.max(0, currentProblemIndex - 1));
                                    }}
                                    disabled={currentProblemIndex === 0}
                                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ← Previous
                                </button>
                                <button
                                    onClick={() => {
                                        setCurrentProblemIndex(Math.min(problems.length - 1, currentProblemIndex + 1));
                                    }}
                                    disabled={currentProblemIndex === problems.length - 1}
                                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next →
                                </button>
                            </div>

                            {/* Center: Save Status */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleSaveAnswer}
                                    disabled={isSaving || !answers[currentProblem?.id]}
                                    className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium disabled:opacity-50"
                                >
                                    {isSaving ? "Saving..." : savedAnswers[currentProblem?.id] ? "Saved ✓" : "Save"}
                                </button>
                                <button
                                    onClick={handleResetAnswer}
                                    disabled={!answers[currentProblem?.id] || (isLiveCompetition && !!savedAnswers[currentProblem?.id])}
                                    className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                                >
                                    Reset
                                </button>
                            </div>

                            {/* Right: Review/Submit */}
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-slate-500">
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
                        {/* Review Header */}
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                            <h2 className="text-xl font-bold text-slate-800">Review Your Answers</h2>
                            <button
                                onClick={() => setShowReview(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Summary Stats */}
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex-shrink-0">
                            <div className="flex gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded border-2 border-[#4CAF50] bg-white"></div>
                                    <span className="text-sm text-slate-600">Solved: <span className="font-semibold text-slate-800">{solvedCount}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded border-2 border-[#FFA726] bg-white"></div>
                                    <span className="text-sm text-slate-600">Filled: <span className="font-semibold text-slate-800">{inProgressCount}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-[#E0E0E0]"></div>
                                    <span className="text-sm text-slate-600">Blank: <span className="font-semibold text-slate-800">{blankCount}</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Problems List */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            <div className="space-y-3">
                                {problems.map((problem, index) => {
                                    const hasAnswer = !!answers[problem.id];
                                    const isSaved = !!savedAnswers[problem.id];
                                    const answer = answers[problem.id];

                                    return (
                                        <div
                                            key={problem.id}
                                            className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                                        >
                                            {/* Problem Number with Status */}
                                            <div className={`
                                                w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm flex-shrink-0 border-2
                                                ${isSaved
                                                    ? 'bg-white text-[#4CAF50] border-[#4CAF50]'
                                                    : hasAnswer
                                                        ? 'bg-white text-[#FFA726] border-[#FFA726]'
                                                        : 'bg-[#E0E0E0] text-slate-600 border-[#E0E0E0]'
                                                }
                                            `}>
                                                {index + 1}
                                            </div>

                                            {/* Problem Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-800 font-medium truncate">
                                                    {problem.problems.question.length > 80
                                                        ? problem.problems.question.substring(0, 80) + '...'
                                                        : problem.problems.question
                                                    }
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {problem.points} points • {problem.problems.difficulty}
                                                </p>
                                            </div>

                                            {/* Answer Status */}
                                            <div className="flex-shrink-0 text-right">
                                                {isSaved ? (
                                                    <span className="text-sm text-green-600 font-medium">
                                                        ✓ {answer && answer.length > 20 ? answer.substring(0, 20) + '...' : answer}
                                                    </span>
                                                ) : hasAnswer ? (
                                                    <span className="text-sm text-yellow-600 font-medium">
                                                        Not saved
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-slate-400">
                                                        No answer
                                                    </span>
                                                )}
                                            </div>

                                            {/* Go to Problem Button */}
                                            <button
                                                onClick={() => {
                                                    setCurrentProblemIndex(index);
                                                    setShowReview(false);
                                                }}
                                                className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-[#25346A] border border-[#25346A] rounded-lg hover:bg-[#25346A]/5 transition-colors"
                                            >
                                                Go to
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Review Footer with Submit */}
                        <div className="px-6 py-4 border-t border-slate-200 flex-shrink-0">
                            {blankCount > 0 && (
                                <p className="text-orange-600 text-sm mb-3">
                                    ⚠️ You have {blankCount} unanswered problem{blankCount > 1 ? 's' : ''}. You can still submit, but those will be marked as incorrect.
                                </p>
                            )}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowReview(false)}
                                    className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={() => {
                                        setShowReview(false);
                                        setShowConfirmSubmit(true);
                                    }}
                                    className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Submit Competition?</h2>
                        <p className="text-slate-600 mb-2">
                            You have answered <span className="font-semibold">{Object.keys(answers).length}</span> out of <span className="font-semibold">{problems.length}</span> problems.
                        </p>
                        {Object.keys(answers).length < problems.length && (
                            <p className="text-orange-600 text-sm mb-4">
                                ⚠️ Some problems are not answered. Are you sure you want to submit?
                            </p>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmSubmit(false)}
                                className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={handleSubmitCompetition}
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Toast */}
            {error && (
                <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg">
                    {error}
                    <button onClick={() => setError(null)} className="ml-4 text-red-500 hover:text-red-700">×</button>
                </div>
            )}
        </div>
    );
}
