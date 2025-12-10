-- Add team size requirement option to competitions table
-- This allows organizers to choose between flexible (min 2) or strict (must be full) team registration

ALTER TABLE competitions 
ADD COLUMN require_full_team BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN competitions.require_full_team IS 'If true, teams must have exactly max_team_members to register. If false, teams need minimum 2 members.';

-- Update existing team competitions to have flexible registration (default behavior)
UPDATE competitions 
SET require_full_team = FALSE 
WHERE participation_type = 'team' AND require_full_team IS NULL;
