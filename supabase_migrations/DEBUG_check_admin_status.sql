-- Check current status of the mathwiz.arena@gmail.com account
-- Run this query first to see what's happening

-- Step 1: Find the user by checking profiles table
SELECT id, username, role, profile_completed, created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- Step 2: If you see the account, check its current role
-- Look for the profile with username containing 'mathwiz' or the email

-- Step 3: If the account exists but role is NOT 'admin', run this:
-- (Replace 'actual-username-here' with the real username from Step 1)

-- Option A: Update by username
UPDATE profiles 
SET role = 'admin'
WHERE username ILIKE '%mathwiz%';

-- Option B: Update by checking user ID from auth.users
-- First find the user ID:
SELECT id, email FROM auth.users WHERE email = 'mathwiz.arena@gmail.com';

-- Then update using that ID:
-- UPDATE profiles SET role = 'admin' WHERE id = 'paste-id-here';

-- Step 4: Verify the update worked
SELECT id, username, role, profile_completed
FROM profiles
WHERE role = 'admin';

-- You should see the mathwiz account with role = 'admin'
