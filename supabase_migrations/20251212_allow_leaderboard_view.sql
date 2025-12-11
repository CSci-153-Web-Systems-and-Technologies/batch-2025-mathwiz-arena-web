-- Migration: Allow all authenticated users to view competition attempts for leaderboard
-- Purpose: Enable the leaderboard feature to show all participants

-- ============================================
-- UPDATE RLS POLICIES FOR COMPETITION_ATTEMPTS
-- ============================================

-- Drop the existing "View own attempts" policy
DROP POLICY IF EXISTS "View own attempts" ON competition_attempts;

-- Create a new policy that allows:
-- 1. Users to see their own attempts (always)
-- 2. All authenticated users to see completed attempts for any competition (for leaderboard)
CREATE POLICY "View attempts for leaderboard"
    ON competition_attempts
    FOR SELECT
    TO authenticated
    USING (
        -- User can always see their own attempts
        mathlete_id = auth.uid()
        OR
        -- All authenticated users can see any completed attempts (for leaderboard)
        is_completed = TRUE
    );

-- Note: The "Admin view all attempts" policy already exists and allows admins/organizers
-- to view all attempts, so we don't need to modify that.

-- ============================================
-- VERIFY THE CHANGE
-- ============================================
-- After running this migration, all authenticated users should be able to view
-- all completed attempts for any competition, which enables the leaderboard feature.

-- To test, run this query as a mathlete:
-- SELECT * FROM competition_attempts WHERE competition_id = 'your-competition-id';
-- You should now see all completed attempts, not just your own.
