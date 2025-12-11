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
      {/* Background Decor - Extremely subtle/Removed to ensure 'no gradient' feel */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-slate-50/50 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <header className="w-full fixed top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 transition-all duration-300">
        <div className="mx-auto max-w-7xl flex items-center justify-between p-4 lg:p-6">
          <div className="flex items-center gap-3 cursor-pointer">
            <Image src="/icon.svg" alt="Mathwiz Logo" width={32} height={32} className="rounded-md" />
            <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
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
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-slate-900 dark:bg-white mr-2"></span>
                The #1 Platform for Mathletes
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Compete, Practice, <br />
                Master Math
              </h1>

              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                Join timed competitions, solve curated problem sets, and climb leaderboards. Designed for students and teachers who love math.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-8 py-3 text-base font-semibold text-white hover:bg-slate-800 transition-all hover:-translate-y-0.5 shadow-lg shadow-slate-200 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 dark:shadow-none"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors duration-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700"
                >
                  Log in
                </Link>
              </div>

              {/* Feature Highlights - Simple & Clean */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800 mt-4">
                <div className="pt-6">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">Timed</div>
                  <div className="text-sm text-slate-500 font-medium mt-1">Contests</div>
                </div>
                <div className="pt-6">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">1000+</div>
                  <div className="text-sm text-slate-500 font-medium mt-1">Problems</div>
                </div>
                <div className="pt-6">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">Global</div>
                  <div className="text-sm text-slate-500 font-medium mt-1">Ranking</div>
                </div>
              </div>
            </div>

            {/* Right Card - Premium / No Gradient */}
            <div className="order-first lg:order-last relative animate-in fade-in slide-in-from-right-4 duration-1000 delay-200">
              <div className="relative rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                        </span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Upcoming</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Monthly Mathwiz Cup</h3>
                    </div>
                    <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold border border-slate-200 tracking-wider dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                      LIVE
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-700 transition-colors hover:border-slate-200">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Topic</div>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                        Algebra
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-700 transition-colors hover:border-slate-200">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Difficulty</div>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                        Mixed
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8">
                    Compete globally. Solve problems. Win badges. <br />
                    <span className="text-slate-400 dark:text-slate-500">Open to all skill levels.</span>
                  </p>

                  <Link
                    href="/signup"
                    className="flex w-full items-center justify-center rounded-xl bg-slate-900 text-white py-4 font-bold text-lg hover:bg-black hover:scale-[1.02] transition-all duration-200 shadow-xl shadow-slate-200/50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 dark:shadow-none"
                  >
                    Join the Queue
                  </Link>

                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:border-slate-900 dark:bg-blue-900 dark:text-blue-300">JD</div>
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-purple-50 flex items-center justify-center text-[10px] font-bold text-purple-600 dark:border-slate-900 dark:bg-purple-900 dark:text-purple-300">AS</div>
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-green-50 flex items-center justify-center text-[10px] font-bold text-green-600 dark:border-slate-900 dark:bg-green-900 dark:text-green-300">MR</div>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">1.2k+ Joined</span>
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Starts in 2d
                    </div>
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
