import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { analyzeFoodImage, AnalysisResult } from '@/services/FoodAnalysisService';
import { MealService } from '@/services/MealService';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Network from 'expo-network';
import { Ionicons } from '@expo/vector-icons';
import { ENERGY_BAND_LABELS } from '@/types/Meal';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AnalysisResultScreen() {
    const router = useRouter();
    const { imageUri } = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [isLoading, setIsLoading] = useState(true);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    // Simulation Mode: Date Picker
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const performAnalysis = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Check network status first
            const networkState = await Network.getNetworkStateAsync();
            if (!networkState.isConnected) {
                throw new Error("No internet connection detected. Please check your settings.");
            }

            const data = await analyzeFoodImage(imageUri as string);
            setResult(data);
            setRetryCount(0); // Reset retry count on success
        } catch (e: any) {
            console.error("Analysis Error Details:", {
                message: e.message,
                type: e.type,
                name: e.name,
            });

            // Provide user-friendly error messages
            if (e.message?.toLowerCase().includes('rate limit') ||
                e.message?.toLowerCase().includes('quota') ||
                e.message?.includes('429')) {
                setError("You've reached your daily limit. Try again tomorrow.");
            } else if (e.message?.toLowerCase().includes('network') ||
                e.message?.toLowerCase().includes('connection')) {
                setError("Network connection issue. Please check your internet and try again.");
            } else if (e.message?.toLowerCase().includes('too large') ||
                e.message?.includes('413')) {
                setError("Image is too large. Please use a smaller image.");
            } else if (e.message?.toLowerCase().includes('duplicate')) {
                setError("You already analyzed this image recently. Try a different photo.");
            } else if (e.message?.toLowerCase().includes('readasstringasync') || e.message?.toLowerCase().includes('filesystem')) {
                setError("System error accessing image. We are working on a fix.");
            } else {
                setError("Could not analyze image. Please try again or take a new photo.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!imageUri) return;
        performAnalysis();
    }, [imageUri]);

    const handleSave = async () => {
        if (!result || !imageUri) return;
        try {
            await MealService.saveMeal({
                tempPhotoUri: imageUri as string,
                mealType: result.mealType,
                energyBand: result.energyBand,
                confidence: result.confidence,
                reasoning: result.reasoning,
                flags: result.flags,
                createdAt: date.toISOString() // Simulation Mode
            });
            // Go back to home
            router.replace('/(tabs)');
        } catch (e: any) {
            console.error("Save Error:", e);
            Alert.alert("Error", `Failed to save: ${e.message}`);
        }
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS
        setDate(currentDate);
    };

    if (isLoading) {
        return (
            <View style={[styles.container, isDark && styles.darkContainer, styles.center]}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={[styles.loadingText, isDark && styles.darkText]}>Analyzing Meal Pattern...</Text>
            </View>
        );
    }

    if (error || !result) {
        const isQuota = error?.includes('daily limit');

        return (
            <View style={[styles.container, isDark && styles.darkContainer, styles.center, { padding: 32 }]}>
                <Ionicons
                    name={isQuota ? "hourglass-outline" : "alert-circle-outline"}
                    size={64}
                    color={isQuota ? "#FFC107" : "#ff4444"}
                    style={{ marginBottom: 16 }}
                />

                <Text style={[styles.errorTitle, isDark && styles.darkText]}>
                    {isQuota ? "Daily Limit Reached" : "Analysis Failed"}
                </Text>

                <Text style={[styles.errorText, isDark && styles.darkText]}>
                    {error || "Unknown Error"}
                </Text>

                {/* Retry Button (only if not quota or duplicate error) */}
                {!isQuota && !error?.includes('duplicate') && (
                    <TouchableOpacity
                        style={[styles.primaryButton, { width: '100%', marginTop: 20, flex: 0 }]}
                        onPress={() => {
                            setRetryCount(retryCount + 1);
                            performAnalysis();
                        }}
                    >
                        <Ionicons name="refresh" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.primaryButtonText}>
                            Retry {retryCount > 0 ? `(Attempt ${retryCount + 1})` : ''}
                        </Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={[styles.secondaryButton, { width: '100%', marginTop: 12, flex: 0 }]} onPress={() => router.back()}>
                    <Text style={styles.secondaryButtonText}>Take New Photo</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, isDark && styles.darkContainer]} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Image Card Style */}
            <View style={styles.imageCard}>
                <Image source={{ uri: imageUri as string }} style={styles.image} />
            </View>

            <View style={styles.content}>
                <Text style={styles.caption}>This looks like a <Text style={{ fontWeight: 'bold' }}>{result.energyBand.replace('_', ' ')} plate.</Text></Text>

                {/* Main Result Card */}
                <View style={styles.resultCard}>
                    <View style={styles.resultRow}>
                        <Text style={styles.label}>Estimated as:</Text>
                        <Text style={styles.value}>{ENERGY_BAND_LABELS[result.energyBand]}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.resultRow}>
                        <Text style={styles.label}>Confidence:</Text>
                        <View style={[styles.badge, styles[`conf_${result.confidence}`]]}>
                            <Text style={styles.badgeText}>{result.confidence}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />
                    <View style={styles.insightBlock}>
                        <Ionicons name="analytics-outline" size={16} color="#007AFF" style={{ marginTop: 2 }} />
                        <Text style={styles.reasoning}>{result.reasoning}</Text>
                    </View>
                </View>

                {/* Date Simulation */}
                <View style={styles.dateSection}>
                    <Text style={styles.dateLabel}>Date: {date.toLocaleDateString()}</Text>
                    {showDatePicker && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={date}
                            mode="date"
                            display="spinner"
                            onChange={handleDateChange}
                            maximumDate={new Date()} // Can't eat in the future
                        />
                    )}

                    {!showDatePicker && Platform.OS === 'android' && (
                        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                            <Text style={{ color: '#007AFF' }}>Change Date</Text>
                        </TouchableOpacity>
                    )}
                </View>


                {/* Buttons */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => setShowDatePicker(!showDatePicker)}
                    >
                        <Text style={styles.secondaryButtonText}>
                            {showDatePicker ? "Done" : "Adjust Date"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
                        <Text style={styles.primaryButtonText}>Add to Insights</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    darkContainer: { backgroundColor: '#000' },
    center: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 16, fontSize: 16, fontWeight: '500', color: '#666' },
    errorTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 8 },
    errorText: { marginTop: 8, fontSize: 16, color: '#ff4444', marginBottom: 20, textAlign: 'center', lineHeight: 22 },
    darkText: { color: '#fff' },

    imageCard: {
        margin: 16,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        backgroundColor: '#fff',
    },
    image: { width: '100%', height: 320, resizeMode: 'cover' },

    content: { paddingHorizontal: 24 },
    caption: { fontSize: 18, color: '#444', textAlign: 'center', marginBottom: 24, fontStyle: 'italic' },

    resultCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    label: { fontSize: 16, color: '#666' },
    value: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },

    insightBlock: {
        flexDirection: 'row',
        gap: 8,
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    reasoning: { flex: 1, fontSize: 14, color: '#555', lineHeight: 20 },

    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
    conf_high: { backgroundColor: '#4CAF50' },
    conf_medium: { backgroundColor: '#FFC107' },
    conf_low: { backgroundColor: '#FF5252' },

    dateSection: { alignItems: 'center', marginBottom: 24 },
    dateLabel: { fontSize: 14, color: '#888', marginBottom: 8 },

    buttonRow: { flexDirection: 'row', gap: 16 },
    primaryButton: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    secondaryButton: {
        flex: 1,
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        // Uniform shadow for consistency
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    secondaryButtonText: { color: '#333', fontSize: 16, fontWeight: '600' },
});
