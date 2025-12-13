-- Fix infinite recursion in admin RLS policies
-- The problem: policies that check profiles.role = 'admin' cause infinite loops

-- Step 1: Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON profiles;

-- Step 2: Create a security definer function in public schema to check admin without recursion
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- Step 3: Recreate policies using the function (no recursion)
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Either viewing your own profile OR you are an admin
    auth.uid() = id OR 
    public.get_user_role() = 'admin'
  );

CREATE POLICY "Admins can update user roles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- User must be an admin to update
    public.get_user_role() = 'admin'
  )
  WITH CHECK (
    -- Admin can update any profile
    public.get_user_role() = 'admin'
  );

-- Step 4: Verify the fix
-- This should now work without infinite recursion
SELECT id, username, role FROM profiles LIMIT 5;
