-- ==========================================
-- Teams Table
-- ==========================================

CREATE TABLE IF NOT EXISTS teams (
    id BIGSERIAL PRIMARY KEY,

    team_name VARCHAR(100) NOT NULL,

    team_lead VARCHAR(100) NOT NULL,

    department VARCHAR(100) NOT NULL,

    status VARCHAR(20) DEFAULT 'Active',

    description TEXT,

    members TEXT[] DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),

    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updated At Trigger
CREATE OR REPLACE FUNCTION update_teams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_teams_updated_at ON teams;

CREATE TRIGGER trg_teams_updated_at
BEFORE UPDATE ON teams
FOR EACH ROW
EXECUTE FUNCTION update_teams_updated_at();