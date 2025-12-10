-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  team_leader_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  max_members INT DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT teams_name_check CHECK (char_length(name) >= 3)
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  mathlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member', -- 'leader' or 'member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT team_members_unique_member UNIQUE(team_id, mathlete_id),
  CONSTRAINT team_members_role_check CHECK (role IN ('leader', 'member'))
);

-- Create team_invitations table for invite system
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  inviter_notified BOOLEAN DEFAULT FALSE,
  CONSTRAINT team_invitations_status_check CHECK (status IN ('pending', 'accepted', 'rejected')),
  CONSTRAINT team_invitations_unique UNIQUE(team_id, invitee_id)
);

-- Add team_id column to competition_registrations
ALTER TABLE competition_registrations 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_mathlete_id ON team_members(mathlete_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_invitee_id ON team_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_inviter_id ON team_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_competition_registrations_team_id ON competition_registrations(team_id);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams table
-- Allow users to view all teams
CREATE POLICY "Anyone can view teams"
  ON teams FOR SELECT
  USING (true);

-- Allow users to create teams
CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  WITH CHECK (auth.uid() = team_leader_id);

-- Allow team leaders to update their teams
CREATE POLICY "Team leaders can update their teams"
  ON teams FOR UPDATE
  USING (auth.uid() = team_leader_id);

-- Allow team leaders to delete their teams
CREATE POLICY "Team leaders can delete their teams"
  ON teams FOR DELETE
  USING (auth.uid() = team_leader_id);

-- RLS Policies for team_members table
-- Allow anyone to view team members
CREATE POLICY "Anyone can view team members"
  ON team_members FOR SELECT
  USING (true);

-- Allow team leaders to add members
CREATE POLICY "Team leaders can add members"
  ON team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_members.team_id 
      AND teams.team_leader_id = auth.uid()
    )
  );

-- Allow team leaders to remove members or members can remove themselves
CREATE POLICY "Team leaders and members can remove members"
  ON team_members FOR DELETE
  USING (
    mathlete_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_members.team_id 
      AND teams.team_leader_id = auth.uid()
    )
  );

-- RLS Policies for team_invitations table
-- Allow invitees to view their invitations
CREATE POLICY "Users can view invitations sent to them"
  ON team_invitations FOR SELECT
  USING (invitee_id = auth.uid() OR inviter_id = auth.uid());

-- Allow team leaders to create invitations
CREATE POLICY "Team leaders can create invitations"
  ON team_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_invitations.team_id 
      AND teams.team_leader_id = auth.uid()
    )
  );

-- Allow invitees to update invitation status
CREATE POLICY "Invitees can update invitation status"
  ON team_invitations FOR UPDATE
  USING (invitee_id = auth.uid());

-- Allow team leaders to delete invitations
CREATE POLICY "Team leaders can delete invitations"
  ON team_invitations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_invitations.team_id 
      AND teams.team_leader_id = auth.uid()
    )
  );

-- Function to automatically add team leader as a team member
CREATE OR REPLACE FUNCTION add_team_leader_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO team_members (team_id, mathlete_id, role)
  VALUES (NEW.id, NEW.team_leader_id, 'leader');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to add team leader as member when team is created
DROP TRIGGER IF EXISTS trigger_add_team_leader_as_member ON teams;
CREATE TRIGGER trigger_add_team_leader_as_member
  AFTER INSERT ON teams
  FOR EACH ROW
  EXECUTE FUNCTION add_team_leader_as_member();

-- Function to update team updated_at timestamp
CREATE OR REPLACE FUNCTION update_team_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update team timestamp
DROP TRIGGER IF EXISTS trigger_update_team_timestamp ON teams;
CREATE TRIGGER trigger_update_team_timestamp
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_team_timestamp();

-- Function to accept team invitation
CREATE OR REPLACE FUNCTION accept_team_invitation(invitation_id UUID)
RETURNS JSON AS $$
DECLARE
  v_invitation team_invitations%ROWTYPE;
  v_team teams%ROWTYPE;
  v_member_count INT;
BEGIN
  -- Get invitation details
  SELECT * INTO v_invitation
  FROM team_invitations
  WHERE id = invitation_id AND invitee_id = auth.uid() AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invitation not found or already processed');
  END IF;
  
  -- Get team details
  SELECT * INTO v_team FROM teams WHERE id = v_invitation.team_id;
  
  -- Check if team is full
  SELECT COUNT(*) INTO v_member_count FROM team_members WHERE team_id = v_invitation.team_id;
  
  IF v_member_count >= v_team.max_members THEN
    RETURN json_build_object('success', false, 'error', 'Team is full');
  END IF;
  
  -- Add member to team
  INSERT INTO team_members (team_id, mathlete_id, role)
  VALUES (v_invitation.team_id, v_invitation.invitee_id, 'member');
  
  -- Update invitation status and set responded_at for inviter notification
  UPDATE team_invitations
  SET status = 'accepted', updated_at = NOW(), responded_at = NOW(), inviter_notified = FALSE
  WHERE id = invitation_id;
  
  RETURN json_build_object('success', true, 'message', 'Successfully joined team');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
