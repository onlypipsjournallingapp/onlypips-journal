
-- Add missing fields to the trades table for performance analysis
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS strategy_used uuid,
ADD COLUMN IF NOT EXISTS checklist_used_id uuid,
ADD COLUMN IF NOT EXISTS checklist_items_checked jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS entry_time timestamp with time zone,
ADD COLUMN IF NOT EXISTS exit_time timestamp with time zone,
ADD COLUMN IF NOT EXISTS risk_reward_ratio numeric,
ADD COLUMN IF NOT EXISTS holding_duration_minutes integer;

-- Add foreign key reference to strategies table (now with correct uuid type)
ALTER TABLE trades 
ADD CONSTRAINT fk_trades_strategy 
FOREIGN KEY (strategy_used) REFERENCES strategies(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_trades_strategy_used ON trades(strategy_used);
CREATE INDEX IF NOT EXISTS idx_trades_user_created ON trades(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_trades_result ON trades(result);

-- Create a table to store user performance reports (for caching)
CREATE TABLE IF NOT EXISTS user_performance_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  report_data jsonb NOT NULL,
  performance_label text NOT NULL,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  trades_analyzed integer NOT NULL DEFAULT 0
);

-- Add RLS policies for performance reports
ALTER TABLE user_performance_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own performance reports" 
  ON user_performance_reports 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own performance reports" 
  ON user_performance_reports 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own performance reports" 
  ON user_performance_reports 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create index for performance reports
CREATE INDEX IF NOT EXISTS idx_performance_reports_user ON user_performance_reports(user_id);
