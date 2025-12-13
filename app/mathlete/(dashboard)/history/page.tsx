import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

interface CompetitionAttempt {
  id: string;
  attempt_number: number;
  started_at: string;
  ended_at: string | null;
  is_completed: boolean;
  total_score: number;
  competitions: {
    id: string;
    name: string;
    competition_mode: string | null;
    duration_minutes: number;
    participation_type: string;
  };
}

export default async function MathleteHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all competition attempts for this user
  const { data: attempts, error } = await supabase
    .from("competition_attempts")
    .select(`
      id,
      attempt_number,
      started_at,
      ended_at,
      is_completed,
      total_score,
      competitions (
        id,
        name,
        competition_mode,
        duration_minutes,
        participation_type
      )
    `)
    .eq("mathlete_id", user.id)
    .order("started_at", { ascending: false });

  if (error) {
    console.error("Error fetching attempts:", error);
  }

  // Calculate statistics
  const completedAttempts = attempts?.filter(a => a.is_completed) || [];
  const totalAttempts = attempts?.length || 0;
  const totalScore = completedAttempts.reduce((sum, a) => sum + (a.total_score || 0), 0);
  const avgScore = completedAttempts.length > 0
    ? Math.round(totalScore / completedAttempts.length)
    : 0;

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

  // Format duration helper
  const formatDuration = (startedAt: string, endedAt: string | null, durationMinutes: number) => {
    if (!endedAt) {
      return `${durationMinutes}m`;
    }
    const start = new Date(startedAt);
    const end = new Date(endedAt);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    return `${diffMins}m ${diffSecs}s`;
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Link
            href="/mathlete"
            className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 sm:gap-2 mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#25346A] dark:text-white">Competition History</h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">View your past competitions</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-5 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 truncate">Attempts</p>
                <p className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-white">{totalAttempts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-5 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 truncate">Completed</p>
                <p className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-white">{completedAttempts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-5 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 truncate">Total Score</p>
                <p className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-white">{totalScore}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-5 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 truncate">Avg Score</p>
                <p className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-white">{avgScore}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attempts List */}
        {attempts && attempts.length > 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white">All Attempts</h2>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {attempts.map((attempt) => {
                const competition = attempt.competitions as any;
                return (
                  <div key={attempt.id} className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    {/* Mobile Layout */}
                    <div className="sm:hidden">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-[#25346A] dark:text-white truncate">
                            {competition?.name || "Unknown Competition"}
                          </h3>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {competition?.competition_mode === "live" ? (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                                Live
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                Scheduled
                              </span>
                            )}
                            {!attempt.is_completed ? (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                                <span className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse"></span>
                                In Progress
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                                Completed
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Score</p>
                          <p className="text-lg font-bold text-[#25346A] dark:text-blue-400">{attempt.total_score}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                          <span>{formatDate(attempt.started_at)}</span>
                          <span>•</span>
                          <span>{formatDuration(attempt.started_at, attempt.ended_at, competition?.duration_minutes || 0)}</span>
                        </div>
                        {attempt.is_completed ? (
                          <Link
                            href={`/mathlete/competition/${competition?.id}/results?attemptId=${attempt.id}`}
                            className="px-2.5 py-1 text-xs font-medium text-[#25346A] bg-[#25346A]/10 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg"
                          >
                            Results
                          </Link>
                        ) : (
                          <Link
                            href={`/mathlete/competition/${competition?.id}?attemptId=${attempt.id}`}
                            className="px-2.5 py-1 text-xs font-medium text-white bg-[#25346A] rounded-lg"
                          >
                            Continue
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-[#25346A] dark:text-white">
                            {competition?.name || "Unknown Competition"}
                          </h3>
                          {competition?.competition_mode === "live" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                              Live
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                              Scheduled
                            </span>
                          )}
                          {!attempt.is_completed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
                              In Progress
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                              Completed
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(attempt.started_at)} at {formatTime(attempt.started_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDuration(attempt.started_at, attempt.ended_at, competition?.duration_minutes || 0)}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Attempt #{attempt.attempt_number}
                          </span>
                          <span className="capitalize flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {competition?.participation_type || "individual"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-slate-500 dark:text-slate-400">Score</p>
                          <p className="text-2xl font-bold text-[#25346A] dark:text-blue-400">{attempt.total_score}</p>
                        </div>
                        {attempt.is_completed ? (
                          <Link
                            href={`/mathlete/competition/${competition?.id}/results?attemptId=${attempt.id}`}
                            className="px-4 py-2 text-sm font-medium text-[#25346A] bg-[#25346A]/10 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-[#25346A]/20 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            View Results
                          </Link>
                        ) : (
                          <Link
                            href={`/mathlete/competition/${competition?.id}?attemptId=${attempt.id}`}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#25346A] rounded-lg hover:bg-[#2A64d1] transition-colors"
                          >
                            Continue
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="p-8 sm:p-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#25346A]/10 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-[#25346A] dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">No Competition History Yet</h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 sm:mb-6 max-w-md mx-auto px-4">
                Your competition history will appear here once you participate in competitions.
              </p>
              <Link
                href="/mathlete"
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#25346A] text-white font-semibold rounded-lg hover:bg-[#2A64d1] transition-colors text-sm sm:text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Competitions
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
