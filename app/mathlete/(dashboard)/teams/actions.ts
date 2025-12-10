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

  // Find the invitee by username (case-insensitive)
  const { data: invitee, error: inviteeError } = await supabase
    .from("profiles")
    .select("id, username")
    .ilike("username", username.trim())
    .maybeSingle();

  if (inviteeError) {
    console.error("Error finding invitee:", inviteeError);
    return { success: false, error: "Error searching for user" };
  }

  if (!invitee) {
    return { success: false, error: "User not found" };
  }

  console.log("Found invitee:", invitee.id, "Username:", invitee.username);

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

  // Check if there's already an invitation (any status)
  const { data: existingInvitation, error: checkError } = await supabase
    .from("team_invitations")
    .select("id, status, invitee_id")
    .eq("team_id", teamId)
    .eq("invitee_id", invitee.id)
    .maybeSingle();

  if (checkError) {
    console.error("Error checking existing invitation:", checkError);
  }

  console.log("Existing invitation check:", existingInvitation);

  if (existingInvitation) {
    console.log("Found existing invitation - Status:", existingInvitation.status, "Invitee ID:", existingInvitation.invitee_id);

    if (existingInvitation.status === "pending") {
      return { success: false, error: "Invitation already sent to this user" };
    }

    // If invitation is accepted but user is not a member (shouldn't happen but handle gracefully)
    if (existingInvitation.status === "accepted") {
      // Check again if they're truly not a member (defensive check)
      const { data: memberCheck } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", teamId)
        .eq("mathlete_id", invitee.id)
        .maybeSingle();

      if (memberCheck) {
        return { success: false, error: "User is already a team member" };
      }

      // Invitation marked as accepted but user not in team_members - data inconsistency
      // Delete the stale invitation and allow creating a new one
      console.log("Found stale accepted invitation - deleting and allowing new invite");
      await supabase
        .from("team_invitations")
        .delete()
        .eq("id", existingInvitation.id);

      // Continue to create new invitation below
    } else if (existingInvitation.status === "rejected") {
      // If status is "rejected", update it back to "pending" to resend invitation
      console.log("Updating rejected invitation back to pending");
      const { error: updateError } = await supabase
        .from("team_invitations")
        .update({
          status: "pending",
          inviter_id: user.id,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingInvitation.id);

      if (updateError) {
        console.error("Error resending invitation:", updateError);
        return { success: false, error: "Failed to resend invitation" };
      }

      revalidatePath(`/mathlete/teams/${teamId}`);
      revalidatePath("/mathlete/notifications");
      return { success: true };
    }
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
  console.log("Creating new invitation - Team:", teamId, "Inviter:", user.id, "Invitee:", invitee.id);

  const { data: newInvitation, error: inviteError } = await supabase
    .from("team_invitations")
    .insert({
      team_id: teamId,
      inviter_id: user.id,
      invitee_id: invitee.id,
      status: "pending",
    })
    .select()
    .single();

  if (inviteError) {
    console.error("Error creating invitation:", inviteError);
    console.error("Error details:", JSON.stringify(inviteError, null, 2));
    return { success: false, error: "Failed to send invitation" };
  }

  console.log("Invitation created successfully:", newInvitation);

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

  // Update invitation status to rejected and set responded_at for inviter notification
  const { error: rejectError } = await supabase
    .from("team_invitations")
    .update({
      status: "rejected",
      responded_at: new Date().toISOString(),
      inviter_notified: false
    })
    .eq("id", invitationId);

  if (rejectError) {
    console.error("Error rejecting invitation:", rejectError);
    return { success: false, error: "Failed to reject invitation" };
  }

  revalidatePath("/mathlete/notifications");
  return { success: true };
}

export async function markResponseAsRead(invitationId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  // Mark the invitation response as read by the inviter
  const { error: updateError } = await supabase
    .from("team_invitations")
    .update({ inviter_notified: true })
    .eq("id", invitationId)
    .eq("inviter_id", user.id);

  if (updateError) {
    console.error("Error marking response as read:", updateError);
    return { success: false, error: "Failed to mark as read" };
  }

  // Revalidate both notifications page and dashboard to update badge count
  revalidatePath("/mathlete/notifications");
  revalidatePath("/mathlete");
  return { success: true };
}

export async function leaveTeam(teamId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  // Check if user is a member of this team
  const { data: membership } = await supabase
    .from("team_members")
    .select("id, role")
    .eq("team_id", teamId)
    .eq("mathlete_id", user.id)
    .maybeSingle();

  if (!membership) {
    return { success: false, error: "You are not a member of this team" };
  }

  // Prevent team leader from leaving
  if (membership.role === "leader") {
    return { success: false, error: "Team leader cannot leave the team. You must transfer leadership or delete the team." };
  }

  // Remove the member from the team
  const { error: deleteError } = await supabase
    .from("team_members")
    .delete()
    .eq("id", membership.id);

  if (deleteError) {
    console.error("Error leaving team:", deleteError);
    return { success: false, error: "Failed to leave team" };
  }

  // Delete the invitation record so they can be re-invited later
  await supabase
    .from("team_invitations")
    .delete()
    .eq("team_id", teamId)
    .eq("invitee_id", user.id);

  revalidatePath("/mathlete/teams");
  revalidatePath(`/mathlete/teams/${teamId}`);
  return { success: true };
}

export async function removeMember(teamId: string, memberId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  // Verify the user is the team leader
  const { data: team } = await supabase
    .from("teams")
    .select("team_leader_id")
    .eq("id", teamId)
    .single();

  if (!team) {
    return { success: false, error: "Team not found" };
  }

  if (team.team_leader_id !== user.id) {
    return { success: false, error: "Only team leader can remove members" };
  }

  // Get the member to be removed
  const { data: memberToRemove } = await supabase
    .from("team_members")
    .select("id, role, mathlete_id")
    .eq("id", memberId)
    .eq("team_id", teamId)
    .maybeSingle();

  if (!memberToRemove) {
    return { success: false, error: "Member not found" };
  }

  // Prevent removing the team leader
  if (memberToRemove.role === "leader") {
    return { success: false, error: "Cannot remove team leader" };
  }

  // Remove the member
  const { error: deleteError } = await supabase
    .from("team_members")
    .delete()
    .eq("id", memberId);

  if (deleteError) {
    console.error("Error removing member:", deleteError);
    return { success: false, error: "Failed to remove member" };
  }

  // Delete the invitation record so they can be re-invited later
  await supabase
    .from("team_invitations")
    .delete()
    .eq("team_id", teamId)
    .eq("invitee_id", memberToRemove.mathlete_id);

  revalidatePath(`/mathlete/teams/${teamId}`);
  return { success: true };
}

export async function deleteTeam(teamId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  // Verify the user is the team leader
  const { data: team } = await supabase
    .from("teams")
    .select("team_leader_id, name")
    .eq("id", teamId)
    .single();

  if (!team) {
    return { success: false, error: "Team not found" };
  }

  if (team.team_leader_id !== user.id) {
    return { success: false, error: "Only the team leader can delete the team" };
  }

  // Delete all team invitations first
  const { error: invitationsError } = await supabase
    .from("team_invitations")
    .delete()
    .eq("team_id", teamId);

  if (invitationsError) {
    console.error("Error deleting team invitations:", invitationsError);
    return { success: false, error: "Failed to delete team invitations" };
  }

  // Delete all team members
  const { error: membersError } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId);

  if (membersError) {
    console.error("Error deleting team members:", membersError);
    return { success: false, error: "Failed to delete team members" };
  }

  // Delete the team itself
  const { error: teamError } = await supabase
    .from("teams")
    .delete()
    .eq("id", teamId);

  if (teamError) {
    console.error("Error deleting team:", teamError);
    return { success: false, error: "Failed to delete team" };
  }

  revalidatePath("/mathlete/teams");
  return { success: true };
}
