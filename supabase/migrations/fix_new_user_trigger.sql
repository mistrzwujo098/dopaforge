-- Fix the handle_new_user function to handle null display names
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (user_id, display_name)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
    )
    ON CONFLICT (user_id) DO NOTHING; -- Prevent duplicate key errors
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Also add RLS policies if missing
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own profile (in case trigger fails)
CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);