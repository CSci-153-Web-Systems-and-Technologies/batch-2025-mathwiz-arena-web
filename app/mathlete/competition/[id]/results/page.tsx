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

    // Sort answers by order_index
    const sortedAnswers = answers?.sort((a: any, b: any) =>
        (a.competition_problems?.order_index ?? 0) - (b.competition_problems?.order_index ?? 0)
    );

    // Get total possible points
    const { data: allProblems } = await supabase
        .from("competition_problems")
        .select("points")
        .eq("competition_id", attempt.competition_id);

    const totalPossiblePoints = allProblems?.reduce((sum, p) => sum + p.points, 0) || 0;
    const correctCount = sortedAnswers?.filter((a: any) => a.is_correct).length || 0;
    const totalQuestions = allProblems?.length || 0;
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
        if (percentageScore >= 80) return "text-green-600";
        if (percentageScore >= 60) return "text-blue-600";
        if (percentageScore >= 40) return "text-yellow-600";
        return "text-red-600";
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#25346A] mb-2">
                        {competition?.name || "Competition"} Results
                    </h1>
                    <p className="text-slate-600">Attempt #{attempt.attempt_number}</p>
                </div>

                {/* Score Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <div className="text-center">
                        <div className={`text-6xl font-bold ${getScoreColor()} mb-2`}>
                            {percentageScore}%
                        </div>
                        <p className="text-2xl font-semibold text-slate-700 mb-1">
                            {attempt.total_score} / {totalPossiblePoints} points
                        </p>
                        <p className="text-lg text-slate-500 mb-4">
                            {correctCount} / {totalQuestions} questions correct
                        </p>
                        <p className="text-xl font-medium text-slate-600">{getScoreMessage()}</p>
                    </div>

                    <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{correctCount}</div>
                            <div className="text-sm text-green-700">Correct</div>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{totalQuestions - correctCount}</div>
                            <div className="text-sm text-red-700">Incorrect</div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{attempt.total_score}</div>
                            <div className="text-sm text-blue-700">Points Earned</div>
                        </div>
                    </div>
                </div>

                {/* Answer Review */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Answer Review</h2>
                    <div className="space-y-4">
                        {sortedAnswers?.map((answer: any, index: number) => {
                            const problem = answer.competition_problems?.problems;
                            const compProblem = answer.competition_problems;

                            return (
                                <div
                                    key={answer.id}
                                    className={`p-4 rounded-lg border-2 ${answer.is_correct
                                        ? "border-green-200 bg-green-50"
                                        : "border-red-200 bg-red-50"
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="text-sm font-semibold text-slate-600">
                                            Question {compProblem?.order_index + 1 || index + 1}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">
                                                {answer.points_earned} / {compProblem?.points} pts
                                            </span>
                                            {answer.is_correct ? (
                                                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-slate-800 mb-3"><MathRenderer text={problem?.question || ''} /></div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-slate-500">Your answer:</span>
                                            <span className={`ml-2 font-medium ${answer.is_correct ? "text-green-700" : "text-red-700"}`}>
                                                {answer.answer ? <MathRenderer text={answer.answer} /> : "(No answer)"}
                                            </span>
                                        </div>
                                        {!answer.is_correct && (
                                            <div>
                                                <span className="text-slate-500">Correct answer:</span>
                                                <span className="ml-2 font-medium text-green-700">
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
                <div className="flex justify-center gap-4">
                    <Link
                        href="/mathlete"
                        className="px-8 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                    >
                        Back to Dashboard
                    </Link>
                    {hasMoreAttempts && (
                        <Link
                            href={`/mathlete/competition/${params.id}`}
                            className="px-8 py-3 bg-[#25346A] text-white rounded-lg hover:bg-[#1e2a54] transition-colors font-semibold"
                        >
                            Try Again
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
