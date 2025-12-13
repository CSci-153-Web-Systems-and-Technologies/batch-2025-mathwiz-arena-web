"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteCompetition(competitionId: string) {
    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "You must be logged in to delete a competition" };
    }

    // Verify admin role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { success: false, error: "Only admins can perform this action" };
    }

    // Verify the competition belongs to the admin (organizer_id)
    const { data: competition, error: fetchError } = await supabase
        .from("competitions")
        .select("organizer_id")
        .eq("id", competitionId)
        .single();

    if (fetchError || !competition) {
        return { success: false, error: "Competition not found" };
    }

    if (competition.organizer_id !== user.id) {
        return { success: false, error: "You can only delete your own competitions" };
    }

    // Delete competition problems first (due to foreign key constraint)
    const { error: problemsError } = await supabase
        .from("competition_problems")
        .delete()
        .eq("competition_id", competitionId);

    if (problemsError) {
        return { success: false, error: "Failed to delete competition problems" };
    }

    // Delete the competition
    const { error: deleteError } = await supabase
        .from("competitions")
        .delete()
        .eq("id", competitionId);

    if (deleteError) {
        return { success: false, error: "Failed to delete competition" };
    }

    // Revalidate the page to reflect the changes
    revalidatePath("/admin/competition");

    return { success: true };
}

export async function toggleLiveCompetition(competitionId: string, isActive: boolean) {
    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "You must be logged in to perform this action" };
    }

    // Verify admin role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { success: false, error: "Only admins can perform this action" };
    }

    // Verify the competition exists and belongs to the admin
    const { data: competition, error: fetchError } = await supabase
        .from("competitions")
        .select("organizer_id, competition_mode, status")
        .eq("id", competitionId)
        .single();

    if (fetchError || !competition) {
        return { success: false, error: "Competition not found" };
    }

    if (competition.organizer_id !== user.id) {
        return { success: false, error: "You can only manage your own competitions" };
    }

    // Verify it's a live competition
    if (competition.competition_mode !== "live") {
        return { success: false, error: "This action only applies to Live competitions" };
    }

    // Verify competition is published
    if (competition.status !== "published") {
        return { success: false, error: "Only published competitions can be stopped/resumed" };
    }

    // Update the is_active status
    const { error: updateError } = await supabase
        .from("competitions")
        .update({ is_active: isActive })
        .eq("id", competitionId);

    if (updateError) {
        return { success: false, error: "Failed to update competition status" };
    }

    // Revalidate the page to reflect the changes
    revalidatePath("/admin/competition");
    revalidatePath("/mathlete");

    return { success: true, isActive };
}
