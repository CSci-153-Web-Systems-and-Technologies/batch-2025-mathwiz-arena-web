"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function signout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.log(error);
    redirect("/error");
  }

  redirect("/logout");
}

export async function signInWithGoogle() {
  const supabase = await createClient();

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
  const supabase = await createClient();
  const role = formData.get("role") as string;

  // Update user metadata to include the selected role
  const { error } = await supabase.auth.updateUser({
    data: {
      role: role,
      role_selected: true // Mark that user explicitly selected this role
    }
  });

  if (error) {
    console.log(error);
    redirect("/error");
  }

  // Also update the profile table with the selected role
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase
      .from('profiles')
      .update({ role: role })
      .eq('id', user.id);
  }

  revalidatePath("/", "layout");
  redirect("/signup/complete-profile");
}

export async function completeProfile(formData: FormData) {
  const supabase = await createClient();

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

  // Check if username is already taken by another user
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .neq("id", userId)
    .maybeSingle();

  if (existingProfile) {
    return { error: "Username is already taken. Please choose another one." };
  }

  console.log("=== COMPLETE PROFILE ===");
  console.log("User ID:", userId);
  console.log("Role:", role);
  console.log("Username:", username);
  console.log("Full Name:", fullName);
  console.log("Country:", country);
  console.log("Province/City:", province_city);
  console.log("School:", school);
  console.log("Organization:", organization);

  // Use UPSERT to either insert or update the profile
  // This is safer and more PostgreSQL-idiomatic
  const { data: upsertedData, error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      role,
      full_name: fullName,
      username,
      school: role === "mathlete" ? school : null,
      organization: role === "organizer" ? organization : null,
      country,
      province_city,
      profile_completed: true,
    }, {
      onConflict: 'id', // If id exists, update; otherwise insert
      ignoreDuplicates: false, // Always update if exists
    })
    .select()
    .single();

  if (error) {
    console.error("❌ Error completing profile:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return { error: `Failed to complete profile: ${error.message || 'Please try again.'}` };
  }

  console.log("✅ Profile completed successfully!");
  console.log("Updated profile data:", upsertedData);
  revalidatePath("/", "layout");
  return { success: true };
}
