-- Create client_logs table for production observability
CREATE TABLE IF NOT EXISTS client_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    context JSONB,
    device_id TEXT,
    user_id UUID REFERENCES auth.users(id),
    app_version TEXT,
    platform TEXT
);

-- Index for querying recent logs
CREATE INDEX IF NOT EXISTS idx_client_logs_created_at ON client_logs(created_at DESC);

-- Enable RLS
ALTER TABLE client_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to INSERT logs only
CREATE POLICY "Allow anonymous log insertion" 
ON client_logs FOR INSERT 
TO anon
WITH CHECK (true);

-- Allow authenticated users to INSERT logs
CREATE POLICY "Allow authenticated log insertion" 
ON client_logs FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Comment on table
COMMENT ON TABLE client_logs IS 'Remote logs from client applications for production debugging.';
