# How to Fix Default Role Auto-Assignment

## Problem
New users registering via OAuth are automatically assigned `role: 'mathlete'` and skip the role selection page.

## Root Cause
There's likely a database trigger or default column value that auto-creates profiles with `role = 'mathlete'`.

## Steps to Fix

### Step 1: Find the Issue in Supabase

1. **Go to Supabase Dashboard**
2. Navigate to **Database** → **Database** → **Functions**
3. Look for a function named something like:
   - `handle_new_user`
   - `on_auth_user_created`
   - `create_profile_for_new_user`

4. **OR** check the `profiles` table:
   - Go to **Database** → **Tables** → **profiles**
   - Click on the **role** column
   - Check if there's a **default value** set

### Step 2: Fix the Trigger Function (if it exists)

If you find a trigger function, it probably looks like this:

```sql
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role, profile_completed)
  VALUES (
    NEW.id,
    NEW.email,
    'mathlete',  -- ❌ BAD: Sets default role
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Change it to:**

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role, profile_completed)
  VALUES (
    NEW.id,
    NEW.email,
    NULL,  -- ✅ GOOD: No default role
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Step 3: Fix Default Column Value (if needed)

In **SQL Editor**, run:

```sql
-- Remove default value from role column
ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;

-- Allow role to be NULL
ALTER TABLE profiles ALTER COLUMN role DROP NOT NULL;
```

### Step 4: Test

1. **Log out** of all accounts
2. **Create a new account** using Google OAuth
3. **Verify** you are taken to `/signup/select-role` page
4. **Select a role** (Mathlete or Organizer)
5. **Verify** you are taken to `/signup/complete-profile`
6. **Complete profile**
7. **Verify** you are taken to the correct dashboard

## Alternative Quick Fix

If you can't find the trigger, you can also:

1. Go to **Database** → **Tables** → **profiles**
2. Check if there are any profiles with `role = 'mathlete'` and `profile_completed = false`
3. Manually set their `role` to `NULL`
4. They'll be redirected to role selection on next login

## Verification

After the fix, new OAuth signups should:
1. ✅ Create profile with `role = NULL`
2. ✅ Redirect to `/signup/select-role`
3. ✅ User selects role → Updates `role` in database
4. ✅ Redirect to `/signup/complete-profile`
5. ✅ Complete profile → Updates `profile_completed = true`
6. ✅ Redirect to dashboard
