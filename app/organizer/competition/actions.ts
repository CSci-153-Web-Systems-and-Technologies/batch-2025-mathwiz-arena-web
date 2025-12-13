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

  // Verify the competition belongs to the user
  const { data: competition, error: fetchError } = await supabase
    .from("competitions")
    .select("organizer_id")
    .eq("id", competitionId)
    .single();

  if (fetchError || !competition) {
    return { success: false, error: "Competition not found" };
  }

  if (competition.organizer_id !== user.id) {
    return { success: false, error: "You don't have permission to delete this competition" };
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
  revalidatePath("/organizer/competition");

  return { success: true };
}
