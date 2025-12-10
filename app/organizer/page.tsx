import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import LoginButton from "@/components/LoginLogoutButton";

export default async function OrganizerDashboard() {
  const supabase = createClient();
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

  const userName = profile?.username || user.user_metadata?.full_name || "Organizer";

  // Fetch total competitions count for this organizer
  const { count: totalContests } = await supabase
    .from("competitions")
    .select("*", { count: "exact", head: true })
    .eq("organizer_id", user.id);

  // Fetch published competitions count
  const { count: publishedCompetitions } = await supabase
    .from("competitions")
    .select("*", { count: "exact", head: true })
    .eq("organizer_id", user.id)
    .eq("status", "published");

  // Fetch total participants count across all competitions
  const { count: totalParticipants } = await supabase
    .from("competition_registrations")
    .select("*, competitions!inner(organizer_id)", { count: "exact", head: true })
    .eq("competitions.organizer_id", user.id)
    .eq("status", "registered");

  // Fetch average rating across all competitions
  const { data: ratingsData } = await supabase
    .from("competition_ratings")
    .select("rating, competitions!inner(organizer_id)")
    .eq("competitions.organizer_id", user.id);

  const averageRating = ratingsData && ratingsData.length > 0
    ? (ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length).toFixed(1)
    : "0.0";

  // Fetch recent activities
  // Get recent competitions (created in last 7 days)
  const { data: recentCompetitions } = await supabase
    .from("competitions")
    .select("id, name, created_at, status, start_datetime, duration_minutes")
    .eq("organizer_id", user.id)
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false })
    .limit(10);

  // Get recent registrations (last 7 days)
  const { data: recentRegistrations } = await supabase
    .from("competition_registrations")
    .select(`
      registered_at,
      competition_id,
      status,
      competitions (
        id,
        name
      )
    `)
    .eq("competitions.organizer_id", user.id)
    .eq("status", "registered")
    .gte("registered_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order("registered_at", { ascending: false })
    .limit(10);

  // Get recent ratings (last 7 days)
  const { data: recentRatings } = await supabase
    .from("competition_ratings")
    .select(`
      created_at,
      rating,
      competition_id,
      competitions (
        id,
        name
      )
    `)
    .eq("competitions.organizer_id", user.id)
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false })
    .limit(10);

  // Combine and sort all activities
  const activities: Array<{
    type: "created" | "registration" | "rating" | "ended";
    timestamp: string;
    competitionName: string;
    competitionId?: string;
    rating?: number;
  }> = [];

  // Add created competitions
  recentCompetitions?.forEach(comp => {
    activities.push({
      type: "created",
      timestamp: comp.created_at,
      competitionName: comp.name,
      competitionId: comp.id,
    });

    // Check if this competition ended recently
    const now = new Date();
    const endTime = new Date(new Date(comp.start_datetime).getTime() + comp.duration_minutes * 60000);
    const timeSinceEnd = now.getTime() - endTime.getTime();
    
    // If ended in last 7 days
    if (endTime < now && timeSinceEnd < 7 * 24 * 60 * 60 * 1000) {
      activities.push({
        type: "ended",
        timestamp: endTime.toISOString(),
        competitionName: comp.name,
        competitionId: comp.id,
      });
    }
  });

  // Add registrations
  recentRegistrations?.forEach(reg => {
    if (reg.competitions && typeof reg.competitions === 'object' && !Array.isArray(reg.competitions)) {
      const comp = reg.competitions as { id: string; name: string };
      activities.push({
        type: "registration",
        timestamp: reg.registered_at,
        competitionName: comp.name,
        competitionId: comp.id,
      });
    }
  });

  // Add ratings
  recentRatings?.forEach(rat => {
    if (rat.competitions && typeof rat.competitions === 'object' && !Array.isArray(rat.competitions)) {
      const comp = rat.competitions as { id: string; name: string };
      activities.push({
        type: "rating",
        timestamp: rat.created_at,
        competitionName: comp.name,
        competitionId: comp.id,
        rating: rat.rating,
      });
    }
  });

  // Sort by timestamp descending and take top 5
  const recentActivities = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  // Helper function to format time ago
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return time.toLocaleDateString();
  };

  // Fetch published competitions with details
  const { data: publishedCompetitionsList, error: competitionsError } = await supabase
    .from("competitions")
    .select(`
      id,
      name,
      start_datetime,
      duration_minutes,
      status
    `)
    .eq("organizer_id", user.id)
    .eq("status", "published")
    .order("start_datetime", { ascending: false })
    .limit(3);

  // Log any errors for debugging
  if (competitionsError) {
    console.error("Error fetching competitions:", competitionsError);
  }

  // Helper function to get competition status badge
  const getCompetitionStatus = (competition: any) => {
    const now = new Date();
    const startTime = new Date(competition.start_datetime);
    const endTime = new Date(startTime.getTime() + competition.duration_minutes * 60000);

    if (now >= startTime && now <= endTime) {
      return { label: "Live", color: "bg-green-100 text-green-700" };
    } else if (now < startTime) {
      return { label: "Upcoming", color: "bg-blue-100 text-blue-700" };
    } else {
      return { label: "Ended", color: "bg-slate-200 text-slate-600" };
    }
  };

  // Helper function to format time remaining or time until start
  const getTimeInfo = (competition: any) => {
    const now = new Date();
    const startTime = new Date(competition.start_datetime);
    const endTime = new Date(startTime.getTime() + competition.duration_minutes * 60000);

    if (now >= startTime && now <= endTime) {
      const timeLeft = endTime.getTime() - now.getTime();
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      return `Ends in ${hours}h ${minutes}m`;
    } else if (now < startTime) {
      const timeUntil = startTime.getTime() - now.getTime();
      const days = Math.floor(timeUntil / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeUntil % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        return `Starts in ${days} day${days > 1 ? 's' : ''}`;
      } else {
        return `Starts in ${hours}h`;
      }
    } else {
      const timeAgo = now.getTime() - endTime.getTime();
      const days = Math.floor(timeAgo / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeAgo % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        return `Ended ${days} day${days > 1 ? 's' : ''} ago`;
      } else {
        return `Ended ${hours}h ago`;
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full overflow-y-auto">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 mb-8">
            <Image src="/icon.svg" alt="Mathwiz Logo" width={40} height={40} className="rounded-md" />
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Mathwiz</h1>
              <p className="text-xs text-slate-500">Organizer</p>
            </div>
          </Link>

          <nav className="space-y-1">
            <Link
              href="/organizer"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white bg-[#f49700] rounded-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>

            <Link
              href="/organizer/problem-bank"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Problem Bank
            </Link>

            <Link
              href="/organizer/competition"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Competition
            </Link>

            <Link
              href="/organizer/profile"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </Link>

            <Link
              href="/organizer/settings"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>

            <Link
              href="/organizer/history"
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
            <h1 className="text-3xl font-bold text-slate-800">Welcome back, {userName}!</h1>
            <p className="text-slate-600 mt-1">Here's what's happening with your competitions today.</p>
          </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <div className="rounded-xl bg-white border-2 border-[#f49700] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Competitions</p>
                <p className="text-3xl font-bold text-[#f49700] mt-1">{totalContests || 0}</p>
              </div>
              <div className="rounded-full bg-[#f49700]/10 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#f49700]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Published Competitions</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{publishedCompetitions || 0}</p>
              </div>
              <div className="rounded-full bg-slate-100 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Participants</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{totalParticipants || 0}</p>
              </div>
              <div className="rounded-full bg-slate-100 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg. Rating</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{averageRating}</p>
              </div>
              <div className="rounded-full bg-slate-100 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Published Competitions */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">Published Competitions</h2>
                <Link href="/organizer/competition" className="text-sm text-[#f49700] hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                {publishedCompetitionsList && publishedCompetitionsList.length > 0 ? (
                  publishedCompetitionsList.map((competition) => {
                    const status = getCompetitionStatus(competition);
                    const timeInfo = getTimeInfo(competition);
                    
                    return (
                      <div key={competition.id} className="rounded-lg border-l-4 border-[#f49700] bg-slate-50 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-800">{competition.name}</h3>
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
                                {status.label}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{timeInfo}</p>
                            <div className="mt-2 flex gap-2">
                              <Link
                                href={`/organizer/competition/${competition.id}`}
                                className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
                              >
                                View Details
                              </Link>
                              <Link
                                href={`/organizer/competition/create?edit=${competition.id}`}
                                className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
                              >
                                Edit
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500 mb-4">No published competitions yet</p>
                    <Link
                      href="/organizer/competition/create"
                      className="inline-block rounded-md bg-[#f49700] px-4 py-2 text-sm text-white hover:bg-[#d68400]"
                    >
                      Create Your First Competition
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => {
                    const activityConfig = {
                      created: {
                        label: "Competition created",
                        color: "bg-slate-300",
                        textColor: "text-slate-700"
                      },
                      registration: {
                        label: "New registration",
                        color: "bg-[#f49700]",
                        textColor: "text-slate-800"
                      },
                      rating: {
                        label: `Received ${activity.rating}-star rating`,
                        color: "bg-[#f49700]",
                        textColor: "text-slate-800"
                      },
                      ended: {
                        label: "Competition ended",
                        color: "bg-[#f49700]",
                        textColor: "text-slate-800"
                      }
                    };

                    const config = activityConfig[activity.type];

                    return (
                      <div key={`${activity.type}-${activity.timestamp}-${index}`} className="flex gap-3">
                        <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${config.color}`}></div>
                        <div>
                          <p className={`text-sm font-medium ${config.textColor}`}>{config.label}</p>
                          <p className="text-xs text-slate-500">
                            {activity.competitionName} • {getTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-slate-500">No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border-2 border-[#f49700] bg-[#f49700]/5 p-6">
              <h3 className="font-semibold text-[#f49700] mb-2">💡 Pro Tip</h3>
              <p className="text-sm text-slate-700">
                Competitions with clear descriptions and sample problems get 40% more participants!
              </p>
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
