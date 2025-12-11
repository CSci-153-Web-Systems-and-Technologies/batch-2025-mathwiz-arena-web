"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#25346A] mb-2">{competition.name}</h2>
            <div className="flex items-center gap-2">
              {isLiveCompetition && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Live Competition
                </span>
              )}
              {isScheduledLive && !isLiveCompetition && (
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  In Progress
                </span>
              )}
              {isRegistered && !isScheduledLive && (
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  Registered
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Competition Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Description</h3>
              <p className="text-slate-600 leading-relaxed">
                {competition.description || "No description provided."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-1">
                  {isLiveCompetition ? 'Availability' : 'Start Time'}
                </h3>
                <p className="text-slate-600">
                  {isLiveCompetition ? (
                    'Available anytime'
                  ) : startTime ? (
                    startTime.toLocaleString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  ) : (
                    'Not scheduled'
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Duration</h3>
                <p className="text-slate-600">{competition.duration_minutes} minutes</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Participation Type</h3>
                <p className="text-slate-600 capitalize">{competition.participation_type}</p>
              </div>

              {competition.max_participants && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">Max Participants</h3>
                  <p className="text-slate-600">{competition.max_participants}</p>
                </div>
              )}
            </div>
          </div>

          {/* Team Selection for Team Competitions */}
          {competition.participation_type === "team" && !isRegistered && !(isScheduledLive && !isLiveCompetition) && (
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Select Your Team</h3>
                {competition.max_team_members && (
                  <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                    {competition.require_full_team
                      ? `Requires exactly ${competition.max_team_members} members`
                      : `Min 2, Max ${competition.max_team_members} members`
                    }
                  </span>
                )}
              </div>
              {loadingTeams ? (
                <div className="p-4 bg-slate-50 rounded-lg text-center text-slate-600">
                  Loading teams...
                </div>
              ) : userTeams.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    You are not a team leader. Only team leaders can register their teams for competitions.
                  </p>
                </div>
              ) : (
                <>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25346A] focus:border-transparent"
                  >
                    {userTeams.map((team) => {
                      const meetsRequirement = competition.require_full_team && competition.max_team_members
                        ? team.member_count === competition.max_team_members
                        : team.member_count >= 2;

                      return (
                        <option key={team.id} value={team.id}>
                          {team.name} ({team.member_count}/{team.max_members} members)
                          {!meetsRequirement ? ' - Does not meet requirements' : ''}
                        </option>
                      );
                    })}
                  </select>
                  {competition.require_full_team && competition.max_team_members && (
                    <p className="text-xs text-slate-600">
                      ⚠️ This competition requires teams to have exactly {competition.max_team_members} members.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Message Display */}
          {message && (
            <div
              className={`p-4 rounded-lg ${message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
                }`}
            >
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            {isRegistered ? (
              <div className="flex items-center gap-2">
                {/* Start Competition Button - Show for Live competitions OR Scheduled competitions during the time window */}
                {(isLiveCompetition || isScheduledLive) && (
                  <Link
                    href={`/mathlete/competition/${competition.id}`}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    {isScheduledLive && !isLiveCompetition ? "Enter Competition" : "Start Competition"}
                  </Link>
                )}
                {!showWithdrawConfirm ? (
                  <button
                    onClick={() => setShowWithdrawConfirm(true)}
                    disabled={isLoading || isScheduledLive}
                    className="px-6 py-2.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isScheduledLive ? "Cannot withdraw during competition" : "Withdraw from competition"}
                  >
                    Withdraw
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleWithdraw}
                      disabled={isLoading}
                      className="px-6 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isLoading ? "Withdrawing..." : "Confirm"}
                    </button>
                    <button
                      onClick={() => setShowWithdrawConfirm(false)}
                      disabled={isLoading}
                      className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={handleRegister}
                disabled={isLoading || (competition.participation_type === "team" && userTeams.length === 0)}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-[#25346A] hover:bg-[#2A64d1] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
