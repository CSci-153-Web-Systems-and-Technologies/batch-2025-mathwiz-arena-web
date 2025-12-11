import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function AdminCompetitionDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // User is guaranteed to be authenticated by the layout
    const userId = user!.id;

    // Fetch competition details (admins can view all)
    const { data: competition, error: competitionError } = await supabase
        .from("competitions")
        .select("*")
        .eq("id", params.id)
        .single();

    if (competitionError || !competition) {
        console.error("Competition fetch error:", competitionError);
        notFound();
    }

    // Check if admin owns this competition
    const isOwnCompetition = competition.organizer_id === userId;

    // Fetch organizer name if not own competition
    let organizerName = 'Unknown';
    if (!isOwnCompetition) {
        const { data: organizerProfile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", competition.organizer_id)
            .single();
        organizerName = organizerProfile?.username || 'Unknown';
    }

    // Fetch competition problems with problem details
    const { data: competitionProblems, error: problemsError } = await supabase
        .from("competition_problems")
        .select(`
      points,
      order_index,
      problems (
        id,
        question,
        difficulty,
        type,
        correct_answer
      )
    `)
        .eq("competition_id", params.id)
        .order("order_index", { ascending: true });

    if (problemsError) {
        console.error("Problems fetch error:", problemsError);
    }

    const problems = competitionProblems || [];

    // Calculate dates and duration
    const startDateTime = new Date(competition.start_datetime);
    const totalMinutes = competition.duration_minutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const endDateTime = new Date(startDateTime.getTime() + totalMinutes * 60000);

    // Helper functions
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "easy":
                return "bg-green-50 text-green-700 border-green-200";
            case "average":
                return "bg-yellow-50 text-yellow-700 border-yellow-200";
            case "difficult":
                return "bg-red-50 text-red-700 border-red-200";
            default:
                return "bg-slate-50 text-slate-700 border-slate-200";
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "multiple_choice":
                return "Multiple Choice";
            case "identification":
                return "Identification";
            case "true_false":
                return "True/False";
            default:
                return type;
        }
    };

    const statusColors = {
        draft: "bg-slate-100 text-slate-700",
        published: "bg-blue-100 text-blue-700",
        ongoing: "bg-green-100 text-green-700",
        completed: "bg-gray-100 text-gray-700",
    };

    const statusColor = statusColors[competition.status as keyof typeof statusColors] || statusColors.draft;

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/admin/competition"
                                className="text-slate-600 hover:text-purple-600 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold text-slate-800">Competition Details</h2>
                                    {!isOwnCompetition && (
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full">
                                            Read-Only
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                                        {competition.status.charAt(0).toUpperCase() + competition.status.slice(1)}
                                    </span>
                                    {!isOwnCompetition && (
                                        <span className="text-sm text-slate-500">
                                            By: <span className="text-purple-600 font-medium">{organizerName}</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {isOwnCompetition && competition.status === "draft" && (
                            <Link
                                href={`/admin/competition/create?edit=${competition.id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Competition
                            </Link>
                        )}
                    </div>

                    {/* Read-only notice for organizer-created competitions */}
                    {!isOwnCompetition && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-purple-700 text-sm flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>This competition was created by an organizer. You have read-only access.</span>
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="bg-white border border-slate-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Basic Information</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-slate-600">Competition Name</p>
                                <p className="font-medium text-slate-800">{competition.name}</p>
                            </div>
                            {competition.description && (
                                <div>
                                    <p className="text-sm text-slate-600">Description</p>
                                    <p className="text-slate-800">{competition.description}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-600">Start Date & Time</p>
                                    <p className="font-medium text-slate-800">
                                        {startDateTime.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">End Date & Time</p>
                                    <p className="font-medium text-slate-800">
                                        {endDateTime.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Duration</p>
                                <p className="font-medium text-slate-800">
                                    {hours > 0 && `${hours} hour${hours !== 1 ? 's' : ''}`}
                                    {hours > 0 && minutes > 0 && ' '}
                                    {minutes > 0 && `${minutes} minute${minutes !== 1 ? 's' : ''}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Participation Settings */}
                    <div className="bg-white border border-slate-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Participation Settings</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-slate-600">Participation Type</p>
                                <p className="font-medium text-slate-800 capitalize">{competition.participation_type}</p>
                            </div>
                            {competition.participation_type === "individual" ? (
                                <div>
                                    <p className="text-sm text-slate-600">Maximum Participants</p>
                                    <p className="font-medium text-slate-800">
                                        {competition.max_participants ? competition.max_participants : "Unlimited"}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <p className="text-sm text-slate-600">Maximum Team Members</p>
                                        <p className="font-medium text-slate-800">{competition.max_team_members}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600">Maximum Teams</p>
                                        <p className="font-medium text-slate-800">
                                            {competition.max_teams ? competition.max_teams : "Unlimited"}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Point System */}
                    <div className="bg-white border border-slate-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Point System</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-slate-600">Point Assignment Method</p>
                                <p className="font-medium text-slate-800">
                                    {competition.point_system_type === "auto_level" ? "Auto-Level Points" : "Manual Points"}
                                </p>
                            </div>
                            {competition.point_system_type === "auto_level" && (
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-600">Easy</p>
                                        <p className="font-medium text-green-700">{competition.easy_points} points</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600">Average</p>
                                        <p className="font-medium text-yellow-700">{competition.average_points} points</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600">Difficult</p>
                                        <p className="font-medium text-red-700">{competition.difficult_points} points</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Problems */}
                    <div className="bg-white border border-slate-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">
                            Problems ({problems.length})
                        </h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {problems.map((cp: any, index: number) => (
                                <div key={cp.problems.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                    <div className="flex-shrink-0 w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium text-slate-700">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded border capitalize ${getDifficultyColor(cp.problems.difficulty)}`}>
                                                {cp.problems.difficulty}
                                            </span>
                                            <span className="text-xs text-slate-500">{getTypeLabel(cp.problems.type)}</span>
                                        </div>
                                        <p className="text-sm text-slate-800 mb-1">{cp.problems.question}</p>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-slate-600 font-medium">Answer:</span>
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                                                {cp.problems.correct_answer}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 text-sm font-semibold text-purple-600">
                                        {cp.points} pts
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-medium text-slate-700">Total Points</p>
                                <p className="text-lg font-bold text-purple-600">
                                    {problems.reduce((sum: number, cp: any) => sum + (cp.points || 0), 0)} points
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Back Button */}
                    <div className="flex justify-center pt-4">
                        <Link
                            href="/admin/competition"
                            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Competitions
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
