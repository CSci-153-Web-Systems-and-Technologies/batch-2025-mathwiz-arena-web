-- ============================================
-- MATHLETE PROFILE ENHANCEMENT MIGRATION
-- ============================================
-- Run this migration in Supabase SQL Editor
-- Date: 2025-12-12
-- Purpose: Add columns and tables for enhanced mathlete profile features
-- ============================================

-- ============================================
-- PART 1: Add new columns to profiles table
-- ============================================

-- Add avatar URL column for profile pictures
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add cover photo URL column for profile banner
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;

-- Add bio column for user's about me text
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add comments for documentation
COMMENT ON COLUMN profiles.avatar_url IS 'URL to user profile picture stored in Supabase Storage';
COMMENT ON COLUMN profiles.cover_photo_url IS 'URL to user cover/banner photo stored in Supabase Storage';
COMMENT ON COLUMN profiles.bio IS 'User bio/about me text (max 500 characters recommended)';

-- ============================================
-- PART 2: Create Achievements System
-- ============================================

-- Create achievements definition table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT '🏆', -- emoji or icon name
    badge_color VARCHAR(20) DEFAULT 'blue', -- blue, green, purple, gold, orange, teal
    requirement_type VARCHAR(50) NOT NULL, 
    -- Requirement types:
    -- 'competitions_completed' - Number of competitions completed
    -- 'competitions_won' - Number of 1st place finishes
    -- 'total_score' - Cumulative score across all competitions
    -- 'perfect_scores' - Number of 100% scores
    -- 'teams_joined' - Number of teams joined
    -- 'streak' - Consecutive competition participation
    requirement_value INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user achievements junction table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Metadata for special achievements (e.g., which competition triggered it)
    metadata JSONB DEFAULT '{}',
    UNIQUE(user_id, achievement_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(requirement_type);

-- Add comments
COMMENT ON TABLE achievements IS 'Defines all available achievements/badges that users can earn';
COMMENT ON TABLE user_achievements IS 'Tracks which achievements each user has earned';

-- ============================================
-- PART 3: Enable Row Level Security
-- ============================================

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 4: Create RLS Policies
-- ============================================

-- Achievements policies (everyone can view, only admins can modify)
DROP POLICY IF EXISTS "Everyone can view achievements" ON achievements;
CREATE POLICY "Everyone can view achievements" 
    ON achievements 
    FOR SELECT 
    TO authenticated 
    USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage achievements" ON achievements;
CREATE POLICY "Admins can manage achievements" 
    ON achievements 
    FOR ALL 
    TO authenticated 
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- User achievements policies
DROP POLICY IF EXISTS "Users can view all user achievements" ON user_achievements;
CREATE POLICY "Users can view all user achievements" 
    ON user_achievements 
    FOR SELECT 
    TO authenticated 
    USING (TRUE); -- Everyone can see everyone's achievements (for profile viewing)

DROP POLICY IF EXISTS "System can insert user achievements" ON user_achievements;
CREATE POLICY "System can insert user achievements" 
    ON user_achievements 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- PART 5: Seed Default Achievements
-- ============================================

-- Clear existing achievements if any (for clean reset)
-- DELETE FROM achievements; -- Uncomment this line if you want to reset

-- Insert default achievements
INSERT INTO achievements (name, description, icon, badge_color, requirement_type, requirement_value) VALUES
-- Competition completion achievements
('First Steps', 'Complete your first competition', '🎯', 'green', 'competitions_completed', 1),
('Rising Star', 'Complete 5 competitions', '⭐', 'blue', 'competitions_completed', 5),
('Dedicated', 'Complete 10 competitions', '📚', 'blue', 'competitions_completed', 10),
('Veteran', 'Complete 25 competitions', '🏅', 'purple', 'competitions_completed', 25),
('Legend', 'Complete 50 competitions', '👑', 'gold', 'competitions_completed', 50),

-- Winning achievements
('Winner', 'Win a competition (1st place)', '🏆', 'gold', 'competitions_won', 1),
('Champion', 'Win 3 competitions', '🏆', 'gold', 'competitions_won', 3),
('Grandmaster', 'Win 10 competitions', '🎖️', 'gold', 'competitions_won', 10),

-- Score achievements
('Perfect Score', 'Get 100% on any competition', '💯', 'orange', 'perfect_scores', 1),
('Perfectionist', 'Get 100% on 3 competitions', '✨', 'orange', 'perfect_scores', 3),

-- Team achievements
('Team Player', 'Join your first team', '🤝', 'teal', 'teams_joined', 1),
('Collaborator', 'Be part of 3 teams', '👥', 'teal', 'teams_joined', 3),

-- Score milestones
('Century', 'Earn 100 total points', '💎', 'blue', 'total_score', 100),
('High Achiever', 'Earn 500 total points', '💎', 'purple', 'total_score', 500),
('Point Master', 'Earn 1000 total points', '💎', 'gold', 'total_score', 1000)

ON CONFLICT DO NOTHING; -- Don't insert duplicates if already exists

-- ============================================
-- PART 6: Create Storage Bucket (Manual Step)
-- ============================================
-- NOTE: You need to manually create a storage bucket in Supabase Dashboard
-- Go to: Storage > Create new bucket
-- Bucket name: "avatars"
-- Public: Yes (for profile pictures to be viewable)
-- 
-- Also create bucket: "covers"
-- For cover photos
--
-- Then set up storage policies in the Supabase Dashboard:
-- 
-- For "avatars" bucket:
-- - Allow authenticated users to upload their own avatar
-- - Allow public viewing of avatars
--
-- For "covers" bucket:
-- - Allow authenticated users to upload their own cover photo
-- - Allow public viewing of covers

-- ============================================
-- PART 7: Verification Queries
-- ============================================

-- Verify new columns were added to profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('avatar_url', 'cover_photo_url', 'bio');

-- Verify achievements table was created
SELECT COUNT(*) as achievement_count FROM achievements;

-- View all achievements
SELECT name, description, icon, badge_color, requirement_type, requirement_value 
FROM achievements 
ORDER BY requirement_type, requirement_value;

-- ============================================
-- MIGRATION COMPLETE!
-- ============================================
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Verify the results using the verification queries above
-- 3. Create storage buckets for avatars and covers (see PART 6)
-- 4. The enhanced profile page will use these new fields
