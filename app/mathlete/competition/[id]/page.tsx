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

    // For scheduled competitions, validate the time window
    const isLiveCompetition = competition.competition_mode === 'live';
    if (!isLiveCompetition && competition.start_datetime) {
        const now = new Date();
        const startTime = new Date(competition.start_datetime);
        const endTime = new Date(startTime.getTime() + competition.duration_minutes * 60 * 1000);

        if (now < startTime) {
            redirect("/mathlete?error=competition_not_started");
        }

        if (now >= endTime) {
            redirect("/mathlete?error=competition_ended");
        }
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
    } else {
        console.log(`Fetched ${competitionProblems?.length || 0} problems for competition ${params.id}`);
        // Debug: log first problem to see if joined data is present
        if (competitionProblems && competitionProblems.length > 0) {
            console.log("First competition problem structure:", JSON.stringify(competitionProblems[0], null, 2));
        }
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

        if (attemptError) {
            console.error("Error fetching attempt:", attemptError);
        } else if (attemptData) {
            console.log("Found attempt:", attemptData.id, "is_completed:", attemptData.is_completed);
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

    // Filter and sanitize problems
    // distinct from RLS issues, this ensures the UI receives valid data structure
    const validProblems = (competitionProblems || [])
        .filter((cp: any) => cp.problems) // Filter out items where joined problem is null
        .map((cp: any) => ({
            ...cp,
            problems: {
                ...cp.problems,
                // Handle options gracefully
                options: cp.problems.options
            }
        }));

    if ((competitionProblems || []).length > 0 && validProblems.length === 0) {
        console.error("CRITICAL: Problems fetched but details are null. RLS policy on 'problems' table is likely blocking access.");
    }

    console.log(`Valid problems count: ${validProblems.length}, passing to CompetitionEnvironment`);

    return (
        <CompetitionEnvironment
            competition={competition}
            problems={validProblems}
            attempt={attempt}
            existingAnswers={existingAnswers}
            attemptCount={attemptCount || 0}
            userId={user.id}
        />
    );
}
