"use client";

import { useState } from "react";
import CompetitionDetailsModal from "./CompetitionDetailsModal";

interface Competition {
  id: string;
  name: string;
  description: string | null;
  start_datetime: string;
  duration_minutes: number;
  participation_type: string;
  max_participants: number | null;
}

interface JoinButtonProps {
  competition: Competition;
  isRegistered: boolean;
  isLive: boolean;
}

export default function JoinButton({ competition, isRegistered, isLive }: JoinButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLive) {
    return (
      <button
        disabled
        className="rounded-lg bg-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-500 cursor-not-allowed"
      >
        In Progress
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors ${
          isRegistered
            ? "bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100"
            : "bg-[#25346A] text-white hover:bg-[#2A64d1]"
        }`}
      >
        {isRegistered ? "View Details" : "Join"}
      </button>

      <CompetitionDetailsModal
        competition={competition}
        isRegistered={isRegistered}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
