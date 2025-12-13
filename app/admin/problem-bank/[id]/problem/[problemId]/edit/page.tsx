import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import EditProblemForm from "./components/EditProblemForm";

export default async function AdminEditProblemPage({
  params
}: {
  params: { id: string; problemId: string }
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // User is guaranteed to be authenticated by the layout
  const userId = user!.id;

  // Fetch problem bank to verify it exists and check ownership
  const { data: problemBank, error: bankError } = await supabase
    .from("problem_banks")
    .select("*, profiles(username)")
    .eq("id", params.id)
    .single();

  if (bankError || !problemBank) {
    notFound();
  }

  // Check if admin owns this problem bank
  const isOwnBank = problemBank.created_by === userId;

  // Only allow editing if admin owns the bank
  if (!isOwnBank) {
    redirect(`/admin/problem-bank/${params.id}/problem/${params.problemId}?error=readonly`);
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

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/admin/problem-bank/${params.id}/problem/${params.problemId}`}
            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 mb-4 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Problem Details
          </Link>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Edit Problem</h1>
          <p className="text-slate-600 dark:text-slate-400">Update the problem details</p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
          <EditProblemForm problem={problem} problemBankId={params.id} />
        </div>
      </div>
    </div>
  );
}
