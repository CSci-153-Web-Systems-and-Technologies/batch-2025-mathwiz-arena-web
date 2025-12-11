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
              <Link href="#info" className="hover:text-[#1B2559] dark:hover:text-white transition-colors">Start Here</Link>
              <LoginButton />
            </nav>
            <div className="md:hidden"><LoginButton /></div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center pt-24 pb-6 relative z-10 px-6 max-w-7xl mx-auto w-full gap-8 lg:gap-16">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-50/30 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Left Content */}
        <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
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

        {/* Right Card */}
        <div className="flex-1 order-first lg:order-last relative animate-in fade-in slide-in-from-right-4 duration-1000 delay-200 flex justify-center lg:justify-end w-full">
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

              <div className="grid grid-cols-2 gap-4 mb-6">
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
      </section>

      {/* Unified Info Section */}
      <section id="info" className="py-6 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-none overflow-hidden flex flex-col lg:flex-row dark:border-slate-800">

            {/* Left: Design for Excellence */}
            <div className="lg:w-1/2 p-8 lg:p-10 bg-white dark:bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 relative z-10">
              <div className="mb-6">
                <span className="inline-block py-1 px-3 rounded-lg bg-blue-50 text-[#1B2559] text-[10px] font-bold tracking-widest mb-3 border border-blue-100 uppercase">Features</span>
                <h2 className="text-4xl lg:text-5xl font-bold text-[#1B2559] dark:text-white mb-3 leading-tight">Designed for<br />Excellence</h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg max-w-sm leading-relaxed">Everything you need to excel in competitive mathematics, built for champions.</p>
              </div>

              <div className="space-y-2.5">
                <div className="flex gap-4 items-center p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 group cursor-default">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 text-[#1B2559] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1B2559] dark:text-white mb-0.5 group-hover:text-blue-600 transition-colors">Real-time Competitions</h3>
                    <p className="text-sm text-slate-500 font-medium">Live contests, synchronized starts.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-center p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300 group cursor-default">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-50 text-[#F49700] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1B2559] dark:text-white mb-0.5 group-hover:text-[#F49700] transition-colors">Detailed Analytics</h3>
                    <p className="text-sm text-slate-500 font-medium">Visualize your growing strengths.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-center p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300 group cursor-default">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1B2559] dark:text-white mb-0.5 group-hover:text-purple-600 transition-colors">Problem Archives</h3>
                    <p className="text-sm text-slate-500 font-medium">Thousands of curated problems.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: How it Works */}
            <div className="lg:w-1/2 p-8 lg:p-10 bg-slate-50 dark:bg-slate-900/50 flex flex-col justify-center">
              <div className="mb-6">
                <span className="inline-block py-1 px-3 rounded-lg bg-indigo-50 text-[#1B2559] text-[10px] font-bold tracking-widest mb-3 border border-indigo-100 uppercase">Getting Started</span>
                <h2 className="text-4xl lg:text-5xl font-bold text-[#1B2559] dark:text-white mb-3 leading-tight">How it Works</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg max-w-sm leading-relaxed">Start your journey to mastery in 3 simple steps.</p>
              </div>

              <div className="space-y-5 relative">
                <div className="absolute left-[1.95rem] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-slate-200 dark:border-slate-800 -z-10"></div>

                <div className="flex gap-5 items-start group">
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-300 transition-all duration-200 dark:bg-slate-900 dark:border-slate-700/60 text-[#1B2559] font-bold text-2xl flex items-center justify-center group-hover:-translate-y-1">1</div>
                  <div className="pt-2">
                    <h3 className="text-xl font-extrabold text-[#1B2559] dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">Create an Account</h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">Sign up in seconds. Choose your role as a student or organizer.</p>
                  </div>
                </div>

                <div className="flex gap-5 items-start group">
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-300 transition-all duration-200 dark:bg-slate-900 dark:border-slate-700/60 text-[#F49700] font-bold text-2xl flex items-center justify-center group-hover:-translate-y-1">2</div>
                  <div className="pt-2">
                    <h3 className="text-xl font-extrabold text-[#1B2559] dark:text-white mb-1 group-hover:text-[#F49700] transition-colors">Join a Contest</h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">Browse upcoming events and register to challenge yourself.</p>
                  </div>
                </div>

                <div className="flex gap-5 items-start group">
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-300 transition-all duration-200 dark:bg-slate-900 dark:border-slate-700/60 text-green-500 font-bold text-2xl flex items-center justify-center group-hover:-translate-y-1">3</div>
                  <div className="pt-2">
                    <h3 className="text-xl font-extrabold text-[#1B2559] dark:text-white mb-1 group-hover:text-green-500 transition-colors">Climb the Ranks</h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">Solve problems, earn unique badges and global recognition.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-auto">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Image src="/icon.svg" alt="Mathwiz Logo" width={20} height={20} className="opacity-80" />
            <span className="font-semibold">© {new Date().getFullYear()} Mathwiz</span>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-[#1B2559] dark:hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[#1B2559] dark:hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-[#1B2559] dark:hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
