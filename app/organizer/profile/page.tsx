import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import OrganizerProfileContent from "./components/OrganizerProfileContent";

export default async function OrganizerProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify organizer role
  const { data: profile } = await supabase
    .from("profiles")
    .select(`
            id,
            full_name,
            username,
            avatar_url,
            cover_photo_url,
            organization,
            country,
            province_city,
            bio
        `)
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/error?message=Profile not found");
  }

  // Fetch organizer statistics
  const { data: competitions } = await supabase
    .from("competitions")
    .select(`
            id,
            name,
            status,
            start_datetime,
            duration_minutes,
            created_at
        `)
    .eq("organizer_id", user.id);

  const competitionIds = competitions?.map(c => c.id) || [];

  // Get participant counts
  let totalParticipants = 0;
  let participantsByCompetition: Record<string, number> = {};

  if (competitionIds.length > 0) {
    const { data: registrations } = await supabase
      .from("competition_registrations")
      .select("competition_id")
      .in("competition_id", competitionIds)
      .eq("status", "registered");

    if (registrations) {
      registrations.forEach(reg => {
        participantsByCompetition[reg.competition_id] = (participantsByCompetition[reg.competition_id] || 0) + 1;
        totalParticipants++;
      });
    }
  }

  // Get ratings
  let totalRatingSum = 0;
  let totalRatingCount = 0;
  let ratingsByCompetition: Record<string, { sum: number; count: number }> = {};

  if (competitionIds.length > 0) {
    const { data: ratings } = await supabase
      .from("competition_ratings")
      .select("competition_id, rating")
      .in("competition_id", competitionIds);

    if (ratings) {
      ratings.forEach(rat => {
        if (!ratingsByCompetition[rat.competition_id]) {
          ratingsByCompetition[rat.competition_id] = { sum: 0, count: 0 };
        }
        ratingsByCompetition[rat.competition_id].sum += rat.rating;
        ratingsByCompetition[rat.competition_id].count += 1;
        totalRatingSum += rat.rating;
        totalRatingCount++;
      });
    }
  }

  // Calculate statistics
  const totalCompetitions = competitions?.length || 0;
  const publishedCompetitions = competitions?.filter(c => c.status === "published").length || 0;
  const draftCompetitions = competitions?.filter(c => c.status === "draft").length || 0;

  // Find ended competitions
  const now = new Date();
  const endedCompetitions = competitions?.filter(c => {
    if (!c.start_datetime) return false;
    const startTime = new Date(c.start_datetime);
    const endTime = new Date(startTime.getTime() + c.duration_minutes * 60000);
    return now > endTime;
  }).length || 0;

  const averageRating = totalRatingCount > 0
    ? parseFloat((totalRatingSum / totalRatingCount).toFixed(1))
    : null;

  // Find top rated competition
  let topRatedCompetition: { name: string; rating: number } | null = null;
  let highestAvgRating = 0;

  Object.entries(ratingsByCompetition).forEach(([compId, data]) => {
    const avgRating = data.sum / data.count;
    if (avgRating > highestAvgRating) {
      highestAvgRating = avgRating;
      const comp = competitions?.find(c => c.id === compId);
      if (comp) {
        topRatedCompetition = { name: comp.name, rating: parseFloat(avgRating.toFixed(1)) };
      }
    }
  });

  // Find most popular competition
  let mostPopularCompetition: { name: string; participants: number } | null = null;
  let highestParticipants = 0;

  Object.entries(participantsByCompetition).forEach(([compId, count]) => {
    if (count > highestParticipants) {
      highestParticipants = count;
      const comp = competitions?.find(c => c.id === compId);
      if (comp) {
        mostPopularCompetition = { name: comp.name, participants: count };
      }
    }
  });

  // Header stats
  const headerStats = {
    competitionsCreated: totalCompetitions,
    totalParticipants,
    averageRating,
  };

  // Detailed stats
  const stats = {
    totalCompetitions,
    publishedCompetitions,
    draftCompetitions,
    endedCompetitions,
    totalParticipants,
    averageRating,
    topRatedCompetition,
    mostPopularCompetition,
    totalRatings: totalRatingCount,
  };

  return (
    <OrganizerProfileContent
      profile={profile}
      headerStats={headerStats}
      stats={stats}
      userEmail={user.email || ""}
    />
  );
}
