-- Promote the organizer "mathwiz" to admin role
-- Run this after running 20251210_add_admin_role.sql

-- Step 1: First, let's see the current user info
SELECT id, username, role, profile_completed 
FROM profiles 
WHERE username = 'mathwiz';

-- Step 2: Promote to admin
UPDATE profiles 
SET role = 'admin'
WHERE username = 'mathwiz' 
  AND role = 'organizer';

-- Step 3: Verify the change
SELECT id, username, role, profile_completed 
FROM profiles 
WHERE username = 'mathwiz';

-- You should see:
-- role changed from 'organizer' to 'admin'

-- Note: The user "mathwiz" will now have access to:
-- - ONLY /admin routes
-- - Cannot access /organizer or /mathlete routes
-- - This is a separate admin role for system management
