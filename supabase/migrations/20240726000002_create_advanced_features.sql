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