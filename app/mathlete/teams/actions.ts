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

export async function sendTeamInvitation(teamId: string, username: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  // Verify the team exists and user is the leader
  const { data: team } = await supabase
    .from("teams")
    .select("id, team_leader_id, max_members")
    .eq("id", teamId)
    .single();

  if (!team) {
    return { success: false, error: "Team not found" };
  }

  if (team.team_leader_id !== user.id) {
    return { success: false, error: "Only team leader can send invitations" };
  }

  // Find the invitee by username
  const { data: invitee } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username.trim())
    .maybeSingle();

  if (!invitee) {
    return { success: false, error: "User not found" };
  }

  // Check if trying to invite self
  if (invitee.id === user.id) {
    return { success: false, error: "You cannot invite yourself" };
  }

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("mathlete_id", invitee.id)
    .maybeSingle();

  if (existingMember) {
    return { success: false, error: "User is already a team member" };
  }

  // Check if there's already a pending invitation
  const { data: existingInvitation } = await supabase
    .from("team_invitations")
    .select("id, status")
    .eq("team_id", teamId)
    .eq("invitee_id", invitee.id)
    .eq("status", "pending")
    .maybeSingle();

  if (existingInvitation) {
    return { success: false, error: "Invitation already sent to this user" };
  }

  // Check if team is at capacity
  const { count: memberCount } = await supabase
    .from("team_members")
    .select("*", { count: "exact", head: true })
    .eq("team_id", teamId);

  if (memberCount !== null && memberCount >= team.max_members) {
    return { success: false, error: "Team is at full capacity" };
  }

  // Create the invitation
  const { error: inviteError } = await supabase
    .from("team_invitations")
    .insert({
      team_id: teamId,
      inviter_id: user.id,
      invitee_id: invitee.id,
      status: "pending",
    });

  if (inviteError) {
    console.error("Error creating invitation:", inviteError);
    return { success: false, error: "Failed to send invitation" };
  }

  revalidatePath(`/mathlete/teams/${teamId}`);
  revalidatePath("/mathlete/notifications");
  return { success: true };
}

export async function acceptTeamInvitation(invitationId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  // Get the invitation
  const { data: invitation } = await supabase
    .from("team_invitations")
    .select("id, team_id, invitee_id, status")
    .eq("id", invitationId)
    .single();

  if (!invitation) {
    return { success: false, error: "Invitation not found" };
  }

  if (invitation.invitee_id !== user.id) {
    return { success: false, error: "This invitation is not for you" };
  }

  if (invitation.status !== "pending") {
    return { success: false, error: "Invitation is no longer pending" };
  }

  // Use the SQL function to accept the invitation
  const { error: acceptError } = await supabase.rpc("accept_team_invitation", {
    invitation_id: invitationId,
  });

  if (acceptError) {
    console.error("Error accepting invitation:", acceptError);
    return { success: false, error: acceptError.message || "Failed to accept invitation" };
  }

  revalidatePath("/mathlete/teams");
  revalidatePath("/mathlete/notifications");
  return { success: true, teamId: invitation.team_id };
}

export async function rejectTeamInvitation(invitationId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  // Get the invitation
  const { data: invitation } = await supabase
    .from("team_invitations")
    .select("id, invitee_id, status")
    .eq("id", invitationId)
    .single();

  if (!invitation) {
    return { success: false, error: "Invitation not found" };
  }

  if (invitation.invitee_id !== user.id) {
    return { success: false, error: "This invitation is not for you" };
  }

  if (invitation.status !== "pending") {
    return { success: false, error: "Invitation is no longer pending" };
  }

  // Update invitation status to rejected
  const { error: rejectError } = await supabase
    .from("team_invitations")
    .update({ status: "rejected" })
    .eq("id", invitationId);

  if (rejectError) {
    console.error("Error rejecting invitation:", rejectError);
    return { success: false, error: "Failed to reject invitation" };
  }

  revalidatePath("/mathlete/notifications");
  return { success: true };
}
