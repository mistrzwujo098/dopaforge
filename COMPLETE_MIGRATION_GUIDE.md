# Complete Database Migration Guide for DopaForge

## Overview
This guide contains ALL database migrations needed for DopaForge to function properly. Apply these in order through the Supabase SQL Editor.

## Prerequisites
1. Create a Supabase project at https://supabase.com
2. Note your project URL and anon key for environment variables

## Migration Order

### Migration 1: Initial Schema (Core Tables)
**IMPORTANT**: Run this first as other tables depend on it.

```sql
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
    earned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, badge_code)
);

CREATE TABLE IF NOT EXISTS dopamine_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 5),
    task_ref UUID REFERENCES micro_tasks(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX idx_micro_tasks_user_id ON micro_tasks(user_id);
CREATE INDEX idx_micro_tasks_status ON micro_tasks(status);
CREATE INDEX idx_rewards_user_id ON rewards(user_id);
CREATE INDEX idx_dopamine_feedback_user_id ON dopamine_feedback(user_id);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dopamine_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own tasks"
    ON micro_tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
    ON micro_tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
    ON micro_tasks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
    ON micro_tasks FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own rewards"
    ON rewards FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback"
    ON dopamine_feedback FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback"
    ON dopamine_feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own badges"
    ON user_badges FOR SELECT
    USING (auth.uid() = user_id);

-- Insert default badges
INSERT INTO badges (code, title, description, xp_bonus) VALUES
    ('first_task', 'First Step', 'Complete your first task', 50),
    ('streak_3', 'On Fire', 'Maintain a 3-day streak', 100),
    ('streak_7', 'Week Warrior', 'Maintain a 7-day streak', 200),
    ('early_bird', 'Early Bird', 'Complete a task before 8 AM', 75),
    ('perfectionist', 'Perfectionist', 'Complete 10 tasks in one day', 150)
ON CONFLICT (code) DO NOTHING;
```

### Migration 2: User Profile Trigger
```sql
-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, display_name)
    VALUES (new.id, new.raw_user_meta_data->>'display_name');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Migration 3: Advanced Features Tables
```sql
-- Create implementation intentions table
CREATE TABLE IF NOT EXISTS implementation_intentions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  if_trigger TEXT NOT NULL,
  then_action TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create commitment contracts table
CREATE TABLE IF NOT EXISTS commitment_contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal TEXT NOT NULL,
  stake_type TEXT CHECK (stake_type IN ('social', 'donation', 'habit_lock')) NOT NULL,
  stake_details JSONB,
  deadline TIMESTAMPTZ NOT NULL,
  accountability_partner TEXT,
  status TEXT CHECK (status IN ('active', 'completed', 'failed')) DEFAULT 'active',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create self compassion sessions table
CREATE TABLE IF NOT EXISTS self_compassion_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trigger_reason TEXT,
  duration_seconds INTEGER DEFAULT 120,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create priming cues table
CREATE TABLE IF NOT EXISTS priming_cues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cue_type TEXT CHECK (cue_type IN ('time', 'location', 'event')) NOT NULL,
  cue_details JSONB,
  priming_message TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scheduled cues table
CREATE TABLE IF NOT EXISTS scheduled_cues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  cue_time TIME NOT NULL,
  days_of_week INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5], -- Monday to Friday
  enabled BOOLEAN DEFAULT true,
  notification_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_implementation_intentions_user_id ON implementation_intentions(user_id);
CREATE INDEX idx_commitment_contracts_user_id ON commitment_contracts(user_id);
CREATE INDEX idx_self_compassion_sessions_user_id ON self_compassion_sessions(user_id);
CREATE INDEX idx_priming_cues_user_id ON priming_cues(user_id);
CREATE INDEX idx_scheduled_cues_user_id ON scheduled_cues(user_id);

-- Enable RLS
ALTER TABLE implementation_intentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commitment_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_compassion_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE priming_cues ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_cues ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own implementation intentions"
  ON implementation_intentions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own commitment contracts"
  ON commitment_contracts FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own self compassion sessions"
  ON self_compassion_sessions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own priming cues"
  ON priming_cues FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own scheduled cues"
  ON scheduled_cues FOR ALL
  USING (auth.uid() = user_id);
```

### Migration 4: Future Self Table
```sql
-- Create future self visualization table
CREATE TABLE IF NOT EXISTS future_self (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  visualization TEXT NOT NULL,
  feelings TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX idx_future_self_user_id ON future_self(user_id);
CREATE INDEX idx_future_self_created_at ON future_self(created_at DESC);

-- Enable RLS
ALTER TABLE future_self ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can manage their own future self visualizations"
  ON future_self FOR ALL
  USING (auth.uid() = user_id);
```

### Migration 5: Reviews and Lootbox Tables
```sql
-- Create weekly reviews table
CREATE TABLE IF NOT EXISTS weekly_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5) NOT NULL,
  burnout_score INTEGER CHECK (burnout_score >= 1 AND burnout_score <= 5) NOT NULL,
  addiction_score INTEGER CHECK (addiction_score >= 1 AND addiction_score <= 5) NOT NULL,
  reflections TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Create lootbox history table
CREATE TABLE IF NOT EXISTS lootbox_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reward_type TEXT NOT NULL,
  reward_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_weekly_reviews_user_id ON weekly_reviews(user_id);
CREATE INDEX idx_weekly_reviews_week_start ON weekly_reviews(week_start DESC);
CREATE INDEX idx_lootbox_history_user_id ON lootbox_history(user_id);
CREATE INDEX idx_lootbox_history_created_at ON lootbox_history(created_at DESC);

-- Enable RLS
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE lootbox_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own weekly reviews"
  ON weekly_reviews FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own lootbox history"
  ON lootbox_history FOR SELECT
  USING (auth.uid() = user_id);

-- Only system can insert lootbox history (through functions)
CREATE POLICY "System can insert lootbox history"
  ON lootbox_history FOR INSERT
  WITH CHECK (true);
```

## Verification Query
After running all migrations, verify everything is set up correctly:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check user profile trigger exists
SELECT tgname 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
```

## Common Issues

### "permission denied for schema public"
If you see this error, run:
```sql
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;
```

### "type already exists"
This is fine - it means the types were already created. Continue with the rest of the migration.

### "relation already exists"
This is also fine - it means the table was already created. The migrations are idempotent.

## Next Steps
1. Configure environment variables in Vercel
2. Deploy your application
3. Test all features to ensure database connectivity

## Support
If you encounter issues:
1. Check Supabase logs in the dashboard
2. Verify all migrations ran successfully
3. Ensure RLS policies are correct
4. Check environment variables are set correctly