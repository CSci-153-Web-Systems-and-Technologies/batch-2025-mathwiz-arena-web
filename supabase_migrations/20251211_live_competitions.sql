-- Add Live Competition support to competitions table
-- Competition modes: "scheduled" (pre-registration with date/time) and "live" (start anytime)

-- =========================
-- MODIFY EXISTING COLUMNS
-- =========================

-- Allow NULL for start_datetime (required for Live competitions)
ALTER TABLE competitions 
ALTER COLUMN start_datetime DROP NOT NULL;

-- =========================
-- ADD NEW COLUMNS
-- =========================

-- competition_mode: Defines if the competition is scheduled or live
ALTER TABLE competitions 
ADD COLUMN IF NOT EXISTS competition_mode VARCHAR(20) DEFAULT 'scheduled' 
CHECK (competition_mode IN ('scheduled', 'live'));

-- max_attempts: Number of attempts allowed for live competitions
-- NULL = unlimited attempts
-- 1, 2, 3... = specific number of attempts
ALTER TABLE competitions 
ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT NULL;

-- is_active: For live competitions, admin can manually pause/close
-- When false, mathletes cannot start new attempts even if registered
ALTER TABLE competitions 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- =========================
-- ADD COMMENTS
-- =========================

COMMENT ON COLUMN competitions.competition_mode IS 
  'Competition mode: scheduled (fixed date/time) or live (start anytime after registration)';

COMMENT ON COLUMN competitions.max_attempts IS 
  'For live competitions: NULL = unlimited attempts, 1+ = specific number of attempts allowed';

COMMENT ON COLUMN competitions.is_active IS 
  'For live competitions: admin can pause/close the competition. When false, no new attempts allowed';

-- =========================
-- UPDATE EXISTING RECORDS
-- =========================

-- Set all existing competitions to "scheduled" mode (they were created with the old system)
UPDATE competitions 
SET competition_mode = 'scheduled' 
WHERE competition_mode IS NULL;

-- Set is_active to true for all existing competitions
UPDATE competitions 
SET is_active = true 
WHERE is_active IS NULL;

-- =========================
-- ADD CONSTRAINTS
-- =========================

-- Ensure scheduled competitions always have start_datetime
-- This prevents data integrity issues where a scheduled competition has no date
ALTER TABLE competitions DROP CONSTRAINT IF EXISTS scheduled_requires_datetime;
ALTER TABLE competitions ADD CONSTRAINT scheduled_requires_datetime 
CHECK (
    (competition_mode = 'live') OR 
    (competition_mode = 'scheduled' AND start_datetime IS NOT NULL) OR
    (competition_mode IS NULL) -- Allow for existing records during migration
);

-- =========================
-- SUMMARY
-- =========================

-- For SCHEDULED competitions:
--   - competition_mode = 'scheduled'
--   - start_datetime is required (date and time when competition starts)
--   - duration_minutes is required
--   - max_attempts is ignored (always 1 attempt during the scheduled window)
--   - is_active controls if competition is open for registration

-- For LIVE competitions:
--   - competition_mode = 'live'
--   - start_datetime can be NULL or used as "available from" date
--   - duration_minutes is required (how long each attempt lasts)
--   - max_attempts: NULL = unlimited, 1+ = specific number
--   - is_active: true = mathletes can start attempts, false = paused/closed

-- Leaderboard display for attempts:
--   - Set attempts (e.g., 3): Shows "1/3", "2/3", "3/3" - best score tracked
--   - Unlimited attempts: Shows "7 attempts", "10 attempts" - best score tracked
