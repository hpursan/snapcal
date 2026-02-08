/**
 * AI Error Handler
 * Classifies errors and provides user-friendly messages
 */

import { AIError, AIErrorType } from './types';

export class ErrorHandler {
    /**
     * Classify an error and convert to AIError
     */
    static classify(error: any): AIError {
        // Network errors
        if (error.message?.includes('network') ||
            error.message?.includes('fetch') ||
            error.message?.includes('timeout') ||
            error.code === 'NETWORK_ERROR') {
            return new AIError(
                AIErrorType.NETWORK_ERROR,
                'Network connection issue. Please check your internet connection.',
                true, // retryable
                error
            );
        }

        // Quota/Rate limit errors
        if (error.message?.includes('quota') ||
            error.message?.includes('rate limit') ||
            error.message?.includes('429') ||
            error.status === 429) {
            return new AIError(
                AIErrorType.QUOTA_EXCEEDED,
                'Daily analysis limit reached. Please try again tomorrow.',
                false, // not retryable
                error
            );
        }

        // Authentication errors
        if (error.message?.includes('API key') ||
            error.message?.includes('authentication') ||
            error.message?.includes('unauthorized') ||
            error.status === 401 ||
            error.status === 403) {
            return new AIError(
                AIErrorType.AUTHENTICATION_ERROR,
                'Service configuration error. Please contact support.',
                false, // not retryable
                error
            );
        }

        // Invalid request errors
        if (error.message?.includes('invalid') ||
            error.message?.includes('bad request') ||
            error.status === 400) {
            return new AIError(
                AIErrorType.INVALID_REQUEST,
                'Could not process image. Please try a clearer photo.',
                false, // not retryable
                error
            );
        }

        // Service unavailable
        if (error.message?.includes('service unavailable') ||
            error.message?.includes('503') ||
            error.status === 503) {
            return new AIError(
                AIErrorType.SERVICE_UNAVAILABLE,
                'AI service temporarily unavailable. Please try again in a moment.',
                true, // retryable
                error
            );
        }

        // Invalid response (parsing errors)
        if (error instanceof SyntaxError ||
            error.message?.includes('JSON') ||
            error.message?.includes('parse')) {
            return new AIError(
                AIErrorType.INVALID_RESPONSE,
                'Received invalid response from AI service.',
                true, // retryable once
                error
            );
        }

        // Unknown error - retry once
        return new AIError(
            AIErrorType.UNKNOWN_ERROR,
            'An unexpected error occurred. Please try again.',
            true, // retryable once
            error
        );
    }

    /**
     * Get user-friendly error message
     */
    static getUserMessage(error: AIError): string {
        return error.message;
    }

    /**
     * Get suggested action for user
     */
    static getSuggestedAction(error: AIError): string {
        switch (error.type) {
            case AIErrorType.NETWORK_ERROR:
                return 'Check your internet connection and try again.';
            case AIErrorType.QUOTA_EXCEEDED:
                return 'You can manually enter meal details or wait until tomorrow.';
            case AIErrorType.AUTHENTICATION_ERROR:
                return 'Please update the app or contact support.';
            case AIErrorType.INVALID_REQUEST:
                return 'Take a clearer photo with better lighting.';
            case AIErrorType.SERVICE_UNAVAILABLE:
                return 'Wait a moment and try again.';
            case AIErrorType.INVALID_RESPONSE:
                return 'Try again or use manual entry.';
            default:
                return 'Try again or use manual entry.';
        }
    }

    /**
     * Check if error should be retried
     */
    static shouldRetry(error: AIError, attemptNumber: number, maxRetries: number): boolean {
        if (attemptNumber >= maxRetries) {
            return false;
        }

        if (!error.retryable) {
            return false;
        }

        // Only retry INVALID_RESPONSE once
        if (error.type === AIErrorType.INVALID_RESPONSE && attemptNumber > 0) {
            return false;
        }

        return true;
    }
}
