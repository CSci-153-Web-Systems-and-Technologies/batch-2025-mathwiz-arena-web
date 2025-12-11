import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import LoginButton from "@/components/LoginLogoutButton";
import DeleteCompetitionButton from "./components/DeleteCompetitionButton";

export default async function AdminCompetitionPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Verify admin role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect("/error?message=Access denied");
    }

    // Fetch ALL competitions (without profiles join to avoid issues)
    const { data: competitions, error } = await supabase
        .from("competitions")
        .select(`
      id,
      name,
      description,
      start_datetime,
      duration_minutes,
      participation_type,
      max_participants,
      max_teams,
      status,
      created_at,
      organizer_id,
      competition_problems (count)
    `)
        .order("created_at", { ascending: false });

    // Log error for debugging
    if (error) {
        console.error("Error fetching competitions:", error);
    }

    // Fetch organizer usernames for non-own competitions
    const otherOrganizerIds = Array.from(new Set(
        (competitions || [])
            .filter(c => c.organizer_id !== user.id)
            .map(c => c.organizer_id)
    ));

    let organizerProfiles: Record<string, string> = {};
    if (otherOrganizerIds.length > 0) {
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, username")
            .in("id", otherOrganizerIds);

        if (profiles) {
            organizerProfiles = profiles.reduce((acc, p) => {
                acc[p.id] = p.username;
                return acc;
            }, {} as Record<string, string>);
        }
    }

    // Separate own competitions vs organizer competitions
    const myCompetitions = competitions?.filter(c => c.organizer_id === user.id) || [];
    const organizerCompetitions = (competitions?.filter(c => c.organizer_id !== user.id) || []).map(c => ({
        ...c,
        organizerName: organizerProfiles[c.organizer_id] || 'Unknown'
    }));

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
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                        </Link>

                        <Link
                            href="/admin/problem-bank"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Problem Bank
                        </Link>

                        <Link
                            href="/admin/competition"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white bg-purple-600 rounded-lg"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                            Competitions
                        </Link>

                        {/* Future features - grayed out */}
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
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Competitions</h1>
                        <p className="text-slate-600">Manage your competitions and view competitions from organizers</p>
                    </div>

                    {error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                            <p className="font-medium">Error loading competitions:</p>
                            <p className="text-sm mt-1">{error.message}</p>
                            <p className="text-xs mt-2 text-red-500">Code: {error.code}</p>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {/* My Competitions Section */}
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-slate-800">My Competitions</h2>
                                    <Link
                                        href="/admin/competition/create"
                                        className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-white font-medium hover:bg-purple-700 transition-colors text-sm shadow-sm"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Create Competition
                                    </Link>
                                </div>

                                {myCompetitions.length > 0 ? (
                                    <div className="grid gap-6">
                                        {myCompetitions.map((competition) => {
                                            const statusColors = {
                                                draft: "bg-slate-100 text-slate-700",
                                                published: "bg-blue-100 text-blue-700",
                                                ongoing: "bg-green-100 text-green-700",
                                                completed: "bg-gray-100 text-gray-700",
                                            };

                                            const statusColor = statusColors[competition.status as keyof typeof statusColors] || statusColors.draft;
                                            const problemCount = competition.competition_problems?.[0]?.count || 0;
                                            const startDate = new Date(competition.start_datetime);
                                            const formattedDate = startDate.toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            });

                                            return (
                                                <div
                                                    key={competition.id}
                                                    className="bg-white rounded-xl border-2 border-purple-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h3 className="text-xl font-semibold text-slate-800">
                                                                    {competition.name}
                                                                </h3>
                                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                                                                    {competition.status.charAt(0).toUpperCase() + competition.status.slice(1)}
                                                                </span>
                                                            </div>
                                                            <p className="text-slate-600 text-sm mb-3">
                                                                {competition.description}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <span>{formattedDate}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span>{competition.duration_minutes} mins</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                            </svg>
                                                            <span className="capitalize">{competition.participation_type}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            <span>{problemCount} problems</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 pt-4 border-t border-purple-100">
                                                        <Link
                                                            href={`/admin/competition/${competition.id}`}
                                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            View Details
                                                        </Link>
                                                        {(competition.status === "draft" || competition.status === "published") && (
                                                            <Link
                                                                href={`/admin/competition/create?edit=${competition.id}`}
                                                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                                Edit
                                                            </Link>
                                                        )}
                                                        <DeleteCompetitionButton
                                                            competitionId={competition.id}
                                                            competitionName={competition.name}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl border-2 border-dashed border-purple-200 p-12 text-center">
                                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-slate-800 mb-2">No Competitions Yet</h3>
                                        <p className="text-slate-600 mb-6">Create your first competition to get started</p>
                                        <Link
                                            href="/admin/competition/create"
                                            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-white font-medium hover:bg-purple-700 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Create Competition
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Organizer Competitions Section */}
                            <div>
                                <div className="flex items-baseline gap-3 mb-6">
                                    <h2 className="text-2xl font-bold text-slate-800">Organizer Competitions</h2>
                                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Read-Only</span>
                                </div>

                                {organizerCompetitions.length > 0 ? (
                                    <div className="grid gap-6">
                                        {organizerCompetitions.map((competition) => {
                                            const organizerName = competition.organizerName;

                                            const statusColors = {
                                                draft: "bg-slate-100 text-slate-700",
                                                published: "bg-blue-100 text-blue-700",
                                                ongoing: "bg-green-100 text-green-700",
                                                completed: "bg-gray-100 text-gray-700",
                                            };

                                            const statusColor = statusColors[competition.status as keyof typeof statusColors] || statusColors.draft;
                                            const problemCount = competition.competition_problems?.[0]?.count || 0;
                                            const startDate = new Date(competition.start_datetime);
                                            const formattedDate = startDate.toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            });

                                            return (
                                                <div
                                                    key={competition.id}
                                                    className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h3 className="text-xl font-semibold text-slate-800">
                                                                    {competition.name}
                                                                </h3>
                                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                                                                    {competition.status.charAt(0).toUpperCase() + competition.status.slice(1)}
                                                                </span>
                                                            </div>
                                                            <p className="text-slate-600 text-sm mb-3">
                                                                {competition.description}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <span>{formattedDate}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span>{competition.duration_minutes} mins</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                            </svg>
                                                            <span className="capitalize">{competition.participation_type}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            <span>{problemCount} problems</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                                        <div className="text-sm text-slate-500">
                                                            By: <span className="text-slate-700 font-medium">{organizerName}</span>
                                                        </div>
                                                        <Link
                                                            href={`/admin/competition/${competition.id}`}
                                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            View
                                                        </Link>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-slate-800 mb-2">No Organizer Competitions</h3>
                                        <p className="text-slate-600">No organizers have created competitions yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
