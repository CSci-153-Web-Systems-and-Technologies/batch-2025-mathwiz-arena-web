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

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        return { error: "File size must be less than 2MB" };
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/avatar.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
            cacheControl: "3600",
            upsert: true,
        });

    if (uploadError) {
        console.error("Upload error:", uploadError);
        return { error: "Failed to upload image" };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

    // Update profile with avatar URL
    const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", user.id);

    if (updateError) {
        console.error("Update error:", updateError);
        return { error: "Failed to update profile" };
    }

    revalidatePath("/mathlete/profile");
    return { success: true, url: urlData.publicUrl };
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

    // Validate file size (max 5MB for cover photos)
    if (file.size > 5 * 1024 * 1024) {
        return { error: "File size must be less than 5MB" };
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/cover.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from("covers")
        .upload(fileName, file, {
            cacheControl: "3600",
            upsert: true,
        });

    if (uploadError) {
        console.error("Upload error:", uploadError);
        return { error: "Failed to upload image" };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from("covers")
        .getPublicUrl(fileName);

    // Update profile with cover URL
    const { error: updateError } = await supabase
        .from("profiles")
        .update({ cover_photo_url: urlData.publicUrl })
        .eq("id", user.id);

    if (updateError) {
        console.error("Update error:", updateError);
        return { error: "Failed to update profile" };
    }

    revalidatePath("/mathlete/profile");
    return { success: true, url: urlData.publicUrl };
}

export async function updateProfileInfo(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const bio = formData.get("bio") as string;
    const full_name = formData.get("full_name") as string;

    const updateData: { bio?: string; full_name?: string } = {};

    if (bio !== undefined) {
        updateData.bio = bio.substring(0, 500); // Limit to 500 chars
    }

    if (full_name) {
        updateData.full_name = full_name;
    }

    const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

    if (error) {
        console.error("Update error:", error);
        return { error: "Failed to update profile" };
    }

    revalidatePath("/mathlete/profile");
    return { success: true };
}
