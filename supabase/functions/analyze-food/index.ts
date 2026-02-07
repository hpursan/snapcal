// Production-Ready Two-Tier Food Analysis Edge Function
// Tier 1: Fast food detection (gemini-2.0-flash-lite)
// Tier 2: Detailed analysis (gemini-flash-lite-latest)
// Includes: Rate limiting, usage tracking, error handling

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limit: 10 requests per user per day
const RATE_LIMIT_PER_DAY = 10;

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Authenticate user
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { data: { user } } = await supabaseClient.auth.getUser()

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            })
        }

        const userId = user.id;

        // 2. Check rate limit (last 24 hours)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { data: recentRequests, error: countError } = await supabaseClient
            .from('analysis_requests')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', twentyFourHoursAgo);

        if (countError) {
            console.error('Rate limit check error:', countError);
            // Continue anyway - don't block on rate limit check failure
        } else if (recentRequests && recentRequests.length >= RATE_LIMIT_PER_DAY) {
            return new Response(JSON.stringify({
                error: 'Rate limit exceeded',
                message: `You've reached your daily limit of ${RATE_LIMIT_PER_DAY} analyses. Try again tomorrow.`,
                remainingRequests: 0
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 429,
            })
        }

        // 3. Parse request
        const { imageBase64 } = await req.json()
        if (!imageBase64) {
            return new Response(JSON.stringify({ error: 'No image provided' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        const API_KEY = Deno.env.get('GEMINI_API_KEY')
        if (!API_KEY) {
            throw new Error('GEMINI_API_KEY not configured')
        }

        // 4. TIER 1: Quick food detection (cheap model)
        console.log('Tier 1: Running food detection...');
        const tier1Model = 'gemini-2.0-flash-lite';
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
            }],
            generationConfig: { response_mime_type: "application/json" }
        };

        const tier1Response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${tier1Model}:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tier1Payload)
            }
        );

        const tier1Data = await tier1Response.json();

        if (!tier1Response.ok) {
            throw new Error(tier1Data.error?.message || "Tier 1 API Error");
        }

        const tier1Text = tier1Data.candidates[0].content.parts[0].text;
        const tier1Result = JSON.parse(tier1Text);

        // Log Tier 1 result
        await supabaseClient.from('analysis_requests').insert({
            user_id: userId,
            tier_1_result: tier1Result.isFood ? 'food' : 'not_food',
            tier_2_success: null
        });

        // If not food, reject early
        if (!tier1Result.isFood) {
            return new Response(JSON.stringify({
                error: 'Not food detected',
                message: 'This image doesn\'t appear to contain food. Please take a photo of your meal.',
                tier1Result
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // 5. TIER 2: Detailed analysis (smart model)
        console.log('Tier 2: Running detailed analysis...');
        const tier2Model = 'gemini-flash-lite-latest';
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
            "energyBand": "very_light" (<300kcal) | "light" (300-500) | "moderate" (500-800) | "heavy" (800-1200) | "very_heavy" (>1200),
            "confidence": "high" (clear items) | "medium" (hidden ingredients) | "low" (cluttered/blurry),
            "reasoning": "Short (1 sentence) explanation. Focus on 'Why'. E.g. 'Fried dough and sugar glaze make this very energy dense.'",
            "flags": {
                "mixedPlate": boolean,
                "unclearPortions": boolean,
                "sharedDish": boolean
            },
            "insight": "One interesting observation about the macro balance. E.g. 'High sugar punch for breakfast.'"
        }
        `;

        const tier2Payload = {
            contents: [{
                parts: [
                    { text: tier2Prompt },
                    { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
                ]
            }],
            generationConfig: { response_mime_type: "application/json" }
        };

        const tier2Response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${tier2Model}:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tier2Payload)
            }
        );

        const tier2Data = await tier2Response.json();

        if (!tier2Response.ok) {
            // Log failure
            await supabaseClient.from('analysis_requests').insert({
                user_id: userId,
                tier_1_result: 'food',
                tier_2_success: false,
                error_message: tier2Data.error?.message || 'Unknown error'
            });

            throw new Error(tier2Data.error?.message || "Tier 2 API Error");
        }

        const tier2Text = tier2Data.candidates[0].content.parts[0].text;
        const tier2Result = JSON.parse(tier2Text);

        // Log success
        await supabaseClient.from('analysis_requests').insert({
            user_id: userId,
            tier_1_result: 'food',
            tier_2_success: true
        });

        // 6. Return detailed analysis
        return new Response(JSON.stringify(tier2Result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error('Edge Function Error:', error);
        return new Response(JSON.stringify({
            error: error.message || 'Analysis failed',
            message: 'Unable to analyze image. Please try again.'
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
