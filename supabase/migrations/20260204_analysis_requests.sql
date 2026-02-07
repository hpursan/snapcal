-- Create table for tracking analysis requests (rate limiting + monitoring)
CREATE TABLE IF NOT EXISTS analysis_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tier_1_result TEXT, -- 'food' | 'not_food' | 'error'
    tier_2_success BOOLEAN,
    error_message TEXT
);

-- Index for fast rate limit lookups
CREATE INDEX IF NOT EXISTS idx_analysis_requests_user_time 
ON analysis_requests(user_id, created_at DESC);

-- Enable RLS for security
ALTER TABLE analysis_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own requests
CREATE POLICY "Users can view own requests"
ON analysis_requests
FOR SELECT
USING (auth.uid()::text = user_id);

-- Policy: Service role can insert (Edge Function uses service role)
CREATE POLICY "Service can insert requests"
ON analysis_requests
FOR INSERT
WITH CHECK (true);
