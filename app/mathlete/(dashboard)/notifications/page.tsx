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

  // Fetch all notifications for this user
  const { data: notifications, error: notificationsError } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100); // Show last 100 notifications

  if (notificationsError) {
    console.error("Error fetching notifications:", notificationsError);
  }

  console.log("Notifications query result:", notifications);
  console.log("Notifications count:", notifications?.length || 0);

  const formattedNotifications = notifications?.map((notif: any) => ({
    id: notif.id,
    type: notif.type,
    title: notif.title,
    message: notif.message,
    actionUrl: notif.action_url,
    relatedId: notif.related_id,
    metadata: notif.metadata,
    status: notif.status,
    createdAt: notif.created_at,
    readAt: notif.read_at,
  })) || [];

  return <NotificationsClient notifications={formattedNotifications} />;
}
