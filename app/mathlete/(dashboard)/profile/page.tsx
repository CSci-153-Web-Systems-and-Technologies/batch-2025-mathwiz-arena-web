import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProfileHeaderWithEdit from "./components/ProfileHeaderWithEdit";
import StatisticsCard from "./components/StatisticsCard";
import AchievementBadges from "./components/AchievementBadges";

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

  // Fetch all completed competition attempts with competition details
  const { data: attempts } = await supabase
    .from("competition_attempts")
    .select(`
      id, 
      total_score, 
      is_completed,
      started_at,
      ended_at,
      competition_id,
      competitions (
        id,
        name,
        competition_problems (
          points
        )
      )
    `)
    .eq("mathlete_id", user.id)
    .eq("is_completed", true)
    .order("ended_at", { ascending: false });

  // Calculate competition stats
  const competitionsCompleted = attempts?.length || 0;
  const totalScore = attempts?.reduce((sum, a) => sum + (a.total_score || 0), 0) || 0;
  const averageScore = competitionsCompleted > 0 ? totalScore / competitionsCompleted : 0;

  // Find best performance
  let bestScore = 0;
  let bestCompetition: string | null = null;

  if (attempts && attempts.length > 0) {
    const best = attempts.reduce((prev, current) =>
      (current.total_score || 0) > (prev.total_score || 0) ? current : prev
    );
    bestScore = best.total_score || 0;
    bestCompetition = (best.competitions as any)?.name || null;
  }

  // Calculate wins and top 3 finishes
  // For each competition, get all attempts and determine rank
  let wins = 0;
  let topThree = 0;
  let perfectScores = 0;

  if (attempts && attempts.length > 0) {
    for (const attempt of attempts) {
      // Get all attempts for this competition to determine rank
      const { data: allCompetitionAttempts } = await supabase
        .from("competition_attempts")
        .select("mathlete_id, total_score")
        .eq("competition_id", attempt.competition_id)
        .eq("is_completed", true)
        .order("total_score", { ascending: false });

      if (allCompetitionAttempts) {
        // Find user's rank in this competition
        const userRank = allCompetitionAttempts.findIndex(a => a.mathlete_id === user.id) + 1;

        if (userRank === 1) wins++;
        if (userRank <= 3) topThree++;
      }

      // Check for perfect score
      const competition = attempt.competitions as any;
      if (competition?.competition_problems) {
        const maxPoints = competition.competition_problems.reduce(
          (sum: number, p: any) => sum + (p.points || 0), 0
        );
        if (maxPoints > 0 && attempt.total_score === maxPoints) {
          perfectScores++;
        }
      }
    }
  }

  const winRate = competitionsCompleted > 0 ? (wins / competitionsCompleted) * 100 : 0;

  const stats = {
    competitionsCompleted,
    totalScore,
    averageScore,
    bestScore,
    bestCompetition,
    wins,
    topThree,
    perfectScores,
    winRate,
  };

  // Calculate header stats (for quick stats in header)
  // Get global rank
  const { count: higherScoreCount } = await supabase
    .from("competition_attempts")
    .select("mathlete_id", { count: "exact", head: true })
    .gt("total_score", totalScore)
    .eq("is_completed", true);

  const { data: allParticipants } = await supabase
    .from("competition_attempts")
    .select("mathlete_id")
    .eq("is_completed", true);

  const uniqueParticipants = new Set(allParticipants?.map(p => p.mathlete_id) || []);
  const totalParticipants = uniqueParticipants.size;
  const rank = competitionsCompleted > 0 ? (higherScoreCount || 0) + 1 : null;

  const headerStats = {
    competitionsJoined: competitionsCompleted,
    totalScore,
    rank,
    totalParticipants
  };

  // Fetch user achievements
  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select(`
      id,
      earned_at,
      achievements (
        id,
        name,
        description,
        icon,
        badge_color
      )
    `)
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false });

  // Get total available achievements
  const { count: totalAchievements } = await supabase
    .from("achievements")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  // Format achievements for display
  const achievements = userAchievements?.map(ua => ({
    id: (ua.achievements as any)?.id || ua.id,
    name: (ua.achievements as any)?.name || "Unknown",
    description: (ua.achievements as any)?.description || "",
    icon: (ua.achievements as any)?.icon || "🏅",
    badge_color: (ua.achievements as any)?.badge_color || "blue",
    earned_at: ua.earned_at,
  })) || [];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Profile Header - Facebook style */}
      <ProfileHeaderWithEdit
        profile={{
          id: profile?.id || user.id,
          full_name: profile?.full_name || null,
          username: profile?.username || null,
          avatar_url: profile?.avatar_url || null,
          cover_photo_url: profile?.cover_photo_url || null,
          school: profile?.school || null,
          country: profile?.country || null,
          province_city: profile?.province_city || null,
          bio: profile?.bio || null,
        }}
        stats={headerStats}
        isOwnProfile={true}
      />

      {/* Profile Content - Facebook style two-column */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Row - Intro and Statistics side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
          {/* Left Column - Intro (narrower like Facebook) */}
          <div className="lg:col-span-2">
            {/* Intro Card - Facebook style, matches Statistics height */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full">
              <div className="p-4 h-full flex flex-col">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Intro</h2>

                {/* Bio at top if exists */}
                {profile?.bio && (
                  <p className="text-slate-700 text-center mb-4">{profile.bio}</p>
                )}

                <div className="space-y-3 flex-1">
                  {profile?.school && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                      <span>Studies at <strong className="text-slate-900">{profile.school}</strong></span>
                    </div>
                  )}

                  {(profile?.province_city || profile?.country) && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>From <strong className="text-slate-900">
                        {profile?.province_city && profile?.country
                          ? `${profile.province_city}, ${profile.country}`
                          : profile?.country || profile?.province_city}
                      </strong></span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>@{profile?.username || "username"}</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{user.email}</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Mathlete
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Statistics (wider like Facebook's main content) */}
          <div className="lg:col-span-3">
            {/* Statistics Card */}
            <StatisticsCard stats={stats} />
          </div>
        </div>

        {/* Full Width Row - Achievements */}
        <div>
          <AchievementBadges
            achievements={achievements}
            totalAvailable={totalAchievements || 15}
          />
        </div>
      </div>
    </div>
  );
}
