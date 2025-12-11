-- Admin read access to all competitions
-- Admins can VIEW all competitions but can only EDIT/DELETE their own
-- Similar to the pattern used for problem_banks

-- =========================
-- COMPETITIONS TABLE
-- =========================

-- First, check if there's an existing policy causing issues
-- and drop it if it exists
DROP POLICY IF EXISTS "Organizers can view own competitions" ON competitions;
DROP POLICY IF EXISTS "Organizers can manage own competitions" ON competitions;
DROP POLICY IF EXISTS "View competitions" ON competitions;
DROP POLICY IF EXISTS "Update own competitions" ON competitions;
DROP POLICY IF EXISTS "Delete own competitions" ON competitions;
DROP POLICY IF EXISTS "Insert competitions" ON competitions;

-- SELECT: Admins can view all, organizers can view their own
CREATE POLICY "View competitions"
  ON competitions
  FOR SELECT
  TO authenticated
  USING (
    -- Organizers can view their own competitions
    organizer_id = auth.uid() OR
    -- Admins can view all competitions
    public.get_user_role() = 'admin'
  );

-- UPDATE: Only creator (organizer_id) can edit
CREATE POLICY "Update own competitions"
  ON competitions
  FOR UPDATE
  TO authenticated
  USING (
    organizer_id = auth.uid()
  )
  WITH CHECK (
    organizer_id = auth.uid()
  );

-- DELETE: Only creator (organizer_id) can delete
CREATE POLICY "Delete own competitions"
  ON competitions
  FOR DELETE
  TO authenticated
  USING (
    organizer_id = auth.uid()
  );

-- INSERT: Organizers and admins can create competitions
CREATE POLICY "Insert competitions"
  ON competitions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Must set organizer_id to yourself
    organizer_id = auth.uid()
  );

-- =========================
-- COMPETITION_PROBLEMS TABLE
-- =========================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "View competition problems" ON competition_problems;
DROP POLICY IF EXISTS "Manage competition problems" ON competition_problems;
DROP POLICY IF EXISTS "Insert competition problems" ON competition_problems;
DROP POLICY IF EXISTS "Update competition problems" ON competition_problems;
DROP POLICY IF EXISTS "Delete competition problems" ON competition_problems;

-- SELECT: Anyone who can view the competition can view its problems
CREATE POLICY "View competition problems"
  ON competition_problems
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM competitions c
      WHERE c.id = competition_problems.competition_id
      AND (
        c.organizer_id = auth.uid() OR
        public.get_user_role() = 'admin'
      )
    )
  );

-- INSERT: Only competition owner can add problems
CREATE POLICY "Insert competition problems"
  ON competition_problems
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM competitions c
      WHERE c.id = competition_problems.competition_id
      AND c.organizer_id = auth.uid()
    )
  );

-- UPDATE: Only competition owner can update problems
CREATE POLICY "Update competition problems"
  ON competition_problems
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM competitions c
      WHERE c.id = competition_problems.competition_id
      AND c.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM competitions c
      WHERE c.id = competition_problems.competition_id
      AND c.organizer_id = auth.uid()
    )
  );

-- DELETE: Only competition owner can delete problems
CREATE POLICY "Delete competition problems"
  ON competition_problems
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM competitions c
      WHERE c.id = competition_problems.competition_id
      AND c.organizer_id = auth.uid()
    )
  );

-- Summary:
-- ✅ Admins can VIEW all competitions and competition_problems (read-only)
-- ❌ Admins CANNOT edit/delete organizer competitions
-- ✅ Admins CAN edit/delete their own competitions
-- ✅ Organizers can view/edit/delete their own competitions
