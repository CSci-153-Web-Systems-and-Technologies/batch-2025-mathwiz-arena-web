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

  // Check if already registered with status 'registered'
  const { data: existingRegistration, error: regCheckError } = await supabase
    .from("competition_registrations")
    .select("id, status")
    .eq("competition_id", competitionId)
    .eq("mathlete_id", user.id)
    .maybeSingle();

  // Log for debugging
  console.log("Registration check:", { existingRegistration, regCheckError });

  // If already registered with status 'registered', return error
  if (existingRegistration && existingRegistration.status === "registered") {
    return {
      success: false,
      error: "You are already registered for this competition"
    };
  }

  // Check if competition is full (if max_participants is set) - only count 'registered' status
  if (competition.max_participants) {
    const { count, error: countError } = await supabase
      .from("competition_registrations")
      .select("id", { count: "exact", head: true })
      .eq("competition_id", competitionId)
      .eq("status", "registered");

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

  // If there's an existing withdrawn registration, update it to 'registered'
  if (existingRegistration && existingRegistration.status === "withdrawn") {
    const currentTime = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("competition_registrations")
      .update({ 
        status: "registered",
        registered_at: currentTime,  // Update registered_at to current time for new registration
        updated_at: currentTime       // Also update updated_at
      })
      .eq("id", existingRegistration.id);

    if (updateError) {
      console.error("Re-registration error:", updateError);
      return {
        success: false,
        error: "Failed to register for the competition. Please try again."
      };
    }
  } else {
    // Register the mathlete with a new record
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
  }

  // Revalidate the page to show updated registration status
  revalidatePath("/mathlete");

  return {
    success: true,
    message: "Successfully registered for the competition!"
  };
}

export async function unregisterFromCompetition(competitionId: string) {
  const supabase = createClient();
  
  // Get the current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return {
      success: false,
      error: "You must be logged in to unregister from a competition"
    };
  }

  // Check if the competition exists
  const { data: competition, error: competitionError } = await supabase
    .from("competitions")
    .select("id, start_datetime")
    .eq("id", competitionId)
    .single();

  if (competitionError || !competition) {
    return {
      success: false,
      error: "Competition not found"
    };
  }

  // Check if competition has already started
  const now = new Date();
  const startTime = new Date(competition.start_datetime);
  
  if (now >= startTime) {
    return {
      success: false,
      error: "Cannot withdraw from a competition that has already started"
    };
  }

  // Check if registered with status 'registered'
  const { data: existingRegistration } = await supabase
    .from("competition_registrations")
    .select("id, status")
    .eq("competition_id", competitionId)
    .eq("mathlete_id", user.id)
    .eq("status", "registered")
    .single();

  if (!existingRegistration) {
    return {
      success: false,
      error: "You are not registered for this competition"
    };
  }

  // Update status to 'withdrawn' instead of deleting
  const { error: updateError } = await supabase
    .from("competition_registrations")
    .update({ 
      status: "withdrawn",
      updated_at: new Date().toISOString()
    })
    .eq("id", existingRegistration.id);

  console.log("Withdrawal update:", { id: existingRegistration.id, updateError });

  if (updateError) {
    console.error("Unregister error:", updateError);
    return {
      success: false,
      error: "Failed to unregister from the competition. Please try again."
    };
  }

  // Revalidate the page to show updated registration status
  revalidatePath("/mathlete");

  return {
    success: true,
    message: "Successfully unregistered from the competition!"
  };
}
