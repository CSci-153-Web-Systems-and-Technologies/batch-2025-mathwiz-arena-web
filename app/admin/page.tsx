import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import LoginButton from "@/components/LoginLogoutButton";

export default async function AdminDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get username and verify admin role from profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("username, role")
        .eq("id", user.id)
        .single();

    // Only admins can access this page
    if (profile?.role !== 'admin') {
        redirect("/error?message=Access denied");
    }

    const userName = profile?.username || user.user_metadata?.full_name || "Admin";

    // Fetch system-wide statistics

    // Total users count
    const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

    // Total mathletes
    const { count: totalMathletes } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "mathlete");

    // Total organizers
    const { count: totalOrganizers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "organizer");

    // Total competitions (all organizers)
    const { count: totalCompetitions } = await supabase
        .from("competitions")
        .select("*", { count: "exact", head: true });

    // Total problems (all organizers)
    const { count: totalProblems } = await supabase
        .from("problems")
        .select("*", { count: "exact", head: true });

    // Total registrations (all competitions)
    const { count: totalRegistrations } = await supabase
        .from("competition_registrations")
        .select("*", { count: "exact", head: true })
        .eq("status", "registered");

    // Active (live) competitions
    const now = new Date().toISOString();
    const { data: activeCompetitions } = await supabase
        .from("competitions")
        .select("id, name, start_datetime, duration_minutes")
        .eq("status", "published")
        .lte("start_datetime", now);

    // Filter for truly active (not ended yet)
    const liveCompetitions = activeCompetitions?.filter(comp => {
        const endTime = new Date(new Date(comp.start_datetime).getTime() + comp.duration_minutes * 60000);
        return endTime > new Date();
    }) || [];

    // Recent activity (last 7 days, all users)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Recent registrations
    const { data: recentRegistrations } = await supabase
        .from("competition_registrations")
        .select(`
      registered_at,
      competitions (name),
      profiles (username)
    `)
        .eq("status", "registered")
        .gte("registered_at", sevenDaysAgo)
        .order("registered_at", { ascending: false })
        .limit(10);

    // Recent competitions created
    const { data: recentCompetitions } = await supabase
        .from("competitions")
        .select("id, name, created_at, status")
        .gte("created_at", sevenDaysAgo)
        .order("created_at", { ascending: false })
        .limit(10);

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

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white border-r border-slate-200 fixed h-full overflow-y-auto">
                <div className="p-6">
                    <Link href="/" className="flex items-center gap-3 mb-8">
                        <Image src="/icon.svg" alt="Mathwiz Logo" width={40} height={40} className="rounded-md" />
                        <div>
                            <h1 className="text-lg font-semibold text-slate-800">Mathwiz</h1>
                            <p className="text-xs text-purple-600 font-medium">Admin</p>
                        </div>
                    </Link>

                    <nav className="space-y-1">
                        <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white bg-purple-600 rounded-lg"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                        </Link>

                        {/* Future features - grayed out */}
                        <div className="opacity-50 cursor-not-allowed">
                            <div className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Problem Bank
                                <span className="ml-auto text-xs bg-slate-100 px-2 py-0.5 rounded">Soon</span>
                            </div>
                        </div>

                        <div className="opacity-50 cursor-not-allowed">
                            <div className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                                Competitions
                                <span className="ml-auto text-xs bg-slate-100 px-2 py-0.5 rounded">Soon</span>
                            </div>
                        </div>

                        <div className="opacity-50 cursor-not-allowed">
                            <div className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                User Management
                                <span className="ml-auto text-xs bg-slate-100 px-2 py-0.5 rounded">Soon</span>
                            </div>
                        </div>

                        <Link
                            href="/admin/settings"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
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
                        <p className="text-slate-600 mt-1">System overview and administration panel</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6 mb-8">
                        <div className="rounded-xl bg-white border-2 border-purple-600 p-6 shadow-sm">
                            <div className="flex flex-col">
                                <p className="text-sm text-slate-600">Total Users</p>
                                <p className="text-3xl font-bold text-purple-600 mt-1">{totalUsers || 0}</p>
                                <p className="text-xs text-slate-500 mt-2">{totalMathletes || 0} mathletes, {totalOrganizers || 0} organizers</p>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
                            <div className="flex flex-col">
                                <p className="text-sm text-slate-600">Competitions</p>
                                <p className="text-3xl font-bold text-slate-800 mt-1">{totalCompetitions || 0}</p>
                                <p className="text-xs text-slate-500 mt-2">System-wide</p>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
                            <div className="flex flex-col">
                                <p className="text-sm text-slate-600">Problems</p>
                                <p className="text-3xl font-bold text-slate-800 mt-1">{totalProblems || 0}</p>
                                <p className="text-xs text-slate-500 mt-2">In problem bank</p>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
                            <div className="flex flex-col">
                                <p className="text-sm text-slate-600">Registrations</p>
                                <p className="text-3xl font-bold text-slate-800 mt-1">{totalRegistrations || 0}</p>
                                <p className="text-xs text-slate-500 mt-2">Total participants</p>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
                            <div className="flex flex-col">
                                <p className="text-sm text-slate-600">Live Now</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">{liveCompetitions.length}</p>
                                <p className="text-xs text-slate-500 mt-2">Active competitions</p>
                            </div>
                        </div>

                        <div className="rounded-xl bg-purple-50 border border-purple-200 p-6 shadow-sm">
                            <div className="flex flex-col">
                                <p className="text-sm text-purple-700">System Health</p>
                                <p className="text-3xl font-bold text-purple-600 mt-1">✓</p>
                                <p className="text-xs text-purple-600 mt-2">All systems operational</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Grid */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Recent Activity */}
                        <div className="lg:col-span-2">
                            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Activity</h2>
                                <div className="space-y-4">
                                    {recentCompetitions && recentCompetitions.length > 0 ? (
                                        [...(recentCompetitions.map(comp => ({
                                            type: 'competition' as const,
                                            name: comp.name,
                                            timestamp: comp.created_at,
                                            status: comp.status
                                        }))),
                                        ...(recentRegistrations?.map(reg => ({
                                            type: 'registration' as const,
                                            name: (reg.competitions as any)?.name || 'Unknown',
                                            username: (reg.profiles as any)?.username || 'Unknown',
                                            timestamp: reg.registered_at
                                        })) || [])]
                                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                            .slice(0, 8)
                                            .map((activity, index) => (
                                                <div key={index} className="flex gap-3 items-start">
                                                    <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${activity.type === 'competition' ? 'bg-purple-500' : 'bg-blue-500'
                                                        }`}></div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-slate-800">
                                                            {activity.type === 'competition'
                                                                ? `New competition: ${activity.name}`
                                                                : `${activity.username} registered for ${activity.name}`
                                                            }
                                                        </p>
                                                        <p className="text-xs text-slate-500">{getTimeAgo(activity.timestamp)}</p>
                                                    </div>
                                                </div>
                                            ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-sm text-slate-500">No recent activity</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats & Info */}
                        <div className="space-y-6">
                            {liveCompetitions.length > 0 && (
                                <div className="rounded-xl border border-green-200 bg-green-50 p-6">
                                    <h3 className="font-semibold text-green-800 mb-3">🔴 Live Competitions</h3>
                                    <div className="space-y-2">
                                        {liveCompetitions.slice(0, 3).map(comp => (
                                            <div key={comp.id} className="text-sm text-green-700">
                                                • {comp.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-6">
                                <h3 className="font-semibold text-purple-700 mb-2">🎯 Quick Actions</h3>
                                <div className="space-y-2 text-sm text-purple-600">
                                    <p>• Problem Bank (Phase 2)</p>
                                    <p>• Competition Manager (Phase 3)</p>
                                    <p>• User Management (Phase 4)</p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
                                <h3 className="font-semibold text-blue-800 mb-2">ℹ️ System Info</h3>
                                <div className="space-y-1 text-sm text-blue-700">
                                    <p>Version: 1.0.0</p>
                                    <p>Role: Administrator</p>
                                    <p>Access: Full System</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
