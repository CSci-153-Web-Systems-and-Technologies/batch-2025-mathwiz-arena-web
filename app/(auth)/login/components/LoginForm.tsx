"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SignInWithGoogleButton from "./SignInWithGoogleButton";

export function LoginForm() {
  const [error] = useState<string | null>(null);

  return (
    <Card className="mx-auto max-w-md w-full shadow-xl shadow-blue-900/10 border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none overflow-hidden rounded-2xl">
      <CardHeader className="space-y-1 text-center pb-8 pt-8">
        <CardTitle className="text-3xl font-bold text-[#1B2559] dark:text-white">Welcome back</CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400 text-base">
          Sign in to your Mathwiz account
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <div className="grid gap-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-bold">Login failed</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          )}

          <SignInWithGoogleButton />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-[#1B2559] dark:text-blue-400 font-bold tracking-widest">Notice</span>
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 text-[#1B2559] px-4 py-3 rounded-xl text-sm flex items-start gap-3 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-bold">Google Sign-In Only</p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">Please use Google to sign in.</p>
            </div>
          </div>

          <div className="text-center text-sm">
            <span className="text-slate-500 dark:text-slate-400">Don&apos;t have an account? </span>
            <Link href="/signup" className="text-[#F49700] hover:text-orange-600 dark:text-[#F49700] dark:hover:text-orange-500 font-bold hover:underline transition-all">
              Sign up
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
