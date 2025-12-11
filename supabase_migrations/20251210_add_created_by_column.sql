-- Add created_by column to problem_banks table ONLY
-- This allows tracking whether an admin or organizer created the problem bank

-- Access Control Logic:
-- 1. Organizer-created problem banks → Both organizer and admin can access
-- 2. Admin-created problem banks → ONLY admin can access (organizers cannot)

-- Step 1: Add created_by column to problem_banks
ALTER TABLE problem_banks 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- Step 2: Populate created_by with existing organizer_id values
UPDATE problem_banks 
SET created_by = organizer_id 
WHERE created_by IS NULL;

-- Step 3: Make created_by NOT NULL going forward
ALTER TABLE problem_banks 
ALTER COLUMN created_by SET NOT NULL;

-- Step 4: Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_problem_banks_created_by 
  ON problem_banks(created_by);

-- Step 5: Update RLS policies with new access control logic
DROP POLICY IF EXISTS "Organizers and admins can view problem banks" ON problem_banks;
DROP POLICY IF EXISTS "Problem bank access control" ON problem_banks;

CREATE POLICY "Problem bank access control"
  ON problem_banks
  FOR SELECT
  TO authenticated
  USING (
    -- Can view if:
    -- 1. You are the organizer who owns it (organizer_id = your id)
    -- 2. You are an admin AND the creator is NOT an admin (creator is organizer)
    -- 3. You are an admin AND you created it yourself
    organizer_id = auth.uid() OR
    (
      public.get_user_role() = 'admin' AND
      (
        created_by = auth.uid() OR  -- Admin created it themselves
        (SELECT role FROM profiles WHERE id = created_by) != 'admin'  -- Creator is NOT admin
      )
    )
  );

-- Step 6: Handle problems table (if it exists and needs the same logic)
-- First, check if problems table has organizer_id column
DO $$
BEGIN
  -- Only add created_by if problems table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'problems') THEN
    -- Add created_by column
    ALTER TABLE problems ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
    
    -- Check if problems has organizer_id column
    IF EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'problems' AND column_name = 'organizer_id'
    ) THEN
      -- Populate from organizer_id
      UPDATE problems SET created_by = organizer_id WHERE created_by IS NULL;
    ELSE
      -- No organizer_id, try to get from problem_bank relationship
      UPDATE problems p
      SET created_by = pb.organizer_id
      FROM problem_banks pb
      WHERE p.problem_bank_id = pb.id AND p.created_by IS NULL;
    END IF;
    
    -- Make NOT NULL if we successfully populated it
    IF NOT EXISTS (SELECT FROM problems WHERE created_by IS NULL) THEN
      ALTER TABLE problems ALTER COLUMN created_by SET NOT NULL;
    END IF;
    
    -- Add index
    CREATE INDEX IF NOT EXISTS idx_problems_created_by ON problems(created_by);
    
    -- Update policy
    DROP POLICY IF EXISTS "Organizers and admins can view problems" ON problems;
    DROP POLICY IF EXISTS "Problem access control" ON problems;
    
    CREATE POLICY "Problem access control"
      ON problems
      FOR SELECT
      TO authenticated
      USING (
        -- Check via problem_bank ownership or direct creator
        EXISTS (
          SELECT 1 FROM problem_banks pb
          WHERE pb.id = problems.problem_bank_id
          AND (
            pb.organizer_id = auth.uid() OR
            (
              public.get_user_role() = 'admin' AND
              (
                pb.created_by = auth.uid() OR
                (SELECT role FROM profiles WHERE id = pb.created_by) != 'admin'
              )
            )
          )
        )
      );
  END IF;
END $$;

-- Step 7: Add comments for documentation
COMMENT ON COLUMN problem_banks.created_by IS 
  'User who created this problem bank. Used for access control: admin-created banks are private to admins.';

-- Verification queries:
-- SELECT id, title, organizer_id, created_by FROM problem_banks;
-- SELECT * FROM pg_policies WHERE tablename = 'problem_banks';
