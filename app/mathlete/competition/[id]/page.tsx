import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import CompetitionEnvironment from "./components/CompetitionEnvironment";

interface PageProps {
    params: { id: string };
    searchParams: { attemptId?: string };
}

export default async function CompetitionPage({ params, searchParams }: PageProps) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch competition details
    const { data: competition, error: compError } = await supabase
        .from("competitions")
        .select(`
      id,
      name,
      description,
      duration_minutes,
      competition_mode,
      max_attempts,
      is_active,
      status,
      start_datetime,
      participation_type
    `)
        .eq("id", params.id)
        .single();

    if (compError || !competition) {
        notFound();
    }

    // Check if user is registered
    const { data: registration, error: regError } = await supabase
        .from("competition_registrations")
        .select("id, status")
        .eq("competition_id", params.id)
        .eq("mathlete_id", user.id)
        .eq("status", "registered")
        .maybeSingle();

    if (regError || !registration) {
        redirect("/mathlete?error=not_registered");
    }

    // Fetch competition problems with problem details
    const { data: competitionProblems, error: problemsError } = await supabase
        .from("competition_problems")
        .select(`
      id,
      points,
      order_index,
      problems (
        id,
        question,
        type,
        options,
        difficulty
      )
    `)
        .eq("competition_id", params.id)
        .order("order_index", { ascending: true });

    if (problemsError) {
        console.error("Failed to fetch problems:", problemsError);
    }

    // Get attempt if provided
    let attempt = null;
    if (searchParams.attemptId) {
        const { data: attemptData, error: attemptError } = await supabase
            .from("competition_attempts")
            .select(`
        id,
        attempt_number,
        started_at,
        ended_at,
        is_completed,
        total_score
      `)
            .eq("id", searchParams.attemptId)
            .eq("mathlete_id", user.id)
            .single();

        if (!attemptError && attemptData) {
            attempt = attemptData;
        }
    }

    // Get existing answers for this attempt
    let existingAnswers: Record<string, { answer: string; is_correct: boolean | null }> = {};
    if (attempt) {
        const { data: answers } = await supabase
            .from("competition_answers")
            .select("competition_problem_id, answer, is_correct")
            .eq("attempt_id", attempt.id);

        if (answers) {
            answers.forEach((a) => {
                existingAnswers[a.competition_problem_id] = {
                    answer: a.answer,
                    is_correct: a.is_correct
                };
            });
        }
    }

    // Get attempt count for this competition
    const { count: attemptCount } = await supabase
        .from("competition_attempts")
        .select("*", { count: "exact", head: true })
        .eq("competition_id", params.id)
        .eq("mathlete_id", user.id);

    return (
        <CompetitionEnvironment
            competition={competition}
            problems={competitionProblems || []}
            attempt={attempt}
            existingAnswers={existingAnswers}
            attemptCount={attemptCount || 0}
            userId={user.id}
        />
    );
}
