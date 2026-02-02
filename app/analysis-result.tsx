import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useMeals } from '@/context/MealContext';
import { useState, useEffect } from 'react';
import { GlowInput } from '@/components/GlowInput';
import * as Haptics from 'expo-haptics';

export default function AnalysisResultScreen() {
    const router = useRouter();
    const { imageUri } = useLocalSearchParams();
    const { addMeal, remainingScans, decrementScanQuota } = useMeals();

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form Data
    const [foodName, setFoodName] = useState("");
    const [calories, setCalories] = useState("0");
    const [protein, setProtein] = useState("0");
    const [carbs, setCarbs] = useState("0");
    const [fats, setFats] = useState("0");
    const [description, setDescription] = useState("Analyzing your meal...");
    const [insight, setInsight] = useState("");

    useEffect(() => {
        if (!imageUri) return;

        const analyze = async () => {
            // 1. Check Limits
            if (remainingScans <= 0) {
                setIsLoading(false);
                setError("You have reached your daily limit of 5 scans.");
                setDescription("Please come back tomorrow or upgrade to Pro.");
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                // Dynamically import to avoid circular dependency issues if any
                const { analyzeFoodImage } = await import('@/services/FoodAnalysisService');
                const data = await analyzeFoodImage(imageUri as string);

                // 2. Decrement Quota & Haptic Success
                decrementScanQuota();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                setFoodName(data.foodName);
                setDescription(data.description);
                setCalories(data.calories.toString());
                setProtein(data.protein.toString());
                setCarbs(data.carbs.toString());
                setFats(data.fats.toString());
                setInsight(data.insight);
            } catch (err) {
                console.error(err);
                setError("Could not analyze image. Please try again.");
                setDescription("Analysis failed. Please check your connection.");
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            } finally {
                setIsLoading(false);
            }
        };

        analyze();
    }, [imageUri]);

    const validateNumber = (text: string, setter: (val: string) => void) => {
        if (/^\d*$/.test(text)) setter(text);
    };

    const handleConfirm = () => {
        addMeal({
            name: foodName || "Unknown Meal",
            calories: parseInt(calories) || 0,
            protein: parseInt(protein) || 0,
            carbs: parseInt(carbs) || 0,
            fats: parseInt(fats) || 0,
            imageUri: imageUri as string,
        });
        router.dismissTo('/(tabs)');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Image Preview */}
                <View style={styles.imageContainer}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri as string }} style={styles.image} />
                    ) : (
                        <View style={[styles.image, { backgroundColor: '#333' }]} />
                    )}
                    <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                        <Ionicons name="close-circle" size={32} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>
                </View>

                {/* Loading State Overlay */}
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <Text style={styles.loadingText}>Analyzing meal...</Text>
                        <Text style={styles.loadingSub}>Consulting the nutrition brain...</Text>
                    </View>
                )}

                {/* Content Card */}
                {!isLoading && (
                    <View style={styles.card}>
                        {/* Header Section */}
                        {isEditing ? (
                            <View style={styles.headerColumnEditing}>
                                <Text style={styles.labelSmall}>Food Name</Text>
                                <GlowInput
                                    style={[styles.foodNameInput, { fontSize: 20, marginBottom: 10, width: '100%' }]}
                                    value={foodName}
                                    onChangeText={setFoodName}
                                    autoFocus
                                    glowColor={Colors.dark.tint}
                                    multiline={true}
                                />

                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={styles.labelSmall}>Calories</Text>
                                    <View style={styles.caloriesBadge}>
                                        <GlowInput
                                            style={[styles.caloriesText, { fontSize: 18, width: 80, textAlign: 'center' }]}
                                            value={calories}
                                            onChangeText={(text) => validateNumber(text, setCalories)}
                                            keyboardType="numeric"
                                            glowColor="#fff"
                                        />
                                        <Text style={styles.caloriesLabel}>kcal</Text>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.headerRow}>
                                <Text style={styles.foodName}>{foodName}</Text>
                                <View style={styles.caloriesBadge}>
                                    <Text style={styles.caloriesText}>{calories}</Text>
                                    <Text style={styles.caloriesLabel}>kcal</Text>
                                </View>
                            </View>
                        )}

                        {/* AI Insight Section */}
                        {insight ? (
                            <View style={styles.insightContainer}>
                                <Ionicons name="sparkles" size={16} color={Colors.dark.surplus} style={{ marginTop: 3 }} />
                                <Text style={styles.insightText}>{insight}</Text>
                            </View>
                        ) : null}

                        <Text style={styles.description}>{description}</Text>

                        <View style={styles.divider} />

                        {/* Macros */}
                        <View style={styles.macrosContainer}>
                            <MacroItem
                                label="Protein"
                                value={protein}
                                onChange={(text) => validateNumber(text, setProtein)}
                                isEditing={isEditing}
                                color={Colors.dark.primary}
                            />
                            <MacroItem
                                label="Carbs"
                                value={carbs}
                                onChange={(text) => validateNumber(text, setCarbs)}
                                isEditing={isEditing}
                                color={Colors.dark.success}
                            />
                            <MacroItem
                                label="Fats"
                                value={fats}
                                onChange={(text) => validateNumber(text, setFats)}
                                isEditing={isEditing}
                                color={Colors.dark.accent}
                            />
                        </View>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(!isEditing)}>
                            <Text style={styles.editText}>{isEditing ? "Done" : "Edit Details"}</Text>
                        </TouchableOpacity>

                        {/* Spacer for keyboard */}
                        <View style={{ height: 250 }} />

                    </View>
                )}
            </ScrollView>

            {/* Bottom Action Bar */}
            {!isEditing && (
                <View style={styles.actionBar}>
                    <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => router.back()}>
                        <Ionicons name="close" size={24} color="#fff" />
                        <Text style={styles.actionButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, styles.logButton]} onPress={handleConfirm}>
                        <Text style={styles.actionButtonText}>Log Meal</Text>
                        <Ionicons name="checkmark" size={24} color="#fff" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}

function MacroItem({ label, value, color, isEditing, onChange }: {
    label: string,
    value: string,
    color: string,
    isEditing: boolean,
    onChange: (val: string) => void
}) {
    return (
        <View style={styles.macroItem}>
            {isEditing ? (
                <GlowInput
                    style={[styles.macroValue, { color }]}
                    value={value}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    glowColor={color}
                />
            ) : (
                <Text style={[styles.macroValue, { color }]}>{value}g</Text>
            )}
            <Text style={styles.macroLabel}>{label}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    imageContainer: {
        height: 300,
        width: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
    },
    card: {
        backgroundColor: Colors.dark.cardBackground,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -24,
        padding: 24,
        minHeight: 500,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    headerColumnEditing: {
        flexDirection: 'column',
        marginBottom: 24,
    },
    labelSmall: {
        fontSize: 12,
        color: '#aaa',
        textTransform: 'uppercase',
        marginBottom: 4,
        fontWeight: '600',
    },
    foodName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.dark.text,
        flex: 1,
        marginRight: 10,
    },
    foodNameInput: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.dark.text,
        flex: 1,
        marginRight: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.gray,
    },
    caloriesBadge: {
        alignItems: 'center',
        backgroundColor: Colors.dark.gray,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    caloriesText: {
        fontSize: 20,
        fontWeight: '900',
        color: '#fff',
    },
    caloriesLabel: {
        fontSize: 12,
        color: '#aaa',
        textTransform: 'uppercase',
    },
    description: {
        fontSize: 16,
        color: '#ccc',
        lineHeight: 24,
        marginBottom: 24,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.dark.gray,
        marginVertical: 20,
    },
    macrosContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    macroItem: {
        alignItems: 'center',
    },
    macroValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    macroLabel: {
        fontSize: 14,
        color: '#888',
    },
    editButton: {
        alignSelf: 'center',
        padding: 10,
    },
    editText: {
        color: Colors.dark.tint,
        fontSize: 16,
        fontWeight: '600',
    },
    actionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 40,
        backgroundColor: Colors.dark.cardBackground,
        borderTopWidth: 1,
        borderTopColor: Colors.dark.gray,
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        borderRadius: 16,
        paddingVertical: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: Colors.dark.danger,
    },
    logButton: {
        backgroundColor: Colors.dark.primary, // Green
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    loadingOverlay: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
    },
    loadingText: {
        color: Colors.dark.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
    },
    loadingSub: {
        color: Colors.dark.tabIconDefault,
        marginTop: 10,
    },
    insightContainer: {
        backgroundColor: 'rgba(255, 140, 0, 0.15)', // Low opacity amber/surplus
        padding: 12,
        borderRadius: 12,
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 140, 0, 0.3)',
    },
    insightText: {
        color: Colors.dark.text,
        fontSize: 14,
        lineHeight: 20,
        flex: 1,
        fontStyle: 'italic',
    },
});
