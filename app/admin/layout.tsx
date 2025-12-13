import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AdminSidebar from "./components/AdminSidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Verify admin role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect("/error?message=Access denied");
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <AdminSidebar />
            <main className="flex-1 ml-64">{children}</main>
        </div>
    );
}
