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

    // Helper function to normalize an answer for comparison
    const normalizeAnswer = (ans: string): string => {
        let normalized = ans.trim().toLowerCase();
        // Remove $ symbols used for LaTeX
        normalized = normalized.replace(/\$/g, '');
        // Normalize whitespace around = sign
        normalized = normalized.replace(/\s*=\s*/g, '=');
        return normalized;
    };

    // Helper function to check if two values are numerically equivalent
    const areNumericallyEqual = (a: string, b: string): boolean => {
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        if (!isNaN(numA) && !isNaN(numB)) {
            return Math.abs(numA - numB) < 0.0001; // Allow small floating point differences
        }
        return false;
    };

    // Check if answer is correct
    let isCorrect = false;
    if (problem.type === "identification") {
        // Split correct answers by pipe delimiter
        const acceptableAnswers = problem.correct_answer.split('|').map((a: string) => a.trim());
        const userAnswer = normalizeAnswer(answer);

        // Check against each acceptable answer
        for (const acceptable of acceptableAnswers) {
            const normalizedAcceptable = normalizeAnswer(acceptable);

            // Exact match (case-insensitive)
            if (userAnswer === normalizedAcceptable) {
                isCorrect = true;
                break;
            }

            // Numeric equivalence check (e.g., 17 = 17.0 = 17.00)
            if (areNumericallyEqual(userAnswer, normalizedAcceptable)) {
                isCorrect = true;
                break;
            }

            // Also check if the answer contains the value after = sign
            // e.g., user enters "17" and acceptable is "x=17"
            if (normalizedAcceptable.includes('=')) {
                const valueAfterEquals = normalizedAcceptable.split('=').pop()?.trim() || '';
                if (userAnswer === valueAfterEquals || areNumericallyEqual(userAnswer, valueAfterEquals)) {
                    isCorrect = true;
                    break;
                }
            }

            // Reverse: user enters "x=17" and acceptable is "17"
            if (userAnswer.includes('=')) {
                const userValueAfterEquals = userAnswer.split('=').pop()?.trim() || '';
                if (userValueAfterEquals === normalizedAcceptable || areNumericallyEqual(userValueAfterEquals, normalizedAcceptable)) {
                    isCorrect = true;
                    break;
                }
            }
        }
    } else {
        // For multiple choice and true/false, exact match
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
    return {
        success: true,
        isCorrect,
        pointsEarned
    };
}

export async function submitBatchAnswers(
    attemptId: string,
    answers: Record<string, string>
) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return {
            success: false,
            error: "You must be logged in"
        };
    }

    // Verify attempt matches user and is active
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

    // Get competition details for validation
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

    // Check expiration
    const attemptStart = new Date(attempt.started_at);
    const attemptEnd = new Date(attemptStart.getTime() + competition.duration_minutes * 60 * 1000);
    const now = new Date();

    if (now >= attemptEnd) {
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

    // Fetch all relevant problems
    const problemIds = Object.keys(answers);
    const { data: competitionProblems, error: cpError } = await supabase
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
        .in("id", problemIds)
        .eq("competition_id", attempt.competition_id);

    if (cpError || !competitionProblems) {
        return {
            success: false,
            error: "Failed to fetch problems"
        };
    }

    // Reuse helper functions logic
    const normalizeAnswer = (ans: string): string => {
        let normalized = ans.trim().toLowerCase();
        normalized = normalized.replace(/\$/g, '');
        normalized = normalized.replace(/\s*=\s*/g, '=');
        return normalized;
    };

    const areNumericallyEqual = (a: string, b: string): boolean => {
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        if (!isNaN(numA) && !isNaN(numB)) {
            return Math.abs(numA - numB) < 0.0001;
        }
        return false;
    };

    const answersToUpsert = [];

    // Process each answer
    for (const compProblem of competitionProblems) {
        const userAnswer = answers[compProblem.id];
        if (!userAnswer) continue;

        const problem = compProblem.problems as any;
        let isCorrect = false;

        if (problem.type === "identification") {
            const acceptableAnswers = problem.correct_answer.split('|').map((a: string) => a.trim());
            const normalizedUser = normalizeAnswer(userAnswer);

            for (const acceptable of acceptableAnswers) {
                const normalizedAcceptable = normalizeAnswer(acceptable);

                if (normalizedUser === normalizedAcceptable) {
                    isCorrect = true;
                    break;
                }
                if (areNumericallyEqual(normalizedUser, normalizedAcceptable)) {
                    isCorrect = true;
                    break;
                }
                if (normalizedAcceptable.includes('=')) {
                    const valueAfterEquals = normalizedAcceptable.split('=').pop()?.trim() || '';
                    if (normalizedUser === valueAfterEquals || areNumericallyEqual(normalizedUser, valueAfterEquals)) {
                        isCorrect = true;
                        break;
                    }
                }
                if (normalizedUser.includes('=')) {
                    const userValueAfterEquals = normalizedUser.split('=').pop()?.trim() || '';
                    if (userValueAfterEquals === normalizedAcceptable || areNumericallyEqual(userValueAfterEquals, normalizedAcceptable)) {
                        isCorrect = true;
                        break;
                    }
                }
            }
        } else {
            isCorrect = userAnswer === problem.correct_answer;
        }

        const pointsEarned = isCorrect ? compProblem.points : 0;

        answersToUpsert.push({
            attempt_id: attemptId,
            competition_problem_id: compProblem.id,
            answer: userAnswer,
            is_correct: isCorrect,
            points_earned: pointsEarned,
            answered_at: new Date().toISOString()
        });
    }

    // Batch upsert
    if (answersToUpsert.length > 0) {
        const { error: upsertError } = await supabase
            .from("competition_answers")
            .upsert(answersToUpsert, {
                onConflict: "attempt_id,competition_problem_id"
            });

        if (upsertError) {
            console.error("Batch save failed:", upsertError);
            return {
                success: false,
                error: "Failed to save answers"
            };
        }
    }

    return {
        success: true,
        count: answersToUpsert.length
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

    // Check and award achievements after completion
    const { newAchievements } = await checkAndAwardAchievements(user.id);

    revalidatePath("/mathlete");
    revalidatePath("/mathlete/profile");

    return {
        success: true,
        totalScore,
        newAchievements,
        message: newAchievements.length > 0
            ? `Competition completed! You earned: ${newAchievements.join(", ")}`
            : "Attempt completed successfully!"
    };
}

/**
 * Check and award any achievements the user qualifies for but hasn't earned yet
 */
async function checkAndAwardAchievements(userId: string): Promise<{
    newAchievements: string[];
    error?: string;
}> {
    const supabase = await createClient();

    try {
        // Get user stats
        const stats = await calculateUserStats(userId);

        // Get all active achievements
        const { data: allAchievements, error: achievementsError } = await supabase
            .from("achievements")
            .select("*")
            .eq("is_active", true);

        if (achievementsError) {
            return { newAchievements: [], error: achievementsError.message };
        }

        // Get user's already earned achievements
        const { data: earnedAchievements, error: earnedError } = await supabase
            .from("user_achievements")
            .select("achievement_id")
            .eq("user_id", userId);

        if (earnedError) {
            return { newAchievements: [], error: earnedError.message };
        }

        const earnedIds = new Set(earnedAchievements?.map(a => a.achievement_id) || []);

        // Check each achievement to see if user qualifies
        const newAchievements: string[] = [];

        for (const achievement of allAchievements || []) {
            // Skip if already earned
            if (earnedIds.has(achievement.id)) continue;

            let qualifies = false;

            switch (achievement.requirement_type) {
                case "competitions_completed":
                    qualifies = stats.competitionsCompleted >= achievement.requirement_value;
                    break;
                case "competitions_won":
                    qualifies = stats.competitionsWon >= achievement.requirement_value;
                    break;
                case "perfect_scores":
                    qualifies = stats.perfectScores >= achievement.requirement_value;
                    break;
                case "total_score":
                    qualifies = stats.totalScore >= achievement.requirement_value;
                    break;
                case "teams_joined":
                    qualifies = stats.teamsJoined >= achievement.requirement_value;
                    break;
            }

            if (qualifies) {
                // Award the achievement
                const { error: insertError } = await supabase
                    .from("user_achievements")
                    .insert({
                        user_id: userId,
                        achievement_id: achievement.id,
                        metadata: {
                            stats_at_time: stats,
                        },
                    });

                if (!insertError) {
                    newAchievements.push(achievement.name);

                    // Create notification for new achievement
                    await supabase
                        .from("notifications")
                        .insert({
                            user_id: userId,
                            type: "achievement",
                            title: "🏆 New Achievement Unlocked!",
                            message: `You earned the "${achievement.name}" badge: ${achievement.description}`,
                            metadata: {
                                achievement_id: achievement.id,
                                achievement_name: achievement.name,
                                achievement_icon: achievement.icon,
                            },
                        });
                }
            }
        }

        return { newAchievements };
    } catch (error) {
        console.error("Error checking achievements:", error);
        return { newAchievements: [], error: "Failed to check achievements" };
    }
}

/**
 * Calculate user stats from their competition history
 */
async function calculateUserStats(userId: string): Promise<{
    competitionsCompleted: number;
    competitionsWon: number;
    perfectScores: number;
    totalScore: number;
    teamsJoined: number;
}> {
    const supabase = await createClient();

    // Fetch all completed competition attempts with competition details
    const { data: attempts } = await supabase
        .from("competition_attempts")
        .select(`
            id, 
            total_score, 
            is_completed,
            competition_id,
            competitions (
                id,
                name,
                competition_problems (
                    points
                )
            )
        `)
        .eq("mathlete_id", userId)
        .eq("is_completed", true);

    const competitionsCompleted = attempts?.length || 0;
    const totalScore = attempts?.reduce((sum, a) => sum + (a.total_score || 0), 0) || 0;

    // Calculate wins and perfect scores
    let competitionsWon = 0;
    let perfectScores = 0;

    if (attempts && attempts.length > 0) {
        for (const attempt of attempts) {
            // Get all attempts for this competition to determine rank
            const { data: allCompetitionAttempts } = await supabase
                .from("competition_attempts")
                .select("mathlete_id, total_score")
                .eq("competition_id", attempt.competition_id)
                .eq("is_completed", true)
                .order("total_score", { ascending: false });

            if (allCompetitionAttempts) {
                // Find user's rank in this competition
                const userRank = allCompetitionAttempts.findIndex(a => a.mathlete_id === userId) + 1;
                if (userRank === 1) competitionsWon++;
            }

            // Check for perfect score
            const competition = attempt.competitions as any;
            if (competition?.competition_problems) {
                const maxPoints = competition.competition_problems.reduce(
                    (sum: number, p: any) => sum + (p.points || 0), 0
                );
                if (maxPoints > 0 && attempt.total_score === maxPoints) {
                    perfectScores++;
                }
            }
        }
    }

    // Count teams joined
    const { count: teamsJoined } = await supabase
        .from("team_members")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

    return {
        competitionsCompleted,
        competitionsWon,
        perfectScores,
        totalScore,
        teamsJoined: teamsJoined || 0,
    };
}

