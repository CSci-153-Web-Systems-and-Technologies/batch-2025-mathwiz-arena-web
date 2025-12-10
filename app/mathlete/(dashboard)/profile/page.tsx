import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MathleteProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/mathlete"
            className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2 mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[#25346A]">Profile</h1>
          <p className="text-slate-600 mt-1">View and manage your profile information</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#25346A] to-[#2A64d1] px-6 py-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-[#25346A] text-3xl font-bold shadow-lg">
                {profile?.full_name?.charAt(0).toUpperCase() || profile?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{profile?.full_name || 'Mathlete'}</h2>
                <p className="text-blue-100 mt-1">@{profile?.username}</p>
              </div>
            </div>
          </div>

          {/* Information Section */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-600">Full Name</label>
                <p className="mt-1 text-lg text-slate-900">{profile?.full_name || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Username</label>
                <p className="mt-1 text-lg text-slate-900">@{profile?.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Email</label>
                <p className="mt-1 text-lg text-slate-900">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Role</label>
                <p className="mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Mathlete
                  </span>
                </p>
              </div>
            </div>

            {/* Edit Profile Button (Coming Soon) */}
            <div className="pt-4 border-t border-slate-200">
              <button
                disabled
                className="px-6 py-2 bg-slate-100 text-slate-400 font-semibold rounded-lg cursor-not-allowed"
              >
                Edit Profile (Coming Soon)
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-900">Profile Editing Coming Soon</h3>
              <p className="text-sm text-blue-800 mt-1">
                The ability to edit your profile information will be available in a future update.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
