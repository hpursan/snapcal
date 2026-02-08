/**
 * Circuit Breaker
 * Prevents cascading failures by stopping requests after repeated failures
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CircuitBreakerState } from './types';

const STORAGE_KEY = '@aperioesca_circuit_breaker';
const FAILURE_THRESHOLD = 5; // Open circuit after 5 failures
const SUCCESS_THRESHOLD = 2; // Close circuit after 2 successes
const RESET_TIMEOUT_MS = 60000; // Try again after 60 seconds

export class CircuitBreaker {
    private static instance: CircuitBreaker;
    private state: CircuitBreakerState;

    private constructor() {
        this.state = {
            state: 'CLOSED',
            failureCount: 0,
            successCount: 0,
            lastFailureTime: null,
            nextRetryTime: null
        };
    }

    static getInstance(): CircuitBreaker {
        if (!CircuitBreaker.instance) {
            CircuitBreaker.instance = new CircuitBreaker();
        }
        return CircuitBreaker.instance;
    }

    /**
     * Initialize from storage
     */
    async initialize(): Promise<void> {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                this.state = {
                    ...data,
                    lastFailureTime: data.lastFailureTime ? new Date(data.lastFailureTime) : null,
                    nextRetryTime: data.nextRetryTime ? new Date(data.nextRetryTime) : null
                };

                // Check if we should transition from OPEN to HALF_OPEN
                if (this.state.state === 'OPEN' && this.state.nextRetryTime) {
                    if (new Date() >= this.state.nextRetryTime) {
                        this.state.state = 'HALF_OPEN';
                        this.state.successCount = 0;
                        await this.save();
                    }
                }
            }
        } catch (error) {
            console.error('Failed to initialize circuit breaker:', error);
        }
    }

    /**
     * Check if request is allowed
     */
    async canMakeRequest(): Promise<boolean> {
        await this.initialize();

        if (this.state.state === 'CLOSED') {
            return true;
        }

        if (this.state.state === 'HALF_OPEN') {
            return true; // Allow one request to test
        }

        if (this.state.state === 'OPEN') {
            // Check if timeout has passed
            if (this.state.nextRetryTime && new Date() >= this.state.nextRetryTime) {
                this.state.state = 'HALF_OPEN';
                this.state.successCount = 0;
                await this.save();
                return true;
            }
            return false;
        }

        return false;
    }

    /**
     * Record a successful request
     */
    async recordSuccess(): Promise<void> {
        if (this.state.state === 'CLOSED') {
            // Reset failure count
            this.state.failureCount = 0;
        } else if (this.state.state === 'HALF_OPEN') {
            this.state.successCount++;
            if (this.state.successCount >= SUCCESS_THRESHOLD) {
                // Close the circuit
                this.state.state = 'CLOSED';
                this.state.failureCount = 0;
                this.state.successCount = 0;
                this.state.lastFailureTime = null;
                this.state.nextRetryTime = null;
            }
        }

        await this.save();
    }

    /**
     * Record a failed request
     */
    async recordFailure(): Promise<void> {
        this.state.failureCount++;
        this.state.lastFailureTime = new Date();

        if (this.state.state === 'HALF_OPEN') {
            // Failed during test, reopen circuit
            this.state.state = 'OPEN';
            this.state.successCount = 0;
            this.state.nextRetryTime = new Date(Date.now() + RESET_TIMEOUT_MS);
        } else if (this.state.failureCount >= FAILURE_THRESHOLD) {
            // Open the circuit
            this.state.state = 'OPEN';
            this.state.nextRetryTime = new Date(Date.now() + RESET_TIMEOUT_MS);
        }

        await this.save();
    }

    /**
     * Get current state
     */
    getState(): CircuitBreakerState {
        return { ...this.state };
    }

    /**
     * Get time until next retry (if circuit is open)
     */
    getTimeUntilRetry(): number | null {
        if (this.state.state === 'OPEN' && this.state.nextRetryTime) {
            const diff = this.state.nextRetryTime.getTime() - Date.now();
            return Math.max(0, diff);
        }
        return null;
    }

    /**
     * Save state to storage
     */
    private async save(): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (error) {
            console.error('Failed to save circuit breaker state:', error);
        }
    }

    /**
     * Reset circuit breaker (for testing)
     */
    async reset(): Promise<void> {
        this.state = {
            state: 'CLOSED',
            failureCount: 0,
            successCount: 0,
            lastFailureTime: null,
            nextRetryTime: null
        };
        await this.save();
    }
}
