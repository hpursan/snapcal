import { GoogleGenerativeAI } from '@google/generative-ai';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

// Initialize Gemini
// Note: In production, you should use a proxy server or Firebase Functions to hide this key.
// For this MVP/Demo, we use the public env var.
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

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

export async function analyzeFoodImage(imageUri: string): Promise<FoodAnalysis> {
    if (!API_KEY) {
        throw new Error("Missing Gemini API Key. Please set EXPO_PUBLIC_GEMINI_API_KEY.");
    }

    try {
        // 1. Resize image to minimize payload
        const manipResult = await ImageManipulator.manipulateAsync(
            imageUri,
            [{ resize: { width: 512 } }], // Optimized to 512px
            { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );

        // Access Base64 directly
        const base64 = manipResult.base64;
        if (!base64) throw new Error("Could not process image");

        // 2. prompt
        // Using 'gemini-flash-lite-latest' for speed and cost efficiency.
        // This is a specialized model for high-throughput, low-latency tasks.
        const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

        const prompt = `
        Analyze this food image. Identify the meal and estimate nutritional content.
        
        Return STRICT JSON format with the following fields:
        - foodName: Short, clear title (e.g., "Grilled Salmon Salad")
        - description: One sentence description.
        - calories: Total calories (number)
        - protein: Protein in grams (number)
        - carbs: Carbs in grams (number)
        - fats: Fats in grams (number)
        - insight: A single, science-based sentence about the nutritional quality. Mention specific micronutrients, satiety effects, or glycemic impact. Be helpful, not judgmental. Frame it as "Energy Surplus" or "Fuel" if high calorie.
        
        Do not allow markdown formatting in the response (no \`\`\`json). Just the raw JSON string.
        `;

        // 3. Generate
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
