import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import MathleteSidebar from "../components/MathleteSidebar";

export default async function MathleteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch notification count (pending invitations + unread responses)
  const { count: pendingInvites } = await supabase
    .from("team_invitations")
    .select("*", { count: "exact", head: true })
    .eq("invitee_id", user.id)
    .eq("status", "pending");

  const { count: unreadResponses } = await supabase
    .from("team_invitations")
    .select("*", { count: "exact", head: true })
    .eq("inviter_id", user.id)
    .in("status", ["accepted", "rejected"])
    .eq("inviter_notified", false);

  const notificationCount = (pendingInvites || 0) + (unreadResponses || 0);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <MathleteSidebar notificationCount={notificationCount} />
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}
