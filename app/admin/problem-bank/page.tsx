import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import LoginButton from "@/components/LoginLogoutButton";

export default async function AdminProblemBankPage() {
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

    // Fetch ALL problem banks from ALL users
    const { data: problemBanks, error } = await supabase
        .from("problem_banks")
        .select(`
      *,
      profiles (
        username
      )
    `)
        .order("created_at", { ascending: false });

    // Separate own banks vs organizer banks
    const myBanks = problemBanks?.filter(bank => bank.created_by === user.id) || [];
    const organizerBanks = problemBanks?.filter(bank => bank.created_by !== user.id) || [];

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
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                        </Link>

                        <Link
                            href="/admin/problem-bank"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white bg-purple-600 rounded-lg"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Problem Bank
                        </Link>

                        {/* Future features */}
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
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Problem Banks</h1>
                        <p className="text-slate-600">Manage your problem banks and view banks from organizers</p>
                    </div>

                    {error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                            Error loading problem banks. Please try again.
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {/* My Problem Banks Section */}
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-slate-800">My Problem Banks</h2>
                                    <Link
                                        href="/admin/problem-bank/create"
                                        className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-white font-medium hover:bg-purple-700 transition-colors text-sm shadow-sm"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Create Problem Bank
                                    </Link>
                                </div>

                                {myBanks.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {myBanks.map((bank) => (
                                            <Link
                                                key={bank.id}
                                                href={`/admin/problem-bank/${bank.id}`}
                                                className="bg-white border-2 border-purple-200 rounded-lg p-6 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer group"
                                            >
                                                <div className="flex items-start gap-4 mb-4">
                                                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-700 transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-lg font-semibold text-slate-800 mb-1 truncate group-hover:text-purple-600 transition-colors">
                                                            {bank.title}
                                                        </h3>
                                                        <p className="text-sm text-slate-500 line-clamp-2">
                                                            {bank.description || "No description"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-purple-100">
                                                    <span>Created {new Date(bank.created_at).toLocaleDateString()}</span>
                                                    <span className="text-purple-600 font-medium">Manage →</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl border-2 border-dashed border-purple-200 p-12 text-center">
                                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-slate-800 mb-2">No Problem Banks Yet</h3>
                                        <p className="text-slate-600 mb-6">Create your first problem bank to get started</p>
                                        <Link
                                            href="/admin/problem-bank/create"
                                            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-white font-medium hover:bg-purple-700 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Create Problem Bank
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Organizer Problem Banks Section */}
                            <div>
                                <div className="flex items-baseline gap-3 mb-6">
                                    <h2 className="text-2xl font-bold text-slate-800">Organizer Problem Banks</h2>
                                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Read-Only</span>
                                </div>

                                {organizerBanks.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {organizerBanks.map((bank) => {
                                            const organizer = bank.profiles as any;
                                            const organizerName = organizer?.username || 'Unknown';

                                            return (
                                                <Link
                                                    key={bank.id}
                                                    href={`/admin/problem-bank/${bank.id}`}
                                                    className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer group"
                                                >
                                                    <div className="flex items-start gap-4 mb-4">
                                                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-slate-200 transition-colors">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-lg font-semibold text-slate-800 mb-1 truncate group-hover:text-slate-900 transition-colors">
                                                                {bank.title}
                                                            </h3>
                                                            <p className="text-sm text-slate-500 line-clamp-2">
                                                                {bank.description || "No description"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100">
                                                        <div className="flex flex-col gap-1">
                                                            <span>By: <span className="text-slate-700 font-medium">{organizerName}</span></span>
                                                            <span>Created {new Date(bank.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <span className="text-slate-600 font-medium">View →</span>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-slate-800 mb-2">No Organizer Problem Banks</h3>
                                        <p className="text-slate-600">No organizers have created problem banks yet</p>
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
