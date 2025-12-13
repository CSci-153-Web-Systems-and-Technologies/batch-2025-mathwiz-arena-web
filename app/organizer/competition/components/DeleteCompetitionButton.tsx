"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { deleteCompetition } from "../actions";
import { Button } from "@/components/ui/button";

type Props = {
  competitionId: string;
  competitionName: string;
};

export default function DeleteCompetitionButton({ competitionId, competitionName }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure we only render portal on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    const result = await deleteCompetition(competitionId);

    if (!result.success) {
      setError(result.error || "Failed to delete competition");
      setIsDeleting(false);
      setShowConfirm(false);
    }
    // On success, the page will revalidate automatically
  };

  const modal = showConfirm ? (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[9999] p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-md p-5 sm:p-6 border-t sm:border border-slate-200 dark:border-slate-700">
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center mb-4">
          <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 mb-5 sm:mb-4">
          <div className="flex-shrink-0 w-14 h-14 sm:w-12 sm:h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
              Delete Competition
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              Are you sure you want to delete <span className="font-semibold text-slate-800 dark:text-white break-words">{competitionName}</span>?
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This action cannot be undone. All associated problems and data will be permanently removed.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowConfirm(false);
              setError(null);
            }}
            disabled={isDeleting}
            className="w-full sm:w-auto font-medium"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-medium"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : (
              "Delete Competition"
            )}
          </Button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center justify-center flex-1 min-w-[55px] gap-1 px-2 py-2 text-xs font-medium text-red-600 dark:text-red-400 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span>Delete</span>
      </button>
      {mounted && modal && createPortal(modal, document.body)}
    </>
  );
}
