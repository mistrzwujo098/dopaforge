-- Temporarily disable the trigger that's causing issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a more robust version that doesn't fail
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Only try to insert if the profile doesn't already exist
    INSERT INTO user_profiles (
        user_id, 
        display_name,
        total_xp,
        current_streak,
        longest_streak,
        last_active,
        break_reminder,
        lootbox_available_at
    )
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email, 'User'),
        0,
        0,
        0,
        NOW(),
        true,
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();