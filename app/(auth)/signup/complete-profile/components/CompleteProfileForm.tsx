"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeProfile } from "@/lib/auth-actions";

interface CompleteProfileFormProps {
  userId: string;
  role: "mathlete" | "organizer";
}

export default function CompleteProfileForm({
  userId,
  role,
}: CompleteProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("userId", userId);
    formData.append("role", role);

    try {
      const result = await completeProfile(formData);

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        // Small delay to ensure database updates propagate
        await new Promise(resolve => setTimeout(resolve, 500));

        // Use the logging-in page for smooth transition
        const targetDashboard = role === "organizer" ? "/organizer" : "/mathlete";
        const title = "Setting up account";
        const message = "Profile completed! Redirecting to your dashboard...";

        router.push(`/logging-in?next=${encodeURIComponent(targetDashboard)}&title=${encodeURIComponent(title)}&message=${encodeURIComponent(message)}`);

        // Force a hard refresh to clear any cached data
        router.refresh();
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Role Badge */}
      <div className="flex justify-center mb-6">
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold ${role === "organizer"
            ? "bg-[#f49700]/10 text-[#f49700] border-2 border-[#f49700] dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500"
            : "bg-[#25346A]/10 text-[#25346A] border-2 border-[#25346A] dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500"
            }`}
        >
          {role === "organizer" ? "🎯 Organizer" : "🎓 Mathlete"}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Username - Common for both roles */}
      <div>
        <Label htmlFor="username" className="text-slate-700 dark:text-slate-300">
          Username <span className="text-red-500">*</span>
        </Label>
        <Input
          id="username"
          name="username"
          type="text"
          required
          placeholder="Choose a unique username"
          minLength={3}
          maxLength={30}
          pattern="^[a-zA-Z0-9_-]+$"
          title="Username can only contain letters, numbers, underscores, and hyphens"
          className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          3-30 characters, letters, numbers, underscore, and hyphen only
        </p>
      </div>

      {/* School/Organization - Role dependent */}
      {role === "mathlete" ? (
        <div>
          <Label htmlFor="school" className="text-slate-700 dark:text-slate-300">
            School <span className="text-red-500">*</span>
          </Label>
          <Input
            id="school"
            name="school"
            type="text"
            required
            placeholder="Enter your school name"
            className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
          />
        </div>
      ) : (
        <div>
          <Label htmlFor="organization" className="text-slate-700 dark:text-slate-300">
            Organization/School <span className="text-red-500">*</span>
          </Label>
          <Input
            id="organization"
            name="organization"
            type="text"
            required
            placeholder="Enter your organization or school name"
            className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
          />
        </div>
      )}

      {/* Country */}
      <div>
        <Label htmlFor="country" className="text-slate-700 dark:text-slate-300">
          Country <span className="text-red-500">*</span>
        </Label>
        <Input
          id="country"
          name="country"
          type="text"
          required
          placeholder="Enter your country"
          className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
        />
      </div>

      {/* Province/City */}
      <div>
        <Label htmlFor="province_city" className="text-slate-700 dark:text-slate-300">
          Province/City <span className="text-red-500">*</span>
        </Label>
        <Input
          id="province_city"
          name="province_city"
          type="text"
          required
          placeholder="Enter your province or city"
          className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className={`w-full h-12 text-base font-bold tracking-wide transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${role === "organizer"
          ? "bg-gradient-to-r from-[#f49700] to-[#e68a00] hover:from-[#e68a00] hover:to-[#d68400] text-white shadow-orange-500/20"
          : "bg-gradient-to-r from-[#25346A] to-[#1E2B58] hover:from-[#1E2B58] hover:to-[#172144] text-white shadow-blue-900/20 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 dark:shadow-blue-900/40"
          }`}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Completing Profile...
          </span>
        ) : (
          "Complete Profile & Continue"
        )}
      </Button>

      <p className="text-xs text-center text-slate-500 dark:text-slate-400">
        By completing your profile, you agree to our Terms of Service and
        Privacy Policy.
      </p>
    </form>
  );
}
