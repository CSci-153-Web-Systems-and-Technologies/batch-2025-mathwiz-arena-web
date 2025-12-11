"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function startCompetitionAttempt(competitionId: string) {
    console.log("[startCompetitionAttempt] Starting for competition:", competitionId);
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.log("[startCompetitionAttempt] Auth error:", authError);
        return {
            success: false,
            error: "You must be logged in to start a competition"
        };
    }
    console.log("[startCompetitionAttempt] User:", user.id);

    // Check if user is registered for this competition
    const { data: registration, error: regError } = await supabase
        .from("competition_registrations")
        .select("id, status")
        .eq("competition_id", competitionId)
        .eq("mathlete_id", user.id)
        .eq("status", "registered")
        .maybeSingle();

    if (regError || !registration) {
        return {
            success: false,
            error: "You are not registered for this competition"
        };
    }

    // Get competition details
    const { data: competition, error: compError } = await supabase
        .from("competitions")
        .select("id, name, competition_mode, max_attempts, is_active, status, duration_minutes, start_datetime")
        .eq("id", competitionId)
        .single();

    if (compError || !competition) {
        return {
            success: false,
            error: "Competition not found"
        };
    }

    // Check if competition is published
    if (competition.status !== "published") {
        return {
            success: false,
            error: "This competition is not yet available"
        };
    }

    const isLiveCompetition = competition.competition_mode === 'live';

    // For Live competitions, check if active
    if (isLiveCompetition && competition.is_active === false) {
        return {
            success: false,
            error: "This Live competition is currently paused"
        };
    }

    // For scheduled competitions, check if it's within the time window
    if (!isLiveCompetition && competition.start_datetime) {
        const now = new Date();
        const startTime = new Date(competition.start_datetime);
        const endTime = new Date(startTime.getTime() + competition.duration_minutes * 60 * 1000);

        if (now < startTime) {
            return {
                success: false,
                error: "This competition has not started yet"
            };
        }

        if (now >= endTime) {
            return {
                success: false,
                error: "This competition has ended"
            };
        }
    }

    // Check for existing active attempt
    const { data: activeAttempt, error: activeError } = await supabase
        .from("competition_attempts")
        .select("id, started_at")
        .eq("competition_id", competitionId)
        .eq("mathlete_id", user.id)
        .eq("is_completed", false)
        .maybeSingle();

    if (activeAttempt) {
        // Return existing attempt
        console.log("[startCompetitionAttempt] Found existing active attempt:", activeAttempt.id);
        return {
            success: true,
            attemptId: activeAttempt.id,
            message: "Resuming existing attempt"
        };
    }
    console.log("[startCompetitionAttempt] No active attempt found, will create new one");

    // Check attempt limits
    const { count: attemptCount, error: countError } = await supabase
        .from("competition_attempts")
        .select("*", { count: "exact", head: true })
        .eq("competition_id", competitionId)
        .eq("mathlete_id", user.id);

    if (countError) {
        return {
            success: false,
            error: "Failed to check attempt count"
        };
    }

    // For scheduled competitions, only 1 attempt allowed
    if (!isLiveCompetition && (attemptCount || 0) > 0) {
        return {
            success: false,
            error: "You have already attempted this competition"
        };
    }

    // For Live competitions with set attempts, check limit
    if (isLiveCompetition && competition.max_attempts !== null) {
        if ((attemptCount || 0) >= competition.max_attempts) {
            return {
                success: false,
                error: `You have used all ${competition.max_attempts} attempts for this competition`
            };
        }
    }

    // Create new attempt
    const attemptNumber = (attemptCount || 0) + 1;

    const { data: newAttempt, error: insertError } = await supabase
        .from("competition_attempts")
        .insert({
            competition_id: competitionId,
            mathlete_id: user.id,
            attempt_number: attemptNumber,
            started_at: new Date().toISOString()
        })
        .select("id")
        .single();

    if (insertError) {
        console.error("Failed to create attempt:", insertError);
        return {
            success: false,
            error: "Failed to start the competition. Please try again."
        };
    }

    return {
        success: true,
        attemptId: newAttempt.id,
        message: `Starting attempt ${attemptNumber}`
    };
}

export async function submitAnswer(
    attemptId: string,
    competitionProblemId: string,
    answer: string
) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return {
            success: false,
            error: "You must be logged in"
        };
    }

    // Verify attempt belongs to user and is active
    const { data: attempt, error: attemptError } = await supabase
        .from("competition_attempts")
        .select("id, competition_id, is_completed, started_at")
        .eq("id", attemptId)
        .eq("mathlete_id", user.id)
        .single();

    if (attemptError || !attempt) {
        return {
            success: false,
            error: "Attempt not found"
        };
    }

    if (attempt.is_completed) {
        return {
            success: false,
            error: "This attempt has already been completed"
        };
    }

    // Get competition duration to check if time is up
    const { data: competition, error: compError } = await supabase
        .from("competitions")
        .select("duration_minutes")
        .eq("id", attempt.competition_id)
        .single();

    if (compError || !competition) {
        return {
            success: false,
            error: "Competition not found"
        };
    }

    // Check if attempt time has expired
    const attemptStart = new Date(attempt.started_at);
    const attemptEnd = new Date(attemptStart.getTime() + competition.duration_minutes * 60 * 1000);
    const now = new Date();

    if (now >= attemptEnd) {
        // Auto-complete the attempt
        await supabase
            .from("competition_attempts")
            .update({
                is_completed: true,
                ended_at: attemptEnd.toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq("id", attemptId);

        return {
            success: false,
            error: "Time has expired for this attempt"
        };
    }

    // Get the problem details including correct answer
    const { data: competitionProblem, error: cpError } = await supabase
        .from("competition_problems")
        .select(`
      id,
      points,
      problems (
        id,
        correct_answer,
        type
      )
    `)
        .eq("id", competitionProblemId)
        .eq("competition_id", attempt.competition_id)
        .single();

    if (cpError || !competitionProblem) {
        return {
            success: false,
            error: "Problem not found"
        };
    }

    const problem = competitionProblem.problems as any;

    // Check if answer is correct (case-insensitive for identification)
    let isCorrect = false;
    if (problem.type === "identification") {
        isCorrect = answer.trim().toLowerCase() === problem.correct_answer.trim().toLowerCase();
    } else {
        isCorrect = answer === problem.correct_answer;
    }

    const pointsEarned = isCorrect ? competitionProblem.points : 0;

    // Upsert the answer
    const { error: answerError } = await supabase
        .from("competition_answers")
        .upsert({
            attempt_id: attemptId,
            competition_problem_id: competitionProblemId,
            answer: answer,
            is_correct: isCorrect,
            points_earned: pointsEarned,
            answered_at: new Date().toISOString()
        }, {
            onConflict: "attempt_id,competition_problem_id"
        });

    if (answerError) {
        console.error("Failed to save answer:", answerError);
        return {
            success: false,
            error: "Failed to save your answer. Please try again."
        };
    }

    return {
        success: true,
        isCorrect,
        pointsEarned
    };
}

export async function completeAttempt(attemptId: string) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return {
            success: false,
            error: "You must be logged in"
        };
    }

    // Verify attempt belongs to user
    const { data: attempt, error: attemptError } = await supabase
        .from("competition_attempts")
        .select("id, is_completed")
        .eq("id", attemptId)
        .eq("mathlete_id", user.id)
        .single();

    if (attemptError || !attempt) {
        return {
            success: false,
            error: "Attempt not found"
        };
    }

    if (attempt.is_completed) {
        return {
            success: false,
            error: "This attempt has already been completed"
        };
    }

    // Calculate total score
    const { data: answers, error: answersError } = await supabase
        .from("competition_answers")
        .select("points_earned")
        .eq("attempt_id", attemptId);

    const totalScore = answers?.reduce((sum, a) => sum + (a.points_earned || 0), 0) || 0;

    // Update attempt as completed
    const { error: updateError } = await supabase
        .from("competition_attempts")
        .update({
            is_completed: true,
            ended_at: new Date().toISOString(),
            total_score: totalScore,
            updated_at: new Date().toISOString()
        })
        .eq("id", attemptId);

    if (updateError) {
        console.error("Failed to complete attempt:", updateError);
        return {
            success: false,
            error: "Failed to complete the attempt. Please try again."
        };
    }

    revalidatePath("/mathlete");

    return {
        success: true,
        totalScore,
        message: "Attempt completed successfully!"
    };
}
