import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { MathRenderer } from "@/components/ui/MathInput";

interface PageProps {
    params: { id: string };
    searchParams: { attemptId?: string };
}

export default async function CompetitionResultsPage({ params, searchParams }: PageProps) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    if (!searchParams.attemptId) {
        redirect(`/mathlete/competition/${params.id}`);
    }

    // Fetch attempt with answers
    const { data: attempt, error: attemptError } = await supabase
        .from("competition_attempts")
        .select(`
      id,
      attempt_number,
      started_at,
      ended_at,
      is_completed,
      total_score,
      competition_id
    `)
        .eq("id", searchParams.attemptId)
        .eq("mathlete_id", user.id)
        .single();

    if (attemptError || !attempt) {
        notFound();
    }

    // Fetch competition details
    const { data: competition } = await supabase
        .from("competitions")
        .select("id, name, competition_mode, max_attempts")
        .eq("id", attempt.competition_id)
        .single();

    // Fetch answers with problem details
    const { data: answers } = await supabase
        .from("competition_answers")
        .select(`
      id,
      answer,
      is_correct,
      points_earned,
      competition_problem_id,
      competition_problems (
        id,
        points,
        order_index,
        problems (
          id,
          question,
          type,
          correct_answer
        )
      )
    `)
        .eq("attempt_id", attempt.id);

    // Get all problems details
    const { data: allProblemsData } = await supabase
        .from("competition_problems")
        .select(`
            id,
            points,
            order_index,
            problems (
                id,
                question,
                type,
                correct_answer
            )
        `)
        .eq("competition_id", attempt.competition_id)
        .order("order_index", { ascending: true });

    // Create a map of answers for easy lookup
    const answersMap = new Map(answers?.map((a: any) => [a.competition_problem_id, a]));

    // Combine problems with answers
    const displayItems = allProblemsData?.map((compProblem: any) => {
        const answer = answersMap.get(compProblem.id);
        return {
            ...compProblem,
            answer: answer || null,
            is_correct: answer?.is_correct || false,
            points_earned: answer?.points_earned || 0
        };
    });

    const totalPossiblePoints = allProblemsData?.reduce((sum, p) => sum + p.points, 0) || 0;
    const correctCount = answers?.filter((a: any) => a.is_correct).length || 0;
    const totalQuestions = allProblemsData?.length || 0;
    const percentageScore = totalPossiblePoints > 0
        ? Math.round((attempt.total_score / totalPossiblePoints) * 100)
        : 0;

    // Get attempt count
    const { count: attemptCount } = await supabase
        .from("competition_attempts")
        .select("*", { count: "exact", head: true })
        .eq("competition_id", attempt.competition_id)
        .eq("mathlete_id", user.id);

    const isLiveCompetition = competition?.competition_mode === 'live';
    const hasMoreAttempts = isLiveCompetition && (
        competition?.max_attempts === null ||
        (attemptCount || 0) < (competition?.max_attempts || 0)
    );

    const getScoreColor = () => {
        if (percentageScore >= 80) return "text-green-600 dark:text-green-400";
        if (percentageScore >= 60) return "text-blue-600 dark:text-blue-400";
        if (percentageScore >= 40) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
    };

    const getScoreMessage = () => {
        if (percentageScore >= 90) return "Outstanding! 🎉";
        if (percentageScore >= 80) return "Excellent work! 🌟";
        if (percentageScore >= 70) return "Great job! 👏";
        if (percentageScore >= 60) return "Good effort! 💪";
        if (percentageScore >= 50) return "Keep practicing! 📚";
        return "Don't give up! 💡";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-4 sm:py-8 px-3 sm:px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-4 sm:mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#25346A] dark:text-white mb-1 px-2">
                        {competition?.name || "Competition"} Results
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Attempt #{attempt.attempt_number}</p>
                </div>

                {/* Score Card - Compact */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="text-center">
                        <div className={`text-4xl sm:text-5xl font-bold ${getScoreColor()} mb-1`}>
                            {percentageScore}%
                        </div>
                        <p className="text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                            {attempt.total_score} / {totalPossiblePoints} pts
                        </p>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-2">
                            {correctCount} / {totalQuestions} correct
                        </p>
                        <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-400">{getScoreMessage()}</p>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3 text-center">
                        <div className="p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">{correctCount}</div>
                            <div className="text-[10px] sm:text-xs text-green-700 dark:text-green-300">Correct</div>
                        </div>
                        <div className="p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">{totalQuestions - correctCount}</div>
                            <div className="text-[10px] sm:text-xs text-red-700 dark:text-red-300">Incorrect</div>
                        </div>
                        <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">{attempt.total_score}</div>
                            <div className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-300">Points</div>
                        </div>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-4 sm:mb-6 px-1 sm:px-0">
                    <Link
                        href="/mathlete"
                        className="w-full sm:w-auto px-5 sm:px-6 py-2 sm:py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-center text-sm"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href={`/mathlete/competition/${params.id}/leaderboard?attemptId=${searchParams.attemptId}`}
                        className="w-full sm:w-auto px-5 sm:px-6 py-2 sm:py-2.5 bg-[#25346A] dark:bg-blue-600 text-white rounded-lg hover:bg-[#1e2a54] dark:hover:bg-blue-700 transition-colors font-medium text-center text-sm"
                    >
                        Leaderboard
                    </Link>
                </div>

                {/* Answer Review */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-3 sm:p-6 mb-4 sm:mb-6">
                    <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-3 sm:mb-4 px-1">Answer Review</h2>
                    <div className="space-y-3 sm:space-y-4">
                        {displayItems?.map((item: any, index: number) => {
                            const problem = item.problems;
                            const hasAnswer = !!item.answer;
                            const isCorrect = item.is_correct;

                            return (
                                <div
                                    key={item.id}
                                    className={`p-3 sm:p-4 rounded-lg border-2 ${hasAnswer
                                        ? isCorrect
                                            ? "border-green-200 bg-green-50 dark:border-green-800/50 dark:bg-green-900/10"
                                            : "border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-900/10"
                                        : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50"
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2 gap-2">
                                        <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                                            Q{item.order_index + 1 || index + 1}
                                        </span>
                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                            <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                                                {item.points_earned}/{item.points} pts
                                            </span>
                                            {hasAnswer ? (
                                                isCorrect ? (
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                )
                                            ) : (
                                                <span className="text-[10px] sm:text-xs text-slate-500 font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 bg-slate-200 dark:bg-slate-700 rounded">Skipped</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-sm sm:text-base text-slate-800 dark:text-slate-200 mb-3"><MathRenderer text={problem?.question || ''} /></div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                                        <div className="flex flex-wrap items-baseline gap-1">
                                            <span className="text-slate-500 dark:text-slate-400">Your answer:</span>
                                            <span className={`font-medium ${hasAnswer
                                                ? isCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                                                : "text-slate-400 italic"
                                                }`}>
                                                {hasAnswer ? <MathRenderer text={item.answer.answer} /> : "(No answer)"}
                                            </span>
                                        </div>
                                        {!isCorrect && (
                                            <div className="flex flex-wrap items-baseline gap-1">
                                                <span className="text-slate-500 dark:text-slate-400">Correct:</span>
                                                <span className="font-medium text-green-700 dark:text-green-400">
                                                    <MathRenderer text={problem?.correct_answer?.split('|')[0] || ''} />
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Actions */}
                {hasMoreAttempts && (
                    <div className="flex justify-center px-2 sm:px-0">
                        <Link
                            href={`/mathlete/competition/${params.id}`}
                            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-[#25346A] text-white rounded-lg hover:bg-[#1e2a54] transition-colors font-semibold text-center text-sm sm:text-base"
                        >
                            Try Again
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
