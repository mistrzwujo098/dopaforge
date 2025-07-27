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