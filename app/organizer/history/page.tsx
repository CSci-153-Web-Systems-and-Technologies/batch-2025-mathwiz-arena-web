import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

interface CompetitionHistory {
  id: string;
  name: string;
  start_datetime: string;
  duration_minutes: number;
  status: string;
  competition_mode: string | null;
  participation_type: string;
  created_at: string;
  participant_count?: number;
  average_rating?: number;
}

export default async function OrganizerHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all competitions for this organizer
  const { data: allCompetitions, error: competitionsError } = await supabase
    .from("competitions")
    .select(`
      id,
      name,
      start_datetime,
      duration_minutes,
      status,
      competition_mode,
      participation_type,
      created_at
    `)
    .eq("organizer_id", user.id)
    .order("start_datetime", { ascending: false });

  if (competitionsError) {
    console.error("Error fetching competitions:", competitionsError);
  }

  // Filter to get only ended competitions
  const now = new Date();
  const endedCompetitions = allCompetitions?.filter(comp => {
    const startTime = new Date(comp.start_datetime);
    const endTime = new Date(startTime.getTime() + comp.duration_minutes * 60000);
    return now > endTime;
  }) || [];

  // Fetch participant counts for each ended competition
  const competitionIds = endedCompetitions.map(c => c.id);

  let participantCounts: Record<string, number> = {};
  let ratingData: Record<string, { sum: number; count: number }> = {};

  if (competitionIds.length > 0) {
    // Get participant counts
    const { data: registrations } = await supabase
      .from("competition_registrations")
      .select("competition_id")
      .in("competition_id", competitionIds)
      .eq("status", "registered");

    if (registrations) {
      registrations.forEach(reg => {
        participantCounts[reg.competition_id] = (participantCounts[reg.competition_id] || 0) + 1;
      });
    }

    // Get ratings
    const { data: ratings } = await supabase
      .from("competition_ratings")
      .select("competition_id, rating")
      .in("competition_id", competitionIds);

    if (ratings) {
      ratings.forEach(rat => {
        if (!ratingData[rat.competition_id]) {
          ratingData[rat.competition_id] = { sum: 0, count: 0 };
        }
        ratingData[rat.competition_id].sum += rat.rating;
        ratingData[rat.competition_id].count += 1;
      });
    }
  }

  // Enrich competitions with participant counts and ratings
  const enrichedCompetitions: CompetitionHistory[] = endedCompetitions.map(comp => ({
    ...comp,
    participant_count: participantCounts[comp.id] || 0,
    average_rating: ratingData[comp.id]
      ? parseFloat((ratingData[comp.id].sum / ratingData[comp.id].count).toFixed(1))
      : undefined
  }));

  // Calculate statistics
  const totalCompetitions = allCompetitions?.length || 0;
  const endedCount = endedCompetitions.length;
  const totalParticipants = Object.values(participantCounts).reduce((sum, count) => sum + count, 0);
  const allRatings = Object.values(ratingData);
  const overallAvgRating = allRatings.length > 0
    ? (allRatings.reduce((sum, r) => sum + r.sum, 0) / allRatings.reduce((sum, r) => sum + r.count, 0)).toFixed(1)
    : "N/A";

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time helper
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Get time since ended
  const getTimeSinceEnded = (startDatetime: string, durationMinutes: number) => {
    const startTime = new Date(startDatetime);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
    const diffMs = now.getTime() - endTime.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 30) {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Link
            href="/organizer"
            className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Competition History</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">View your past competitions and their performance</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#f49700]/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-[#f49700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">Total Competitions</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">{totalCompetitions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">Completed</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">{endedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">Total Participants</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">{totalParticipants}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">Avg. Rating</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">{overallAvgRating}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Competition History List */}
        {enrichedCompetitions.length > 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Past Competitions</h2>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {enrichedCompetitions.map((competition) => (
                <div key={competition.id} className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white truncate max-w-full">
                          {competition.name}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="inline-block px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300">
                            Ended
                          </span>
                          {competition.competition_mode === "live" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400">
                              Live
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                              Scheduled
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="whitespace-nowrap">{formatDate(competition.start_datetime)}, {formatTime(competition.start_datetime)}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="whitespace-nowrap">{competition.duration_minutes} min</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <span className="whitespace-nowrap">{competition.participant_count} participant{competition.participant_count !== 1 ? 's' : ''}</span>
                        </span>
                        <span className="capitalize flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="whitespace-nowrap">{competition.participation_type || "individual"}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-auto gap-4 mt-2 md:mt-0 pt-3 md:pt-0 border-t border-slate-100 dark:border-slate-700 md:border-none">
                      <div className="text-left md:text-right">
                        {competition.average_rating !== undefined ? (
                          <>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Rating</p>
                            <p className="text-lg sm:text-xl font-bold text-[#f49700] flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                              {competition.average_rating}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Ended</p>
                            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                              {getTimeSinceEnded(competition.start_datetime, competition.duration_minutes)}
                            </p>
                          </>
                        )}
                      </div>
                      <Link
                        href={`/organizer/competition/${competition.id}`}
                        className="px-4 py-2 text-sm font-medium text-[#f49700] bg-[#f49700]/10 rounded-lg hover:bg-[#f49700]/20 transition-colors whitespace-nowrap"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="p-8 sm:p-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f49700]/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-[#f49700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">No Competition History Yet</h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Your completed competitions will appear here. Create and publish a competition to get started!
              </p>
              <Link
                href="/organizer/competition/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#f49700] text-white font-semibold rounded-lg hover:bg-[#d68400] transition-colors text-sm sm:text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Competition
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
