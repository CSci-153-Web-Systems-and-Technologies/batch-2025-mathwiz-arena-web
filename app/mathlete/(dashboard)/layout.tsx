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

  // Fetch notification count (unread notifications)
  const { count: notificationCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "unread");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <MathleteSidebar notificationCount={notificationCount || 0} />
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}
