"use client";

import { useState } from "react";
import ProfileHeader from "./ProfileHeader";
import EditProfileModal from "./EditProfileModal";

interface ProfileHeaderWithEditProps {
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
    stats: {
        competitionsJoined: number;
        totalScore: number;
        rank: number | null;
        totalParticipants: number;
    };
    isOwnProfile: boolean;
}

export default function ProfileHeaderWithEdit({ profile, stats, isOwnProfile }: ProfileHeaderWithEditProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    return (
        <>
            <ProfileHeader
                profile={profile}
                stats={stats}
                isOwnProfile={isOwnProfile}
                onEditProfile={() => setIsEditModalOpen(true)}
            />

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
        </>
    );
}
