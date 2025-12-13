"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { updateProfilePicture } from "../actions";

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
    onEditProfile?: () => void;
    activeTab?: string;
    onTabChange?: (tab: string) => void;
}

export default function ProfileHeader({ profile, stats, isOwnProfile, onEditProfile, activeTab: externalActiveTab, onTabChange }: ProfileHeaderProps) {
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
    const [coverUrl, setCoverUrl] = useState(profile.cover_photo_url);
    const [error, setError] = useState("");
    const [internalActiveTab, setInternalActiveTab] = useState("overview");
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    // Use external tab state if provided, otherwise use internal
    const activeTab = externalActiveTab ?? internalActiveTab;
    const setActiveTab = onTabChange ?? setInternalActiveTab;

    const avatarInputRef = useRef<HTMLInputElement>(null);

    const moreMenuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
        if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
            setShowMoreMenu(false);
        }
    };

    // Add/remove click listener
    if (typeof window !== 'undefined') {
        if (showMoreMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
    }

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



    const getInitials = () => {
        if (profile.full_name) {
            return profile.full_name.charAt(0).toUpperCase();
        }
        if (profile.username) {
            return profile.username.charAt(0).toUpperCase();
        }
        return "U";
    };

    const tabs = [
        { id: "overview", label: "Overview", href: null },
        { id: "achievements", label: "Achievements", href: null },
        { id: "history", label: "History", href: "/mathlete/history" },
        { id: "teams", label: "Teams", href: "/mathlete/teams" },
    ];

    // Action buttons component (used in both mobile and desktop positions)
    const ActionButtons = ({ isMobile = false }: { isMobile?: boolean }) => (
        <>
            {isOwnProfile && onEditProfile && (
                <button
                    onClick={onEditProfile}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-semibold text-sm ${isMobile ? 'flex-1' : ''}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit profile
                </button>
            )}
            {/* More options button */}
            <div className="relative" ref={moreMenuRef}>
                <button
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center justify-center flex-shrink-0"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                </button>

                {/* Desktop Dropdown Menu */}
                {showMoreMenu && (
                    <div className="hidden sm:block absolute top-12 right-0 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                        <Link
                            href="/mathlete/notifications"
                            className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3"
                            onClick={() => setShowMoreMenu(false)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            Notifications
                        </Link>

                        <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

                        <Link
                            href="/mathlete"
                            className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3"
                            onClick={() => setShowMoreMenu(false)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Back to Dashboard
                        </Link>

                        <Link
                            href="/mathlete/settings"
                            className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3"
                            onClick={() => setShowMoreMenu(false)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
                        </Link>

                        <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

                        <Link
                            href="/logout"
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
                            onClick={() => setShowMoreMenu(false)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Log out
                        </Link>
                    </div>
                )}
            </div>

            {/* Mobile Bottom Sheet Modal */}
            {showMoreMenu && (
                <div className="sm:hidden fixed inset-0 z-50">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowMoreMenu(false)}
                    />

                    {/* Bottom Sheet */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-800 rounded-t-2xl shadow-xl animate-slide-up">
                        {/* Drag Handle */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="px-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-base font-semibold text-slate-800 dark:text-white text-center">More Options</h3>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2 px-2">
                            <Link
                                href="/mathlete/notifications"
                                className="w-full px-4 py-3.5 text-left text-base text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-4 rounded-xl"
                                onClick={() => setShowMoreMenu(false)}
                            >
                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </div>
                                <span className="font-medium">Notifications</span>
                            </Link>

                            <Link
                                href="/mathlete"
                                className="w-full px-4 py-3.5 text-left text-base text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-4 rounded-xl"
                                onClick={() => setShowMoreMenu(false)}
                            >
                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </div>
                                <span className="font-medium">Back to Dashboard</span>
                            </Link>

                            <Link
                                href="/mathlete/settings"
                                className="w-full px-4 py-3.5 text-left text-base text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-4 rounded-xl"
                                onClick={() => setShowMoreMenu(false)}
                            >
                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <span className="font-medium">Settings</span>
                            </Link>

                            <div className="border-t border-slate-200 dark:border-slate-700 my-2 mx-4" />

                            <Link
                                href="/logout"
                                className="w-full px-4 py-3.5 text-left text-base text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-4 rounded-xl"
                                onClick={() => setShowMoreMenu(false)}
                            >
                                <div className="w-10 h-10 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </div>
                                <span className="font-medium">Log out</span>
                            </Link>
                        </div>

                        {/* Cancel Button */}
                        <div className="p-4 pb-6">
                            <button
                                onClick={() => setShowMoreMenu(false)}
                                className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    return (
        <div className="bg-white dark:bg-slate-800 shadow-sm transition-colors">
            {/* Cover Photo Section */}
            <div className="relative max-w-5xl mx-auto">
                {/* Cover Photo */}
                <div className="relative h-[140px] sm:h-[180px] md:h-[300px] bg-gradient-to-r from-[#25346A] via-[#3a5199] to-[#2A64d1] rounded-b-lg overflow-hidden">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                    {/* Error Toast */}
                    {error && (
                        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-auto md:w-80 p-3 bg-red-500 text-white rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm">{error}</span>
                            <button onClick={() => setError("")} className="ml-auto hover:bg-red-600 p-1 rounded">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Profile Info Bar */}
                <div className="relative px-3 sm:px-4 md:px-8 pb-3 sm:pb-4">
                    {/* Desktop Layout: Avatar, Name/Info, and Buttons in a row */}
                    <div className="flex flex-col md:flex-row md:items-end gap-2 sm:gap-4">
                        {/* Avatar */}
                        <div className="relative -mt-12 sm:-mt-16 md:-mt-24 flex-shrink-0 mx-auto md:mx-0">
                            <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-44 md:h-44 rounded-full border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden bg-white">
                                {avatarUrl ? (
                                    <Image
                                        src={avatarUrl}
                                        alt={profile.full_name || "Profile"}
                                        fill
                                        className="object-cover rounded-full"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#25346A] to-[#3a5199] flex items-center justify-center text-white text-4xl md:text-6xl font-bold">
                                        {getInitials()}
                                    </div>
                                )}
                            </div>

                            {/* Edit Avatar Button */}
                            {isOwnProfile && (
                                <button
                                    onClick={() => avatarInputRef.current?.click()}
                                    disabled={isUploadingAvatar}
                                    className="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 w-8 h-8 sm:w-9 sm:h-9 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-full flex items-center justify-center shadow-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors border-2 border-white dark:border-slate-800"
                                >
                                    {isUploadingAvatar ? (
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

                        {/* Name & Info */}
                        <div className="flex-1 pt-1 md:pt-0 md:pb-4 text-center md:text-left">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                                {profile.full_name || "Mathlete"}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-0.5">
                                {stats.competitionsJoined} competition{stats.competitionsJoined !== 1 ? 's' : ''} • {stats.totalScore} points
                            </p>

                            {/* School & Location */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                {profile.school && (
                                    <span className="flex items-center gap-1 sm:gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                        </svg>
                                        <span className="truncate max-w-[140px] sm:max-w-none">{profile.school}</span>
                                    </span>
                                )}
                                {profile.country && (
                                    <span className="flex items-center gap-1 sm:gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {profile.country}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Desktop Action Buttons - inline with avatar/name */}
                        <div className="hidden md:flex items-center gap-2 pb-4" ref={moreMenuRef}>
                            <ActionButtons />
                        </div>
                    </div>

                    {/* Mobile Action Buttons - in a row with dots on the right */}
                    <div className="flex md:hidden flex-row items-center gap-2 mt-3">
                        <ActionButtons isMobile={true} />
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="border-t border-slate-200 dark:border-slate-700 px-3 sm:px-4 md:px-8 overflow-x-auto scrollbar-hide">
                    <nav className="flex gap-1 -mb-px">
                        {tabs.map((tab) =>
                            tab.href ? (
                                <Link
                                    key={tab.id}
                                    href={tab.href}
                                    className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-semibold border-b-[3px] transition-colors text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700 rounded-t-lg whitespace-nowrap"
                                >
                                    {tab.label}
                                </Link>
                            ) : (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-semibold border-b-[3px] transition-colors whitespace-nowrap ${activeTab === tab.id
                                        ? "text-[#25346A] dark:text-blue-400 border-[#25346A] dark:border-blue-400"
                                        : "text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700 rounded-t-lg"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            )
                        )}
                    </nav>
                </div>
            </div>
        </div>
    );
}
