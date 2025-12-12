import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function ProblemBankPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // User is guaranteed to be authenticated by the layout
  const userId = user!.id;

  // Fetch problem banks for the current organizer
  const { data: problemBanks, error } = await supabase
    .from("problem_banks")
    .select("*")
    .eq("organizer_id", userId)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Problem Banks</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage your collection of problem banks</p>
          </div>
          <Link
            href="/organizer/problem-bank/create"
            className="inline-flex items-center gap-2 rounded-lg bg-[#f49700] px-6 py-3 text-white font-medium hover:bg-[#d68400] transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Problem Bank
          </Link>
        </div>

        {/* Problem Banks Grid */}
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
            Error loading problem banks. Please try again.
          </div>
        ) : problemBanks && problemBanks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problemBanks.map((bank) => (
              <Link
                key={bank.id}
                href={`/organizer/problem-bank/${bank.id}`}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 hover:shadow-lg dark:hover:shadow-slate-900/50 transition-shadow cursor-pointer group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#f49700]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#f49700]/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#f49700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1 truncate group-hover:text-[#f49700] transition-colors">
                      {bank.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      {bank.description || "No description"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <span>Created {new Date(bank.created_at).toLocaleDateString()}</span>
                  <span className="text-[#f49700] font-medium">View →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <div className="w-20 h-20 bg-[#f49700]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#f49700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">No Problem Banks Yet</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Get started by creating your first problem bank
            </p>
            <Link
              href="/organizer/problem-bank/create"
              className="inline-flex items-center gap-2 rounded-lg bg-[#f49700] px-6 py-3 text-white font-medium hover:bg-[#d68400] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Problem Bank
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
