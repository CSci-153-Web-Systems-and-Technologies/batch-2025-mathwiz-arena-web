import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import OrganizerNotificationsClient from "./components/OrganizerNotificationsClient";

export default async function OrganizerNotificationsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch all notifications for this organizer
    const { data: notifications, error: notificationsError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

    if (notificationsError) {
        console.error("Error fetching notifications:", notificationsError);
    }

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

    return <OrganizerNotificationsClient notifications={formattedNotifications} />;
}
