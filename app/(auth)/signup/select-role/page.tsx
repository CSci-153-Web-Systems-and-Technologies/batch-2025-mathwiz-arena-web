"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useFormStatus } from "react-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { saveUserRole } from "@/lib/auth-actions";

// Submit button component that shows loading state
function RoleButton({
  role,
  title,
  description,
  subtext,
  color,
  hoverColor,
  darkHoverColor,
  icon
}: {
  role: string;
  title: string;
  description: string;
  subtext: string;
  color: string;
  hoverColor: string;
  darkHoverColor: string;
  icon: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`group relative overflow-hidden rounded-lg border-2 border-slate-200 bg-white p-6 transition-all hover:border-${hoverColor} hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-${darkHoverColor} dark:hover:bg-slate-800 w-full text-left h-full disabled:opacity-70 disabled:cursor-not-allowed`}
      style={{
        borderColor: pending ? color : undefined,
      }}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div
          className={`rounded-full p-4 shadow-md transition-transform group-hover:scale-110 ${pending ? 'animate-pulse' : ''}`}
          style={{ backgroundColor: color }}
        >
          {pending ? (
            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : icon}
        </div>
        <div>
          <h3
            className={`text-xl font-semibold mb-2 text-slate-900 dark:text-white transition-colors`}
            style={{ color: pending ? color : undefined }}
          >
            {pending ? "Setting up..." : title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {pending ? "Please wait while we configure your account" : description}
          </p>
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500 mt-auto pt-2">
          {subtext}
        </div>
      </div>
    </button>
  );
}

const SelectRolePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-sky-50 to-white dark:from-black dark:via-slate-900">
      <header className="w-full border-b bg-opacity-40 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl flex items-center justify-between p-6">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image src="/icon.svg" alt="Mathwiz Logo" width={40} height={40} className="rounded-md" />
            <h1 className="text-xl font-semibold">Mathwiz</h1>
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
            Back to Home
          </Link>
        </div>
      </header>
      <div className="flex grow items-center justify-center p-6">
        <Card className="mx-auto max-w-2xl w-full shadow-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">Welcome to Mathwiz!</CardTitle>
            <CardDescription className="text-base text-slate-500 dark:text-slate-400">
              Choose your role to complete your account setup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <form action={saveUserRole}>
                <input type="hidden" name="role" value="mathlete" />
                <RoleButton
                  role="mathlete"
                  title="I'm a Mathlete"
                  description="Compete in math challenges, solve problems, and climb the leaderboards"
                  subtext="Perfect for students and math enthusiasts"
                  color="#25346A"
                  hoverColor="[#25346A]"
                  darkHoverColor="blue-400"
                  icon={
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
                  }
                />
              </form>

              <form action={saveUserRole}>
                <input type="hidden" name="role" value="organizer" />
                <RoleButton
                  role="organizer"
                  title="I'm an Organizer"
                  description="Create contests, manage participants, and host math competitions"
                  subtext="Perfect for teachers and competition hosts"
                  color="#f49700"
                  hoverColor="[#f49700]"
                  darkHoverColor="orange-400"
                  icon={
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
                  }
                />
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SelectRolePage;
