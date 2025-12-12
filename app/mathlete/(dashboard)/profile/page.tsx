import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileHeader from "./components/ProfileHeader";

export default async function MathleteProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile with new fields
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch competition stats
  const { data: attempts } = await supabase
    .from("competition_attempts")
    .select("id, total_score, is_completed")
    .eq("mathlete_id", user.id)
    .eq("is_completed", true);

  // Calculate stats
  const competitionsJoined = attempts?.length || 0;
  const totalScore = attempts?.reduce((sum, a) => sum + (a.total_score || 0), 0) || 0;

  // Calculate global rank (simplified - based on total score)
  // Get count of users with higher total scores
  const { count: higherScoreCount } = await supabase
    .from("competition_attempts")
    .select("mathlete_id", { count: "exact", head: true })
    .gt("total_score", totalScore)
    .eq("is_completed", true);

  // Get total participants who have completed at least one competition
  const { data: allParticipants } = await supabase
    .from("competition_attempts")
    .select("mathlete_id")
    .eq("is_completed", true);

  const uniqueParticipants = new Set(allParticipants?.map(p => p.mathlete_id) || []);
  const totalParticipants = uniqueParticipants.size;

  // Rank is 1 + number of people with higher score
  const rank = competitionsJoined > 0 ? (higherScoreCount || 0) + 1 : null;

  const stats = {
    competitionsJoined,
    totalScore,
    rank,
    totalParticipants
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/mathlete"
            className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Profile Header */}
      <ProfileHeader
        profile={{
          id: profile?.id || user.id,
          full_name: profile?.full_name || null,
          username: profile?.username || null,
          avatar_url: profile?.avatar_url || null,
          cover_photo_url: profile?.cover_photo_url || null,
          school: profile?.school || null,
          country: profile?.country || null,
        }}
        stats={stats}
        isOwnProfile={true}
      />

      {/* Profile Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* About Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">About</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Full Name</label>
                  <p className="mt-1 text-slate-900">{profile?.full_name || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Username</label>
                  <p className="mt-1 text-slate-900">@{profile?.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Email</label>
                  <p className="mt-1 text-slate-900">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">School</label>
                  <p className="mt-1 text-slate-900">{profile?.school || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Location</label>
                  <p className="mt-1 text-slate-900">
                    {profile?.province_city && profile?.country
                      ? `${profile.province_city}, ${profile.country}`
                      : profile?.country || "Not set"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Role</label>
                  <p className="mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      Mathlete
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - More content coming soon */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics Section - Placeholder */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">Statistics</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-[#25346A]">{competitionsJoined}</p>
                    <p className="text-sm text-slate-500">Completed</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-[#F49700]">{totalScore}</p>
                    <p className="text-sm text-slate-500">Total Points</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {competitionsJoined > 0 ? Math.round(totalScore / competitionsJoined) : 0}
                    </p>
                    <p className="text-sm text-slate-500">Avg Score</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {rank ? `#${rank}` : "—"}
                    </p>
                    <p className="text-sm text-slate-500">Global Rank</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coming Soon Sections */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800">More Features Coming Soon!</h3>
              </div>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Competition History & Detailed Results
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  Achievement Badges
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                  Teams & Activity Feed
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Profile Editing
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
