"use client";

import { useState, useEffect } from "react";
import { registerForCompetition, unregisterFromCompetition } from "../actions";
import { createClient } from "@/utils/supabase/client";

interface Competition {
  id: string;
  name: string;
  description: string | null;
  start_datetime: string | null;
  duration_minutes: number;
  participation_type: string;
  max_participants: number | null;
  max_team_members?: number | null;
  require_full_team?: boolean;
  competition_mode?: string | null;
  max_attempts?: number | null;
}

interface CompetitionDetailsModalProps {
  competition: Competition;
  isRegistered: boolean;
  isLiveCompetition: boolean;
  isOpen: boolean;
  onClose: () => void;
}

interface Team {
  id: string;
  name: string;
  max_members: number;
  member_count: number;
}

export default function CompetitionDetailsModal({
  competition,
  isRegistered,
  isLiveCompetition,
  isOpen,
  onClose,
}: CompetitionDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [loadingTeams, setLoadingTeams] = useState(false);

  // Fetch user's teams when modal opens for team competitions
  useEffect(() => {
    if (isOpen && competition.participation_type === "team" && !isRegistered) {
      fetchUserTeams();
    }
  }, [isOpen, competition.participation_type, isRegistered]);

  const fetchUserTeams = async () => {
    setLoadingTeams(true);
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch teams where user is the team leader
    const { data: teams, error } = await supabase
      .from("teams")
      .select("id, name, max_members")
      .eq("team_leader_id", user.id);

    if (!error && teams) {
      // Get member count for each team
      const teamsWithCounts = await Promise.all(
        teams.map(async (team: any) => {
          const { count } = await supabase
            .from("team_members")
            .select("*", { count: "exact", head: true })
            .eq("team_id", team.id);

          return {
            id: team.id,
            name: team.name,
            max_members: team.max_members,
            member_count: count || 0,
          };
        })
      );

      setUserTeams(teamsWithCounts);
      // Auto-select first team if available
      if (teamsWithCounts.length > 0) {
        setSelectedTeamId(teamsWithCounts[0].id);
      }
    }

    setLoadingTeams(false);
  };

  if (!isOpen) return null;

  // Calculate scheduled live status only for scheduled competitions
  const now = new Date();
  let isScheduledLive = false;
  let startTime: Date | null = null;
  let endTime: Date | null = null;

  if (competition.start_datetime) {
    startTime = new Date(competition.start_datetime);
    endTime = new Date(startTime.getTime() + competition.duration_minutes * 60 * 1000);
    isScheduledLive = now >= startTime && now < endTime;
  }

  const handleRegister = async () => {
    // Validate team selection for team competitions
    if (competition.participation_type === "team" && !selectedTeamId) {
      setMessage({ type: "error", text: "Please select a team" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await registerForCompetition(
        competition.id,
        competition.participation_type === "team" ? selectedTeamId : undefined
      );

      if (result.success) {
        setMessage({ type: "success", text: result.message || "Successfully registered!" });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage({ type: "error", text: result.error || "Registration failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await unregisterFromCompetition(competition.id);

      if (result.success) {
        setMessage({ type: "success", text: result.message || "Successfully withdrawn!" });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage({ type: "error", text: result.error || "Withdrawal failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
      setShowWithdrawConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto border-t sm:border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 sm:p-6 z-10">
          {/* Mobile drag handle */}
          <div className="sm:hidden flex justify-center mb-3">
            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-[#25346A] dark:text-white mb-1.5 sm:mb-2 line-clamp-2">{competition.name}</h2>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {isLiveCompetition && (
                  <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    Live
                  </span>
                )}
                {isScheduledLive && !isLiveCompetition && (
                  <span className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
                    In Progress
                  </span>
                )}
                {isRegistered && !isScheduledLive && (
                  <span className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                    Registered
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Competition Details */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 sm:mb-2">Description</h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                {competition.description || "No description provided."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-0.5 sm:mb-1">
                  {isLiveCompetition ? 'Availability' : 'Start Time'}
                </h3>
                <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400">
                  {isLiveCompetition ? (
                    'Available anytime'
                  ) : startTime ? (
                    <>
                      <span className="sm:hidden">
                        {startTime.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        {startTime.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="hidden sm:inline">
                        {startTime.toLocaleString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </>
                  ) : (
                    'Not scheduled'
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-0.5 sm:mb-1">Duration</h3>
                <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400">{competition.duration_minutes} min</p>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-0.5 sm:mb-1">Type</h3>
                <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400 capitalize">{competition.participation_type}</p>
              </div>

              {competition.max_participants && (
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-0.5 sm:mb-1">Max Participants</h3>
                  <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400">{competition.max_participants}</p>
                </div>
              )}
            </div>
          </div>

          {/* Team Selection for Team Competitions */}
          {competition.participation_type === "team" && !isRegistered && !(isScheduledLive && !isLiveCompetition) && (
            <div className="space-y-2 sm:space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">Select Your Team</h3>
                {competition.max_team_members && (
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium self-start">
                    {competition.require_full_team
                      ? `Exactly ${competition.max_team_members} members`
                      : `2-${competition.max_team_members} members`
                    }
                  </span>
                )}
              </div>
              {loadingTeams ? (
                <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Loading teams...
                </div>
              ) : userTeams.length === 0 ? (
                <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-300">
                    You are not a team leader. Only team leaders can register their teams.
                  </p>
                </div>
              ) : (
                <>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25346A] focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm sm:text-base"
                  >
                    {userTeams.map((team) => {
                      const meetsRequirement = competition.require_full_team && competition.max_team_members
                        ? team.member_count === competition.max_team_members
                        : team.member_count >= 2;

                      return (
                        <option key={team.id} value={team.id}>
                          {team.name} ({team.member_count}/{team.max_members})
                          {!meetsRequirement ? ' ⚠️' : ''}
                        </option>
                      );
                    })}
                  </select>
                  {competition.require_full_team && competition.max_team_members && (
                    <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                      ⚠️ Requires exactly {competition.max_team_members} members
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Message Display */}
          {message && (
            <div
              className={`p-3 sm:p-4 rounded-lg text-xs sm:text-sm ${message.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
                }`}
            >
              <p className="font-medium">{message.text}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-700">
            {isRegistered ? (
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                {!showWithdrawConfirm ? (
                  <button
                    onClick={() => setShowWithdrawConfirm(true)}
                    disabled={isLoading || isScheduledLive}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isScheduledLive ? "Cannot withdraw during competition" : "Withdraw from competition"}
                  >
                    Withdraw
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setShowWithdrawConfirm(false)}
                      disabled={isLoading}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleWithdraw}
                      disabled={isLoading}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isLoading ? "..." : "Confirm Withdraw"}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={handleRegister}
                disabled={isLoading || (competition.participation_type === "team" && userTeams.length === 0)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 text-sm font-semibold text-white bg-[#25346A] hover:bg-[#2A64d1] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Registering..." : "Register Now"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
