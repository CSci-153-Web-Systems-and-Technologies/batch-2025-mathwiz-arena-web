"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";

export default function CreateProblemBankForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to create a problem bank");
        setIsLoading(false);
        return;
      }

      // Validate form
      if (!formData.title.trim()) {
        setError("Please enter a title");
        setIsLoading(false);
        return;
      }

      // Create problem bank
      const { data, error: insertError } = await supabase
        .from("problem_banks")
        .insert([
          {
            organizer_id: user.id,
            title: formData.title.trim(),
            description: formData.description.trim() || null,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error("Error creating problem bank:", insertError);
        const errorMessage = insertError.message || insertError.hint || "Unknown error occurred";
        setError(`Failed to create problem bank: ${errorMessage}`);
        setIsLoading(false);
        return;
      }

      // Redirect to the newly created problem bank
      router.push(`/organizer/problem-bank/${data.id}`);
    } catch (err: any) {
      console.error("Unexpected error:", err);
      const errorMessage = err?.message || "Unknown error occurred";
      setError(`An unexpected error occurred: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title" className="text-slate-700 font-medium">
          Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          type="text"
          placeholder="e.g., Algebra Problems Set 1"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full"
          required
          disabled={isLoading}
        />
        <p className="text-sm text-slate-500">Give your problem bank a descriptive title</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-slate-700 font-medium">
          Description
        </Label>
        <textarea
          id="description"
          placeholder="Briefly describe the types of problems in this bank..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full min-h-[120px] px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f49700] focus:border-transparent resize-none"
          disabled={isLoading}
        />
        <p className="text-sm text-slate-500">Optional: Add more details about this problem bank</p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-[#f49700] hover:bg-[#d68400] text-white font-medium px-6"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Create Problem Bank
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/organizer/problem-bank")}
          disabled={isLoading}
          className="font-medium"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
