-- Add admin role support to the system
-- This allows promoting organizers to admin role with additional privileges

-- Step 1: Update the role column to allow 'admin' value
-- First, we need to check if the role column has a CHECK constraint

-- If role is a VARCHAR without constraints, this is simple:
-- Just start using 'admin' as a value

-- If role has a CHECK constraint (role IN ('mathlete', 'organizer')), we need to update it:

-- Drop the old constraint if it exists
DO $$ 
BEGIN
  -- Try to drop constraint if it exists
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS check_role;
EXCEPTION 
  WHEN undefined_object THEN 
    -- Constraint doesn't exist, that's fine
    NULL;
END $$;

-- Add new constraint allowing admin role
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('mathlete', 'organizer', 'admin'));

-- Add comment
COMMENT ON CONSTRAINT profiles_role_check ON profiles IS 
  'Ensures role is one of: mathlete, organizer, or admin';

-- Step 2: Create a function to promote organizer to admin (optional, for convenience)
CREATE OR REPLACE FUNCTION promote_to_admin(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Only allow promoting organizers to admin
  UPDATE profiles
  SET role = 'admin'
  WHERE id = user_id 
    AND role = 'organizer';  -- Can only promote organizers
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found or is not an organizer';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Add RLS policy for admin access (example)
-- Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Either viewing your own profile OR you are an admin
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can update any user's role (for user management)
DROP POLICY IF EXISTS "Admins can update user roles" ON profiles;
CREATE POLICY "Admins can update user roles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- User must be an admin to update
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    -- Admin can update any profile
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Add comments for documentation
COMMENT ON COLUMN profiles.role IS 
  'User role: mathlete (student), organizer (creates competitions), or admin (full system access)';

COMMENT ON FUNCTION promote_to_admin IS 
  'Promotes an organizer to admin role. Can only be called by existing admins.';

COMMENT ON FUNCTION is_admin IS 
  'Returns true if the given user ID has admin role.';

-- Example usage after running this migration:
-- To manually promote a user to admin (run in SQL Editor):
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@example.com';
-- 
-- Or use the function:
-- SELECT promote_to_admin('user-uuid-here');
