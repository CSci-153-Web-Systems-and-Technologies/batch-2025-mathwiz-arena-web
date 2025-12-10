import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MathleteHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/mathlete"
            className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2 mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[#25346A]">Competition History</h1>
          <p className="text-slate-600 mt-1">View your past competitions and performance</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Empty State */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-[#25346A]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#25346A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">No Competition History Yet</h2>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Your competition history will appear here once you participate in competitions.
            </p>
            <Link
              href="/mathlete"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25346A] text-white font-semibold rounded-lg hover:bg-[#2A64d1] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Competitions
            </Link>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-900">Competition History Coming Soon</h3>
              <p className="text-sm text-blue-800 mt-1">
                Once you participate in competitions, you'll be able to view detailed statistics including:
              </p>
              <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                <li>Competition dates and results</li>
                <li>Your scores and rankings</li>
                <li>Team performance metrics</li>
                <li>Problem-solving statistics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
