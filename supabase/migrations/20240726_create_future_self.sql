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