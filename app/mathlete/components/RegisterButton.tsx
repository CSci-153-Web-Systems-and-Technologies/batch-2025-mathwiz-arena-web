"use client";

import { useState } from "react";
import { registerForCompetition, unregisterFromCompetition } from "../actions";

interface RegisterButtonProps {
  competitionId: string;
  competitionName: string;
  isRegistered?: boolean;
}

export default function RegisterButton({ competitionId, competitionName, isRegistered = false }: RegisterButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRegister = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await registerForCompetition(competitionId);

      if (result.success) {
        setMessage({ type: "success", text: result.message || "Successfully registered!" });
        // Reload the page after a short delay to show the updated status
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

  const handleUnregister = async () => {
    setIsLoading(true);
    setMessage(null);
    setShowConfirm(false);

    try {
      const result = await unregisterFromCompetition(competitionId);

      if (result.success) {
        setMessage({ type: "success", text: result.message || "Successfully unregistered!" });
        // Reload the page after a short delay to show the updated status
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage({ type: "error", text: result.error || "Unregister failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="flex flex-col items-end gap-2">
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={isLoading}
            className="rounded-lg bg-red-50 border border-red-200 px-6 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Withdraw
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleUnregister}
              disabled={isLoading}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Withdrawing..." : "Confirm"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isLoading}
              className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        )}
        {message && (
          <p
            className={`text-xs font-medium ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleRegister}
        disabled={isLoading}
        className="rounded-lg bg-[#25346A] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2A64d1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Registering..." : "Register Now"}
      </button>
      {message && (
        <p
          className={`text-xs font-medium ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
