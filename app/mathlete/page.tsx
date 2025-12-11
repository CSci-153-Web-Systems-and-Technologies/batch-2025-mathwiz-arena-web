import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import LoginButton from "@/components/LoginLogoutButton";
import JoinButton from "./components/JoinButton";
import CompetitionCalendar from "./components/CompetitionCalendar";

export default async function MathleteDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get username from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const userName = profile?.username || user.user_metadata?.full_name || "Mathlete";

  // Fetch upcoming and ongoing published competitions
  const now = new Date().toISOString();
  const { data: allPublishedCompetitions, error: competitionsError } = await supabase
    .from("competitions")
    .select(`
      id,
      name,
      description,
      start_datetime,
      duration_minutes,
      participation_type,
      max_participants,
      max_team_members,
      require_full_team,
      status,
      competition_mode,
      max_attempts,
      is_active
    `)
    .eq("status", "published")
    .order("start_datetime", { ascending: true, nullsFirst: false });

  // Log error if any (for debugging RLS issues)
  if (competitionsError) {
    console.error("Error fetching competitions:", competitionsError);
  }

  // Filter competitions that are available (Live + active, or Scheduled + not ended)
  const upcomingCompetitions = allPublishedCompetitions?.filter(competition => {
    const isLiveCompetition = (competition as any).competition_mode === "live";
    const isActive = (competition as any).is_active !== false; // default to true if undefined

    if (isLiveCompetition) {
      // Live competitions are shown if they are active
      return isActive;
    } else {
      // Scheduled competitions: show if not ended yet
      if (!competition.start_datetime) return false; // Skip if no start time (shouldn't happen for scheduled)
      const startTime = new Date(competition.start_datetime);
      const endTime = new Date(startTime.getTime() + competition.duration_minutes * 60 * 1000);
      const currentTime = new Date();
      return endTime > currentTime; // Show if competition hasn't ended
    }
  }) || [];

  // Get competition IDs to check registration status
  const competitionIds = upcomingCompetitions.map(comp => comp.id);

  // Check if mathlete is already registered for any of these competitions
  const { data: existingRegistrations } = await supabase
    .from("competition_registrations")
    .select("competition_id, status")
    .eq("mathlete_id", user.id)
    .eq("status", "registered")
    .in("competition_id", competitionIds);

  // Create a map of competition_id -> registration status for quick lookup
  const registrationMap = new Map(
    existingRegistrations?.map(reg => [reg.competition_id, reg.status]) || []
  );

  // Fetch recent activity for this mathlete (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoISO = sevenDaysAgo.toISOString();

  // Get recent registrations (both current and withdrawn)
  const { data: recentRegistrations } = await supabase
    .from("competition_registrations")
    .select(`
      id,
      registered_at,
      status,
      updated_at,
      competitions (
        id,
        name
      )
    `)
    .eq("mathlete_id", user.id)
    .or(`registered_at.gte.${sevenDaysAgoISO},updated_at.gte.${sevenDaysAgoISO}`)
    .order("registered_at", { ascending: false })
    .limit(20);

  // Get recent ratings given
  const { data: recentRatings } = await supabase
    .from("competition_ratings")
    .select(`
      id,
      created_at,
      rating,
      competitions (
        id,
        name
      )
    `)
    .eq("mathlete_id", user.id)
    .gte("created_at", sevenDaysAgoISO)
    .order("created_at", { ascending: false })
    .limit(5);

  // Get recent teams created
  const { data: recentTeamsCreated } = await supabase
    .from("teams")
    .select("id, name, created_at")
    .eq("team_leader_id", user.id)
    .gte("created_at", sevenDaysAgoISO)
    .order("created_at", { ascending: false });

  // Get recent teams joined
  const { data: recentTeamsJoined } = await supabase
    .from("team_members")
    .select(`
      id,
      created_at,
      role,
      teams (
        name
      )
    `)
    .eq("mathlete_id", user.id)
    .neq("role", "leader") // Exclude own teams
    .gte("created_at", sevenDaysAgoISO)
    .order("created_at", { ascending: false });

  // Get recent invitations sent
  const { data: recentInvitesSent } = await supabase
    .from("team_invitations")
    .select(`
      id,
      created_at,
      invitee_id,
      teams (
        name
      )
    `)
    .eq("inviter_id", user.id)
    .gte("created_at", sevenDaysAgoISO)
    .order("created_at", { ascending: false });

  // Fetch invitee profiles for usernames
  const inviteeIds = Array.from(new Set(recentInvitesSent?.map(i => i.invitee_id) || []));
  const { data: inviteeProfiles } = inviteeIds.length > 0 ? await supabase
    .from("profiles")
    .select("id, username")
    .in("id", inviteeIds) : { data: [] };

  const inviteeMap = new Map(inviteeProfiles?.map(p => [p.id, p.username]) || []);

  // Helper function to format time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return diffMins <= 1 ? "Just now" : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    } else {
      return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
    }
  };

  // Combine and sort all activities
  const allActivities: Array<{
    type: 'registration' | 'rating' | 'withdrawal' | 'team_create' | 'team_join' | 'team_invite';
    timestamp: string;
    competitionName?: string;
    teamName?: string;
    inviteeName?: string;
    rating?: number;
  }> = [];

  recentRegistrations?.forEach(reg => {
    const comp = reg.competitions as any;
    if (comp && comp.name) {
      const registeredTime = new Date(reg.registered_at);
      const sevenDaysAgoDate = new Date(sevenDaysAgoISO);

      // Add registration activity if it's within the last 7 days
      if (registeredTime >= sevenDaysAgoDate) {
        allActivities.push({
          type: 'registration',
          timestamp: reg.registered_at,
          competitionName: comp.name,
        });
      }

      // Add withdrawal activity if status is withdrawn and updated_at is within last 7 days
      if (reg.status === 'withdrawn' && reg.updated_at) {
        const updatedTime = new Date(reg.updated_at);
        if (updatedTime >= sevenDaysAgoDate) {
          allActivities.push({
            type: 'withdrawal',
            timestamp: reg.updated_at,
            competitionName: comp.name,
          });
        }
      }
    }
  });

  recentRatings?.forEach(rating => {
    const comp = rating.competitions as any;
    if (comp && comp.name) {
      allActivities.push({
        type: 'rating',
        timestamp: rating.created_at,
        competitionName: comp.name,
        rating: rating.rating,
      });
    }
  });

  recentTeamsCreated?.forEach(team => {
    allActivities.push({
      type: 'team_create',
      timestamp: team.created_at,
      teamName: team.name,
    });
  });

  recentTeamsJoined?.forEach(member => {
    const team = member.teams as any;
    if (team && team.name) {
      allActivities.push({
        type: 'team_join',
        timestamp: member.created_at,
        teamName: team.name,
      });
    }
  });

  recentInvitesSent?.forEach(invite => {
    const team = invite.teams as any;
    if (team && team.name) {
      allActivities.push({
        type: 'team_invite',
        timestamp: invite.created_at,
        teamName: team.name,
        inviteeName: inviteeMap.get(invite.invitee_id) || "someone",
      });
    }
  });

  // Sort by timestamp descending
  allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Fetch notification count (unread notifications)
  const { count: notificationCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "unread");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2A64d1]/10 via-white to-[#25346A]/10 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full overflow-y-auto">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 mb-8">
            <Image src="/icon.svg" alt="Mathwiz Logo" width={40} height={40} className="rounded-md" />
            <div>
              <h1 className="text-lg font-semibold text-[#25346A]">Mathwiz</h1>
              <p className="text-xs text-[#2A64d1]">Mathlete</p>
            </div>
          </Link>

          <nav className="space-y-1">
            <Link
              href="/mathlete"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white bg-[#25346A] rounded-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>

            <Link
              href="/mathlete/profile"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </Link>

            <Link
              href="/mathlete/teams"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Teams
            </Link>

            <Link
              href="/mathlete/notifications"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors relative"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="flex-1">Notifications</span>
              {notificationCount !== null && notificationCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Link>

            <Link
              href="/mathlete/settings"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>

            <Link
              href="/mathlete/history"
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
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#25346A]">Welcome back, {userName}!</h1>
            <p className="text-slate-600 mt-1">Ready to solve some problems today?</p>
          </div>

          {/* Main Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Join Competitions */}
            <div className="lg:col-span-2">
              <div>
                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search competitions..."
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2A64d1] focus:border-transparent"
                    />
                  </div>
                </div>

                <h2 className="text-lg font-bold text-[#25346A] mb-6 uppercase tracking-wide">Join Competitions</h2>
                <div className="space-y-4">
                  {upcomingCompetitions && upcomingCompetitions.length > 0 ? (
                    upcomingCompetitions.map((competition) => {
                      const isLiveCompetition = (competition as any).competition_mode === "live";
                      const maxAttempts = (competition as any).max_attempts;

                      // For scheduled competitions
                      const startTime = competition.start_datetime ? new Date(competition.start_datetime) : null;
                      const endTime = startTime ? new Date(startTime.getTime() + competition.duration_minutes * 60 * 1000) : null;
                      const now = new Date();

                      let timeText = "";
                      let statusBadge = null;
                      let isScheduledLive = false; // For scheduled competitions that are currently active
                      const isRegistered = registrationMap.has(competition.id);

                      if (isLiveCompetition) {
                        // Live competition - available anytime
                        timeText = "Available anytime";
                        statusBadge = (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Live
                          </span>
                        );
                      } else if (startTime && endTime) {
                        // Scheduled competition
                        const timeUntilStart = startTime.getTime() - now.getTime();
                        const timeUntilEnd = endTime.getTime() - now.getTime();
                        const hoursUntilStart = Math.floor(timeUntilStart / (1000 * 60 * 60));
                        const daysUntilStart = Math.floor(timeUntilStart / (1000 * 60 * 60 * 24));
                        const minutesUntilEnd = Math.floor(timeUntilEnd / (1000 * 60));
                        isScheduledLive = now >= startTime && now < endTime;

                        if (isScheduledLive) {
                          timeText = `Ends in ${minutesUntilEnd} minute${minutesUntilEnd !== 1 ? 's' : ''}`;
                          statusBadge = <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Live Now</span>;
                        } else if (daysUntilStart > 0) {
                          timeText = `Starts in ${daysUntilStart} day${daysUntilStart > 1 ? 's' : ''}`;
                        } else if (hoursUntilStart > 0) {
                          timeText = `Starts in ${hoursUntilStart} hour${hoursUntilStart > 1 ? 's' : ''}`;
                        } else {
                          timeText = startTime.toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          });
                        }
                      }

                      return (
                        <div key={competition.id} className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                          {/* Header with status badge */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-[#25346A]">{competition.name}</h3>
                                {statusBadge}
                                {isRegistered && !isScheduledLive && (
                                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Registered</span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-slate-600">
                                <span className="flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                  </svg>
                                  {competition.participation_type.charAt(0).toUpperCase() + competition.participation_type.slice(1)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {competition.duration_minutes} minutes{isLiveCompetition ? "/attempt" : ""}
                                </span>
                                {/* Show attempts for Live competitions */}
                                {isLiveCompetition && (
                                  <span className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    {maxAttempts === null ? "Unlimited attempts" : `${maxAttempts} attempt${maxAttempts !== 1 ? 's' : ''}`}
                                  </span>
                                )}
                                {competition.max_participants && (
                                  <span className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Max {competition.max_participants} participants
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          {competition.description && (
                            <p className="text-slate-600 mb-4 leading-relaxed">{competition.description}</p>
                          )}

                          {/* Footer with time and action */}
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="font-medium">{timeText}</span>
                            </div>
                            <JoinButton
                              competition={competition}
                              isRegistered={isRegistered}
                              isScheduledLive={isScheduledLive}
                              isLiveCompetition={isLiveCompetition}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-500">No upcoming competitions at the moment</p>
                      <p className="text-sm text-slate-400 mt-2">Check back later for new challenges!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Calendar and Recent Activity */}
            <div className="space-y-6">
              {/* Competition Calendar */}
              <CompetitionCalendar competitions={upcomingCompetitions || []} />

              {/* Recent Activity */}
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <h2 className="text-lg font-bold text-[#25346A] mb-4 uppercase tracking-wide">Recent Activity</h2>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {allActivities.length > 0 ? (
                    allActivities.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex gap-3">
                        <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${activity.type === 'withdrawal' ? 'bg-red-500' :
                          activity.type === 'team_create' || activity.type === 'team_join' || activity.type === 'team_invite' ? 'bg-purple-500' :
                            'bg-[#2A64d1]'
                          }`}></div>
                        <div>
                          {activity.type === 'registration' && activity.competitionName ? (
                            <p className="text-sm font-medium text-[#25346A]">
                              Registered for <span className="font-semibold">{activity.competitionName}</span>
                            </p>
                          ) : activity.type === 'withdrawal' && activity.competitionName ? (
                            <p className="text-sm font-medium text-[#25346A]">
                              Withdrew from <span className="font-semibold">{activity.competitionName}</span>
                            </p>
                          ) : activity.type === 'rating' && activity.competitionName ? (
                            <p className="text-sm font-medium text-[#25346A]">
                              Rated <span className="font-semibold">{activity.competitionName}</span> ({activity.rating}/5 stars)
                            </p>
                          ) : activity.type === 'team_create' && activity.teamName ? (
                            <p className="text-sm font-medium text-[#25346A]">
                              Created team <span className="font-semibold">{activity.teamName}</span>
                            </p>
                          ) : activity.type === 'team_join' && activity.teamName ? (
                            <p className="text-sm font-medium text-[#25346A]">
                              Joined team <span className="font-semibold">{activity.teamName}</span>
                            </p>
                          ) : activity.type === 'team_invite' && activity.teamName ? (
                            <p className="text-sm font-medium text-[#25346A]">
                              Invited {activity.inviteeName} to <span className="font-semibold">{activity.teamName}</span>
                            </p>
                          ) : null}
                          <p className="text-xs text-slate-500">{getTimeAgo(activity.timestamp)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-slate-500">No recent activity</p>
                      <p className="text-xs text-slate-400 mt-1">Your activity will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
