import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signInWithGoogle } from "@/lib/auth-actions";

interface PageProps {
  searchParams: {
    role?: string;
  };
}

const GoogleRoleSelectionPage = ({ searchParams }: PageProps) => {
  const role = searchParams.role;

  // If role is selected, show confirmation and initiate OAuth
  if (role === "mathlete" || role === "organizer") {
    const roleLabel = role === "organizer" ? "Organizer" : "Mathlete";
    
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-sky-50 to-white dark:from-black dark:via-slate-900">
        <header className="w-full border-b bg-opacity-40 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl flex items-center justify-between p-6">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Image src="/icon.svg" alt="Mathwiz Logo" width={40} height={40} className="rounded-md" />
              <h1 className="text-xl font-semibold">Mathwiz</h1>
            </Link>
          </div>
        </header>
        <div className="flex grow items-center justify-center p-6">
          <Card className="mx-auto max-w-md w-full shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Continue with Google</CardTitle>
              <CardDescription>
                You're signing up as a <span className={`font-semibold ${role === "organizer" ? "text-[#f49700]" : "text-[#25346A]"}`}>{roleLabel}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={signInWithGoogle}>
                <input type="hidden" name="role" value={role} />
                <button
                  type="submit"
                  className={`w-full flex items-center justify-center gap-3 rounded-md px-4 py-3 font-medium text-white transition-colors ${
                    role === "organizer"
                      ? "bg-[#f49700] hover:bg-[#d68400]"
                      : "bg-[#25346A] hover:bg-[#1a2550]"
                  }`}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>
              </form>
              <div className="mt-4 text-center">
                <Link href="/signup/google-role" className="text-sm text-muted-foreground hover:underline">
                  ← Choose a different role
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show role selection
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-sky-50 to-white dark:from-black dark:via-slate-900">
      <header className="w-full border-b bg-opacity-40 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl flex items-center justify-between p-6">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image src="/icon.svg" alt="Mathwiz Logo" width={40} height={40} className="rounded-md" />
            <h1 className="text-xl font-semibold">Mathwiz</h1>
          </Link>
          <Link href="/login" className="text-sm text-muted-foreground hover:underline">
            Back to login
          </Link>
        </div>
      </header>
      <div className="flex grow items-center justify-center p-6">
        <Card className="mx-auto max-w-2xl w-full shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold">Sign in with Google</CardTitle>
            <CardDescription className="text-base">
              First, choose your role to continue with Google
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Link
                href="/signup/google-role?role=mathlete"
                className="group relative overflow-hidden rounded-lg border-2 border-slate-200 bg-white p-6 transition-all hover:border-[#25346A] hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="rounded-full bg-[#25346A] p-4">
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
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-[#25346A]">
                      Continue as Mathlete
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Compete and solve problems
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/signup/google-role?role=organizer"
                className="group relative overflow-hidden rounded-lg border-2 border-slate-200 bg-white p-6 transition-all hover:border-[#f49700] hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="rounded-full bg-[#f49700] p-4">
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
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-[#f49700]">
                      Continue as Organizer
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Create and manage contests
                    </p>
                  </div>
                </div>
              </Link>
            </div>
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Prefer email?{" "}
              <Link href="/signup" className="text-[#25346A] hover:underline font-medium">
                Sign up with email
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GoogleRoleSelectionPage;
