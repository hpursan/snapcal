import { Image, StyleSheet, Platform, View, Text, Button, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useMeals, Meal } from '@/context/MealContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function HomeScreen() {
    const router = useRouter();
    const { goals, todayStats, meals } = useMeals();

    const caloriesRemaining = goals.calories - todayStats.calories;
    const isOverBudget = caloriesRemaining < 0;
    const absCalories = Math.abs(caloriesRemaining);

    const [expanded, setExpanded] = useState(false);
    const displayedMeals = expanded ? meals : meals.slice(0, 3);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello,</Text>
                    <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Main Progress Ring */}
                <View style={styles.ringContainer}>
                    <View style={[styles.ring, isOverBudget && { borderColor: Colors.dark.surplus }]}>
                        <Text style={[styles.calories, isOverBudget && { color: Colors.dark.surplus }]}>
                            {absCalories}
                        </Text>
                        <Text style={[styles.label, isOverBudget && { color: Colors.dark.surplus }]}>
                            {isOverBudget ? 'surplus' : 'calories left'}
                        </Text>
                    </View>
                </View>

                {/* Macros */}
                <View style={styles.statsContainer}>
                    <MacroStat label="Protein" current={todayStats.protein} target={goals.protein} color={Colors.dark.primary} />
                    <MacroStat label="Carbs" current={todayStats.carbs} target={goals.carbs} color={Colors.dark.success} />
                    <MacroStat label="Fats" current={todayStats.fats} target={goals.fats} color={Colors.dark.accent} />
                </View>

                {/* Recent Meals */}
                <Text style={styles.sectionTitle}>Today's Meals</Text>
                {meals.length === 0 ? (
                    <Text style={styles.emptyText}>No meals logged yet. Tap scan to start!</Text>
                ) : (
                    <>
                        {displayedMeals.map((meal) => <MealItem key={meal.id} meal={meal} />)}

                        {meals.length > 3 && (
                            <TouchableOpacity
                                onPress={() => setExpanded(!expanded)}
                                style={{ alignSelf: 'center', padding: 10, marginTop: 5 }}
                            >
                                <Ionicons
                                    name={expanded ? "chevron-up" : "chevron-down"}
                                    size={24}
                                    color={Colors.dark.gray}
                                />
                            </TouchableOpacity>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

function MacroStat({ label, current, target, color }: { label: string, current: number, target: number, color: string }) {
    const isOver = current > target;
    const progress = Math.min(100, (current / target) * 100);

    return (
        <View style={styles.macroRow}>
            <View style={styles.macroHeader}>
                <Text style={styles.macroLabel}>{label}</Text>
                <Text style={[styles.macroValue, isOver && { color: Colors.dark.surplus }]}>
                    {current} / {target}g {isOver && '(Surplus)'}
                </Text>
            </View>
            <View style={styles.progressBarBackground}>
                <View style={[
                    styles.progressBarFill,
                    { width: `${progress}%`, backgroundColor: isOver ? Colors.dark.surplus : color }
                ]} />
            </View>
        </View>
    )
}

import { Alert } from 'react-native';

function MealItem({ meal }: { meal: Meal }) {
    const { removeMeal } = useMeals();
    const router = useRouter();

    const handleLongPress = () => {
        Alert.alert(
            "Delete Meal",
            `Are you sure you want to remove ${meal.name}?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => removeMeal(meal.id) }
            ]
        );
    };

    return (
        <TouchableOpacity
            style={styles.mealItem}
            onLongPress={handleLongPress}
            onPress={() => router.push(`/meal/${meal.id}`)}
            activeOpacity={0.7}
        >
            <Image source={{ uri: meal.imageUri }} style={styles.mealImage} />
            <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealCal}>{meal.calories} kcal</Text>
            </View>
            <Ionicons name="create-outline" size={20} color={Colors.dark.gray} />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    greeting: {
        fontSize: 16,
        color: Colors.dark.tabIconDefault,
    },
    date: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.dark.text,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    ringContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    ring: {
        width: 240,
        height: 240,
        borderRadius: 120,
        borderWidth: 12,
        borderColor: Colors.dark.gray, // Placeholder for progress ring
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.dark.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    calories: {
        color: Colors.dark.text,
        fontSize: 56,
        fontWeight: 'bold',
    },
    label: {
        color: Colors.dark.tabIconDefault,
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: -5,
    },
    statsContainer: {
        marginBottom: 30,
        gap: 15,
    },
    macroRow: {
        gap: 8,
    },
    macroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    macroLabel: {
        color: Colors.dark.text,
        fontWeight: '600',
    },
    macroValue: {
        color: Colors.dark.tabIconDefault,
        fontSize: 12,
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: Colors.dark.cardBackground,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    sectionTitle: {
        color: Colors.dark.text,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    emptyText: {
        color: Colors.dark.tabIconDefault,
        textAlign: 'center',
        marginTop: 20,
    },
    mealItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.dark.cardBackground,
        padding: 12,
        borderRadius: 16,
        marginBottom: 10,
    },
    mealImage: {
        width: 50,
        height: 50,
        borderRadius: 10,
        marginRight: 15,
        backgroundColor: '#333',
    },
    mealInfo: {
        flex: 1,
    },
    mealName: {
        color: Colors.dark.text,
        fontSize: 16,
        fontWeight: '600',
    },
    mealCal: {
        color: Colors.dark.tabIconDefault,
        fontSize: 14,
    },
});
