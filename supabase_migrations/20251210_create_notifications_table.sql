-- Create notifications table
-- This table stores all types of notifications for users (team invitations, competitions, achievements, etc.)

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL, 
  -- Types: 'team_invitation_response', 'team_invitation_received', 'competition_starting', 
  --        'competition_result', 'team_member_joined', 'team_member_left', 'system_announcement'
  
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT, -- Optional URL to navigate when notification is clicked
  related_id UUID, -- ID of related entity (invitation_id, competition_id, team_id, etc.)
  metadata JSONB, -- Additional data specific to notification type
  
  status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('read', 'unread')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'notifications_user_id_fkey'
  ) THEN
    ALTER TABLE notifications 
    ADD CONSTRAINT notifications_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Allow system to insert notifications (for triggers)
CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policy: Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_as_read()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'read' AND OLD.status = 'unread' THEN
    NEW.read_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set read_at timestamp
CREATE TRIGGER set_notification_read_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION mark_notification_as_read();

-- Function to create notification for team invitation response
CREATE OR REPLACE FUNCTION create_team_invitation_response_notification()
RETURNS TRIGGER AS $$
DECLARE
  team_name TEXT;
  invitee_name TEXT;
BEGIN
  -- Only create notification when status changes to accepted or rejected
  IF (NEW.status IN ('accepted', 'rejected') AND OLD.status = 'pending') THEN
    -- Get team name
    SELECT name INTO team_name FROM teams WHERE id = NEW.team_id;
    
    -- Get invitee name
    SELECT COALESCE(full_name, username) INTO invitee_name 
    FROM profiles WHERE id = NEW.invitee_id;
    
    -- Create notification for the inviter
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      action_url,
      related_id,
      metadata,
      status
    ) VALUES (
      NEW.inviter_id,
      'team_invitation_response',
      CASE 
        WHEN NEW.status = 'accepted' THEN 'Invitation Accepted'
        ELSE 'Invitation Declined'
      END,
      CASE 
        WHEN NEW.status = 'accepted' THEN invitee_name || ' accepted your invitation to "' || team_name || '"'
        ELSE invitee_name || ' declined your invitation to "' || team_name || '"'
      END,
      '/mathlete/teams/' || NEW.team_id,
      NEW.id,
      jsonb_build_object(
        'team_id', NEW.team_id,
        'team_name', team_name,
        'invitee_id', NEW.invitee_id,
        'invitee_name', invitee_name,
        'response', NEW.status
      ),
      'unread'
    );
    
    -- Mark old field as notified (for backward compatibility)
    NEW.inviter_notified = false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create notification when invitation is responded to
DROP TRIGGER IF EXISTS team_invitation_response_notification ON team_invitations;
CREATE TRIGGER team_invitation_response_notification
  AFTER UPDATE ON team_invitations
  FOR EACH ROW
  EXECUTE FUNCTION create_team_invitation_response_notification();

-- Function to create notification when user receives team invitation
CREATE OR REPLACE FUNCTION create_team_invitation_received_notification()
RETURNS TRIGGER AS $$
DECLARE
  team_name TEXT;
  inviter_name TEXT;
BEGIN
  -- Only create notification for new pending invitations
  IF NEW.status = 'pending' THEN
    -- Get team name
    SELECT name INTO team_name FROM teams WHERE id = NEW.team_id;
    
    -- Get inviter name
    SELECT COALESCE(full_name, username) INTO inviter_name 
    FROM profiles WHERE id = NEW.inviter_id;
    
    -- Create notification for the invitee
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      action_url,
      related_id,
      metadata,
      status
    ) VALUES (
      NEW.invitee_id,
      'team_invitation_received',
      'Team Invitation',
      inviter_name || ' invited you to join "' || team_name || '"',
      '/mathlete/notifications',
      NEW.id,
      jsonb_build_object(
        'team_id', NEW.team_id,
        'team_name', team_name,
        'inviter_id', NEW.inviter_id,
        'inviter_name', inviter_name
      ),
      'unread'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create notification when invitation is sent
DROP TRIGGER IF EXISTS team_invitation_received_notification ON team_invitations;
CREATE TRIGGER team_invitation_received_notification
  AFTER INSERT ON team_invitations
  FOR EACH ROW
  EXECUTE FUNCTION create_team_invitation_received_notification();

-- Add comments for documentation
COMMENT ON TABLE notifications IS 'Stores all user notifications (team invitations, competitions, achievements, etc.)';
COMMENT ON COLUMN notifications.type IS 'Type of notification: team_invitation_response, team_invitation_received, competition_starting, etc.';
COMMENT ON COLUMN notifications.status IS 'Read status: read or unread';
COMMENT ON COLUMN notifications.related_id IS 'UUID of the related entity (invitation_id, competition_id, etc.)';
COMMENT ON COLUMN notifications.metadata IS 'Additional JSON data specific to the notification type';
