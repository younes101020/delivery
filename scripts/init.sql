-- init.sql
-- Create system_config table with a single, predefined record
CREATE TABLE IF NOT EXISTS system_config (
    id SERIAL PRIMARY KEY,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_completed_at TIMESTAMP,
    completed_by_user_id TEXT
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM system_config) THEN
        INSERT INTO system_config (onboarding_completed, onboarding_completed_at)
        VALUES (FALSE, NULL);
    END IF;
END $$;

CREATE OR REPLACE FUNCTION check_onboarding_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT onboarding_completed FROM system_config LIMIT 1) THEN
        RAISE EXCEPTION 'System onboarding has already been completed';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER prevent_multiple_onboarding
BEFORE UPDATE ON system_config
FOR EACH ROW
EXECUTE FUNCTION check_onboarding_completion();