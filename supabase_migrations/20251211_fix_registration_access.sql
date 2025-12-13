-- Migration: Fix competition registrations access for mathletes
-- Purpose: Ensure mathletes can read their own competition registrations

-- ============================================
-- 1. ENABLE RLS ON competition_registrations IF NOT ALREADY ENABLED
-- ============================================

ALTER TABLE competition_registrations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. DROP EXISTING POLICIES (to recreate cleanly)
-- ============================================

DROP POLICY IF EXISTS "Mathletes can view their own registrations" ON competition_registrations;
DROP POLICY IF EXISTS "Mathletes can insert their own registrations" ON competition_registrations;
DROP POLICY IF EXISTS "Mathletes can update their own registrations" ON competition_registrations;
DROP POLICY IF EXISTS "Organizers can view registrations for their competitions" ON competition_registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON competition_registrations;

-- ============================================
-- 3. CREATE SELECT POLICIES
-- ============================================

-- Mathletes can view their own registrations
CREATE POLICY "Mathletes can view their own registrations"
  ON competition_registrations
  FOR SELECT
  TO authenticated
  USING (mathlete_id = auth.uid());

-- Organizers can view registrations for their competitions
CREATE POLICY "Organizers can view registrations for their competitions"
  ON competition_registrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM competitions c
      WHERE c.id = competition_registrations.competition_id
      AND c.organizer_id = auth.uid()
    )
  );

-- Admins can view all registrations
CREATE POLICY "Admins can view all registrations"
  ON competition_registrations
  FOR SELECT
  TO authenticated
  USING (public.get_user_role() = 'admin');

-- ============================================
-- 4. CREATE INSERT POLICIES
-- ============================================

-- Mathletes can register themselves for competitions
CREATE POLICY "Mathletes can insert their own registrations"
  ON competition_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (mathlete_id = auth.uid());

-- ============================================
-- 5. CREATE UPDATE POLICIES
-- ============================================

-- Mathletes can update (e.g., withdraw from) their own registrations
CREATE POLICY "Mathletes can update their own registrations"
  ON competition_registrations
  FOR UPDATE
  TO authenticated
  USING (mathlete_id = auth.uid())
  WITH CHECK (mathlete_id = auth.uid());

-- ============================================
-- SUMMARY
-- ============================================
-- ✅ Mathletes can view their own registrations (needed for competition page access check)
-- ✅ Mathletes can register for competitions
-- ✅ Mathletes can withdraw from competitions (update status)
-- ✅ Organizers can view registrations for their competitions
-- ✅ Admins can view all registrations
