import Link from "next/link";
import Image from "next/image";
import LoginButton from "@/components/LoginLogoutButton";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("profile_completed, role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || !profile.profile_completed) {
      redirect("/signup/complete-profile");
    }

    const role = profile.role || user.user_metadata?.role;
    if (role === "organizer") {
      redirect("/organizer");
    } else if (role === "mathlete") {
      redirect("/mathlete");
    }
  }

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-white dark:bg-slate-950">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-50/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <header className="w-full fixed top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 transition-all duration-300">
        <div className="mx-auto max-w-7xl flex items-center justify-between p-3 lg:p-4">
          <div className="flex items-center gap-3 cursor-pointer">
            <Image src="/icon.svg" alt="Mathwiz Logo" width={32} height={32} className="rounded-md" />
            <span className="text-xl font-bold text-[#1B2559] dark:text-white tracking-tight">
              Mathwiz
            </span>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
              <Link href="#features" className="hover:text-[#1B2559] dark:hover:text-white transition-colors">Features</Link>
              <Link href="#how" className="hover:text-[#1B2559] dark:hover:text-white transition-colors">How it works</Link>
              <Link href="#faq" className="hover:text-[#1B2559] dark:hover:text-white transition-colors">FAQ</Link>
            </nav>
            <LoginButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex grow items-center pt-24 pb-4 relative z-10 px-6">
        <div className="mx-auto max-w-7xl w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50/50 px-3 py-1 text-sm font-medium text-[#1B2559] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-[#F49700] mr-2"></span>
                The #1 Platform for Mathletes
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-[#1B2559] dark:text-white leading-[1.1]">
                Compete, Practice, <br />
                Master Math
              </h1>

              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                Join timed competitions, solve curated problem sets, and climb leaderboards. Designed for students and teachers who love math.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-xl bg-[#1B2559] px-8 py-3.5 text-base font-bold text-white hover:bg-[#111c44] transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-900/20 dark:bg-white dark:text-[#1B2559] dark:hover:bg-slate-200"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-base font-bold text-[#1B2559] hover:bg-slate-50 hover:border-[#1B2559]/30 transition-colors duration-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700"
                >
                  Log in
                </Link>
              </div>

              {/* Feature Highlights - Restored Size but Tight Spacing */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-300 transition-all duration-200 dark:bg-slate-900 dark:border-slate-700/60 group">
                  <div className="text-3xl font-bold text-[#F49700] mb-1 group-hover:scale-105 transition-transform">Timed</div>
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Contests</div>
                  <div className="text-xs text-slate-500 mt-1 dark:text-slate-500">Weekly challenges</div>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-300 transition-all duration-200 dark:bg-slate-900 dark:border-slate-700/60 group">
                  <div className="text-3xl font-bold text-[#F49700] mb-1 group-hover:scale-105 transition-transform">1000+</div>
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Problems</div>
                  <div className="text-xs text-slate-500 mt-1 dark:text-slate-500">Curated library</div>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-300 transition-all duration-200 dark:bg-slate-900 dark:border-slate-700/60 group">
                  <div className="text-3xl font-bold text-[#F49700] mb-1 group-hover:scale-105 transition-transform">Global</div>
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ranking</div>
                  <div className="text-xs text-slate-500 mt-1 dark:text-slate-500">Compete worldwide</div>
                </div>
              </div>
            </div>

            {/* Right Card - Horizontal Rectangle shape */}
            <div className="order-first lg:order-last relative animate-in fade-in slide-in-from-right-4 duration-1000 delay-200 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-xl shadow-blue-900/10 overflow-hidden dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
                <div className="p-7">
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#F49700]"></span>
                        </span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Upcoming</span>
                      </div>
                      <h3 className="text-2xl font-bold text-[#1B2559] dark:text-white mt-1">Monthly Mathwiz Cup</h3>
                    </div>
                    <div className="bg-[#F49700] text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider shadow-sm">
                      LIVE
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-700 transition-colors hover:border-slate-200">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Topic</div>
                      <div className="font-semibold text-[#1B2559] dark:text-white flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1B2559]"></div>
                        Algebra
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-700 transition-colors hover:border-slate-200">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Difficulty</div>
                      <div className="font-semibold text-[#1B2559] dark:text-white flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F49700]"></div>
                        Mixed
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                    Compete globally. Solve problems. Win badges. <br />
                    <span className="text-slate-400 dark:text-slate-500">Open to all skill levels.</span>
                  </p>

                  <Link
                    href="/signup"
                    className="flex w-full items-center justify-center rounded-xl bg-[#1B2559] text-white py-4 font-bold text-lg hover:bg-[#111c44] hover:scale-[1.01] transition-all duration-200 shadow-xl shadow-blue-900/10 dark:bg-white dark:text-[#1B2559] dark:hover:bg-slate-200"
                  >
                    Join the Queue
                  </Link>

                  <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-50 flex items-center justify-center text-[10px] font-bold text-[#1B2559] dark:border-slate-900 dark:bg-blue-900/30 dark:text-blue-200">JD</div>
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-orange-50 flex items-center justify-center text-[10px] font-bold text-[#F49700] dark:border-slate-900 dark:bg-orange-900/30 dark:text-orange-200">AS</div>
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:border-slate-900 dark:bg-slate-800 dark:text-slate-400">MR</div>
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

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-auto">
        <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Mathwiz</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-[#1B2559] dark:hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[#1B2559] dark:hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
