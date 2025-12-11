import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ProblemBankActions from "./components/ProblemBankActions";
import ProblemsList from "./components/ProblemsList";

export default async function ProblemBankDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // User is guaranteed to be authenticated by the layout
  const userId = user!.id;

  // Fetch problem bank
  const { data: problemBank, error } = await supabase
    .from("problem_banks")
    .select("*")
    .eq("id", params.id)
    .eq("organizer_id", userId)
    .single();

  if (error || !problemBank) {
    notFound();
  }

  // Fetch problems in this bank
  const { data: problems, error: problemsError } = await supabase
    .from("problems")
    .select("*")
    .eq("problem_bank_id", params.id)
    .order("order_index", { ascending: true });

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/organizer/problem-bank"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#f49700] mb-4 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Problem Banks
          </Link>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">{problemBank.title}</h1>
              <p className="text-slate-600">{problemBank.description || "No description"}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                <span>Created {new Date(problemBank.created_at).toLocaleDateString()}</span>
                <span>•</span>
                <span>{problems?.length || 0} problem{problems?.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <ProblemBankActions problemBankId={params.id} />
          </div>
        </div>

        {/* Problems Section */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-800">Problems</h2>
            <Link
              href={`/organizer/problem-bank/${params.id}/add-problem`}
              className="inline-flex items-center gap-2 rounded-lg bg-[#f49700] px-4 py-2 text-white font-medium hover:bg-[#d68400] transition-colors text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Problem
            </Link>
          </div>

          <ProblemsList problems={problems || []} problemBankId={params.id} />
        </div>
      </div>
    </div>
  );
}
