"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { updateProfilePicture, updateCoverPhoto } from "../actions";

interface ProfileHeaderProps {
    profile: {
        id: string;
        full_name: string | null;
        username: string | null;
        avatar_url: string | null;
        cover_photo_url: string | null;
        school: string | null;
        country: string | null;
    };
    stats: {
        competitionsJoined: number;
        totalScore: number;
        rank: number | null;
        totalParticipants: number;
    };
    isOwnProfile: boolean;
}

export default function ProfileHeader({ profile, stats, isOwnProfile }: ProfileHeaderProps) {
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
    const [coverUrl, setCoverUrl] = useState(profile.cover_photo_url);
    const [error, setError] = useState("");

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
            setAvatarUrl(result.url + "?t=" + Date.now()); // Cache bust
        }

        setIsUploadingAvatar(false);
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
            setCoverUrl(result.url + "?t=" + Date.now()); // Cache bust
        }

        setIsUploadingCover(false);
    };

    const getInitials = () => {
        if (profile.full_name) {
            return profile.full_name.charAt(0).toUpperCase();
        }
        if (profile.username) {
            return profile.username.charAt(0).toUpperCase();
        }
        return "U";
    };

    return (
        <div className="relative">
            {/* Cover Photo */}
            <div className="relative h-48 md:h-64 bg-gradient-to-r from-[#25346A] via-[#3a5199] to-[#2A64d1] overflow-hidden">
                {coverUrl && (
                    <Image
                        src={coverUrl}
                        alt="Cover photo"
                        fill
                        className="object-cover"
                        priority
                    />
                )}

                {/* Cover Photo Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                {/* Edit Cover Button */}
                {isOwnProfile && (
                    <button
                        onClick={() => coverInputRef.current?.click()}
                        disabled={isUploadingCover}
                        className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors text-sm font-medium"
                    >
                        {isUploadingCover ? (
                            <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Edit Cover
                            </>
                        )}
                    </button>
                )}

                <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                />
            </div>

            {/* Profile Info Section */}
            <div className="relative px-4 sm:px-6 lg:px-8 pb-6">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-20">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white">
                                {avatarUrl ? (
                                    <Image
                                        src={avatarUrl}
                                        alt={profile.full_name || "Profile"}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#25346A] to-[#3a5199] flex items-center justify-center text-white text-4xl md:text-5xl font-bold">
                                        {getInitials()}
                                    </div>
                                )}
                            </div>

                            {/* Edit Avatar Button */}
                            {isOwnProfile && (
                                <button
                                    onClick={() => avatarInputRef.current?.click()}
                                    disabled={isUploadingAvatar}
                                    className="absolute bottom-2 right-2 w-8 h-8 bg-[#F49700] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-orange-600 transition-colors"
                                >
                                    {isUploadingAvatar ? (
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            )}

                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                className="hidden"
                            />
                        </div>

                        {/* Name and Info */}
                        <div className="flex-1 pt-4 md:pt-0 md:pb-2">
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                                {profile.full_name || "Mathlete"}
                            </h1>
                            <p className="text-slate-600 text-lg">@{profile.username}</p>

                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                                {profile.school && (
                                    <span className="flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                        </svg>
                                        {profile.school}
                                    </span>
                                )}
                                {profile.country && (
                                    <span className="flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {profile.country}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-4 md:gap-6 pt-4 md:pt-0 md:pb-2">
                            {/* Competitions Joined */}
                            <div className="text-center px-4 py-3 bg-white rounded-xl shadow-sm border border-slate-200">
                                <p className="text-2xl md:text-3xl font-bold text-[#25346A]">{stats.competitionsJoined}</p>
                                <p className="text-xs md:text-sm text-slate-500">Competitions</p>
                            </div>

                            {/* Total Score */}
                            <div className="text-center px-4 py-3 bg-white rounded-xl shadow-sm border border-slate-200">
                                <p className="text-2xl md:text-3xl font-bold text-[#F49700]">{stats.totalScore}</p>
                                <p className="text-xs md:text-sm text-slate-500">Total Points</p>
                            </div>

                            {/* Rank */}
                            <div className="text-center px-4 py-3 bg-white rounded-xl shadow-sm border border-slate-200">
                                <p className="text-2xl md:text-3xl font-bold text-purple-600">
                                    {stats.rank ? `#${stats.rank}` : "—"}
                                </p>
                                <p className="text-xs md:text-sm text-slate-500">
                                    {stats.rank ? `of ${stats.totalParticipants}` : "No Rank"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
