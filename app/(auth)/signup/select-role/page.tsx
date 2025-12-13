"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { saveUserRole } from "@/lib/auth-actions";

const SelectRolePage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingRole, setSubmittingRole] = useState<string | null>(null);
  const mathleteFormRef = useRef<HTMLFormElement>(null);
  const organizerFormRef = useRef<HTMLFormElement>(null);

  const handleRoleClick = async (role: string) => {
    // Prevent multiple submissions
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmittingRole(role);

    // Small delay to ensure UI updates before form submission
    await new Promise(resolve => setTimeout(resolve, 50));

    // Submit the appropriate form
    const formData = new FormData();
    formData.append("role", role);

    try {
      await saveUserRole(formData);
    } catch (error) {
      console.error("Error saving role:", error);
      // Reset state on error so user can try again
      setIsSubmitting(false);
      setSubmittingRole(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-sky-50 to-white dark:from-black dark:via-slate-900">
      <header className="w-full border-b bg-opacity-40 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl flex items-center justify-between p-6">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image src="/icon.svg" alt="Mathwiz Logo" width={40} height={40} className="rounded-md" />
            <h1 className="text-xl font-semibold">Mathwiz</h1>
          </Link>
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${isSubmitting ? 'pointer-events-none text-slate-300 dark:text-slate-600' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
            onClick={(e) => isSubmitting && e.preventDefault()}
          >
            Back to Home
          </Link>
        </div>
      </header>
      <div className="flex grow items-center justify-center p-6">
        <Card className="mx-auto max-w-2xl w-full shadow-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">Welcome to Mathwiz!</CardTitle>
            <CardDescription className="text-base text-slate-500 dark:text-slate-400">
              {isSubmitting
                ? `Setting up your ${submittingRole} account...`
                : "Choose your role to complete your account setup"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Mathlete Button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleRoleClick("mathlete")}
                className={`group relative overflow-hidden rounded-lg border-2 p-6 transition-all w-full text-left h-full
                  ${isSubmitting && submittingRole !== "mathlete"
                    ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-40 cursor-not-allowed grayscale'
                    : isSubmitting && submittingRole === "mathlete"
                      ? 'bg-white dark:bg-slate-800 border-[#25346A] dark:border-blue-400 shadow-lg shadow-blue-500/20 dark:shadow-blue-400/20 cursor-wait'
                      : 'bg-white dark:bg-slate-800/50 border-slate-200 hover:border-[#25346A] hover:shadow-lg dark:border-slate-700 dark:hover:border-blue-400 dark:hover:bg-slate-800 cursor-pointer'
                  }
                `}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div
                    className={`rounded-full p-4 shadow-md transition-transform 
                      ${!isSubmitting ? 'group-hover:scale-110' : ''} 
                      ${submittingRole === "mathlete" ? 'animate-pulse bg-[#25346A] dark:bg-blue-500' : 'bg-[#25346A]'}
                      ${isSubmitting && submittingRole !== "mathlete" ? 'bg-slate-400 dark:bg-slate-600' : ''}
                    `}
                  >
                    {submittingRole === "mathlete" ? (
                      <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-semibold mb-2 transition-colors
                        ${submittingRole === "mathlete"
                          ? 'text-[#25346A] dark:text-blue-400'
                          : isSubmitting
                            ? 'text-slate-300 dark:text-slate-600'
                            : 'text-slate-900 dark:text-white group-hover:text-[#25346A] dark:group-hover:text-blue-400'
                        }
                      `}
                    >
                      {submittingRole === "mathlete" ? "Setting up..." : "I'm a Mathlete"}
                    </h3>
                    <p className={`text-sm ${isSubmitting && submittingRole !== "mathlete" ? 'text-slate-400 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'}`}>
                      {submittingRole === "mathlete"
                        ? "Please wait while we configure your account"
                        : "Compete in math challenges, solve problems, and climb the leaderboards"
                      }
                    </p>
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-auto pt-2">
                    Perfect for students and math enthusiasts
                  </div>
                </div>
              </button>

              {/* Organizer Button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleRoleClick("organizer")}
                className={`group relative overflow-hidden rounded-lg border-2 p-6 transition-all w-full text-left h-full
                  ${isSubmitting && submittingRole !== "organizer"
                    ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-40 cursor-not-allowed grayscale'
                    : isSubmitting && submittingRole === "organizer"
                      ? 'bg-white dark:bg-slate-800 border-[#f49700] dark:border-orange-400 shadow-lg shadow-orange-500/20 dark:shadow-orange-400/20 cursor-wait'
                      : 'bg-white dark:bg-slate-800/50 border-slate-200 hover:border-[#f49700] hover:shadow-lg dark:border-slate-700 dark:hover:border-orange-400 dark:hover:bg-slate-800 cursor-pointer'
                  }
                `}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div
                    className={`rounded-full p-4 shadow-md transition-transform 
                      ${!isSubmitting ? 'group-hover:scale-110' : ''} 
                      ${submittingRole === "organizer" ? 'animate-pulse bg-[#f49700] dark:bg-orange-500' : 'bg-[#f49700]'}
                      ${isSubmitting && submittingRole !== "organizer" ? 'bg-slate-400 dark:bg-slate-600' : ''}
                    `}
                  >
                    {submittingRole === "organizer" ? (
                      <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3
                      className={`text-xl font-semibold mb-2 transition-colors
                        ${submittingRole === "organizer"
                          ? 'text-[#f49700] dark:text-orange-400'
                          : isSubmitting
                            ? 'text-slate-300 dark:text-slate-600'
                            : 'text-slate-900 dark:text-white group-hover:text-[#f49700] dark:group-hover:text-orange-400'
                        }
                      `}
                    >
                      {submittingRole === "organizer" ? "Setting up..." : "I'm an Organizer"}
                    </h3>
                    <p className={`text-sm ${isSubmitting && submittingRole !== "organizer" ? 'text-slate-400 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'}`}>
                      {submittingRole === "organizer"
                        ? "Please wait while we configure your account"
                        : "Create contests, manage participants, and host math competitions"
                      }
                    </p>
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-auto pt-2">
                    Perfect for teachers and competition hosts
                  </div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SelectRolePage;
