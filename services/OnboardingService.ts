import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@aperioesca_has_seen_onboarding';

export class OnboardingService {
    /**
     * Check if the user has completed onboarding
     */
    static async hasSeenOnboarding(): Promise<boolean> {
        try {
            const value = await AsyncStorage.getItem(ONBOARDING_KEY);
            return value === 'true';
        } catch (error) {
            console.error('Error checking onboarding status:', error);
            return false;
        }
    }

    /**
     * Mark onboarding as completed
     */
    static async markOnboardingComplete(): Promise<void> {
        try {
            await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        } catch (error) {
            console.error('Error marking onboarding complete:', error);
        }
    }

    /**
     * Reset onboarding (for testing)
     */
    static async resetOnboarding(): Promise<void> {
        try {
            await AsyncStorage.removeItem(ONBOARDING_KEY);
        } catch (error) {
            console.error('Error resetting onboarding:', error);
        }
    }
}
