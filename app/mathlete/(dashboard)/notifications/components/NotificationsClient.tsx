"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { acceptTeamInvitation, rejectTeamInvitation } from "../../teams/actions";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl: string | null;
  relatedId: string | null;
  metadata: any;
  status: 'read' | 'unread';
  createdAt: string;
  readAt: string | null;
}

interface NotificationsClientProps {
  notifications: Notification[];
}

export default function NotificationsClient({ notifications }: NotificationsClientProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  // Debug logging
  console.log("NotificationsClient - Notifications:", notifications);

  // Count unread notifications
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  // Handle accepting team invitation
  const handleAcceptInvitation = async (notificationId: string, relatedId: string) => {
    setError("");
    setProcessingId(relatedId);

    const result = await acceptTeamInvitation(relatedId);

    if (result.success) {
      // Mark notification as read
      const supabase = (await import("@/utils/supabase/client")).createClient();
      await supabase
        .from("notifications")
        .update({ status: 'read' })
        .eq("id", notificationId);

      router.push(`/mathlete/teams/${result.teamId}`);
      router.refresh();
    } else {
      setError(result.error || "Failed to accept invitation");
      setProcessingId(null);
    }
  };

  // Handle rejecting team invitation
  const handleRejectInvitation = async (notificationId: string, relatedId: string) => {
    setError("");
    setProcessingId(relatedId);

    const result = await rejectTeamInvitation(relatedId);

    if (result.success) {
      // Mark notification as read
      const supabase = (await import("@/utils/supabase/client")).createClient();
      await supabase
        .from("notifications")
        .update({ status: 'read' })
        .eq("id", notificationId);

      router.refresh();
    } else {
      setError(result.error || "Failed to reject invitation");
    }
    setProcessingId(null);
  };

  // Handle marking notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    setError("");
    setProcessingId(notificationId);

    try {
      const supabase = (await import("@/utils/supabase/client")).createClient();
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ status: 'read' })
        .eq("id", notificationId);

      if (updateError) {
        setError("Failed to mark as read");
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error("Error marking as read:", err);
      setError("An unexpected error occurred");
    } finally {
      setProcessingId(null);
    }
  };

  // Helper function to format time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return diffMins <= 1 ? "Just now" : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    } else {
      return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'team_invitation_received':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'team_invitation_response':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/mathlete"
            className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[#25346A] dark:text-white">Notifications</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : "You're all caught up!"}
            {notifications.length > 0 && ` - ${notifications.length} total`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Unified Notifications List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {notifications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No notifications</h3>
              <p className="text-slate-600 dark:text-slate-400">You're all caught up! Check back later for updates.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-6 py-5 transition-all ${notification.status === 'read'
                    ? 'bg-slate-50/50 dark:bg-slate-700/30 opacity-75'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notification.status === 'read'
                      ? 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400'
                      : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                      }`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                              {notification.title}
                            </h3>
                            {notification.status === 'read' && (
                              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400">
                                Read
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-500">
                            {getTimeAgo(notification.createdAt)}
                          </p>
                        </div>

                        {/* Actions based on notification type */}
                        <div className="flex gap-2 flex-shrink-0">
                          {notification.type === 'team_invitation_received' && notification.status === 'unread' && notification.relatedId && (
                            <>
                              <button
                                onClick={() => handleRejectInvitation(notification.id, notification.relatedId!)}
                                disabled={processingId === notification.relatedId}
                                className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => handleAcceptInvitation(notification.id, notification.relatedId!)}
                                disabled={processingId === notification.relatedId}
                                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingId === notification.relatedId ? "Accepting..." : "Accept"}
                              </button>
                            </>
                          )}
                          {notification.type !== 'team_invitation_received' && notification.status === 'unread' && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              disabled={processingId === notification.id}
                              className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingId === notification.id ? "Marking..." : "Mark as Read"}
                            </button>
                          )}
                          {notification.status === 'read' && (
                            <span className="px-3 py-1.5 text-sm text-slate-400">
                              Read
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action URL if available */}
                      {notification.actionUrl && (
                        <Link
                          href={notification.actionUrl}
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
                        >
                          View Details
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
