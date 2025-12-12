import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import OrganizerSidebar from "./components/OrganizerSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";

export default async function OrganizerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Verify organizer role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== 'organizer') {
        redirect("/error?message=Access denied");
    }

    return (
        <ThemeProvider>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
                <OrganizerSidebar />
                <main className="flex-1 ml-64">
                    {children}
                </main>
            </div>
        </ThemeProvider>
    );
}
