"use client";

import { useState } from "react";
import { registerForCompetition, unregisterFromCompetition } from "../actions";

interface Competition {
  id: string;
  name: string;
  description: string | null;
  start_datetime: string;
  duration_minutes: number;
  participation_type: string;
  max_participants: number | null;
}

interface CompetitionDetailsModalProps {
  competition: Competition;
  isRegistered: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function CompetitionDetailsModal({
  competition,
  isRegistered,
  isOpen,
  onClose,
}: CompetitionDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);

  if (!isOpen) return null;

  const startTime = new Date(competition.start_datetime);
  const endTime = new Date(startTime.getTime() + competition.duration_minutes * 60 * 1000);
  const now = new Date();
  const isLive = now >= startTime && now < endTime;

  const handleRegister = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await registerForCompetition(competition.id);

      if (result.success) {
        setMessage({ type: "success", text: result.message || "Successfully registered!" });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage({ type: "error", text: result.error || "Registration failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await unregisterFromCompetition(competition.id);

      if (result.success) {
        setMessage({ type: "success", text: result.message || "Successfully withdrawn!" });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage({ type: "error", text: result.error || "Withdrawal failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
      setShowWithdrawConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#25346A] mb-2">{competition.name}</h2>
            <div className="flex items-center gap-2">
              {isLive && (
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Live Now
                </span>
              )}
              {isRegistered && !isLive && (
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  Registered
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Competition Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Description</h3>
              <p className="text-slate-600 leading-relaxed">
                {competition.description || "No description provided."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Start Time</h3>
                <p className="text-slate-600">
                  {startTime.toLocaleString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Duration</h3>
                <p className="text-slate-600">{competition.duration_minutes} minutes</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Participation Type</h3>
                <p className="text-slate-600 capitalize">{competition.participation_type}</p>
              </div>

              {competition.max_participants && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">Max Participants</h3>
                  <p className="text-slate-600">{competition.max_participants}</p>
                </div>
              )}
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            {isLive ? (
              <button
                disabled
                className="px-6 py-2.5 text-sm font-semibold text-slate-500 bg-slate-200 rounded-lg cursor-not-allowed"
              >
                Competition In Progress
              </button>
            ) : isRegistered ? (
              !showWithdrawConfirm ? (
                <button
                  onClick={() => setShowWithdrawConfirm(true)}
                  disabled={isLoading}
                  className="px-6 py-2.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  Withdraw Registration
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleWithdraw}
                    disabled={isLoading}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "Withdrawing..." : "Confirm Withdraw"}
                  </button>
                  <button
                    onClick={() => setShowWithdrawConfirm(false)}
                    disabled={isLoading}
                    className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )
            ) : (
              <button
                onClick={handleRegister}
                disabled={isLoading}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-[#25346A] hover:bg-[#2A64d1] rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? "Registering..." : "Register Now"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
