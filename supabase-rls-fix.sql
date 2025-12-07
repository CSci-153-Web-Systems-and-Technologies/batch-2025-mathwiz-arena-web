-- Fix RLS policies to allow mathletes to view published competitions
-- Run this in your Supabase SQL Editor

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow mathletes to view published competitions" ON competitions;

-- Create policy to allow anyone (mathletes) to view published competitions
CREATE POLICY "Allow mathletes to view published competitions"
ON competitions
FOR SELECT
USING (status = 'published');

-- Also ensure organizers can still view all their own competitions
DROP POLICY IF EXISTS "Organizers can view their own competitions" ON competitions;

CREATE POLICY "Organizers can view their own competitions"
ON competitions
FOR SELECT
USING (auth.uid() = organizer_id);

-- Verify RLS is enabled
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

-- Check the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'competitions';
