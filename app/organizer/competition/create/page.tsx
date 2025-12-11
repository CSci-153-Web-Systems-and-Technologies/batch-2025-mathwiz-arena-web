import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import CreateCompetitionForm from "./components/CreateCompetitionForm";

export default async function CreateCompetitionPage({
  searchParams,
}: {
  searchParams: { edit?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // User is guaranteed to be authenticated by the layout
  const userId = user!.id;

  // Fetch competition data if editing
  let competitionData: any = null;
  let competitionProblems: any = null;

  if (searchParams.edit) {
    const { data: competition } = await supabase
      .from("competitions")
      .select("*")
      .eq("id", searchParams.edit)
      .eq("organizer_id", userId)
      .single();

    if (competition) {
      competitionData = competition;

      // Fetch competition problems
      const { data: problems } = await supabase
        .from("competition_problems")
        .select(`
          points,
          order_index,
          problems (
            id,
            question,
            type,
            difficulty,
            correct_answer,
            options,
            problem_bank_id
          )
        `)
        .eq("competition_id", searchParams.edit)
        .order("order_index", { ascending: true });

      competitionProblems = problems;
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/organizer/competition"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#f49700] transition-colors mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Competitions
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">
            {searchParams.edit ? "Edit Competition" : "Create Competition"}
          </h1>
          <p className="text-slate-600 mt-1">
            {searchParams.edit
              ? "Update your competition details"
              : "Set up basic information for your competition"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <CreateCompetitionForm
            competitionData={competitionData}
            competitionProblems={competitionProblems}
          />
        </div>
      </div>
    </div>
  );
}
