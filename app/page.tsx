import Link from "next/link";
import Image from "next/image";
import LoginButton from "@/components/LoginLogoutButton";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is logged in, check profile completion and redirect accordingly
  if (user) {
    // Check if profile is completed
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("profile_completed, role")
      .eq("id", user.id)
      .maybeSingle();

    console.log('Landing page - User:', user.id);
    console.log('Landing page - Profile:', profile);
    console.log('Landing page - Profile error:', profileError);

    // If no profile exists, redirect to complete profile
    if (!profile) {
      redirect("/signup/complete-profile");
    }

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
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-white dark:bg-slate-950">
      {/* Background Decor - Very subtle */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-slate-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-50/50 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <header className="w-full fixed top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-all duration-300">
        <div className="mx-auto max-w-7xl flex items-center justify-between p-4 lg:p-6">
          <div className="flex items-center gap-3 cursor-pointer">
            <Image src="/icon.svg" alt="Mathwiz Logo" width={36} height={36} className="rounded-md" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              Mathwiz
            </span>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
              <Link href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</Link>
              <Link href="#how" className="hover:text-slate-900 dark:hover:text-white transition-colors">How it works</Link>
              <Link href="#faq" className="hover:text-slate-900 dark:hover:text-white transition-colors">FAQ</Link>
            </nav>
            <LoginButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex grow items-center pt-32 pb-20 relative z-10 px-6">
        <div className="mx-auto max-w-7xl w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                🚀 The future of math competition
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Compete, Practice, <br />
                Master Math
              </h1>

              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                Join timed competitions, solve curated problem sets, and climb leaderboards. Designed for students and teachers who simply love math.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-8 py-3 text-base font-semibold text-white hover:bg-slate-800 transition-colors duration-200 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-8 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors duration-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700"
                >
                  Log in
                </Link>
              </div>

              {/* Feature Highlights - Simple & Clean */}
              <div className="grid grid-cols-3 gap-6 pt-6">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">Timed</div>
                  <div className="text-sm text-slate-500">Official & practice contests</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">1000+</div>
                  <div className="text-sm text-slate-500">Curated math problems</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">Global</div>
                  <div className="text-sm text-slate-500">Live leaderboards</div>
                </div>
              </div>
            </div>

            {/* Right Card - Clean Dashboard Look */}
            <div className="order-first lg:order-last relative animate-in fade-in slide-in-from-right-4 duration-1000 delay-200">
              <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-500">
                {/* Minimal Header */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      Upcoming Contest
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Monthly Mathwiz Cup</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
                    LIVE
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700 text-center">
                      <div className="text-sm text-slate-500 font-medium">Topic</div>
                      <div className="font-semibold text-slate-900 dark:text-white mt-1">Algebra</div>
                    </div>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700 text-center">
                      <div className="text-sm text-slate-500 font-medium">Difficulty</div>
                      <div className="font-semibold text-slate-900 dark:text-white mt-1">Mixed</div>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Test your problem-solving skills against thousands of students worldwide. Unlock achievements and win exclusive badges.
                  </p>

                  <div className="pt-2">
                    <Link href="/signup" className="block w-full text-center rounded-lg bg-blue-600 text-white py-3 font-medium hover:bg-blue-700 transition-colors">
                      Join the Queue
                    </Link>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-5 h-5 rounded-full bg-slate-200 border border-white"></div>
                        ))}
                      </div>
                      <span>1.2k+ Joined</span>
                    </div>
                    <div>Starts in 2 days</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-8 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Mathwiz</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
