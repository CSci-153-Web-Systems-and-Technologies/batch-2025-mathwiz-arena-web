"use client";

import { useState } from "react";
import Link from "next/link";
import CompetitionDetailsModal from "./CompetitionDetailsModal";

interface Competition {
  id: string;
  name: string;
  description: string | null;
  start_datetime: string | null;
  duration_minutes: number;
  participation_type: string;
  max_participants: number | null;
  competition_mode?: string | null;
  max_attempts?: number | null;
}

interface JoinButtonProps {
  competition: Competition;
  isRegistered: boolean;
  isScheduledLive: boolean; // True if a scheduled competition is currently in progress
  isLiveCompetition: boolean; // True if this is a Live mode competition
}

export default function JoinButton({
  competition,
  isRegistered,
  isScheduledLive,
  isLiveCompetition
}: JoinButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // For scheduled competitions in progress:
  // - Registered users can view details and enter
  // - Non-registered users see "In Progress" (too late to register)
  if (isScheduledLive && !isLiveCompetition && !isRegistered) {
    return (
      <button
        disabled
        className="rounded-lg bg-slate-200 dark:bg-slate-700 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed"
      >
        In Progress
      </button>
    );
  }

  // For Live competitions with registered users - show Start button next to View Details
  if (isLiveCompetition && isRegistered) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={`/mathlete/competition/${competition.id}`}
          className="flex-1 sm:flex-none rounded-lg px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-colors bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Enter
        </Link>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex-1 sm:flex-none rounded-lg px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-colors bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50"
        >
          View Details
        </button>

        <CompetitionDetailsModal
          competition={competition}
          isRegistered={isRegistered}
          isLiveCompetition={isLiveCompetition}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    );
  }

  // For scheduled competitions in progress with registered users - show Enter button
  if (isScheduledLive && !isLiveCompetition && isRegistered) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={`/mathlete/competition/${competition.id}`}
          className="flex-1 sm:flex-none rounded-lg px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-colors bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Enter
        </Link>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex-1 sm:flex-none rounded-lg px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-colors bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50"
        >
          View Details
        </button>

        <CompetitionDetailsModal
          competition={competition}
          isRegistered={isRegistered}
          isLiveCompetition={isLiveCompetition}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    );
  }

  // Default: Show single button (Join for unregistered, View Details for registered)
  const getButtonText = () => {
    if (isRegistered) {
      return "View Details";
    }
    return "Join";
  };

  const getButtonStyle = () => {
    if (isRegistered) {
      return "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50";
    }
    return "bg-[#25346A] text-white hover:bg-[#2A64d1]";
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`rounded-lg px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-colors ${getButtonStyle()}`}
      >
        {getButtonText()}
      </button>

      <CompetitionDetailsModal
        competition={competition}
        isRegistered={isRegistered}
        isLiveCompetition={isLiveCompetition}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
