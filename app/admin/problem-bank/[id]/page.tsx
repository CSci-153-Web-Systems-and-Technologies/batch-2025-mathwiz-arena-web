import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import LoginButton from "@/components/LoginLogoutButton";
import ProblemBankActions from "./components/ProblemBankActions";
import { MathRenderer } from "@/components/ui/MathInput";

export default async function AdminProblemBankDetailPage({ params }: { params: { id: string } }) {
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

    // Fetch problem bank (admins can view all)
    const { data: problemBank, error } = await supabase
        .from("problem_banks")
        .select(`
      *,
      profiles (
        username
      )
    `)
        .eq("id", params.id)
        .single();

    if (error || !problemBank) {
        console.error('Error fetching problem bank:', error);
        notFound();
    }

    // Fetch problems in this bank
    const { data: problems, error: problemsError } = await supabase
        .from("problems")
        .select("*")
        .eq("problem_bank_id", params.id)
        .order("order_index", { ascending: true });

    // Check if admin owns this problem bank
    const isOwnBank = problemBank.created_by === user.id;

    const organizer = problemBank.profiles as any;
    const organizerName = organizer?.username || 'Unknown';

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
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white bg-purple-600 rounded-lg"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Problem Bank
                        </Link>

                        <Link
                            href="/admin/competition"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                            Competitions
                        </Link>

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
                        <Link
                            href="/admin/problem-bank"
                            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-purple-600 mb-4 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Problem Banks
                        </Link>

                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-slate-800">{problemBank.title}</h1>
                                    {!isOwnBank && (
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full">
                                            Read-Only
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-600 mb-2">{problemBank.description || "No description"}</p>
                                <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                                    {!isOwnBank && (
                                        <>
                                            <span>By: <span className="text-purple-600 font-medium">{organizerName}</span></span>
                                            <span>•</span>
                                        </>
                                    )}
                                    <span>{new Date(problemBank.created_at).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>{problems?.length || 0} problem{problems?.length !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                            {isOwnBank && (
                                <ProblemBankActions problemBankId={params.id} />
                            )}
                        </div>
                    </div>

                    {/* Problems Section */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-800">Problems</h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    {isOwnBank ? 'Manage problems in your bank' : 'View problems in this bank (read-only access)'}
                                </p>
                            </div>
                            {isOwnBank && (
                                <Link
                                    href={`/admin/problem-bank/${params.id}/add-problem`}
                                    className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white font-medium hover:bg-purple-700 transition-colors text-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add Problem
                                </Link>
                            )}
                        </div>

                        {/* Problems List */}
                        {problems && problems.length > 0 ? (
                            <div className="divide-y divide-slate-200">
                                {problems.map((problem, index) => (
                                    <Link
                                        key={problem.id}
                                        href={`/admin/problem-bank/${params.id}/problem/${problem.id}`}
                                        className="p-6 hover:bg-slate-50 transition-colors block cursor-pointer"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <span className="text-purple-600 font-semibold text-sm">{index + 1}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-purple-600">
                                                    <MathRenderer text={problem.question || ""} />
                                                </h3>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    {problem.option_a && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-slate-500">A:</span>
                                                            <span className={problem.correct_answer === 'A' ? 'text-green-600 font-medium' : 'text-slate-600'}>
                                                                <MathRenderer text={problem.option_a || ""} />
                                                            </span>
                                                        </div>
                                                    )}
                                                    {problem.option_b && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-slate-500">B:</span>
                                                            <span className={problem.correct_answer === 'B' ? 'text-green-600 font-medium' : 'text-slate-600'}>
                                                                <MathRenderer text={problem.option_b || ""} />
                                                            </span>
                                                        </div>
                                                    )}
                                                    {problem.option_c && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-slate-500">C:</span>
                                                            <span className={problem.correct_answer === 'C' ? 'text-green-600 font-medium' : 'text-slate-600'}>
                                                                <MathRenderer text={problem.option_c || ""} />
                                                            </span>
                                                        </div>
                                                    )}
                                                    {problem.option_d && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-slate-500">D:</span>
                                                            <span className={problem.correct_answer === 'D' ? 'text-green-600 font-medium' : 'text-slate-600'}>
                                                                <MathRenderer text={problem.option_d || ""} />
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <span className="font-medium">Difficulty:</span> {problem.difficulty || 'Not set'}
                                                    </span>
                                                    {problem.topic && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1">
                                                                <span className="font-medium">Topic:</span> {problem.topic}
                                                            </span>
                                                        </>
                                                    )}
                                                    <span>•</span>
                                                    <span className="text-green-600 font-medium flex gap-1">
                                                        Answer: <MathRenderer text={problem.correct_answer || ""} />
                                                    </span>
                                                </div>
                                            </div>
                                            {/* View Details Arrow */}
                                            <div className="flex-shrink-0 text-slate-400 hover:text-purple-600 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-slate-500">
                                <p>No problems in this bank yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
