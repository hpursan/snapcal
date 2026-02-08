/**
 * Quota Manager
 * Tracks API usage and enforces limits to prevent quota waste
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuotaInfo } from './types';

const STORAGE_KEY = '@aperioesca_quota';
const DAILY_LIMIT = 50; // Free tier limit
const RETRY_BUDGET_PERCENT = 0.10; // 10% of daily limit for retries

export class QuotaManager {
    private static instance: QuotaManager;
    private quotaInfo: QuotaInfo | null = null;

    private constructor() { }

    static getInstance(): QuotaManager {
        if (!QuotaManager.instance) {
            QuotaManager.instance = new QuotaManager();
        }
        return QuotaManager.instance;
    }

    /**
     * Initialize quota tracking
     */
    async initialize(): Promise<void> {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                const resetAt = new Date(data.resetAt);

                // Check if we need to reset (new day)
                if (new Date() >= resetAt) {
                    this.quotaInfo = this.createNewQuota();
                } else {
                    this.quotaInfo = {
                        ...data,
                        resetAt
                    };
                }
            } else {
                this.quotaInfo = this.createNewQuota();
            }

            await this.save();
        } catch (error) {
            console.error('Failed to initialize quota:', error);
            this.quotaInfo = this.createNewQuota();
        }
    }

    /**
     * Create new quota for the day
     */
    private createNewQuota(): QuotaInfo {
        const resetAt = new Date();
        resetAt.setHours(24, 0, 0, 0); // Reset at midnight

        return {
            dailyLimit: DAILY_LIMIT,
            used: 0,
            remaining: DAILY_LIMIT,
            retryBudget: Math.floor(DAILY_LIMIT * RETRY_BUDGET_PERCENT),
            retryBudgetUsed: 0,
            resetAt
        };
    }

    /**
     * Check if we can make a request
     */
    async canMakeRequest(isRetry: boolean = false): Promise<boolean> {
        if (!this.quotaInfo) {
            await this.initialize();
        }

        if (isRetry) {
            return this.quotaInfo!.retryBudgetUsed < this.quotaInfo!.retryBudget;
        }

        return this.quotaInfo!.remaining > 0;
    }

    /**
     * Record a request
     */
    async recordRequest(isRetry: boolean = false): Promise<void> {
        if (!this.quotaInfo) {
            await this.initialize();
        }

        if (isRetry) {
            this.quotaInfo!.retryBudgetUsed++;
        } else {
            this.quotaInfo!.used++;
            this.quotaInfo!.remaining = this.quotaInfo!.dailyLimit - this.quotaInfo!.used;
        }

        await this.save();
    }

    /**
     * Get current quota info
     */
    async getQuotaInfo(): Promise<QuotaInfo> {
        if (!this.quotaInfo) {
            await this.initialize();
        }
        return { ...this.quotaInfo! };
    }

    /**
     * Check if approaching limit (80%)
     */
    async isApproachingLimit(): Promise<boolean> {
        if (!this.quotaInfo) {
            await this.initialize();
        }
        const usagePercent = this.quotaInfo!.used / this.quotaInfo!.dailyLimit;
        return usagePercent >= 0.8;
    }

    /**
     * Save quota to storage
     */
    private async save(): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.quotaInfo));
        } catch (error) {
            console.error('Failed to save quota:', error);
        }
    }

    /**
     * Reset quota (for testing)
     */
    async reset(): Promise<void> {
        this.quotaInfo = this.createNewQuota();
        await this.save();
    }
}
