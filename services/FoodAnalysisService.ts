/**
 * Food Analysis Service
 * Wrapper around production-ready AI service for backward compatibility
 */

import { AIService } from './ai/AIService';
import { AnalysisResult, AIError } from './ai/types';

export type { AnalysisResult };

/**
 * Analyze food image
 * @deprecated Use AIService.getInstance().analyzeFoodImage() directly for more control
 */
export async function analyzeFoodImage(uri: string): Promise<AnalysisResult> {
    const aiService = AIService.getInstance();
    await aiService.initialize();
    return await aiService.analyzeFoodImage(uri);
}

/**
 * Get quota information
 */
export async function getQuotaInfo() {
    const aiService = AIService.getInstance();
    await aiService.initialize();
    return await aiService.getQuotaInfo();
}

/**
 * Export AI error for error handling in UI
 */
export { AIError };
