"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTeam(name: string, maxMembers: number) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  // Validate team name
  if (!name || name.trim().length < 3) {
    return { success: false, error: "Team name must be at least 3 characters long" };
  }

  if (name.trim().length > 50) {
    return { success: false, error: "Team name must be less than 50 characters" };
  }

  // Validate max members
  if (maxMembers < 2 || maxMembers > 10) {
    return { success: false, error: "Maximum members must be between 2 and 10" };
  }

  // Check if user already leads a team with this name
  const { data: existingTeam } = await supabase
    .from("teams")
    .select("id")
    .eq("team_leader_id", user.id)
    .eq("name", name.trim())
    .maybeSingle();

  if (existingTeam) {
    return { success: false, error: "You already have a team with this name" };
  }

  // Create the team
  const { data: newTeam, error: createError } = await supabase
    .from("teams")
    .insert({
      name: name.trim(),
      team_leader_id: user.id,
      max_members: maxMembers,
    })
    .select()
    .single();

  if (createError) {
    console.error("Error creating team:", createError);
    return { success: false, error: "Failed to create team. Please try again." };
  }

  // The trigger should automatically add the leader as a member
  // But let's verify it was added
  const { data: memberCheck } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", newTeam.id)
    .eq("mathlete_id", user.id)
    .maybeSingle();

  if (!memberCheck) {
    console.warn("Trigger did not add leader as member, adding manually");
    // Manually add if trigger failed
    const { error: memberError } = await supabase
      .from("team_members")
      .insert({
        team_id: newTeam.id,
        mathlete_id: user.id,
        role: "leader",
      });

    if (memberError) {
      console.error("Error adding leader as member:", memberError);
    }
  }

  revalidatePath("/mathlete/teams");
  return { success: true, teamId: newTeam.id };
}
