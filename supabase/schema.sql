-- path: supabase/schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE task_status AS ENUM ('pending', 'completed');
CREATE TYPE reward_type AS ENUM ('xp', 'badge');

-- Create tables
CREATE TABLE micro_tasks (
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

CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type reward_type NOT NULL,
    payload JSONB,
    granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE badges (
    code TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    xp_bonus INTEGER DEFAULT 0
);

CREATE TABLE user_badges (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_code TEXT REFERENCES badges(code),
    granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, badge_code)
);

CREATE TABLE user_profiles (
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

-- Create indexes
CREATE INDEX idx_micro_tasks_user_id ON micro_tasks(user_id);
CREATE INDEX idx_micro_tasks_status ON micro_tasks(status);
CREATE INDEX idx_rewards_user_id ON rewards(user_id);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);

-- Enable Row Level Security
ALTER TABLE micro_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE future_self ENABLE ROW LEVEL SECURITY;
ALTER TABLE implementation_intentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_cues ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_loops ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_compassion_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commitment_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE priming_cues ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE lootbox_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for new tables
CREATE POLICY "Users can manage own future_self" ON future_self
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own intentions" ON implementation_intentions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own habit_cues" ON habit_cues
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own open_loops" ON open_loops
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own compassion sessions" ON self_compassion_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own contracts" ON commitment_contracts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own priming_cues" ON priming_cues
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own reviews" ON weekly_reviews
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own lootbox history" ON lootbox_history
    FOR SELECT USING (auth.uid() = user_id);

-- Create functions
CREATE OR REPLACE FUNCTION update_user_xp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'xp' THEN
        UPDATE user_profiles
        SET total_xp = total_xp + COALESCE((NEW.payload->>'amount')::INTEGER, 0),
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_reward_granted
    AFTER INSERT ON rewards
    FOR EACH ROW
    EXECUTE FUNCTION update_user_xp();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (user_id, display_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Create additional tables for new features
CREATE TABLE future_self (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    visualization TEXT NOT NULL,
    feelings TEXT[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    reminder_sent BOOLEAN DEFAULT false
);

CREATE TABLE implementation_intentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    trigger_type TEXT NOT NULL, -- 'time' | 'location' | 'habit'
    trigger_value TEXT NOT NULL,
    action TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE habit_cues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES micro_tasks(id) ON DELETE CASCADE,
    cue_type TEXT NOT NULL, -- 'time' | 'location' | 'event'
    cue_value JSONB NOT NULL,
    schedule TEXT, -- CRON expression for time-based cues
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE open_loops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES micro_tasks(id) ON DELETE CASCADE NOT NULL,
    paused_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    resumed_at TIMESTAMPTZ
);

CREATE TABLE self_compassion_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    trigger_reason TEXT,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE commitment_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES micro_tasks(id),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    recipient_type TEXT NOT NULL, -- 'friend' | 'charity'
    recipient_details JSONB,
    deadline TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'active', -- 'active' | 'completed' | 'failed'
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE priming_cues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    item TEXT NOT NULL,
    image_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE weekly_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    week_start DATE NOT NULL,
    satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
    burnout_score INTEGER CHECK (burnout_score >= 1 AND burnout_score <= 5),
    addiction_score INTEGER CHECK (addiction_score >= 1 AND addiction_score <= 5),
    reflections TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE lootbox_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reward_type TEXT NOT NULL,
    reward_payload JSONB,
    granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Scheduled cues/reminders table
CREATE TABLE scheduled_cues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    schedule_type TEXT CHECK (schedule_type IN ('daily', 'weekly', 'specific')) NOT NULL,
    schedule_time TIME NOT NULL,
    schedule_days INTEGER[], -- For weekly: 0=Sunday, 6=Saturday
    specific_date DATE, -- For one-time reminders
    active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for new tables
CREATE INDEX idx_future_self_user_id ON future_self(user_id);
CREATE INDEX idx_implementation_intentions_user_id ON implementation_intentions(user_id);
CREATE INDEX idx_habit_cues_user_id ON habit_cues(user_id);
CREATE INDEX idx_open_loops_user_id ON open_loops(user_id);
CREATE INDEX idx_commitment_contracts_user_id ON commitment_contracts(user_id);
CREATE INDEX idx_weekly_reviews_user_id ON weekly_reviews(user_id);
CREATE INDEX idx_scheduled_cues_user_id ON scheduled_cues(user_id);
CREATE INDEX idx_scheduled_cues_active ON scheduled_cues(active) WHERE active = true;

-- Insert default badges
INSERT INTO badges (code, title, description, xp_bonus) VALUES
    ('starter', 'Starter', 'Complete your first task', 10),
    ('momentum', 'Momentum', 'Reach 500 XP', 50),
    ('flow_master', 'Flow Master', 'Reach 2000 XP', 100),
    ('week_warrior', 'Week Warrior', '7-day streak', 25),
    ('productive_pro', 'Productive Pro', 'Complete 50 tasks', 75),
    ('focus_champion', 'Focus Champion', '100 hours of deep work', 150),
    ('early_bird', 'Early Bird', 'Complete 5 tasks before 9 AM', 30),
    ('night_owl', 'Night Owl', 'Complete 5 tasks after 9 PM', 30),
    ('consistency_king', 'Consistency King', '30-day streak', 100),
    ('lootbox_lucky', 'Lootbox Lucky', 'Win 10 lootbox rewards', 50);