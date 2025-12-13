-- ============================================
-- FIX USER ACHIEVEMENTS INSERT POLICY
-- ============================================
-- This fixes the RLS policy to allow users to insert their own achievements
-- The original policy was too restrictive
-- ============================================

-- Drop the restrictive policy
DROP POLICY IF EXISTS "System can insert user achievements" ON user_achievements;

-- Create a new policy that allows authenticated users to insert their own achievements
CREATE POLICY "Users can insert own achievements" 
    ON user_achievements 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (user_id = auth.uid());

-- Also allow users to update their own achievements (for metadata updates)
DROP POLICY IF EXISTS "Users can update own achievements" ON user_achievements;
CREATE POLICY "Users can update own achievements" 
    ON user_achievements 
    FOR UPDATE 
    TO authenticated 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'user_achievements';
