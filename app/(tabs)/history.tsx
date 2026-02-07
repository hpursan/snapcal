import React, { useState, useCallback } from 'react';
import { Image, StyleSheet, TouchableOpacity, Text, View, SectionList } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { MealService } from '@/services/MealService';
import { MealEntry, ENERGY_BAND_LABELS } from '@/types/Meal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassBackground } from '@/components/GlassBackground';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/context/ThemeContext';

export default function HistoryScreen() {
    const router = useRouter();
    const { isDark } = useTheme();

    const [sections, setSections] = useState<{ title: string; data: MealEntry[] }[]>([]);

    const loadMeals = async () => {
        const data = await MealService.getAllMeals();

        // 1. Sort Descending
        const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // 2. Group by Date
        const grouped = sorted.reduce((acc, meal) => {
            const date = new Date(meal.createdAt);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            let title = date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

            if (date.toDateString() === today.toDateString()) title = "Today";
            else if (date.toDateString() === yesterday.toDateString()) title = "Yesterday";

            if (!acc[title]) {
                acc[title] = [];
            }
            acc[title].push(meal);
            return acc;
        }, {} as Record<string, MealEntry[]>);

        // 3. Convert to SectionList format
        const sectionData = Object.keys(grouped).map(title => ({
            title,
            data: grouped[title]
        }));

        sectionData.sort((a, b) => {
            if (a.data.length && b.data.length) {
                return new Date(b.data[0].createdAt).getTime() - new Date(a.data[0].createdAt).getTime();
            }
            return 0;
        });

        setSections(sectionData);
    };

    useFocusEffect(
        useCallback(() => {
            loadMeals();
        }, [])
    );

    const renderMealItem = ({ item }: { item: MealEntry }) => (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(`/meal/${item.id}`)}
            style={{ marginHorizontal: 16, marginBottom: 16 }}
        >
            <BlurView intensity={50} tint="light" style={styles.glassCard}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={[styles.mealType, isDark && styles.darkText]}>
                            {item.mealType}
                        </Text>
                        <Text style={styles.mealTime}>
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                    <View style={[styles.badge, styles[`conf_${item.confidence}`]]}>
                        <Text style={styles.badgeText}>{item.confidence}</Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <Image source={{ uri: item.photoUri }} style={styles.cardImage} />
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardBandLabel}>Energy Estimate:</Text>
                        <Text style={styles.cardBandValue}>
                            {ENERGY_BAND_LABELS[item.energyBand]}
                        </Text>
                        <Text numberOfLines={2} style={styles.cardReasoning}>
                            "{item.reasoning}"
                        </Text>
                    </View>
                </View>
            </BlurView>
        </TouchableOpacity>
    );

    const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>{title}</Text>
        </View>
    );

    return (
        <GlassBackground>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <View style={styles.titleContainer}>
                        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Meal History</Text>
                    </View>

                    {sections.length === 0 ? (
                        <ThemedText style={{ opacity: 0.6, textAlign: 'center', marginTop: 40 }}>
                            No meals logged yet.
                        </ThemedText>
                    ) : (
                        <SectionList
                            sections={sections}
                            renderItem={renderMealItem}
                            renderSectionHeader={renderSectionHeader}
                            keyExtractor={item => item.id}
                            contentContainerStyle={{ paddingBottom: 40 }}
                            showsVerticalScrollIndicator={false}
                            stickySectionHeadersEnabled={false}
                        />
                    )}
                </View>
            </SafeAreaView>
        </GlassBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 16,
    },
    titleContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    darkText: { color: '#000' }, // Corrected for light/glass theme

    // Section Header
    sectionHeader: {
        paddingHorizontal: 20,
        paddingVertical: 12, // More space
        backgroundColor: 'transparent',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },

    // Glass Card Styles
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.45)', // Semi-transparent
        borderRadius: 16,
        padding: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.6)',
    },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardBody: {
        flexDirection: 'row',
        gap: 12,
    },
    cardImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#eee',
    },
    cardInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    cardBandLabel: {
        fontSize: 12,
        color: '#666',
        textTransform: 'uppercase',
    },
    cardBandValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    cardReasoning: {
        fontSize: 13,
        color: '#555',
        fontStyle: 'italic',
        lineHeight: 18,
    },

    // Badges
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    conf_high: { backgroundColor: '#4CAF50' },
    conf_medium: { backgroundColor: '#FFC107' },
    conf_low: { backgroundColor: '#FF5252' },

    mealType: { fontSize: 18, fontWeight: 'bold', textTransform: 'capitalize', color: '#222' },
    mealTime: { fontSize: 12, color: '#666', marginTop: 2 },
});
