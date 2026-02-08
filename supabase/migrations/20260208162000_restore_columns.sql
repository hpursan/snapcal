-- Add missing columns for rate limiting and deduplication
ALTER TABLE analysis_requests 
ADD COLUMN IF NOT EXISTS device_id TEXT,
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS image_hash TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analysis_requests_device_time 
ON analysis_requests(device_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analysis_requests_ip_time 
ON analysis_requests(ip_address, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analysis_requests_hash_time 
ON analysis_requests(image_hash, created_at DESC);
