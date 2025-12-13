"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface AuthRedirectWrapperProps {
    children: React.ReactNode;
}

// This component handles client-side redirect for authenticated users on the landing page
export default function AuthRedirectWrapper({ children }: AuthRedirectWrapperProps) {
    const [isChecking, setIsChecking] = useState(true);
    const [shouldRedirect, setShouldRedirect] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkAuthAndRedirect = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    // Fetch profile to determine role
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("profile_completed, role")
                        .eq("id", user.id)
                        .maybeSingle();

                    if (profile && profile.profile_completed && profile.role) {
                        setShouldRedirect(true);
                        // Redirect based on role
                        if (profile.role === "mathlete") {
                            router.replace("/mathlete");
                        } else if (profile.role === "organizer") {
                            router.replace("/organizer");
                        } else if (profile.role === "admin") {
                            router.replace("/admin");
                        }
                        return; // Keep showing loading while redirecting
                    } else if (!profile || !profile.profile_completed) {
                        setShouldRedirect(true);
                        router.replace("/signup/complete-profile");
                        return;
                    }
                }
            } catch (error) {
                console.error("Auth check error:", error);
            }

            setIsChecking(false);
        };

        checkAuthAndRedirect();

        // Also listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === "SIGNED_IN" && session?.user) {
                    checkAuthAndRedirect();
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    // Show loading state while checking auth or redirecting
    if (isChecking || shouldRedirect) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#2A64d1]/10 via-white to-[#25346A]/10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 text-center">
                    <div className="mx-auto mb-4 flex justify-center">
                        <svg className="animate-spin h-12 w-12 text-[#25346A] dark:text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                        {shouldRedirect ? "Redirecting..." : "Loading..."}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">Please wait...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
