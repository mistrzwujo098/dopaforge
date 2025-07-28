-- Add onboarding status to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS onboarding_data JSONB;

-- Update existing users to have completed onboarding (assuming they're already using the app)
UPDATE user_profiles 
SET has_completed_onboarding = true,
    onboarding_completed_at = COALESCE(created_at, NOW())
WHERE created_at < NOW();