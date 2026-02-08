/**
 * Food Analysis Service
 * Uses Supabase Edge Function for production stability
 * This allows updating AI models server-side without app deployment
 */

import { supabase } from './Supabase';
import { AnalysisResult } from './ai/types';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Device from 'expo-device';

export type { AnalysisResult };

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

        // 3. Get device ID for rate limiting (prevents quota bypass via reinstall)
        const deviceId = Device.osBuildFingerprint || Device.osInternalBuildId || 'unknown';

        // 4. Call Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('analyze-food', {
            body: {
                imageBase64: base64,
                deviceId: deviceId
            }
        });

        if (error) {
            throw new Error(error.message || 'Analysis failed');
        }

        return data as AnalysisResult;
    } catch (error: any) {
        console.error('Food analysis error:', error);
        throw error;
    }
}

/**
 * Get quota information
 * TODO: Implement server-side quota tracking via Supabase
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
