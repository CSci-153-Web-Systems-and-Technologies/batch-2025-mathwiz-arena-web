import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import EditProblemBankForm from "./components/EditProblemBankForm";

export default async function EditProblemBankPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // User is guaranteed to be authenticated by the layout
    const userId = user!.id;

    // Fetch problem bank (only if owned by admin)
    const { data: problemBank, error } = await supabase
        .from("problem_banks")
        .select("*")
        .eq("id", params.id)
        .eq("organizer_id", userId)
        .single();

    if (error || !problemBank) {
        notFound();
    }

    return (
        <div className="p-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link href={`/admin/problem-bank/${params.id}`} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-purple-600 mb-4 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Problem Bank
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Edit Problem Bank</h1>
                    <p className="text-slate-600">Update problem bank details or delete it</p>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
                    <EditProblemBankForm problemBank={problemBank} />
                </div>
            </div>
        </div>
    );
}
