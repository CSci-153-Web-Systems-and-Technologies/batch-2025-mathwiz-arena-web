-- Migration: Fix team registration RLS policy
-- Purpose: Allow team leaders to register all team members for team-based competitions

-- ============================================
-- 1. DROP EXISTING INSERT POLICY
-- ============================================

DROP POLICY IF EXISTS "Mathletes can insert their own registrations" ON competition_registrations;

-- ============================================
-- 2. CREATE NEW INSERT POLICY FOR TEAM REGISTRATIONS
-- ============================================

-- Allow mathletes to insert registrations where:
-- 1. They are registering themselves (for individual competitions), OR
-- 2. They are a team leader registering their team members (for team competitions)
CREATE POLICY "Mathletes can insert registrations"
  ON competition_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Case 1: User is registering themselves
    mathlete_id = auth.uid()
    OR
    -- Case 2: User is a team leader registering team members
    (
      -- The registration has a team_id
      team_id IS NOT NULL
      AND
      -- The user is the leader of that team
      EXISTS (
        SELECT 1 FROM teams t
        WHERE t.id = team_id
        AND t.team_leader_id = auth.uid()
      )
      AND
      -- The mathlete being registered is a member of that team
      EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = competition_registrations.team_id
        AND tm.mathlete_id = competition_registrations.mathlete_id
      )
    )
  );

-- ============================================
-- SUMMARY
-- ============================================
-- ✅ Individual users can register themselves
-- ✅ Team leaders can register all team members for team competitions
-- ✅ Team leader can only register people who are actually on their team
