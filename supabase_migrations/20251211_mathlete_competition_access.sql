-- Migration: Mathlete access to competition problems
-- Purpose: Allow registered mathletes to view problems for competitions they're registered in

-- ============================================
-- 1. DROP EXISTING POLICIES (to recreate with proper access)
-- ============================================

DROP POLICY IF EXISTS "View competition problems" ON competition_problems;

-- ============================================
-- 2. RECREATE VIEW POLICY WITH MATHLETE ACCESS
-- ============================================

-- SELECT: Organizers, admins, AND registered mathletes can view competition problems
CREATE POLICY "View competition problems"
  ON competition_problems
  FOR SELECT
  TO authenticated
  USING (
    -- Organizers can view their own competition problems
    EXISTS (
      SELECT 1 FROM competitions c
      WHERE c.id = competition_problems.competition_id
      AND c.organizer_id = auth.uid()
    )
    OR
    -- Admins can view all competition problems
    public.get_user_role() = 'admin'
    OR
    -- Registered mathletes can view problems for competitions they're registered in
    -- Only when the competition is published
    EXISTS (
      SELECT 1 
      FROM competition_registrations cr
      JOIN competitions c ON c.id = cr.competition_id
      WHERE cr.competition_id = competition_problems.competition_id
      AND cr.mathlete_id = auth.uid()
      AND cr.status = 'registered'
      AND c.status = 'published'
    )
  );

-- ============================================
-- 3. ADD POLICY FOR MATHLETES TO VIEW PUBLISHED COMPETITIONS
-- ============================================

-- Update competitions policy to allow mathletes to view published competitions
DROP POLICY IF EXISTS "View competitions" ON competitions;
DROP POLICY IF EXISTS "Mathletes view published competitions" ON competitions;

CREATE POLICY "View competitions"
  ON competitions
  FOR SELECT
  TO authenticated
  USING (
    -- Organizers can view their own competitions
    organizer_id = auth.uid()
    OR
    -- Admins can view all competitions
    public.get_user_role() = 'admin'
    OR
    -- Anyone can view published competitions
    status = 'published'
  );

-- ============================================
-- 4. ADD POLICY FOR MATHLETES TO VIEW PROBLEMS (base table)
-- ============================================

-- Ensure mathletes can access the problems table for problems in their registered competitions
DROP POLICY IF EXISTS "Mathlete view competition problems" ON problems;

CREATE POLICY "Mathlete view competition problems"
  ON problems
  FOR SELECT
  TO authenticated
  USING (
    -- Existing access (organizers who created the problems)
    EXISTS (
      SELECT 1 FROM problem_banks pb
      WHERE pb.id = problems.problem_bank_id
      AND pb.organizer_id = auth.uid()
    )
    OR
    -- Admins can view all problems
    public.get_user_role() = 'admin'
    OR
    -- Mathletes can view problems that are part of competitions they're registered in
    EXISTS (
      SELECT 1 
      FROM competition_problems cp
      JOIN competition_registrations cr ON cr.competition_id = cp.competition_id
      JOIN competitions c ON c.id = cp.competition_id
      WHERE cp.problem_id = problems.id
      AND cr.mathlete_id = auth.uid()
      AND cr.status = 'registered'
      AND c.status = 'published'
    )
  );

-- ============================================
-- SUMMARY
-- ============================================
-- ✅ Mathletes can now view competition_problems for competitions they're registered in
-- ✅ Mathletes can now view problems data for problems in their registered competitions
-- ✅ Access is only granted when competition status = 'published'
-- ✅ Mathletes must have status = 'registered' in competition_registrations
