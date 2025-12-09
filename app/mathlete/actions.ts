"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function registerForCompetition(competitionId: string, teamId?: string) {
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
    .select("id, status, start_datetime, max_participants, participation_type, max_team_members, require_full_team")
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

    if (!teamMemberIds || teamMemberIds.length < 2) {
      return {
        success: false,
        error: "Teams must have at least 2 members to register"
      };
    }

    // Check if competition requires full team
    if (competition.require_full_team && competition.max_team_members) {
      if (teamMemberIds.length < competition.max_team_members) {
        return {
          success: false,
          error: `This competition requires teams to have exactly ${competition.max_team_members} members. Your team has ${teamMemberIds.length} member${teamMemberIds.length !== 1 ? 's' : ''}.`
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

  // Revalidate the page to show updated registration status
  revalidatePath("/mathlete");

  return {
    success: true,
    message: competition.participation_type === "team" 
      ? "Successfully registered your team for the competition!"
      : "Successfully registered for the competition!"
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
    .select("id, start_datetime, participation_type")
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

  // Revalidate the page to show updated registration status
  revalidatePath("/mathlete");

  return {
    success: true,
    message: competition.participation_type === "team"
      ? "Successfully withdrawn your team from the competition!"
      : "Successfully unregistered from the competition!"
  };
}
