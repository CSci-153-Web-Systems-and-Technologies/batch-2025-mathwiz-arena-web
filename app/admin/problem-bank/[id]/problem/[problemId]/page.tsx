import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ProblemActions from "./components/ProblemActions";
import { MathDisplay } from "./components/MathDisplay";

export default async function AdminProblemDetailPage({
  params
}: {
  params: { id: string; problemId: string }
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // User is guaranteed to be authenticated by the layout
  const userId = user!.id;

  // Fetch problem bank (admins can view all but need to check ownership for edit permissions)
  const { data: problemBank, error: bankError } = await supabase
    .from("problem_banks")
    .select(`
      *,
      profiles (
        username
      )
    `)
    .eq("id", params.id)
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

  // Check if admin owns this problem bank
  const isOwnBank = problemBank.created_by === userId;
  const organizer = problemBank.profiles as any;
  const organizerName = organizer?.username || 'Unknown';

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
      case "easy": return "bg-green-100 text-green-700 border-green-200";
      case "average": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "difficult": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/admin/problem-bank/${params.id}`}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-purple-600 mb-4 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to {problemBank.title}
          </Link>

          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-slate-800">Problem Details</h1>
                {!isOwnBank && (
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full">
                    Read-Only
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded border capitalize ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
                <span className="text-sm text-slate-500 font-medium">
                  {getTypeLabel(problem.type)}
                </span>
                {!isOwnBank && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-sm text-slate-500">
                      By: <span className="text-purple-600 font-medium">{organizerName}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
            {isOwnBank && (
              <ProblemActions problemBankId={params.id} problemId={params.problemId} />
            )}
          </div>
        </div>

        {/* Read-only notice for organizer-created problems */}
        {!isOwnBank && (
          <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4 text-purple-700 text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>This problem was created by an organizer. You have read-only access.</span>
          </div>
        )}

        {/* Problem Content */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          {/* Question */}
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2">Question</h2>
            <div className="text-lg text-slate-800 whitespace-pre-wrap">
              <MathDisplay text={problem.question} />
            </div>
          </div>

          {/* Options (for Multiple Choice) */}
          {problem.type === "multiple_choice" && problem.options && (
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-500 uppercase mb-3">Options</h2>
              <div className="space-y-2">
                {problem.options.map((option: string, index: number) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 ${option === problem.correct_answer
                      ? "border-green-500 bg-green-50"
                      : "border-slate-200 bg-slate-50"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center text-xs font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-slate-800"><MathDisplay text={option} /></span>
                      {option === problem.correct_answer && (
                        <span className="ml-auto flex items-center gap-1 text-xs font-medium text-green-700">
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
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2">Correct Answer</h2>
              <div className="p-4 rounded-lg border-2 border-green-500 bg-green-50">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-lg font-medium text-slate-800 capitalize"><MathDisplay text={problem.correct_answer} /></span>
                </div>
              </div>
              {problem.type === "identification" && (
                <p className="text-sm text-slate-500 mt-2">
                  Note: For numeric answers, equivalent formats will be accepted during competitions
                </p>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="p-6 bg-slate-50">
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-3">Metadata</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Type:</span>
                <span className="ml-2 font-medium text-slate-800">{getTypeLabel(problem.type)}</span>
              </div>
              <div>
                <span className="text-slate-500">Difficulty:</span>
                <span className="ml-2 font-medium text-slate-800 capitalize">{problem.difficulty}</span>
              </div>
              <div>
                <span className="text-slate-500">Created:</span>
                <span className="ml-2 font-medium text-slate-800">
                  {new Date(problem.created_at).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Last Updated:</span>
                <span className="ml-2 font-medium text-slate-800">
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
