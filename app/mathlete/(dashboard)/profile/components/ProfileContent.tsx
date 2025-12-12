"use client";

import { useState } from "react";
import ProfileHeader from "./ProfileHeader";
import EditProfileModal from "./EditProfileModal";
import StatisticsCard from "./StatisticsCard";
import AchievementBadges from "./AchievementBadges";
import AchievementsDetailView from "./AchievementsDetailView";

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    badge_color: string;
    earned_at: string;
}

interface AllAchievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    badge_color: string;
    requirement_type: string;
    requirement_value: number;
    is_active: boolean;
}

interface ProfileContentProps {
    profile: {
        id: string;
        full_name: string | null;
        username: string | null;
        avatar_url: string | null;
        cover_photo_url: string | null;
        school: string | null;
        country: string | null;
        province_city: string | null;
        bio: string | null;
    };
    headerStats: {
        competitionsJoined: number;
        totalScore: number;
        rank: number | null;
        totalParticipants: number;
    };
    stats: {
        competitionsCompleted: number;
        totalScore: number;
        averageScore: number;
        bestScore: number;
        bestCompetition: string | null;
        wins: number;
        topThree: number;
        perfectScores: number;
        winRate: number;
    };
    achievements: Achievement[];
    allAchievements: AllAchievement[];
    totalAchievements: number;
    userEmail: string;
}

export default function ProfileContent({
    profile,
    headerStats,
    stats,
    achievements,
    allAchievements,
    totalAchievements,
    userEmail,
}: ProfileContentProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
            {/* Profile Header */}
            <ProfileHeader
                profile={profile}
                stats={headerStats}
                isOwnProfile={true}
                onEditProfile={() => setIsEditModalOpen(true)}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Profile Content - Changes based on active tab */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {activeTab === "overview" ? (
                    <>
                        {/* Overview: Intro + Statistics side by side */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
                            {/* Left Column - Intro */}
                            <div className="lg:col-span-2">
                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden h-full">
                                    <div className="p-4 h-full flex flex-col">
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Intro</h2>

                                        {/* Bio Textbox */}
                                        <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-4 mb-4 min-h-[80px] flex items-center justify-center">
                                            <p className="text-slate-600 dark:text-slate-300 text-sm text-center">
                                                {profile?.bio || "No bio yet. Tell us about yourself!"}
                                            </p>
                                        </div>

                                        {/* Info Items */}
                                        <div className="flex-1 flex flex-col justify-evenly">
                                            {profile?.school && (
                                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                                    </svg>
                                                    <span>Studies at <strong className="text-slate-900 dark:text-white">{profile.school}</strong></span>
                                                </div>
                                            )}

                                            {(profile?.province_city || profile?.country) && (
                                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span>From <strong className="text-slate-900 dark:text-white">
                                                        {profile?.province_city && profile?.country
                                                            ? `${profile.province_city}, ${profile.country}`
                                                            : profile?.country || profile?.province_city}
                                                    </strong></span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span>@{profile?.username || "username"}</span>
                                            </div>

                                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span>{userEmail}</span>
                                            </div>

                                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                                </svg>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Mathlete
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Statistics */}
                            <div className="lg:col-span-3">
                                <StatisticsCard stats={stats} />
                            </div>
                        </div>

                        {/* Full Width Row - Achievements Summary */}
                        <div>
                            <AchievementBadges
                                achievements={achievements}
                                totalAvailable={totalAchievements}
                            />
                        </div>
                    </>
                ) : activeTab === "achievements" ? (
                    /* Achievements Detail View */
                    <AchievementsDetailView
                        earnedAchievements={achievements}
                        allAchievements={allAchievements}
                    />
                ) : null}
            </div>

            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                profile={{
                    id: profile.id,
                    full_name: profile.full_name,
                    username: profile.username,
                    bio: profile.bio,
                    avatar_url: profile.avatar_url,
                    cover_photo_url: profile.cover_photo_url,
                    school: profile.school,
                    country: profile.country,
                    province_city: profile.province_city,
                }}
            />
        </div>
    );
}
