-- ============================================
-- DIAGNOSTIC: Check Cover Photo Setup
-- ============================================
-- Run this in Supabase SQL Editor to diagnose cover photo issues
-- ============================================

-- 1. Check if cover_photo_url column exists in profiles table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name = 'cover_photo_url';
-- Should return 1 row with column_name = 'cover_photo_url'

-- 2. Check if 'covers' storage bucket exists
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'covers';
-- Should return 1 row with id = 'covers'

-- 3. Check storage policies for covers bucket
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%cover%';
-- Should return policies for INSERT, SELECT, UPDATE, DELETE

-- 4. Check RLS policies on profiles table for UPDATE
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles'
  AND cmd = 'UPDATE';
-- Verify there's a policy allowing users to update their own profile

-- 5. Check your current user's profile cover_photo_url value
-- Replace YOUR_USER_ID with your actual user ID from the profiles table
-- SELECT id, cover_photo_url FROM profiles WHERE id = 'YOUR_USER_ID';

-- ============================================
-- If any of the above checks fail, run these fixes:
-- ============================================

-- FIX 1: Add cover_photo_url column if missing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;

-- FIX 2: Create covers bucket if missing
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'covers',
  'covers',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- FIX 3: Create/update storage policies for covers
DROP POLICY IF EXISTS "Public cover access" ON storage.objects;
CREATE POLICY "Public cover access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'covers');

DROP POLICY IF EXISTS "Users can upload own cover" ON storage.objects;
CREATE POLICY "Users can upload own cover"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'covers' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can update own cover" ON storage.objects;
CREATE POLICY "Users can update own cover"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'covers' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'covers' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete own cover" ON storage.objects;
CREATE POLICY "Users can delete own cover"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'covers' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- FIX 4: Ensure profiles RLS allows users to update their own profile
-- This policy should already exist, but just in case:
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ============================================
-- Verify fixes worked:
-- ============================================
SELECT 'covers bucket' as check_type, COUNT(*) as count FROM storage.buckets WHERE id = 'covers'
UNION ALL
SELECT 'cover policies', COUNT(*) FROM pg_policies WHERE policyname LIKE '%cover%'
UNION ALL
SELECT 'cover_photo_url column', COUNT(*) FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'cover_photo_url';
