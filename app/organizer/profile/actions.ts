"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfilePicture(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const file = formData.get("file") as File;
    if (!file) {
        return { error: "No file provided" };
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
        return { error: "File must be an image" };
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        return { error: "Image must be less than 5MB" };
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/avatar.${fileExt}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

    if (uploadError) {
        console.error("Upload error:", uploadError);
        return { error: "Failed to upload image" };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

    // Update profile
    const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

    if (updateError) {
        console.error("Update error:", updateError);
        return { error: "Failed to update profile" };
    }

    revalidatePath("/organizer/profile");
    return { url: publicUrl };
}

export async function updateCoverPhoto(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const file = formData.get("file") as File;
    if (!file) {
        return { error: "No file provided" };
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
        return { error: "File must be an image" };
    }

    // Validate file size (max 10MB for cover photos)
    if (file.size > 10 * 1024 * 1024) {
        return { error: "Image must be less than 10MB" };
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/cover.${fileExt}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
        .from("covers")
        .upload(fileName, file, { upsert: true });

    if (uploadError) {
        console.error("Upload error:", uploadError);
        return { error: "Failed to upload image" };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from("covers")
        .getPublicUrl(fileName);

    // Update profile
    const { error: updateError } = await supabase
        .from("profiles")
        .update({ cover_photo_url: publicUrl })
        .eq("id", user.id);

    if (updateError) {
        console.error("Update error:", updateError);
        return { error: "Failed to update profile" };
    }

    revalidatePath("/organizer/profile");
    return { url: publicUrl };
}

export async function updateOrganizerProfile(data: {
    full_name: string;
    username: string;
    bio: string;
    school: string;
    country: string;
    province_city: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    // Validate username if provided
    if (data.username) {
        // Check if username is already taken by another user
        const { data: existingUser } = await supabase
            .from("profiles")
            .select("id")
            .eq("username", data.username)
            .neq("id", user.id)
            .single();

        if (existingUser) {
            return { error: "Username is already taken" };
        }

        // Validate username format
        if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
            return { error: "Username can only contain letters, numbers, and underscores" };
        }

        if (data.username.length < 3) {
            return { error: "Username must be at least 3 characters" };
        }

        if (data.username.length > 30) {
            return { error: "Username must be less than 30 characters" };
        }
    }

    // Update profile
    const { error: updateError } = await supabase
        .from("profiles")
        .update({
            full_name: data.full_name || null,
            username: data.username || null,
            bio: data.bio || null,
            school: data.school || null,
            country: data.country || null,
            province_city: data.province_city || null,
        })
        .eq("id", user.id);

    if (updateError) {
        console.error("Update error:", updateError);
        return { error: "Failed to update profile" };
    }

    revalidatePath("/organizer/profile");
    return { success: true };
}
