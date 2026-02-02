import { GoogleGenerativeAI } from '@google/generative-ai';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { supabase } from './Supabase';

// Initialize Gemini
// Note: In production, you should use a proxy server or Firebase Functions to hide this key.
// For this MVP/Demo, we use the public env var.
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const USE_PROXY = !!process.env.EXPO_PUBLIC_SUPABASE_URL;

const genAI = new GoogleGenerativeAI(API_KEY);

export interface FoodAnalysis {
    foodName: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    insight: string; // The "Un-Stupid" context
}

export async function analyzeFoodImage(uri: string): Promise<FoodAnalysis> {
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

        // STRATEGY: Use Proxy if available, fallback to Direct API (Dev Mode)
        if (USE_PROXY) {
            console.log("Analyzing via Supabase Proxy...");
            const { data, error } = await supabase.functions.invoke('analyze-food', {
                body: { imageBase64: base64 }
            });

            if (error) {
                console.error("Proxy Error:", error);
                // Fallback to direct API if proxy fails, or rethrow if strict proxy usage is desired
                console.log("Falling back to direct Gemini API...");
            } else if (data) {
                return data as FoodAnalysis;
            }
        }

        // FAILSAFE: Direct API (Only if Proxy is not configured or failed)
        if (!API_KEY) {
            throw new Error("Missing Gemini API Key. Please set EXPO_PUBLIC_GEMINI_API_KEY.");
        }
        console.log("Analyzing via Direct Gemini API...");
        // prompt
        // Using 'gemini-flash-lite-latest' for speed and cost efficiency.
        const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

        const prompt = `
        Analyze this food image. Identify the meal and estimate nutritional content. 
        Return strictly valid JSON: { "foodName": string, "description": string, "calories": number, "protein": number, "carbs": number, "fats": number, "insight": string }.
        `;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64, mimeType: "image/jpeg" } }
        ]);

        const response = await result.response;
        const text = response.text();

        // 4. Clean and Parse JSON
        // sometimes Gemini wraps in ```json ... ```
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const data = JSON.parse(cleanText) as FoodAnalysis;
        return data;

    } catch (error) {
        console.error("Gemini Analysis Failed:", error);
        throw error;
    }
}
