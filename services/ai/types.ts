/**
 * AI Service Types
 * Production-grade type definitions for AI analysis
 */

import { EnergyBand, ConfidenceLevel } from '../../types/Meal';

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
    insight: string;
}

export enum AIErrorType {
    NETWORK_ERROR = 'NETWORK_ERROR',
    QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
    INVALID_REQUEST = 'INVALID_REQUEST',
    AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
    SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
    INVALID_RESPONSE = 'INVALID_RESPONSE',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class AIError extends Error {
    constructor(
        public type: AIErrorType,
        message: string,
        public retryable: boolean = false,
        public originalError?: Error
    ) {
        super(message);
        this.name = 'AIError';
    }
}

export interface RetryConfig {
    maxRetries: number;
    baseDelayMs: number;
    maxDelayMs: number;
    retryableErrors: AIErrorType[];
}

export interface QuotaInfo {
    dailyLimit: number;
    used: number;
    remaining: number;
    retryBudget: number;
    retryBudgetUsed: number;
    resetAt: Date;
}

export interface CircuitBreakerState {
    state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    failureCount: number;
    successCount: number;
    lastFailureTime: Date | null;
    nextRetryTime: Date | null;
}
