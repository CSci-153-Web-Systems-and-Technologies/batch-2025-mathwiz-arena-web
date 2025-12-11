import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import LeaderboardClient from "./LeaderboardClient";

interface PageProps {
    params: { id: string };
    searchParams: { attemptId?: string };
}

interface LeaderboardEntry {
    rank: number;
    mathlete_id: string;
    display_name: string;
    best_score: number;
    best_percentage: number;
    attempts_count: number;
    is_current_user: boolean;
}

export default async function LeaderboardPage({ params, searchParams }: PageProps) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch competition details
    const { data: competition, error: competitionError } = await supabase
        .from("competitions")
        .select("id, name")
        .eq("id", params.id)
        .single();

    if (competitionError || !competition) {
        notFound();
    }

    // Get total possible points
    const { data: allProblems } = await supabase
        .from("competition_problems")
        .select("points")
        .eq("competition_id", params.id);

    const totalPossiblePoints = allProblems?.reduce((sum, p) => sum + p.points, 0) || 0;

    // Get user's latest attempt if not provided
    let attemptId = searchParams.attemptId;
    if (!attemptId) {
        const { data: latestAttempt } = await supabase
            .from("competition_attempts")
            .select("id")
            .eq("competition_id", params.id)
            .eq("mathlete_id", user.id)
            .eq("is_completed", true)
            .order("ended_at", { ascending: false })
            .limit(1)
            .single();

        attemptId = latestAttempt?.id;
    }

    // Fetch ALL attempts for this competition server-side (bypasses RLS)
    const { data: attempts } = await supabase
        .from("competition_attempts")
        .select("mathlete_id, total_score, is_completed")
        .eq("competition_id", params.id);

    // Get unique mathlete IDs
    const mathleteIds = attempts ? Array.from(new Set(attempts.map(a => a.mathlete_id))) : [];

    // Fetch profiles for these mathletes
    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", mathleteIds.length > 0 ? mathleteIds : ['none']);

    // Create a map of profiles
    const profileMap: Record<string, string> = {};
    profiles?.forEach(p => {
        profileMap[p.id] = p.username || 'Unknown User';
    });

    // Group by mathlete and get best score
    const mathleteScores: Record<string, {
        mathlete_id: string;
        display_name: string;
        best_score: number;
        attempts_count: number;
    }> = {};

    attempts?.forEach((attempt) => {
        const id = attempt.mathlete_id;
        const displayName = profileMap[id] || 'Unknown User';

        if (!mathleteScores[id]) {
            mathleteScores[id] = {
                mathlete_id: id,
                display_name: displayName,
                best_score: attempt.total_score || 0,
                attempts_count: 1
            };
        } else {
            mathleteScores[id].best_score = Math.max(mathleteScores[id].best_score, attempt.total_score || 0);
            mathleteScores[id].attempts_count += 1;
        }
    });

    // Convert to array and sort by best score (descending)
    const leaderboardData: LeaderboardEntry[] = Object.values(mathleteScores)
        .sort((a, b) => b.best_score - a.best_score)
        .map((entry, index) => ({
            ...entry,
            rank: index + 1,
            best_percentage: totalPossiblePoints > 0
                ? Math.round((entry.best_score / totalPossiblePoints) * 100)
                : 0,
            is_current_user: entry.mathlete_id === user.id
        }));

    return (
        <LeaderboardClient
            competitionId={params.id}
            competitionName={competition.name}
            totalPossiblePoints={totalPossiblePoints}
            userId={user.id}
            attemptId={attemptId}
            initialLeaderboard={leaderboardData}
        />
    );
}
