-- Add device fingerprinting for rate limiting
-- This prevents quota bypass via app reinstall

-- Add device_id column to analysis_requests
ALTER TABLE analysis_requests 
ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Add IP address for additional verification
ALTER TABLE analysis_requests 
ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- Add image hash for deduplication
ALTER TABLE analysis_requests 
ADD COLUMN IF NOT EXISTS image_hash TEXT;

-- Create index for device-based rate limiting
CREATE INDEX IF NOT EXISTS idx_analysis_requests_device_time 
ON analysis_requests(device_id, created_at DESC);

-- Create index for IP-based rate limiting (backup)
CREATE INDEX IF NOT EXISTS idx_analysis_requests_ip_time 
ON analysis_requests(ip_address, created_at DESC);

-- Create index for image hash deduplication
CREATE INDEX IF NOT EXISTS idx_analysis_requests_hash_time 
ON analysis_requests(image_hash, created_at DESC);

-- Add comment explaining the security model
COMMENT ON COLUMN analysis_requests.device_id IS 'Device installation ID from expo-device for rate limiting';
COMMENT ON COLUMN analysis_requests.ip_address IS 'Client IP address for backup rate limiting';
COMMENT ON COLUMN analysis_requests.image_hash IS 'SHA-256 hash of image for deduplication';
