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

  // Fetch pending team invitations (invitations TO this user)
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

  // Fetch invitation responses (responses to invitations FROM this user)
  const { data: responses, error: responsesError } = await supabase
    .from("team_invitations")
    .select(`
      id,
      created_at,
      responded_at,
      status,
      invitee_id,
      inviter_id,
      inviter_notified,
      teams (
        id,
        name,
        max_members
      ),
      invitee:invitee_id (
        id,
        username,
        full_name
      )
    `)
    .eq("inviter_id", user.id)
    .in("status", ["accepted", "rejected"])
    .eq("inviter_notified", false)
    .order("responded_at", { ascending: false });

  if (responsesError) {
    console.error("Error fetching responses:", responsesError);
  }

  console.log("Responses query result:", responses);
  console.log("Responses count:", responses?.length || 0);

  const pendingInvitations = invitations?.map((inv: any) => ({
    id: inv.id,
    createdAt: inv.created_at,
    status: inv.status,
    team: inv.teams,
    inviter: inv.inviter
  })) || [];

  const invitationResponses = responses?.map((resp: any) => ({
    id: resp.id,
    createdAt: resp.created_at,
    respondedAt: resp.responded_at,
    status: resp.status,
    team: resp.teams,
    invitee: resp.invitee
  })) || [];

  return <NotificationsClient invitations={pendingInvitations} responses={invitationResponses} />;
}
