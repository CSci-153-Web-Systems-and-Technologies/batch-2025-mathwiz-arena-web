import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import NotificationsClient from "./components/NotificationsClient";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  console.log("Notifications page - User ID:", user.id);

  // Fetch pending team invitations
  const { data: invitations, error: invitationsError } = await supabase
    .from("team_invitations")
    .select(`
      id,
      created_at,
      status,
      invitee_id,
      inviter_id,
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

  console.log("Invitations query result:", invitations);
  console.log("Invitations count:", invitations?.length || 0);

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
