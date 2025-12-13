"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { signout } from "@/lib/auth-actions";

const LoginButton = ({ className }: { className?: string }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const fetchUserAndRedirect = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);

      // If user is authenticated and on the landing page, redirect to their dashboard
      if (user && pathname === "/") {
        // Fetch the user's profile to determine their role
        const { data: profile } = await supabase
          .from("profiles")
          .select("profile_completed, role")
          .eq("id", user.id)
          .maybeSingle();

        if (profile && profile.profile_completed && profile.role) {
          // Redirect based on role
          if (profile.role === "mathlete") {
            router.push("/mathlete");
          } else if (profile.role === "organizer") {
            router.push("/organizer");
          } else if (profile.role === "admin") {
            router.push("/admin");
          }
        } else if (!profile || !profile.profile_completed) {
          // Profile incomplete, redirect to complete profile
          router.push("/signup/complete-profile");
        }
      }
    };

    fetchUserAndRedirect();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);

          // If on landing page after sign in, redirect to appropriate dashboard
          if (pathname === "/") {
            const { data: profile } = await supabase
              .from("profiles")
              .select("profile_completed, role")
              .eq("id", session.user.id)
              .maybeSingle();

            if (profile && profile.profile_completed && profile.role) {
              if (profile.role === "mathlete") {
                router.push("/mathlete");
              } else if (profile.role === "organizer") {
                router.push("/organizer");
              } else if (profile.role === "admin") {
                router.push("/admin");
              }
            } else if (!profile || !profile.profile_completed) {
              router.push("/signup/complete-profile");
            }
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname]);

  if (isLoading) {
    return (
      <Button variant="outline" className={className} disabled>
        ...
      </Button>
    );
  }

  if (user) {
    return (
      <Button
        className={className}
        onClick={() => {
          signout();
          setUser(null);
        }}
      >
        Log out
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      className={className}
      onClick={() => {
        router.push("/login");
      }}
    >
      Login
    </Button>
  );
};

export default LoginButton;
