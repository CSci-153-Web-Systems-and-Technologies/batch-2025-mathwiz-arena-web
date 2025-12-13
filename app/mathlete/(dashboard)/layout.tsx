import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import MathleteSidebar from "../components/MathleteSidebar";
import { ThemeScript } from "./settings/components/ThemeProvider";

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
    <>
      <ThemeScript />
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
        <MathleteSidebar notificationCount={notificationCount || 0} />
        <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
          {children}
        </main>
      </div>
    </>
  );
}
