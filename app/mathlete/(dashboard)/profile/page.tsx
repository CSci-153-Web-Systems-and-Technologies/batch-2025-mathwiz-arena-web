import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProfileContent from "./components/ProfileContent";

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

  // Get ALL available achievements (for the detail view)
  const { data: allAchievementsData } = await supabase
    .from("achievements")
    .select("*")
    .eq("is_active", true)
    .order("requirement_value", { ascending: true });

  // Get total available achievements count
  const totalAchievements = allAchievementsData?.length || 0;

  // Format earned achievements for display
  const achievements = userAchievements?.map(ua => ({
    id: (ua.achievements as any)?.id || ua.id,
    name: (ua.achievements as any)?.name || "Unknown",
    description: (ua.achievements as any)?.description || "",
    icon: (ua.achievements as any)?.icon || "🏅",
    badge_color: (ua.achievements as any)?.badge_color || "blue",
    earned_at: ua.earned_at,
  })) || [];

  // Format all achievements for detail view
  const allAchievements = allAchievementsData?.map(a => ({
    id: a.id,
    name: a.name,
    description: a.description || "",
    icon: a.icon || "🏅",
    badge_color: a.badge_color || "blue",
    requirement_type: a.requirement_type || "unknown",
    requirement_value: a.requirement_value || 0,
    is_active: a.is_active,
  })) || [];

  return (
    <ProfileContent
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
      headerStats={headerStats}
      stats={stats}
      achievements={achievements}
      allAchievements={allAchievements}
      totalAchievements={totalAchievements}
      userEmail={user.email || ""}
    />
  );
}
