-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE task_status AS ENUM ('pending', 'completed');
CREATE TYPE reward_type AS ENUM ('xp', 'badge');

-- Create user_profiles table first (referenced by other tables)
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    total_xp INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date DATE,
    dark_mode BOOLEAN DEFAULT false,
    break_reminder BOOLEAN DEFAULT true,
    lootbox_available_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create other core tables
CREATE TABLE IF NOT EXISTS micro_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    est_minutes INTEGER NOT NULL CHECK (est_minutes > 0 AND est_minutes <= 90),
    status task_status NOT NULL DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type reward_type NOT NULL,
    payload JSONB,
    granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS badges (
    code TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    xp_bonus INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_badges (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_code TEXT REFERENCES badges(code),
    granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, badge_code)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_micro_tasks_user_id ON micro_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_micro_tasks_status ON micro_tasks(status);
CREATE INDEX IF NOT EXISTS idx_rewards_user_id ON rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own tasks" ON micro_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks" ON micro_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON micro_tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON micro_tasks
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own rewards" ON rewards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own badges" ON user_badges
    FOR SELECT USING (auth.uid() = user_id);

-- Insert default badges
INSERT INTO badges (code, title, description, xp_bonus) VALUES
    ('starter', 'Początkujący', 'Ukończ swoje pierwsze zadanie', 10),
    ('momentum', 'Rozpędzony', 'Ukończ 5 zadań w jednym dniu', 20),
    ('week_warrior', 'Wojownik tygodnia', 'Utrzymaj serię przez 7 dni', 50),
    ('consistency', 'Konsekwentny', 'Utrzymaj serię przez 30 dni', 100),
    ('resistance_fighter', 'Pogromca oporu', 'Ukończ zadanie z oporem 9+', 30),
    ('xp_master', 'Mistrz XP', 'Zdobądź 1000 XP', 75)
ON CONFLICT (code) DO NOTHING;