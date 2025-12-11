import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import LoginButton from "@/components/LoginLogoutButton";
import ProblemActions from "./components/ProblemActions";

export default async function ProblemDetailPage({ 
  params 
}: { 
  params: { id: string; problemId: string } 
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch problem bank to verify ownership
  const { data: problemBank, error: bankError } = await supabase
    .from("problem_banks")
    .select("*")
    .eq("id", params.id)
    .eq("organizer_id", user.id)
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
      case "easy": return "bg-green-100 text-green-700 border-green-200";
      case "average": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "difficult": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full overflow-y-auto">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 mb-8">
            <Image src="/icon.svg" alt="Mathwiz Logo" width={40} height={40} className="rounded-md" />
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Mathwiz</h1>
              <p className="text-xs text-slate-500">Organizer</p>
            </div>
          </Link>

          <nav className="space-y-1">
            <Link
              href="/organizer"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>

            <Link
              href="/organizer/problem-bank"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white bg-[#f49700] rounded-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Problem Bank
            </Link>

            <Link
              href="/organizer/competition"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Competition
            </Link>

            <Link
              href="/organizer/profile"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </Link>

            <Link
              href="/organizer/settings"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>

            <Link
              href="/organizer/history"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </Link>

            <div className="pt-4 mt-4 border-t border-slate-200">
              <LoginButton />
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/organizer/problem-bank/${params.id}`}
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#f49700] mb-4 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to {problemBank.title}
            </Link>
            
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-3">Problem Details</h1>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded border capitalize ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                  <span className="text-sm text-slate-500 font-medium">
                    {getTypeLabel(problem.type)}
                  </span>
                </div>
              </div>
              <ProblemActions problemBankId={params.id} problemId={params.problemId} />
            </div>
          </div>

          {/* Problem Content */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            {/* Question */}
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2">Question</h2>
              <p className="text-lg text-slate-800 whitespace-pre-wrap">{problem.question}</p>
            </div>

            {/* Options (for Multiple Choice) */}
            {problem.type === "multiple_choice" && problem.options && (
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-sm font-semibold text-slate-500 uppercase mb-3">Options</h2>
                <div className="space-y-2">
                  {problem.options.map((option: string, index: number) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border-2 ${
                        option === problem.correct_answer
                          ? "border-green-500 bg-green-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center text-xs font-medium">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="text-slate-800">{option}</span>
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
                    <span className="text-lg font-medium text-slate-800 capitalize">{problem.correct_answer}</span>
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
      </main>
    </div>
  );
}
