import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ProblemBankActions from "./components/ProblemBankActions";
import { MathRenderer } from "@/components/ui/MathInput";

export default async function AdminProblemBankDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // User is guaranteed to be authenticated by the layout
    const userId = user!.id;

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
    const isOwnBank = problemBank.created_by === userId;

    const organizer = problemBank.profiles as any;
    const organizerName = organizer?.username || 'Unknown';

    return (
        <div className="p-8">
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
        </div>
    );
}
