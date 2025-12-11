import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function AdminProblemBankPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // User is guaranteed to be authenticated by the layout
    const userId = user!.id;

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
    const myBanks = problemBanks?.filter(bank => bank.created_by === userId) || [];
    const organizerBanks = problemBanks?.filter(bank => bank.created_by !== userId) || [];

    return (
        <div className="p-8">
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
        </div>
    );
}
