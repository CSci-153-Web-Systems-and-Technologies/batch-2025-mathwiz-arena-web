"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import InviteMemberModal from "../../components/InviteMemberModal";
import { leaveTeam, removeMember, deleteTeam } from "../../actions";
import MathleteSidebar from "@/app/mathlete/components/MathleteSidebar";

interface Team {
  id: string;
  name: string;
  max_members: number;
  created_at: string;
  team_leader_id: string;
}

interface Member {
  id: string;
  role: string;
  joinedAt: string;
  profile: {
    id: string;
    username: string;
    full_name: string;
  };
}

interface TeamDetailsClientProps {
  team: Team;
  membersList: Member[];
  currentMemberCount: number;
  isLeader: boolean;
  userId: string;
  notificationCount: number;
}

export default function TeamDetailsClient({ 
  team, 
  membersList, 
  currentMemberCount, 
  isLeader,
  userId,
  notificationCount
}: TeamDetailsClientProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLeaveTeam = async () => {
    setError("");
    setIsProcessing(true);

    const result = await leaveTeam(team.id);

    if (result.success) {
      router.push("/mathlete/teams");
      router.refresh();
    } else {
      setError(result.error || "Failed to leave team");
      setIsProcessing(false);
      setShowLeaveConfirm(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setError("");
    setIsProcessing(true);

    const result = await removeMember(team.id, memberId);

    if (result.success) {
      router.refresh();
      setShowRemoveConfirm(null);
    } else {
      setError(result.error || "Failed to remove member");
    }
    setIsProcessing(false);
  };

  const handleDeleteTeam = async () => {
    setError("");
    setIsProcessing(true);

    const result = await deleteTeam(team.id);

    if (result.success) {
      router.push("/mathlete/teams");
      router.refresh();
    } else {
      setError(result.error || "Failed to delete team");
      setIsProcessing(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className="flex min-h-screen bg-slate-50">
        <MathleteSidebar notificationCount={notificationCount} />
        
        <main className="flex-1 ml-64">
          {/* Header */}
          <div className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Link
                href="/mathlete/teams"
                className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2 mb-4"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Teams
              </Link>

              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-[#25346A] mb-2">{team.name}</h1>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>{currentMemberCount} / {team.max_members} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Created {new Date(team.created_at).toLocaleDateString()}</span>
                  </div>
                  {isLeader && (
                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      You are the Leader
                    </span>
                  )}
                </div>
              </div>

              {isLeader && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="px-6 py-3 bg-[#25346A] text-white font-semibold rounded-lg hover:bg-[#2A64d1] transition-colors"
                  >
                    Invite Members
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-6 py-3 border border-red-300 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete Team
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Team Members</h2>
              <p className="text-sm text-slate-600 mt-1">
                {currentMemberCount === team.max_members 
                  ? "Team is at full capacity" 
                  : `${team.max_members - currentMemberCount} spot${team.max_members - currentMemberCount !== 1 ? 's' : ''} available`}
              </p>
            </div>

            <div className="divide-y divide-slate-200">
              {membersList.map((member) => (
                <div key={member.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {member.profile?.full_name?.charAt(0).toUpperCase() || member.profile?.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">
                            {member.profile?.full_name || member.profile?.username || 'Unknown User'}
                          </h3>
                          {member.role === 'leader' && (
                            <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              Leader
                            </span>
                          )}
                          {member.profile?.id === userId && (
                            <span className="text-xs text-slate-500">(You)</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">
                          @{member.profile?.username || 'username'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Joined {new Date(member.joinedAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>

                    {isLeader && member.role !== 'leader' && (
                      <button 
                        onClick={() => setShowRemoveConfirm(member.profile?.id || "")}
                        className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {membersList.length === 0 && (
              <div className="px-6 py-12 text-center text-slate-500">
                <p>No members found</p>
              </div>
            )}
          </div>

          {/* Leave Team Button for non-leaders */}
          {!isLeader && (
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowLeaveConfirm(true)}
                className="px-6 py-3 border border-red-300 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors"
              >
                Leave Team
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
        </main>
      </div>

      <InviteMemberModal 
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        teamId={team.id}
        teamName={team.name}
      />

      {/* Leave Team Confirmation Dialog */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Leave Team?</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to leave <strong>{team.name}</strong>? You'll need to be invited again to rejoin.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                disabled={isProcessing}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveTeam}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? "Leaving..." : "Leave Team"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Dialog */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Remove Member?</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to remove this member from the team? They'll need to be invited again to rejoin.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRemoveConfirm(null)}
                disabled={isProcessing}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveMember(showRemoveConfirm)}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? "Removing..." : "Remove Member"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Team Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Team?</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete <strong>{team.name}</strong>? This action cannot be undone. All team members will be removed and any pending invitations will be cancelled.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isProcessing}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTeam}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? "Deleting..." : "Delete Team"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
