import Link from "next/link";
import CreateProblemBankForm from "./components/CreateProblemBankForm";

export default function CreateProblemBankPage() {
    return (
        <div className="p-8">
            <div className="max-w-3xl mx-auto">
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
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Create Problem Bank</h1>
                    <p className="text-slate-600">Add a new problem bank to organize your questions</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
                    <CreateProblemBankForm />
                </div>
            </div>
        </div>
    );
}
