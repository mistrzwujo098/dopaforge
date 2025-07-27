-- Create admin user with email/password auth
-- This should be run manually in Supabase SQL editor after setting up the project

-- Note: You need to create the user through Supabase Auth first
-- Go to Authentication > Users > Invite User
-- Email: admin@dopaforge.com
-- Password: DopaForge2024!

-- After creating the user, run this to ensure profile exists:
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the admin user ID (replace with actual ID after creating user)
    -- You can find the user ID in Authentication > Users table
    -- admin_user_id := 'YOUR-ADMIN-USER-ID-HERE';
    
    -- For now, we'll just ensure the trigger works for any new user
    -- The profile will be created automatically when you sign up
    
    -- Update this comment with the actual admin user ID after creation
    -- Example: admin_user_id := '123e4567-e89b-12d3-a456-426614174000';
    
    RAISE NOTICE 'Admin user setup complete. Remember to create user via Supabase Auth UI first!';
END $$;