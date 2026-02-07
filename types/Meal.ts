export type EnergyBand = 'very_light' | 'light' | 'moderate' | 'heavy' | 'very_heavy';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface MealEntry {
    id: string; // UUID
    createdAt: string; // ISO Timestamp

    // Privacy: Local path only
    photoUri: string;

    // Core Insights
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    energyBand: EnergyBand;
    confidence: ConfidenceLevel;

    // Human readable reasoning (1-2 lines)
    reasoning: string;

    // Optional data for calibration (not primary UI)
    kcalRange?: {
        min: number;
        max: number;
    };

    // Flags for analysis quality
    flags: {
        mixedPlate: boolean;
        unclearPortions: boolean;
        sharedDish: boolean;
    };

    // User feedback for Reinforcement Learning (Local)
    userFeedback?: 'too_light' | 'too_heavy' | 'accurate';

    // Immutability
    frozen: boolean; // true once analyzed
}

export const ENERGY_BAND_LABELS: Record<EnergyBand, string> = {
    very_light: "Very Light",
    light: "Light",
    moderate: "Moderate",
    heavy: "Heavy",
    very_heavy: "Very Heavy"
};
