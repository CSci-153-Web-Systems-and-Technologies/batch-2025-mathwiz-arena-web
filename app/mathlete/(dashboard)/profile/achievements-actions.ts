"use server";

import { createClient } from "@/utils/supabase/server";

interface UserStats {
    competitionsCompleted: number;
    competitionsWon: number;
    perfectScores: number;
    totalScore: number;
    teamsJoined: number;
}

/**
 * Calculate user stats from their competition history
 */
async function calculateUserStats(userId: string): Promise<UserStats> {
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

/**
 * Check and award any achievements the user qualifies for but hasn't earned yet
 */
export async function checkAndAwardAchievements(userId: string): Promise<{
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
 * Call this after a competition is completed to check for new achievements
 */
export async function onCompetitionCompleted(userId: string): Promise<{
    newAchievements: string[];
    error?: string;
}> {
    return checkAndAwardAchievements(userId);
}

/**
 * Call this after joining a team to check for team-related achievements
 */
export async function onTeamJoined(userId: string): Promise<{
    newAchievements: string[];
    error?: string;
}> {
    return checkAndAwardAchievements(userId);
}

/**
 * Get user's current stats (for display purposes)
 */
export async function getUserStats(userId: string): Promise<UserStats | null> {
    try {
        return await calculateUserStats(userId);
    } catch (error) {
        console.error("Error getting user stats:", error);
        return null;
    }
}
