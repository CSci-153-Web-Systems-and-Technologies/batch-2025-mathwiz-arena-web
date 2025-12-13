"use client";

import { useState } from "react";
import OrganizerProfileHeader from "./OrganizerProfileHeader";
import OrganizerStatisticsCard from "./OrganizerStatisticsCard";
import EditOrganizerProfileModal from "./EditOrganizerProfileModal";

interface OrganizerProfileContentProps {
    profile: {
        id: string;
        full_name: string | null;
        username: string | null;
        avatar_url: string | null;
        cover_photo_url: string | null;
        organization: string | null;
        country: string | null;
        province_city: string | null;
        bio: string | null;
    };
    headerStats: {
        competitionsCreated: number;
        totalParticipants: number;
        averageRating: number | null;
    };
    stats: {
        totalCompetitions: number;
        publishedCompetitions: number;
        draftCompetitions: number;
        endedCompetitions: number;
        totalParticipants: number;
        averageRating: number | null;
        topRatedCompetition: { name: string; rating: number } | null;
        mostPopularCompetition: { name: string; participants: number } | null;
        totalRatings: number;
    };
    userEmail: string;
}

export default function OrganizerProfileContent({
    profile,
    headerStats,
    stats,
    userEmail,
}: OrganizerProfileContentProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
            {/* Profile Header */}
            <OrganizerProfileHeader
                profile={profile}
                stats={headerStats}
                isOwnProfile={true}
                onEditProfile={() => setIsEditModalOpen(true)}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Profile Content - Changes based on active tab */}
            <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
                {activeTab === "overview" && (
                    <>
                        {/* Overview: Intro + Statistics side by side */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4 mb-3 sm:mb-4">
                            {/* Left Column - Intro */}
                            <div className="lg:col-span-2">
                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden h-full transition-colors">
                                    <div className="p-3 sm:p-4 h-full flex flex-col">
                                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">Intro</h2>

                                        {/* Bio Textbox */}
                                        <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 min-h-[60px] sm:min-h-[80px] flex items-center justify-center transition-colors">
                                            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm text-center">
                                                {profile?.bio || "No bio yet. Tell us about yourself!"}
                                            </p>
                                        </div>

                                        {/* Info Items */}
                                        <div className="flex-1 flex flex-col justify-evenly gap-2 sm:gap-0">
                                            {profile?.organization && (
                                                <div className="flex items-center gap-2 sm:gap-3 text-slate-600 dark:text-slate-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    <span className="text-xs sm:text-sm">Works at <strong className="text-slate-900 dark:text-white">{profile.organization}</strong></span>
                                                </div>
                                            )}

                                            {(profile?.province_city || profile?.country) && (
                                                <div className="flex items-center gap-2 sm:gap-3 text-slate-600 dark:text-slate-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="text-xs sm:text-sm">From <strong className="text-slate-900 dark:text-white">
                                                        {profile?.province_city && profile?.country
                                                            ? `${profile.province_city}, ${profile.country}`
                                                            : profile?.country || profile?.province_city}
                                                    </strong></span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 sm:gap-3 text-slate-600 dark:text-slate-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span className="text-xs sm:text-sm">@{profile?.username || "username"}</span>
                                            </div>

                                            <div className="flex items-center gap-2 sm:gap-3 text-slate-600 dark:text-slate-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-xs sm:text-sm truncate">{userEmail}</span>
                                            </div>

                                            <div className="flex items-center gap-2 sm:gap-3 text-slate-600 dark:text-slate-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                                </svg>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-[#f49700]/10 text-[#f49700]">
                                                    Organizer
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Statistics */}
                            <div className="lg:col-span-3">
                                <OrganizerStatisticsCard stats={stats} />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Edit Profile Modal */}
            <EditOrganizerProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                profile={{
                    id: profile.id,
                    full_name: profile.full_name,
                    username: profile.username,
                    bio: profile.bio,
                    avatar_url: profile.avatar_url,
                    cover_photo_url: profile.cover_photo_url,
                    organization: profile.organization,
                    country: profile.country,
                    province_city: profile.province_city,
                }}
            />
        </div>
    );
}
