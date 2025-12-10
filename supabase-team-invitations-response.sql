-- Add columns to track invitation responses for notifying the inviter
ALTER TABLE team_invitations 
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS inviter_notified BOOLEAN DEFAULT FALSE;

-- Add index for querying invitations by inviter
CREATE INDEX IF NOT EXISTS idx_team_invitations_inviter_id ON team_invitations(inviter_id);
