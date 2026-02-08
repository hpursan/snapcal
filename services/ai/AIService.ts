/**
 * AI Service
 * Production-grade AI analysis with retry logic, circuit breaker, and quota management
 * 
 * @deprecated This service is no longer used in production.
 * We now use Supabase Edge Functions (see FoodAnalysisService.ts)
 * for better security, stability, and server-side model updates.
 * 
 * Kept for reference only.
 */

import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { AIClient } from './AIClient';
import { ErrorHandler } from './ErrorHandler';
import { QuotaManager } from './QuotaManager';
import { CircuitBreaker } from './CircuitBreaker';
import { AnalysisResult, AIError, AIErrorType, RetryConfig } from './types';

const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 8000,
    retryableErrors: [
        AIErrorType.NETWORK_ERROR,
        AIErrorType.SERVICE_UNAVAILABLE,
        AIErrorType.INVALID_RESPONSE,
        AIErrorType.UNKNOWN_ERROR
    ]
};

export class AIService {
    private static instance: AIService;
    private client: AIClient | null = null;
    private quotaManager: QuotaManager;
    private circuitBreaker: CircuitBreaker;

    private constructor() {
        this.quotaManager = QuotaManager.getInstance();
        this.circuitBreaker = CircuitBreaker.getInstance();
    }

    static getInstance(): AIService {
        if (!AIService.instance) {
            AIService.instance = new AIService();
        }
        return AIService.instance;
    }

    /**
     * Initialize the service
     */
    async initialize(): Promise<void> {
        await this.quotaManager.initialize();
        await this.circuitBreaker.initialize();

        // Initialize client if API key is available
        if (AIClient.isConfigured()) {
            try {
                this.client = new AIClient();
            } catch (error) {
                console.error('Failed to initialize AI client:', error);
            }
        }
    }

    /**
     * Analyze food image with retry logic and quota management
     */
    async analyzeFoodImage(uri: string): Promise<AnalysisResult> {
        // Initialize if not already done
        if (!this.quotaManager || !this.circuitBreaker) {
            await this.initialize();
        }

        // Check if client is configured
        if (!this.client) {
            throw new AIError(
                AIErrorType.AUTHENTICATION_ERROR,
                'AI service is not configured. Please update the app.',
                false
            );
        }

        // Check circuit breaker
        const canMakeRequest = await this.circuitBreaker.canMakeRequest();
        if (!canMakeRequest) {
            const timeUntilRetry = this.circuitBreaker.getTimeUntilRetry();
            const seconds = timeUntilRetry ? Math.ceil(timeUntilRetry / 1000) : 60;
            throw new AIError(
                AIErrorType.SERVICE_UNAVAILABLE,
                `AI service temporarily unavailable. Please try again in ${seconds} seconds.`,
                false
            );
        }

        // Check quota
        const canUseQuota = await this.quotaManager.canMakeRequest(false);
        if (!canUseQuota) {
            const quotaInfo = await this.quotaManager.getQuotaInfo();
            throw new AIError(
                AIErrorType.QUOTA_EXCEEDED,
                `Daily limit of ${quotaInfo.dailyLimit} analyses reached. Resets at ${quotaInfo.resetAt.toLocaleTimeString()}.`,
                false
            );
        }

        // Process image
        let base64: string;
        try {
            const manipResult = await manipulateAsync(
                uri,
                [{ resize: { width: 512 } }],
                { compress: 0.5, format: SaveFormat.JPEG, base64: true }
            );
            base64 = manipResult.base64!;
            if (!base64) {
                throw new Error("Could not process image");
            }
        } catch (error) {
            throw new AIError(
                AIErrorType.INVALID_REQUEST,
                'Could not process image. Please try again with a different photo.',
                false,
                error as Error
            );
        }

        // Analyze with retry logic
        return await this.analyzeWithRetry(base64, DEFAULT_RETRY_CONFIG);
    }

    /**
     * Analyze with retry logic
     */
    private async analyzeWithRetry(
        base64Image: string,
        config: RetryConfig,
        attemptNumber: number = 0
    ): Promise<AnalysisResult> {
        const isRetry = attemptNumber > 0;

        try {
            // Check retry quota if this is a retry
            if (isRetry) {
                const canRetry = await this.quotaManager.canMakeRequest(true);
                if (!canRetry) {
                    throw new AIError(
                        AIErrorType.QUOTA_EXCEEDED,
                        'Retry limit reached. Please try again later.',
                        false
                    );
                }
            }

            // Record request in quota
            await this.quotaManager.recordRequest(isRetry);

            // Make API call
            const result = await this.client!.analyzeImage(base64Image);

            // Success - record in circuit breaker
            await this.circuitBreaker.recordSuccess();

            // Warn if approaching quota limit
            if (await this.quotaManager.isApproachingLimit()) {
                console.warn('Approaching daily quota limit');
            }

            return result;

        } catch (error: any) {
            // Classify error
            const aiError = ErrorHandler.classify(error);

            // Record failure in circuit breaker
            await this.circuitBreaker.recordFailure();

            // Check if we should retry
            const shouldRetry = ErrorHandler.shouldRetry(aiError, attemptNumber, config.maxRetries);

            if (shouldRetry && config.retryableErrors.includes(aiError.type)) {
                // Calculate delay with exponential backoff
                const delay = Math.min(
                    config.baseDelayMs * Math.pow(2, attemptNumber),
                    config.maxDelayMs
                );

                console.log(`Retrying in ${delay}ms (attempt ${attemptNumber + 1}/${config.maxRetries})...`);

                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, delay));

                // Retry
                return await this.analyzeWithRetry(base64Image, config, attemptNumber + 1);
            }

            // No retry - throw error
            throw aiError;
        }
    }

    /**
     * Get quota information
     */
    async getQuotaInfo() {
        return await this.quotaManager.getQuotaInfo();
    }

    /**
     * Get circuit breaker state
     */
    getCircuitBreakerState() {
        return this.circuitBreaker.getState();
    }

    /**
     * Reset quota (for testing)
     */
    async resetQuota() {
        await this.quotaManager.reset();
    }

    /**
     * Reset circuit breaker (for testing)
     */
    async resetCircuitBreaker() {
        await this.circuitBreaker.reset();
    }
}
