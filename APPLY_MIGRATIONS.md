# How to Apply Database Migrations

Since the Supabase CLI is not available, you'll need to apply the migrations manually through the Supabase dashboard.

## Steps:

1. **Go to your Supabase Dashboard**
   - Open https://app.supabase.com
   - Select your DopaForge project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Apply each migration in order:**

### Migration 1: Advanced Features Tables
Copy and paste this entire SQL block:

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

Click "Run" to execute.

### Migration 2: Future Self Table
Create a new query and paste:

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

Click "Run" to execute.

### Migration 3: Reviews and Lootbox Tables
Create a new query and paste:

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

Click "Run" to execute.

## Verification

After running all three migrations, you can verify the tables were created by running:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see all the new tables:
- commitment_contracts
- future_self
- implementation_intentions
- lootbox_history
- priming_cues
- scheduled_cues
- self_compassion_sessions
- weekly_reviews

## Troubleshooting

If you get "already exists" errors, that's fine - it means the tables were already created.

Once all migrations are applied, refresh your DopaForge app and all advanced features should work without any 400 errors!