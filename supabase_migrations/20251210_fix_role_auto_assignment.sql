-- Fix auto-profile creation to NOT set a default role
-- This ensures new users go through role selection first

-- First, let's see if there's an existing trigger
-- You should check in Supabase Dashboard → Database → Functions & Triggers

-- If there's a trigger like "on_auth_user_created" or "handle_new_user", 
-- it might be setting role='mathlete' by default.

-- Option 1: Modify existing trigger to NOT set role
-- Find the trigger function and change it to:

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role, profile_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    NULL,  -- ← Changed from 'mathlete' to NULL
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Option 2: If no trigger exists, check for default column value in profiles table
-- Run this query to see the default value:
-- SELECT column_name, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name = 'role';

-- If role has a default value like 'mathlete', remove it:
ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;

-- Make sure role can be NULL (so users can select it later)
ALTER TABLE profiles ALTER COLUMN role DROP NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN profiles.role IS 'User role: mathlete or organizer. NULL until user selects a role during signup.';
