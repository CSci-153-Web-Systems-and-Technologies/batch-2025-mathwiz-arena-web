import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import CompleteProfileForm from "./components/CompleteProfileForm";

export default async function CompleteProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not logged in, redirect to login 
  if (!user) {
    redirect("/login");
  }

  // Check if profile is already completed 
  const { data: profile } = await supabase
    .from("profiles")
    .select("profile_completed, role")
    .eq("id", user.id)
    .single();

  // If profile is already completed, redirect to dashboard 
  if (profile?.profile_completed) {
    if (profile.role === "organizer") {
      redirect("/organizer");
    } else {
      redirect("/mathlete");
    }
  }

  // Get role from user metadata or profile
  const role = user.user_metadata?.role || profile?.role;

  // If no role is set, redirect to role selection
  if (!role) {
    redirect("/signup/select-role");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#25346A] dark:text-white mb-2 transition-colors">
            Complete Your Profile
          </h1>
          <p className="text-slate-600 dark:text-slate-400 transition-colors">
            Just a few more details to get you started!
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700 transition-all">
          <CompleteProfileForm userId={user.id} role={role} />
        </div>
      </div>
    </div>
  );
} 
