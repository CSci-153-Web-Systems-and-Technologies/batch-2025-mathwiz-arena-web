'use client';
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

// Inner component that uses useSearchParams
const LoggingInContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get('next') || '/';

    const title = searchParams.get('title') || 'Authenticating';
    const message = searchParams.get('message') || 'Successfully logged in. Taking you there...';

    useEffect(() => {
        // Short delay to show the animation/success state
        const timer = setTimeout(() => {
            router.push(next);
        }, 100);
        return () => clearTimeout(timer);
    }, [router, next]);

    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 text-center max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-300">
            <div className="mx-auto mb-4 flex justify-center">
                <svg className="animate-spin h-12 w-12 text-[#25346A] dark:text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{title}</h2>
            <p className="text-slate-600 dark:text-slate-400">{message}</p>
        </div>
    );
};

// Loading fallback component
const LoadingFallback = () => (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 text-center max-w-sm w-full mx-4">
        <div className="mx-auto mb-4 flex justify-center">
            <svg className="animate-spin h-12 w-12 text-[#25346A] dark:text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Loading...</h2>
        <p className="text-slate-600 dark:text-slate-400">Please wait...</p>
    </div>
);

// Main page component with Suspense boundary
const LoggingInPage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#2A64d1]/10 via-white to-[#25346A]/10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4">
            <Suspense fallback={<LoadingFallback />}>
                <LoggingInContent />
            </Suspense>
        </div>
    );
};

export default LoggingInPage;
