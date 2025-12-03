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
    <Card className="mx-auto max-w-md w-full shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-3xl font-bold">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your Mathwiz account with Google
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-semibold">Login failed</p>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <SignInWithGoogleButton />

          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
            <div className="flex items-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-semibold">Google Sign-In Only</p>
                <p className="mt-1">Email/password authentication is currently disabled. Please use Google to sign in.</p>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#25346A] hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
