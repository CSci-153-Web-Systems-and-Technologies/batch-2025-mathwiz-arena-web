"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CreateTeamModal from "./CreateTeamModal";

interface Team {
  id: string;
  name: string;
  max_members: number;
  created_at: string;
  team_leader_id: string;
  userRole: string;
  joinedAt: string;
}

interface TeamsClientProps {
  teams: Team[];
}

export default function TeamsClient({ teams }: TeamsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#25346A] dark:text-white">My Teams</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your teams and collaborate with other mathletes</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-[#25346A] text-white font-semibold rounded-lg hover:bg-[#2A64d1] transition-colors"
            >
              Create Team
            </button>
          </div>

          {/* Teams Content */}
          {teams.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No teams yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Create or join a team to participate in team-based competitions</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-[#25346A] text-white font-semibold rounded-lg hover:bg-[#2A64d1] transition-colors"
              >
                Create Your First Team
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <div key={team.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#25346A] dark:text-white mb-1">{team.name}</h3>
                      <div className="flex items-center gap-2">
                        {team.userRole === 'leader' && (
                          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            Leader
                          </span>
                        )}
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          Joined {new Date(team.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Max {team.max_members} members</span>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => {
                          console.log('Navigating to team:', team.id);
                          router.push(`/mathlete/teams/${team.id}`);
                        }}
                        className="block w-full text-center px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateTeamModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
