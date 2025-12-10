"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { acceptTeamInvitation, rejectTeamInvitation, markResponseAsRead } from "../../teams/actions";

interface Invitation {
  id: string;
  createdAt: string;
  status: string;
  team: {
    id: string;
    name: string;
    max_members: number;
  };
  inviter: {
    id: string;
    username: string;
    full_name: string;
  };
}

interface Response {
  id: string;
  createdAt: string;
  respondedAt: string;
  status: string;
  team: {
    id: string;
    name: string;
    max_members: number;
  };
  invitee: {
    id: string;
    username: string;
    full_name: string;
  };
}

interface NotificationsClientProps {
  invitations: Invitation[];
  responses: Response[];
}

export default function NotificationsClient({ invitations, responses }: NotificationsClientProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAccept = async (invitationId: string) => {
    setError("");
    setProcessingId(invitationId);

    const result = await acceptTeamInvitation(invitationId);

    if (result.success) {
      router.push(`/mathlete/teams/${result.teamId}`);
      router.refresh();
    } else {
      setError(result.error || "Failed to accept invitation");
      setProcessingId(null);
    }
  };

  const handleReject = async (invitationId: string) => {
    setError("");
    setProcessingId(invitationId);

    const result = await rejectTeamInvitation(invitationId);

    if (result.success) {
      router.refresh();
    } else {
      setError(result.error || "Failed to reject invitation");
    }
    setProcessingId(null);
  };

  const handleDismissResponse = async (invitationId: string) => {
    const result = await markResponseAsRead(invitationId);
    if (result.success) {
      router.refresh();
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Link
                href="/mathlete"
                className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2 mb-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-[#25346A]">Notifications</h1>
              <p className="text-slate-600 mt-1">Stay updated with your team invitations and activities</p>
            </div>
          </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Team Invitations */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Team Invitations</h2>
            <p className="text-sm text-slate-600 mt-1">
              {invitations.length === 0 
                ? "No pending invitations" 
                : `${invitations.length} pending invitation${invitations.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {invitations.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No notifications</h3>
              <p className="text-slate-600">You're all caught up! Check back later for new team invitations.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="px-6 py-5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {invitation.team.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{invitation.team.name}</h3>
                          <p className="text-sm text-slate-600">
                            Invited by {invitation.inviter.full_name || invitation.inviter.username}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">
                        {new Date(invitation.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(invitation.id)}
                        disabled={processingId === invitation.id}
                        className="px-4 py-2 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAccept(invitation.id)}
                        disabled={processingId === invitation.id}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === invitation.id ? "Accepting..." : "Accept"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invitation Responses */}
        {responses.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Invitation Responses</h2>
              <p className="text-sm text-slate-600 mt-1">
                {responses.length} new response{responses.length !== 1 ? 's' : ''} to your invitations
              </p>
            </div>

            <div className="divide-y divide-slate-200">
              {responses.map((response) => (
                <div key={response.id} className="px-6 py-5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {response.invitee.full_name?.charAt(0).toUpperCase() || response.invitee.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">
                              {response.invitee.full_name || response.invitee.username}
                            </h3>
                            {response.status === "accepted" ? (
                              <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Accepted
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                Declined
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600">
                            {response.status === "accepted" 
                              ? `Joined your team "${response.team.name}"` 
                              : `Declined your invitation to "${response.team.name}"`}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(response.respondedAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDismissResponse(response.id)}
                      className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
