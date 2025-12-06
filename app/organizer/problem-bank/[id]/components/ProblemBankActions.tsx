"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

export default function ProblemBankActions({ problemBankId }: { problemBankId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("problem_banks")
        .delete()
        .eq("id", problemBankId);

      if (error) {
        console.error("Error deleting problem bank:", error);
        alert("Failed to delete problem bank. Please try again.");
        setIsDeleting(false);
        return;
      }

      router.push("/organizer/problem-bank");
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => router.push(`/organizer/problem-bank/${problemBankId}/edit`)}
        className="text-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit
      </Button>
      
      {!showDeleteConfirm ? (
        <Button
          variant="outline"
          onClick={() => setShowDeleteConfirm(true)}
          className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </Button>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-sm bg-red-600 text-white hover:bg-red-700 border-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : "Confirm Delete"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isDeleting}
            className="text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
