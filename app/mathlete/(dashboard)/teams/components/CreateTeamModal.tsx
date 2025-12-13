"use client";

import { useState } from "react";
import { createTeam } from "../actions";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTeamModal({ isOpen, onClose }: CreateTeamModalProps) {
  const [teamName, setTeamName] = useState("");
  const [maxMembers, setMaxMembers] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const result = await createTeam(teamName, maxMembers);

    if (result.success) {
      setSuccess("Team created successfully!");
      setTeamName("");
      setMaxMembers(4);
      setTimeout(() => {
        setSuccess("");
        onClose();
        window.location.reload();
      }, 1500);
    } else {
      setError(result.error || "Failed to create team");
    }

    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTeamName("");
      setMaxMembers(4);
      setError("");
      setSuccess("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Create New Team</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50 p-1"
          >
            <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="teamName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2">
              Team Name
            </label>
            <input
              type="text"
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              required
              minLength={3}
              maxLength={50}
              disabled={isSubmitting}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm sm:text-base"
            />
            <p className="mt-1 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">Minimum 3 characters, maximum 50 characters</p>
          </div>

          <div>
            <label htmlFor="maxMembers" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2">
              Maximum Members
            </label>
            <input
              type="number"
              id="maxMembers"
              min="2"
              max="10"
              value={maxMembers}
              onChange={(e) => setMaxMembers(parseInt(e.target.value) || 2)}
              disabled={isSubmitting}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm sm:text-base"
            />
            <p className="mt-1 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">Minimum 2, maximum 10 members</p>
          </div>

          {error && (
            <div className="p-2.5 sm:p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-2.5 sm:p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <p className="text-xs sm:text-sm text-green-700 dark:text-green-400">{success}</p>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 sm:py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || teamName.trim().length < 3}
              className="flex-1 px-4 py-2 sm:py-2.5 bg-[#25346A] text-white rounded-lg hover:bg-[#2A64d1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? "Creating..." : "Create Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
