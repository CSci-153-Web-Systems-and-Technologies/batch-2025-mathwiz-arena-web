import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CompetitionsList from "./components/CompetitionsList";
import CompetitionCalendar from "./components/CompetitionCalendar";
import ErrorAlert from "./components/ErrorAlert";
import MathleteSidebar from "./components/MathleteSidebar";
import { ThemeScript } from "./(dashboard)/settings/components/ThemeProvider";

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
    <>
      {/* Theme Script for persistence */}
      <ThemeScript />

      <div className="min-h-screen bg-gradient-to-br from-[#2A64d1]/10 via-white to-[#25346A]/10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex transition-colors">
        {/* Error Alert */}
        <ErrorAlert />

        {/* Shared Sidebar Navigation */}
        <MathleteSidebar notificationCount={notificationCount || 0} />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#25346A] dark:text-white">Welcome back, {userName}!</h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">Ready to solve some problems today?</p>
            </div>

            {/* Main Grid */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
              {/* Join Competitions */}
              <div className="lg:col-span-2">
                <CompetitionsList
                  competitions={upcomingCompetitions}
                  registeredIds={Array.from(registrationMap.keys())}
                />
              </div>

              {/* Calendar and Recent Activity */}
              <div className="space-y-4 sm:space-y-6">
                {/* Competition Calendar */}
                <CompetitionCalendar competitions={upcomingCompetitions || []} />

                {/* Recent Activity */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 sm:p-4 shadow-sm">
                  <h2 className="text-base sm:text-lg font-bold text-[#25346A] dark:text-white mb-3 sm:mb-4 uppercase tracking-wide">Recent Activity</h2>
                  <div className="space-y-3 sm:space-y-4 max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-2">
                    {allActivities.length > 0 ? (
                      allActivities.slice(0, 5).map((activity, index) => (
                        <div key={index} className="flex gap-3">
                          <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${activity.type === 'withdrawal' ? 'bg-red-500' :
                            activity.type === 'team_create' || activity.type === 'team_join' || activity.type === 'team_invite' ? 'bg-purple-500' :
                              'bg-[#2A64d1]'
                            }`}></div>
                          <div>
                            {activity.type === 'registration' && activity.competitionName ? (
                              <p className="text-sm font-medium text-[#25346A] dark:text-slate-200">
                                Registered for <span className="font-semibold">{activity.competitionName}</span>
                              </p>
                            ) : activity.type === 'withdrawal' && activity.competitionName ? (
                              <p className="text-sm font-medium text-[#25346A] dark:text-slate-200">
                                Withdrew from <span className="font-semibold">{activity.competitionName}</span>
                              </p>
                            ) : activity.type === 'rating' && activity.competitionName ? (
                              <p className="text-sm font-medium text-[#25346A] dark:text-slate-200">
                                Rated <span className="font-semibold">{activity.competitionName}</span> ({activity.rating}/5 stars)
                              </p>
                            ) : activity.type === 'team_create' && activity.teamName ? (
                              <p className="text-sm font-medium text-[#25346A] dark:text-slate-200">
                                Created team <span className="font-semibold">{activity.teamName}</span>
                              </p>
                            ) : activity.type === 'team_join' && activity.teamName ? (
                              <p className="text-sm font-medium text-[#25346A] dark:text-slate-200">
                                Joined team <span className="font-semibold">{activity.teamName}</span>
                              </p>
                            ) : activity.type === 'team_invite' && activity.teamName ? (
                              <p className="text-sm font-medium text-[#25346A] dark:text-slate-200">
                                Invited {activity.inviteeName} to <span className="font-semibold">{activity.teamName}</span>
                              </p>
                            ) : null}
                            <p className="text-xs text-slate-500 dark:text-slate-400">{getTimeAgo(activity.timestamp)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Your activity will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
