-- ============================================
-- ADD ORGANIZATION COLUMN FOR ORGANIZERS
-- ============================================
-- Run this in Supabase SQL Editor
-- This adds an organization column for organizer profiles
-- ============================================

-- Add organization column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.organization IS 'Organization name for organizer users';

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'organization';
