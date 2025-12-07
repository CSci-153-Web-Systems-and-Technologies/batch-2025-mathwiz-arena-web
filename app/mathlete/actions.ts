"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function registerForCompetition(competitionId: string) {
  const supabase = createClient();
  
  // Get the current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return {
      success: false,
      error: "You must be logged in to register for a competition"
    };
  }

  // Check if the competition exists and is published
  const { data: competition, error: competitionError } = await supabase
    .from("competitions")
    .select("id, status, start_datetime, max_participants")
    .eq("id", competitionId)
    .single();

  if (competitionError || !competition) {
    return {
      success: false,
      error: "Competition not found"
    };
  }

  if (competition.status !== "published") {
    return {
      success: false,
      error: "This competition is not available for registration"
    };
  }

  // Check if competition has already started
  const now = new Date();
  const startTime = new Date(competition.start_datetime);
  
  if (now >= startTime) {
    return {
      success: false,
      error: "This competition has already started"
    };
  }

  // Check if already registered
  const { data: existingRegistration } = await supabase
    .from("competition_registrations")
    .select("id")
    .eq("competition_id", competitionId)
    .eq("mathlete_id", user.id)
    .single();

  if (existingRegistration) {
    return {
      success: false,
      error: "You are already registered for this competition"
    };
  }

  // Check if competition is full (if max_participants is set)
  if (competition.max_participants) {
    const { count, error: countError } = await supabase
      .from("competition_registrations")
      .select("id", { count: "exact", head: true })
      .eq("competition_id", competitionId);

    if (countError) {
      return {
        success: false,
        error: "Failed to check competition capacity"
      };
    }

    if (count && count >= competition.max_participants) {
      return {
        success: false,
        error: "This competition is full"
      };
    }
  }

  // Register the mathlete
  const { error: insertError } = await supabase
    .from("competition_registrations")
    .insert({
      competition_id: competitionId,
      mathlete_id: user.id,
      status: "registered"
    });

  if (insertError) {
    console.error("Registration error:", insertError);
    return {
      success: false,
      error: "Failed to register for the competition. Please try again."
    };
  }

  // Revalidate the page to show updated registration status
  revalidatePath("/mathlete");

  return {
    success: true,
    message: "Successfully registered for the competition!"
  };
}
