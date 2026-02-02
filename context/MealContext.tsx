import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface Meal {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    imageUri?: string;
    timestamp: string; // Serialized Date
}

export interface UserGoals {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    currentWeight?: string;
    targetWeight?: string;
    isOnboarded: boolean;
}

interface MealContextType {
    meals: Meal[];
    goals: UserGoals;
    addMeal: (meal: Omit<Meal, 'id' | 'timestamp'>) => void;
    removeMeal: (id: string) => void;
    updateMeal: (id: string, updatedMeal: Partial<Meal>) => void;
    updateGoals: (newGoals: Partial<UserGoals>) => void;
    clearAllData: () => Promise<void>;
    isLoading: boolean;
    todayStats: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    };
}

const MealContext = createContext<MealContextType | undefined>(undefined);

const STORAGE_KEYS = {
    MEALS: 'snapcal_meals',
    GOALS: 'snapcal_goals',
};

export function MealProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);

    // Default Goals
    const [goals, setGoals] = useState<UserGoals>({
        calories: 2000,
        protein: 150,
        carbs: 200,
        fats: 65,
        isOnboarded: false,
    });

    const [meals, setMeals] = useState<Meal[]>([]);

    // Load Data on Mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const savedMeals = await AsyncStorage.getItem(STORAGE_KEYS.MEALS);
                const savedGoals = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);

                if (savedMeals) setMeals(JSON.parse(savedMeals));
                if (savedGoals) setGoals(JSON.parse(savedGoals));
            } catch (e) {
                console.error("Failed to load persistence data", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Persist State Helper
    const saveMeals = async (newMeals: Meal[]) => {
        setMeals(newMeals);
        await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(newMeals));
    };

    const updateGoals = async (newGoals: Partial<UserGoals>) => {
        const updated = { ...goals, ...newGoals };
        setGoals(updated);
        await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updated));
    };

    const addMeal = (meal: Omit<Meal, 'id' | 'timestamp'>) => {
        const newMeal: Meal = {
            ...meal,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
        };
        const newMealsList = [newMeal, ...meals];
        saveMeals(newMealsList);
    };

    const removeMeal = (id: string) => {
        const newMealsList = meals.filter(meal => meal.id !== id);
        saveMeals(newMealsList);
    };

    const updateMeal = (id: string, updatedMeal: Partial<Meal>) => {
        const newMealsList = meals.map(meal =>
            meal.id === id ? { ...meal, ...updatedMeal } : meal
        );
        saveMeals(newMealsList);
    };

    const clearAllData = async () => {
        try {
            await AsyncStorage.clear();
            setMeals([]);
            setGoals({
                calories: 2000,
                protein: 150,
                carbs: 200,
                fats: 65,
                isOnboarded: false,
            });
        } catch (e) {
            console.error("Failed to clear data", e);
        }
    };

    // Calculate Today's Stats
    const todayStats = meals.reduce(
        (acc, meal) => {
            const mealDate = new Date(meal.timestamp).toDateString();
            const today = new Date().toDateString();

            if (mealDate === today) {
                return {
                    calories: acc.calories + meal.calories,
                    protein: acc.protein + meal.protein,
                    carbs: acc.carbs + meal.carbs,
                    fats: acc.fats + meal.fats,
                };
            }
            return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    return (
        <MealContext.Provider value={{ meals, goals, addMeal, removeMeal, updateMeal, updateGoals, clearAllData, todayStats, isLoading }}>
            {children}
        </MealContext.Provider>
    );
}

export function useMeals() {
    const context = useContext(MealContext);
    if (context === undefined) {
        throw new Error('useMeals must be used within a MealProvider');
    }
    return context;
}
