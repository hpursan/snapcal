import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MealEntry } from '../types/Meal';
import * as Crypto from 'expo-crypto';

const MEALS_STORAGE_KEY = 'aperioesca_meals_v1';
const PHOTOS_DIR = FileSystem.documentDirectory + 'meals/';

// Ensure directory exists
const ensureDirectoryExists = async () => {
    const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIR);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
    }
};

export const MealService = {
    // 1. Save a new meal (Move photo to permanent local storage)
    saveMeal: async (entry: Omit<MealEntry, 'id' | 'createdAt' | 'photoUri' | 'frozen'> & { tempPhotoUri: string, createdAt?: string }): Promise<MealEntry> => {
        try {
            await ensureDirectoryExists();

            const id = Crypto.randomUUID();
            const fileName = `${id}.jpg`;
            const newPath = PHOTOS_DIR + fileName;

            console.log(`[MealService] Saving meal ${id}, moving from ${entry.tempPhotoUri} to ${newPath}`);

            // Move photo from cache/temp to permanent local storage
            await FileSystem.moveAsync({
                from: entry.tempPhotoUri,
                to: newPath
            });

            const newMeal: MealEntry = {
                ...entry,
                id,
                createdAt: entry.createdAt || new Date().toISOString(),
                photoUri: newPath,
                frozen: true // Lock it immediately
            };

            // Save to AsyncStorage
            const currentMeals = await MealService.getAllMeals();
            const updatedMeals = [newMeal, ...currentMeals];
            await AsyncStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(updatedMeals));

            console.log(`[MealService] Success.`);
            return newMeal;
        } catch (error: any) {
            console.error("[MealService] Save Failed:", error);
            throw new Error(`Save failed: ${error.message || error}`);
        }
    },

    // 2. Get all meals
    getAllMeals: async (): Promise<MealEntry[]> => {
        try {
            const json = await AsyncStorage.getItem(MEALS_STORAGE_KEY);
            return json != null ? JSON.parse(json) : [];
        } catch (e) {
            console.error("Failed to load meals", e);
            return [];
        }
    },

    // 3. Get single meal
    getMealById: async (id: string): Promise<MealEntry | undefined> => {
        const meals = await MealService.getAllMeals();
        return meals.find(m => m.id === id);
    },

    // 4. Delete meal
    deleteMeal: async (id: string) => {
        const meals = await MealService.getAllMeals();
        const mealToDelete = meals.find(m => m.id === id);

        if (mealToDelete) {
            // Remove file
            await FileSystem.deleteAsync(mealToDelete.photoUri, { idempotent: true });
        }

        const updatedMeals = meals.filter(m => m.id !== id);
        await AsyncStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(updatedMeals));
    },

    // 5. Clear all (Debug/Privacy)
    clearAll: async () => {
        await AsyncStorage.removeItem(MEALS_STORAGE_KEY);
        // Clean up files
        await FileSystem.deleteAsync(PHOTOS_DIR, { idempotent: true });
    }
};
