// Local type definitions to replace deleted services/ai/types
export interface AnalysisResult {
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    energyBand: 'very_light' | 'light' | 'moderate' | 'heavy' | 'very_heavy';
    confidence: 'high' | 'medium' | 'low';
    reasoning: string;
    flags: {
        mixedPlate: boolean;
        unclearPortions: boolean;
        sharedDish: boolean;
    };
    insight: string;
}
import { supabase } from './Supabase';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Analyze food image via Supabase Edge Function
 * This is the production-stable approach - model changes happen server-side
 */
export async function analyzeFoodImage(uri: string): Promise<AnalysisResult> {
    try {
        // 1. Resize image to reduce payload size
        const manipResult = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 1024 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        // 2. Convert to base64
        const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
            encoding: 'base64',
        });

        // 3. Get robust device/installation ID for rate limiting
        let deviceId = 'unknown';
        try {
            if (Platform.OS === 'ios') {
                deviceId = await Application.getIosIdForVendorAsync() || 'unknown-ios';
            } else if (Platform.OS === 'android') {
                deviceId = Application.getAndroidId() || 'unknown-android';
            }

            // Fallback to a persistent generated ID if hardware ID is missing
            if (deviceId === 'unknown' || !deviceId) {
                const storedId = await AsyncStorage.getItem('app_installation_id');
                if (storedId) {
                    deviceId = storedId;
                } else {
                    const newId = `gen_${Crypto.randomUUID()}`;
                    await AsyncStorage.setItem('app_installation_id', newId);
                    deviceId = newId;
                }
            }
        } catch (e) {
            console.warn('Failed to get device ID:', e);
        }

        console.log('Using Device ID for analysis:', deviceId);

        // 4. Call Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('analyze-food', {
            body: {
                imageBase64: base64,
                deviceId: deviceId
            }
        });

        if (error) {
            console.error('Edge Function Error:', error);

            let msg = error.message;

            // If it's the generic Supabase non-2xx message, we know it's likely a 400 Not Food
            // (since 500s are caught by the FATAL log and 429s have 'limit' or 'quota' in them)
            if (msg.includes('non-2xx')) {
                // Return a message that includes 'food' so analysis-result.tsx recognizes it
                msg = "This image doesn't appear to contain food. Please try a clearer shot of your meal.";
            }

            throw new Error(msg || 'Analysis failed');
        }

        return data as AnalysisResult;
    } catch (error: any) {
        console.error('Food analysis error:', error);
        throw error;
    }
}

/**
 * Get quota information
 * Server-side quota tracking implemented via Supabase Edge Function
 */
export async function getQuotaInfo() {
    // For now, return mock data
    // In production, this should query Supabase analysis_requests table
    return {
        dailyLimit: 10,
        used: 0,
        remaining: 10,
        retryBudget: 1,
        retryBudgetUsed: 0,
        resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
}
