-- Update RLS policies for admin read-only access
-- Admins can VIEW but NOT EDIT/DELETE organizer problem banks and problems

-- =========================
-- PROBLEM_BANKS TABLE
-- =========================

-- SELECT: Admins can view all, organizers can view their own
DROP POLICY IF EXISTS "Problem bank access control" ON problem_banks;

CREATE POLICY "View problem banks"
  ON problem_banks
  FOR SELECT
  TO authenticated
  USING (
    -- Organizers can view their own
    organizer_id = auth.uid() OR
    -- Admins can view all (both organizer-created and admin-created)
    public.get_user_role() = 'admin'
  );

-- UPDATE: Only creator can edit
DROP POLICY IF EXISTS "Update own problem banks" ON problem_banks;

CREATE POLICY "Update own problem banks"
  ON problem_banks
  FOR UPDATE
  TO authenticated
  USING (
    -- Only the creator (organizer_id) can edit
    organizer_id = auth.uid()
  )
  WITH CHECK (
    organizer_id = auth.uid()
  );

-- DELETE: Only creator can delete
DROP POLICY IF EXISTS "Delete own problem banks" ON problem_banks;

CREATE POLICY "Delete own problem banks"
  ON problem_banks
  FOR DELETE
  TO authenticated
  USING (
    -- Only the creator (organizer_id) can delete
    organizer_id = auth.uid()
  );

-- INSERT: Any authenticated user can create
DROP POLICY IF EXISTS "Insert problem banks" ON problem_banks;

CREATE POLICY "Insert problem banks"
  ON problem_banks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Must set organizer_id to yourself
    organizer_id = auth.uid() AND
    -- Must set created_by to yourself
    created_by = auth.uid()
  );

-- =========================
-- PROBLEMS TABLE
-- =========================

-- SELECT: Admins can view all, organizers can view their own
DROP POLICY IF EXISTS "Problem access control" ON problems;

CREATE POLICY "View problems"
  ON problems
  FOR SELECT
  TO authenticated
  USING (
    -- Check via problem_bank access
    EXISTS (
      SELECT 1 FROM problem_banks pb
      WHERE pb.id = problems.problem_bank_id
      AND (
        -- Organizer owns the problem bank
        pb.organizer_id = auth.uid() OR
        -- Admin can view all
        public.get_user_role() = 'admin'
      )
    )
  );

-- UPDATE: Only owner of problem bank can edit
DROP POLICY IF EXISTS "Update own problems" ON problems;

CREATE POLICY "Update own problems"
  ON problems
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM problem_banks pb
      WHERE pb.id = problems.problem_bank_id
      AND pb.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM problem_banks pb
      WHERE pb.id = problems.problem_bank_id
      AND pb.organizer_id = auth.uid()
    )
  );

-- DELETE: Only owner of problem bank can delete
DROP POLICY IF EXISTS "Delete own problems" ON problems;

CREATE POLICY "Delete own problems"
  ON problems
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM problem_banks pb
      WHERE pb.id = problems.problem_bank_id
      AND pb.organizer_id = auth.uid()
    )
  );

-- INSERT: Only owner of problem bank can add problems
DROP POLICY IF EXISTS "Insert problems" ON problems;

CREATE POLICY "Insert problems"
  ON problems
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM problem_banks pb
      WHERE pb.id = problems.problem_bank_id
      AND pb.organizer_id = auth.uid()
    ) AND
    created_by = auth.uid()
  );

-- Summary:
-- ✅ Admins can VIEW all problem banks and problems (read-only)
-- ❌ Admins CANNOT edit/delete organizer problem banks
-- ✅ Organizers can view/edit/delete their own problem banks
-- ✅ Admin-created problem banks are only visible to admins (via created_by check in UI)
