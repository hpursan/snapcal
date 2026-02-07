# Production Deployment Guide

## Prerequisites

1. **Supabase CLI installed**
   ```bash
   # On macOS (using Homebrew)
   brew install supabase/tap/supabase
   
   # Verify installation
   supabase --version
   ```

2. **Supabase project created**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project (or use existing)
   - Note your project reference ID (ujpsucxudckaxrljpdwo)

3. **Gemini API Key**
   - Get from [Google AI Studio](https://aistudio.google.com/apikey)
   - Keep it secure - never commit to git (AIzaSyCpWbwu_yLE9Apgzc0KZaWa5e412lKvK50)

---

## Deployment Steps

### 1. Login and Link Project

```bash
# Login to Supabase
supabase login

# Link to your project
cd /Users/himaschal/workspace/snapcal
supabase link --project-ref YOUR_PROJECT_REF
```

### 2. Create Database Table

```bash
# Apply the migration
supabase db push
```

This creates the `analysis_requests` table for rate limiting and usage tracking.

### 3. Set API Key as Secret

```bash
# Set your Gemini API key (replace with your actual key)
supabase secrets set GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**Important**: Never commit API keys to git. The Edge Function will read this from environment variables.

### 4. Deploy Edge Function

```bash
# Deploy the analyze-food function
supabase functions deploy analyze-food
```

You should see output like:
```
Deploying function analyze-food...
Function analyze-food deployed successfully!
URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/analyze-food
```

### 5. Test the Deployment

```bash
# Test with a sample request (requires auth token)
curl -X POST \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/analyze-food \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"imageBase64": "..."}'
```

### 6. Update Client Configuration

The client is already configured to use the proxy (`USE_PROXY = true`). Just make sure your `.env` has:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 7. Remove API Key from Client (Optional but Recommended)

For maximum security, remove the Gemini API key from the client `.env`:

```bash
# In .env, comment out or remove:
# EXPO_PUBLIC_GEMINI_API_KEY=...
```

The app will work fine without it since all requests go through the proxy.

---

## Verification

### Check Database

```sql
-- View recent analysis requests
SELECT * FROM analysis_requests 
ORDER BY created_at DESC 
LIMIT 10;

-- Check rate limits for a user
SELECT 
    user_id,
    COUNT(*) as request_count,
    MAX(created_at) as last_request
FROM analysis_requests
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id;
```

### Monitor Logs

```bash
# Watch Edge Function logs in real-time
supabase functions logs analyze-food --tail
```

### Test Rate Limiting

1. Take 10 photos and analyze them
2. Try an 11th photo
3. Should see: "Daily analysis limit reached. Try again tomorrow!"

---

## Cost Monitoring

### Gemini API Dashboard
- Visit [Google Cloud Console](https://console.cloud.google.com)
- Navigate to "APIs & Services" → "Gemini API"
- View usage and costs

### Expected Costs (1000 users, 5 analyses/day)
- **Tier 1** (food detection): ~$0.50/month
- **Tier 2** (full analysis): ~$4.00/month
- **Total**: ~$4.50/month

### Supabase Costs
- Free tier includes:
  - 500K Edge Function invocations/month
  - 500MB database storage
  - Should be sufficient for MVP

---

## Troubleshooting

### "Unauthorized" Error
- Check that `EXPO_PUBLIC_SUPABASE_ANON_KEY` is set correctly
- Verify user is authenticated before calling analysis

### "Analysis Service Unavailable"
- Check Edge Function logs: `supabase functions logs analyze-food`
- Verify `GEMINI_API_KEY` secret is set: `supabase secrets list`
- Test API key manually with curl

### Rate Limit Not Working
- Check database table exists: `supabase db diff`
- Verify RLS policies are correct
- Check Edge Function has service role access

### High Costs
- Check Tier 1 is rejecting non-food images
- Monitor `analysis_requests` table for spam
- Consider lowering rate limit (currently 10/day)

---

## Rollback Plan

If something goes wrong:

```bash
# Disable proxy in client (emergency fallback)
# In services/FoodAnalysisService.ts:
# const USE_PROXY = false;

# Redeploy previous Edge Function version
supabase functions deploy analyze-food --version PREVIOUS_VERSION

# Restore database
supabase db reset
```

---

## Next Steps

1. **Monitor usage** for first week
2. **Adjust rate limits** based on user feedback
3. **Add analytics** dashboard (optional)
4. **Consider premium tier** with higher limits

---

## Security Checklist

- [x] API key stored in Supabase secrets (not in client)
- [x] Rate limiting enabled (10 requests/day)
- [x] RLS policies on `analysis_requests` table
- [x] CORS headers configured
- [x] User authentication required
- [ ] Remove `EXPO_PUBLIC_GEMINI_API_KEY` from client `.env` (optional)
