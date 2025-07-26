-- path: supabase/seed.sql

-- Seed test users (these would be created via auth.users in real scenario)
-- For development, you'll need to create users via Supabase Auth first
-- Then use their IDs here

-- Example seed data structure (run after creating users via Auth)
/*
-- Assuming you have created 5 test users, replace these UUIDs with actual user IDs
INSERT INTO user_profiles (user_id, display_name, total_xp, current_streak) VALUES
    ('user-uuid-1', 'Test User 1', 250, 3),
    ('user-uuid-2', 'Test User 2', 750, 7),
    ('user-uuid-3', 'Test User 3', 1200, 12),
    ('user-uuid-4', 'Test User 4', 450, 2),
    ('user-uuid-5', 'Test User 5', 2100, 21);

-- Seed micro tasks for each user
INSERT INTO micro_tasks (user_id, title, est_minutes, status, display_order) VALUES
    -- User 1 tasks
    ('user-uuid-1', 'Write project proposal introduction', 45, 'completed', 1),
    ('user-uuid-1', 'Review competitor analysis', 30, 'completed', 2),
    ('user-uuid-1', 'Update team on progress', 15, 'pending', 3),
    ('user-uuid-1', 'Prepare slides for presentation', 60, 'pending', 4),
    ('user-uuid-1', 'Schedule client meeting', 15, 'pending', 5),
    
    -- User 2 tasks
    ('user-uuid-2', 'Code review for PR #123', 30, 'completed', 1),
    ('user-uuid-2', 'Fix authentication bug', 90, 'completed', 2),
    ('user-uuid-2', 'Write unit tests for API', 60, 'pending', 3),
    ('user-uuid-2', 'Update documentation', 30, 'pending', 4),
    ('user-uuid-2', 'Refactor database queries', 75, 'pending', 5);

-- Grant some rewards
INSERT INTO rewards (user_id, type, payload) VALUES
    ('user-uuid-1', 'xp', '{"amount": 45}'::jsonb),
    ('user-uuid-1', 'xp', '{"amount": 30}'::jsonb),
    ('user-uuid-2', 'xp', '{"amount": 30}'::jsonb),
    ('user-uuid-2', 'xp', '{"amount": 90}'::jsonb),
    ('user-uuid-3', 'badge', '{"code": "starter"}'::jsonb),
    ('user-uuid-3', 'badge', '{"code": "momentum"}'::jsonb);

-- Grant badges to users
INSERT INTO user_badges (user_id, badge_code) VALUES
    ('user-uuid-1', 'starter'),
    ('user-uuid-2', 'starter'),
    ('user-uuid-2', 'momentum'),
    ('user-uuid-3', 'starter'),
    ('user-uuid-3', 'momentum'),
    ('user-uuid-3', 'week_warrior'),
    ('user-uuid-5', 'starter'),
    ('user-uuid-5', 'momentum'),
    ('user-uuid-5', 'flow_master');
*/

-- Note: To properly seed data, first create users via Supabase Auth
-- Then run the above queries with actual user IDs