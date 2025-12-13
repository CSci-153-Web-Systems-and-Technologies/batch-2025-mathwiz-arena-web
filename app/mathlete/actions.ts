"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function registerForCompetition(competitionId: string, teamId?: string) {
  const supabase = await createClient();

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
    .select("id, name, status, start_datetime, max_participants, participation_type, max_team_members, require_full_team, competition_mode, is_active, organizer_id")
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

  // Validate team participation requirements
  if (competition.participation_type === "team") {
    if (!teamId) {
      return {
        success: false,
        error: "Team ID is required for team competitions"
      };
    }

    // Verify user is the team leader
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id, team_leader_id")
      .eq("id", teamId)
      .single();

    if (teamError || !team) {
      return {
        success: false,
        error: "Team not found"
      };
    }

    if (team.team_leader_id !== user.id) {
      return {
        success: false,
        error: "Only the team leader can register the team for competitions"
      };
    }

    // Verify user is a member of the team (should always be true for leader)
    const { data: membership, error: membershipError } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", teamId)
      .eq("mathlete_id", user.id)
      .single();

    if (membershipError || !membership) {
      return {
        success: false,
        error: "You are not a member of this team"
      };
    }

    // Get team member count and validate team size requirements
    const { data: teamMemberIds } = await supabase
      .from("team_members")
      .select("mathlete_id")
      .eq("team_id", teamId);

    // Check if competition requires full team FIRST (more specific requirement)
    if (competition.require_full_team && competition.max_team_members) {
      if (!teamMemberIds || teamMemberIds.length !== competition.max_team_members) {
        const currentCount = teamMemberIds?.length || 0;
        return {
          success: false,
          error: `This competition requires teams to have exactly ${competition.max_team_members} members. Your team has ${currentCount} member${currentCount !== 1 ? 's' : ''}.`
        };
      }
    } else {
      // Flexible requirement - minimum 2 members
      if (!teamMemberIds || teamMemberIds.length < 2) {
        return {
          success: false,
          error: "Teams must have at least 2 members to register"
        };
      }
    }

    // Check if any team member is already registered for this competition

    if (teamMemberIds && teamMemberIds.length > 0) {
      const memberIds = teamMemberIds.map(m => m.mathlete_id);

      const { data: existingTeamRegistrations, error: teamRegError } = await supabase
        .from("competition_registrations")
        .select("mathlete_id")
        .eq("competition_id", competitionId)
        .eq("status", "registered")
        .in("mathlete_id", memberIds);

      if (teamRegError) {
        return {
          success: false,
          error: "Failed to check team registration status"
        };
      }

      if (existingTeamRegistrations && existingTeamRegistrations.length > 0) {
        return {
          success: false,
          error: "One or more team members are already registered for this competition"
        };
      }
    }
  } else if (teamId) {
    // Individual competition but team ID provided
    return {
      success: false,
      error: "Cannot register with a team for individual competitions"
    };
  }

  // Check if competition has already started (only for scheduled competitions)
  // Live competitions don't have a fixed start time - they're always available when active
  const isLiveCompetition = competition.competition_mode === 'live';

  if (isLiveCompetition) {
    // For Live competitions, check if the competition is active
    if (competition.is_active === false) {
      return {
        success: false,
        error: "This Live competition is currently paused and not accepting registrations"
      };
    }
  } else {
    // For scheduled competitions, check if it has already started
    const now = new Date();
    const startTime = competition.start_datetime ? new Date(competition.start_datetime) : null;

    if (startTime && now >= startTime) {
      return {
        success: false,
        error: "This competition has already started"
      };
    }
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
    const updateData: any = {
      status: "registered",
      registered_at: currentTime,
      updated_at: currentTime
    };

    // Add team_id for team competitions
    if (competition.participation_type === "team" && teamId) {
      updateData.team_id = teamId;
    }

    const { error: updateError } = await supabase
      .from("competition_registrations")
      .update(updateData)
      .eq("id", existingRegistration.id);

    if (updateError) {
      console.error("Re-registration error:", updateError);
      return {
        success: false,
        error: "Failed to register for the competition. Please try again."
      };
    }
  } else if (competition.participation_type === "team" && teamId) {
    // Register all team members for team competition
    const { data: teamMembers, error: teamMembersError } = await supabase
      .from("team_members")
      .select("mathlete_id")
      .eq("team_id", teamId);

    if (teamMembersError || !teamMembers || teamMembers.length === 0) {
      return {
        success: false,
        error: "Failed to fetch team members"
      };
    }

    // Create registration records for all team members
    const registrations = teamMembers.map(member => ({
      competition_id: competitionId,
      mathlete_id: member.mathlete_id,
      team_id: teamId,
      status: "registered"
    }));

    const { error: insertError } = await supabase
      .from("competition_registrations")
      .insert(registrations);

    if (insertError) {
      console.error("Team registration error:", insertError);
      return {
        success: false,
        error: "Failed to register team for the competition. Please try again."
      };
    }
  } else {
    // Register individual mathlete
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

  // Get mathlete's username for notification
  const { data: mathleteProfile } = await supabase
    .from("profiles")
    .select("username, full_name")
    .eq("id", user.id)
    .single();

  const mathleteName = mathleteProfile?.full_name || mathleteProfile?.username || "A mathlete";

  // Notify the organizer about the registration
  if (competition.organizer_id && competition.organizer_id !== user.id) {
    const registrationType = competition.participation_type === "team" ? "team" : "individual";
    await supabase
      .from("notifications")
      .insert({
        user_id: competition.organizer_id,
        type: "competition_registration",
        title: "New Registration",
        message: `${mathleteName} has registered for "${competition.name}" (${registrationType})`,
        action_url: `/organizer/competition/${competitionId}`,
        related_id: competitionId,
        metadata: {
          competition_id: competitionId,
          competition_name: competition.name,
          mathlete_id: user.id,
          mathlete_name: mathleteName,
          registration_type: registrationType,
          team_id: teamId || null
        },
        status: "unread"
      });
  }

  // Revalidate the page to show updated registration status
  revalidatePath("/mathlete");
  revalidatePath("/organizer");

  return {
    success: true,
    message: competition.participation_type === "team"
      ? "Successfully registered your team for the competition!"
      : "Successfully registered for the competition!"
  };
}

export async function unregisterFromCompetition(competitionId: string) {
  const supabase = await createClient();

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
    .select("id, name, start_datetime, participation_type, competition_mode, organizer_id")
    .eq("id", competitionId)
    .single();

  if (competitionError || !competition) {
    return {
      success: false,
      error: "Competition not found"
    };
  }

  // Check if competition has already started (only for scheduled competitions)
  // For Live competitions, users can withdraw at any time before they start an attempt
  const isLiveCompetition = competition.competition_mode === 'live';

  if (!isLiveCompetition) {
    const now = new Date();
    const startTime = competition.start_datetime ? new Date(competition.start_datetime) : null;

    if (startTime && now >= startTime) {
      return {
        success: false,
        error: "Cannot withdraw from a competition that has already started"
      };
    }
  }

  // Check if registered with status 'registered'
  const { data: existingRegistration } = await supabase
    .from("competition_registrations")
    .select("id, status, team_id")
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

  // For team competitions, withdraw all team members
  if (competition.participation_type === "team" && existingRegistration.team_id) {
    const { error: updateError } = await supabase
      .from("competition_registrations")
      .update({
        status: "withdrawn",
        updated_at: new Date().toISOString()
      })
      .eq("competition_id", competitionId)
      .eq("team_id", existingRegistration.team_id)
      .eq("status", "registered");

    if (updateError) {
      console.error("Team withdrawal error:", updateError);
      return {
        success: false,
        error: "Failed to withdraw team from the competition. Please try again."
      };
    }
  } else {
    // Update individual registration status to 'withdrawn'
    const { error: updateError } = await supabase
      .from("competition_registrations")
      .update({
        status: "withdrawn",
        updated_at: new Date().toISOString()
      })
      .eq("id", existingRegistration.id);

    if (updateError) {
      console.error("Unregister error:", updateError);
      return {
        success: false,
        error: "Failed to unregister from the competition. Please try again."
      };
    }
  }

  // Get mathlete's username for notification
  const { data: mathleteProfile } = await supabase
    .from("profiles")
    .select("username, full_name")
    .eq("id", user.id)
    .single();

  const mathleteName = mathleteProfile?.full_name || mathleteProfile?.username || "A mathlete";

  // Notify the organizer about the withdrawal
  if (competition.organizer_id && competition.organizer_id !== user.id) {
    const registrationType = competition.participation_type === "team" ? "team" : "individual";
    await supabase
      .from("notifications")
      .insert({
        user_id: competition.organizer_id,
        type: "competition_withdrawal",
        title: "Registration Withdrawn",
        message: `${mathleteName} has withdrawn from "${competition.name}" (${registrationType})`,
        action_url: `/organizer/competition/${competitionId}`,
        related_id: competitionId,
        metadata: {
          competition_id: competitionId,
          competition_name: competition.name,
          mathlete_id: user.id,
          mathlete_name: mathleteName,
          registration_type: registrationType
        },
        status: "unread"
      });
  }

  // Revalidate the page to show updated registration status
  revalidatePath("/mathlete");
  revalidatePath("/organizer");

  return {
    success: true,
    message: competition.participation_type === "team"
      ? "Successfully withdrawn your team from the competition!"
      : "Successfully unregistered from the competition!"
  };
}
