-- Harden RLS policies for analysis_requests
-- 1. Drop the overly broad "Service can insert" policy
DROP POLICY IF EXISTS "Service can insert requests" ON analysis_requests;

-- 2. Create a new policy that only allows authenticated users to insert
-- This ensures that only users who have logged in (even anonymously) can create requests.
CREATE POLICY "Authenticated users can insert requests"
ON analysis_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

-- 3. Ensure users can only update their own records (for tier_2_success flag)
CREATE POLICY "Users can update own requests"
ON analysis_requests
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- 4. Anonymous users should NOT be able to insert analysis requests directly.
-- They MUST go through the Edge Function which uses the service role key.
-- Since the Edge Function uses the service role, it bypasses RLS, which is desired.
-- But we want to prevent a malicious user with the anon key from manually inserting.
-- The policy "Authenticated users can insert requests" covers both anon and registered users.
-- To be extra safe, we'll explicitly DENY anon insert if we want to force them through Edge Function.
-- However, "TO authenticated" already excludes anonymous users who haven't called signInAnonymously.
