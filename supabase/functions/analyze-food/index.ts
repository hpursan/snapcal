// Production-Ready Security-Hardened Food Analysis Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Security Configuration
const RATE_LIMIT_PER_DAY = 10;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB in base64
const REQUEST_TIMEOUT_MS = 30000; // 30 seconds
const DEDUP_WINDOW_MINUTES = 5;

function getCorsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };
}

// Helper: Create timeout signal
function createTimeoutSignal(ms: number): AbortSignal {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
}

// Helper: Hash image for deduplication
async function hashImage(base64: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(base64.substring(0, 10000)); // First 10KB
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
    const corsHeaders = getCorsHeaders();

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Authenticate user
        const authHeader = req.headers.get('Authorization');

        // Use service role for database operations to ensure records are ALWAYS saved
        const supabaseService = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_KEY') ?? '',
            { auth: { persistSession: false } }
        )

        // But still check the user's identity
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader! } } }
        )

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

        if (authError || !user) {
            console.error('Auth check failed:', authError?.message);
            return new Response(JSON.stringify({
                error: 'Unauthorized',
                message: authError?.message || 'Please sign in to continue'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            })
        }

        const userId = user.id;

        // 2. Parse and validate request
        const { imageBase64, deviceId } = await req.json()

        if (!imageBase64) {
            return new Response(JSON.stringify({ error: 'No image provided' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        const deviceIdVal = deviceId || 'unknown';

        // 3. Validate payload size
        if (imageBase64.length > MAX_IMAGE_SIZE_BYTES) {
            return new Response(JSON.stringify({
                error: 'Image too large',
                message: 'Please use an image smaller than 5MB'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 413,
            })
        }

        // 4. Validate base64 format
        if (!/^[A-Za-z0-9+/=\s]+$/.test(imageBase64)) {
            return new Response(JSON.stringify({
                error: 'Invalid image format',
                message: 'The photo format is not supported. Please try again.'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // 5. Get client IP 
        const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] ||
            req.headers.get('x-real-ip') ||
            'unknown';

        // 6. Check device-based rate limit
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { count: deviceCount, error: deviceCountError } = await supabaseService
            .from('analysis_requests')
            .select('*', { count: 'exact', head: true })
            .eq('device_id', deviceIdVal)
            .gte('created_at', twentyFourHoursAgo);

        if (deviceCountError) {
            console.error('Rate limit check error:', deviceCountError);
        }

        if (deviceCount !== null && deviceCount >= RATE_LIMIT_PER_DAY) {
            return new Response(JSON.stringify({
                error: 'Rate limit exceeded',
                message: `You've reached your daily limit of ${RATE_LIMIT_PER_DAY} analyses. Try again tomorrow.`
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 429,
            })
        }

        // 7. Check for duplicate requests
        const imageHash = await hashImage(imageBase64);
        const dedupWindow = new Date(Date.now() - DEDUP_WINDOW_MINUTES * 60 * 1000).toISOString();

        const { data: recentDuplicates, error: dedupError } = await supabaseService
            .from('analysis_requests')
            .select('id')
            .eq('device_id', deviceIdVal)
            .eq('image_hash', imageHash)
            .gte('created_at', dedupWindow)
            .limit(1);

        if (!dedupError && recentDuplicates && recentDuplicates.length > 0) {
            return new Response(JSON.stringify({
                error: 'Duplicate request',
                message: 'You already analyzed this image recently.'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 429,
            })
        }

        const API_KEY = Deno.env.get('GEMINI_API_KEY')
        if (!API_KEY) {
            throw new Error('GEMINI_API_KEY not configured')
        }

        // 8. TIER 1: Quick food detection
        console.log('Tier 1: Running food detection...');

        const tier1Models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.0-flash-lite', 'gemini-2.5-flash'];

        const tier1Prompt = `Is this image a photo of food or a meal? 
        Respond with ONLY a JSON object: {"isFood": true/false, "confidence": "high"/"medium"/"low"}
        
        Examples:
        - Plate of pasta → {"isFood": true, "confidence": "high"}
        - Blurry sandwich → {"isFood": true, "confidence": "medium"}
        - Photo of a car → {"isFood": false, "confidence": "high"}
        - Random screenshot → {"isFood": false, "confidence": "high"}`;

        const tier1Payload = {
            contents: [{
                parts: [
                    { text: tier1Prompt },
                    { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
                ]
            }]
        };

        // Try models in fallback chain with timeout
        let tier1Data;
        let tier1Response;
        let lastError;

        for (const model of tier1Models) {
            try {
                console.log(`Trying model: ${model}`);
                tier1Response = await fetch(
                    `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${API_KEY}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(tier1Payload),
                        signal: createTimeoutSignal(REQUEST_TIMEOUT_MS)
                    }
                );

                tier1Data = await tier1Response.json();

                if (tier1Response.ok) {
                    console.log(`Success with Tier 1 model: ${model}`);
                    break;
                } else {
                    lastError = tier1Data.error?.message || "API Error";
                    console.log(`Tier 1 model ${model} failed: ${lastError}`, JSON.stringify(tier1Data.error));
                }
            } catch (error: any) {
                lastError = error.message;
                console.log(`Model ${model} error: ${lastError}`);
            }
        }

        if (!tier1Response?.ok) {
            throw new Error(lastError || "All Tier 1 models failed");
        }

        let tier1Text = tier1Data.candidates[0].content.parts[0].text;

        // Helper: Robust JSON extraction
        const extractJson = (text: string) => {
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                return text.substring(start, end + 1);
            }
            return text;
        };

        const tier1Result = JSON.parse(extractJson(tier1Text));

        // Log Tier 1 result
        const { data: requestRecord, error: insertError } = await supabaseService.from('analysis_requests').insert({
            user_id: userId,
            device_id: deviceIdVal,
            ip_address: clientIp,
            image_hash: imageHash,
            tier_1_result: tier1Result.isFood ? 'food' : 'not_food',
            tier_2_success: null
        }).select('id').single();

        if (insertError) {
            console.error('Record insertion error:', insertError.message);
        }

        const requestId = requestRecord?.id;

        if (!tier1Result.isFood) {
            return new Response(JSON.stringify({
                error: 'Not food detected',
                message: 'This image doesn\'t appear to contain food. Please take a photo of your meal.'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // 9. TIER 2: Detailed analysis
        console.log('Tier 2: Running detailed analysis...');

        const tier2Models = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-2.5-pro'];

        const tier2Prompt = `
        Analyze this food image for a "Meal Insights" app (Aperioesca). 
        
        GOAL: Classify the "Energy Density" relative to a standard adult meal.
        CRITICAL INSTRUCTION: Be decisive. Do NOT default to "moderate". 
        - If it has obvious carbs, fats, or large portions → HEAVY.
        - If it is mostly veg/lean protein → LIGHT.
        - Only use MODERATE if it's a truly balanced, standard portion.
        
        Return STRICT JSON:
        {
            "mealType": "breakfast" | "lunch" | "dinner" | "snack",
            "energyBand": "very_light" | "light" | "moderate" | "heavy" | "very_heavy",
            "confidence": "high" | "medium" | "low",
            "reasoning": "Short (1 sentence) explanation.",
            "flags": {
                "mixedPlate": boolean,
                "unclearPortions": boolean,
                "sharedDish": boolean
            },
            "insight": "One interesting observation about the meal."
        }
        `;

        const tier2Payload = {
            contents: [{
                parts: [
                    { text: tier2Prompt },
                    { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
                ]
            }]
        };

        let tier2Data;
        let tier2Response;
        let lastTier2Error;

        for (const model of tier2Models) {
            try {
                console.log(`Trying Tier 2 model: ${model}`);
                tier2Response = await fetch(
                    `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${API_KEY}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(tier2Payload),
                        signal: createTimeoutSignal(REQUEST_TIMEOUT_MS)
                    }
                );

                tier2Data = await tier2Response.json();

                if (tier2Response.ok) {
                    console.log(`Success with Tier 2 model: ${model}`);
                    break;
                } else {
                    lastTier2Error = tier2Data.error?.message || "API Error";
                    console.log(`Tier 2 model ${model} failed: ${lastTier2Error}`);
                }
            } catch (error: any) {
                lastTier2Error = error.message;
                console.log(`Tier 2 model ${model} error: ${lastTier2Error}`);
            }
        }

        if (!tier2Response?.ok) {
            if (requestId) {
                await supabaseService.from('analysis_requests').update({
                    tier_2_success: false,
                    error_message: lastTier2Error || 'All Tier 2 models failed'
                }).eq('id', requestId);
            }
            throw new Error(lastTier2Error || "All Tier 2 models failed");
        }

        let tier2Text = tier2Data.candidates[0].content.parts[0].text;
        const tier2Result = JSON.parse(extractJson(tier2Text));

        if (requestId) {
            await supabaseService.from('analysis_requests').update({
                tier_2_success: true
            }).eq('id', requestId);
        }

        return new Response(JSON.stringify(tier2Result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error('Edge Function Fatal Error:', error);

        try {
            const supabaseService = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_KEY') ?? '',
                { auth: { persistSession: false } }
            );
            await supabaseService.from('client_logs').insert({
                level: 'FATAL',
                message: `Edge Function Failure: ${error.message}`,
                context: { stack: error.stack, code: error.code },
                device_id: 'server-edge-function'
            });
        } catch (logError) {
            console.error('Double failure:', logError);
        }

        return new Response(JSON.stringify({
            error: error.message || 'Analysis failed',
            message: `Server Error: ${error.message || 'Unknown failure'}`
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
