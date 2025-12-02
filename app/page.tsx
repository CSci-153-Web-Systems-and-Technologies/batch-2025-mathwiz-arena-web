import Link from "next/link";
import Image from "next/image";
import LoginButton from "@/components/LoginLogoutButton";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is logged in, check profile completion and redirect accordingly
  if (user) {
    // Check if profile is completed
    const { data: profile } = await supabase
      .from("profiles")
      .select("profile_completed, role")
      .eq("id", user.id)
      .single();

    // If profile is not completed, redirect to complete profile page
    if (!profile?.profile_completed) {
      redirect("/signup/complete-profile");
    }

    // If profile is completed, redirect to appropriate dashboard
    const role = profile.role || user.user_metadata?.role;
    if (role === "organizer") {
      redirect("/organizer");
    } else if (role === "mathlete") {
      redirect("/mathlete");
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-white via-sky-50 to-white dark:from-black dark:via-slate-900">
      <header className="w-full border-b bg-opacity-40 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <Image src="/icon.svg" alt="Mathwiz Logo" width={40} height={40} className="rounded-md" />
            <h1 className="text-xl font-semibold">Mathwiz</h1>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-4 text-sm text-muted-foreground">
              <Link href="#features" className="hover:underline">Features</Link>
              <Link href="#how" className="hover:underline">How it works</Link>
              <Link href="#faq" className="hover:underline">FAQ</Link>
            </nav>
            <LoginButton />
          </div>
        </div>
      </header>

      <section className="flex grow items-center">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">Mathwiz — compete, practice, and master math</h2>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-300">Join timed competitions, solve curated problem sets, and climb leaderboards — designed for students and teachers who love math.</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup" className="inline-flex items-center rounded-md bg-blue-600 px-5 py-3 text-white hover:bg-blue-700">Get started — Sign up</Link>
                <Link href="/login" className="inline-flex items-center rounded-md border border-slate-200 px-5 py-3 text-slate-700 hover:bg-slate-100">Log in</Link>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="text-xl font-semibold">Timed Contests</div>
                  <div className="mt-1 text-sm text-slate-500">Official and practice contests with automatic scoring.</div>
                </div>
                <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="text-xl font-semibold">Problem Library</div>
                  <div className="mt-1 text-sm text-slate-500">Thousands of problems across topics and levels.</div>
                </div>
                <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="text-xl font-semibold">Leaderboards</div>
                  <div className="mt-1 text-sm text-slate-500">Track progress and compare with peers.</div>
                </div>
              </div>
            </div>

            <div className="order-first lg:order-last">
              <div className="rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 p-8 text-white shadow-2xl">
                <h3 className="text-2xl font-bold">Upcoming Contest</h3>
                <p className="mt-3 text-sm opacity-90">Monthly Mathwiz Cup — Test your skills in algebra, geometry, combinatorics, and number theory.</p>
                <div className="mt-6 flex gap-3">
                  <Link href="/signup" className="rounded-md bg-white/20 px-4 py-2 text-white">Join the queue</Link>
                  <Link href="/login" className="rounded-md border border-white/30 px-4 py-2 text-white">Sign in</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-slate-500">© {new Date().getFullYear()} Mathwiz — built for math lovers.</div>
      </footer>
    </main>
  );
}
