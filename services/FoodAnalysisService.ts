import { GoogleGenerativeAI } from "@google/generative-ai";
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { supabase } from './Supabase';
import { EnergyBand, ConfidenceLevel } from '../types/Meal';

// Initialize Gemini
// Production: Uses Supabase Edge Function proxy (two-tier model approach)
// The proxy handles: rate limiting, cost optimization, and API key security
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || ""; // Only used as fallback in dev
const USE_PROXY = true; // Always use proxy in production

const genAI = new GoogleGenerativeAI(API_KEY);

export interface AnalysisResult {
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    energyBand: EnergyBand;
    confidence: ConfidenceLevel;
    reasoning: string;
    flags: {
        mixedPlate: boolean;
        unclearPortions: boolean;
        sharedDish: boolean;
    };
    insight: string; // "Heavier than typical lunch" etc.
}

export async function analyzeFoodImage(uri: string): Promise<AnalysisResult> {
    try {
        // 1. Resize image to minimize payload
        const manipResult = await manipulateAsync(
            uri,
            [{ resize: { width: 512 } }], // Optimized to 512px
            { compress: 0.5, format: SaveFormat.JPEG, base64: true }
        );

        // Access Base64 directly
        const base64 = manipResult.base64;
        if (!base64) throw new Error("Could not process image");

        // PROMPT DESIGN (APERIOESCA)
        // Focus: Energy density, not precise numbers.
        // Confidence: Critical for trust.
        const promptText = `
        Analyze this food image for a "Meal Insights" app (Aperioesca). 
        
        GOAL: Classify the "Energy Density" relative to a standard adult meal.
        CRITICAL INSTRUCTION: Be decisive. Do NOT default to "moderate". 
        - If it has obvious carbs, fats, or large portions -> HEAVY.
        - If it is mostly veg/lean protein -> LIGHT.
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

        // STRATEGY: Use Proxy if available, fallback to Direct API (Dev Mode)
        if (USE_PROXY) {
            console.log("Analyzing via Supabase Proxy (Two-Tier Aperioesca Mode)...");

            // Check if Supabase is configured
            if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
                console.error("Supabase not configured, falling back to direct API");
                // Fall through to direct API
            } else {
                const { data, error } = await supabase.functions.invoke('analyze-food', {
                    body: { imageBase64: base64 }
                });

                if (error) {
                    console.error("Proxy Error:", error);

                    // Handle specific error cases
                    if (error.message?.includes('Rate limit')) {
                        throw new Error("Daily analysis limit reached. Try again tomorrow!");
                    }
                    if (error.message?.includes('Not food')) {
                        throw new Error("This doesn't appear to be food. Please take a photo of your meal.");
                    }

                    // If proxy fails, fall through to direct API
                    console.log("Proxy failed, attempting direct API...");
                } else {
                    return data as AnalysisResult;
                }
            }
        }

        // FAILSAFE: Direct API (Only if Proxy is not configured or failed)
        if (!API_KEY) {
            throw new Error("Missing Gemini API Key. Please set EXPO_PUBLIC_GEMINI_API_KEY.");
        }
        console.log("Analyzing via Direct Gemini API...");

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
        const result = await model.generateContent([
            promptText,
            { inlineData: { data: base64, mimeType: "image/jpeg" } }
        ]);

        const response = await result.response;
        const text = response.text();

        // 4. Clean and Parse JSON
        // sometimes Gemini wraps in ```json ... ```
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const data = JSON.parse(cleanText) as AnalysisResult;
        return data;

    } catch (error) {
        console.log("Gemini Analysis Failed:", error);
        throw error;
    }
}
