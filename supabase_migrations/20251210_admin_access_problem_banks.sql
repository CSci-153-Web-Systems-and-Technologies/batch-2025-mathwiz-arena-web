-- DEPRECATED: This migration is superseded by 20251210_add_created_by_column.sql
-- That migration includes the proper access control logic with created_by column

-- If you already ran this migration, you can safely run the newer one
-- The newer migration will drop and recreate these policies with the correct logic

-- This file is kept for reference only
-- DO NOT RUN THIS - Use 20251210_add_created_by_column.sql instead

/*
-- Original content (OUTDATED):

-- Add admin access to problem_banks table
-- Admins should be able to view all problem banks from all organizers

DROP POLICY IF EXISTS "Users can view their own problem banks" ON problem_banks;
DROP POLICY IF EXISTS "Admins can view all problem banks" ON problem_banks;

CREATE POLICY "Organizers and admins can view problem banks"
  ON problem_banks
  FOR SELECT
  TO authenticated
  USING (
    organizer_id = auth.uid() OR 
    public.get_user_role() = 'admin'
  );

DROP POLICY IF EXISTS "Users can view their own problems" ON problems;
DROP POLICY IF EXISTS "Admins can view all problems" ON problems;

CREATE POLICY "Organizers and admins can view problems"
  ON problems
  FOR SELECT
  TO authenticated
  USING (
    organizer_id = auth.uid() OR 
    public.get_user_role() = 'admin'
  );
*/
