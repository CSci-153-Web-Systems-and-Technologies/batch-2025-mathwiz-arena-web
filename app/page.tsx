import Link from "next/link";
import Image from "next/image";
import LoginButton from "@/components/LoginLogoutButton";
import LandingNavigation from "@/components/LandingNavigation";
import AuthRedirectWrapper from "@/components/AuthRedirectWrapper";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// Force dynamic rendering to ensure auth check runs on every request
export const dynamic = 'force-dynamic';

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
    } else if (role === "admin") {
      redirect("/admin");
    }
  }

  return (
    <AuthRedirectWrapper>
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
              <LandingNavigation>
                <LoginButton />
              </LandingNavigation>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row items-center pt-20 sm:pt-24 pb-6 relative z-10 px-4 sm:px-6 max-w-7xl mx-auto w-full gap-6 lg:gap-16">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-50/30 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Left Content */}
          <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50/50 px-3 py-1 text-sm font-medium text-[#1B2559] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#F49700] mr-2"></span>
              The #1 Platform for Mathletes
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-[#1B2559] dark:text-white leading-[1.1]">
              Compete, Practice, <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>Master Math
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
              Join timed competitions, solve curated problem sets, and climb leaderboards. Designed for students and teachers who love math.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-[#1B2559] px-6 sm:px-8 py-3 sm:py-3.5 text-base font-bold text-white hover:bg-[#111c44] transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-900/20 dark:bg-white dark:text-[#1B2559] dark:hover:bg-slate-200"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 sm:px-8 py-3 sm:py-3.5 text-base font-bold text-[#1B2559] hover:bg-slate-50 hover:border-[#1B2559]/30 transition-colors duration-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700"
              >
                Log in
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 sm:pt-6">
              <div className="p-2 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-300 transition-all duration-200 dark:bg-slate-900 dark:border-slate-700/60 group">
                <div className="text-xl sm:text-3xl font-bold text-[#F49700] mb-0.5 sm:mb-1 group-hover:scale-105 transition-transform">Timed</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">Contests</div>
                <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 dark:text-slate-500 hidden sm:block">Weekly challenges</div>
              </div>
              <div className="p-2 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-300 transition-all duration-200 dark:bg-slate-900 dark:border-slate-700/60 group">
                <div className="text-xl sm:text-3xl font-bold text-[#F49700] mb-0.5 sm:mb-1 group-hover:scale-105 transition-transform">1000+</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">Problems</div>
                <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 dark:text-slate-500 hidden sm:block">Curated library</div>
              </div>
              <div className="p-2 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-300 transition-all duration-200 dark:bg-slate-900 dark:border-slate-700/60 group">
                <div className="text-xl sm:text-3xl font-bold text-[#F49700] mb-0.5 sm:mb-1 group-hover:scale-105 transition-transform">Global</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">Ranking</div>
                <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 dark:text-slate-500 hidden sm:block">Compete worldwide</div>
              </div>
            </div>
          </div>

          {/* Right Card */}
          <div className="flex-1 order-first lg:order-last relative animate-in fade-in slide-in-from-right-4 duration-1000 delay-200 flex justify-center lg:justify-end w-full px-2 sm:px-0">
            <div className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-xl shadow-blue-900/10 overflow-hidden dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
              <div className="p-5 sm:p-7">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#F49700]"></span>
                      </span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Upcoming</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#1B2559] dark:text-white mt-1">Monthly Mathwiz Cup</h3>
                  </div>
                  <div className="bg-[#F49700] text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider shadow-sm">
                    LIVE
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
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
                  className="flex w-full items-center justify-center rounded-xl bg-[#1B2559] text-white py-3 sm:py-4 font-bold text-base sm:text-lg hover:bg-[#111c44] hover:scale-[1.01] transition-all duration-200 shadow-xl shadow-blue-900/10 dark:bg-white dark:text-[#1B2559] dark:hover:bg-slate-200"
                >
                  Join the Queue
                </Link>

                <div className="mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
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
        <section id="info" className="py-6 sm:py-8 px-4 scroll-mt-20">
          <div className="mx-auto max-w-7xl">
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] shadow-none overflow-hidden flex flex-col lg:flex-row dark:border-slate-800">

              {/* Left: Design for Excellence */}
              <div className="lg:w-1/2 p-5 sm:p-8 lg:p-10 bg-white dark:bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 relative z-10">
                <div className="mb-4 sm:mb-6">
                  <span className="inline-block py-1 px-3 rounded-lg bg-blue-50 text-[#1B2559] text-[10px] font-bold tracking-widest mb-2 sm:mb-3 border border-blue-100 uppercase">Features</span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B2559] dark:text-white mb-2 sm:mb-3 leading-tight">Designed for<br />Excellence</h2>
                  <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-sm leading-relaxed">Everything you need to excel in competitive mathematics, built for champions.</p>
                </div>

                <div className="space-y-2 sm:space-y-2.5">
                  <div className="flex gap-3 sm:gap-4 items-center p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 group cursor-default dark:bg-slate-900 dark:border-slate-800">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-[#1B2559] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 dark:bg-blue-900/20 dark:text-blue-300">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-[#1B2559] dark:text-white mb-0.5 group-hover:text-blue-600 transition-colors">Real-time Competitions</h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Live contests, synchronized starts.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 sm:gap-4 items-center p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300 group cursor-default dark:bg-slate-900 dark:border-slate-800">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-50 text-[#F49700] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 dark:bg-orange-900/20 dark:text-orange-300">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-[#1B2559] dark:text-white mb-0.5 group-hover:text-[#F49700] transition-colors">Detailed Analytics</h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Visualize your growing strengths.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 sm:gap-4 items-center p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300 group cursor-default dark:bg-slate-900 dark:border-slate-800">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 dark:bg-purple-900/20 dark:text-purple-300">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-[#1B2559] dark:text-white mb-0.5 group-hover:text-purple-600 transition-colors">Problem Archives</h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Thousands of curated problems.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: How it Works */}
              <div className="lg:w-1/2 p-5 sm:p-8 lg:p-10 bg-slate-50 dark:bg-slate-900/50 flex flex-col justify-center">
                <div className="mb-4 sm:mb-6">
                  <span className="inline-block py-1 px-3 rounded-lg bg-indigo-50 text-[#1B2559] text-[10px] font-bold tracking-widest mb-2 sm:mb-3 border border-indigo-100 uppercase">Getting Started</span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B2559] dark:text-white mb-2 sm:mb-3 leading-tight">How it Works</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-sm leading-relaxed">Start your journey to mastery in 3 simple steps.</p>
                </div>

                <div className="space-y-4 sm:space-y-5 relative">
                  <div className="absolute left-[1.5rem] sm:left-[1.95rem] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-slate-200 dark:border-slate-800 -z-10"></div>

                  <div className="flex gap-4 sm:gap-5 items-start group">
                    <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-300 transition-all duration-200 dark:bg-slate-900 dark:border-slate-700/60 text-[#1B2559] font-bold text-xl sm:text-2xl flex items-center justify-center group-hover:-translate-y-1">1</div>
                    <div className="pt-1 sm:pt-2">
                      <h3 className="text-lg sm:text-xl font-extrabold text-[#1B2559] dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">Create an Account</h3>
                      <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed max-w-xs">Sign up in seconds. Choose your role as a student or organizer.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 sm:gap-5 items-start group">
                    <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-300 transition-all duration-200 dark:bg-slate-900 dark:border-slate-700/60 text-[#F49700] font-bold text-xl sm:text-2xl flex items-center justify-center group-hover:-translate-y-1">2</div>
                    <div className="pt-1 sm:pt-2">
                      <h3 className="text-lg sm:text-xl font-extrabold text-[#1B2559] dark:text-white mb-1 group-hover:text-[#F49700] transition-colors">Join a Contest</h3>
                      <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed max-w-xs">Browse upcoming events and register to challenge yourself.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 sm:gap-5 items-start group">
                    <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-300 transition-all duration-200 dark:bg-slate-900 dark:border-slate-700/60 text-green-500 font-bold text-xl sm:text-2xl flex items-center justify-center group-hover:-translate-y-1">3</div>
                    <div className="pt-1 sm:pt-2">
                      <h3 className="text-lg sm:text-xl font-extrabold text-[#1B2559] dark:text-white mb-1 group-hover:text-green-500 transition-colors">Climb the Ranks</h3>
                      <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed max-w-xs">Solve problems, earn unique badges and global recognition.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-12 sm:py-24 px-4 sm:px-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 scroll-mt-8">
          <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">

            {/* Left Column */}
            <div className="flex flex-col">
              <h3 className="text-center font-bold tracking-widest text-[#1B2559] dark:text-white uppercase mb-6 sm:mb-8 text-xs sm:text-sm">Meet The Developer</h3>

              <div className="relative w-full self-center">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100/50 rounded-full blur-3xl -z-10"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-100/50 rounded-full blur-3xl -z-10"></div>

                <div className="p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-white border border-slate-100 shadow-[0_20px_40px_rgba(27,37,89,0.08)] hover:shadow-[0_30px_60px_rgba(27,37,89,0.12)] transition-shadow duration-300 dark:bg-slate-800 dark:border-slate-700 flex flex-col items-center text-center relative overflow-hidden">

                  <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-full overflow-hidden border-2 border-[#1B2559] shadow-sm mb-3 sm:mb-4 relative mt-2 hover:shadow-md transition-all duration-500">
                    <Image src="/profile.jpeg" alt="Anthony L. Celeres" width={192} height={192} className="object-cover w-full h-full transform transition-transform duration-700 hover:scale-110" />
                  </div>

                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1B2559] dark:text-white mb-2">Anthony L. Celeres</h3>
                  <div className="text-xs sm:text-sm font-semibold text-[#F49700] mb-3 sm:mb-4 flex flex-col gap-1">
                    <span>BS Computer Science 3rd Year</span>
                    <span className="text-[#1B2559] dark:text-slate-400 text-[10px] uppercase tracking-wider">Visayas State University</span>
                  </div>

                  <div className="relative mb-3 sm:mb-4 px-2 sm:px-4">
                    <span className="absolute top-0 left-0 text-2xl sm:text-3xl text-blue-100 dark:text-slate-700 font-serif -translate-x-2 -translate-y-2">"</span>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed italic relative z-10">
                      Building Mathwiz to empower the next generation of problem solvers—a platform built by a mathlete, for mathletes.
                    </p>
                    <span className="absolute bottom-0 right-0 text-2xl sm:text-3xl text-blue-100 dark:text-slate-700 font-serif translate-x-2 translate-y-2">"</span>
                  </div>

                  <div className="w-full pt-3 border-t border-slate-50 dark:border-slate-700/50">
                    <div className="px-4 py-1 text-xs font-bold text-[#1B2559] dark:text-slate-300 inline-flex flex-col gap-0.5">
                      <span>Philippine International Mathematical Olympiad</span>
                      <span>Heat Round 2023 Bronze Medalist</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col">
              <h3 className="text-center font-bold tracking-widest text-[#1B2559] dark:text-white uppercase mb-6 sm:mb-8 text-xs sm:text-sm">Our Mission</h3>

              <div className="flex flex-col items-center justify-center text-center h-full pt-0">
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#1B2559] dark:text-white mb-6 sm:mb-8 leading-[1.15] max-w-lg">
                  Empowering the Next Generation of Problem Solvers
                </h2>

                <p className="text-base sm:text-[1.1rem] text-slate-600 dark:text-slate-400 leading-7 sm:leading-8 mb-8 sm:mb-10 max-w-lg text-balance">
                  Mathwiz was born from a passion for competitive mathematics. We believe that <span className="text-[#1B2559] font-medium dark:text-slate-200">critical thinking is a superpower</span>, and we're dedicated to providing the ultimate arena for students to hone their skills, connect with peers, and achieve global recognition.
                </p>

                <Link href="/signup" className="group inline-flex items-center gap-2 text-[#F49700] font-bold text-sm tracking-wide hover:text-orange-600 transition-colors">
                  <span>Join the Movement</span>
                  <svg className="w-4 h-4 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500 dark:text-slate-400 gap-3 md:gap-0">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Image src="/icon.svg" alt="Mathwiz Logo" width={20} height={20} className="opacity-80" />
              <span className="font-semibold">© {new Date().getFullYear()} Mathwiz</span>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-[#1B2559] dark:hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[#1B2559] dark:hover:text-white transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-[#1B2559] dark:hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </footer>
      </main>
    </AuthRedirectWrapper>
  );
}
