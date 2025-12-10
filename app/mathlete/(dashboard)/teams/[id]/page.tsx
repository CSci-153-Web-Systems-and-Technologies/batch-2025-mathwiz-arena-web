import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import TeamDetailsClient from "./components/TeamDetailsClient";

export default async function TeamDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch team details
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .eq("id", id)
    .single();

  if (teamError || !team) {
    console.error("Error fetching team:", teamError);
    redirect("/mathlete/teams");
  }

  // Fetch all team members with their profile information
  const { data: members, error: membersError } = await supabase
    .from("team_members")
    .select(`
      id,
      role,
      joined_at,
      profiles:mathlete_id (
        id,
        full_name,
        username
      )
    `)
    .eq("team_id", id)
    .order("joined_at", { ascending: true });

  if (membersError) {
    console.error("Error fetching members:", membersError);
  }

  // Check if current user is a member of this team
  const userMembership = members?.find((m: any) => m.profiles?.id === user.id);
  const isLeader = team.team_leader_id === user.id;

  if (!userMembership) {
    // User is not a member of this team
    redirect("/mathlete/teams");
  }

  const membersList = members?.map((member: any) => ({
    id: member.id,
    role: member.role,
    joinedAt: member.joined_at,
    profile: member.profiles
  })) || [];

  const currentMemberCount = membersList.length;

  return (
    <TeamDetailsClient 
      team={team}
      membersList={membersList}
      currentMemberCount={currentMemberCount}
      isLeader={isLeader}
      userId={user.id}
    />
  );
}
