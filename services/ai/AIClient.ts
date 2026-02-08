/**
 * AI Client
 * Low-level wrapper for Gemini API
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult } from './types';

export class AIClient {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        // Access env var at runtime, not module load time
        const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

        if (!API_KEY) {
            console.error("Environment variables:", {
                hasGeminiKey: !!process.env.EXPO_PUBLIC_GEMINI_API_KEY,
                hasSupabaseUrl: !!process.env.EXPO_PUBLIC_SUPABASE_URL,
                hasSupabaseKey: !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
            });
            throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY");
        }
        this.genAI = new GoogleGenerativeAI(API_KEY);
        // Use gemini-pro which is the stable model name
        this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    }

    /**
     * Analyze food image
     */
    async analyzeImage(base64Image: string): Promise<AnalysisResult> {
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

        const result = await this.model.generateContent([
            promptText,
            { inlineData: { data: base64Image, mimeType: "image/jpeg" } }
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean and parse JSON
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanText) as AnalysisResult;

        return data;
    }

    /**
     * Check if API is configured
     */
    static isConfigured(): boolean {
        return !!process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    }
}
