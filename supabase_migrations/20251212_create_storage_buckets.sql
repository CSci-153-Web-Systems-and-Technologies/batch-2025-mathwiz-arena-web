-- ============================================
-- CREATE STORAGE BUCKETS FOR PROFILE IMAGES
-- ============================================
-- Run this in Supabase SQL Editor
-- This creates the required storage buckets for profile pictures and cover photos
-- ============================================

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,  -- Public bucket (images are viewable by anyone)
  2097152,  -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Create covers bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'covers',
  'covers',
  true,  -- Public bucket
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- ============================================
-- STORAGE POLICIES FOR AVATARS BUCKET
-- ============================================

-- Policy: Anyone can view avatars (public read)
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy: Authenticated users can upload their own avatar
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own avatar
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own avatar
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- STORAGE POLICIES FOR COVERS BUCKET
-- ============================================

-- Policy: Anyone can view covers (public read)
DROP POLICY IF EXISTS "Public cover access" ON storage.objects;
CREATE POLICY "Public cover access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'covers');

-- Policy: Authenticated users can upload their own cover
DROP POLICY IF EXISTS "Users can upload own cover" ON storage.objects;
CREATE POLICY "Users can upload own cover"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'covers' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own cover
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

-- Policy: Users can delete their own cover
DROP POLICY IF EXISTS "Users can delete own cover" ON storage.objects;
CREATE POLICY "Users can delete own cover"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'covers' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check buckets were created
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id IN ('avatars', 'covers');

-- Check policies were created
SELECT policyname, tablename FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
