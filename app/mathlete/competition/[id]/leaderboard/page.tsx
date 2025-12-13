import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import LeaderboardClient from "./LeaderboardClient";

interface PageProps {
    params: { id: string };
    searchParams: { attemptId?: string };
}

interface LeaderboardEntry {
    rank: number;
    mathlete_id: string;  // For individual, or team_id for team
    display_name: string;
    best_score: number;
    best_percentage: number;
    attempts_count: number;
    is_current_user: boolean;
    is_team?: boolean;
    team_members?: string[];
}

export default async function LeaderboardPage({ params, searchParams }: PageProps) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch competition details including participation_type
    const { data: competition, error: competitionError } = await supabase
        .from("competitions")
        .select("id, name, participation_type")
        .eq("id", params.id)
        .single();

    if (competitionError || !competition) {
        notFound();
    }

    const isTeamCompetition = competition.participation_type === "team";

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

    // Get user's team_id if this is a team competition
    let userTeamId: string | null = null;
    if (isTeamCompetition) {
        const { data: userRegistration } = await supabase
            .from("competition_registrations")
            .select("team_id")
            .eq("competition_id", params.id)
            .eq("mathlete_id", user.id)
            .eq("status", "registered")
            .single();

        userTeamId = userRegistration?.team_id || null;
    }

    // Fetch ALL attempts for this competition
    const { data: attempts } = await supabase
        .from("competition_attempts")
        .select("mathlete_id, total_score, is_completed, team_id")
        .eq("competition_id", params.id);

    let leaderboardData: LeaderboardEntry[] = [];

    if (isTeamCompetition) {
        // --- TEAM-BASED LEADERBOARD ---
        // Get all registrations to find team assignments
        const { data: registrations } = await supabase
            .from("competition_registrations")
            .select("mathlete_id, team_id")
            .eq("competition_id", params.id)
            .eq("status", "registered")
            .not("team_id", "is", null);

        // Create mathlete to team mapping
        const mathleteToTeam: Record<string, string> = {};
        registrations?.forEach(reg => {
            if (reg.team_id) {
                mathleteToTeam[reg.mathlete_id] = reg.team_id;
            }
        });

        // Get unique team IDs
        const teamIds = Array.from(new Set(Object.values(mathleteToTeam)));

        // Fetch team names
        const { data: teams } = await supabase
            .from("teams")
            .select("id, name")
            .in("id", teamIds.length > 0 ? teamIds : ['none']);

        const teamNameMap: Record<string, string> = {};
        teams?.forEach(t => {
            teamNameMap[t.id] = t.name;
        });

        // Get profiles for member names
        const mathleteIds = attempts ? Array.from(new Set(attempts.map(a => a.mathlete_id))) : [];
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, username")
            .in("id", mathleteIds.length > 0 ? mathleteIds : ['none']);

        const profileMap: Record<string, string> = {};
        profiles?.forEach(p => {
            profileMap[p.id] = p.username || 'Unknown';
        });

        // Group by mathlete first to get each person's best score
        const mathleteBestScores: Record<string, number> = {};
        attempts?.forEach(attempt => {
            const id = attempt.mathlete_id;
            const score = attempt.total_score || 0;
            if (!mathleteBestScores[id] || score > mathleteBestScores[id]) {
                mathleteBestScores[id] = score;
            }
        });

        // Now sum up team scores (best score from each member)
        const teamScores: Record<string, {
            team_id: string;
            team_name: string;
            total_score: number;
            member_count: number;
            members: string[];
        }> = {};

        Object.entries(mathleteToTeam).forEach(([mathleteId, teamId]) => {
            const memberScore = mathleteBestScores[mathleteId] || 0;
            const memberName = profileMap[mathleteId] || 'Unknown';

            if (!teamScores[teamId]) {
                teamScores[teamId] = {
                    team_id: teamId,
                    team_name: teamNameMap[teamId] || 'Unknown Team',
                    total_score: memberScore,
                    member_count: 1,
                    members: [memberName]
                };
            } else {
                teamScores[teamId].total_score += memberScore;
                teamScores[teamId].member_count += 1;
                teamScores[teamId].members.push(memberName);
            }
        });

        // Convert to leaderboard entries
        leaderboardData = Object.values(teamScores)
            .sort((a, b) => b.total_score - a.total_score)
            .map((entry, index) => ({
                rank: index + 1,
                mathlete_id: entry.team_id,
                display_name: entry.team_name,
                best_score: entry.total_score,
                best_percentage: totalPossiblePoints > 0
                    ? Math.round((entry.total_score / totalPossiblePoints) * 100)
                    : 0,
                attempts_count: entry.member_count,
                is_current_user: entry.team_id === userTeamId,
                is_team: true,
                team_members: entry.members
            }));

    } else {
        // --- INDIVIDUAL LEADERBOARD ---
        const mathleteIds = attempts ? Array.from(new Set(attempts.map(a => a.mathlete_id))) : [];

        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, username")
            .in("id", mathleteIds.length > 0 ? mathleteIds : ['none']);

        const profileMap: Record<string, string> = {};
        profiles?.forEach(p => {
            profileMap[p.id] = p.username || 'Unknown User';
        });

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

        leaderboardData = Object.values(mathleteScores)
            .sort((a, b) => b.best_score - a.best_score)
            .map((entry, index) => ({
                ...entry,
                rank: index + 1,
                best_percentage: totalPossiblePoints > 0
                    ? Math.round((entry.best_score / totalPossiblePoints) * 100)
                    : 0,
                is_current_user: entry.mathlete_id === user.id
            }));
    }

    return (
        <LeaderboardClient
            competitionId={params.id}
            competitionName={competition.name}
            totalPossiblePoints={totalPossiblePoints}
            userId={user.id}
            attemptId={attemptId}
            initialLeaderboard={leaderboardData}
            isTeamCompetition={isTeamCompetition}
        />
    );
}

