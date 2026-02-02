// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Authenticate user via JWT
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            })
        }

        // 2. Check Verification/Quota (Simple DB check)
        // Create a table 'user_quotas' in Supabase:
        // id (uuid, pk), remaining_scans (int), last_reset (date)
        // For now, we'll skip the strict DB check and rely on the frontend limit + Auth
        // In production, you MUST implement the server-side DB decrement here.

        // 3. Process Image
        const { imageBase64 } = await req.json()
        if (!imageBase64) {
            return new Response(JSON.stringify({ error: 'No image provided' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // 4. Call Gemini API
        const API_KEY = Deno.env.get('GEMINI_API_KEY')
        const model = 'gemini-flash-lite-latest' // Cheap model

        const payload = {
            contents: [
                {
                    parts: [
                        { text: "Analyze this food image. Identify the meal and estimate nutritional content. Return strictly valid JSON: { \"foodName\": string, \"description\": string, \"calories\": number, \"protein\": number, \"carbs\": number, \"fats\": number, \"insight\": string (one fun fact) }." },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: imageBase64
                            }
                        }
                    ]
                }
            ],
            generationConfig: {
                response_mime_type: "application/json"
            }
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }
        )

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error?.message || "Gemini API Error")
        }

        // 5. Return Result
        // The Gemini response structure is complex, we just pass it back or parse it here.
        // Simplifying for the client:
        const text = data.candidates[0].content.parts[0].text;
        const jsonResult = JSON.parse(text);

        return new Response(JSON.stringify(jsonResult), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
