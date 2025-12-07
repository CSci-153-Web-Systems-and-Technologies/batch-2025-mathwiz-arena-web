"use client";

import { useState } from "react";
import { registerForCompetition } from "../actions";

interface RegisterButtonProps {
  competitionId: string;
  competitionName: string;
}

export default function RegisterButton({ competitionId, competitionName }: RegisterButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
