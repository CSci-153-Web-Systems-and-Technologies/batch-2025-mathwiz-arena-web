import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import CompetitionsList from "./components/CompetitionsList";

export default async function CompetitionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // User is guaranteed to be authenticated by the layout
  const userId = user!.id;

  // Fetch competitions for the current organizer
  const { data: competitions, error } = await supabase
    .from("competitions")
    .select(`
      id,
      name,
      description,
      start_datetime,
      duration_minutes,
      participation_type,
      max_participants,
      max_teams,
      status,
      created_at,
      competition_problems (count)
    `)
    .eq("organizer_id", userId)
    .order("created_at", { ascending: false });

  const competitionList = competitions || [];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Competitions</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your math competitions</p>
          </div>
          <Link
            href="/organizer/competition/create"
            className="inline-flex items-center gap-2 rounded-lg bg-[#f49700] px-6 py-3 text-white font-medium hover:bg-[#d68400] transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Competition
          </Link>
        </div>

        {/* Competition List with Filters */}
        {competitionList.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">No Competitions Yet</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Get started by creating your first math competition</p>
            <Link
              href="/organizer/competition/create"
              className="inline-flex items-center gap-2 rounded-lg bg-[#f49700] px-6 py-3 text-white font-medium hover:bg-[#d68400] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Your First Competition
            </Link>
          </div>
        ) : (
          <CompetitionsList competitions={competitionList} />
        )}
      </div>
    </div>
  );
}

