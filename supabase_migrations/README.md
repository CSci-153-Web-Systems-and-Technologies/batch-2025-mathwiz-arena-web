# Supabase Migrations

This folder contains SQL migration files for the Mathwiz Arena database.

## Migration Files

### `20251210_create_notifications_table.sql`
Creates the notifications system for the application.

**What it includes:**
- ✅ `notifications` table with proper schema
- ✅ Indexes for query performance
- ✅ Row Level Security (RLS) policies
- ✅ Automatic triggers to create notifications when:
  - Team invitation is sent → notifies invitee
  - Team invitation is accepted/rejected → notifies inviter
- ✅ Helper functions for marking notifications as read

**Notification Types Supported:**
- `team_invitation_response` - When someone accepts/rejects your team invitation
- `team_invitation_received` - When you receive a team invitation
- `competition_starting` - (Future) When a competition is about to start
- `competition_result` - (Future) When competition results are published
- `team_member_joined` - (Future) When someone joins your team
- `team_member_left` - (Future) When someone leaves your team
- `system_announcement` - (Future) System-wide announcements

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of the migration file
5. Click **Run** to execute

### Option 2: Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push
```

### Option 3: Manual psql
```bash
psql -h <your-supabase-db-host> -U postgres -d postgres -f supabase_migrations/20251210_create_notifications_table.sql
```

## Migration Order

Migrations should be run in chronological order (by the date prefix in the filename).

1. `20251210_create_notifications_table.sql`
2. (Future migrations will be added here)

## Testing After Migration

After running the migration, test it by:

1. **Check table exists:**
   ```sql
   SELECT * FROM notifications LIMIT 1;
   ```

2. **Test notification creation:**
   - Send a team invitation
   - Accept/reject an invitation
   - Check if notifications are created automatically

3. **Verify RLS policies:**
   - Try accessing notifications from different users
   - Ensure users can only see their own notifications

## Notes

- All migrations use `IF NOT EXISTS` and `DROP IF EXISTS` to be idempotent (can run multiple times safely)
- RLS is enabled by default for security
- Triggers automatically create notifications - no manual intervention needed
- Backward compatible with existing `team_invitations.inviter_notified` field
