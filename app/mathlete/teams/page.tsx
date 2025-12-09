import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import TeamsClient from "@/app/mathlete/teams/components/TeamsClient";

export default async function TeamsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch teams where user is a member
  const { data: teamMemberships, error: membershipsError } = await supabase
    .from("team_members")
    .select(`
      id,
      role,
      joined_at,
      teams (
        id,
        name,
        max_members,
        created_at,
        team_leader_id
      )
    `)
    .eq("mathlete_id", user.id)
    .order("joined_at", { ascending: false });

  if (membershipsError) {
    console.error("Error fetching teams:", membershipsError);
  }

  const teams = teamMemberships?.map(membership => {
    const team = membership.teams as any;
    return {
      id: team.id,
      name: team.name,
      max_members: team.max_members,
      created_at: team.created_at,
      team_leader_id: team.team_leader_id,
      userRole: membership.role,
      joinedAt: membership.joined_at
    };
  }) || [];

  return <TeamsClient teams={teams} />;
}
