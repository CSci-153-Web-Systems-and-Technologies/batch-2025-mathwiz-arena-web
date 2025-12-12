import React from "react";
import Link from "next/link";
import Image from "next/image";
import { RoleSelection } from "./components/RoleSelection";

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-white dark:bg-slate-950">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-50/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <header className="w-full fixed top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 transition-all duration-300">
        <div className="mx-auto max-w-7xl flex items-center justify-between p-3 lg:p-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image src="/icon.svg" alt="Mathwiz Logo" width={32} height={32} className="rounded-md" />
            <span className="text-xl font-bold text-[#1B2559] dark:text-white tracking-tight">
              Mathwiz
            </span>
          </Link>
          <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#1B2559] dark:hover:text-white transition-colors">
            Already have an account? <span className="font-bold text-[#F49700] hover:text-orange-600 ml-1">Log in</span>
          </Link>
        </div>
      </header>

      <div className="flex grow items-center justify-center p-6 pt-24 relative z-10">
        <RoleSelection />
      </div>
    </div>
  );
};

export default SignUpPage;
