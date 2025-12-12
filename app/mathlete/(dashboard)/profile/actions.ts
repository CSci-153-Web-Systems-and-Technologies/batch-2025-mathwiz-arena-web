"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfilePicture(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const file = formData.get("file") as File;
    if (!file) {
        return { error: "No file provided" };
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
        return { error: "File must be an image" };
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        return { error: "File size must be less than 2MB" };
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/avatar.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
            cacheControl: "3600",
            upsert: true,
        });

    if (uploadError) {
        console.error("Upload error:", uploadError);
        return { error: "Failed to upload image" };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

    // Update profile with avatar URL
    const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", user.id);

    if (updateError) {
        console.error("Update error:", updateError);
        return { error: "Failed to update profile" };
    }

    revalidatePath("/mathlete/profile");
    return { success: true, url: urlData.publicUrl };
}

export async function removeProfilePicture() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    // Try to delete the avatar file from storage (might fail if it doesn't exist)
    try {
        const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        for (const ext of extensions) {
            await supabase.storage
                .from("avatars")
                .remove([`${user.id}/avatar.${ext}`]);
        }
    } catch (e) {
        // Ignore errors - file might not exist
    }

    // Update profile to remove avatar URL
    const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);

    if (updateError) {
        console.error("Update error:", updateError);
        return { error: "Failed to remove profile picture" };
    }

    revalidatePath("/mathlete/profile");
    return { success: true };
}

export async function updateCoverPhoto(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const file = formData.get("file") as File;
    if (!file) {
        return { error: "No file provided" };
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
        return { error: "File must be an image" };
    }

    // Validate file size (max 5MB for cover photos)
    if (file.size > 5 * 1024 * 1024) {
        return { error: "File size must be less than 5MB" };
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/cover.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from("covers")
        .upload(fileName, file, {
            cacheControl: "3600",
            upsert: true,
        });

    if (uploadError) {
        console.error("Upload error:", uploadError);
        return { error: "Failed to upload image" };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from("covers")
        .getPublicUrl(fileName);

    // Update profile with cover URL
    const { error: updateError } = await supabase
        .from("profiles")
        .update({ cover_photo_url: urlData.publicUrl })
        .eq("id", user.id);

    if (updateError) {
        console.error("Update error:", updateError);
        return { error: "Failed to update profile" };
    }

    revalidatePath("/mathlete/profile");
    return { success: true, url: urlData.publicUrl };
}

export async function removeCoverPhoto() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    // Try to delete the cover file from storage
    try {
        const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        for (const ext of extensions) {
            await supabase.storage
                .from("covers")
                .remove([`${user.id}/cover.${ext}`]);
        }
    } catch (e) {
        // Ignore errors - file might not exist
    }

    // Update profile to remove cover URL
    const { error: updateError } = await supabase
        .from("profiles")
        .update({ cover_photo_url: null })
        .eq("id", user.id);

    if (updateError) {
        console.error("Update error:", updateError);
        return { error: "Failed to remove cover photo" };
    }

    revalidatePath("/mathlete/profile");
    return { success: true };
}

export async function updateProfileInfo(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const bio = formData.get("bio") as string;
    const full_name = formData.get("full_name") as string;

    const updateData: { bio?: string; full_name?: string } = {};

    if (bio !== undefined) {
        updateData.bio = bio.substring(0, 500); // Limit to 500 chars
    }

    if (full_name) {
        updateData.full_name = full_name;
    }

    const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

    if (error) {
        console.error("Update error:", error);
        return { error: "Failed to update profile" };
    }

    revalidatePath("/mathlete/profile");
    return { success: true };
}

/**
 * Sync achievements - retroactively awards achievements based on current user stats
 * This is needed for users who completed competitions before the achievement system was implemented
 */
export async function syncAchievements(): Promise<{
    success: boolean;
    newAchievements: string[];
    error?: string;
}> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, newAchievements: [], error: "Not authenticated" };
    }

    try {
        // Calculate user stats
        const stats = await calculateUserStats(user.id, supabase);

        // Get all active achievements
        const { data: allAchievements, error: achievementsError } = await supabase
            .from("achievements")
            .select("*")
            .eq("is_active", true);

        if (achievementsError) {
            console.error("Error fetching achievements:", achievementsError);
            return { success: false, newAchievements: [], error: "Failed to fetch achievements" };
        }

        // Get user's already earned achievements
        const { data: earnedAchievements, error: earnedError } = await supabase
            .from("user_achievements")
            .select("achievement_id")
            .eq("user_id", user.id);

        if (earnedError) {
            console.error("Error fetching earned achievements:", earnedError);
            return { success: false, newAchievements: [], error: "Failed to fetch earned achievements" };
        }

        const earnedIds = new Set(earnedAchievements?.map(a => a.achievement_id) || []);
        const newAchievements: string[] = [];

        // Check each achievement
        for (const achievement of allAchievements || []) {
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
                const { error: insertError } = await supabase
                    .from("user_achievements")
                    .insert({
                        user_id: user.id,
                        achievement_id: achievement.id,
                        metadata: { synced: true, stats_at_time: stats },
                    });

                if (!insertError) {
                    newAchievements.push(achievement.name);
                } else {
                    console.error("Error inserting achievement:", insertError);
                }
            }
        }

        revalidatePath("/mathlete/profile");
        return { success: true, newAchievements };
    } catch (error) {
        console.error("Error syncing achievements:", error);
        return { success: false, newAchievements: [], error: "Failed to sync achievements" };
    }
}

/**
 * Calculate user stats helper function
 */
async function calculateUserStats(userId: string, supabase: any) {
    // Fetch all completed competition attempts
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
    const totalScore = attempts?.reduce((sum: number, a: any) => sum + (a.total_score || 0), 0) || 0;

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
                const userRank = allCompetitionAttempts.findIndex((a: any) => a.mathlete_id === userId) + 1;
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
        .eq("mathlete_id", userId);

    return {
        competitionsCompleted,
        competitionsWon,
        perfectScores,
        totalScore,
        teamsJoined: teamsJoined || 0,
    };
}

