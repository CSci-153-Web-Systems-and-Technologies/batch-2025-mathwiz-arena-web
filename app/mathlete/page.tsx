import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import LoginButton from "@/components/LoginLogoutButton";

export default async function MathleteDashboard() {
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
      status
    `)
    .eq("status", "published")
    .order("start_datetime", { ascending: true });

  // Log error if any (for debugging RLS issues)
  if (competitionsError) {
    console.error("Error fetching competitions:", competitionsError);
  }

  // Filter competitions that haven't ended yet (upcoming or ongoing)
  const upcomingCompetitions = allPublishedCompetitions?.filter(competition => {
    const startTime = new Date(competition.start_datetime);
    const endTime = new Date(startTime.getTime() + competition.duration_minutes * 60 * 1000);
    const currentTime = new Date();
    return endTime > currentTime; // Show if competition hasn't ended
  }) || [];

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

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="rounded-xl bg-gradient-to-br from-[#25346A] to-[#2A64d1] p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Competition Rank</p>
                <p className="text-3xl font-bold mt-1">#127</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>

          <div className="rounded-xl border-2 border-[#2A64d1] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Problems Solved</p>
                <p className="text-3xl font-bold text-[#25346A] mt-1">234</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#2A64d1] opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>

          <div className="rounded-xl border-2 border-[#2A64d1] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Streak</p>
                <p className="text-3xl font-bold text-[#25346A] mt-1">12 days</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#2A64d1] opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Join Competitions */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#25346A] mb-4">Join Competitions</h2>
              <div className="space-y-4">
                {upcomingCompetitions && upcomingCompetitions.length > 0 ? (
                  upcomingCompetitions.map((competition) => {
                    const startTime = new Date(competition.start_datetime);
                    const endTime = new Date(startTime.getTime() + competition.duration_minutes * 60 * 1000);
                    const now = new Date();
                    const timeUntilStart = startTime.getTime() - now.getTime();
                    const timeUntilEnd = endTime.getTime() - now.getTime();
                    const hoursUntilStart = Math.floor(timeUntilStart / (1000 * 60 * 60));
                    const daysUntilStart = Math.floor(timeUntilStart / (1000 * 60 * 60 * 24));
                    const minutesUntilEnd = Math.floor(timeUntilEnd / (1000 * 60));

                    let timeText = "";
                    let statusBadge = null;
                    const isLive = now >= startTime && now < endTime;
                    const canRegister = !isLive; // Can only register if competition hasn't started
                    
                    if (isLive) {
                      // Competition is currently live
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

                    return (
                      <div key={competition.id} className="rounded-lg border-l-4 border-[#2A64d1] bg-[#2A64d1]/5 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-[#25346A]">{competition.name}</h3>
                              {statusBadge}
                            </div>
                            <p className="text-sm text-slate-600 mt-1">
                              {competition.participation_type.charAt(0).toUpperCase() + competition.participation_type.slice(1)} • {competition.duration_minutes} minutes
                            </p>
                            {competition.description && (
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{competition.description}</p>
                            )}
                            <p className="text-xs text-slate-500 mt-2">{timeText}</p>
                          </div>
                          {canRegister ? (
                            <button className="rounded-md bg-[#25346A] px-4 py-2 text-sm text-white hover:bg-[#2A64d1]">
                              Register
                            </button>
                          ) : (
                            <button disabled className="rounded-md bg-slate-300 px-4 py-2 text-sm text-slate-500 cursor-not-allowed">
                              In Progress
                            </button>
                          )}
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

          {/* Recent Activity */}
          <div>
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#25346A] mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-[#2A64d1]"></div>
                  <div>
                    <p className="text-sm font-medium text-[#25346A]">Completed 5 problems</p>
                    <p className="text-xs text-slate-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-[#2A64d1]"></div>
                  <div>
                    <p className="text-sm font-medium text-[#25346A]">Placed #23 in Weekly Challenge</p>
                    <p className="text-xs text-slate-500">Yesterday</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-slate-300"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Earned "Problem Solver" badge</p>
                    <p className="text-xs text-slate-500">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
