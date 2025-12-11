import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function AdminDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // User is guaranteed to be authenticated by the layout
    const userId = user!.id;

    // Get username from profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .single();

    const userName = profile?.username || user?.user_metadata?.full_name || "Admin";

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
        <div className="p-8">
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
        </div>
    );
}
