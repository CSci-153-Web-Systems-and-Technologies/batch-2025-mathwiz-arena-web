import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import ProblemActions from "./components/ProblemActions";
import { MathDisplay } from "./components/MathDisplay";

export default async function ProblemDetailPage({
  params
}: {
  params: { id: string; problemId: string }
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userId = user.id;

  // Fetch problem bank to verify ownership
  const { data: problemBank, error: bankError } = await supabase
    .from("problem_banks")
    .select("*")
    .eq("id", params.id)
    .eq("organizer_id", userId)
    .single();

  if (bankError || !problemBank) {
    notFound();
  }

  // Fetch the specific problem
  const { data: problem, error: problemError } = await supabase
    .from("problems")
    .select("*")
    .eq("id", params.problemId)
    .eq("problem_bank_id", params.id)
    .single();

  if (problemError || !problem) {
    notFound();
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "multiple_choice": return "Multiple Choice";
      case "true_false": return "True/False";
      case "identification": return "Identification";
      default: return type;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
      case "average": return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      case "difficult": return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
      default: return "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600";
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/organizer/problem-bank/${params.id}`}
            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-[#f49700] mb-4 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to {problemBank.title}
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-3">Problem Details</h1>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded border capitalize ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {getTypeLabel(problem.type)}
                </span>
              </div>
            </div>
            <div>
              <ProblemActions problemBankId={params.id} problemId={params.problemId} />
            </div>
          </div>
        </div>

        {/* Problem Content */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          {/* Question */}
          <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Question</h2>
            <div className="text-lg text-slate-800 dark:text-white whitespace-pre-wrap">
              <MathDisplay text={problem.question} />
            </div>
          </div>

          {/* Options (for Multiple Choice) */}
          {problem.type === "multiple_choice" && problem.options && (
            <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3">Options</h2>
              <div className="space-y-2">
                {problem.options.map((option: string, index: number) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 ${option === problem.correct_answer
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white dark:bg-slate-600 border-2 border-slate-300 dark:border-slate-500 flex items-center justify-center text-xs font-medium text-slate-700 dark:text-slate-200">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-slate-800 dark:text-white"><MathDisplay text={option} /></span>
                      {option === problem.correct_answer && (
                        <span className="ml-auto flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Correct
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Correct Answer (for True/False and Identification) */}
          {(problem.type === "true_false" || problem.type === "identification") && (
            <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Correct Answer</h2>
              <div className="p-4 rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-700 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-lg font-medium text-slate-800 dark:text-white capitalize"><MathDisplay text={problem.correct_answer} /></span>
                </div>
              </div>
              {problem.type === "identification" && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Note: For numeric answers, equivalent formats will be accepted during competitions
                </p>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 rounded-b-lg">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3">Metadata</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Type:</span>
                <span className="ml-2 font-medium text-slate-800 dark:text-white">{getTypeLabel(problem.type)}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Difficulty:</span>
                <span className="ml-2 font-medium text-slate-800 dark:text-white capitalize">{problem.difficulty}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Created:</span>
                <span className="ml-2 font-medium text-slate-800 dark:text-white">
                  {new Date(problem.created_at).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Last Updated:</span>
                <span className="ml-2 font-medium text-slate-800 dark:text-white">
                  {new Date(problem.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
