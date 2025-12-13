-- Migration: Competition Attempts and Answers
-- Purpose: Track mathlete attempts in Live competitions and their answers to problems

-- ============================================
-- 1. COMPETITION ATTEMPTS TABLE
-- ============================================
-- Tracks each attempt a mathlete makes in a competition (especially for Live competitions)

CREATE TABLE IF NOT EXISTS competition_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    mathlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    total_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Ensure unique attempt numbers per mathlete per competition
    UNIQUE(competition_id, mathlete_id, attempt_number)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_competition_attempts_competition ON competition_attempts(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_attempts_mathlete ON competition_attempts(mathlete_id);
CREATE INDEX IF NOT EXISTS idx_competition_attempts_team ON competition_attempts(team_id);

-- ============================================
-- 2. COMPETITION ANSWERS TABLE
-- ============================================
-- Tracks individual problem answers within an attempt

CREATE TABLE IF NOT EXISTS competition_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES competition_attempts(id) ON DELETE CASCADE,
    competition_problem_id UUID NOT NULL REFERENCES competition_problems(id) ON DELETE CASCADE,
    answer TEXT,
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0,
    answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    time_spent_seconds INTEGER, -- Time spent on this problem
    
    -- Each problem can only be answered once per attempt
    UNIQUE(attempt_id, competition_problem_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_competition_answers_attempt ON competition_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_competition_answers_problem ON competition_answers(competition_problem_id);

-- ============================================
-- 3. ENABLE RLS
-- ============================================

ALTER TABLE competition_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_answers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. RLS POLICIES FOR COMPETITION_ATTEMPTS
-- ============================================

-- Mathletes can view their own attempts
DROP POLICY IF EXISTS "View own attempts" ON competition_attempts;
CREATE POLICY "View own attempts"
    ON competition_attempts
    FOR SELECT
    TO authenticated
    USING (mathlete_id = auth.uid());

-- Mathletes can insert their own attempts
DROP POLICY IF EXISTS "Insert own attempts" ON competition_attempts;
CREATE POLICY "Insert own attempts"
    ON competition_attempts
    FOR INSERT
    TO authenticated
    WITH CHECK (mathlete_id = auth.uid());

-- Mathletes can update their own attempts
DROP POLICY IF EXISTS "Update own attempts" ON competition_attempts;
CREATE POLICY "Update own attempts"
    ON competition_attempts
    FOR UPDATE
    TO authenticated
    USING (mathlete_id = auth.uid());

-- Admins/Organizers can view all attempts for their competitions
DROP POLICY IF EXISTS "Admin view all attempts" ON competition_attempts;
CREATE POLICY "Admin view all attempts"
    ON competition_attempts
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'organizer')
        )
    );

-- ============================================
-- 5. RLS POLICIES FOR COMPETITION_ANSWERS
-- ============================================

-- Mathletes can view their own answers (via attempt)
DROP POLICY IF EXISTS "View own answers" ON competition_answers;
CREATE POLICY "View own answers"
    ON competition_answers
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM competition_attempts ca
            WHERE ca.id = competition_answers.attempt_id
            AND ca.mathlete_id = auth.uid()
        )
    );

-- Mathletes can insert their own answers
DROP POLICY IF EXISTS "Insert own answers" ON competition_answers;
CREATE POLICY "Insert own answers"
    ON competition_answers
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM competition_attempts ca
            WHERE ca.id = competition_answers.attempt_id
            AND ca.mathlete_id = auth.uid()
        )
    );

-- Mathletes can update their own answers (before attempt is completed)
DROP POLICY IF EXISTS "Update own answers" ON competition_answers;
CREATE POLICY "Update own answers"
    ON competition_answers
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM competition_attempts ca
            WHERE ca.id = competition_answers.attempt_id
            AND ca.mathlete_id = auth.uid()
            AND ca.is_completed = FALSE
        )
    );

-- Admins/Organizers can view all answers
DROP POLICY IF EXISTS "Admin view all answers" ON competition_answers;
CREATE POLICY "Admin view all answers"
    ON competition_answers
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'organizer')
        )
    );

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to get the next attempt number for a mathlete in a competition
CREATE OR REPLACE FUNCTION get_next_attempt_number(p_competition_id UUID, p_mathlete_id UUID)
RETURNS INTEGER AS $$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(attempt_number), 0) + 1
    INTO next_num
    FROM competition_attempts
    WHERE competition_id = p_competition_id
    AND mathlete_id = p_mathlete_id;
    
    RETURN next_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a mathlete can start a new attempt
CREATE OR REPLACE FUNCTION can_start_attempt(p_competition_id UUID, p_mathlete_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    comp_record RECORD;
    current_attempts INTEGER;
    has_active_attempt BOOLEAN;
BEGIN
    -- Get competition details
    SELECT competition_mode, max_attempts, is_active
    INTO comp_record
    FROM competitions
    WHERE id = p_competition_id;
    
    -- If competition is not found or not active, cannot start
    IF comp_record IS NULL OR comp_record.is_active = FALSE THEN
        RETURN FALSE;
    END IF;
    
    -- Check for active (uncompleted) attempts
    SELECT EXISTS (
        SELECT 1 FROM competition_attempts
        WHERE competition_id = p_competition_id
        AND mathlete_id = p_mathlete_id
        AND is_completed = FALSE
    ) INTO has_active_attempt;
    
    -- Cannot start new attempt if there's an active one
    IF has_active_attempt THEN
        RETURN FALSE;
    END IF;
    
    -- For Live competitions, check attempt limits
    IF comp_record.competition_mode = 'live' THEN
        IF comp_record.max_attempts IS NULL THEN
            -- Unlimited attempts
            RETURN TRUE;
        ELSE
            -- Check current attempt count
            SELECT COUNT(*)
            INTO current_attempts
            FROM competition_attempts
            WHERE competition_id = p_competition_id
            AND mathlete_id = p_mathlete_id;
            
            RETURN current_attempts < comp_record.max_attempts;
        END IF;
    END IF;
    
    -- For scheduled competitions, only 1 attempt allowed
    SELECT COUNT(*)
    INTO current_attempts
    FROM competition_attempts
    WHERE competition_id = p_competition_id
    AND mathlete_id = p_mathlete_id;
    
    RETURN current_attempts = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE competition_attempts IS 'Tracks each attempt a mathlete makes in a competition';
COMMENT ON TABLE competition_answers IS 'Tracks individual problem answers within an attempt';
