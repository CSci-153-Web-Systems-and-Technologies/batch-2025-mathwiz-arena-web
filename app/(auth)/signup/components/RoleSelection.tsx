import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signInWithGoogle } from "@/lib/auth-actions";

export function RoleSelection() {
  return (
    <Card className="mx-auto max-w-lg w-full shadow-xl shadow-blue-900/10 border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none overflow-hidden rounded-xl sm:rounded-2xl">
      <CardHeader className="space-y-1 text-center pb-6 sm:pb-8 pt-6 sm:pt-8 px-4 sm:px-6">
        <CardTitle className="text-2xl sm:text-3xl font-bold text-[#1B2559] dark:text-white">Join Mathwiz</CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
          Sign in with Google to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-8 pb-6 sm:pb-8">
        <div className="grid gap-4 sm:gap-6">
          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="w-full h-11 sm:h-12 rounded-xl text-sm sm:text-base bg-[#F49700] text-white hover:bg-orange-600 border-transparent shadow-md shadow-orange-900/10 font-medium transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-[#1B2559] dark:text-blue-400 font-bold tracking-widest">Notice</span>
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 text-[#1B2559] px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm flex items-start gap-2 sm:gap-3 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5 text-blue-500"
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
              <p className="font-bold">Choose Your Role</p>
              <p className="mt-0.5 sm:mt-1 text-slate-600 dark:text-slate-300">After signing in, you'll select whether you're a Mathlete or Organizer.</p>
            </div>
          </div>

          <div className="text-center text-xs sm:text-sm">
            <span className="text-slate-500 dark:text-slate-400">Already have an account? </span>
            <Link href="/login" className="text-[#F49700] hover:text-orange-600 dark:text-[#F49700] dark:hover:text-orange-500 font-bold hover:underline transition-all">
              Sign in
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

