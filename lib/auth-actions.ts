"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    // Return specific error messages based on error type
    if (error.message.includes("Invalid login credentials")) {
      throw new Error(
        "Invalid email or password. If you signed up with Google, please use the 'Login with Google' button instead."
      );
    } else if (error.message.includes("Email not confirmed")) {
      throw new Error(
        "Please verify your email address. Check your inbox for the confirmation link."
      );
    } else {
      throw new Error(error.message || "Failed to sign in. Please try again.");
    }
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const firstName = formData.get("first-name") as string;
  const lastName = formData.get("last-name") as string;
  const role = formData.get("role") as string;
  
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/signup/complete-profile`,
      data: {
        full_name: `${firstName + " " + lastName}`,
        email: formData.get("email") as string,
        role: role || "mathlete",
      },
    },
  };

  const { data: signUpData, error } = await supabase.auth.signUp(data);

  if (error) {
    console.error("Signup error:", error);
    redirect("/error");
  }

  // Check if email confirmation is required
  if (signUpData?.user && !signUpData.session) {
    // Email confirmation required - redirect to confirmation page
    redirect("/signup/check-email");
  }

  // If session exists (email confirmation disabled), proceed to complete profile
  revalidatePath("/", "layout");
  redirect("/signup/complete-profile");
}

export async function signout() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.log(error);
    redirect("/error");
  }

  redirect("/logout");
}

export async function signInWithGoogle() {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/confirm`,
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error) {
    console.log(error);
    redirect("/error");
  }

  redirect(data.url);
}

export async function saveUserRole(formData: FormData) {
  const supabase = createClient();
  const role = formData.get("role") as string;

  const { error } = await supabase.auth.updateUser({
    data: { role: role }
  });

  if (error) {
    console.log(error);
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/signup/complete-profile");
}

export async function completeProfile(formData: FormData) {
  const supabase = createClient();
  
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as string;
  const username = formData.get("username") as string;
  const country = formData.get("country") as string;
  const province_city = formData.get("province_city") as string;
  
  // Role-specific fields
  const school = formData.get("school") as string;
  const organization = formData.get("organization") as string;

  // Get user data for full_name
  const { data: { user } } = await supabase.auth.getUser();
  const fullName = user?.user_metadata?.full_name || user?.email || "";

  // Check if username is already taken
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .neq("id", userId)
    .single();

  if (existingProfile) {
    return { error: "Username is already taken. Please choose another one." };
  }

  // Use UPSERT to either insert or update the profile
  // This is safer and more PostgreSQL-idiomatic
  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      role,
      full_name: fullName,
      username,
      school: role === "mathlete" ? school : organization,
      organization: role === "organizer" ? organization : null,
      country,
      province_city,
      profile_completed: true,
    }, {
      onConflict: 'id', // If id exists, update; otherwise insert
      ignoreDuplicates: false, // Always update if exists
    });

  if (error) {
    console.error("Error completing profile:", error);
    return { error: "Failed to complete profile. Please try again." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
