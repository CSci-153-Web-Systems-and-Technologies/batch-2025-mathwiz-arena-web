import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MathleteSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
          <h1 className="text-3xl font-bold text-[#25346A]">Settings</h1>
          <p className="text-slate-600 mt-1">Manage your account preferences and settings</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Account Settings */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Account Settings</h2>
              <p className="text-sm text-slate-600 mt-1">Manage your account information and security</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-semibold text-slate-900">Email Address</h3>
                  <p className="text-sm text-slate-600">{user.email}</p>
                </div>
                <button disabled className="px-4 py-2 text-sm border border-slate-300 text-slate-400 rounded-lg cursor-not-allowed">
                  Change Email
                </button>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-slate-200">
                <div>
                  <h3 className="font-semibold text-slate-900">Password</h3>
                  <p className="text-sm text-slate-600">••••••••</p>
                </div>
                <button disabled className="px-4 py-2 text-sm border border-slate-300 text-slate-400 rounded-lg cursor-not-allowed">
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Notification Preferences</h2>
              <p className="text-sm text-slate-600 mt-1">Choose how you want to be notified</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-semibold text-slate-900">Team Invitations</h3>
                  <p className="text-sm text-slate-600">Get notified when you receive team invitations</p>
                </div>
                <div className="relative inline-block w-12 h-6 bg-slate-200 rounded-full cursor-not-allowed opacity-50">
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></span>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-slate-200">
                <div>
                  <h3 className="font-semibold text-slate-900">Competition Updates</h3>
                  <p className="text-sm text-slate-600">Receive updates about competitions you're registered for</p>
                </div>
                <div className="relative inline-block w-12 h-6 bg-slate-200 rounded-full cursor-not-allowed opacity-50">
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></span>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Privacy Settings</h2>
              <p className="text-sm text-slate-600 mt-1">Control your privacy and visibility</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-semibold text-slate-900">Profile Visibility</h3>
                  <p className="text-sm text-slate-600">Make your profile visible to other mathletes</p>
                </div>
                <div className="relative inline-block w-12 h-6 bg-slate-200 rounded-full cursor-not-allowed opacity-50">
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-900">Settings Features Coming Soon</h3>
                <p className="text-sm text-blue-800 mt-1">
                  The ability to modify these settings will be available in a future update.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
