import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import NotificationsClient from "./components/NotificationsClient";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch pending team invitations
  const { data: invitations, error: invitationsError } = await supabase
    .from("team_invitations")
    .select(`
      id,
      created_at,
      status,
      teams (
        id,
        name,
        max_members
      ),
      inviter:inviter_id (
        id,
        username,
        full_name
      )
    `)
    .eq("invitee_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (invitationsError) {
    console.error("Error fetching invitations:", invitationsError);
  }

  const pendingInvitations = invitations?.map((inv: any) => ({
    id: inv.id,
    createdAt: inv.created_at,
    status: inv.status,
    team: inv.teams,
    inviter: inv.inviter
  })) || [];

  return <NotificationsClient invitations={pendingInvitations} />;
}
