"use client";

import Link from "next/link";
import { MathRenderer } from "@/components/ui/MathInput";

type Problem = {
  id: string;
  question: string;
  type: string;
  difficulty: string;
  correct_answer: string;
  options: string[] | null;
  order_index: number;
};

export default function ProblemsList({
  problems,
  problemBankId
}: {
  problems: Problem[];
  problemBankId: string;
}) {
  if (problems.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">No Problems Yet</h3>
        <p className="text-slate-600 mb-6">Add your first problem to this bank</p>
        <Link
          href={`/admin/problem-bank/${problemBankId}/add-problem`}
          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white font-medium hover:bg-purple-700 transition-colors text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Problem
        </Link>
      </div>
    );
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "multiple_choice": return "Multiple Choice";
      case "true_false": return "True/False";
      case "identification": return "Identification";
      default: return type;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-700 border-green-200";
      case "average": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "difficult": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="divide-y divide-slate-200">
      {problems.map((problem, index) => (
        <Link
          key={problem.id}
          href={`/admin/problem-bank/${problemBankId}/problem/${problem.id}`}
          className="block p-6 hover:bg-slate-50 transition-colors group"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-medium text-slate-600 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-medium px-2 py-1 rounded border capitalize ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {getTypeLabel(problem.type)}
                </span>
              </div>
              <p className="text-slate-800 font-medium mb-1 group-hover:text-purple-600 transition-colors line-clamp-2">
                <MathRenderer text={problem.question} />
              </p>
              {problem.type === "multiple_choice" && problem.options && (
                <p className="text-sm text-slate-500">
                  {problem.options.length} options
                </p>
              )}
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-purple-600 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  );
}
