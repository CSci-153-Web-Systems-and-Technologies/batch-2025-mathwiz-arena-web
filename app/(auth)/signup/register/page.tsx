import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SignUpForm } from "../components/SignUpForm";

interface PageProps {
  searchParams: {
    role?: string;
  };
}

const SignUpRegisterPage = ({ searchParams }: PageProps) => {
  const role = searchParams.role || "mathlete";
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-sky-50 to-white dark:from-black dark:via-slate-900">
      <header className="w-full border-b bg-opacity-40 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl flex items-center justify-between p-6">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image src="/icon.svg" alt="Mathwiz Logo" width={40} height={40} className="rounded-md" />
            <h1 className="text-xl font-semibold">Mathwiz</h1>
          </Link>
          <Link href="/login" className="text-sm text-muted-foreground hover:underline">
            Already have an account? Log in
          </Link>
        </div>
      </header>
      <div className="flex grow items-center justify-center p-6">
        <SignUpForm role={role} />
      </div>
    </div>
  );
};

export default SignUpRegisterPage;
