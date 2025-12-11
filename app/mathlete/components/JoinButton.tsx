"use client";

import { useState } from "react";
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
        className="rounded-lg bg-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-500 cursor-not-allowed"
      >
        In Progress
      </button>
    );
  }

  // Determine button text based on competition state
  const getButtonText = () => {
    if (isRegistered) {
      if (isScheduledLive && !isLiveCompetition) {
        return "Enter Competition";
      }
      return "View Details";
    }
    return "Join";
  };

  // Determine button style
  const getButtonStyle = () => {
    if (isRegistered) {
      if (isScheduledLive && !isLiveCompetition) {
        // Highlight for registered users during scheduled competition
        return "bg-green-600 text-white hover:bg-green-700";
      }
      return "bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100";
    }
    return "bg-[#25346A] text-white hover:bg-[#2A64d1]";
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors ${getButtonStyle()}`}
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
