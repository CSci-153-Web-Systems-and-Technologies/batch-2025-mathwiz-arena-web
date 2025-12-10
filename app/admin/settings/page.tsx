import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminSettings() {
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
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/admin" className="text-purple-600 hover:underline mb-4 inline-block">
                    ← Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Settings</h1>
                <p className="text-slate-600 mb-8">Manage system configuration and preferences</p>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <p className="text-slate-600">Settings page coming soon...</p>
                </div>
            </div>
        </div>
    );
}
