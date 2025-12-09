import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function TeamsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch teams where user is a member
  const { data: teamMemberships, error: membershipsError } = await supabase
    .from("team_members")
    .select(`
      id,
      role,
      joined_at,
      teams (
        id,
        name,
        max_members,
        created_at,
        team_leader_id
      )
    `)
    .eq("mathlete_id", user.id)
    .order("joined_at", { ascending: false });

  if (membershipsError) {
    console.error("Error fetching teams:", membershipsError);
  }

  const teams = teamMemberships?.map(membership => ({
    ...membership.teams,
    userRole: membership.role,
    joinedAt: membership.joined_at
  })) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/mathlete"
                className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2 mb-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-[#25346A]">My Teams</h1>
              <p className="text-slate-600 mt-1">Manage your teams and collaborate with other mathletes</p>
            </div>
            <button className="px-6 py-3 bg-[#25346A] text-white font-semibold rounded-lg hover:bg-[#2A64d1] transition-colors">
              Create Team
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {teams.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No teams yet</h3>
            <p className="text-slate-600 mb-6">Create or join a team to participate in team-based competitions</p>
            <button className="px-6 py-3 bg-[#25346A] text-white font-semibold rounded-lg hover:bg-[#2A64d1] transition-colors">
              Create Your First Team
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team: any) => (
              <div key={team.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#25346A] mb-1">{team.name}</h3>
                    <div className="flex items-center gap-2">
                      {team.userRole === 'leader' && (
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Leader
                        </span>
                      )}
                      <span className="text-sm text-slate-500">
                        Joined {new Date(team.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Max {team.max_members} members</span>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <Link
                      href={`/mathlete/teams/${team.id}`}
                      className="block w-full text-center px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
