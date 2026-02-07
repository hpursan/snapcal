import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, ScrollView, RefreshControl, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { MealService } from '@/services/MealService';
import { MealEntry } from '@/types/Meal';
import { ThemedText } from '@/components/ThemedText';
import { GlassBackground } from '@/components/GlassBackground';
import { AnimatedGlassCard } from '@/components/AnimatedGlassCard';
import { WeeklyEnergyTrend } from '@/components/WeeklyEnergyTrend';
import { useTheme } from '@/context/ThemeContext';

export default function HomeScreen() {
    const [meals, setMeals] = useState<MealEntry[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const { isDark } = useTheme();

    const loadMeals = async () => {
        const allMeals = await MealService.getAllMeals();
        setMeals(allMeals);
    };

    useFocusEffect(
        useCallback(() => {
            loadMeals();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadMeals();
        setRefreshing(false);
    };

    // Calculate insights
    const todayMeals = meals.filter(m => {
        const today = new Date();
        const mealDate = new Date(m.createdAt);
        return mealDate.toDateString() === today.toDateString();
    });

    const thisWeekMeals = meals.filter(m => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const mealDate = new Date(m.createdAt);
        return mealDate >= weekAgo;
    });

    // Energy distribution
    const lightCount = thisWeekMeals.filter(m => ['very_light', 'light'].includes(m.energyBand)).length;
    const moderateCount = thisWeekMeals.filter(m => m.energyBand === 'moderate').length;
    const heavyCount = thisWeekMeals.filter(m => ['heavy', 'very_heavy'].includes(m.energyBand)).length;
    const total = lightCount + moderateCount + heavyCount;

    // Dinner patterns insight
    const getDinnerInsight = () => {
        const dinners = thisWeekMeals.filter(m => {
            const hour = new Date(m.createdAt).getHours();
            return hour >= 17;
        });
        if (dinners.length < 3) return "Log more meals to compare dinner & lunch.";
        const avgEnergy = dinners.reduce((sum, m) => {
            const val = ['very_light', 'light'].includes(m.energyBand) ? 1 :
                m.energyBand === 'moderate' ? 2 : 3;
            return sum + val;
        }, 0) / dinners.length;
        return avgEnergy > 2 ? "Dinners tend to be heavier." : "Dinners are well-balanced.";
    };

    // Weekend vs weekday
    const getWeekendInsight = () => {
        const weekendMeals = thisWeekMeals.filter(m => {
            const day = new Date(m.createdAt).getDay();
            return day === 0 || day === 6;
        });
        const weekdayMeals = thisWeekMeals.filter(m => {
            const day = new Date(m.createdAt).getDay();
            return day > 0 && day < 6;
        });
        if (weekendMeals.length === 0 || weekdayMeals.length === 0) {
            return "Weekend consumption matches your weekday habits.";
        }
        const weekendAvg = weekendMeals.length / 2;
        const weekdayAvg = weekdayMeals.length / 5;
        return weekendAvg > weekdayAvg * 1.2
            ? "You eat more on weekends."
            : "Weekend consumption matches your weekday habits.";
    };

    // Energy trend
    const getEnergyTrend = () => {
        if (thisWeekMeals.length < 5) return "Your energy intake is well balanced.";
        const recentAvg = thisWeekMeals.slice(0, 3).reduce((sum, m) => {
            const val = ['very_light', 'light'].includes(m.energyBand) ? 1 :
                m.energyBand === 'moderate' ? 2 : 3;
            return sum + val;
        }, 0) / 3;
        return recentAvg < 1.8 ? "Trending lighter lately." : "Your energy intake is well balanced.";
    };

    // Date range
    const getDateRange = () => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return `${weekAgo.toLocaleDateString('en-US', options)} - ${now.toLocaleDateString('en-US', options)}`;
    };

    return (
        <GlassBackground>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    <View style={styles.titleContainer}>
                        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Weekly Insights</Text>
                    </View>

                    <View style={styles.dateRangeContainer}>
                        <Text style={styles.dateRange}>{getDateRange()}</Text>
                    </View>

                    {/* Insight Cards Grid */}
                    <View style={styles.gridContainer}>
                        {/* 1. Dinner Patterns */}
                        <AnimatedGlassCard intensity={50} delay={0} style={styles.cardLayout}>
                            <Ionicons name="moon" size={24} color="#1565c0" style={{ marginBottom: 8 }} />
                            <Text style={styles.cardTitle}>Dinner Patterns</Text>
                            <Text style={styles.cardBody}>{getDinnerInsight()}</Text>
                        </AnimatedGlassCard>

                        {/* 2. Weekend Review */}
                        <AnimatedGlassCard intensity={50} delay={100} style={styles.cardLayout}>
                            <Ionicons name="calendar" size={24} color="#2e7d32" style={{ marginBottom: 8 }} />
                            <Text style={styles.cardTitle}>Weekend Review</Text>
                            <Text style={styles.cardBody}>{getWeekendInsight()}</Text>
                        </AnimatedGlassCard>

                        {/* 3. Energy Trend */}
                        <AnimatedGlassCard intensity={50} delay={200} style={styles.cardLayout}>
                            <Ionicons name="trending-up" size={24} color="#f57c00" style={{ marginBottom: 8 }} />
                            <Text style={styles.cardTitle}>Energy Trend</Text>
                            <Text style={styles.cardBody}>{getEnergyTrend()}</Text>
                        </AnimatedGlassCard>

                        {/* 4. Distribution */}
                        <AnimatedGlassCard intensity={50} delay={300} style={styles.cardLayout}>
                            <Ionicons name="pie-chart" size={24} color="#7b1fa2" style={{ marginBottom: 8 }} />
                            <Text style={styles.cardTitle}>Distribution</Text>
                            {total > 0 ? (
                                <View>
                                    <View style={styles.distributionBar}>
                                        <View style={{ flex: lightCount, backgroundColor: '#4CAF50', height: 8, borderRadius: 4 }} />
                                        <View style={{ flex: moderateCount, backgroundColor: '#FFC107', height: 8, borderRadius: 4 }} />
                                        <View style={{ flex: heavyCount, backgroundColor: '#FF5252', height: 8, borderRadius: 4 }} />
                                    </View>
                                    <Text style={styles.distributionText}>
                                        {lightCount} Light • {moderateCount} Moderate • {heavyCount} Heavy
                                    </Text>
                                </View>
                            ) : (
                                <Text style={styles.cardBody}>No meals logged yet.</Text>
                            )}
                        </AnimatedGlassCard>
                    </View>

                    {/* Weekly Energy Trend */}
                    <View style={{ paddingHorizontal: 20, marginTop: 24, paddingBottom: 20 }}>
                        <WeeklyEnergyTrend meals={meals} />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </GlassBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 16,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    dateRangeContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    dateRange: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
        gap: 12,
    },
    cardLayout: {
        width: '47%',
        minHeight: 120,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#222',
        marginBottom: 6,
    },
    cardBody: {
        fontSize: 12,
        color: '#555',
        lineHeight: 16,
    },
    distributionBar: {
        flexDirection: 'row',
        gap: 2,
        marginBottom: 8,
    },
    distributionText: {
        fontSize: 10,
        color: '#666',
        lineHeight: 14,
    },
});
