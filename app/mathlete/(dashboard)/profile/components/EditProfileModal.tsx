"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { updateProfileInfo, updateProfilePicture, removeProfilePicture, updateCoverPhoto, removeCoverPhoto } from "../actions";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: {
        id: string;
        full_name: string | null;
        username: string | null;
        bio: string | null;
        avatar_url: string | null;
        cover_photo_url: string | null;
        school: string | null;
        country: string | null;
        province_city: string | null;
    };
}

export default function EditProfileModal({ isOpen, onClose, profile }: EditProfileModalProps) {
    const [fullName, setFullName] = useState(profile.full_name || "");
    const [bio, setBio] = useState(profile.bio || "");
    const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
    const [coverUrl, setCoverUrl] = useState(profile.cover_photo_url);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [isRemovingCover, setIsRemovingCover] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingAvatar(true);
        setError("");

        const formData = new FormData();
        formData.append("file", file);

        const result = await updateProfilePicture(formData);

        if (result.error) {
            setError(result.error);
        } else if (result.url) {
            setAvatarUrl(result.url + "?t=" + Date.now());
        }

        setIsUploadingAvatar(false);
    };

    const handleRemoveAvatar = async () => {
        if (!avatarUrl) return;

        setIsRemovingAvatar(true);
        setError("");

        const result = await removeProfilePicture();

        if (result.error) {
            setError(result.error);
        } else {
            setAvatarUrl(null);
        }

        setIsRemovingAvatar(false);
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingCover(true);
        setError("");

        const formData = new FormData();
        formData.append("file", file);

        const result = await updateCoverPhoto(formData);

        if (result.error) {
            setError(result.error);
        } else if (result.url) {
            setCoverUrl(result.url + "?t=" + Date.now());
        }

        setIsUploadingCover(false);
    };

    const handleRemoveCover = async () => {
        if (!coverUrl) return;

        setIsRemovingCover(true);
        setError("");

        const result = await removeCoverPhoto();

        if (result.error) {
            setError(result.error);
        } else {
            setCoverUrl(null);
        }

        setIsRemovingCover(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess(false);

        const formData = new FormData();
        formData.append("full_name", fullName);
        formData.append("bio", bio);

        const result = await updateProfileInfo(formData);

        if (result.error) {
            setError(result.error);
        } else {
            setSuccess(true);
            setTimeout(() => {
                onClose();
                window.location.reload(); // Refresh to show updated data
            }, 1000);
        }

        setIsLoading(false);
    };

    const getInitials = () => {
        if (fullName) {
            return fullName.charAt(0).toUpperCase();
        }
        if (profile.username) {
            return profile.username.charAt(0).toUpperCase();
        }
        return "U";
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 rounded-t-2xl z-10">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">Edit Profile</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {/* Profile Picture */}
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-slate-200 dark:border-slate-600 overflow-hidden bg-gradient-to-br from-[#25346A] to-[#3a5199]">
                                {avatarUrl ? (
                                    <Image
                                        src={avatarUrl}
                                        alt="Profile"
                                        fill
                                        className="object-cover rounded-full"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white text-2xl sm:text-4xl font-bold">
                                        {getInitials()}
                                    </div>
                                )}
                            </div>

                            {/* Upload Button */}
                            <button
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                disabled={isUploadingAvatar}
                                className="absolute bottom-0 right-0 w-7 h-7 sm:w-9 sm:h-9 bg-[#F49700] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-orange-600 transition-colors border-2 border-white"
                            >
                                {isUploadingAvatar ? (
                                    <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>

                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                className="hidden"
                            />
                        </div>

                        {/* Upload/Remove Buttons */}
                        <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                            <button
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                disabled={isUploadingAvatar}
                                className="text-xs sm:text-sm text-[#25346A] dark:text-blue-400 hover:text-[#F49700] font-medium transition-colors"
                            >
                                {avatarUrl ? "Change" : "Upload"}
                            </button>
                            {avatarUrl && (
                                <>
                                    <span className="text-slate-300 dark:text-slate-600">|</span>
                                    <button
                                        type="button"
                                        onClick={handleRemoveAvatar}
                                        disabled={isRemovingAvatar}
                                        className="text-xs sm:text-sm text-red-500 hover:text-red-600 font-medium transition-colors flex items-center gap-1"
                                    >
                                        {isRemovingAvatar ? "..." : "Remove"}
                                    </button>
                                </>
                            )}
                        </div>
                        <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mt-1">Max 2MB • JPG, PNG, GIF</p>
                    </div>

                    {/* Cover Photo */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2">
                            Cover Photo
                        </label>
                        <div className="relative w-full h-24 sm:h-32 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 bg-gradient-to-br from-[#25346A] to-[#3a5199]">
                            {coverUrl ? (
                                <Image
                                    src={coverUrl}
                                    alt="Cover"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-center text-white/70">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-[10px] sm:text-xs">No cover photo</p>
                                    </div>
                                </div>
                            )}

                            {/* Camera upload button */}
                            <button
                                type="button"
                                onClick={() => coverInputRef.current?.click()}
                                disabled={isUploadingCover}
                                className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 w-7 h-7 sm:w-9 sm:h-9 bg-white/90 text-slate-700 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                            >
                                {isUploadingCover ? (
                                    <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>

                            <input
                                ref={coverInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleCoverUpload}
                                className="hidden"
                            />
                        </div>

                        {/* Upload/Remove buttons */}
                        <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2">
                            <button
                                type="button"
                                onClick={() => coverInputRef.current?.click()}
                                disabled={isUploadingCover}
                                className="text-xs sm:text-sm text-[#25346A] dark:text-blue-400 hover:text-[#F49700] font-medium transition-colors"
                            >
                                {coverUrl ? "Change" : "Upload"}
                            </button>
                            {coverUrl && (
                                <>
                                    <span className="text-slate-300 dark:text-slate-600">|</span>
                                    <button
                                        type="button"
                                        onClick={handleRemoveCover}
                                        disabled={isRemovingCover}
                                        className="text-xs sm:text-sm text-red-500 hover:text-red-600 font-medium transition-colors flex items-center gap-1"
                                    >
                                        {isRemovingCover ? "..." : "Remove"}
                                    </button>
                                </>
                            )}
                        </div>
                        <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mt-1">Max 5MB • 1200×400px</p>
                    </div>

                    {/* Full Name */}
                    <div>
                        <label htmlFor="full_name" className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="full_name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F49700] focus:border-transparent transition-all text-sm sm:text-base"
                            required
                        />
                    </div>

                    {/* Username (Read-only) */}
                    <div>
                        <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2">
                            Username
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400">@</span>
                            <input
                                type="text"
                                id="username"
                                value={profile.username || ""}
                                disabled
                                className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 cursor-not-allowed text-sm sm:text-base"
                            />
                        </div>
                        <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mt-1">Cannot be changed</p>
                    </div>

                    {/* Bio */}
                    <div>
                        <label htmlFor="bio" className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2">
                            Bio
                        </label>
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value.slice(0, 500))}
                            placeholder="Tell us about yourself..."
                            rows={3}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F49700] focus:border-transparent transition-all resize-none text-sm sm:text-base"
                        />
                        <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mt-1 text-right">{bio.length}/500</p>
                    </div>

                    {/* Additional Info (Read-only) */}
                    <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-2 sm:space-y-3">
                        <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2">Account Info</p>
                        <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-slate-500 dark:text-slate-400">School</span>
                            <span className="text-slate-800 dark:text-slate-200 truncate ml-4 max-w-[150px] sm:max-w-none">{profile.school || "Not set"}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Location</span>
                            <span className="text-slate-800 dark:text-slate-200 truncate ml-4 max-w-[150px] sm:max-w-none">
                                {profile.province_city && profile.country
                                    ? `${profile.province_city}, ${profile.country}`
                                    : profile.country || "Not set"}
                            </span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mt-1.5 sm:mt-2">
                            Contact support to update
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-2.5 sm:p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400 text-xs sm:text-sm">
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="p-2.5 sm:p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-green-700 dark:text-green-400 text-xs sm:text-sm flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Profile updated!
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 sm:py-3 px-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm sm:text-base"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-2.5 sm:py-3 px-4 bg-[#25346A] text-white rounded-xl hover:bg-[#1e2a54] transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                "Save"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
